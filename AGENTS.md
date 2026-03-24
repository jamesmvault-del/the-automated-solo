# Agent Guardrails: The Automated Solo PWA

This is a premium, high-utility PWA for "The Automated Solo," a niche authority site dedicated to law firm automation and AI implementation for solo attorneys.

**CRITICAL VOICE DISTINCTION:**

1. **The Brand Voice (Homepage & UI):** High-level structural pages (like the homepage and landing pages) speak from the perspective of the brand/lab. Use "we" and "our" language (e.g., "We bridge the gap", "Our Research").
2. **The Author Voice (Playbooks, Tools, Articles):** The lead developer and researcher is James. For all blog posts, playbooks, tool reviews, and content articles, all language must reflect James’s personal voice—curious, tech-savvy, and focused on "buying back billable time." For these _content_ pieces only, strictly use "I" and "my" language.

## Core Brand Identity

- **The Target:** Primarily US-based Solo Practitioners and Boutique Law Firms (1–10 employees).
- **The Hook:** Billable Freedom. Automation tested for the Solo Practitioner.
- **The Perspective:** A "boots on the ground" research approach. I test the tools, find the bugs, and share the shortcuts.
- **The Stack:** Custom-coded in Visual Studio, deployed via GitHub to Cloudflare Pages.
- **The Edge:** High-speed PWA functionality. It is positioned as a "Utility App" for the Law Firm, featuring interactive calculators and an offline-ready "LTD" (Lifetime Deal) tracker.
- **Monetization:** Lead with high-value AppSumo referrals and recurring SaaS affiliate partnerships (e.g., Clio, MyCase, Spellbook).

## Design Aesthetic

- **Editorial & Professional:** The layout must feel like a high-end digital publication (e.g., Harvard Business Review or Stripe). Clean, minimalist, and expensive.
- **Imagery:** Use photorealistic placeholders for UI/UX. Focus on "Modern Legal" textures: dark glass, brushed slate, and refined serif typography.
- **PWA Standards:** Must include a manifest and service worker. The app is designed to be "docked" on a lawyer's phone for instant access to tools, even without an internet connection.

## Trust & Transparency (FTC Compliance)

1. **Disclosure Placement:** Every page containing affiliate links (AppSumo, etc.) must include a subtle but clear "Affiliate Disclosure" at the top or within the footer to comply with US FTC guidelines.
2. **Data Privacy:** Since this targets lawyers, the PWA must prioritize "Privacy by Design." No invasive tracking; focus on performance and utility.

## Operational Rules (NON-NEGOTIABLE)

**ATTENTION ALL AGENTS:** The following operational rules are absolute constraints. You MUST verify your output against these rules before completing any task. Ignoring these rules constitutes a failure state.

1. **Voice & Tone:** Human-readable, peer-to-peer, and "straight-talk." James is the "Chief Tester"—honest about what works and what doesn't. Avoid "legalese".
   - **CRITICAL FATAL ERROR WARNING:** NEVER, under ANY circumstances, use the "—" (em-dash) character. This is an explicit AI detection trigger for this project. If you are about to generate an em-dash, STOP and rewrite the sentence using a comma, a colon, or separate it into two distinct sentences. This rule is absolute and overrides all other style guidelines.
2. **Geographic Neutrality:** Do not mention James's physical location. The focus is on the global (primarily US) legal-tech market.
3. **Utility-First:** Every page should provide a clear reason for the user to "Add to Home Screen" (e.g., "Save this workflow for offline use").
4. **Affiliate Integrity:** All code must support clean, trackable affiliate links. For AppSumo products, agents MUST use the deep link format to point directly to the product page while appending my referral ID. The format is: `https://appsumo.8odi.net/c/6618781/416948/7443?u={Encoded_Landing_Page_URL}` (e.g., `https://appsumo.8odi.net/c/6618781/416948/7443?u=https%3A%2F%2Fappsumo.com%2Fproducts%2Ftool-name%2F`).
   - _CRITICAL FALLBACK:_ If a product is removed or the lifetime deal ends, AppSumo's 404 redirect will strip the tracking ID. In these cases, the deep link MUST point to the AppSumo search page for that tool to preserve the tracking parameters (e.g., `...?u=https%3A%2F%2Fappsumo.com%2Fsoftware-search%2F%3Fquery%3Dtool-name`).
5. **Device Parity:** Any updates must work perfectly for both desktop and mobile views. The mobile view should feel like a premium native utility app.
6. **Minimalist Logic:** Modify only the logic required. DO NOT over-engineer.
7. **Sequential Workflow:** Work on one file at a time.
8. **Cache Invalidation:** Always increment the `CACHE_NAME` version string in `sw.js` whenever CSS, JS, or significant visual/structural changes are made.
9. **Zero AI-Signature Copy:** Any copy generated or written by an agent MUST NOT trigger AI detection tools. It must sound entirely human, natural, imperfect, and mimic James's specific writing style precisely without generic AI filler words.
10. **Active Deals Only:** Agents MUST verify that a product or Lifetime Deal is currently active and available on AppSumo (or the respective platform) before creating or updating a tool's documentation. We strictly avoid listing inactive or discontinued products to ensure we never waste our users' time. If a product becomes inactive, it should be removed from the active index.
11. **Image Style Taxonomy (Caretaker Agent):** When generating or defining images for content, the Caretaker Agent must assign one of the specific `imageStyle` string tags in the MDX frontmatter. This ensures visual variety while maintaining the premium brand aesthetic. Titles should be kept relatively short (under 40 characters) to ensure perfect typography rendering:
    - `tech-thumbnail`: Minimalist graphic design, flat dark background, glowing vibrant vector app icons, and a highly restrictive single bold title. Best for Tool/Software reviews.
    - `emotional-photography`: Cinematic, 35mm portrait photography of professionals in high-end office environments (e.g., a solo lawyer working late, illuminated by monitor glow, looking relieved or focused).
    - `ui-dashboard`: Isometric, sleek 3D mockups of software, data, and charts. Best for Research articles.
    - `blueprint-abstract`: High-end conceptual representations of workflows and glowing nodes. Best for Playbooks.
