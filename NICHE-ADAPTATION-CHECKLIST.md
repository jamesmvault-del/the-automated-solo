# Niche Adaptation Checklist

This checklist is a complete, step-by-step guide for an agent (or human) to re-skin this entire PWA for a new niche. The current niche is "The Automated Solo" (solo attorney automation). Every file listed below contains niche-specific branding, copy, or logic that must be updated.

**Goal:** Zero traces of the original niche after completion. Every customer-facing page, agent instruction, workflow, script, blueprint, and metadata file must reflect the new brand.

---

## How This System Works

Most niche-specific values are centralized in **`src/data/site-config.json`**. The scheduled publishing workflow (`scheduled-publish.yml`) reads from this config at runtime and injects values into the Copilot issue instructions automatically. This means:

- **Automated via config:** Workflow issue creation, audience references in Copilot instructions, tool categories, affiliate link format, SEO anchor phrases, minimum word counts, niche-fit questions, pain points, trusted platforms
- **Still requires manual editing:** Agent instruction files (AGENTS.md, publisher.agent.md, copilot-instructions.md), layouts, pages, components, scripts, styles, manifests, and brand assets

Editing `site-config.json` is Step 1. Everything else follows from it.

---

## Pre-Work: Gather New Niche Details

Before editing any file, define these values. The first group maps directly to `site-config.json` fields. The second group lives in other files and must be updated manually.

### Values stored in `site-config.json`

| Config Path                      | Current Value                                                                                | New Value |
| -------------------------------- | -------------------------------------------------------------------------------------------- | --------- |
| `site.name`                      | The Automated Solo                                                                           |           |
| `site.url`                       | theautomatedsolo.com                                                                         |           |
| `site.tagline`                   | Billable Freedom. Automation tested for the Solo Practitioner.                               |           |
| `site.description`               | A premium PWA authority site for solo attorney automation.                                   |           |
| `niche.name`                     | Solo Attorney Automation                                                                     |           |
| `niche.audience`                 | US-based solo practitioners and boutique law firms (1-10 employees)                          |           |
| `niche.audienceShort`            | solo attorneys                                                                               |           |
| `niche.hook`                     | buying back billable time                                                                    |           |
| `niche.subNiches`                | family law, estate planning, personal injury, criminal defense, general practice             |           |
| `niche.nicheFitQuestion`         | Would a solo practitioner running a general practice... use this weekly?                     |           |
| `niche.painPoints`               | intake, billing, document assembly, follow-ups, deadline tracking, scheduling, communication |           |
| `niche.seoAnchorPhrase`          | solo attorney                                                                                |           |
| `niche.seoVariations`            | solo attorney, solo practitioner, small law firm, one-person firm, solo practice             |           |
| `niche.appSumoCategories`        | Intake & Scheduling, Drafting, Marketing, Case Management, Billing, etc.                     |           |
| `author.name`                    | James                                                                                        |           |
| `author.role`                    | lead researcher and systems architect                                                        |           |
| `author.perspective`             | A legal-tech RESEARCHER who tests tools FOR solo attorneys...                                |           |
| `author.voiceExample`            | I tested this for a week to see how it would hold up in a solo practice                      |           |
| `monetization.primaryPlatform`   | AppSumo                                                                                      |           |
| `monetization.affiliateBase`     | `https://appsumo.8odi.net/c/6618781/416948/7443?u=`                                          |           |
| `monetization.productUrlPattern` | `https://appsumo.com/products/{slug}/`                                                       |           |
| `monetization.searchFallbackUrl` | `https://appsumo.com/software-search/?query=`                                                |           |
| `monetization.otherPlatforms`    | Clio, MyCase, Spellbook                                                                      |           |
| `content.minWords`               | tool: 800, playbook: 1200, research: 1500                                                    |           |
| `content.toolCategories`         | (same as niche.appSumoCategories)                                                            |           |
| `content.trustedPlatforms`       | Make.com, Zapier, Clio, Google Workspace, Microsoft 365, Calendly                            |           |

### Values NOT in site-config.json (live in other files)

