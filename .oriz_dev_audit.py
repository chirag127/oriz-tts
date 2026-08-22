import re, json, sys, time
from playwright.sync_api import sync_playwright

URL = "https://dev.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {}

def run(pw, name, w, h):
    r = {"console_errors":[], "page_errors":[]}
    b = pw.chromium.launch(headless=True, args=ARGS)
    ctx = b.new_context(viewport={"width":w,"height":h})
    p = ctx.new_page()
    p.on("console", lambda m: r["console_errors"].append(m.text) if m.type=="error" else None)
    p.on("pageerror", lambda e: r["page_errors"].append(str(e)))
    resp = p.goto(URL, wait_until="networkidle", timeout=45000)
    r["status"] = resp.status if resp else None
    time.sleep(2)
    r["title"] = p.title()
    html = p.content()
    # horizontal scroll
    r["scroll_w"] = p.evaluate("document.documentElement.scrollWidth")
    r["client_w"] = p.evaluate("document.documentElement.clientWidth")
    r["h_scroll"] = r["scroll_w"] > r["client_w"] + 2
    # SEO from initial source (fetch raw)
    if name=="desktop":
        raw = p.evaluate("() => document.documentElement.outerHTML")
        out["seo"] = {
            "title": bool(re.search(r"<title>.*?</title>", raw, re.I|re.S)),
            "title_text": (re.search(r"<title>(.*?)</title>", raw, re.I|re.S) or [None,None])[1],
            "meta_desc": bool(re.search(r'<meta[^>]+name=["\']description["\']', raw, re.I)),
            "og": bool(re.search(r'<meta[^>]+property=["\']og:', raw, re.I)),
            "jsonld": bool(re.search(r'application/ld\+json', raw, re.I)),
        }
    # signin controls
    signin = p.evaluate("""() => {
        const els = [...document.querySelectorAll('a,button')].filter(e=>/sign\\s*in|log\\s*in|sign\\s*up/i.test(e.textContent||''));
        return els.map(e=>({tag:e.tagName, txt:(e.textContent||'').trim().slice(0,30), cls:(e.className||'').toString().slice(0,60)}));
    }""")
    r["signin_ctrls"] = signin
    # clerk presence
    r["clerk"] = p.evaluate("() => !!(window.Clerk) || !!document.querySelector('[class*=cl-],[data-clerk]')")
    p.screenshot(path=f".oriz_dev_{name}.png", full_page=(name=="mobile"))
    # AI feature detection
    ai = p.evaluate("""() => {
        const ta = [...document.querySelectorAll('textarea,input[type=text],[contenteditable=true]')];
        const btns = [...document.querySelectorAll('button')].map(b=>(b.textContent||'').trim());
        return {textareas: ta.length, buttons: btns.filter(Boolean).slice(0,40),
                placeholders: ta.map(t=>t.getAttribute('placeholder')||t.getAttribute('aria-label')||'')};
    }""")
    r["ai_detect"] = ai
    r["page"] = p  # keep for AI exercise on desktop
    out[name] = {k:v for k,v in r.items() if k!="page"}
    return b, ctx, p, r

with sync_playwright() as pw:
    # desktop
    b,ctx,p,r = run(pw,"desktop",1440,900)
    # exercise AI on desktop
    ai_result = {"tried": False, "responded": False, "detail": ""}
    try:
        # find a prompt input
        target = None
        for sel in ["textarea", "[contenteditable=true]", "input[type=text]"]:
            loc = p.locator(sel)
            if loc.count() > 0 and loc.first.is_visible():
                target = loc.first; break
        if target:
            ai_result["tried"] = True
            before = p.evaluate("() => document.body.innerText.length")
            target.click()
            target.fill("What is 2+2? Reply in one short sentence.")
            # try submit: Enter, then look for a generate/send button
            submitted = False
            try:
                target.press("Enter"); submitted = True
            except: pass
            # also try clicking a send/generate button
            for name in ["Generate","Send","Ask","Submit","Go","Chat","Run"]:
                bt = p.get_by_role("button", name=re.compile(name, re.I))
                if bt.count()>0 and bt.first.is_visible():
                    try: bt.first.click(); submitted=True; break
                    except: pass
            # wait up to 30s for text growth / streamed response
            responded=False; detail=""
            t0=time.time()
            while time.time()-t0 < 30:
                time.sleep(2)
                txt = p.evaluate("() => document.body.innerText")
                low = txt.lower()
                if "providers busy" in low or "failed to resolve module" in low or "provider" in low and "busy" in low:
                    detail = "error-text: providers busy / module fail"
                after = len(txt)
                if after > before + 40 and ("4" in txt or len(txt)>before+120):
                    responded=True; detail=txt[before:before+300] if after>before else txt[-300:]
                    break
            ai_result["responded"]=responded
            ai_result["detail"]=detail[:400]
            ai_result["submitted"]=submitted
            p.screenshot(path=".oriz_dev_ai.png", full_page=True)
        else:
            ai_result["detail"]="no visible prompt input found"
    except Exception as e:
        ai_result["detail"]=f"exc: {e}"
    out["ai_exercise"]=ai_result
    b.close()
    # mobile
    b2,ctx2,p2,r2 = run(pw,"mobile",390,844)
    b2.close()

print(json.dumps(out, indent=2, default=str)[:6000])
