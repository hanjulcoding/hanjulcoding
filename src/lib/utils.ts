import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatedDateSort(a: Record<string, any>, b: Record<string, any>) {
  const dateA = new Date(a.frontmatter.generatedDate);
  const dateB = new Date(b.frontmatter.generatedDate);

  return dateB.getTime() - dateA.getTime();
}
