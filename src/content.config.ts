import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const playbooks = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/playbooks" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default("James"),
    readTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageStyle: z.string().optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    category: z.string(),
    useCase: z.string(),
    standardPrice: z.string(),
    dealPrice: z.string(),
    dealType: z.string(),
    roiEstimate: z.string(),
    affiliateLink: z.string(),
    image: z.string().optional(),
    imageStyle: z.string().optional(),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/research" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default("James"),
    readTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageStyle: z.string().optional(),
  }),
});

export const collections = { playbooks, tools, research };
