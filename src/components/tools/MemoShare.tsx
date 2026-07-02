import { Share1Icon } from "@radix-ui/react-icons";
import React, { useEffect, useRef, useState } from "react";

import Giscus from "@/components/Giscus";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "memoShareDraft";
const MAX_URL_LEN = 2000; // 브라우저/서버 안전 한도

// --- deflate-raw + base64url 인코딩 (의존성 0, 브라우저 네이티브) ---
function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(b64: string): Uint8Array {
  const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function encodeMemo(text: string): Promise<string> {
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(text) as BufferSource);
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return bytesToBase64url(new Uint8Array(buf));
}

async function decodeMemo(payload: string): Promise<string> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(base64urlToBytes(payload) as BufferSource);
  writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

const MemoShare: React.FC = () => {
  const [input, setInput] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [urlLen, setUrlLen] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [overLimit, setOverLimit] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [base, setBase] = useState("");
  const baseLenRef = useRef(0);

  // 최초 로드: URL 해시(#d=) 우선, 없으면 localStorage 초안 복원
  useEffect(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    setBase(base);
    baseLenRef.current = base.length + 3; // "#d=" 3자

    const hash = window.location.hash;
    if (hash.startsWith("#d=")) {
      decodeMemo(hash.slice(3))
        .then(setInput)
        .catch(() => setInput(""));
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setInput(saved);
    }
    setIsInitialized(true);
  }, []);

  // 초안 자동 저장
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY, input);
  }, [input, isInitialized]);

  // 타이핑이 멈추면(500ms) URL 생성 + 잔여 용량 체크
  useEffect(() => {
    if (!isInitialized) return;
    if (!input) {
      setShareUrl("");
      setUrlLen(0);
      setRemaining(null);
      setOverLimit(false);
      return;
    }
    const timer = setTimeout(async () => {
      const payload = await encodeMemo(input);
      const base = `${window.location.origin}${window.location.pathname}`;
      const url = `${base}#d=${payload}`;
      const budget = MAX_URL_LEN - baseLenRef.current;
      const over = payload.length > budget;
      // 관측된 압축비로 잔여 입력 가능 글자수 추정
      const bytesPerChar = payload.length / input.length;
      const est = Math.max(0, Math.floor((budget - payload.length) / bytesPerChar));

      setShareUrl(url);
      setUrlLen(url.length);
      setOverLimit(over);
      setRemaining(over ? 0 : est);
    }, 500);
    return () => clearTimeout(timer);
  }, [input, isInitialized]);

  const handleCopy = () => {
    if (!shareUrl || overLimit) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  const inputBox =
    "w-full rounded-md border border-[rgb(var(--foreground))]/30 bg-transparent px-3 py-2 text-[rgb(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--foreground))]";

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex items-center justify-end gap-2">
            {isCopied && <span className="text-xs text-green-500">복사 완료!</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!shareUrl || overLimit}
              aria-label="공유 URL 복사"
            >
              <Share1Icon className="h-4 w-4" />
            </Button>
          </div>
          <textarea
            className={`${inputBox} h-72 resize-none font-mono text-sm`}
            placeholder="공유할 메모를 입력하세요. 서버 저장 없이 URL 안에 내용이 담겨요."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {overLimit ? (
              <span className="text-red-500">URL 한도 초과 — 내용을 줄여주세요</span>
            ) : remaining !== null ? (
              <>URL {urlLen}/{MAX_URL_LEN}자 · 약 {remaining}자 더 입력 가능</>
            ) : (
              <>URL {urlLen}/{MAX_URL_LEN}자</>
            )}
          </div>
        </div>

        <textarea
          readOnly
          title="클릭하면 URL이 복사돼요"
          className={`${inputBox} h-20 cursor-pointer resize-none break-all font-mono text-xs`}
          value={shareUrl || base}
          onClick={handleCopy}
        />

        <div className="flex justify-center">
          <Button variant="destructive" size="sm" onClick={handleReset} disabled={!input}>
            초기화
          </Button>
        </div>
      </div>
      <Giscus />
    </>
  );
};

export default MemoShare;
