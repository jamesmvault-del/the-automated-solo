# Niche Adaptation Checklist

This checklist is a complete, step-by-step guide for an agent (or human) to re-skin this entire PWA for a new niche. The current niche is "The Automated Solo" (solo attorney automation). Every file listed below contains niche-specific branding, copy, or logic that must be updated.

**Goal:** Zero traces of the original niche after completion. Every customer-facing page, agent instruction, workflow, script, blueprint, and metadata file must reflect the new brand.

---

## Pre-Work: Gather New Niche Details

Before editing any file, the adapter must define these values. Fill them in and reference them throughout.

| Variable                     | Current Value                                                                                                          | New Value |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| **Site Name**                | The Automated Solo                                                                                                     |           |
| **Domain**                   | theautomatedsolo.com                                                                                                   |           |
| **Tagline/Hook**             | Billable Freedom. Automation tested for the Solo Practitioner.                                                         |           |
| **Target Audience**          | US-based Solo Practitioners and Boutique Law Firms (1-10 employees)                                                    |           |
| **Author Name**              | James                                                                                                                  |           |
| **Author Title**             | Lead Systems Architect / Chief Tester                                                                                  |           |
| **Author Email**             | james@theautomatedsolo.com                                                                                             |           |
| **Author Perspective**       | "buying back billable time"                                                                                            |           |
| **Niche Expertise**          | Law firm automation, legal tech, AI for attorneys                                                                      |           |
| **Affiliate Platform**       | AppSumo (Impact Radius)                                                                                                |           |
| **Affiliate Deep Link Base** | `https://appsumo.8odi.net/c/6618781/416948/7443?u=`                                                                    |           |
| **Affiliate Publisher ID**   | 6618781                                                                                                                |           |
| **Affiliate Ad ID**          | 416948                                                                                                                 |           |
| **Affiliate Advertiser ID**  | 7443                                                                                                                   |           |
| **SaaS Partners**            | Clio, MyCase, Spellbook                                                                                                |           |
| **Tool Categories**          | Intake & Scheduling, Drafting, Marketing, Case Management, Billing, Document Automation, Legal Research, Communication |           |
| **PWA Short Name**           | AutoSolo                                                                                                               |           |
| **Color Palette**            | slate-950 bg, emerald-400 accent                                                                                       |           |
| **Design Metaphors**         | Dark glass, brushed slate, courtroom marble                                                                            |           |
| **Image Ref Aesthetic**      | "Bloomberg Law meets Wired magazine"                                                                                   |           |
| **Nav Labels (Main)**        | About the Lab, Research, Playbooks, Software Index                                                                     |           |
| **Nav Labels (Footer)**      | About Us, Research, Privacy Policy, Terms of Service                                                                   |           |
| **Package Name**             | the-automated-solo                                                                                                     |           |

---

## Phase 1: Core Identity Files

These files define the brand for all agents and workflows. Update them first so all downstream work inherits the new identity.

### 1.1 `AGENTS.md` (root)

The file is organized into 9 numbered sections. Update each:

- [ ] **Section 1 (What This Project Is):** Replace site name, URL, audience, hook, perspective, monetization partners, stack description
- [ ] **Section 2 (Voice Rules):** Rewrite brand voice and author voice examples with new niche language. Update author name. Update the "Apply this voice to" scope note.
- [ ] **Section 3 (Absolute Rules):** Update 3.3 (AI detection) with new author's style reference. Update 3.4 (Active Deals) with new affiliate platform if different. Update 3.5 (Factual Accuracy) audience reference (currently: "Our readers are attorneys"). Update 3.6 (Geographic Neutrality) if new niche has a different geographic focus.
- [ ] **Section 4 (Affiliate Links):** Replace deep link format, publisher ID, ad ID, advertiser ID. Update fallback URL pattern. Update FTC disclosure component references if renamed.
- [ ] **Section 5 (Design & Technical):** Rewrite 5.1 aesthetic (visual language, color palette, typography). Update 5.5 image generation table with new niche-appropriate styles for all 3 content types.
- [ ] **Section 6 (Free Resources):** Update 6.1 signals with new niche examples. Update 6.5 existing resources list (will be empty after Phase 7 content deletion).
- [ ] **Section 7 (AI Detection):** Rewrite 7.1 voice patterns with new author's patterns. Review 7.2 banned phrases (keep or adjust). Review 7.3 anti-patterns (mostly generic, keep as-is).
- [ ] **Section 8 (Development Rules):** Mostly generic. Keep as-is unless changing dev workflow.
- [ ] **Section 9 (Content Pipeline):** Update 9.1 rotation description. Update 9.2 component table if adding/removing components. Update 9.3 content locations if renaming directories.
- [ ] Remove or replace all "billable," "legal," "law firm," "attorney," "lawyer," "solo practitioner" references
- [ ] Verify zero em-dash characters remain (keep this rule or remove if not needed for new niche)

