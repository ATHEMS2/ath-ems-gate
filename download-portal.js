const https = require('https');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const base = 'https://raw.githubusercontent.com/mr-codix1/ALHLAL_1/main/';

const files = [
  'admin.html', 'app.js', 'appointments.html', 'bonus.html', 'bonus.js',
  'deputation.html', 'deputation.js', 'ext_leave.css', 'ext_leave.html', 'ext_leave.js',
  'firing.html', 'firing.js', 'index.html', 'initial_acceptance.html', 'initial_acceptance.js',
  'leave.css', 'leave.html', 'leave.js', 'leave2.css', 'leave2.js', 'logo.png',
  'new_batch.html', 'new_batch.js', 'pages.css', 'resignation.html', 'resignation.js',
  'rewards.html', 'rewards.js', 'rewards_hub.html', 'role_request.css', 'role_request.html',
  'role_request.js', 'style.css', 'tickets.html', 'tickets.js',
];

function download(file) {
  return new Promise((resolve, reject) => {
    const dest = path.join(root, file);
    const url = base + file;
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (r) => pipe(r, dest, file, resolve, reject)).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${file}: HTTP ${res.statusCode}`));
        return;
      }
      pipe(res, dest, file, resolve, reject);
    }).on('error', reject);
  });
}

function pipe(res, dest, file, resolve, reject) {
  const out = fs.createWriteStream(dest);
  res.pipe(out);
  out.on('finish', () => {
    const size = fs.statSync(dest).size;
    console.log(`OK ${file} (${size} bytes)`);
    resolve();
  });
  out.on('error', reject);
}

(async () => {
  console.log(`Downloading ${files.length} files to ${root}\n`);
  for (const file of files) {
    await download(file);
  }
  console.log('\nDone.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
