import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ReplaceRule = { from: string; to: string };

const STORAGE_KEY = "plainTextOptions";

const MdToPlainText: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const [removeBold, setRemoveBold] = useState(true);
  const [singleNewline, setSingleNewline] = useState(false);
  const [removeEmoji, setRemoveEmoji] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [filterWordsEnabled, setFilterWordsEnabled] = useState(true);
  const [filterWords, setFilterWords] = useState<string[]>([]);
  const [wordDraft, setWordDraft] = useState("");
  const [replaceRulesEnabled, setReplaceRulesEnabled] = useState(false);
  const [replaceRules, setReplaceRules] = useState<ReplaceRule[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // localStorage 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRemoveBold(parsed.removeBold ?? true);
        setSingleNewline(parsed.singleNewline ?? false);
        setRemoveEmoji(parsed.removeEmoji ?? false);
        setFilterWordsEnabled(parsed.filterWordsEnabled ?? true);
        setFilterWords(parsed.filterWords ?? []);
        setReplaceRulesEnabled(parsed.replaceRulesEnabled ?? false);
        setReplaceRules(parsed.replaceRules ?? []);
      } catch (e) {
        console.error("Failed to parse saved options", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // localStorage 저장
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        removeBold,
        singleNewline,
        removeEmoji,
        filterWordsEnabled,
        filterWords,
        replaceRulesEnabled,
        replaceRules,
      })
    );
  }, [
    removeBold,
    singleNewline,
    removeEmoji,
    filterWordsEnabled,
    filterWords,
    replaceRulesEnabled,
    replaceRules,
    isInitialized,
  ]);

  // 변환 파이프라인
  useEffect(() => {
    let result = input;

    // 1. 단어 필터링
    if (filterWordsEnabled) {
      filterWords.forEach((word) => {
        if (!word) return;
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(escaped, "gi"), "");
      });
    }

    // 2. 마크다운 제거
    result = result.replace(/^#+\s+/gm, ""); // 헤더
    result = result.replace(/^>\s+/gm, ""); // 인용
    result = result.replace(/^[*+-]\s+/gm, ""); // 리스트
    result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // 링크
    result = result.replace(/!\[([^\]]+)\]\([^)]+\)/g, "$1"); // 이미지

    // Bold/Italic
    if (removeBold) {
      result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");
      result = result.replace(/(\*|_)(.*?)\1/g, "$2");
    }

    // 여러 줄바꿈 축소
    if (singleNewline) {
      result = result.replace(/\n+/g, "\n\n");
    }

    // 이모지 제거
    if (removeEmoji) {
      result = result.replace(/\p{Extended_Pictographic}\u{FE0F}?\s*/gu, "");
    }

    // 치환 규칙
    if (replaceRulesEnabled) {
      replaceRules.forEach((rule) => {
        if (!rule.from) return;
        result = result.split(rule.from).join(rule.to ?? "");
      });
    }

    result = result.replace(/[ ]{2,}/g, " ").trim();
    setOutput(result);
  }, [
    input,
    removeBold,
    singleNewline,
    removeEmoji,
    filterWords,
    filterWordsEnabled,
    replaceRulesEnabled,
    replaceRules,
  ]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const addWord = () => {
    const w = wordDraft.trim();
    if (w && !filterWords.includes(w)) setFilterWords((prev) => [...prev, w]);
    setWordDraft("");
  };

  const inputBox =
    "w-full rounded-md border border-[rgb(var(--foreground))]/30 bg-transparent px-3 py-2 text-[rgb(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--foreground))]";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 왼쪽: 입력 + 옵션 */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-bold">마크다운 입력</label>
          <textarea
            className={`${inputBox} h-56 resize-none font-mono text-sm`}
            placeholder="내용을 입력하세요."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <fieldset className="rounded-md border border-[rgb(var(--foreground))]/30 p-3">
          <legend className="px-1 text-sm font-bold">옵션</legend>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={removeBold} onChange={(e) => setRemoveBold(e.target.checked)} />
              굵은 글씨(Bold) 문법 제거
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={singleNewline} onChange={(e) => setSingleNewline(e.target.checked)} />
              여러 줄 바꿈을 한 줄로 변경
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={removeEmoji} onChange={(e) => setRemoveEmoji(e.target.checked)} />
              이모지 제거
            </label>
          </div>

          {/* 단어 필터링 */}
          <div className="mt-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filterWordsEnabled}
                onChange={(e) => setFilterWordsEnabled(e.target.checked)}
              />
              단어 필터링 적용 (입력 후 Enter)
            </label>
            <div className={filterWordsEnabled ? "mt-2" : "mt-2 pointer-events-none opacity-50"}>
              <input
                type="text"
                className={`${inputBox} text-sm`}
                placeholder="필터링할 단어를 입력하세요."
                value={wordDraft}
                onChange={(e) => setWordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addWord();
                  }
                }}
              />
              {filterWords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filterWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--foreground))]/40 px-2 py-0.5 text-xs"
                    >
                      {word}
                      <button
                        type="button"
                        aria-label={`${word} 삭제`}
                        className="font-bold"
                        onClick={() => setFilterWords((prev) => prev.filter((w) => w !== word))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 치환 규칙 */}
          <div className="mt-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={replaceRulesEnabled}
                onChange={(e) => setReplaceRulesEnabled(e.target.checked)}
              />
              치환 적용
            </label>
            <div className={replaceRulesEnabled ? "mt-2 space-y-2" : "mt-2 space-y-2 pointer-events-none opacity-50"}>
              {replaceRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`source ${index + 1}`}
                    value={rule.from}
                    onChange={(e) =>
                      setReplaceRules((prev) => prev.map((r, i) => (i === index ? { ...r, from: e.target.value } : r)))
                    }
                    className={`${inputBox} text-sm`}
                  />
                  <input
                    type="text"
                    placeholder={`target ${index + 1}`}
                    value={rule.to}
                    onChange={(e) =>
                      setReplaceRules((prev) => prev.map((r, i) => (i === index ? { ...r, to: e.target.value } : r)))
                    }
                    className={`${inputBox} text-sm`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="행 삭제"
                    onClick={() => setReplaceRules((prev) => prev.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setReplaceRules((prev) => [...prev, { from: "", to: "" }])}
              >
                추가하기
              </Button>
            </div>
          </div>
        </fieldset>
      </div>

      {/* 오른쪽: 결과 */}
      <div className="flex flex-col">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-bold">결과</label>
          <div className="flex items-center gap-2">
            {isCopied && <span className="text-xs text-green-500">복사 완료!</span>}
            <Button size="sm" onClick={handleCopy} disabled={!output}>
              Copy
            </Button>
          </div>
        </div>
        <textarea
          className={`${inputBox} h-56 resize-none font-mono text-sm lg:h-full`}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="변환된 텍스트가 여기에 표시됩니다."
        />
      </div>
    </div>
  );
};

export default MdToPlainText;
