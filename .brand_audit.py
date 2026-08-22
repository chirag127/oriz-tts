import sys, re, json, time
from playwright.sync_api import sync_playwright

URL = "https://brand.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]

def run():
    out = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=ARGS)
        # Desktop
        ctx = browser.new_context(viewport={"width":1440,"height":900})
        page = ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type=="error" else None)
        page.on("pageerror", lambda e: console_errors.append("PAGEERROR: "+str(e)))
        resp = page.goto(URL, wait_until="networkidle", timeout=45000)
        out["http_status"] = resp.status if resp else None
        time.sleep(2)
        page.screenshot(path="C:/g/ws/.brand_desktop.png", full_page=True)
        html = page.content()
        # SEO
        title = page.title()
        meta_desc = page.query_selector('meta[name="description"]')
        meta_desc = meta_desc.get_attribute("content") if meta_desc else None
        og = page.query_selector_all('meta[property^="og:"]')
        jsonld = page.query_selector_all('script[type="application/ld+json"]')
        out["seo"] = {
            "title": title,
            "meta_description": meta_desc[:120] if meta_desc else None,
            "og_count": len(og),
            "jsonld_count": len(jsonld),
        }
        # Sign-in controls
        signin_texts = page.eval_on_selector_all("a,button", "els => els.map(e=>e.innerText.trim()).filter(t=>/sign\\s?in|log\\s?in|sign\\s?up|account/i.test(t))")
        out["signin_controls"] = signin_texts
        # horizontal scroll desktop
        out["desktop_hscroll"] = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        # find AI feature
        # gather textareas/inputs and generate-like buttons
        ai_inputs = page.eval_on_selector_all("textarea,input[type=text],input:not([type])", "els=>els.map(e=>({tag:e.tagName,ph:e.placeholder||'',name:e.name||'',id:e.id||''}))")
        ai_buttons = page.eval_on_selector_all("button", "els=>els.map(e=>e.innerText.trim()).filter(Boolean)")
        out["ai_inputs"] = ai_inputs
        out["buttons"] = ai_buttons[:40]
        out["console_errors_load"] = console_errors[:20]
        out["desktop_body_snippet"] = re.sub(r"\s+"," ", page.inner_text("body"))[:1500]
        ctx.close()

        # Mobile
        mctx = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
        mpage = mctx.new_page()
        merr = []
        mpage.on("console", lambda m: merr.append(m.text) if m.type=="error" else None)
        mpage.goto(URL, wait_until="networkidle", timeout=45000)
        time.sleep(2)
        mpage.screenshot(path="C:/g/ws/.brand_mobile.png", full_page=True)
        out["mobile_hscroll"] = mpage.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        out["mobile_scrollwidth"] = mpage.evaluate("document.documentElement.scrollWidth")
        mctx.close()
        browser.close()
    print(json.dumps(out, indent=2, ensure_ascii=False))

run()
