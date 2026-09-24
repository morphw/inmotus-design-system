import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = path.join(root, 'tokens', 'inmotus.css');
const outputPath = path.join(root, 'tokens', 'inmotus.tokens.json');
const css = await readFile(cssPath, 'utf8');

function block(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, 'u'));
  if (!match) throw new Error(`Missing CSS selector: ${selector}`);
  return match[1];
}

function hslToColor(h, sPercent, lPercent) {
  const s = sPercent / 100;
  const l = lPercent / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  const bytes = [channel(0), channel(8), channel(4)].map((value) => Math.round(value * 255));
  return {
    colorSpace: 'srgb',
    components: bytes.map((value) => Number((value / 255).toFixed(6))),
    hex: `#${bytes.map((value) => value.toString(16).padStart(2, '0')).join('')}`
  };
}

function colors(selector) {
  const values = {};
  for (const match of block(selector).matchAll(/--inmotus-([a-z-]+):\s*(\d+)\s+(\d+)%\s+(\d+)%;/gu)) {
    const [, name, h, s, l] = match;
    values[name] = { $value: hslToColor(Number(h), Number(s), Number(l)) };
  }
  return values;
}

const light = colors('.inmotus-theme');
const dark = colors('.inmotus-theme[data-inmotus-theme="dark"]');
const lightNames = Object.keys(light).sort();
const darkNames = Object.keys(dark).sort();
if (lightNames.length !== 17 || lightNames.join('|') !== darkNames.join('|')) {
  throw new Error(`Expected matching sets of 17 light and dark colors; found ${lightNames.length} and ${darkNames.length}`);
}

const output = `${JSON.stringify({
  $description: 'InMotus semantic colors exported from tokens/inmotus.css. CSS is canonical; this DTCG JSON is a portable sRGB approximation of its HSL values.',
  color: {
    light: { $type: 'color', ...light },
    dark: { $type: 'color', ...dark }
  }
}, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const existing = await readFile(outputPath, 'utf8');
  if (existing !== output) throw new Error('Token export is stale. Run: node scripts/export-tokens.mjs');
  process.stdout.write('Token export is current.\n');
} else {
  await writeFile(outputPath, output);
  process.stdout.write(`Wrote ${path.relative(root, outputPath)}.\n`);
}
