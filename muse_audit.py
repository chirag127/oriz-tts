import re, sys, time, json
from playwright.sync_api import sync_playwright

URL = "https://muse.oriz.in"
ARGS = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
OUT = "C:\\g\\ws\\.muse_audit"
import os
os.makedirs(OUT, exist_ok=True)

report = {}

def grep_seo(html):
    seo = {}
    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.I|re.S)
    seo["title"] = t.group(1).strip() if t else None
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', html, re.I|re.S)
    seo["meta_description"] = m.group(1).strip()[:120] if m else None
    seo["og_tags"] = len(re.findall(r'<meta[^>]+property=["\']og:', html, re.I))
    seo["jsonld"] = len(re.findall(r'application/ld\+json', html, re.I))
    return seo

with sync_playwright() as p:
    browser = p.chromium.launch(args=ARGS, headless=True)

    # Desktop
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: console_errors.append("PAGEERROR: "+str(e)))
    resp = page.goto(URL, wait_until="networkidle", timeout=45000)
    report["http_status"] = resp.status if resp else None
    time.sleep(2)
    html = page.content()
    report["seo"] = grep_seo(html)
    page.screenshot(path=OUT+"\\desktop.png", full_page=True)

    # horizontal scroll / clutter check desktop
    dims = page.evaluate("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})")
    report["desktop_hscroll"] = dims["sw"] > dims["cw"] + 5

    # auth controls
    signin_texts = page.evaluate("""() => {
        const els = [...document.querySelectorAll('button,a')];
        return els.filter(e => /sign\\s*in|log\\s*in|sign\\s*up/i.test(e.textContent||'')).map(e=>e.textContent.trim());
    }""")
    report["signin_controls"] = signin_texts

    # find AI input
    ai_probe = page.evaluate("""() => {
        const tas = [...document.querySelectorAll('textarea, input[type=text], [contenteditable=true]')];
        return tas.map(e => ({tag:e.tagName, ph:e.placeholder||'', name:e.name||'', id:e.id||''}));
    }""")
    report["ai_inputs"] = ai_probe

    console_errors_desktop = list(console_errors)

    ctx.close()

    # Mobile
    mctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mp = mctx.new_page()
    mp.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    mp.screenshot(path=OUT+"\\mobile.png", full_page=True)
    mdims = mp.evaluate("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})")
    report["mobile_hscroll"] = mdims["sw"] > mdims["cw"] + 5
    mctx.close()

    report["console_errors"] = console_errors_desktop
    browser.close()

print(json.dumps(report, indent=2, ensure_ascii=False))
