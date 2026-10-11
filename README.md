# NordvikManager themes

Theme addons (registry category **Themes**): a stylesheet, plus the fonts and textures it needs. Each one turns itself on when installed.

| Theme | Folder | Addon key |
|---|---|---|
| Imperium Maledictum: a dark imperial frame, parchment panels and cogitator readouts | `imperium-maledictum/` | `imperiummaledictumtheme` |
| Fifth Edition: light parchment pages in a dark leather binding, crimson headings and gold rules (matches the Fifth Edition (SRD) character sheet) | `fifth-edition/` | `fiftheditiontheme` |

## Layout of a theme

```
<theme>/
  src/theme.css          readable source; @ASSET(file.ext) is filled in from assets/ at build time
  assets/                fonts, textures (and their licences)
  addon_files/
    info.json
    Actions/install.json switches the stylesheet on at install (hook 1)
```

`pnpm run pack <theme>` builds `packed/<theme>/Resources/theme.css`, with every asset inlined as a `data:` URI, and then `packed/<theme>.zip`. Assets are embedded for two reasons:
- the app strips any `url()` pointing outside the game;
- players who reach the GM backend only over WebRTC couldn't load material links anyway.

## Installing

```
pnpm install
pnpm run pack imperium-maledictum
```

You can install `packed/imperium-maledictum.zip` by hand. Releases are made by the Release workflow (see below).

How the theme switches itself on:
- The install action finds the stylesheet with `%qn:resource-"<addon key>_theme.css".id%` and appends its id to the game's `customStylesheets`. It keeps any other stylesheets already there.
- You can switch it off in Game Settings → Appearance. Uninstalling removes it.
- Character sheets are sandboxed, so they keep their own look.

## Licences

- The code and stylesheets in this repo are MIT.
- IM Fell Great Primer is by Igino Marini, under the SIL Open Font License 1.1 (`imperium-maledictum/assets/OFL.txt`). It's subset to Latin and converted to WOFF2.
- No artwork from the Roll20 sheet or Games Workshop is included. The parchment texture is generated SVG noise.
- Cinzel (The Cinzel Project Authors) and Crimson Text (The Crimson Text Project Authors) are under the SIL Open Font License 1.1 (`fifth-edition/assets/OFL-*.txt`). They are the Latin-subset WOFF2 files from Fontsource.
- The Fifth Edition theme uses no publisher artwork or trademarks. Its parchment and leather textures are generated SVG noise.

## Releasing

1. Bump `version` in `<theme>/addon_files/info.json` and merge it as usual.
2. Run **Actions → Release → Run workflow**. Pick the theme.

The workflow packs the addon, checks that the zip's `info.json` matches, and publishes a GitHub Release (tag `<theme>-<version>`, asset `<theme>.zip`). It refuses a version that is already released. The registry ([NordvikManager-Addons](https://github.com/haffff/NordvikManager-Addons)) picks the new version up in its daily sync pull request.
