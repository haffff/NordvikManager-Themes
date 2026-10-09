// Builds one theme addon: inlines its assets into theme.css as data: URIs, then zips
// addon_files (+ the built stylesheet) into packed/<theme>.zip for installing.
//
//   pnpm run pack <theme>          e.g. pnpm run pack imperium-maledictum
//
// A theme's src/theme.css refers to its assets as @ASSET(file name), resolved against
// <theme>/assets/. The app strips any url() pointing outside the game, and a shipped
// stylesheet can't know the GM backend's address, so everything is embedded.
import archiver from 'archiver';
import { cpSync, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const theme = process.argv[2];
if (!theme || !existsSync(path.join(repoRoot, theme, 'addon_files'))) {
  console.error('Usage: pnpm run pack <theme folder>, e.g. pnpm run pack imperium-maledictum');
  process.exit(1);
}

const themeDir = path.join(repoRoot, theme);
const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

// ── 1. theme.css with its assets inlined ─────────────────────────────────────
const source = readFileSync(path.join(themeDir, 'src', 'theme.css'), 'utf8');
// Only file names with an extension, so a mention like "@ASSET(name)" in a comment is left alone.
const css = source.replace(/@ASSET\(([\w.-]+\.\w+)\)/g, (_, name) => {
  const file = path.join(themeDir, 'assets', name.trim());
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) throw new Error(`@ASSET(${name}): unknown file type`);
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
});

// Anything left pointing outside would be stripped by the app at runtime.
const outside = css.match(/url\(\s*["']?(?!data:)[a-z]+:\/\//gi);
if (outside) throw new Error(`theme.css still loads outside URLs: ${outside.join(', ')}`);

// ── 2. packed/<theme>/ = addon_files + the built stylesheet, zipped ──────────
const packedRoot = path.join(repoRoot, 'packed');
const packedDir = path.join(packedRoot, theme);
rmSync(packedDir, { recursive: true, force: true });
mkdirSync(packedDir, { recursive: true });
cpSync(path.join(themeDir, 'addon_files'), packedDir, { recursive: true });
mkdirSync(path.join(packedDir, 'Resources'), { recursive: true });
writeFileSync(path.join(packedDir, 'Resources', 'theme.css'), css);

const zipPath = path.join(packedRoot, `${theme}.zip`);
rmSync(zipPath, { force: true });
await new Promise((resolve, reject) => {
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', resolve);
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory(packedDir, false);
  archive.finalize();
});

console.log(`theme.css: ${(css.length / 1024).toFixed(0)} KB -> ${path.relative(repoRoot, zipPath)}`);
