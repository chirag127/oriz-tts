import re, json, sys, time
from playwright.sync_api import sync_playwright

URL = "https://hash.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console_errors": [], "http_status": None}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # Desktop
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: errs.append("pageerror: "+str(e)))
    resp = page.goto(URL, wait_until="networkidle", timeout=45000)
    out["http_status"] = resp.status
    time.sleep(2)
    page.screenshot(path="hash-desktop.png", full_page=True)

    html = page.content()
    out["title"] = (re.search(r"<title[^>]*>(.*?)</title>", html, re.S|re.I) or [None,None])[1]
    out["has_meta_desc"] = bool(re.search(r'<meta[^>]+name=["\']description["\']', html, re.I))
    out["has_og"] = bool(re.search(r'<meta[^>]+property=["\']og:', html, re.I))
    out["has_jsonld"] = bool(re.search(r'application/ld\+json', html, re.I))

    # horizontal scroll desktop
    out["desktop_hscroll"] = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")

    # Sign-in controls
    signin_matches = page.evaluate("""() => {
      const els = [...document.querySelectorAll('a,button')].filter(e => /sign\\s*in|log\\s*in/i.test(e.textContent||''));
      return els.map(e => (e.textContent||'').trim().slice(0,40));
    }""")
    out["signin_controls"] = signin_matches
    out["has_clerk"] = bool(re.search(r'clerk', html, re.I))

    # AI feature detection - look for textarea/input + generate button
    ai_probe = page.evaluate("""() => {
      const ta = document.querySelector('textarea, input[type=text], [contenteditable=true]');
      const btns = [...document.querySelectorAll('button')].map(b=>(b.textContent||'').trim());
      return {has_input: !!ta, buttons: btns.slice(0,30)};
    }""")
    out["ai_probe"] = ai_probe

    # Try to exercise AI
    ai_result = {"attempted": False, "response_seen": False, "error_text": None}
    try:
        # find an input
        inp = None
        for sel in ["textarea", "input[type=text]", "[contenteditable=true]", "input:not([type=hidden])"]:
            loc = page.locator(sel).first
            if loc.count() > 0 and loc.is_visible():
                inp = loc
                break
        if inp:
            ai_result["attempted"] = True
            inp.click()
            inp.fill("Write a short haiku about the ocean")
            time.sleep(0.3)
            # find generate/send button
            btn = None
            for name in ["generate","send","submit","hash","ask","run","go","create","try"]:
                b = page.get_by_role("button", name=re.compile(name, re.I)).first
                if b.count() > 0 and b.is_visible():
                    btn = b
                    break
            if not btn:
                # try any visible button near
                b = page.locator("button:visible").first
                if b.count()>0:
                    btn = b
            if btn:
                before = page.inner_text("body")
                btn.click()
                # wait for streaming response
                deadline = time.time() + 30
                grew = False
                errtxt = None
                while time.time() < deadline:
                    time.sleep(1.5)
                    body = page.inner_text("body")
                    low = body.lower()
                    if "providers busy" in low or "failed to resolve module" in low or "all providers" in low or "error" in low and "haiku" not in low:
                        errtxt = next((ln for ln in body.split("\n") if any(k in ln.lower() for k in ["provider","failed to resolve","error"])), None)
                    if len(body) > len(before) + 80:
                        grew = True
                        break
                ai_result["response_seen"] = grew
                ai_result["error_text"] = errtxt
                ai_result["body_delta"] = len(page.inner_text("body")) - len(before)
        else:
            ai_result["note"] = "no visible input found"
    except Exception as e:
        ai_result["exception"] = str(e)
    page.screenshot(path="hash-desktop-ai.png", full_page=True)
    out["ai_result"] = ai_result
    out["console_errors"] = errs
    ctx.close()

    # Mobile
    mctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mpage = mctx.new_page()
    mpage.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    mpage.screenshot(path="hash-mobile.png", full_page=True)
    out["mobile_hscroll"] = mpage.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
    mctx.close()
    browser.close()

print(json.dumps(out, indent=2, default=str))