### 1.2 `.github/copilot-instructions.md`

- [ ] Replace site name and URL in header
- [ ] Update "Critical Rules" section with new voice rules and author name
- [ ] Rewrite "AI Detection Prevention" section: update author name, voice pattern examples, signature phrases
- [ ] Update "Autonomous Content Creation" section with new niche topic discovery criteria
- [ ] Update affiliate link format
- [ ] Update "Free Resources" section: replace niche-specific quality examples, update cross-reference to AGENTS.md section 6
- [ ] Update "Content Structure" paths if renaming any directories
- [ ] Replace all "solo attorney," "legal-tech," "law firm" references

### 1.3 `.github/agents/publisher.agent.md`

- [ ] Replace agent description and site name
- [ ] Rewrite "Preflight Audit" with new brand identity file references
- [ ] Rewrite "Topic Discovery & Research" phase: new niche categories, trend sources, competitor landscape
- [ ] Update "SEO & Keyword Research" phase: new primary/secondary keyword patterns
- [ ] Rewrite all 3 content templates (tool review, playbook, research): new frontmatter values, niche-specific article structure, audience references
- [ ] Rewrite "Writing Style Fingerprint" section entirely: new author name, new voice patterns (10 patterns), new banned phrases if different, new structural anti-patterns
- [ ] Update "Copy Review" phase examples with new niche language
- [ ] Update "Image Generation" phase with new niche aesthetic direction
- [ ] Update "Article SEO Checklist" if any items are niche-specific
- [ ] Update "Deal Health Check" phase (Phase 9): update affiliate platform verification logic. Note: the agent now has full authority to delete discontinued product files, hero images, and content-calendar entries without approval.
- [ ] Update "Free Resources & Value-Add Downloads" section: replace niche-specific examples, update quality rules if voice patterns change, update existing resources list (will be empty after Phase 7)
- [ ] Replace every instance of: "James," "solo attorney," "legal," "law firm," "billable," "AppSumo," "Clio," "Spellbook," "MyCase"
- [ ] Update tool categories list (currently: Intake & Scheduling, Drafting, Marketing, Case Management, Billing, Document Automation, Legal Research, Communication)

---

## Phase 2: Site Configuration

### 2.1 `astro.config.mjs`

- [ ] Update `site` URL to new domain

### 2.2 `package.json`

- [ ] Update `name` field to new project name

### 2.3 `public/manifest.webmanifest`

- [ ] Update `name` to new site name
- [ ] Update `short_name` to new abbreviation
- [ ] Update `description` to new niche description
- [ ] Update `background_color` and `theme_color` if changing color palette

### 2.4 `public/robots.txt`

- [ ] Update `Sitemap` URL to new domain

### 2.5 `public/sw.js`

- [ ] Reset `CACHE_NAME` to `{new-short-name}-v1.0.0`
- [ ] Review `PRECACHE_URLS` array and update if any page paths change

### 2.6 `public/_headers`

- [ ] No niche-specific content (keep as-is)

---

## Phase 3: Layouts and Global Styles

### 3.1 `src/layouts/Layout.astro`

