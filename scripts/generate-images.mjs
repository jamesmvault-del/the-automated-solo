import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/**
 * Validate that a generated image is not blank, solid-color, or too dark.
 * Returns { valid: boolean, reason?: string }
 */
async function validateImage(filePath) {
  try {
    const { channels, isOpaque } = await sharp(filePath).stats();
    // channels[0] = red, [1] = green, [2] = blue
    const avgBrightness =
      (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
    const avgStdDev =
      (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;

    // Reject near-black images (average brightness < 15 out of 255)
    if (avgBrightness < 15) {
      return {
        valid: false,
        reason: `Image is too dark (avg brightness: ${avgBrightness.toFixed(1)}/255)`,
      };
    }

    // Reject near-white images (average brightness > 250)
    if (avgBrightness > 250) {
      return {
        valid: false,
        reason: `Image is too bright/white (avg brightness: ${avgBrightness.toFixed(1)}/255)`,
      };
    }

    // Reject solid-color images (very low standard deviation across channels)
    if (avgStdDev < 5) {
      return {
        valid: false,
        reason: `Image appears to be a solid color (avg stdev: ${avgStdDev.toFixed(1)})`,
      };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, reason: `Cannot read image: ${e.message}` };
  }
}

async function fetchProductContext(url) {
  if (!url) return "";
  try {
    console.log(`    -> Fetching product context from: ${url}`);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.substring(0, 3000);
  } catch (e) {
    console.log(`    -> Could not fetch URL context: ${e.message}`);
    return "";
  }
}

async function buildPrompt(category, title, content, imageStyle, apiKey) {
  let cleanTitle = title;
  if (title && title.length > 20) {
    const parts = title.split(" ");
    cleanTitle = parts.slice(0, 3).join(" ");
  }

  const urlMatch = content.match(/affiliateLink:\s*['"]([^'"]+)['"]/i);
  let productUrl = urlMatch ? urlMatch[1] : "";
  if (productUrl.includes("?u=")) {
    try {
      productUrl = decodeURIComponent(productUrl.split("?u=")[1]);
    } catch (e) {}
  }

  // Extract frontmatter metadata for richer context
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/i);
  const useCaseMatch = content.match(/useCase:\s*['"]([^'"]+)['"]/i);
  const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/i);
  const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/i);
  const productCategory = categoryMatch ? categoryMatch[1] : category;
  const productUseCase = useCaseMatch ? useCaseMatch[1] : "";
  const description = descMatch ? descMatch[1] : "";
  const tags = tagsMatch ? tagsMatch[1] : "";

  // ═══════════════════════════════════════════════════════════════
  // RESEARCH REPORTS: Premium editorial covers
  // ═══════════════════════════════════════════════════════════════
  if (category === "research" || imageStyle === "emotional-photography") {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    const promptRequest = [
      `You are an art director for a premium legal-tech publication. Your covers rival Bloomberg Law and Wired magazine.`,
      ``,
      `Create a text-to-image prompt for a 16:9 hero image for this research report:`,
      `Title: "${title}"`,
      description ? `Description: "${description}"` : "",
      tags ? `Topics: ${tags}` : "",
      ``,
      `STYLE REQUIREMENTS:`,
      `- Premium editorial cover that feels like a think-tank whitepaper or journal feature`,
      `- Dramatic cinematic lighting on abstract legal textures: courtroom marble, dark glass, brushed metal, subtle circuit-board or data overlays`,
      `- Bold, minimal typography for the report title`,
      `- Color palette: deep slate, midnight blue, and emerald accents`,
      `- The mood must be authoritative and urgent, as if the reader is about to access exclusive intelligence`,
      `- NO stock-photo humans, NO clip art, NO cheesy metaphors (no gavels, no scales of justice)`,
      `- Think: editorial photojournalism meets data visualization`,
      ``,
      `COMPOSITION SAFE ZONE (critical):`,
      `- ALL visual elements (text, icons, graphics) must sit inside a centered safe zone that occupies roughly 60% of the image width and 50% of the image height`,
      `- Leave generous empty padding on ALL four edges. Nothing should touch or approach the top, bottom, left, or right borders`,
      `- The composition should feel like it "floats" in the center of a large dark canvas with breathing room on every side`,
      `- This image will be cropped by card layouts, so edge content WILL be cut off. Keep everything comfortably inside the center`,
      ``,
      `The image must grab attention in a social media feed and make a solo attorney stop scrolling.`,
      `Respond ONLY with the image generation prompt, nothing else.`,
    ]
      .filter(Boolean)
      .join("\n");

    console.log(
      "\n    -> Asking Gemini to build research report cover prompt...",
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptRequest }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedPrompt) {
        console.log(
          "\n    -> GENERATED PROMPT FROM AI: " + generatedPrompt.trim(),
        );
        return generatedPrompt.trim();
      }
    } else {
      console.error("Gemini error:", await response.text());
    }
    // Fallback
    return `Premium editorial cover image, dramatic cinematic lighting on dark glass and brushed metal surface, bold minimal typography reading "${cleanTitle}", deep slate and emerald color palette, authoritative research report aesthetic, 16:9`;
  }

  // ═══════════════════════════════════════════════════════════════
  // PLAYBOOKS: Editorial product-style thumbnails with reference images
  // ═══════════════════════════════════════════════════════════════
  if (category === "playbooks" || imageStyle === "system-blueprint") {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const parts = [];

    // Load the same reference images used by tools for visual consistency
    try {
      const img1 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_01.png"),
      );
      parts.push({
        inlineData: { data: img1.toString("base64"), mimeType: "image/png" },
      });
      const img2 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_02.png"),
      );
      parts.push({
        inlineData: { data: img2.toString("base64"), mimeType: "image/png" },
      });
      const img3 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_03.png"),
      );
      parts.push({
        inlineData: { data: img3.toString("base64"), mimeType: "image/png" },
      });
    } catch (e) {
      console.log(
        "Failed to attach reference images for playbook. Proceeding without them.",
      );
    }

    const promptRequest = [
      `You are an art director for a premium legal-tech publication. Study the 3 reference images carefully for their visual style, color treatment, composition, and bold simplicity. Your playbook thumbnails must share the same visual DNA as these product images, but with an editorial twist.`,
      ``,
      `Create a text-to-image prompt for a 16:9 hero thumbnail for this automation playbook:`,
      `Title: "${title}"`,
      description ? `Description: "${description}"` : "",
      tags ? `Tools involved: ${tags}` : "",
      ``,
      `STYLE REQUIREMENTS (match the reference images, but editorial):`,
      `- Match the reference images for layout structure, bold icon-driven composition, and color treatment`,
      `- Include the playbook title "${cleanTitle}" as bold, minimal text in the image, vertically centered`,
      `- Use conceptual icons or visual metaphors that represent the workflow or automation topic (gears, pipelines, arrows, connected nodes), NOT specific product logos`,
      `- The mood should feel like an editorial feature or strategy guide, not a product ad`,
      `- Dark, premium backgrounds consistent with the reference style`,
      `- Simple, attention-grabbing, and readable at thumbnail size`,
      `- NO stock-photo humans, NO clip art, NO cheesy metaphors`,
      ``,
      `COMPOSITION SAFE ZONE (critical):`,
      `- ALL visual elements (text, icons, graphics) must sit inside a centered safe zone that occupies roughly 60% of the image width and 50% of the image height`,
      `- Leave generous empty padding on ALL four edges. Nothing should touch or approach the top, bottom, left, or right borders`,
      `- The composition should feel like it "floats" in the center of a large dark canvas with breathing room on every side`,
      `- This image will be cropped by card layouts, so edge content WILL be cut off. Keep everything comfortably inside the center`,
      ``,
      `Think of these as the "editorial companion" to the product thumbnails: same visual family, but positioned as a how-to guide rather than a tool review.`,
      `Respond ONLY with the image generation prompt, nothing else.`,
    ]
      .filter(Boolean)
      .join("\n");

    parts.push({ text: promptRequest });

    console.log(
      "\n    -> Asking Gemini vision to build editorial playbook prompt from reference images...",
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedPrompt) {
        console.log(
          "\n    -> GENERATED PROMPT FROM AI: " + generatedPrompt.trim(),
        );
        return generatedPrompt.trim();
      }
    } else {
      console.error("Gemini error:", await response.text());
    }
    // Fallback
    return `Premium editorial thumbnail, bold minimal typography reading "${cleanTitle}", dark slate background, conceptual automation icons, emerald accents, simple and icon-driven, 16:9`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TOOLS: Vision-based prompt from reference images (existing)
  // ═══════════════════════════════════════════════════════════════
  if (category === "tools" || imageStyle === "tech-thumbnail") {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const parts = [];

    try {
      const img1 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_01.png"),
      );
      parts.push({
        inlineData: { data: img1.toString("base64"), mimeType: "image/png" },
      });
      const img2 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_02.png"),
      );
      parts.push({
        inlineData: { data: img2.toString("base64"), mimeType: "image/png" },
      });
      const img3 = await fs.readFile(
        path.join(process.cwd(), "image_product_reference_03.png"),
      );
      parts.push({
        inlineData: { data: img3.toString("base64"), mimeType: "image/png" },
      });
    } catch (e) {
      console.log(
        "Failed to attach reference images. Proceeding without them.",
      );
    }

    // Fetch real context from the product page
    const productContext = await fetchProductContext(productUrl);

    // MINIMAL INSTRUCTION - let the model decide style and text from reference images + context
    const contextBlock = [
      `Product: ${title}`,
      `Category: ${productCategory}`,
      productUseCase ? `Use case: ${productUseCase}` : "",
      `Product URL: ${productUrl}`,
      productContext
        ? `\nContext scraped from product page:\n${productContext}`
        : "",
      `\nTarget audience: Solo attorneys and small US law firms (1-10 people) looking to automate their practice and buy back billable time.`,
      `\nStudy the 3 reference images for style, aesthetic, and tone. Then create a text-to-image prompt for a hero thumbnail of this software product. The image must include the product name and logo. The image should be simple, attention-grabbing, and communicate what this product does and how it helps the target audience.`,
      ``,
      `COMPOSITION SAFE ZONE (critical): ALL visual elements (text, icons, logos, graphics) must sit inside a centered safe zone that occupies roughly 60% of the image width and 50% of the image height. Leave generous empty padding on ALL four edges. Nothing should touch or approach the top, bottom, left, or right borders. The composition should float in the center of a large dark canvas with breathing room on every side. This image will be cropped by card layouts, so edge content WILL be cut off.`,
      ``,
      `Respond ONLY with the prompt.`,
    ]
      .filter(Boolean)
      .join("\n");

    parts.push({ text: contextBlock });

    console.log(
      "\n    -> Asking Gemini vision to build the prompt from reference images + product context...",
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.1 },
      }),
    });

    if (!response.ok) {
      console.error("Vision error:", await response.text());
    }
    if (response.ok) {
      const data = await response.json();
      const generatedPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Vision raw response:", JSON.stringify(data, null, 2));
      if (generatedPrompt) {
        console.log(
          "\n    -> GENERATED PROMPT FROM AI: " + generatedPrompt.trim(),
        );
        return generatedPrompt.trim();
      }
    }
    return cleanTitle;
  }

  // Fallback for unknown content types
  return `Premium minimalist hero image for "${cleanTitle}", dark slate background, emerald accents, editorial legal-tech aesthetic, 16:9`;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export async function generateGeminiImage(prompt, apiKey, fileName) {
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `\n🎨 Imagen 4.0 Ultra (attempt ${attempt}/${MAX_RETRIES}):\n  -> ${prompt.substring(0, 80)}...`,
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            personGeneration: "ALLOW_ADULT",
            aspectRatio: "16:9",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let base64Data = null;

      if (data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        base64Data = data.candidates[0].content.parts[0].inlineData.data;
      } else if (data?.predictions?.[0]?.bytesBase64Encoded) {
        base64Data = data.predictions[0].bytesBase64Encoded;
      }

      if (!base64Data) {
        throw new Error("No image data returned from API.");
      }

      const buffer = Buffer.from(base64Data, "base64");
      const targetPath = path.join(process.cwd(), "public", "images", fileName);
      await fs.writeFile(targetPath, buffer);

      // Validate the image is not blank, solid-color, or too dark/bright
      const validation = await validateImage(targetPath);
      if (!validation.valid) {
        console.error(`⚠️ Image validation failed: ${validation.reason}`);
        // Delete the bad image so it doesn't get committed
        await fs.unlink(targetPath).catch(() => {});
        throw new Error(`Image validation failed: ${validation.reason}`);
      }

      console.log(`✅ Success! Image saved and validated: /images/${fileName}`);
      return `/images/${fileName}`;
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw new Error(
          `Image generation failed after ${MAX_RETRIES} attempts: ${err.message}`,
        );
      }
    }
  }
}

