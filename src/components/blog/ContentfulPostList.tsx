import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { client, type BlogPost } from "@/lib/contentful";

const ContentfulPostList = () => {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    async function getPosts() {
      try {
        response = (await client.getAllPosts()).map((post: BlogPost) => {
          return {
            id: post.id,
            title: post.title,
            publishedDate: dayjs(post.publishedDate).format("YYYY-MM-DD"),
            featuredImage: post.featuredImage,
            authorName: post.authorName,
          };
        });
      } catch (error) {
        return false;
      }

      setPosts(response);
      return response;
    }

    let response: BlogPost[];

    getPosts();
  }, []);

  return (
    <>
      <div className="space-y-4">
        {posts?.map((post: BlogPost) => {
          return (
            <>
              <div className="flex flex-col">
                <time>{dayjs(post.publishedDate).format("YYYY-MM-DD")}</time>
                <a className="text-slate-600 dark:text-slate-200" href={`/blog/post?id=${post.id}`}>
                  {post.title}
                </a>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default ContentfulPostList;
