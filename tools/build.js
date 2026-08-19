#!/usr/bin/env node
/* Builds one self-contained HTML per brand into dist/.
   Usage: node tools/build.js [brandId ...]   (default: all brands in /brands) */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const src = p => path.join(root, 'src', p);
const read = p => fs.readFileSync(p, 'utf8');
const b64 = p => fs.readFileSync(p).toString('base64');
const version = JSON.parse(read(path.join(root, 'package.json'))).version;

const brandIds = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(root, 'brands')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));

// {{svg:path}} / {{b64:path}} helpers inside brand snippets
const expand = s => s
  .replace(/\{\{svg:([^}]+)\}\}/g, (_, p) => { let svg = read(src(p)); svg = svg.slice(svg.indexOf('<svg')).replace(/<!--[\s\S]*?-->/g, ''); return svg; })
  .replace(/\{\{b64:([^}]+)\}\}/g, (_, p) => b64(src(p)));

const jsDir = src('js');
const parts = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const app = parts.map(f => `/* ---- ${f} ---- */\n` + read(path.join(jsDir, f))).join('\n\n');
const vendors = ['vendor/xlsx.full.min.js', 'vendor/jspdf.umd.min.js', 'vendor/jspdf.plugin.autotable.min.js'].map(v => `<script>\n${read(src(v))}\n</script>`).join('\n');
const fonts = { __FONT_REGULAR__: 'assets/fonts/Ubuntu-Regular.ttf', __FONT_MEDIUM__: 'assets/fonts/Ubuntu-Medium.ttf', __FONT_BOLD__: 'assets/fonts/Ubuntu-Bold.ttf', __FONTMONO_REGULAR__: 'assets/fonts/UbuntuMono-Regular.ttf', __FONTMONO_BOLD__: 'assets/fonts/UbuntuMono-Bold.ttf' };

for (const id of brandIds) {
  const brand = JSON.parse(read(path.join(root, 'brands', id + '.json')));
  let html = read(src('template.html'));
  for (const [k, f] of Object.entries(fonts)) html = html.split(k).join(b64(src(f)));
  html = html.split('__VERSION__').join(version)
    .replace('__TITLE__', brand.title)
    .replace('__FAVICON__', b64(src(brand.favicon)))
    .replace('__BRAND_TOKENS__', brand.tokens)
    .replace('__BRAND_HEADER_LOGO__', expand(brand.headerLogo))
    .replace('__BRAND_PROMISE__', expand(brand.promise || ''))
    .replace('__BRAND_FOOTER__', expand(brand.footer));
  const BRAND = { id: brand.id, name: brand.name, mode: brand.mode, build: version, contact: brand.contact, partner: brand.partner || 'Partner', grades: brand.grades || null, gradesNote: brand.gradesNote || '', pdf: { ...brand.pdf, logoLight: 'data:image/png;base64,' + b64(src(brand.pdf.logoLight)), logoDark: 'data:image/png;base64,' + b64(src(brand.pdf.logoDark)) }, fontR: b64(src('assets/fonts/Ubuntu-Regular.ttf')), fontB: b64(src('assets/fonts/Ubuntu-Bold.ttf')) };
  const brandJs = 'const BRAND=' + JSON.stringify(BRAND) + ';\n';
  try { new Function(brandJs + app); } catch (e) { console.error('Syntax error in app scripts:', e.message); process.exit(1); }
  const out = html + vendors + `\n<script>\n${brandJs}${app}\n</script></body></html>`;
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  const outFile = path.join(root, 'dist', brand.outFile);
  fs.writeFileSync(outFile, out);
  console.log(`Built dist/${brand.outFile} (${(out.length / 1024 / 1024).toFixed(2)} MB, v${version}, brand ${brand.id}/${brand.mode})`);
}
