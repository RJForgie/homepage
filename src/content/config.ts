import { defineCollection, z} from 'astro:content';

const commonSchema = () => z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  contentType: z.string(),
  highlight: z.boolean().optional(),
});

export const collections = {
  lists: defineCollection({ 
    type: 'content',
    schema: commonSchema 
  }),
  journal: defineCollection({ 
    type: 'content',
    schema: commonSchema 
  }),
  links: defineCollection({ 
    type: 'content',
    schema: commonSchema 
  }),
};
