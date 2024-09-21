import { useState, useEffect } from "react";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { client, type BlogPost } from "@/lib/contentful";

const ContentfulPost = () => {
  const [content, setContent] = useState<string | null>(null);
  useEffect(() => {
    async function getPost() {
      try {
        post = await client.getSinglePost(id || "");
      } catch (error) {
        return false;
      }

      setContent(documentToHtmlString(post.content.json));

      return post;
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const id = params.id;

    let post: BlogPost;

    getPost();
  }, []);

  return (
    // <div>
    //   <h1>{post.title}</h1>
    //   <img src={post.featuredImage} alt={post.title} />
    //   <div>{post.authorName}</div>
    //   <div>{post.publishedDate}</div>
    // </div>
    <>{content}</>
  );
};

export default ContentfulPost;
