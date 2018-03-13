# makeitstripey
Two Node.js Scripts that help create multicolored prints with a Mosaic Palette(+)

## MSF Generator Usage

Copy `config.example.json` as `config.js`, modify for your printer/palette combo. Run the script against a gcode file.

```bash
cd /msfgenerator

cp config.example.js config.js

nano config.js

npm install

node index.js -i <input filename>
```
