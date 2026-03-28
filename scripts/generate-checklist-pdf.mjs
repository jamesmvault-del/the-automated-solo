/**
 * Generate Automation Readiness Checklist PDF
 *
 * Reads current tool/playbook inventory and produces a professional PDF
 * with dynamic "Next Steps" recommendations per category.
 *
 * Output: public/blueprints/automation-readiness-checklist.pdf
 *
 * Usage: node scripts/generate-checklist-pdf.mjs
 */

import PDFDocument from "pdfkit";
import { createWriteStream, readFileSync, readdirSync } from "fs";
import { join } from "path";

// ── Config ──────────────────────────────────────────────────────────
const siteConfig = JSON.parse(
  readFileSync("src/data/site-config.json", "utf8")
);
const SITE_NAME = siteConfig.site.name;
const SITE_URL = siteConfig.site.url;
const AUTHOR_EMAIL = `james@${SITE_URL}`;
const OUTPUT_PATH = "public/blueprints/automation-readiness-checklist.pdf";

// ── Colors ──────────────────────────────────────────────────────────
const SLATE_950 = "#020617";
const SLATE_800 = "#1e293b";
const SLATE_700 = "#334155";
const SLATE_400 = "#94a3b8";
const SLATE_300 = "#cbd5e1";
const SLATE_100 = "#f1f5f9";
const EMERALD_400 = "#34d399";
const EMERALD_600 = "#059669";
const WHITE = "#ffffff";

// ── Content inventory ───────────────────────────────────────────────
function getContentInventory() {
  const tools = [];
  const playbooks = [];

  const toolsDir = "src/content/tools";
  const playbooksDir = "src/content/playbooks";

  for (const file of readdirSync(toolsDir).filter((f) => f.endsWith(".mdx"))) {
    const content = readFileSync(join(toolsDir, file), "utf8");
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || "";
    const name = fm.match(/name:\s*"?([^"\n]+)"?/)?.[1] || file;
    const category = fm.match(/category:\s*"?([^"\n]+)"?/)?.[1] || "";
    const slug = file.replace(/\.mdx$/, "");
    const useCase = fm.match(/useCase:\s*"?([^"\n]+)"?/)?.[1] || "";
    tools.push({ name, category, slug, useCase });
  }

  for (const file of readdirSync(playbooksDir).filter((f) =>
    f.endsWith(".mdx")
  )) {
    const content = readFileSync(join(playbooksDir, file), "utf8");
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || "";
    const title = fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] || file;
    const slug = file.replace(/\.mdx$/, "");
    const desc =
      fm.match(/description:\s*"?([^"\n]+)"?/)?.[1] || "";
    playbooks.push({ title, slug, description: desc });
  }

  return { tools, playbooks };
}

// ── Category mapping ────────────────────────────────────────────────
// Maps checklist categories to tool categories and relevant playbook keywords
const CATEGORY_MAP = {
  "Client Intake": {
    toolCategories: ["Intake & Scheduling", "Case Management"],
    playbookKeywords: ["intake"],
  },
  "Scheduling & Calendar": {
    toolCategories: ["Intake & Scheduling"],
    playbookKeywords: ["scheduling", "calendar"],
  },
  "Document Drafting & Email": {
    toolCategories: ["Drafting", "Document Automation", "Communication"],
    playbookKeywords: ["drafting", "email", "template"],
  },
  "Client Communication": {
    toolCategories: ["Marketing", "Communication"],
    playbookKeywords: ["referral", "nurturing", "follow-up", "email"],
  },
  "Billing & Financial": {
    toolCategories: ["Billing"],
    playbookKeywords: ["billing", "invoice", "payment"],
  },
};

function getRecommendations(inventory) {
  const recommendations = {};

  for (const [category, mapping] of Object.entries(CATEGORY_MAP)) {
    const matchedTool = inventory.tools.find((t) =>
      mapping.toolCategories.includes(t.category)
    );
    const matchedPlaybook = inventory.playbooks.find((p) =>
      mapping.playbookKeywords.some(
        (kw) =>
          p.slug.includes(kw) ||
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw)
      )
    );

    const recs = [];
    if (matchedPlaybook) {
      recs.push({
        type: "playbook",
        label: matchedPlaybook.title,
        url: `${SITE_URL}/playbooks/${matchedPlaybook.slug}`,
      });
    }
    if (matchedTool) {
      recs.push({
        type: "tool",
        label: `${matchedTool.name} Review`,
        url: `${SITE_URL}/tools/${matchedTool.slug}`,
      });
    }

    recommendations[category] = recs;
  }

  return recommendations;
}

