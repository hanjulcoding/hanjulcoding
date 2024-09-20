import { type EntryFieldTypes, createClient } from "contentful";

type AvatarImageEntrySkeleton = {
  contentType: EntryFieldTypes.Text;
  details: {
    image: { width: EntryFieldTypes.Number; height: EntryFieldTypes.Number };
    size: EntryFieldTypes.Number;
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
    title: EntryFieldTypes.Text;
    description: EntryFieldTypes.Text;
    file: AvatarImageEntrySkeleton;
  };
};

type AuthorEntrySkeleton = {
  contentTypeId: "author";
  fields: {
    internalName: EntryFieldTypes.Text;
    name: string;
    avatar: AvatarEntrySkeleton;
  };
};

export interface BlogPost {
  contentTypeId: "pageBlogPost";
  fields: {
    internalName: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    author: EntryFieldTypes.Object<AuthorEntrySkeleton>;
    publishedDate: EntryFieldTypes.Date;
    title: EntryFieldTypes.Text;
    description: EntryFieldTypes.Text;
    featuredImage: EntryFieldTypes.Object<ImageEntrySkeleton>;
    content: EntryFieldTypes.RichText;
    relatedBlogPosts: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<BlogPost>>;
  };
}

export const contentfulClient = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
