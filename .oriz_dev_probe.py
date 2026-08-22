import re, json, time
from playwright.sync_api import sync_playwright

URL = "https://dev.oriz.in"
ARGS = ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, args=ARGS)
    p = b.new_context(viewport={"width":1440,"height":900}).new_page()
    errs=[]
    p.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    p.goto(URL, wait_until="networkidle", timeout=45000)
    time.sleep(2)
    # dump all interactive text: buttons, links, tabs, any element mentioning AI/ask/chat/generate
    info = p.evaluate("""() => {
        const all=[...document.querySelectorAll('*')];
        const aiMentions = all.filter(e=>e.children.length===0 && /\\b(ai|ask|chat|generate|explain|assistant|prompt|gpt)\\b/i.test(e.textContent||'')).map(e=>({tag:e.tagName,txt:(e.textContent||'').trim().slice(0,50),cls:(e.className||'').toString().slice(0,50)}));
        const tabs=[...document.querySelectorAll('[role=tab],[role=button],button,a,[class*=tab]')].map(e=>({tag:e.tagName,txt:(e.textContent||'').trim().slice(0,30),role:e.getAttribute('role')})).filter(x=>x.txt);
        return {aiMentions: aiMentions.slice(0,30), controls: tabs.slice(0,60)};
    }""")
    print("AI MENTIONS:", json.dumps(info["aiMentions"], indent=1))
    print("\nCONTROLS:", json.dumps(info["controls"], indent=1)[:2500])
    print("\nCONSOLE ERRORS:", errs[:10])
    b.close()
