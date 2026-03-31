/**
 * content-lint.mjs
 *
 * Automated content quality gate. Runs in CI before the build step.
 * Checks all MDX files in src/content/ for mechanical violations that
 * agents should catch but sometimes miss due to attention drift.
 *
 * Exit code 0 = all clean
 * Exit code 1 = violations found (blocks the pipeline)
 */

import fs from "fs/promises";
import path from "path";

// ── Banned phrases from AGENTS.md section 7.2 ──────────────────────
// Each entry is lowercased for case-insensitive matching.
const BANNED_PHRASES = [
  "in today's fast-paced world",
  "it's worth noting",
  "let's dive in",
  "game-changer",
  "game changer",
  "seamlessly",
  "robust",
  "leverage",
  "empower",
  "streamline",
  "navigate the complexities",
  "delve into",
  "cutting-edge",
  "cutting edge",
  "comprehensive solution",
  "unlock the potential",
  "revolutionize",
  "utilize",
  "heavy lifting",
  "eye-opening",
  "eye opening",
  "undeniable",
  "effortlessly",
  "noteworthy",
  "remarkable",
  "harness the power",
  "landscape",
  "elevate your",
  "rest assured",
  "look no further",
  "boasts",
  "invaluable",
  "foster",
  "facilitate",
  "pivotal",
  "paramount",
  "myriad",
  "plethora",
  "underscores",
  "stands out",
  "at the end of the day",
  "a wide range of",
  "in conclusion",
];

// Paragraph-opener words that trigger AI detection when starting a paragraph
const BANNED_OPENERS = ["moreover", "furthermore", "additionally", "however"];

// Placeholder markers that must never ship
const PLACEHOLDER_PATTERNS = [
  "[VERIFY]",
  "[TODO]",
  "[PLACEHOLDER]",
  "[TBD]",
  "[INSERT",
];

// Minimum word counts by content type
const MIN_WORDS = {
  tools: 800,
  playbooks: 1200,
  research: 1500,
};

/**
 * Extract prose from MDX: strip frontmatter, import lines, and component tags.
 */
