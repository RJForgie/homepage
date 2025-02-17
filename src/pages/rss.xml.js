import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const journalEntries = await getCollection('journal')

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: journalEntries.map((journalEntry) => ({
			...journalEntry.data,
			link: `/journal/${journalEntry.slug}/`,
		})),
	});
}
