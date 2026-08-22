import re, json
from playwright.sync_api import sync_playwright

URL = "https://me.oriz.in"
ARGS = ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
out = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=ARGS)

    # ---- Desktop ----
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
    resp = page.goto(URL, wait_until="networkidle", timeout=60000)
    out["http_status"] = resp.status
    page.wait_for_timeout(2500)
    page.screenshot(path="me-desktop.png", full_page=True)

    html = page.content()
    # horizontal scroll check desktop
    out["desktop_hscroll"] = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")

    # SEO checks
    title = page.title()
    md = page.evaluate("() => { const e=document.querySelector('meta[name=\"description\"]'); return e?e.content:null }")
    og = page.evaluate("() => Array.from(document.querySelectorAll('meta[property^=\"og:\"]')).map(m=>m.getAttribute('property'))")
    jsonld = page.evaluate("() => Array.from(document.querySelectorAll('script[type=\"application/ld+json\"]')).map(s=>s.textContent).join('\\n')")
    out["title"] = title
    out["meta_description"] = md[:120] if md else None
    out["og_tags"] = og
    out["jsonld_present"] = bool(jsonld and jsonld.strip())

    # auth controls
    signin_texts = page.evaluate("""() => {
        const nodes = Array.from(document.querySelectorAll('button, a, [role=button]'));
        return nodes.map(n => (n.innerText||'').trim()).filter(t => /sign\\s?in|sign\\s?up|log\\s?in|account|dashboard/i.test(t));
    }""")
    out["auth_controls"] = signin_texts
    out["clerk_present"] = page.evaluate("() => !!(window.Clerk) || !!document.querySelector('[class*=cl-],[data-clerk],.cl-rootBox')")

    # headings / hero
    h1 = page.evaluate("() => Array.from(document.querySelectorAll('h1')).map(h=>h.innerText.trim())")
    out["h1"] = h1
    out["h1_count"] = len(h1)

    # try a core action: click first nav/interactive link that stays on-site
    try:
        links = page.evaluate("() => Array.from(document.querySelectorAll('a[href]')).map(a=>({t:(a.innerText||'').trim(), h:a.href})).filter(x=>x.t).slice(0,40)")
        out["links_sample"] = links[:15]
    except Exception as e:
        out["links_err"] = str(e)

    out["console_errors"] = errors[:15]
    ctx.close()

    # ---- Mobile ----
    mctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
    mpage = mctx.new_page()
    merrors = []
    mpage.on("console", lambda m: merrors.append(m.text) if m.type == "error" else None)
    mresp = mpage.goto(URL, wait_until="networkidle", timeout=60000)
    mpage.wait_for_timeout(2500)
    mpage.screenshot(path="me-mobile.png", full_page=True)
    out["mobile_hscroll"] = mpage.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
    out["mobile_status"] = mresp.status
    out["mobile_console_errors"] = merrors[:10]
    mctx.close()

    browser.close()

print(json.dumps(out, indent=2, default=str))
