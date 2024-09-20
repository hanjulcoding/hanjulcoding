import * as contentful from "contentful";

type AvatarImageEntrySkeleton = {
  contentType: contentful.EntryFieldTypes.Text;
  details: {
    image: { width: contentful.EntryFieldTypes.Number; height: contentful.EntryFieldTypes.Number };
    size: contentful.EntryFieldTypes.Number;
  };
  fileName: string;
  url: string;
};

type ImageEntrySkeleton = {
  contentTypeId: "featuredImage";
  fields: {
    title: string;
    file: AvatarImageEntrySkeleton;
  };
};

type AvatarEntrySkeleton = {
  contentTypeId: "avatar";
  fields: {
    title: contentful.EntryFieldTypes.Text;
    description: contentful.EntryFieldTypes.Text;
    file: AvatarImageEntrySkeleton;
  };
};

type AuthorEntrySkeleton = {
  contentTypeId: "author";
  fields: {
    internalName: contentful.EntryFieldTypes.Text;
    name: string;
    avatar: AvatarEntrySkeleton;
  };
};

export interface BlogPost {
  contentTypeId: "pageBlogPost";
  fields: {
    internalName: contentful.EntryFieldTypes.Text;
    slug: contentful.EntryFieldTypes.Text;
    author: contentful.EntryFieldTypes.Object<AuthorEntrySkeleton>;
    date: contentful.EntryFieldTypes.Date;
    title: contentful.EntryFieldTypes.Text;
    description: contentful.EntryFieldTypes.Text;
    featuredImage: contentful.EntryFieldTypes.Object<ImageEntrySkeleton>;
    content: contentful.EntryFieldTypes.RichText;
    relatedBlogPosts: contentful.EntryFieldTypes.Array<
      contentful.EntryFieldTypes.EntryLink<BlogPost>
    >;
  };
}

export const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
