import fs from "fs/promises";
import path from "path";

/**
 * A highly reusable core implementation for the Gemini Image Generation API.
 * This can be imported by external site agents, Astro endpoints, or run directly below.
 */
export async function generateGeminiImage(prompt, apiKey, fileName) {
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  // The official REST Endpoint for Google's Imagen 3 model via Developer API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro-exp:generateContent?key=${apiKey}`;

  console.log(
    `\n🎨 Requesting Imagen 3 generation for: "${prompt.substring(0, 50)}..."`,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data?.predictions?.[0]?.bytesBase64Encoded) {
    throw new Error("No image data returned from API.");
  }

  // Convert Base64 directly into a binary Buffer
  const base64Data = data.predictions[0].bytesBase64Encoded;
  const buffer = Buffer.from(base64Data, "base64");

  // Force file extension to be .png since base Imagen returns PNG/JPEG base64 data nicely
  const targetPath = path.join(process.cwd(), "public", "images", fileName);
  await fs.writeFile(targetPath, buffer);

  console.log(`✅ Success! Image saved to: /images/${fileName}`);
  return `/images/${fileName}`;
}

/**
 * The Automation Runner: Scans MDX files and mass-updates them.
 * You can execute this via terminal: node --env-file=.env scripts/generate-images.js
 */
async function runDirectorySweep() {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("❌ ERROR: No GEMINI_API_KEY found in environment context.");
    process.exit(1);
  }

  const CONTENT_DIRS = [
    path.join(process.cwd(), "src/content/playbooks"),
    path.join(process.cwd(), "src/content/tools"),
    path.join(process.cwd(), "src/content/research"),
  ];

  for (const dir of CONTENT_DIRS) {
    let files;
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    } // Skip if directory doesn't exist yet

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, "utf-8");

      // Check if it's using the Unsplash placeholder
      if (content.includes("images.unsplash.com")) {
        console.log(`\n🔍 Found placeholder in: ${file}`);

        // Very basic scrape of the Title to feed to the image generator
        const titleMatch =
          content.match(/title:\s*["']([^"']+)["']/i) ||
          content.match(/name:\s*["']([^"']+)["']/i);
        const descriptionMatch =
          content.match(/description:\s*["']([^"']+)["']/i) ||
          content.match(/useCase:\s*["']([^"']+)["']/i);

        const title = titleMatch ? titleMatch[1] : "The Automated Solo Project";
        const desc = descriptionMatch
          ? descriptionMatch[1]
          : "Legal Tech software review";

        // THE PROMPT ENGINEERING (Adjust this recipe to tweak your brand aesthetic)
        const engineeredPrompt = `A premium, cinematic, dark-mode 3D isometric mockup representing "${title}". Visual elements should include sleek dark glass interfaces, subtle emerald green glowing accents, and slate grey backgrounds. It must look like high-end professional legal technology, minimalist, Harvard Business Review aesthetic. Context: ${desc}. Abstract representation, highly detailed UI, no text or typography, volumetric lighting, 8k resolution.`;

        const safeSlug = file.replace(".mdx", "").replace(".md", "");
        const outFileName = `${safeSlug}.png`;

        try {
          // Generate the image
          const newImagePath = await generateGeminiImage(
            engineeredPrompt,
            API_KEY,
            outFileName,
          );

          // Update the Markdown file to replace the old Unsplash URL with the new local one
          const updatedContent = content.replace(
            /image:\s*["']https:\/\/images\.unsplash\.com[^"']+["']/g,
            `image: "${newImagePath}"`,
          );

          await fs.writeFile(filePath, updatedContent, "utf-8");
          console.log(
            `📝 Updated markdown file ${file} with local image link.`,
          );
        } catch (err) {
          console.error(`❌ Failed to process ${file}:`, err.message);
        }
      }
    }
  }
}

// Only run the sweep if executed directly from the terminal
import url from "url";
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  console.log("🚀 Starting The Automated Solo Image Sweeper...");
  runDirectorySweep();
}
