# Copilot Coding Agent Instructions

This repository powers **The Automated Solo** (theautomatedsolo.com), a premium PWA for solo attorney automation.

## Before Any Task

1. Read `AGENTS.md` in the project root. It contains all brand guidelines, voice rules, and non-negotiable operational constraints.
2. Read `.github/agents/publisher.agent.md` for content templates, schemas, and the 7-phase workflow.
3. Read `.github/agents/reviewer.agent.md` if you are assigned a `[Reviewer]` issue. Follow the Reviewer workflow, not the Publisher workflow.
4. Read `src/data/site-config.json` for niche-specific values (audience, categories, author, affiliate format). All niche-specific references should come from this config.
5. If asked to switch niches or adapt the project for a new audience, read `NICHE-ADAPTATION-CHECKLIST.md` in the project root and follow it step by step. Do not improvise the switchover.

## Critical Rules (Always Enforced)

- **NEVER use em-dash characters.** Rewrite with commas, colons, or split into two sentences.
- **NEVER fabricate data.** Every statistic must come from a verifiable source or be clearly framed as personal testing ("In my testing...").
- **NEVER publish placeholder text** like `[VERIFY]`, `[TODO]`, or `[PLACEHOLDER]`.
- **Voice:** All content articles (tools, playbooks, research) use James's first-person voice ("I tested," "my workflow"). Homepage/UI pages use brand voice ("we," "our").
- **Active deals only.** Do not create tool reviews for expired or discontinued products.
- **PRODUCT VERIFICATION IS MANDATORY.** Before writing ANY tool review, you MUST use your web browsing tool to fetch the AppSumo product page AND the vendor's website. Confirm both load successfully. If either returns a 404 or redirects to a homepage, STOP and pick a different tool. This also applies to every tool referenced in playbooks.
- **Deal-breaker limits.** Every tool review must mention the user/seat cap, contact/lead cap, and storage (if under 10GB) from the plan being reviewed. These three limits are the minimum. A weekly accuracy audit verifies these stay correct.
- **Affiliate links:** Build ONLY from verified URLs. Take the exact AppSumo URL you successfully loaded, URL-encode it, and insert into: `https://appsumo.8odi.net/c/6618781/416948/7443?u={URL-encoded VERIFIED product page}`. NEVER guess a product slug.
- **Answer Search Optimization (ASO) is mandatory.** Every article must be structured so AI models (ChatGPT, Gemini, Perplexity, Claude) can cite it authoritatively. Lead with a direct, quotable answer. Use question-shaped H2 headings. Include specific competitor comparisons. State a confident "best for" verdict. Use claim-evidence pairs. See `.github/agents/publisher.agent.md` Phase 7 for the full ASO checklist.

## AI Detection Prevention (Critical for SEO)

All content must pass AI detection tools. Study existing articles in `src/content/tools/` and `src/content/playbooks/` for James's actual voice patterns before writing. Key rules:

- **Vary sentence length aggressively.** Alternate short punches ("I hate recurring fees.") with longer analytical sentences. Five medium-length sentences in a row is an AI signature.
- **Use blunt, opinionated openers.** "You went to law school to practice law, not to act as a data entry clerk." Not gentle introductions.
- **Concede limitations honestly.** "Look, does it have X? No. But you are a solo practitioner." Question-then-answer is James's signature.
- **Use specific numbers.** "about 90 seconds" not "quickly." "$150 consultation fee" not "a fee."
- **Controlled informality.** "I dumped my CSV" not "I imported my CSV." One or two slightly rough verbs per article.
- **Never use these AI-flagged phrases:** "In today's fast-paced world," "It's worth noting," "Let's dive in," "game-changer," "seamlessly," "robust," "leverage," "empower," "streamline," "navigate the complexities," "delve into," "cutting-edge," "comprehensive solution," "unlock the potential," "revolutionize," "utilize" (use "use"), "Moreover/Furthermore/Additionally/However" as paragraph openers, "heavy lifting," "eye-opening," "undeniable," "effortlessly," "noteworthy," "remarkable."
- **Break parallel structure in lists.** Do not start every bullet the same way. Mix fragments, full sentences, and questions.
- **Vary paragraph length.** Some paragraphs should be one sentence. Others can run to six. Never uniform.
- **Minimize transition words.** James uses hard cuts between paragraphs, not "However," "Meanwhile," "That said."

See `.github/agents/publisher.agent.md` for the full Writing Style Fingerprint with complete banned phrase list and structural anti-patterns.

## Autonomous Content Creation

When assigned a content issue from the scheduled-publish workflow:

1. **You choose the topic.** The issue tells you the content TYPE (tool, playbook, or research). You research and select the best specific topic based on market signals, trending searches, and gaps in existing coverage.
2. **For tool reviews:** Search AppSumo for active deals relevant to solo attorneys. Verify the deal is live, verify niche fit, then write the review.
3. **For playbooks:** Identify automation workflows that complement existing tool reviews. Prioritize high-impact, billable-hour-saving processes.
4. **For research:** Find trending questions in the legal-tech space that solo attorneys are searching for.

## Content Structure

- Tool reviews: `src/content/tools/{slug}.mdx`
- Playbooks: `src/content/playbooks/{slug}.mdx`
- Research: `src/content/research/{slug}.mdx`
- Free resources: `public/blueprints/{name}.{ext}`
- Components: `src/components/` (Scorecard, RoiCalculator, DealCTA, ComparisonTable, DataFlow, KeyTakeaway, StatCallout, BlueprintDownload)

## Free Resources

You have full autonomy to create downloadable resources (checklists, templates, configs, decision frameworks) when they genuinely add value. Rules:

- Place files in `public/blueprints/`. Use the `BlueprintDownload` component in the article.
- Every download must pass the high-value test: would a solo attorney bookmark the article because of this file?
- Downloads must include self-contained instructions inside the file. The reader should never need the article open to use the download.
- All prose in free resources must follow James's voice and pass AI detection. No uniform bullet lists, no placeholder fields, no filler.
- Check `public/blueprints/` before creating. Do not duplicate existing resources.
- See `AGENTS.md` section 6 for full guidance.

## Image Generation

After creating content, generate the hero image:

```bash
GEMINI_API_KEY=$GEMINI_API_KEY node scripts/generate-images.mjs --tool {slug}
GEMINI_API_KEY=$GEMINI_API_KEY node scripts/generate-images.mjs --playbook {slug}
GEMINI_API_KEY=$GEMINI_API_KEY node scripts/generate-images.mjs --research {slug}
```

## After Creating Content

1. Update `src/data/content-calendar.json`: increment `nextSlot` by 1 and add an entry to the `published` array.
2. Increment the `CACHE_NAME` version string in `public/sw.js`.
3. Run `npm run build` to confirm zero errors.
