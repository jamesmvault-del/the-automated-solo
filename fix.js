const fs = require('fs');
let c = fs.readFileSync('scripts/generate-images.mjs', 'utf8');
c = c.replace(/return "(.*?)";/g, 'return \$1\;');
fs.writeFileSync('scripts/generate-images.mjs', c);
