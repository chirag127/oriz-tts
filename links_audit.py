import re, json
from playwright.sync_api import sync_playwright

URL = "https://links.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # Desktop
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    console_errs = []
    page.on("console", lambda m: console_errs.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: console_errs.append(str(e)))
    resp = page.goto(URL, wait_until="networkidle", timeout=60000)
    out["http_status"] = resp.status
    page.wait_for_timeout(2000)
    page.screenshot(path="links-desktop.png", full_page=True)

    html = page.content()
    title = page.title()
    # horizontal scroll check desktop
    dsw = page.evaluate("document.documentElement.scrollWidth")
    diw = page.evaluate("window.innerWidth")

    # SEO grep
    meta_desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]*>', html, re.I)
    og = re.findall(r'<meta[^>]+property=["\']og:[^"\']+["\']', html, re.I)
    jsonld = re.findall(r'<script[^>]+type=["\']application/ld\+json["\']', html, re.I)

    # auth controls
    signin_matches = re.findall(r'sign[\s\-]?in', html, re.I)
    clerk = re.findall(r'clerk', html, re.I)

    # links / core action - count anchors
    anchors = page.eval_on_selector_all("a[href]", "els => els.map(e=>({t:e.innerText.trim(), h:e.href})).filter(x=>x.t)")

    out["title"] = title
    out["meta_desc"] = bool(meta_desc)
    out["og_count"] = len(og)
    out["jsonld_count"] = len(jsonld)
    out["desktop_scrollw"] = dsw
    out["desktop_innerw"] = diw
    out["signin_count"] = len(signin_matches)
    out["clerk_present"] = len(clerk) > 0
    out["anchor_count"] = len(anchors)
    out["anchors_sample"] = anchors[:15]
    out["console_errs_desktop"] = console_errs[:20]

    ctx.close()

    # Mobile
    ctx2 = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    page2 = ctx2.new_page()
    cerr2=[]
    page2.on("console", lambda m: cerr2.append(m.text) if m.type=="error" else None)
    page2.on("pageerror", lambda e: cerr2.append(str(e)))
    page2.goto(URL, wait_until="networkidle", timeout=60000)
    page2.wait_for_timeout(2000)
    page2.screenshot(path="links-mobile.png", full_page=True)
    msw = page2.evaluate("document.documentElement.scrollWidth")
    miw = page2.evaluate("window.innerWidth")
    out["mobile_scrollw"] = msw
    out["mobile_innerw"] = miw
    out["mobile_hscroll"] = msw > miw + 2
    out["console_errs_mobile"] = cerr2[:20]

    # Try a core action: click first external link in new tab? Just verify a link is clickable (read-only navigate then back)
    try:
        first_link = page2.query_selector("a[href^='http']")
        out["first_ext_link"] = first_link.get_attribute("href") if first_link else None
    except Exception as e:
        out["first_ext_link_err"] = str(e)

    ctx2.close()
    browser.close()

print(json.dumps(out, indent=2, ensure_ascii=False))
