import asyncio, json, re
from playwright.async_api import async_playwright

URL = "https://pdf.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
OUT = r"C:\g\ws\.pdf_audit_shots"
import os; os.makedirs(OUT, exist_ok=True)

async def run():
    result = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=ARGS)
        # DESKTOP
        ctx = await browser.new_context(viewport={"width":1440,"height":900})
        page = await ctx.new_page()
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type=="error" else None)
        page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))
        resp = await page.goto(URL, wait_until="networkidle", timeout=60000)
        result["http_status"] = resp.status
        await page.wait_for_timeout(2000)
        title = await page.title()
        html = await page.content()
        await page.screenshot(path=OUT+r"\desktop.png", full_page=True)
        # horizontal scroll check desktop
        d_scroll = await page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        # SEO from raw html
        seo = {}
        m = re.search(r"<title>(.*?)</title>", html, re.S|re.I); seo["title"]=m.group(1).strip() if m else None
        m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', html, re.I); seo["desc"]=m.group(1) if m else None
        seo["og"] = len(re.findall(r'property=["\']og:', html, re.I))
        seo["jsonld"] = len(re.findall(r'application/ld\+json', html, re.I))
        result["seo"]=seo
        result["title_live"]=title
        result["desktop_hscroll"]=d_scroll

        # sign-in / auth controls
        signin_texts = await page.evaluate("""() => {
            const els = [...document.querySelectorAll('a,button')];
            return els.map(e=>e.innerText.trim()).filter(t=>/sign\\s*in|log\\s*in|sign\\s*up|account/i.test(t));
        }""")
        result["signin_controls"]=signin_texts

        # find AI input: textarea or text input + generate/submit button
        inputs = await page.evaluate("""() => {
            const ta = [...document.querySelectorAll('textarea, input[type=text], input:not([type])')];
            return ta.map(e=>({tag:e.tagName, ph:e.placeholder||'', id:e.id||'', name:e.name||''}));
        }""")
        result["inputs"]=inputs
        buttons = await page.evaluate("""() => [...document.querySelectorAll('button')].map(b=>b.innerText.trim()).filter(Boolean)""")
        result["buttons"]=buttons

        result["console_errors_load"]=console_errors[:20]

        # MOBILE
        mctx = await browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
        mpage = await mctx.new_page()
        await mpage.goto(URL, wait_until="networkidle", timeout=60000)
        await mpage.wait_for_timeout(1500)
        await mpage.screenshot(path=OUT+r"\mobile.png", full_page=True)
        m_scroll = await mpage.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        result["mobile_hscroll"]=m_scroll
        await mctx.close()

        result["page_ref"]="kept"
        # keep desktop ctx open for AI test in separate function via returning
        await browser.close()
    print(json.dumps(result, indent=2, default=str))

asyncio.run(run())
