const fs = require("fs");
let content = fs.readFileSync("src/content/tools/sendfox.mdx", "utf-8");
content = content.replace(
  /image:.*\n/,
  "imageStyle: 'tech-thumbnail'\nimage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80'\n",
);
fs.writeFileSync("src/content/tools/sendfox.mdx", content);
