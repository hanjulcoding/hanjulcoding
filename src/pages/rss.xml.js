import rss, { pagesGlobToRssItems } from "@astrojs/rss";

export async function GET(context) {
  return rss({
    title: "한줄코딩 | Blog",
    description: "한줄코딩 공식 블로그",
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob("./post/**/*.md")),
    customData: `<language>ko-kr</language>`,
  });
}
