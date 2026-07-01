import { useEffect, useRef } from "react";

// giscus.app 에서 발급된 설정값 (공개 식별자라 노출되어도 무방).
const GISCUS = {
  repo: "hanjulcoding/hanjulcoding",
  repoId: "R_kgDOGoe5eQ",
  category: "General",
  categoryId: "DIC_kwDOGoe5ec4DAQkl",
};

// 기존 utterances를 대체. mapping="pathname"으로 페이지 경로 기준 매핑.
export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.querySelector("iframe.giscus-frame")) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({
      "data-repo": GISCUS.repo,
      "data-repo-id": GISCUS.repoId,
      "data-category": GISCUS.category,
      "data-category-id": GISCUS.categoryId,
      "data-mapping": "pathname",
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "bottom",
      "data-theme": "preferred_color_scheme",
      "data-lang": "ko",
    }).forEach(([k, v]) => script.setAttribute(k, v));
    el.appendChild(script);
  }, []);

  return <div ref={ref} className="giscus mt-8" />;
}
