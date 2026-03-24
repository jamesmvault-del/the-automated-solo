import fs from 'fs/promises';
import path from 'path';

function buildPrompt(category, title, desc, imageStyle) {
  let cleanTitle = title;
  if (title && title.length > 20) {
    const parts = title.split(' ');
    cleanTitle = parts.slice(0, 3).join(' ');
  }

  if (category === 'tools' || imageStyle === 'tech-thumbnail') {
    return 'Icon only. Deep dark solid background. A simple, premium, glowing 3D stylized icon representing ' + cleanTitle + '. Directly below the icon, the text \u0022' + cleanTitle + '\u0022 is written in simple, bold, flawlessly spelled white sans-serif typography. No long text.';
  } else if (imageStyle === 'emotional-photography') {
    return 'Cinematic 35mm portrait photography of a solo professional. High-end dark modern office. Deep shadows, volumetric lighting, moody. Text \u0022' + cleanTitle + '\u0022 overlaid like a magazine cover.';
  } else if (imageStyle === 'blueprint-abstract' || category === 'playbooks') {
    return 'Step-by-step workflow blueprint document. Glowing nodes, dark gray background. The text \u0022' + cleanTitle + '\u0022 printed cleanly.';
  } else if (imageStyle === 'ui-dashboard' || category === 'research') {
    return 'AI data analysis charts and dashboards. Glowing lines on dark obsidian background. Authoritative. The text \u0022' + cleanTitle + '\u0022 displayed.';
  } else {
    return 'Professional legal tech representation. Dark glass, glowing green accents. The text \u0022' + cleanTitle + '\u0022 clearly visible.';
  }
}

export async function generateGeminiImage(prompt, apiKey, fileName) {
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=' + apiKey;

  console.log('\n🎨 Requesting High-Quality Imagen 4.0 generation for:\n  -> ' + prompt.substring(0, 100) + '...');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: prompt }],
      parameters: { sampleCount: 1, personGeneration: 'ALLOW_ADULT', aspectRatio: '16:9' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Google API Error: ' + response.status + ' - ' + errorText);
  }

  const data = await response.json();
  let base64Data = null;

  if (data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
    base64Data = data.candidates[0].content.parts[0].inlineData.data;
  } else if (data?.predictions?.[0]?.bytesBase64Encoded) {
    base64Data = data.predictions[0].bytesBase64Encoded;
  }

  if (!base64Data) {
    throw new Error('No image data returned from API.');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  const targetPath = path.join(process.cwd(), 'public', 'images', fileName);
  await fs.writeFile(targetPath, buffer);

  console.log('✅ Success! Image saved to: /images/' + fileName);
  return '/images/' + fileName;
}

async function runDirectorySweep() {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error('❌ ERROR: No GEMINI_API_KEY found in environment context.');
    process.exit(1);
  }

  const CONTENT_DIRS = [path.join(process.cwd(), 'src/content/tools')];
  let processCount = 0;

  for (const dir of CONTENT_DIRS) {
    const category = path.basename(dir);
    let files;
    try { files = await fs.readdir(dir); } catch { continue; }

    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, 'utf-8');

      if (content.includes('images.unsplash.com')) {
        console.log('\n🔍 Found placeholder in: ' + file);

        const titleMatch = content.match(/title:\s*['\u0022]([^'\u0022]+)['\u0022]/i) || content.match(/name:\s*['\u0022]([^'\u0022]+)['\u0022]/i);
        const descriptionMatch = content.match(/description:\s*['\u0022]([^'\u0022]+)['\u0022]/i) || content.match(/useCase:\s*['\u0022]([^'\u0022]+)['\u0022]/i);
        const imageStyleMatch = content.match(/imageStyle:\s*['\u0022]([^'\u0022]+)['\u0022]/i);

        const title = titleMatch ? titleMatch[1] : 'The Automated Solo';
        const desc = descriptionMatch ? descriptionMatch[1] : 'Legal Tech';
        const imageStyle = imageStyleMatch ? imageStyleMatch[1] : null;

        const engineeredPrompt = buildPrompt(category, title, desc, imageStyle);
        const safeSlug = file.replace('.mdx', '').replace('.md', '');
        const outFileName = safeSlug + '.png';

        try {
          const newImagePath = await generateGeminiImage(engineeredPrompt, API_KEY, outFileName);

          const updatedContent = content.replace(
            /image:\s*['\u0022]https:\/\/images\.unsplash\.com[^'\u0022]+['\u0022]/g,
            'image: \u0022' + newImagePath + '\u0022'
          );

          await fs.writeFile(filePath, updatedContent, 'utf-8');
          console.log('📝 Updated markdown file ' + file + ' with local image link.');

          processCount++;
          if (processCount >= 1) {
            console.log('\n🛑 Stopping after 1 test generation to save API tokens.');
            return;
          }
        } catch (err) {
          console.error('❌ Failed to process ' + file + ': ' + err.message);
        }
      }
    }
  }
}

runDirectorySweep();
