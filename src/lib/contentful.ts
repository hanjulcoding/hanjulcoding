const SPACE =
  (import.meta.env.CONTENTFUL_SPACE_ID as string) ||
  (import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID as string);
const TOKEN =
  (import.meta.env.CONTENTFUL_DELIVERY_TOKEN as string) ||
  (import.meta.env.PUBLIC_CONTENTFUL_DELIVERY_TOKEN as string);

export interface BlogPost {
  id: string;
  title: string;
  publishedDate: string;
  featuredImage: string;
  authorName: string;
  content?: any; // 이 부분은 Contentful의 리치 텍스트 구조에 맞게 세분화할 수 있음
}

export interface Author {
  name: string;
  avatar: {
    url: string;
    description: string;
  };
  linkedFrom: {
    pageBlogPostCollection: {
      items: {
        title: string;
      }[];
    };
  };
}

async function apiCall(query: string, variables?: Record<string, any>): Promise<Response> {
  const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${SPACE}/environments/master`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  };
  return await fetch(fetchUrl, options);
}

async function getAllPosts(): Promise<BlogPost[]> {
  const query = `
    {
      pageBlogPostCollection {
        items {
          sys {
              id
          }
          title
          publishedDate
          author {
            name
          }
          featuredImage {
            url
          }
        }
      }
    }`;
  const response = await apiCall(query);
  const json = await response.json();
  return json.data.pageBlogPostCollection.items.map((post: any) => ({
    id: post.sys.id,
    title: post.title,
    publishedDate: post.publishedDate,
    featuredImage: post.featuredImage.url,
    authorName: post.author.name,
  }));
}

async function getSinglePost(id: string): Promise<BlogPost> {
  const query = `
    query ($id: String!) {
      pageBlogPost(id: $id) {
        title
        featuredImage {
          url
        }
        publishedDate
        content {
          json
        }
        author {
          sys {
            id
          }
          name
        }
      }
    }`;
  const variables = { id };
  const response = await apiCall(query, variables);
  const json = await response.json();
  const post = json.data.pageBlogPost;

  return {
    id: id,
    title: post.title,
    publishedDate: post.publishedDate,
    content: post.content.json,
    featuredImage: post.featuredImage.url,
    authorName: post.author.name,
  };
}

async function getAuthor(id: string): Promise<Author> {
  const query = `
    query ($id: String!) {
      componentAuthor(id: $id) {
        name
        avatar {
          url
          description
        }
        linkedFrom {
          pageBlogPostCollection {
            items {
              title
            }
          }
        }
      }
    }`;
  const variables = { id };
  const response = await apiCall(query, variables);
  const json = await response.json();
  return json.data.componentAuthor;
}

async function getRichImage(id: string) {
  const query = `
    query ($id: String!) {
      componentRichImage(id: $id) {
        internalName
        image {
          url
        }
      }
    }`;

  const variables = { id };
  const response = await apiCall(query, variables); // Contentful API 호출
  const json = await response.json();
  return json.data.componentRichImage;
}

export const client = { getAllPosts, getSinglePost, getAuthor, getRichImage };
