import sys, re, json, time
from playwright.sync_api import sync_playwright

URL = "https://img.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"desktop": {}, "mobile": {}, "html": {}, "ai": {}}

def grab_console(page, sink):
    page.on("console", lambda m: sink.append(f"{m.type}:{m.text}") if m.type in ("error","warning") else None)
    page.on("pageerror", lambda e: sink.append(f"pageerror:{e}"))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # Desktop
    ctx = browser.new_context(viewport={"width":1440,"height":900})
    page = ctx.new_page()
    dconsole=[]; grab_console(page, dconsole)
    resp = page.goto(URL, wait_until="networkidle", timeout=45000)
    out["desktop"]["status"] = resp.status if resp else None
    time.sleep(2)
    page.screenshot(path="img-desktop.png", full_page=True)
    out["desktop"]["console"] = dconsole
    out["desktop"]["title"] = page.title()
    html = page.content()
    out["html"]["title"] = page.title()
    # SEO from raw source
    import urllib.request
    try:
        req = urllib.request.Request(URL, headers={"User-Agent":"Mozilla/5.0"})
        raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8","ignore")
    except Exception as e:
        raw = html
        out["html"]["rawfetch_err"] = str(e)
    def find(pat):
        m = re.search(pat, raw, re.I|re.S); return m.group(0)[:300] if m else None
    out["html"]["title_tag"] = find(r"<title[^>]*>.*?</title>")
    out["html"]["meta_desc"] = find(r'<meta[^>]+name=["\']description["\'][^>]*>')
    out["html"]["og"] = re.findall(r'<meta[^>]+property=["\']og:[^"\']+["\'][^>]*>', raw, re.I)[:8]
    out["html"]["jsonld"] = bool(re.search(r'application/ld\+json', raw, re.I))
    out["html"]["signin_count"] = len(re.findall(r'sign[\s\-]?in', raw, re.I))
    out["html"]["clerk"] = bool(re.search(r'clerk', raw, re.I))

    # AI feature discovery + exercise
    ai_notes=[]
    try:
        # find textarea/prompt input
        candidates = page.query_selector_all("textarea, input[type=text], [contenteditable=true]")
        ai_notes.append(f"input_candidates={len(candidates)}")
        # find generate/send buttons
        btns = page.query_selector_all("button")
        btn_txts = [ (b.inner_text() or "").strip().lower() for b in btns ]
        ai_notes.append("btns="+json.dumps([t for t in btn_txts if t][:15]))
        out["ai"]["notes_pre"]=ai_notes
    except Exception as e:
        out["ai"]["discover_err"]=str(e)

    ctx.close()

    # Mobile
    mctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mpage = mctx.new_page()
    mconsole=[]; grab_console(mpage, mconsole)
    mresp = mpage.goto(URL, wait_until="networkidle", timeout=45000)
    out["mobile"]["status"] = mresp.status if mresp else None
    time.sleep(2)
    mpage.screenshot(path="img-mobile.png", full_page=True)
    out["mobile"]["console"] = mconsole
    # horizontal scroll check
    sw = mpage.evaluate("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})")
    out["mobile"]["scroll"] = sw
    out["mobile"]["hscroll"] = sw["sw"] > sw["cw"]+2
    mctx.close()
    browser.close()

print(json.dumps(out, indent=2, ensure_ascii=False))
