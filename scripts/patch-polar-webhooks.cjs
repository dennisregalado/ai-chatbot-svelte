#!/usr/bin/env node
// Create missing shim files for @polar-sh/sdk to satisfy file tracers
// that try to resolve `webhooks.ts.js`.

const fs = require('fs');
const path = require('path');

function ensureFile(filePath, contents) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, contents, 'utf8');
  }
}

try {
  const pkgPath = require.resolve('@polar-sh/sdk/package.json');
  const root = path.dirname(pkgPath);
  const esmDir = path.join(root, 'dist', 'esm');
  const cjsDir = path.join(root, 'dist', 'commonjs');

  const esmTarget = path.join(esmDir, 'webhooks.ts.js');
  const cjsTarget = path.join(cjsDir, 'webhooks.ts.js');

  // ESM shim re-exports from the real file
  ensureFile(esmTarget, "export * from './webhooks.js';\nexport { default } from './webhooks.js';\n");

  // CJS shim re-exports from the real file
  ensureFile(cjsTarget, "module.exports = require('./webhooks.js');\n");

  // Also create the .d.ts to keep TS happy if any tool inspects it
  const esmTypes = path.join(esmDir, 'webhooks.ts.d.ts');
  const cjsTypes = path.join(cjsDir, 'webhooks.ts.d.ts');
  const dts = "export * from './webhooks';\nexport { default } from './webhooks';\n";
  ensureFile(esmTypes, dts);
  ensureFile(cjsTypes, dts);

  console.log('[patch-polar-webhooks] shims created');
} catch (err) {
  // Don't fail installs if anything is off
  console.warn('[patch-polar-webhooks] skipped:', err?.message || err);
}