function extractProse(content) {
  // Remove frontmatter
  const fmEnd = content.indexOf("---", 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;

  return (
    body
      // Remove import statements
      .replace(/^import\s+.+$/gm, "")
      // Remove JSX component blocks (self-closing and open/close)
      .replace(/<[A-Z][^>]*\/>/g, "")
      .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
      .replace(/<[A-Z][^>]*>/g, "")
      // Remove markdown images
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Remove markdown links (keep text)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .trim()
  );
}

function countWords(text) {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

async function lintFile(filePath, contentType) {
  const content = await fs.readFile(filePath, "utf-8");
  const prose = extractProse(content);
  const proseLower = prose.toLowerCase();
  const fileName = path.basename(filePath);
  const violations = [];

  // ── Em-dash check ─────────────────────────────────────────────
  // Check raw content (including frontmatter) for em-dash characters
  if (content.includes("\u2014") || content.includes("\u2013")) {
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("\u2014") || lines[i].includes("\u2013")) {
        violations.push(`Line ${i + 1}: Em-dash character found. Rewrite with comma, colon, or split sentence.`);
      }
    }
  }

  // ── Banned phrases ────────────────────────────────────────────
  for (const phrase of BANNED_PHRASES) {
    // Special case: "landscape" only banned in market context
    if (phrase === "landscape") {
      const marketContextPattern = /(?:market|industry|legal|tech|competitive|digital)\s+landscape|landscape\s+(?:of|for|in)/gi;
      const match = prose.match(marketContextPattern);
      if (match) {
        violations.push(`Banned phrase: "${match[0]}" (AI detection trigger)`);
      }
      continue;
    }

    // Special case: "leverage" only banned as verb
    if (phrase === "leverage") {
      const verbPattern = /\bleverag(?:e|ed|es|ing)\b/gi;
      const match = prose.match(verbPattern);
      if (match) {
        violations.push(`Banned phrase: "${match[0]}" used as verb (AI detection trigger)`);
      }
      continue;
    }

    if (proseLower.includes(phrase)) {
      violations.push(`Banned phrase: "${phrase}" (AI detection trigger)`);
    }
  }

  // ── Banned paragraph openers ──────────────────────────────────
  const paragraphs = prose.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const firstWord = trimmed.split(/[\s,]/)[0].toLowerCase().replace(/[^a-z]/g, "");
    if (BANNED_OPENERS.includes(firstWord)) {
      violations.push(`Paragraph starts with "${firstWord}" (banned AI-signature opener): "${trimmed.substring(0, 60)}..."`);
    }
  }

  // ── Placeholder text ──────────────────────────────────────────
  for (const placeholder of PLACEHOLDER_PATTERNS) {
    if (content.includes(placeholder)) {
      violations.push(`Placeholder text found: "${placeholder}"`);
    }
  }

  // ── Minimum word count ────────────────────────────────────────
  const wordCount = countWords(prose);
  const minRequired = MIN_WORDS[contentType] || 800;
  if (wordCount < minRequired) {
    violations.push(`Word count: ${wordCount} (minimum ${minRequired} for ${contentType})`);
  }

  // ── "Solo attorney/practitioner" in first 200 words ───────────
  const first200 = prose.split(/\s+/).slice(0, 200).join(" ").toLowerCase();
  if (
    !first200.includes("solo attorney") &&
    !first200.includes("solo practitioner") &&
    !first200.includes("solo practice")
  ) {
    violations.push(`Missing "solo attorney/practitioner/practice" in first 200 words (SEO requirement)`);
  }

  // ── Frontmatter required fields ───────────────────────────────
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    if (contentType === "tools") {
      const required = ["name", "category", "dealPrice", "affiliateLink", "image"];
      for (const field of required) {
        if (!fm.includes(`${field}:`)) {
          violations.push(`Missing required frontmatter field: ${field}`);
        }
      }
    }
    // Check image path exists
    const imageMatch = fm.match(/image:\s*["']([^"']+)["']/);
    if (imageMatch) {
      const imagePath = path.join(process.cwd(), "public", imageMatch[1]);
      try {
        await fs.access(imagePath);
      } catch {
        violations.push(`Hero image not found: ${imageMatch[1]}`);
      }
    }
  }

  return { file: fileName, violations, wordCount };
}

async function main() {
  const contentDirs = [
    { dir: path.join(process.cwd(), "src/content/tools"), type: "tools" },
    { dir: path.join(process.cwd(), "src/content/playbooks"), type: "playbooks" },
    { dir: path.join(process.cwd(), "src/content/research"), type: "research" },
  ];

  // Allow targeting specific file(s) via --file path/to/file.mdx (repeatable)
  const args = process.argv.slice(2);
  const targetFiles = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) {
      targetFiles.push(args[i + 1]);
      i++;
    }
  }

  let totalViolations = 0;
  let filesChecked = 0;

  console.log("\n📝 Content Lint: Checking all MDX files...\n");

  for (const { dir, type } of contentDirs) {
    let files;
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      const filePath = path.join(dir, file);
      // If specific files are targeted, only lint those
      if (targetFiles.length > 0) {
        const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
        if (!targetFiles.some((t) => relPath.includes(t) || t.includes(file))) continue;
      }

      const result = await lintFile(filePath, type);
      filesChecked++;

      if (result.violations.length > 0) {
        console.log(`❌ ${type}/${result.file} (${result.wordCount} words)`);
        for (const v of result.violations) {
          console.log(`   • ${v}`);
        }
        console.log("");
        totalViolations += result.violations.length;
      } else {
        console.log(`✅ ${type}/${result.file} (${result.wordCount} words)`);
      }
    }
  }

  console.log(`\n── Summary: ${filesChecked} files, ${totalViolations} violations ──\n`);

  if (totalViolations > 0) {
    console.error("🚫 Content lint FAILED. Fix violations before publishing.\n");
    process.exit(1);
  }

  console.log("✅ All content files pass lint checks.\n");
}

main();
