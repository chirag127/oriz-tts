import re, sys, json, time
from playwright.sync_api import sync_playwright

URL = "https://json.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"site":"oriz-json","url":URL}

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=ARGS)

    # Desktop
    ctx = b.new_context(viewport={"width":1440,"height":900})
    pg = ctx.new_page()
    console = []
    pg.on("console", lambda m: console.append((m.type, m.text)))
    pg.on("pageerror", lambda e: console.append(("pageerror", str(e))))
    resp = pg.goto(URL, wait_until="networkidle", timeout=45000)
    out["http_status"] = resp.status if resp else None
    time.sleep(2)
    html = pg.content()
    pg.screenshot(path=".json_audit_desktop.png", full_page=True)

    # SEO from raw source
    import urllib.request
    try:
        req = urllib.request.Request(URL, headers={"User-Agent":"Mozilla/5.0"})
        src = urllib.request.urlopen(req, timeout=30).read().decode("utf-8","ignore")
    except Exception as e:
        src = html
    def has(pat): return bool(re.search(pat, src, re.I|re.S))
    title = re.search(r"<title>(.*?)</title>", src, re.I|re.S)
    out["seo"] = {
        "title": title.group(1).strip() if title else None,
        "meta_description": has(r'<meta[^>]+name=["\']description["\']'),
        "og": has(r'<meta[^>]+property=["\']og:'),
        "jsonld": has(r'application/ld\+json'),
    }
    out["seo_ok"] = bool(title and out["seo"]["meta_description"] and out["seo"]["og"] and out["seo"]["jsonld"])

    # horizontal scroll desktop
    out["desktop_hscroll"] = pg.evaluate("() => document.documentElement.scrollWidth > window.innerWidth + 2")

    # sign-in controls
    signin_texts = pg.evaluate("""() => {
      const els = [...document.querySelectorAll('a,button')];
      return els.map(e => (e.innerText||'').trim().toLowerCase()).filter(t => t.includes('sign in') || t.includes('sign-in') || t.includes('login') || t.includes('log in'));
    }""")
    has_clerk = pg.evaluate("() => !!document.querySelector('[class*=cl-],[data-clerk-]') || !!window.Clerk")
    out["signin"] = {"signin_controls": signin_texts, "clerk_present": has_clerk}
    # correct if not duplicated static sign-in alongside clerk
    out["signin_state_correct"] = not (len(signin_texts) > 1 and has_clerk) and (len(signin_texts) <= 1)

    console_errors = [t for (ty,t) in console if ty in ("error","pageerror")]
    out["console_errors"] = console_errors[:20]

    # AI feature test
    ai = {"attempted": False, "responds": False, "detail": ""}
    try:
        # find a textarea/prompt input
        textareas = pg.query_selector_all("textarea")
        inputs = pg.query_selector_all("input[type=text],input:not([type])")
        target = None
        if textareas: target = textareas[0]
        elif inputs: target = inputs[0]
        if target:
            ai["attempted"] = True
            before = pg.inner_text("body")
            target.click()
            target.fill("Generate a JSON object for a user with name, age, and email")
            # find a generate/submit button
            btns = pg.query_selector_all("button")
            clicked = False
            for btn in btns:
                txt = (btn.inner_text() or "").lower()
                if any(k in txt for k in ["generate","send","submit","run","ask","go","create"]):
                    btn.click(); clicked=True; break
            if not clicked:
                target.press("Enter")
            # wait for response
            deadline = time.time()+35
            resp_text = ""
            busy = False
            while time.time() < deadline:
                time.sleep(2)
                body = pg.inner_text("body")
                low = body.lower()
                if "providers busy" in low or "failed to resolve module" in low or "all providers" in low:
                    busy = True
                # detect meaningful new content
                if len(body) > len(before) + 40:
                    resp_text = body
                # look for json output growth
            ai["busy_error"] = busy
            new_len = len(pg.inner_text("body"))
            ai["responds"] = (not busy) and (new_len > len(before) + 40)
            ai["detail"] = f"before={len(before)} after={new_len} busy={busy}"
        else:
            ai["detail"] = "no input/textarea found"
    except Exception as e:
        ai["detail"] = f"exc: {e}"
    pg.screenshot(path=".json_audit_desktop_ai.png", full_page=True)
    out["ai"] = ai
    ctx.close()

    # Mobile
    mctx = b.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mpg = mctx.new_page()
    mpg.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    out["mobile_hscroll"] = mpg.evaluate("() => document.documentElement.scrollWidth > window.innerWidth + 2")
    mpg.screenshot(path=".json_audit_mobile.png", full_page=True)
    mctx.close()

    b.close()

print(json.dumps(out, indent=2, ensure_ascii=False))
