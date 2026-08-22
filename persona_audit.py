import re, json, sys, time
from playwright.sync_api import sync_playwright

URL = "https://persona.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"desktop": {}, "mobile": {}, "seo": {}, "ai": {}}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # ---------- DESKTOP ----------
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    console_errors = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: console_errors.append("PAGEERROR: "+str(e)))
    resp = page.goto(URL, wait_until="networkidle", timeout=60000)
    status = resp.status if resp else None
    time.sleep(2)
    page.screenshot(path="persona-desktop.png", full_page=True)
    html = page.content()
    title = page.title()
    # horizontal scroll check
    sw = page.evaluate("document.documentElement.scrollWidth")
    cw = page.evaluate("document.documentElement.clientWidth")
    out["desktop"] = {"status": status, "title": title, "console_errors": console_errors[:], "scrollW": sw, "clientW": cw}

    # SEO from source
    src = html
    out["seo"]["title"] = title
    md = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', src, re.I)
    out["seo"]["description"] = md.group(1) if md else None
    og = re.findall(r'<meta[^>]+property=["\']og:[^"\']+["\']', src, re.I)
    out["seo"]["og_count"] = len(og)
    jsonld = re.findall(r'application/ld\+json', src, re.I)
    out["seo"]["jsonld_count"] = len(jsonld)

    # signin controls
    signin_texts = re.findall(r'Sign in|Sign In|Login|Log in', src)
    out["seo"]["signin_mentions"] = len(signin_texts)
    clerk = "clerk" in src.lower()
    out["seo"]["clerk_present"] = clerk

    # ---------- AI feature exploration ----------
    # find textareas / inputs / generate buttons
    inputs = page.query_selector_all("textarea, input[type=text], input:not([type])")
    buttons = page.query_selector_all("button")
    btn_texts = []
    for b in buttons:
        try:
            t = (b.inner_text() or "").strip()
            if t: btn_texts.append(t)
        except: pass
    out["ai"]["inputs_found"] = len(inputs)
    out["ai"]["buttons"] = btn_texts[:30]

    ctx.close()

    # ---------- MOBILE ----------
    mctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mpage = mctx.new_page()
    m_console = []
    mpage.on("console", lambda m: m_console.append(m.text) if m.type=="error" else None)
    mpage.on("pageerror", lambda e: m_console.append("PAGEERROR: "+str(e)))
    mresp = mpage.goto(URL, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    mpage.screenshot(path="persona-mobile.png", full_page=True)
    msw = mpage.evaluate("document.documentElement.scrollWidth")
    mcw = mpage.evaluate("document.documentElement.clientWidth")
    out["mobile"] = {"status": mresp.status if mresp else None, "console_errors": m_console[:], "scrollW": msw, "clientW": mcw, "hscroll": msw > mcw+2}
    mctx.close()

    browser.close()

print(json.dumps(out, indent=2)[:6000])
