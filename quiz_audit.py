import re, sys, json
from playwright.sync_api import sync_playwright

URL = "https://quiz.oriz.in"
ARGS = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
res = {"console_errors": [], "http_status": None, "seo": {}, "defects": []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # DESKTOP
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: errs.append(f"PAGEERROR: {e}"))
    resp = page.goto(URL, wait_until="networkidle", timeout=60000)
    res["http_status"] = resp.status
    page.wait_for_timeout(2500)
    page.screenshot(path="C:/g/ws/quiz-desktop.png", full_page=True)

    html = page.content()
    # SEO checks
    def grep(pat):
        m = re.search(pat, html, re.I|re.S)
        return m.group(0)[:200] if m else None
    res["seo"]["title"] = page.title()
    res["seo"]["meta_desc"] = bool(re.search(r'<meta[^>]+name=["\']description["\'][^>]*>', html, re.I))
    res["seo"]["og"] = bool(re.search(r'<meta[^>]+property=["\']og:', html, re.I))
    res["seo"]["jsonld"] = bool(re.search(r'application/ld\+json', html, re.I))

    # horizontal scroll desktop
    res["desktop_hscroll"] = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")

    # sign-in controls
    signin_texts = page.evaluate("""() => {
        const els=[...document.querySelectorAll('button,a')];
        return els.map(e=>(e.innerText||'').trim()).filter(t=>/sign\\s*in|log\\s*in|account/i.test(t));
    }""")
    res["signin_controls"] = signin_texts

    # body text length / hero presence
    res["h1"] = page.evaluate("() => { const h=document.querySelector('h1'); return h?h.innerText.trim():null; }")

    res["console_errors"] = list(errs)
    ctx.close()

    # MOBILE
    ctx2 = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mp = ctx2.new_page()
    merrs=[]
    mp.on("console", lambda m: merrs.append(m.text) if m.type=="error" else None)
    mp.goto(URL, wait_until="networkidle", timeout=60000)
    mp.wait_for_timeout(2000)
    mp.screenshot(path="C:/g/ws/quiz-mobile.png", full_page=True)
    res["mobile_hscroll"] = mp.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
    ctx2.close()

    browser.close()

print(json.dumps(res, indent=2, ensure_ascii=False))
