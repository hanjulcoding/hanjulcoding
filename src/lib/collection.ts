import { getCollection } from "astro:content";
import { pubDateSort } from "./utils";

export type CollectionName = "posts" | "update";

// 컬렉션 글을 url/frontmatter 형태로 매핑 후 최신순 정렬
export async function loadPosts(collection: CollectionName) {
  return (await getCollection(collection))
    .map((post) => ({
      ...post,
      url: `/${collection}/${post.id}`,
      frontmatter: post.data,
    }))
    .sort(pubDateSort as (a: unknown, b: unknown) => number);
}

// 글 목록에서 태그 추출 (중복 제거)
export function extractTags(posts: { frontmatter: { tags?: string } }[]) {
  return [
    ...new Set(
      posts.flatMap(
        (post) => post.frontmatter.tags?.split(",").map((t) => t.trim()) || []
      )
    ),
  ];
}
