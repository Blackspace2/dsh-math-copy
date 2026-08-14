import { build } from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lib = resolve(root, 'lib');
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const pluginId = manifest.name;
if (typeof pluginId !== 'string' || pluginId.length === 0) {
  throw new Error('package.json must contain a non-empty name');
}

await rm(lib, { recursive: true, force: true });
await mkdir(lib, { recursive: true });

await build({
  entryPoints: [resolve(root, 'src/index.ts')],
  outfile: resolve(lib, 'index.js'),
  bundle: false,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  legalComments: 'none',
});

const client = await build({
  entryPoints: [resolve(root, 'src/client/index.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  write: false,
  sourcemap: false,
  legalComments: 'none',
});

const output = client.outputFiles[0];
if (output === undefined) {
  throw new Error('esbuild did not produce the client bundle');
}

const body = output.text.replace(/^"use strict";\r?\n/, '');
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(pluginId)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
${body.split('\n').map((line) => `    ${line}`).join('\n')}
    return module.exports;
  }
});
`;

await writeFile(resolve(lib, 'client.js'), wrapped, 'utf8');
