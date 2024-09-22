import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { client, type BlogPost } from "@/lib/contentful";

const ContentfulPostList = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    async function getPosts() {
      try {
        response = await client.getAllPosts();
      } catch (error) {
        return false;
      }

      setTotal(response.total);
      setPosts(
        response.items.map((post: BlogPost) => {
          return {
            id: post.id,
            title: post.title,
            publishedDate: dayjs(post.publishedDate).format("YYYY-MM-DD"),
            featuredImage: post.featuredImage,
            authorName: post.authorName,
          };
        })
      );

      setLoading(false);

      return response;
    }

    let response: {
      total: number;
      items: BlogPost[];
    };

    getPosts();
  }, []);

  return (
    <div className="space-y-4">
      {loading === false && posts ? (
        <>
          <h1 className="mb-8">Total: {total}</h1>
          {posts?.map((post: BlogPost) => {
            return (
              <div key={post?.id} className="flex flex-col">
                <time>{dayjs(post.publishedDate).format("YYYY-MM-DD")}</time>
                <a className="text-slate-600 dark:text-slate-200" href={`/news/post?id=${post.id}`}>
                  {post.title}
                </a>
              </div>
            );
          })}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ContentfulPostList;