| Variable                    | Current Value                                        | Where It Lives                               | New Value |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------- | --------- |
| **Author Email**            | james@theautomatedsolo.com                           | Layout.astro, about.astro, privacy, terms    |           |
| **PWA Short Name**          | AutoSolo                                             | manifest.webmanifest                         |           |
| **Color Palette**           | slate-950 bg, emerald-400 accent                     | global.css, manifest.webmanifest             |           |
| **Design Metaphors**        | Dark glass, brushed slate, courtroom marble          | AGENTS.md section 5, generate-images.mjs     |           |
| **Image Ref Aesthetic**     | "Bloomberg Law meets Wired magazine"                 | AGENTS.md section 5, generate-images.mjs     |           |
| **Nav Labels (Main)**       | About the Lab, Research, Playbooks, Software Index   | nav.ts                                       |           |
| **Nav Labels (Footer)**     | About Us, Research, Privacy Policy, Terms of Service | nav.ts                                       |           |
| **Package Name**            | the-automated-solo                                   | package.json                                 |           |
| **Cache Prefix**            | autosolo                                             | sw.js                                        |           |
| **Affiliate Publisher ID**  | 6618781                                              | site-config.json (embedded in affiliateBase) |           |
| **Affiliate Ad ID**         | 416948                                               | site-config.json (embedded in affiliateBase) |           |
| **Affiliate Advertiser ID** | 7443                                                 | site-config.json (embedded in affiliateBase) |           |

---

## Phase 1: Central Config (Start Here)

### 1.1 `src/data/site-config.json`

This is the single source of truth for niche-specific values. The publishing workflow reads from this file at runtime.

- [ ] Update every field in the file using the "Values stored in site-config.json" table above
- [ ] Verify JSON is valid after editing (`node -e "require('./src/data/site-config.json')"`)
- [ ] Confirm the `_meta.description` still accurately describes the config's purpose

---

## Phase 2: Core Identity Files

These files define the brand for all agents and workflows. They still contain hardcoded niche references that go beyond what `site-config.json` covers (voice examples, full prose paragraphs, editorial guidelines).

### 2.1 `AGENTS.md` (root)

The file is organized into 9 numbered sections. Update each:

- [ ] **Section 1 (What This Project Is):** Replace site name, URL, audience, hook, perspective, monetization partners. Note: section 1 now references `site-config.json` as the niche config source. Keep that pointer, just verify the path is still correct.
- [ ] **Section 2 (Voice Rules):** Rewrite brand voice and author voice examples with new niche language. Update author name. Update the "Apply this voice to" scope note.
- [ ] **Section 3 (Absolute Rules):** Update 3.3 (AI detection) with new author's style reference. Update 3.4 (Product Verification) with new affiliate platform if different (includes sold-out detection language). Update 3.5 (Factual Accuracy) audience reference (currently: "Our readers are attorneys"). Update 3.6 (Geographic Neutrality) if new niche has a different geographic focus.
- [ ] **Section 4 (Affiliate Links):** Replace deep link format, publisher ID, ad ID, advertiser ID. Update fallback URL pattern. Update FTC disclosure component references if renamed.
- [ ] **Section 5 (Design & Technical):** Rewrite 5.1 aesthetic (visual language, color palette, typography). Update 5.5 image generation table with new niche-appropriate styles for all 3 content types.
- [ ] **Section 6 (Free Resources):** Update 6.1 signals with new niche examples. Update 6.5 existing resources list (will be empty after Phase 8 content deletion).
- [ ] **Section 7 (AI Detection):** Rewrite 7.1 voice patterns with new author's patterns. Review 7.2 banned phrases (keep or adjust). Review 7.3 anti-patterns (mostly generic, keep as-is).
- [ ] **Section 8 (Development Rules):** Mostly generic. Keep as-is unless changing dev workflow.
- [ ] **Section 9 (Content Pipeline):** Update 9.1 rotation description. Update 9.2 component table if adding/removing components. Update 9.3 content locations if renaming directories.
- [ ] Remove or replace all "billable," "legal," "law firm," "attorney," "lawyer," "solo practitioner" references
- [ ] Verify zero em-dash characters remain (keep this rule or remove if not needed for new niche)

### 2.2 `.github/copilot-instructions.md`

- [ ] Replace site name and URL in header
- [ ] Update "Critical Rules" section with new voice rules and author name
- [ ] Rewrite "AI Detection Prevention" section: update author name, voice pattern examples, signature phrases
- [ ] Update "Autonomous Content Creation" section with new niche topic discovery criteria
- [ ] Update affiliate link format
- [ ] Update "Free Resources" section: replace niche-specific quality examples, update cross-reference to AGENTS.md section 6
- [ ] Update "Content Structure" paths if renaming any directories
- [ ] Replace all "solo attorney," "legal-tech," "law firm" references