// ── Checklist questions ─────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Client Intake",
    questions: [
      "New leads can submit information through an online form (not just phone or email).",
      "Form submissions automatically create a contact record in your case management software.",
      "You have duplicate detection so the same client does not get entered twice.",
      "New leads receive an automatic confirmation email or text within 5 minutes.",
      "Your intake form uses conditional logic to route different practice areas to different workflows.",
    ],
  },
  {
    name: "Scheduling & Calendar",
    questions: [
      "Clients can book consultations directly from your website without calling or emailing.",
      "Your booking tool automatically sends calendar invites with meeting details.",
      "Clients receive automated reminders 24 hours and 1 hour before their appointment.",
      "No-shows automatically trigger a follow-up email or text offering to reschedule.",
      "Your calendar blocks off prep time before and after consultations automatically.",
    ],
  },
  {
    name: "Document Drafting & Email",
    questions: [
      "You use text expansion or templates for emails you send more than twice a week.",
      "Engagement letters and retainer agreements generate from templates with client data auto-filled.",
      "You have saved reply templates for your five most common client questions.",
      "Court filing cover sheets or routine correspondence pull from client data automatically.",
      "Your email signature, disclaimers, and disclosures are standardized across all outgoing communication.",
    ],
  },
  {
    name: "Client Communication",
    questions: [
      "Past clients receive at least one follow-up email within 90 days of case closure.",
      "You have an automated drip sequence (2-3 emails) for past client nurturing.",
      "Your firm sends a regular newsletter or legal update to your contact list.",
      "You have a system to collect Google reviews or testimonials after case resolution.",
      "Referral sources are tracked so you know which past clients generate new business.",
    ],
  },
  {
    name: "Billing & Financial",
    questions: [
      "Time entries are captured in real time, not reconstructed from memory at end of day.",
      "Invoices are generated and sent automatically on a set schedule.",
      "Clients can pay invoices online through a link in the invoice email.",
      "Overdue invoices trigger an automatic reminder sequence.",
      "Trust account reconciliation reports run automatically or with a single click.",
    ],
  },
];