async function runDirectorySweep() {
  const args = process.argv.slice(2);
  const forceAll = args.includes("--force");
  const noLimit = args.includes("--all");

  // Support --tool, --research, --playbook, or generic --slug to target a specific file
  const toolIdx = args.indexOf("--tool");
  const researchIdx = args.indexOf("--research");
  const playbookIdx = args.indexOf("--playbook");
  const slugIdx = args.indexOf("--slug");
  const targetSlug =
    (toolIdx !== -1 ? args[toolIdx + 1] : null) ||
    (researchIdx !== -1 ? args[researchIdx + 1] : null) ||
    (playbookIdx !== -1 ? args[playbookIdx + 1] : null) ||
    (slugIdx !== -1 ? args[slugIdx + 1] : null);

  // If a category-specific flag is used, only scan that directory
  const targetCategory =
    toolIdx !== -1
      ? "tools"
      : researchIdx !== -1
        ? "research"
        : playbookIdx !== -1
          ? "playbooks"
          : null;

  if (forceAll)
    console.log(
      "🔄 Force mode: regenerating all images regardless of current state.",
    );
  if (targetSlug)
    console.log(
      `🎯 Targeting: ${targetSlug}${targetCategory ? ` (in ${targetCategory})` : ""}`,
    );
  if (noLimit)
    console.log("📦 Processing all matching files (no 1-image limit).");

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("❌ ERROR: No GEMINI_API_KEY found in environment context.");
    process.exit(1);
  }

  const ALL_DIRS = [
    path.join(process.cwd(), "src/content/tools"),
    path.join(process.cwd(), "src/content/research"),
    path.join(process.cwd(), "src/content/playbooks"),
  ];

  // Filter to target category if specified
  const CONTENT_DIRS = targetCategory
    ? ALL_DIRS.filter((d) => path.basename(d) === targetCategory)
    : ALL_DIRS;

  let processCount = 0;

  for (const dir of CONTENT_DIRS) {
    const category = path.basename(dir);
    let files;
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;

      const slug = file.replace(".mdx", "").replace(".md", "");
      if (targetSlug && slug !== targetSlug) continue;

      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, "utf-8");

      const hasPlaceholder = content.includes("images.unsplash.com");
      const shouldProcess = hasPlaceholder || forceAll || targetSlug;

      if (shouldProcess) {
        console.log(
          `\n🔍 Processing: [${category}] ${file}${hasPlaceholder ? " (placeholder found)" : " (force/targeted)"}`,
        );

        const titleMatch =
          content.match(/title:\s*['"]([^'"]+)['"]/i) ||
          content.match(/name:\s*['"]([^'"]+)['"]/i);
        const imageStyleMatch = content.match(
          /imageStyle:\s*['"]([^'"]+)['"]/i,
        );

        const title = titleMatch ? titleMatch[1] : "The Automated Solo";
        const imageStyle = imageStyleMatch ? imageStyleMatch[1] : null;

        const engineeredPrompt = await buildPrompt(
          category,
          title,
          content,
          imageStyle,
          API_KEY,
        );
        const outFileName = `${slug}.png`;

        try {
          const newImagePath = await generateGeminiImage(
            engineeredPrompt,
            API_KEY,
            outFileName,
          );

          // Verify the file actually landed on disk
          const savedPath = path.join(
            process.cwd(),
            "public",
            "images",
            outFileName,
          );
          try {
            await fs.access(savedPath);
          } catch {
            throw new Error(
              `Image file not found at ${savedPath} after generation.`,
            );
          }

          // Update the image path in frontmatter (handles both unsplash URLs and existing local paths)
          const updatedContent = content.replace(
            /image:\s*['"][^'"]+['"]/,
            `image: "${newImagePath}"`,
          );

          await fs.writeFile(filePath, updatedContent, "utf-8");
          console.log(
            `📝 Updated markdown file ${file} with local image link.`,
          );

          processCount++;
          if (!noLimit && !targetSlug && processCount >= 1) {
            console.log(
              "\n🛑 Stopping after 1 test generation to save API tokens. Use --all to process everything.",
            );
            return;
          }
        } catch (err) {
          console.error(
            `\n❌ FAILED to generate image for ${file}: ${err.message}`,
          );
          if (targetSlug) {
            console.error(
              `\n🚫 HARD STOP: Targeted image generation for "${targetSlug}" failed. Do NOT publish without a hero image.`,
            );
            process.exit(1);
          }
        }
      }
    }
  }
}

runDirectorySweep();
