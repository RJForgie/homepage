import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const notes = await getCollection("posts");

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: notes.map((note) => ({
      ...note.data,
      link: `/posts/${note.slug}/`,
    })),
  });
}
