# makeitstripey
Two Node.js scripts that help create precisely striped prints with a Mosaic Palette(+)

I'm still using Node.js 6.10.3, but it should work on newer versions of Node.

## MSF Generator Usage

**Only supports Simplify3D generated G-code**

Copy `config.example.json` as `config.js`, modify for your printer/palette combo. Run the script against a gcode file.

```bash
cd /msfgenerator

cp config.example.js config.js

nano config.js

npm install

node index.js -i <input filename>
```

## G-code Tweaker

Not yet written, but the idea is to add tool changes every nth layer (per a simple array-based pattern). This way, the G-code file can be processed by Chroma, and support towers added if precise changes are needed.