- [ ] Update default `description` meta tag
- [ ] Update `og:site_name` / title suffix
- [ ] Update Schema.org `Organization.name`
- [ ] Update footer copyright text (site name and year)
- [ ] Update footer contact email
- [ ] Update footer tagline ("Directed by {Author} | {Title}")
- [ ] Update Schema.org `author.name`
- [ ] Replace "The Automated Solo" in all meta tags
- [ ] Replace domain in any hardcoded URLs

### 3.2 `src/layouts/PlaybookLayout.astro`

- [ ] Update Schema.org `author.name` default
- [ ] Update Schema.org `publisher.url` to new domain

### 3.3 `src/styles/global.css`

- [ ] Update color palette if changing from slate/emerald
- [ ] Update font imports if changing typography

---

## Phase 4: Content Schema and Data

### 4.1 `src/content.config.ts`

- [ ] Update `author` default from `"James"` to new author name (appears in both `playbooks` and `tools` schemas, and possibly `research`)

### 4.2 `src/data/content-calendar.json`

- [ ] Update `_meta.description` with new site name
- [ ] Update `_meta.pillars` descriptions with new niche language
- [ ] Update `rotation` array if content mix changes
- [ ] Reset `nextSlot` to `0`
- [ ] Clear `published` array
- [ ] Update tool categories if the niche uses different categories

### 4.3 `src/data/nav.ts`

- [ ] Update `mainNav` labels if renaming sections (currently: "About the Lab", "Research", "Playbooks", "Software Index")
- [ ] Update `footerNav` labels if renaming sections (currently: "About Us", "Research", "Privacy Policy", "Terms of Service")
- [ ] Update `href` paths if renaming any page routes

---

## Phase 5: Pages (Customer-Facing)

### 5.1 `src/pages/index.astro` (Homepage)

- [ ] Rewrite meta title and description
- [ ] Rewrite hero section (headline, subheadline, CTAs)
- [ ] Rewrite all section copy (research, tools, playbooks descriptions)
- [ ] Update "Interactive utilities" section descriptions
- [ ] Replace every "solo attorney," "legal tech," "billable," "law firm" reference
- [ ] Update any hardcoded tool/playbook preview links if content slugs change

### 5.2 `src/pages/about.astro`

- [ ] Rewrite meta title and description
- [ ] Rewrite full page: author bio, methodology, mission statement
- [ ] Replace author name, email, expertise area
- [ ] Remove "Why Trust a Non-Lawyer?" section (replace with niche-appropriate credibility section)
- [ ] Update contact CTA

### 5.3 `src/pages/calculator.astro`

- [ ] Rewrite meta title and description
- [ ] Rewrite calculator labels, defaults, and explanatory copy
- [ ] Replace "billable hourly rate" with niche-appropriate metric
- [ ] Update ROI framing for new niche

### 5.4 `src/pages/tracker.astro`

- [ ] Rewrite meta description and page copy
- [ ] Replace "legal pipelines" with niche-appropriate language
- [ ] Update "AppSumo lifetime deals" reference if affiliate platform changes

### 5.5 `src/pages/privacy.astro`

- [ ] Replace all instances of site name
- [ ] Rewrite site description in opening paragraph
- [ ] Update affiliate partner names
- [ ] Update contact email (2 instances)
- [ ] Remove or replace "law firm automation" language

### 5.6 `src/pages/terms.astro`

- [ ] Replace all instances of site name
- [ ] Rewrite site description and purpose
- [ ] Remove "professional responsibility rules, bar association guidelines" (replace with new niche regulatory context if any)
- [ ] Update affiliate partner names
- [ ] Update intellectual property section with new content types
- [ ] Update contact email

### 5.7 `src/pages/404.astro`

- [ ] No niche-specific content (keep as-is, verify styling matches new palette)

### 5.8 `src/pages/tools/index.astro`

- [ ] Update meta title and description if they reference the niche
- [ ] Update any page copy

### 5.9 `src/pages/tools/[...slug].astro`

