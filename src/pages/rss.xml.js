import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("news");
  return rss({
    title: "한줄코딩 | Blog",
    description: "Web Development, Frontend, Backend, DevOps, Tech News, Trending and more.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      link: `/news/${post.id}`,
    })),
    customData: `<language>ko-kr</language>`,
  });
}
