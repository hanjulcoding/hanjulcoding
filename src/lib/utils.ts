import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pubDateSort(a: Record<string, any>, b: Record<string, any>) {
  const dateA = new Date(a.frontmatter.pubDate);
  const dateB = new Date(b.frontmatter.pubDate);

  return dateB.getTime() - dateA.getTime();
}
