import re, sys, time, json
from playwright.sync_api import sync_playwright

URL = "https://text.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console_errors": [], "http_status": None, "seo": {}, "signin": {}, "ai": {}}

def grab_seo(html):
    def find(pat):
        m = re.search(pat, html, re.I|re.S)
        return m.group(1).strip() if m else None
    title = find(r"<title[^>]*>(.*?)</title>")
    desc = find(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']')
    og = re.findall(r'<meta[^>]*property=["\']og:[^"\']+["\']', html, re.I)
    jsonld = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I|re.S)
    return {"title": title, "description": desc, "og_count": len(og), "jsonld_count": len(jsonld),
            "jsonld_valid": [bool(_try(j)) for j in jsonld]}

def _try(s):
    try: json.loads(s); return True
    except: return False

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=ARGS)
    for name, vp in [("desktop",{"width":1440,"height":900}),("mobile",{"width":390,"height":844})]:
        ctx = b.new_context(viewport=vp)
        pg = ctx.new_page()
        errs = []
        pg.on("console", lambda m: errs.append(f"{m.type}: {m.text}") if m.type=="error" else None)
        pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
        resp = pg.goto(URL, wait_until="networkidle", timeout=45000)
        if name=="desktop":
            out["http_status"] = resp.status if resp else None
            html = pg.content()
            out["seo"] = grab_seo(html)
            # signin controls
            signin_texts = pg.locator("text=/sign in/i").count()
            out["signin"]["signin_count"] = signin_texts
            out["signin"]["clerk_present"] = "clerk" in html.lower()
        time.sleep(2)
        # horizontal scroll check
        sw = pg.evaluate("document.documentElement.scrollWidth")
        cw = pg.evaluate("document.documentElement.clientWidth")
        out[f"{name}_hscroll"] = sw > cw + 2
        out[f"{name}_scrollWidth"] = sw
        out[f"{name}_clientWidth"] = cw
        pg.screenshot(path=f"C:/g/ws/text-{name}.png", full_page=False)
        out["console_errors"] += [f"[{name}] {e}" for e in errs]
        ctx.close()
    b.close()

print(json.dumps(out, indent=2, ensure_ascii=False))
