const fs = require('fs');
const files = [
  'src/content/playbooks/autopilot-referral-engine.mdx',
  'src/content/tools/sendfox.mdx',
  'src/content/tools/sleekbio.mdx',
  'src/content/tools/tidycal.mdx',
  'src/content/tools/typedesk.mdx'
];
const placeholder = 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80';

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf-8');
    content = content.replace(/image:\s*["'].*?["']/g, 'image: "' + placeholder + '"');
    fs.writeFileSync(f, content);
    console.log('Reverted ' + f);
  } catch (e) {
    console.error('Failed ' + f, e.message);
  }
});