### 2.3 `.github/agents/publisher.agent.md`

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

## Phase 3: Site Configuration

### 3.1 `astro.config.mjs`

- [ ] Update `site` URL to new domain

### 3.2 `package.json`

- [ ] Update `name` field to new project name

### 3.3 `public/manifest.webmanifest`

- [ ] Update `name` to new site name
- [ ] Update `short_name` to new abbreviation
- [ ] Update `description` to new niche description
- [ ] Update `background_color` and `theme_color` if changing color palette

### 3.4 `public/robots.txt`

- [ ] Update `Sitemap` URL to new domain

### 3.5 `public/sw.js`

- [ ] Reset `CACHE_NAME` to `{new-short-name}-v1.0.0`
- [ ] Review `PRECACHE_URLS` array and update if any page paths change

### 3.6 `public/_headers`

- [ ] No niche-specific content (keep as-is)

---

## Phase 4: Layouts and Global Styles

### 4.1 `src/layouts/Layout.astro`

- [ ] Update default `description` meta tag
- [ ] Update `og:site_name` / title suffix
- [ ] Update Schema.org `Organization.name`
- [ ] Update footer copyright text (site name and year)
- [ ] Update footer contact email
- [ ] Update footer tagline ("Directed by {Author} | {Title}")
- [ ] Update Schema.org `author.name`
- [ ] Replace "The Automated Solo" in all meta tags
- [ ] Replace domain in any hardcoded URLs

### 4.2 `src/layouts/PlaybookLayout.astro`

- [ ] Update Schema.org `author.name` default
- [ ] Update Schema.org `publisher.url` to new domain

### 4.3 `src/styles/global.css`

- [ ] Update color palette if changing from slate/emerald
- [ ] Update font imports if changing typography

---

## Phase 5: Content Schema and Data

### 5.1 `src/content.config.ts`

- [ ] Update `author` default from `"James"` to new author name (appears in both `playbooks` and `tools` schemas, and possibly `research`)

### 5.2 `src/data/content-calendar.json`

- [ ] Update `_meta.description` with new site name
- [ ] Update `_meta.pillars` descriptions with new niche language
- [ ] Update `rotation` array if content mix changes
- [ ] Reset `nextSlot` to `0`
- [ ] Clear `published` array
- [ ] Note: tool categories are now driven by `site-config.json` at runtime, but update any hardcoded references in the `_meta` block

### 5.3 `src/data/site-config.json`

Already updated in Phase 1. No further action needed here, but verify the config is referenced correctly by:

- [ ] `scheduled-publish.yml` (reads `site-config.json` with `jq` at runtime)
- [ ] `publisher.agent.md` (references config at top of file)
- [ ] `copilot-instructions.md` (references config)

### 5.4 `src/data/nav.ts`

- [ ] Update `mainNav` labels if renaming sections (currently: "About the Lab", "Research", "Playbooks", "Software Index")
- [ ] Update `footerNav` labels if renaming sections (currently: "About Us", "Research", "Privacy Policy", "Terms of Service")
- [ ] Update `href` paths if renaming any page routes

---

## Phase 6: Pages (Customer-Facing)

### 6.1 `src/pages/index.astro` (Homepage)

- [ ] Rewrite meta title and description
- [ ] Rewrite hero section (headline, subheadline, CTAs)
- [ ] Rewrite all section copy (research, tools, playbooks descriptions)
- [ ] Update "Interactive utilities" section descriptions
- [ ] Replace every "solo attorney," "legal tech," "billable," "law firm" reference
- [ ] Update any hardcoded tool/playbook preview links if content slugs change

### 6.2 `src/pages/about.astro`

- [ ] Rewrite meta title and description
- [ ] Rewrite full page: author bio, methodology, mission statement
- [ ] Replace author name, email, expertise area
- [ ] Remove "Why Trust a Non-Lawyer?" section (replace with niche-appropriate credibility section)
- [ ] Update contact CTA

### 6.3 `src/pages/calculator.astro`

- [ ] Rewrite meta title and description
- [ ] Rewrite calculator labels, defaults, and explanatory copy
- [ ] Replace "billable hourly rate" with niche-appropriate metric
- [ ] Update ROI framing for new niche

### 6.4 `src/pages/tracker.astro`

