import re, json
from playwright.sync_api import sync_playwright

URL = "https://lore.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console": [], "desktop": {}, "mobile": {}, "seo": {}, "signin": {}, "core": {}}

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=ARGS)

    # Desktop
    ctx = b.new_context(viewport={"width":1440,"height":900})
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
    resp = pg.goto(URL, wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(2500)
    out["desktop"]["status"] = resp.status
    out["desktop"]["title"] = pg.title()
    # horizontal scroll check
    hscroll = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    out["desktop"]["hscroll"] = hscroll
    pg.screenshot(path="lore-desktop.png", full_page=True)
    html = pg.content()

    # SEO from rendered + raw source
    raw = resp.text() if False else html
    def grab(pat):
        m = re.search(pat, html, re.I|re.S); return m.group(1).strip() if m else None
    out["seo"]["title"] = grab(r"<title>(.*?)</title>")
    out["seo"]["desc"] = grab(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']')
    out["seo"]["og_title"] = grab(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']')
    out["seo"]["og_desc"] = grab(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']')
    out["seo"]["og_image"] = grab(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']')
    out["seo"]["jsonld"] = bool(re.search(r'application/ld\+json', html, re.I))
    ld = re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.I|re.S)
    out["seo"]["jsonld_count"] = len(ld)

    # Sign-in state: count "sign in" text occurrences + clerk presence
    body_txt = pg.inner_text("body").lower()
    out["signin"]["signin_text_count"] = body_txt.count("sign in") + body_txt.count("signin") + body_txt.count("log in")
    out["signin"]["clerk_present"] = bool(re.search(r'clerk', html, re.I))
    # visible buttons/links with sign in text
    signin_els = pg.query_selector_all("a, button")
    si = [e.inner_text().strip() for e in signin_els if e.is_visible() and re.search(r'sign\s*in|log\s*in', e.inner_text(), re.I)]
    out["signin"]["visible_signin_controls"] = si

    # Core tool: find interactive elements - links/nav
    links = pg.query_selector_all("a[href]")
    out["core"]["link_count"] = len(links)
    # count headings for hierarchy
    out["desktop"]["h1_count"] = len(pg.query_selector_all("h1"))
    out["desktop"]["h2_count"] = len(pg.query_selector_all("h2"))

    ctx.close()

    # Mobile
    mctx = b.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mpg = mctx.new_page()
    merrs = []
    mpg.on("console", lambda m: merrs.append(f"{m.type}: {m.text}") if m.type=="error" else None)
    mresp = mpg.goto(URL, wait_until="networkidle", timeout=60000)
    mpg.wait_for_timeout(2000)
    out["mobile"]["status"] = mresp.status
    out["mobile"]["hscroll"] = mpg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    out["mobile"]["scrollWidth"] = mpg.evaluate("document.documentElement.scrollWidth")
    mpg.screenshot(path="lore-mobile.png", full_page=True)
    mctx.close()

    out["console"] = errs
    out["console_mobile"] = merrs
    b.close()

print(json.dumps(out, indent=2, default=str)[:6000])