- [ ] Update Schema.org `author.name` default
- [ ] Update hardcoded domain in Schema.org `image` URL
- [ ] Update page title suffix if it references the niche

### 5.10 `src/pages/playbooks/index.astro`

- [ ] Rewrite meta title and description (currently references "solo attorneys")
- [ ] Rewrite page header copy

### 5.11 `src/pages/playbooks/[...slug].astro`

- [ ] Check for any hardcoded niche references in template chrome

### 5.12 `src/pages/research/index.astro`

- [ ] Rewrite meta description (currently references "solo practitioners")

### 5.13 `src/pages/research/[...slug].astro`

- [ ] Check for any hardcoded niche references in template chrome

---

## Phase 6: Components

### 6.1 `src/components/RoiCalculator.astro`

- [ ] Update heading "Billable ROI Calculator" to new niche metric
- [ ] Update default rate/hours labels if "billable rate" does not apply

### 6.2 `src/components/DealCTA.astro`

- [ ] Update "Verified AppSumo Partner Listing" text if changing affiliate platform
- [ ] Update "Claim Lifetime Deal" button text if deal structure changes

### 6.3 `src/components/Scorecard.astro`

- [ ] No niche-specific content (keep as-is)

### 6.4 `src/components/ComparisonTable.astro`

- [ ] No niche-specific content (keep as-is)

### 6.5 `src/components/DataFlow.astro`

- [ ] No niche-specific content (keep as-is)

### 6.6 `src/components/KeyTakeaway.astro`

- [ ] No niche-specific content (keep as-is)

### 6.7 `src/components/StatCallout.astro`

- [ ] No niche-specific content (keep as-is)

### 6.8 `src/components/BlueprintDownload.astro`

- [ ] No niche-specific content (keep as-is)

---

## Phase 7: Existing Content (Delete or Replace)

All existing content articles are written for the legal niche. They must be removed entirely and replaced with new niche content.

### 7.1 Delete all tool reviews

- [ ] Delete `src/content/tools/sendfox.mdx`
- [ ] Delete `src/content/tools/tidycal.mdx`
- [ ] Delete `src/content/tools/typedesk.mdx`

### 7.2 Delete all playbooks

- [ ] Delete `src/content/playbooks/automate-client-intake.mdx`
- [ ] Delete `src/content/playbooks/autopilot-referral-engine.mdx`

### 7.3 Delete all research reports

- [ ] Delete `src/content/research/ai-assistant-benchmark-2026.mdx`

### 7.4 Delete all generated hero images

- [ ] Delete all files in `public/images/` (these are niche-specific generated thumbnails)

### 7.5 Delete or replace all blueprints

- [ ] Delete `public/blueprints/automation-readiness-checklist.txt` (25-question legal automation assessment)
- [ ] Delete `public/blueprints/intake-clio.json` (Clio CRM integration, legal-specific)
- [ ] Delete `public/blueprints/referral-templates.txt` (attorney referral email templates)
- [ ] Create new niche-appropriate blueprints if applicable

---

## Phase 8: Scripts

### 8.1 `scripts/generate-images.mjs`

- [ ] Replace art direction prompt: "premium legal-tech publication" with new niche aesthetic
- [ ] Replace "Bloomberg Law meets Wired magazine" comparison
- [ ] Replace all "solo attorney," "legal-tech," "law firm" references in prompt strings
- [ ] Update "Target audience" string in tool, playbook, and research prompt builders
- [ ] Update User-Agent or branding strings if present
- [ ] Update reference image descriptions if the 3 reference images are replaced

### 8.2 `scripts/check-deals.mjs`

- [ ] Update User-Agent string from `"TheAutomatedSolo-DealChecker/1.0"` to new brand
- [ ] Update deal-checking logic if affiliate platform changes from AppSumo

---

## Phase 9: GitHub Workflows

### 9.1 `.github/workflows/scheduled-publish.yml`

