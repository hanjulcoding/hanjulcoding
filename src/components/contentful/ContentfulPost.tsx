import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { client, type BlogPost } from "@/lib/contentful";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import parse from "html-react-parser";

import ContentfulImage from "@/components/contentful/ContentfulImage";

const ContentfulPost = () => {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  // 이미지 처리용 커스텀 렌더링 옵션
  const options = {
    renderNode: {
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const assetId = node.data.target.sys.id;
        return `<contentfulImage assetId="${assetId}"></contentfulImage>`;
      },
    },
  };

  useEffect(() => {
    async function getPost() {
      try {
        response = await client.getSinglePost(id || "");
      } catch (error) {
        return false;
      }

      setPost(response);
      setLoading(false);
      return response;
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const id = params.id;

    let response: BlogPost;

    getPost();
  }, []);

  return (
    <>
      {loading === false && post?.content ? (
        <>
          <h1>{post?.title}</h1>
          <div className="flex justify-between">
            <div>{post?.authorName}</div>
            <div>{dayjs(post?.publishedDate).format("YYYY-MM-DD HH:mm:ss")}</div>
          </div>
          <img src={post?.featuredImage} alt={post?.title} />
          {/* content가 존재할 때만 HTML 렌더링 */}
          {parse(documentToHtmlString(post.content, options), {
            replace: (domNode) => {
              // 특정 태그를 React 컴포넌트로 변환
              if ((domNode as any)?.name === "contentfulimage") {
                if ("attribs" in domNode) {
                  return <ContentfulImage assetId={domNode.attribs.assetid || ""} />;
                }
              }
            },
          })}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default ContentfulPost;
