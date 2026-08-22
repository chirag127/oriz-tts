import sys, json, re
from playwright.sync_api import sync_playwright

URL = "https://convert.oriz.in"
ARGS = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
OUT = {}

def run():
    result = {"console": [], "pageerrors": []}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=ARGS)

        # Desktop
        ctx = browser.new_context(viewport={"width":1440,"height":900})
        page = ctx.new_page()
        page.on("console", lambda m: result["console"].append(f"{m.type}: {m.text}"))
        page.on("pageerror", lambda e: result["pageerrors"].append(str(e)))
        resp = page.goto(URL, wait_until="networkidle", timeout=45000)
        result["http_status"] = resp.status if resp else None
        page.wait_for_timeout(2500)
        result["title"] = page.title()
        html = page.content()
        # raw source via request
        result["has_meta_desc"] = bool(re.search(r'<meta[^>]+name=["\']description["\']', html, re.I))
        result["has_og"] = bool(re.search(r'<meta[^>]+property=["\']og:', html, re.I))
        result["has_jsonld"] = bool(re.search(r'application/ld\+json', html, re.I))
        titles = re.findall(r'<title>(.*?)</title>', html, re.I|re.S)
        result["title_tag"] = titles[0].strip() if titles else None
        md = re.search(r'<meta[^>]+name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.I)
        result["meta_desc"] = md.group(1)[:120] if md else None
        # scroll width mobile check later
        result["desktop_scroll_w"] = page.evaluate("document.documentElement.scrollWidth")
        result["desktop_client_w"] = page.evaluate("document.documentElement.clientWidth")
        # count sign-in controls
        signin = page.evaluate("""() => {
            const els = [...document.querySelectorAll('a,button')];
            return els.filter(e => /sign in|sign-in|login|log in/i.test(e.textContent||'')).map(e=>e.textContent.trim()).slice(0,10);
        }""")
        result["signin_controls"] = signin
        page.screenshot(path="C:/g/ws/.convert_shots/desktop.png", full_page=True)

        # snapshot of visible top-level structure
        result["h1"] = page.evaluate("() => [...document.querySelectorAll('h1')].map(h=>h.textContent.trim()).slice(0,5)")
        result["body_text_head"] = page.evaluate("() => document.body.innerText.slice(0,600)")

        ctx.close()

        # Mobile
        ctxm = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True)
        pm = ctxm.new_page()
        pm.goto(URL, wait_until="networkidle", timeout=45000)
        pm.wait_for_timeout(2000)
        result["mobile_scroll_w"] = pm.evaluate("document.documentElement.scrollWidth")
        result["mobile_client_w"] = pm.evaluate("document.documentElement.clientWidth")
        result["mobile_horiz_scroll"] = result["mobile_scroll_w"] > result["mobile_client_w"] + 2
        pm.screenshot(path="C:/g/ws/.convert_shots/mobile.png", full_page=True)
        ctxm.close()

        browser.close()
    return result

r = run()
print(json.dumps(r, indent=2, default=str))
