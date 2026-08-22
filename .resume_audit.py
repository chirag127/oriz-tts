import re, json, sys
from playwright.sync_api import sync_playwright

URL = "https://resume.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console": [], "status": None, "html": "", "signin_texts": [], "clerk": False}

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=ARGS)
    # desktop
    ctx = b.new_context(viewport={"width":1440,"height":900})
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append((m.type, m.text)) if m.type in ("error","warning") else None)
    pg.on("pageerror", lambda e: errs.append(("pageerror", str(e))))
    resp = pg.goto(URL, wait_until="networkidle", timeout=60000)
    out["status"] = resp.status if resp else None
    pg.wait_for_timeout(2500)
    out["html"] = pg.content()
    out["console"] = errs
    # horizontal scroll check desktop
    ds = pg.evaluate("({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth})")
    out["desktop_scroll"] = ds
    pg.screenshot(path="C:/g/ws/.resume_desktop.png", full_page=True)
    # signin controls
    try:
        texts = pg.eval_on_selector_all("a,button", "els=>els.map(e=>e.innerText.trim()).filter(t=>/sign\\s*in|sign\\s*up|log\\s*in|account|user/i.test(t))")
        out["signin_texts"] = texts
    except Exception as e:
        out["signin_texts_err"] = str(e)
    out["clerk"] = ("clerk" in out["html"].lower())
    ctx.close()

    # mobile
    ctx2 = b.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    pg2 = ctx2.new_page()
    merrs=[]
    pg2.on("console", lambda m: merrs.append((m.type,m.text)) if m.type=="error" else None)
    pg2.on("pageerror", lambda e: merrs.append(("pageerror",str(e))))
    r2 = pg2.goto(URL, wait_until="networkidle", timeout=60000)
    out["mobile_status"] = r2.status if r2 else None
    pg2.wait_for_timeout(2000)
    ms = pg2.evaluate("({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth})")
    out["mobile_scroll"] = ms
    out["mobile_console"] = merrs
    pg2.screenshot(path="C:/g/ws/.resume_mobile.png", full_page=True)
    ctx2.close()
    b.close()

h = out["html"]
def find(pat):
    m = re.search(pat, h, re.I|re.S)
    return m.group(0)[:300] if m else None
seo = {
  "title": find(r"<title[^>]*>.*?</title>"),
  "meta_desc": find(r'<meta[^>]*name=["\']description["\'][^>]*>'),
  "og": len(re.findall(r'<meta[^>]*property=["\']og:', h, re.I)),
  "jsonld": len(re.findall(r'application/ld\+json', h, re.I)),
  "twitter": len(re.findall(r'name=["\']twitter:', h, re.I)),
  "canonical": find(r'<link[^>]*rel=["\']canonical["\'][^>]*>'),
}
out["seo"] = seo
out["html_len"] = len(h)
del out["html"]
print(json.dumps(out, indent=1, default=str)[:6000])
