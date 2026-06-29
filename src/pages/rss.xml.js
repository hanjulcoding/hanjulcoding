import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const collections = await Promise.all(
    ["posts", "update"].map(async (name) =>
      (await getCollection(name)).map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        link: `/${name}/${post.id}`,
      }))
    )
  );
  const items = collections.flat().sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: "한줄코딩 | Blog",
    description: "Web Development, Frontend, Backend, DevOps, Tech News, Trending and more.",
    site: context.site,
    items,
    customData: `<language>ko-kr</language>`,
  });
}
