import sys, re, json, time
from playwright.sync_api import sync_playwright

URL = "https://name.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console": [], "status": None, "html_checks": {}, "signin": {}, "ai": {}, "mobile_hscroll": None}

def run(pw):
    b = pw.chromium.launch(headless=True, args=ARGS)
    # DESKTOP
    ctx = b.new_context(viewport={"width":1440,"height":900})
    pg = ctx.new_page()
    errs=[]
    pg.on("console", lambda m: errs.append(f"{m.type}:{m.text}") if m.type in("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror:{e}"))
    resp = pg.goto(URL, wait_until="networkidle", timeout=45000)
    out["status"]=resp.status
    time.sleep(2)
    pg.screenshot(path="name-desktop.png", full_page=True)
    html = pg.content()
    # SEO
    def find(rx):
        m=re.search(rx, html, re.I|re.S); return m.group(1).strip()[:200] if m else None
    out["html_checks"]["title"]=find(r"<title[^>]*>(.*?)</title>")
    out["html_checks"]["meta_desc"]=find(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']')
    out["html_checks"]["og_title"]=find(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']')
    out["html_checks"]["og_desc"]=bool(re.search(r'og:description', html, re.I))
    out["html_checks"]["og_image"]=bool(re.search(r'og:image', html, re.I))
    out["html_checks"]["jsonld"]=bool(re.search(r'application/ld\+json', html, re.I))
    # signin detection
    txt = pg.inner_text("body")
    signin_count = len(re.findall(r'sign\s*in', txt, re.I))
    out["signin"]["signin_text_count"]=signin_count
    out["signin"]["has_clerk"]= bool(re.search(r'clerk', html, re.I))
    out["console"]=errs[:40]
    ctx.close()

    # MOBILE
    ctx2 = b.new_context(viewport={"width":390,"height":844})
    pg2 = ctx2.new_page()
    pg2.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    pg2.screenshot(path="name-mobile.png", full_page=True)
    sw = pg2.evaluate("document.documentElement.scrollWidth")
    out["mobile_hscroll"]= sw>391
    out["mobile_scrollWidth"]=sw
    ctx2.close()
    b.close()

with sync_playwright() as pw:
    run(pw)
print(json.dumps(out, indent=2, ensure_ascii=False))
