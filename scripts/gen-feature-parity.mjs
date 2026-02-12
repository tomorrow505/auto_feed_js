import fs from 'fs';

// Generates `docs/wiki/FEATURE_PARITY.md` site table from legacy wiki list:
// - `auto_feed_js.wiki/支持的站点.md`
//
// Keep this script dependency-free so it can run with plain Node.

const WIKI_PATH = 'auto_feed_js.wiki/支持的站点.md';
const OUT_PATH = 'docs/wiki/FEATURE_PARITY.md';

const wiki = fs.readFileSync(WIKI_PATH, 'utf8');

// Refactor supported site names come from `src/config/sites_*.ts`.
// We keep the canonical list here so FEATURE_PARITY can be regenerated without TypeScript runtime.
const REFACTOR_SUPPORTED = new Set([
  // NexusPHP
  'OpenCD',
  'HDHome',
  'MTeam',
  'HDSky',
  'OurBits',
  'CMCT',
  'TTG',
  'PTer',
  'HDArea',
  'Audiences',
  'FRDS',
  'CHDBits',
  'HDB',
  'KG',

  // Gazelle
  'GPW',
  'PTP',
  'RED',
  'OPS',
  'DIC',

  // Unit3D / Unit3DClassic
  'BLU',
  'Tik',
  'Aither',
  'FNP',
  'OnlyEncodes',
  'DarkLand',
  'ReelFliX',
  'ACM',
  'Monika',
  'DTR',
  'HDOli',
  'HONE',
  'BHD',
  'HDF',
  'PrivateHD'
]);

const ALIAS = new Map([
  // Legacy wiki names -> refactor canonical names
  ['DICMusic', 'DIC'],
  ['PHD', 'PrivateHD'],
  ['ReelFlix', 'ReelFliX']
]);

function stripStrike(s) {
  return String(s || '').replace(/^~~|~~$/g, '').trim();
}

function genSiteTable(md) {
  const rows = [];
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes(':---')) continue;
    const parts = line.split('|').map((x) => x.trim());
    const siteRaw = parts[1] || '';
    const site = stripStrike(siteRaw);
    if (!site || site === '站点') continue;
    const link = parts[2] || '';
    const inCol = parts[3] || '';
    const outCol = parts[4] || '';
    const note = parts[5] || '';

    const mapped = ALIAS.get(site) || site;
    const supported = REFACTOR_SUPPORTED.has(mapped);

    // Mark supported sites by striking the site name (per request).
    let siteMark = siteRaw;
    if (supported) {
      // If legacy already uses strike (closed sites), keep it.
      if (!/^~~.*~~$/.test(siteRaw)) siteMark = `~~${site}~~`;
    }

    rows.push({ site: siteMark, link, inCol, outCol, supported: supported ? '✅' : '', note });
  }

  const header = ['站点(~~=重构已支持~~)', '链接', '转入', '转出', '重构', '备注'];
  const out = [];
  out.push('| ' + header.join(' | ') + ' |');
  out.push('| ' + header.map(() => '---').join(' | ') + ' |');
  for (const r of rows) {
    out.push(`| ${r.site} | ${r.link} | ${r.inCol} | ${r.outCol} | ${r.supported} | ${r.note} |`);
  }
  return out.join('\n');
}

const siteTable = genSiteTable(wiki);

const outMd = `# Auto-Feed Refactor 功能/站点对照表

本文件用于追踪重构版与原版的功能对齐进度。

对照来源：
- 原版脚本（权威行为参考）：\`archive/auto_feed.legacy.user.js\`
- 原版 Wiki 站点列表（权威站点清单）：\`${WIKI_PATH}\`

说明：
- 表格里 \`~~站点名~~\` 表示“重构版已支持该站点”（存在站点配置 + 引擎类型支持）。
- “重构 ✅”只代表“已接入/可用”，不代表“每个细节都已人工验证”。

## 站点支持进度（来自原版 Wiki）

${siteTable}
`;

fs.writeFileSync(OUT_PATH, outMd, 'utf8');
console.log(`[gen-feature-parity] wrote ${OUT_PATH}`);

