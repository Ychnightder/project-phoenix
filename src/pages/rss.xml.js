import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const blog = await getCollection('blog');
	return rss({
		title: 'Phénix Blog',
		description: 'Veille intelligente sur l’IA, la tech et le business.',
		site: context.site,
		items: blog.map(post => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.id}/`,
		})),
		customData: `<language>fr-fr</language>`,
	});
}
