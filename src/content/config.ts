import { defineCollection, z } from "astro:content";

const commonSchema = () =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
  });

export const collections = {
  lists: defineCollection({
    schema: commonSchema,
  }),
  "field-notes": defineCollection({
    schema: commonSchema,
  }),
};
