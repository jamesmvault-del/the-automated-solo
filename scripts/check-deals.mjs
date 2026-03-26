/**
 * Deal Health Check Script
 *
 * Reads all tool MDX files, extracts affiliate links, and checks
 * whether the AppSumo product pages are still live.
 *
 * Output: JSON to stdout with status of each tool.
 * Exit code 0: all deals healthy
 * Exit code 1: one or more deals have issues
 *
 * Usage: node scripts/check-deals.mjs
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

const TOOLS_DIR = "src/content/tools";

async function parseFrontmatter(filePath) {
  const content = await readFile(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

function extractProductUrl(affiliateLink) {
  try {
    const url = new URL(affiliateLink);
    const encoded = url.searchParams.get("u");
    return encoded ? decodeURIComponent(encoded) : null;
  } catch {
    return null;
  }
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "TheAutomatedSolo-DealChecker/1.0",
      },
    });
    clearTimeout(timeout);

    return {
      status: res.status,
      ok: res.ok,
      redirected: res.redirected,
      finalUrl: res.url,
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      status: 0,
      ok: false,
      redirected: false,
      error: err.message,
    };
  }
}

async function main() {
  const files = (await readdir(TOOLS_DIR)).filter((f) => f.endsWith(".mdx"));
  const results = [];
  let hasIssues = false;

  for (const file of files) {
    const filePath = join(TOOLS_DIR, file);
    const fm = await parseFrontmatter(filePath);

    if (!fm || !fm.affiliateLink) {
      results.push({
        file,
        name: fm?.name || file,
        status: "error",
        reason: "Missing affiliate link in frontmatter",
      });
      hasIssues = true;
      continue;
    }

    const productUrl = extractProductUrl(fm.affiliateLink);
    if (!productUrl) {
      results.push({
        file,
        name: fm.name,
        status: "error",
        reason: "Could not parse product URL from affiliate link",
      });
      hasIssues = true;
      continue;
    }

    // Check if the product URL already points to search (fallback mode)
    const isAlreadyFallback = productUrl.includes("software-search");

    const check = await checkUrl(productUrl);

    // Determine health
    let status = "healthy";
    let reason = `HTTP ${check.status}`;

    if (!check.ok) {
      status = "dead";
      reason = check.error || `HTTP ${check.status}`;
      hasIssues = true;
    } else if (check.redirected && check.finalUrl.includes("software-search")) {
      status = "expired";
      reason = `Redirected to search page: ${check.finalUrl}`;
      hasIssues = true;
    } else if (isAlreadyFallback) {
      status = "fallback";
      reason = "Already using search fallback link (deal previously expired)";
    }

    results.push({
      file,
      name: fm.name,
      productUrl,
      dealPrice: fm.dealPrice,
      dealType: fm.dealType,
      status,
      reason,
      httpStatus: check.status,
    });
  }

  // Output
  const output = {
    checkedAt: new Date().toISOString(),
    totalTools: results.length,
    healthy: results.filter((r) => r.status === "healthy").length,
    issues: results.filter((r) => !["healthy", "fallback"].includes(r.status))
      .length,
    results,
  };

  console.log(JSON.stringify(output, null, 2));

  return hasIssues ? 1 : 0;
}

main().then((code) => process.exit(code));
