import re, sys, json, time
from playwright.sync_api import sync_playwright

URL = "https://play.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out = {"console_errors": [], "http_status": None, "seo": {}, "signin": {}, "ai": {}, "layout": {}}

def grab_seo(html):
    def find(p):
        m = re.search(p, html, re.I|re.S)
        return m.group(1).strip() if m else None
    return {
        "title": find(r"<title[^>]*>(.*?)</title>"),
        "meta_desc": find(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']'),
        "og_title": find(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']'),
        "og_desc": find(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']'),
        "og_image": find(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']'),
        "jsonld": bool(re.search(r'<script[^>]*type=["\']application/ld\+json["\']', html, re.I)),
    }

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=ARGS)
    ctx = b.new_context(viewport={"width":1440,"height":900})
    pg = ctx.new_page()
    errs=[]
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.on("pageerror", lambda e: errs.append("PAGEERROR: "+str(e)))
    resp = pg.goto(URL, wait_until="networkidle", timeout=60000)
    out["http_status"] = resp.status if resp else None
    time.sleep(3)
    html = pg.content()
    # raw source via fetch
    raw = pg.evaluate("async()=>{const r=await fetch(location.href);return await r.text();}")
    out["seo"] = grab_seo(raw)
    out["seo_rendered"] = grab_seo(html)
    pg.screenshot(path="C:/g/ws/.play_desktop.png", full_page=True)
    # horizontal scroll check desktop
    out["layout"]["desktop_scrollw"] = pg.evaluate("document.documentElement.scrollWidth")
    out["layout"]["desktop_clientw"] = pg.evaluate("document.documentElement.clientWidth")
    # signin controls
    signin_texts = pg.evaluate("""()=>{
      const els=[...document.querySelectorAll('a,button')];
      return els.filter(e=>/sign\\s*in|log\\s*in|sign\\s*up/i.test(e.textContent||'')).map(e=>({tag:e.tagName,txt:(e.textContent||'').trim().slice(0,40),cls:e.className.slice(0,60)}));
    }""")
    out["signin"]["controls"] = signin_texts
    out["signin"]["clerk"] = pg.evaluate("()=>!!document.querySelector('[class*=cl-],[data-clerk],.cl-userButton,.cl-signIn')")
    # body text sample for AI feature discovery
    out["page_text_sample"] = pg.evaluate("()=>document.body.innerText.slice(0,1500)")
    # look for inputs/textareas/generate buttons
    out["ai"]["inputs"] = pg.evaluate("""()=>{
      const t=[...document.querySelectorAll('textarea,input[type=text],input:not([type])')].map(e=>({tag:e.tagName,ph:e.placeholder||'',id:e.id,cls:e.className.slice(0,50)}));
      const btns=[...document.querySelectorAll('button')].map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,30);
      return {fields:t, buttons:btns};
    }""")
    out["console_errors"] = errs[:40]

    # mobile
    m = b.new_context(viewport={"width":390,"height":844}, is_mobile=True)
    mp = m.new_page()
    mp.goto(URL, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    mp.screenshot(path="C:/g/ws/.play_mobile.png", full_page=True)
    out["layout"]["mobile_scrollw"] = mp.evaluate("document.documentElement.scrollWidth")
    out["layout"]["mobile_clientw"] = mp.evaluate("document.documentElement.clientWidth")
    b.close()

print(json.dumps(out, indent=2, ensure_ascii=False))
