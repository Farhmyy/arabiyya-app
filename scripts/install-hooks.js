const fs   = require('fs');
const path = require('path');

const src  = path.join(__dirname, 'pre-push');
const dest = path.join(__dirname, '..', '.git', 'hooks', 'pre-push');

if (!fs.existsSync(path.join(__dirname, '..', '.git'))) {
  console.log('Bukan git repo, skip install hooks.');
  process.exit(0);
}

fs.copyFileSync(src, dest);
try { fs.chmodSync(dest, '755'); } catch (_) {}
console.log('✅ Git pre-push hook terpasang.');