// ── PDF Generation ──────────────────────────────────────────────────
function generatePDF(recommendations) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 60, bottom: 60, left: 55, right: 55 },
    info: {
      Title: "Solo Practice Automation Readiness Checklist",
      Author: SITE_NAME,
      Subject:
        "Score your firm across 25 questions covering intake, scheduling, drafting, client nurturing, and billing.",
      Creator: SITE_NAME,
    },
  });

  const stream = createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // ── Helper functions ──────────────────────────────────────────
  function checkPageSpace(needed) {
    const remaining =
      doc.page.height - doc.page.margins.bottom - doc.y;
    if (remaining < needed) {
      doc.addPage();
    }
  }

  function drawHorizontalRule(color = SLATE_700, thickness = 0.5) {
    doc
      .strokeColor(color)
      .lineWidth(thickness)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(0.5);
  }

  function drawCheckbox(x, y) {
    const size = 11;
    doc
      .strokeColor(SLATE_700)
      .lineWidth(1.2)
      .roundedRect(x, y + 2, size, size, 2)
      .stroke();
    return size + 8;
  }

  // ── Cover / Header ────────────────────────────────────────────

  // Top accent bar
  doc
    .rect(0, 0, doc.page.width, 4)
    .fill(EMERALD_400);

  doc.moveDown(1.5);

  // Site name
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(SLATE_400)
    .text(SITE_NAME.toUpperCase(), { align: "center", characterSpacing: 3 });

  doc.moveDown(0.8);

  // Title
  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(SLATE_950)
    .text("Automation Readiness", { align: "center" });
  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(EMERALD_600)
    .text("Checklist", { align: "center" });

  doc.moveDown(0.6);

  // Subtitle
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(SLATE_400)
    .text(
      "Score your firm across 25 questions. Five minutes. Print it, grab a pen, check the boxes.",
      { align: "center", width: pageWidth * 0.75, indent: pageWidth * 0.125 }
    );

  doc.moveDown(1.2);
  drawHorizontalRule(EMERALD_400, 1);
  doc.moveDown(0.3);

  // Instructions box
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(SLATE_950)
    .text("HOW TO USE THIS CHECKLIST", { continued: false });
  doc.moveDown(0.3);
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(SLATE_700)
    .text(
      "For each statement below, check the box if your firm has it fully handled. Skip anything that does not apply to your practice area. Count your checked boxes at the end and find your score in the results section.",
      { lineGap: 2 }
    );

  doc.moveDown(1.2);

  // ── Category sections ─────────────────────────────────────────
  let questionNum = 1;

  for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
    const cat = CATEGORIES[catIdx];

    // Each category needs roughly 140px minimum
    checkPageSpace(140);

    // Category header
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(EMERALD_600)
      .text(`${catIdx + 1}`.padStart(2, "0"), {
        continued: true,
        width: 22,
      });
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(SLATE_950)
      .text(`  ${cat.name.toUpperCase()}`, { characterSpacing: 1.5 });

    doc.moveDown(0.5);

    // Questions
    for (const question of cat.questions) {
      checkPageSpace(30);

      const x = doc.page.margins.left;
      const y = doc.y;

      // Checkbox
      const offset = drawCheckbox(x, y);

      // Question text
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(SLATE_700)
        .text(question, x + offset + 18, y + 1, {
          width: pageWidth - offset - 18,
          lineGap: 1.5,
        });

      // Question number (small, right-aligned to checkbox area)
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(SLATE_400)
        .text(`${questionNum}`, x + 15, y + 4, {
          width: 12,
          align: "right",
        });

      questionNum++;
      doc.y = Math.max(doc.y, y + 20);
      doc.moveDown(0.4);
    }

    // Recommendations for this category
    const recs = recommendations[cat.name] || [];
    if (recs.length > 0) {
      doc.moveDown(0.2);
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(EMERALD_600)
        .text("IF YOU SCORED LOW HERE:", doc.page.margins.left + 30);
      for (const rec of recs) {
        const icon = rec.type === "playbook" ? "Read" : "Review";
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(SLATE_400)
          .text(
            `${icon}: ${rec.label}`,
            doc.page.margins.left + 30,
            undefined,
            { link: `https://${rec.url}` }
          );
      }
    }

    doc.moveDown(1);
  }

  // ── Scoring section ───────────────────────────────────────────
  checkPageSpace(200);
  drawHorizontalRule(EMERALD_400, 1);
  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(SLATE_950)
    .text("YOUR SCORE", { align: "center" });

  doc.moveDown(0.3);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(SLATE_700)
    .text("Total boxes checked:  _______ / 25", { align: "center" });

  doc.moveDown(1);

  const scores = [
    {
      range: "21 - 25",
      label: "Advanced",
      color: EMERALD_600,
      text: "Your firm is highly automated. Focus on optimization and AI integration next.",
    },
    {
      range: "15 - 20",
      label: "Intermediate",
      color: "#2563eb",
      text: "Strong foundation with clear gaps costing you hours every week. Target your weakest category first.",
    },
    {
      range: "8 - 14",
      label: "Early Stage",
      color: "#d97706",
      text: "You are leaving significant revenue on the table. Start with intake and scheduling for the highest immediate payoff.",
    },
    {
      range: "0 - 7",
      label: "Manual",
      color: "#dc2626",
      text: "Nearly everything could benefit from automation. The good news: you have the most to gain. Start with one playbook.",
    },
  ];

  for (const score of scores) {
    checkPageSpace(45);

    const x = doc.page.margins.left;
    const y = doc.y;

    // Score range badge
    doc
      .roundedRect(x, y, 50, 22, 4)
      .fill(score.color);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(WHITE)
      .text(score.range, x + 2, y + 6, { width: 46, align: "center" });

    // Label and description
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(SLATE_950)
      .text(score.label, x + 60, y + 2);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(SLATE_700)
      .text(score.text, x + 60, undefined, {
        width: pageWidth - 60,
        lineGap: 1,
      });

    doc.y = Math.max(doc.y, y + 28);
    doc.moveDown(0.6);
  }

  // ── Footer ────────────────────────────────────────────────────
  checkPageSpace(80);
  doc.moveDown(1);
  drawHorizontalRule(SLATE_700, 0.5);
  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(SLATE_400)
    .text(
      `Calculate your exact annual savings: ${SITE_URL}/calculator`,
      { align: "center", link: `https://${SITE_URL}/calculator` }
    );

  doc.moveDown(0.5);

  const genDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(SLATE_400)
    .text(
      `Generated ${genDate}  |  ${SITE_URL}  |  Free to distribute.`,
      { align: "center" }
    );

  // ── Finish ────────────────────────────────────────────────────
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const inventory = getContentInventory();
  console.log(
    `Found ${inventory.tools.length} tools, ${inventory.playbooks.length} playbooks`
  );

  const recommendations = getRecommendations(inventory);
  for (const [cat, recs] of Object.entries(recommendations)) {
    if (recs.length > 0) {
      console.log(`  ${cat}: ${recs.map((r) => r.label).join(", ")}`);
    } else {
      console.log(`  ${cat}: (no matching content yet)`);
    }
  }

  await generatePDF(recommendations);
  console.log(`\nPDF generated: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
