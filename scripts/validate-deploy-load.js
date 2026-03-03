#!/usr/bin/env node
/**
 * Pre-deploy load validation: export only tracked files (git archive), npm ci, then require server.
 * Surfaces MODULE_NOT_FOUND and syntax errors before push. No Docker required.
 * Run: npm run validate:load
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = path.join(os.tmpdir(), `deploy-check-${Date.now()}`);

function run(cmd, opts = {}) {
  console.log('[validate:load]', cmd);
  return execSync(cmd, { encoding: 'utf8', cwd: opts.cwd || process.cwd(), ...opts });
}

try {
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.error('[validate:load] Not a git repo; cannot run git archive.');
    process.exit(1);
  }
  fs.mkdirSync(tmpDir, { recursive: true });
  run(`git archive HEAD | tar -x -C "${tmpDir}"`);
  run('npm ci', { cwd: tmpDir });
  run('node -e "require(\'./src/server.js\'); setTimeout(() => process.exit(0), 5000)"', { cwd: tmpDir });
  console.log('[validate:load] OK: app loaded successfully (tracked files only).');
} catch (e) {
  if (e.stdout) process.stdout.write(e.stdout);
  if (e.stderr) process.stderr.write(e.stderr);
  console.error('[validate:load] Failed:', e.message || e);
  process.exit(e.status ?? 1);
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}
}