- [ ] Rewrite meta description and page copy
- [ ] Replace "legal pipelines" with niche-appropriate language
- [ ] Update "AppSumo lifetime deals" reference if affiliate platform changes

### 6.5 `src/pages/privacy.astro`

- [ ] Replace all instances of site name
- [ ] Rewrite site description in opening paragraph
- [ ] Update affiliate partner names
- [ ] Update contact email (2 instances)
- [ ] Remove or replace "law firm automation" language

### 6.6 `src/pages/terms.astro`

- [ ] Replace all instances of site name
- [ ] Rewrite site description and purpose
- [ ] Remove "professional responsibility rules, bar association guidelines" (replace with new niche regulatory context if any)
- [ ] Update affiliate partner names
- [ ] Update intellectual property section with new content types
- [ ] Update contact email

### 6.7 `src/pages/404.astro`

- [ ] No niche-specific content (keep as-is, verify styling matches new palette)

### 6.8 `src/pages/tools/index.astro`

- [ ] Update meta title and description if they reference the niche
- [ ] Update any page copy

### 6.9 `src/pages/tools/[...slug].astro`

- [ ] Update Schema.org `author.name` default
- [ ] Update hardcoded domain in Schema.org `image` URL
- [ ] Update page title suffix if it references the niche

### 6.10 `src/pages/playbooks/index.astro`

- [ ] Rewrite meta title and description (currently references "solo attorneys")
- [ ] Rewrite page header copy

### 6.11 `src/pages/playbooks/[...slug].astro`

- [ ] Check for any hardcoded niche references in template chrome

### 6.12 `src/pages/research/index.astro`

- [ ] Rewrite meta description (currently references "solo practitioners")

### 6.13 `src/pages/research/[...slug].astro`

- [ ] Check for any hardcoded niche references in template chrome

---

## Phase 7: Components

### 7.1 `src/components/RoiCalculator.astro`

- [ ] Update heading "Billable ROI Calculator" to new niche metric
- [ ] Update default rate/hours labels if "billable rate" does not apply

### 7.2 `src/components/DealCTA.astro`

- [ ] Update "Verified AppSumo Partner Listing" text if changing affiliate platform
- [ ] Update "Claim Lifetime Deal" button text if deal structure changes

### 7.3 `src/components/Scorecard.astro`

- [ ] No niche-specific content (keep as-is)

### 7.4 `src/components/ComparisonTable.astro`

- [ ] No niche-specific content (keep as-is)

### 7.5 `src/components/DataFlow.astro`

- [ ] No niche-specific content (keep as-is)

### 7.6 `src/components/KeyTakeaway.astro`

- [ ] No niche-specific content (keep as-is)

### 7.7 `src/components/StatCallout.astro`

- [ ] No niche-specific content (keep as-is)

### 7.8 `src/components/BlueprintDownload.astro`

- [ ] No niche-specific content (keep as-is)

---

## Phase 8: Existing Content (Delete or Replace)

All existing content articles are written for the legal niche. They must be removed entirely and replaced with new niche content.

### 8.1 Delete all tool reviews

- [ ] Delete `src/content/tools/sendfox.mdx`
- [ ] Delete `src/content/tools/tidycal.mdx`
- [ ] Delete `src/content/tools/typedesk.mdx`

### 8.2 Delete all playbooks

- [ ] Delete `src/content/playbooks/automate-client-intake.mdx`
- [ ] Delete `src/content/playbooks/autopilot-referral-engine.mdx`

### 8.3 Delete all research reports

- [ ] Delete `src/content/research/ai-assistant-benchmark-2026.mdx`

### 8.4 Delete all generated hero images

- [ ] Delete all files in `public/images/` (these are niche-specific generated thumbnails)

### 8.5 Delete or replace all blueprints

- [ ] Delete `public/blueprints/automation-readiness-checklist.txt` (25-question legal automation assessment)
- [ ] Delete `public/blueprints/intake-clio.json` (Clio CRM integration, legal-specific)
- [ ] Delete `public/blueprints/referral-templates.txt` (attorney referral email templates)
- [ ] Create new niche-appropriate blueprints if applicable

---

## Phase 9: Scripts

### 9.1 `scripts/generate-images.mjs`

- [ ] Replace art direction prompt: "premium legal-tech publication" with new niche aesthetic
- [ ] Replace "Bloomberg Law meets Wired magazine" comparison
- [ ] Replace all "solo attorney," "legal-tech," "law firm" references in prompt strings
- [ ] Update "Target audience" string in tool, playbook, and research prompt builders
- [ ] Update User-Agent or branding strings if present
- [ ] Update reference image descriptions if the 3 reference images are replaced

