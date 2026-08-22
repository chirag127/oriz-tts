---
name: ascii-art
description: "ASCII art: pyfiglet, cowsay, boxes, image-to-ascii."
version: 4.0.0
author: 0xbyt4, Hermes Agent
license: MIT
dependencies: []
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [ASCII, Art, Banners, Creative, Unicode, Text-Art, pyfiglet, figlet, cowsay, boxes]
    related_skills: [excalidraw]
---

# ASCII Art

Ported from Hermes-Agent (Nous Research) 2026-07-08. Local CLIs + free REST APIs, no keys.
## 1. pyfiglet — local banners, 571 fonts
```bash
pip install pyfiglet --break-system-packages -q
python3 -m pyfiglet "TEXT" -f slant -w 80
python3 -m pyfiglet --list_fonts
```
Fonts: `slant` clean · `doom` bold · `big` readable · `banner3` wide · `small` compact · `cyberlarge` tech · `3-d` · `gothic`. Short text → detailed; long → compact.

## 2. asciified API — remote, no install
```bash
curl -s "https://asciified.thelicato.io/api/v2/ascii?text=Hello+World&font=Slant"
curl -s "https://asciified.thelicato.io/api/v2/fonts"
```
URL-encode spaces as `+`. Font names case-sensitive.

## 3. cowsay — speech-bubble character art (`sudo apt install cowsay` / `brew install cowsay`)
```bash
cowsay -f tux "Linux"    # chars: tux, dragon, stegosaurus, vader, sheep, moose, ghostbusters, hellokitty, skeleton +40; `cowsay -l` list; `cowthink` thought bubble
```
Eyes: `-b` borg · `-d` dead · `-g` greedy · `-p` paranoid · `-s` stoned · `-w` wired · `-e "OO"` custom.

## 4. boxes — borders, 70+ designs (`sudo apt install boxes`)
```bash
echo "Hi" | boxes -d stone -a c   # designs: stone, parchment, cat, dog, unicornsay, diamonds, c-cmt, html-cmt; `boxes -l` list
python3 -m pyfiglet "X" -f slant | boxes -d stone
```

## 5. toilet — colored text art, ANSI terminals only (`sudo apt install toilet toilet-fonts`)
```bash
toilet --gay "Rainbow"     # filters: gay, metal, flip, flop, 180, border
toilet -f pagga "Block"
```

## 6. Image → ASCII
```bash
sudo snap install ascii-image-converter
ascii-image-converter img.png -C -d 60,30    # -C color, -b braille, -n invert; URLs work
sudo apt install jp2a -y && jp2a --width=80 --colors img.jpg   # JPEG-only fallback
```

## 7. Pre-made art — ascii.co.uk (`/art/{subject}`)
```bash
curl -s 'https://ascii.co.uk/art/cat' -o /tmp/a.html
```
```python
import re, html
for art in re.findall(r'<pre[^>]*>(.*?)</pre>', open('/tmp/a.html').read(), re.DOTALL):
    c = html.unescape(re.sub(r'<[^>]+>', '', art)).strip()
    if len(c) > 30: print(c, '\n---\n')
```
Subjects: `cat dog dragon rocket skull robot tree flower christmas` etc. Preserve artist signatures.

## 8. curl one-shots
```bash
curl -s https://api.github.com/octocat            # octocat + quote
curl -s "qrenco.de/Hello+World"                    # QR
curl -s "wttr.in/London"                           # weather; wttr.in/Moon for moon phase
```
## 9. LLM fallback — Unicode palette
Box `╔╗╚╝║═╠╣╦╩╬┌┐└┘│─├┤┬┴┼╭╮╰╯` · Blocks `░▒▓█▄▀▌▐` · Symbols `◆◇●○■□▲▽★✦⬡⬢`. Max 60 cols × 15 lines (banners) / 25 (scenes). Monospace only.

## Decision flow
banner → pyfiglet else asciified · message → cowsay · border → boxes · thing → ascii.co.uk · image → ascii-image-converter · QR → qrenco.de · weather → wttr.in · custom → LLM palette.
