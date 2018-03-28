# makeitstripey
Two Node.js scripts that help create precisely striped prints with a Mosaic Palette(+)

I'm still using Node.js 6.10.3, but it should work on newer versions of Node.

These scripts were created for a project, and I figured it can't hurt to share. These are largely untested, except with the prints I needed them for, so proceed/use with caution.

## MSF Generator

MSF Generator creates a basic msf file for use with the Mosaic Palette(+). It does not create a transition tower, so the stripe effect it generates is a bit unpredictable. Provided your machine is well calibrated, it should produce a closely accurate print.

**Only supports Simplify3D generated G-code**

###To use:

Copy `config.example.json` as `config.js`, modify for your printer/palette combo. Run the script against a gcode file.

```bash
cd /msfgenerator

cp config.example.js config.js

nano config.js

npm install

node index.js -i <input filename>
```

## G-code Modder

G-code Modder allows you to post-process a G-code file with a specific pattern for up to 4 drives for use in Chroma, which can then be printed in multicolor using a Mosaic Palette+ (or any other 3D printer that supports multiple tools). This will allow you to have exactly placed stripes using a transition tower.

**Only supports Simplify3D generated G-code**

###To use:

Copy `config.example.json` as `config.js`, modify for your printer/palette combo. Run the script against a gcode file.

```bash
cd /gcodemodder

cp config.example.js config.js

nano config.js

npm install

node index.js -i <input filename>
```