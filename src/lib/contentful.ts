import contentful, { type EntryFieldTypes } from "contentful";
import dotenv from 'dotenv';

dotenv.config();

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
  contentTypeId: "blogPost";
  fields: {
    internalName: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    author: EntryFieldTypes.Object<AuthorEntrySkeleton>;
    date: EntryFieldTypes.Date;
    title: EntryFieldTypes.Text;
    description: EntryFieldTypes.Text;
    featuredImage: EntryFieldTypes.Object<ImageEntrySkeleton>;
    content: EntryFieldTypes.RichText;
    relatedBlogPosts: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<BlogPost>>;
  };
}

export const contentfulClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken:
    (process.env?.DEV
      ? process.env.CONTENTFUL_PREVIEW_TOKEN
      : process.env.CONTENTFUL_DELIVERY_TOKEN) ?? "",
  host: process.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});
