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

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const siteConfig = JSON.parse(
  readFileSync("src/data/site-config.json", "utf8"),
);
const SITE_NAME = siteConfig.site.name;
const SITE_URL = siteConfig.site.url;
const AUTHOR_EMAIL = `james@${SITE_URL}`;
const OUTPUT_PATH = "public/blueprints/automation-readiness-checklist.pdf";

// â”€â”€ Colors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SLATE_950 = "#020617";
const SLATE_800 = "#1e293b";
const SLATE_700 = "#334155";
const SLATE_400 = "#94a3b8";
const SLATE_300 = "#cbd5e1";
const SLATE_100 = "#f1f5f9";
const EMERALD_400 = "#34d399";
const EMERALD_600 = "#059669";
const WHITE = "#ffffff";

// â”€â”€ Content inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    f.endsWith(".mdx"),
  )) {
    const content = readFileSync(join(playbooksDir, file), "utf8");
    const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || "";
    const title = fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] || file;
    const slug = file.replace(/\.mdx$/, "");
    const desc = fm.match(/description:\s*"?([^"\n]+)"?/)?.[1] || "";
    playbooks.push({ title, slug, description: desc });
  }

  return { tools, playbooks };
}

// â”€â”€ Category mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      mapping.toolCategories.includes(t.category),
    );
    const matchedPlaybook = inventory.playbooks.find((p) =>
      mapping.playbookKeywords.some(
        (kw) =>
          p.slug.includes(kw) ||
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw),
      ),
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

