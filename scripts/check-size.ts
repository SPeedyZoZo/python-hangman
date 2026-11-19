/**
 * Mobile-data budget (NFR-PERF-2, ADR-0009): gzip size of the JavaScript the first screen needs
 * (entry chunk plus everything it imports statically). Lazy screens don't count.
 * Run after `npm run build`: node --experimental-strip-types scripts/check-size.ts
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = Number(process.env.SIZE_BUDGET_KB ?? 100);

interface Chunk {
  file: string;
  isEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
  css?: string[];
}

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8')) as Record<
  string,
  Chunk
>;
const gz = (file: string) => gzipSync(readFileSync(join(dist, file))).length / 1024;

const entryKey = Object.keys(manifest).find((k) => manifest[k]!.isEntry);
if (!entryKey) throw new Error('No entry chunk in the build manifest');

const initial = new Set<string>();
const visit = (key: string) => {
  if (initial.has(key)) return;
  initial.add(key);
  for (const k of manifest[key]!.imports ?? []) visit(k);
};
visit(entryKey);

const rows = [...initial].map((k) => ({ file: manifest[k]!.file, kb: gz(manifest[k]!.file) }));
const lazyRows = Object.entries(manifest)
  .filter(([k, c]) => !initial.has(k) && c.file.endsWith('.js'))
  .map(([, c]) => ({ file: c.file, kb: gz(c.file) }));
const total = rows.reduce((a, r) => a + r.kb, 0);

console.log('First-screen JavaScript (gzip):');
for (const r of rows) console.log(`  ${r.kb.toFixed(1).padStart(6)} KB  ${r.file}`);
console.log(`  ${total.toFixed(1).padStart(6)} KB  total (budget ${BUDGET_KB} KB)`);
console.log(
  `Loaded on demand: ${lazyRows.length} chunks, ${lazyRows.reduce((a, r) => a + r.kb, 0).toFixed(1)} KB`,
);
if (total > BUDGET_KB) {
  console.error(`✗ First-screen JavaScript is over budget by ${(total - BUDGET_KB).toFixed(1)} KB`);
  process.exit(1);
}
console.log('✓ Within budget');
