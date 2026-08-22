import sys, re, json, time
from playwright.sync_api import sync_playwright

URL = "https://case.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
OUT = r"C:\g\ws\.case_audit"
import os
os.makedirs(OUT, exist_ok=True)

report = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # ---- DESKTOP ----
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    console_errors = []
    page.on("console", lambda m: console_errors.append(f"{m.type}: {m.text}") if m.type=="error" else None)
    page.on("pageerror", lambda e: console_errors.append(f"pageerror: {e}"))

    resp = page.goto(URL, wait_until="networkidle", timeout=45000)
    status = resp.status if resp else None
    report["http_status"] = status
    time.sleep(2)
    page.screenshot(path=OUT+r"\desktop.png", full_page=True)

    html = page.content()
    title = page.title()

    # SEO checks from rendered HTML + raw source
    raw = page.evaluate("() => document.documentElement.outerHTML")
    has_title = bool(title and title.strip())
    md = re.search(r'<meta[^>]+name=["\']description["\'][^>]+>', raw, re.I)
    og = re.findall(r'<meta[^>]+property=["\']og:', raw, re.I)
    jsonld = re.findall(r'<script[^>]+type=["\']application/ld\+json["\']', raw, re.I)

    report["title"] = title
    report["meta_description"] = bool(md)
    report["og_count"] = len(og)
    report["jsonld_count"] = len(jsonld)

    # horizontal scroll check desktop
    scroll_w = page.evaluate("() => document.documentElement.scrollWidth")
    client_w = page.evaluate("() => document.documentElement.clientWidth")
    report["desktop_hscroll"] = scroll_w > client_w + 5

    # detect auth controls
    signin_texts = page.evaluate("""() => {
        const els = [...document.querySelectorAll('a,button')];
        return els.filter(e => /sign\\s*in|log\\s*in|sign\\s*up|account/i.test(e.textContent||'')).map(e => (e.textContent||'').trim());
    }""")
    report["signin_controls"] = signin_texts
    report["clerk_present"] = "clerk" in raw.lower() or bool(page.query_selector("[class*=cl-]"))

    report["console_errors_desktop"] = console_errors[:20]

    # save a snippet of body text for clutter/hero assessment
    body_text = page.evaluate("() => document.body.innerText").strip()
    report["body_text_head"] = body_text[:1500]

    # ---- AI feature discovery ----
    # find textareas, inputs, generate buttons
    ai_probe = page.evaluate("""() => {
        const tas = [...document.querySelectorAll('textarea')].map(t => ({ph:t.placeholder, name:t.name, id:t.id}));
        const inputs = [...document.querySelectorAll('input[type=text],input:not([type])')].map(t => ({ph:t.placeholder, name:t.name, id:t.id}));
        const btns = [...document.querySelectorAll('button')].map(b => (b.textContent||'').trim()).filter(Boolean);
        return {textareas: tas, inputs: inputs, buttons: btns};
    }""")
    report["ai_probe"] = ai_probe

    ctx.close()

    # ---- MOBILE ----
    ctx2 = browser.new_context(viewport={"width":390,"height":844})
    page2 = ctx2.new_page()
    page2.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    page2.screenshot(path=OUT+r"\mobile.png", full_page=True)
    m_scroll_w = page2.evaluate("() => document.documentElement.scrollWidth")
    m_client_w = page2.evaluate("() => document.documentElement.clientWidth")
    report["mobile_hscroll"] = m_scroll_w > m_client_w + 5
    report["mobile_scroll_w"] = m_scroll_w
    report["mobile_client_w"] = m_client_w
    ctx2.close()

    browser.close()

sys.stdout.reconfigure(encoding="utf-8")
print(json.dumps(report, indent=2, ensure_ascii=False))