// â”€â”€ Checklist questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ PDF Generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function generatePDF(recommendations) {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
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

  // Enable interactive form fields
  doc.initForm();

  const LEFT = doc.page.margins.left;
  const RIGHT_EDGE = doc.page.width - doc.page.margins.right;
  const pageWidth = RIGHT_EDGE - LEFT;
  const FULL_W = doc.page.width;
  const CENTER_X = FULL_W / 2;

  // ── Checkbox appearance streams ────────────────────────────────
  // PDFKit sets NeedAppearances=true but most viewers (Chrome, Edge,
  // Foxit, Preview) ignore it. We embed explicit AP streams so the
  // checkmarks render and toggle in ALL PDF viewers.
  const CB = 13; // checkbox size in points

  // ZapfDingbats font for the checkmark glyph
  const zapfRef = doc.ref({
    Type: "Font",
    Subtype: "Type1",
    BaseFont: "ZapfDingbats",
  });
  zapfRef.end();

  // "Off" state: white box with gray border
  const apOff = doc.ref({
    Type: "XObject",
    Subtype: "Form",
    BBox: [0, 0, CB, CB],
    Resources: {},
  });
  apOff.end(
    Buffer.from(
      [
        "q",
        "1 1 1 rg",
        `0 0 ${CB} ${CB} re f`,
        "0.58 0.64 0.69 RG",
        "0.75 w",
        `0.5 0.5 ${CB - 1} ${CB - 1} re S`,
        "Q",
      ].join(" "),
    ),
  );

  // "Yes" state: white box with emerald border and checkmark
  const apYes = doc.ref({
    Type: "XObject",
    Subtype: "Form",
    BBox: [0, 0, CB, CB],
    Resources: { Font: { ZaDb: zapfRef } },
  });
  apYes.end(
    Buffer.from(
      [
        "q",
        "1 1 1 rg",
        `0 0 ${CB} ${CB} re f`,
        "0.02 0.59 0.41 RG",
        "1.5 w",
        `0.5 0.5 ${CB - 1} ${CB - 1} re S`,
        "0.02 0.59 0.41 rg",
        "BT",
        `/ZaDb ${Math.round(CB * 0.85)} Tf`,
        `${Math.round(CB * 0.14)} ${Math.round(CB * 0.2)} Td`,
        "(4) Tj",
        "ET",
        "Q",
      ].join(" "),
    ),
  );

  // ── Auto-calculation JavaScript action ─────────────────────────
  // Embedded as an AA (Additional Actions) entry on each checkbox
  // so Acrobat fires calcScore() on every toggle. More reliable
  // than addNamedJavaScript + setAction("MouseUp", ...) which
  // requires the doc-level script to execute first.
  const calcJS = [
    "function calcScore() {",
    "  var s = 0;",
    "  for (var i = 1; i <= 25; i++) {",
    '    var f = this.getField("q" + i);',
    '    if (f && f.value !== "Off") s++;',
    "  }",
    '  var sf = this.getField("score");',
    '  if (sf) sf.value = s + " / 25";',
    '  var lf = this.getField("level");',
    "  if (lf) {",
    '    if (s >= 21) lf.value = "Advanced: AI integration is your next move.";',
    '    else if (s >= 15) lf.value = "Intermediate: Target your weakest category.";',
    '    else if (s >= 8) lf.value = "Early Stage: Start with intake & scheduling.";',
    '    else if (s > 0) lf.value = "Manual: Pick one playbook and start today.";',
    '    else lf.value = "Check boxes to calculate";',
    "  }",
    "}",
    "calcScore();",
  ].join("\n");

  const jsActionRef = doc.ref({
    Type: "Action",
    S: "JavaScript",
    JS: new String(calcJS),
  });
  jsActionRef.end();

  // Checkbox options with embedded appearance streams.
  // Passed directly to formCheckbox so AP is in the dict
  // BEFORE PDFKit calls ref.end() (which finalizes the object).
  // AA.V fires the JavaScript action on every value change.
  const cbOpts = {
    backgroundColor: [1, 1, 1],
    borderColor: [0.58, 0.64, 0.69],
    AP: { N: { Yes: apYes, Off: apOff } },
    AS: "Off",
    V: "Off",
    MK: { CA: "4" },
    AA: { V: jsActionRef },
  };

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function checkPageSpace(needed) {
    const remaining = doc.page.height - doc.page.margins.bottom - doc.y;
    if (remaining < needed) {
      doc.addPage();
      doc
        .strokeColor(EMERALD_400)
        .lineWidth(0.75)
        .moveTo(LEFT, doc.page.margins.top)
        .lineTo(RIGHT_EDGE, doc.page.margins.top)
        .stroke();
      doc.y = doc.page.margins.top + 12;
    }
  }

  // â”€â”€ PAGE 1: HEADER BAND â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Top emerald accent (full bleed)
  doc.rect(0, 0, FULL_W, 5).fill(EMERALD_400);

  // Dark header band
  const hTop = 5;
  const hHeight = 155;
  doc.rect(0, hTop, FULL_W, hHeight).fill(SLATE_950);

  // Site name (use full page width for perfect centering)
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(SLATE_400)
    .text(SITE_NAME.toUpperCase(), 0, hTop + 32, {
      align: "center",
      width: FULL_W,
      characterSpacing: 5,
    });

  // Title line 1
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(WHITE)
    .text("Automation Readiness", 0, hTop + 56, {
      align: "center",
      width: FULL_W,
    });

  // Title line 2 (emerald accent)
  doc
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor(EMERALD_400)
    .text("Checklist", 0, hTop + 86, {
      align: "center",
      width: FULL_W,
    });

  // Subtitle
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(SLATE_300)
    .text(
      "25 questions  \u00B7  Five minutes  \u00B7  Print it, grab a pen, check the boxes.",
      0,
      hTop + 122,
      { align: "center", width: FULL_W },
    );

  // Bottom emerald accent
  doc.rect(0, hTop + hHeight, FULL_W, 3).fill(EMERALD_400);

  doc.y = hTop + hHeight + 26;

  // â”€â”€ INSTRUCTIONS BOX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const instrY = doc.y;
  const instrPad = 14;

  // Rounded background
  doc.roundedRect(LEFT, instrY, pageWidth, 50, 5).fill(SLATE_100);

  // Left emerald accent bar inside the box
  doc.roundedRect(LEFT, instrY, 4, 50, 2).fill(EMERALD_600);

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(SLATE_800)
    .text("HOW TO USE THIS CHECKLIST", LEFT + instrPad + 4, instrY + 8, {
      width: pageWidth - instrPad * 2,
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(SLATE_700)
    .text(
      "Check each box your firm has fully handled. Skip anything outside your practice area. Your score updates automatically in Adobe Reader, or tally manually and check the results section.",
      LEFT + instrPad + 4,
      instrY + 22,
      { width: pageWidth - instrPad * 2 - 4, lineGap: 2 },
    );

  doc.y = instrY + 62;

  // â”€â”€ CATEGORY SECTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let questionNum = 1;

  for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
    const cat = CATEGORIES[catIdx];
    const recs = recommendations[cat.name] || [];
    const recSpace = recs.length > 0 ? 38 + recs.length * 14 : 0;

    checkPageSpace(40 + cat.questions.length * 28 + recSpace + 20);

    const secY = doc.y;

    // Category number badge (emerald circle)
    const badgeR = 12;
    const badgeCX = LEFT + badgeR;
    const badgeCY = secY + badgeR;
    doc.circle(badgeCX, badgeCY, badgeR).fill(EMERALD_600);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(WHITE)
      .text(`${catIdx + 1}`, badgeCX - badgeR, badgeCY - 6, {
        width: badgeR * 2,
        align: "center",
      });

    // Category name (positioned right of badge, vertically centered)
    const nameX = LEFT + badgeR * 2 + 14;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(SLATE_950)
      .text(cat.name.toUpperCase(), nameX, secY + 5, {
        characterSpacing: 1.2,
        width: RIGHT_EDGE - nameX,
      });

    // Divider line
    const divY = secY + badgeR * 2 + 6;
    doc
      .strokeColor(SLATE_300)
      .lineWidth(0.5)
      .moveTo(LEFT, divY)
      .lineTo(RIGHT_EDGE, divY)
      .stroke();

    doc.y = divY + 12;

    // Questions with interactive checkboxes
    for (const question of cat.questions) {
      checkPageSpace(30);
      const qY = doc.y;
      const cbX = LEFT + 10;
      const cbSize = 13;

      // Interactive form checkbox (tickable in all PDF viewers)
      doc.formCheckbox(`q${questionNum}`, cbX, qY, cbSize, cbSize, cbOpts);

      // Small question number
      doc
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor(SLATE_400)
        .text(`${questionNum}`, cbX + cbSize + 5, qY + 3.5, { width: 14 });

      // Question text
      const txtX = cbX + cbSize + 22;
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(SLATE_700)
        .text(question, txtX, qY + 1, {
          width: RIGHT_EDGE - txtX,
          lineGap: 1.5,
        });

      questionNum++;
      doc.y = Math.max(doc.y, qY + 20);
      doc.moveDown(0.4);
    }

    // Recommendations
    if (recs.length > 0) {
      doc.moveDown(0.3);
      const recY = doc.y;
      const recLeft = LEFT + 36;

      doc.circle(recLeft - 8, recY + 5, 2.5).fill(EMERALD_400);

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(EMERALD_600)
        .text("SCORED LOW? START HERE:", recLeft, recY, {
          width: pageWidth - 36,
        });

      doc.moveDown(0.2);

      for (const rec of recs) {
        const prefix = rec.type === "playbook" ? "Playbook:" : "Review:";
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(SLATE_700)
          .text(`${prefix}  `, recLeft, doc.y, { continued: true })
          .fillColor("#2563eb")
          .text(rec.label, { link: `https://${rec.url}`, underline: true });
      }
    }

    doc.moveDown(1.5);
  }

  // â”€â”€ SCORE SECTION (dark band) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  checkPageSpace(260);

  const scoreTop = doc.y;
  const scoreBandH = 240;

  // Dark background
  doc.rect(0, scoreTop, FULL_W, scoreBandH).fill(SLATE_950);
  // Top emerald accent
  doc.rect(0, scoreTop, FULL_W, 3).fill(EMERALD_400);

  // Section title (centered on full page width)
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(WHITE)
    .text("YOUR SCORE", 0, scoreTop + 22, {
      align: "center",
      width: FULL_W,
    });

  // Interactive score display text field
  const sfW = 130;
  const sfH = 32;
  const sfX = CENTER_X - sfW / 2;
  const sfY = scoreTop + 52;

  // Switch to the AcroForm default font (Helvetica) so _resolveFont
  // does NOT overwrite our custom DA color strings.
  doc.font("Helvetica");

  doc.formText("score", sfX, sfY, sfW, sfH, {
    value: "0 / 25",
    readOnly: true,
    align: "center",
    fontSize: 18,
    backgroundColor: [0.12, 0.15, 0.23],
    borderColor: [0.2, 0.83, 0.6],
    // PDFKit hardcodes "0 g" (black) in the DA string, ignoring
    // the color option. Override DA directly with emerald RGB.
    DA: new String("/Helvetica 18 Tf 0.2 0.83 0.6 rg"),
  });

  // Level indicator text field
  const lfW = 220;
  const lfH = 18;
  const lfX = CENTER_X - lfW / 2;
  const lfY = sfY + sfH + 6;

  doc.formText("level", lfX, lfY, lfW, lfH, {
    value: "Check boxes to calculate",
    readOnly: true,
    align: "center",
    fontSize: 8.5,
    backgroundColor: [0.12, 0.15, 0.23],
    borderColor: [0.12, 0.15, 0.23],
    DA: new String("/Helvetica 8.5 Tf 0.58 0.64 0.69 rg"),
  });

  // Score tiers (2x2 grid)
  const tiers = [
    {
      range: "21-25",
      label: "Advanced",
      color: EMERALD_400,
      desc: "Highly automated. Focus on AI integration and optimization next.",
    },
    {
      range: "15-20",
      label: "Intermediate",
      color: "#60a5fa",
      desc: "Strong foundation. Target your weakest category first.",
    },
    {
      range: "8-14",
      label: "Early Stage",
      color: "#fbbf24",
      desc: "Hours lost weekly. Start with intake and scheduling.",
    },
    {
      range: "0-7",
      label: "Manual",
      color: "#f87171",
      desc: "Most to gain. Pick one playbook and start today.",
    },
  ];

  let gridY = lfY + lfH + 20;
  const colW = (pageWidth - 24) / 2;

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    const col = i % 2;
    const tX = LEFT + col * (colW + 24);

    // Colored pill
    doc.roundedRect(tX, gridY, 44, 18, 9).fill(t.color);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(SLATE_950)
      .text(t.range, tX, gridY + 5, { width: 44, align: "center" });

    // Label + description
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(WHITE)
      .text(t.label, tX + 52, gridY + 1, { width: colW - 52 });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(SLATE_400)
      .text(t.desc, tX + 52, gridY + 13, {
        width: colW - 52,
        lineGap: 1,
      });

    if (col === 1) gridY += 48;
  }

  doc.y = scoreTop + scoreBandH + 16;

  // â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  checkPageSpace(50);

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(EMERALD_600)
    .text(
      `Calculate your exact annual savings \u2192 ${SITE_URL}/calculator`,
      0,
      doc.y,
      {
        align: "center",
        width: FULL_W,
        link: `https://${SITE_URL}/calculator`,
      },
    );

  doc.moveDown(0.6);

  const genDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(SLATE_400)
    .text(
      `Generated ${genDate}  |  ${SITE_URL}  |  Free to distribute.`,
      0,
      doc.y,
      { align: "center", width: FULL_W },
    );

  // JavaScript is embedded via AA on each checkbox (see cbOpts above).
  // No addNamedJavaScript needed; AA.V fires on every checkbox toggle.

  // â”€â”€ FINISH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function main() {
  const inventory = getContentInventory();
  console.log(
    `Found ${inventory.tools.length} tools, ${inventory.playbooks.length} playbooks`,
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
