# NordvikManager themes

Theme addons (registry category **Themes**): a stylesheet, plus the fonts and textures it needs. Each one turns itself on when installed.

| Theme | Folder | Addon key |
|---|---|---|
| Imperium Maledictum: a dark imperial frame, parchment panels and cogitator readouts | `imperium-maledictum/` | `imperiummaledictumtheme` |

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

You can install `packed/imperium-maledictum.zip` by hand, or attach it to a GitHub Release and point the registry entry's `releaseUrl` at that asset.

How the theme switches itself on:
- The install action finds the stylesheet with `%qn:resource-"<addon key>_theme.css".id%` and appends its id to the game's `customStylesheets`. It keeps any other stylesheets already there.
- You can switch it off in Game Settings → Appearance. Uninstalling removes it.
- Character sheets are sandboxed, so they keep their own look.

## Licences

- The code and stylesheets in this repo are MIT.
- IM Fell Great Primer is by Igino Marini, under the SIL Open Font License 1.1 (`imperium-maledictum/assets/OFL.txt`). It's subset to Latin and converted to WOFF2.
- No artwork from the Roll20 sheet or Games Workshop is included. The parchment texture is generated SVG noise.