### 9.2 `scripts/check-deals.mjs`

- [ ] Update User-Agent string from `"TheAutomatedSolo-DealChecker/1.0"` to new brand
- [ ] Update deal-checking logic if affiliate platform changes from AppSumo

---

## Phase 10: GitHub Workflows

### 10.1 `.github/workflows/scheduled-publish.yml`

This workflow now reads from `site-config.json` at runtime using `jq`. Most niche-specific values in the generated issue body are injected automatically from the config. You still need to:

- [ ] Verify the `jq` config-reading step correctly parses `site-config.json` (test with a manual dispatch after updating the config)
- [ ] Update the issue title template if you changed the site name format (currently includes site name from config)
- [ ] Review the static parts of the issue body for any hardcoded niche language that was not parameterized
- [ ] Update cron schedule if content cadence changes
- [ ] Note: tool categories, audience, voice examples, affiliate format, word counts, pain points, niche-fit question, SEO phrases, and trusted platforms are all pulled from config automatically

### 10.2 `.github/workflows/deal-monitor.yml`

- [ ] Update affiliate link format if platform changes
- [ ] Update issue body template with new niche language
- [ ] Update any hardcoded product references

---

## Phase 11: Brand Assets

### 11.1 Favicon and PWA Icons

- [ ] Replace `public/favicon.svg` with new brand icon
- [ ] Replace `public/favicon.ico` with new brand icon
- [ ] Replace `public/pwa-192x192.svg` with new brand icon
- [ ] Replace `public/pwa-512x512.svg` with new brand icon
- [ ] If using image generation reference images in the project root, replace those too

### 11.2 Reference Images (for image generation pipeline)

- [ ] Replace any reference/style images stored in the project root that the image generation script analyzes

---

## Phase 12: Final Verification

### 12.1 Global Text Search

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

### 12.2 Build Verification

- [ ] Run `npm run build` and confirm zero errors
- [ ] Verify page count matches expected (homepage + about + calculator + tracker + privacy + terms + 404 + index pages for tools/playbooks/research = 10 base pages minimum)
- [ ] Open dev server and visually inspect every page for leftover branding

### 12.3 Functional Verification

- [ ] Click every affiliate link and confirm correct redirect
- [ ] Test PWA install (Add to Home Screen) and verify new name/icon
- [ ] Confirm service worker caches new pages
- [ ] Verify sitemap at `/sitemap-index.xml` references new domain
- [ ] Verify canonical URLs use new domain
- [ ] Verify OG meta tags use new site name and domain

### 12.4 Agent Pipeline Verification

- [ ] Trigger `scheduled-publish.yml` manually and confirm issue created with correct new-niche instructions (values should come from `site-config.json`)
- [ ] Confirm publisher agent reads new `AGENTS.md` and `.github/agents/publisher.agent.md` without legacy references
- [ ] Trigger `deal-monitor.yml` and confirm it checks the correct affiliate platform
- [ ] Verify the generated issue body contains the correct audience, categories, voice example, and affiliate format from config

---

## File Count Summary

| Category                                              | Files to Modify | Files to Delete | Notes                                   |
| ----------------------------------------------------- | --------------- | --------------- | --------------------------------------- |
| Central Config (site-config.json)                     | 1               | 0               | **Start here.** Drives workflow values. |
| Core Identity (AGENTS, instructions, publisher agent) | 3               | 0               | Still contain hardcoded prose           |
| Site Config (astro, package, manifest, robots, sw)    | 5               | 0               |                                         |
| Layouts                                               | 2               | 0               |                                         |
| Styles                                                | 1               | 0               |                                         |
| Content Schema & Data                                 | 3               | 0               | content-calendar, content.config, nav   |
| Pages                                                 | 13              | 0               |                                         |
| Components                                            | 2               | 0               |                                         |
| Scripts                                               | 2               | 0               |                                         |
| Workflows                                             | 2               | 0               | scheduled-publish reads from config now |
| Brand Assets (icons)                                  | 4               | 0               |                                         |
| Content Articles                                      | 0               | 6               |                                         |
| Hero Images                                           | 0               | 6               |                                         |
| Blueprints                                            | 0               | 3               |                                         |
| **Total**                                             | **38**          | **15**          |                                         |
