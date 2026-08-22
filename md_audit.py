import re, json, sys
from playwright.sync_api import sync_playwright

URL = "https://md.oriz.in"
ARGS = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
out = {"console": [], "pageerrors": []}

def run():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, args=ARGS)
        # DESKTOP
        ctx = b.new_context(viewport={"width":1440,"height":900})
        pg = ctx.new_page()
        pg.on("console", lambda m: out["console"].append(f"{m.type}: {m.text}") if m.type in ("error","warning") else None)
        pg.on("pageerror", lambda e: out["pageerrors"].append(str(e)))
        resp = pg.goto(URL, wait_until="networkidle", timeout=45000)
        out["status"] = resp.status if resp else None
        pg.wait_for_timeout(2500)
        out["title"] = pg.title()
        html = pg.content()
        # SEO from live DOM
        out["seo"] = {
            "title": (re.search(r"<title[^>]*>(.*?)</title>", html, re.S|re.I) or [None,None])[1],
            "meta_desc": bool(re.search(r'<meta[^>]+name=["\']description["\'][^>]*>', html, re.I)),
            "og": bool(re.search(r'<meta[^>]+property=["\']og:', html, re.I)),
            "jsonld": bool(re.search(r'application/ld\+json', html, re.I)),
        }
        # signin/auth controls
        out["signin_texts"] = pg.eval_on_selector_all(
            "button, a", "els => els.map(e=>e.innerText.trim()).filter(t=>/sign\\s*in|log\\s*in|sign\\s*up|account|profile/i.test(t))"
        )
        # horizontal scroll desktop
        out["desktop_hscroll"] = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
        pg.screenshot(path="md-desktop.png", full_page=False)
        pg.screenshot(path="md-desktop-full.png", full_page=True)

        # capture body text sample for clutter/hero assessment
        out["body_sample"] = pg.evaluate("document.body.innerText.slice(0,1200)")

        # AI EXERCISE: find textarea/input + generate/convert button
        out["ai"] = try_ai(pg)

        ctx.close()

        # MOBILE
        mctx = b.new_context(viewport={"width":390,"height":844}, is_mobile=True)
        mpg = mctx.new_page()
        mpg.goto(URL, wait_until="networkidle", timeout=45000)
        mpg.wait_for_timeout(2000)
        out["mobile_hscroll"] = mpg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
        mpg.screenshot(path="md-mobile.png", full_page=False)
        mpg.screenshot(path="md-mobile-full.png", full_page=True)
        mctx.close()
        b.close()

def try_ai(pg):
    r = {"attempted": False, "responded": False, "detail": ""}
    # find an editable input area
    editable = None
    for sel in ["textarea", "[contenteditable='true']", ".cm-content", ".monaco-editor textarea", "input[type='text']"]:
        try:
            el = pg.query_selector(sel)
            if el and el.is_visible():
                editable = el; r["editor_sel"]=sel; break
        except Exception: pass
    # find AI trigger button
    btn_texts = pg.eval_on_selector_all("button, a[role='button'], a",
        "els => els.map((e,i)=>({i, t:e.innerText.trim()})).filter(o=>/ai|generate|magic|assist|complete|write|improve|prompt|✨|summar/i.test(o.t))")
    r["ai_buttons"] = [b["t"] for b in btn_texts][:20]
    if editable:
        try:
            editable.click()
            editable.type("Write one short sentence about the sky.")
            r["typed"]=True
        except Exception as e:
            r["type_err"]=str(e)[:120]
    # click first AI-looking button
    if btn_texts:
        try:
            target = f"text=\"{btn_texts[0]['t']}\""
            pg.click(target, timeout=5000)
            r["attempted"]=True
            r["clicked"]=btn_texts[0]['t']
            # wait for streamed response / error markers
            before = pg.evaluate("document.body.innerText")
            for _ in range(30):
                pg.wait_for_timeout(1000)
                now = pg.evaluate("document.body.innerText")
                low = now.lower()
                if "providers busy" in low or "failed to resolve module" in low or "no provider" in low or "error" in low and "ai" in low:
                    r["detail"]="error marker: "+ (("providers busy" if "providers busy" in low else "failed to resolve module" if "failed to resolve module" in low else "error"))
                    r["responded"]=False
                    return r
                if len(now) > len(before) + 40:
                    r["responded"]=True
                    r["detail"]="text grew by "+str(len(now)-len(before))+" chars"
                    return r
            r["detail"]="no response within 30s"
        except Exception as e:
            r["detail"]="click err: "+str(e)[:150]
    else:
        r["detail"]="no AI-looking trigger found"
    return r

try:
    run()
except Exception as e:
    out["fatal"]=str(e)
print(json.dumps(out, indent=2, default=str)[:6000])