- [ ] Update issue title template with new site name
- [ ] Rewrite issue body: replace all niche-specific instructions, categories, voice guidance
- [ ] Update affiliate link format in issue body
- [ ] Replace "solo attorney," "legal-tech," "James" references
- [ ] Update tool category list
- [ ] Update cron schedule if content cadence changes

### 9.2 `.github/workflows/deal-monitor.yml`

- [ ] Update affiliate link format if platform changes
- [ ] Update issue body template with new niche language
- [ ] Update any hardcoded product references

---

## Phase 10: Brand Assets

### 10.1 Favicon and PWA Icons

- [ ] Replace `public/favicon.svg` with new brand icon
- [ ] Replace `public/favicon.ico` with new brand icon
- [ ] Replace `public/pwa-192x192.svg` with new brand icon
- [ ] Replace `public/pwa-512x512.svg` with new brand icon
- [ ] If using image generation reference images in the project root, replace those too

### 10.2 Reference Images (for image generation pipeline)

- [ ] Replace any reference/style images stored in the project root that the image generation script analyzes

---

## Phase 11: Final Verification

### 11.1 Global Text Search

- [ ] Search entire project for: `Automated Solo` (zero results expected)
- [ ] Search entire project for: `theautomatedsolo` (zero results expected)
- [ ] Search entire project for: `James` (zero results expected, unless new author is also James)
- [ ] Search entire project for: `james@` (zero results expected)
- [ ] Search entire project for: `solo attorney` (zero results expected)
- [ ] Search entire project for: `solo practitioner` (zero results expected)
- [ ] Search entire project for: `law firm` (zero results expected)
- [ ] Search entire project for: `legal` (zero results expected, unless new niche involves legal)
- [ ] Search entire project for: `lawyer` (zero results expected)
- [ ] Search entire project for: `attorney` (zero results expected)
- [ ] Search entire project for: `billable` (zero results expected, unless new niche uses this term)
- [ ] Search entire project for: `Clio` (zero results expected)
- [ ] Search entire project for: `Spellbook` (zero results expected)
- [ ] Search entire project for: `6618781` (zero results expected if affiliate ID changed)
- [ ] Search entire project for: em-dash character `—` (zero results, keep this rule)

### 11.2 Build Verification

- [ ] Run `npm run build` and confirm zero errors
- [ ] Verify page count matches expected (homepage + about + calculator + tracker + privacy + terms + 404 + index pages for tools/playbooks/research = 10 base pages minimum)
- [ ] Open dev server and visually inspect every page for leftover branding

### 11.3 Functional Verification

- [ ] Click every affiliate link and confirm correct redirect
- [ ] Test PWA install (Add to Home Screen) and verify new name/icon
- [ ] Confirm service worker caches new pages
- [ ] Verify sitemap at `/sitemap-index.xml` references new domain
- [ ] Verify canonical URLs use new domain
- [ ] Verify OG meta tags use new site name and domain

### 11.4 Agent Pipeline Verification

- [ ] Trigger `scheduled-publish.yml` manually and confirm issue created with correct new-niche instructions
- [ ] Confirm publisher agent reads new `AGENTS.md` and `.github/agents/publisher.agent.md` without legacy references
- [ ] Trigger `deal-monitor.yml` and confirm it checks the correct affiliate platform

---

## File Count Summary

| Category                                              | Files to Modify | Files to Delete |
| ----------------------------------------------------- | --------------- | --------------- |
| Core Identity (AGENTS, instructions, publisher agent) | 3               | 0               |
| Site Config (astro, package, manifest, robots, sw)    | 5               | 0               |
| Layouts                                               | 2               | 0               |
| Styles                                                | 1               | 0               |
| Content Schema & Data                                 | 3               | 0               |
| Pages                                                 | 13              | 0               |
| Components                                            | 2               | 0               |
| Scripts                                               | 2               | 0               |
| Workflows                                             | 2               | 0               |
| Brand Assets (icons)                                  | 4               | 0               |
| Content Articles                                      | 0               | 6               |
| Hero Images                                           | 0               | 6               |
| Blueprints                                            | 0               | 3               |
| **Total**                                             | **37**          | **15**          |
