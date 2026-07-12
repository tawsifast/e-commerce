import { transformSync } from 'esbuild';
import { readFileSync, writeFileSync, renameSync, statSync } from 'fs';
import { execSync } from 'child_process';

const files = process.argv.slice(2);
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const isTsx = f.endsWith('.tsx');
  const loader = isTsx ? 'tsx' : 'ts';
  const out = transformSync(src, { loader, jsx: 'preserve', target: 'esnext', format: 'esm' }).code;
  const newPath = f.replace(/\.tsx?$/, isTsx ? '.jsx' : '.js');
  writeFileSync(newPath, out);
  if (newPath !== f) execSync(`rm ${JSON.stringify(f)}`);
  console.log('->', newPath);
}
