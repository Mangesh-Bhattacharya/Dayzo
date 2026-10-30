// Builds the installable web app (PWA) into ./web-dist. Works under any base path.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'dist');
execSync('npx expo export --platform web', { stdio: 'inherit' });
let html = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
html = html
  .replace(/(src|href)="\/(?!\/)/g, '$1="./') // root-relative -> relative
  .replace('<link rel="icon" href="./favicon.ico"/>', '<link rel="icon" href="./favicon.ico"/>')
  .replace(
    '</head>',
    [
      '<link rel="manifest" href="./manifest.webmanifest" />',
      '<meta name="theme-color" content="#07080C" />',
      '<meta name="mobile-web-app-capable" content="yes" />',
      '<meta name="apple-mobile-web-app-capable" content="yes" />',
      '<meta name="apple-mobile-web-app-title" content="Dayzo" />',
      '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
      '<link rel="apple-touch-icon" href="./apple-touch-icon.png" />',
      '</head>',
    ].join('\n'),
  )
  .replace(
    '</body>',
    `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){});});}</script></body>`,
  );
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('PWA build ready in', out);
