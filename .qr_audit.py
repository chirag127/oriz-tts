import json, sys, traceback
from playwright.sync_api import sync_playwright

URL="https://qr.oriz.in"
ARGS=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]
out={}
try:
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,args=ARGS)
        ctx=b.new_context(viewport={"width":1440,"height":900})
        pg=ctx.new_page()
        errs=[]
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.on("pageerror",lambda e: errs.append(str(e)))
        resp=pg.goto(URL,wait_until="domcontentloaded",timeout=45000)
        out["status"]=resp.status
        try: pg.wait_for_load_state("networkidle",timeout=15000)
        except Exception as e: out["networkidle_warn"]=str(e)[:100]
        pg.wait_for_timeout(2000)
        pg.screenshot(path="C:/g/ws/.qr_audit_desktop.png",full_page=True)
        html=pg.content()
        out["console_errors"]=errs[:20]
        out["desktop_hscroll"]=pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth+2")
        out["title"]=pg.title()
        def meta(sel):
            el=pg.query_selector(sel); return el.get_attribute("content") if el else None
        out["meta_desc"]=meta('meta[name="description"]')
        out["og_title"]=meta('meta[property="og:title"]')
        out["og_desc"]=meta('meta[property="og:description"]')
        out["og_image"]=meta('meta[property="og:image"]')
        jl=pg.query_selector_all('script[type="application/ld+json"]')
        out["jsonld_count"]=len(jl)
        out["jsonld_sample"]=[j.inner_text()[:250] for j in jl[:2]]
        out["signin_matches"]=len(pg.query_selector_all('text=/sign in/i'))
        out["has_clerk"]="clerk" in html.lower()
        out["body_text_head"]=pg.evaluate("document.body.innerText").strip()[:700]
        out["input_count"]=len(pg.query_selector_all("input,textarea"))
        out["button_count"]=len(pg.query_selector_all("button"))
        ctx.close()

        ctx2=b.new_context(viewport={"width":390,"height":844},is_mobile=True)
        pg2=ctx2.new_page()
        pg2.goto(URL,wait_until="domcontentloaded",timeout=45000)
        try: pg2.wait_for_load_state("networkidle",timeout=15000)
        except: pass
        pg2.wait_for_timeout(1500)
        pg2.screenshot(path="C:/g/ws/.qr_audit_mobile.png",full_page=True)
        out["mobile_hscroll"]=pg2.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth+2")
        ctx2.close()
        b.close()
except Exception as e:
    out["FATAL"]=str(e)
    out["TB"]=traceback.format_exc()[:1500]

open("C:/g/ws/.qr_audit_out.json","w",encoding="utf-8").write(json.dumps(out,indent=2,ensure_ascii=False))
