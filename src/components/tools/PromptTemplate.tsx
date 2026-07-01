import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  body: string;
  replacements?: Record<string, string>;
}
interface Draft {
  id?: string;
  name: string;
  body: string;
}

const STORAGE_KEY = "promptTemplates";
// {{ ... }} 사이의 내용(한글 등 포함)은 } 만 아니면 모두 변수로 인식
const VAR_RE = /\{\{\s*([^}]+?)\s*\}\}/g;

// 본문에서 {{변수}} 토큰을 모두 추출 (중복 제거, 등장 순서 유지)
function extractVariables(body: string): string[] {
  const out = new Set<string>();
  const re = new RegExp(VAR_RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.add(m[1]!);
  return [...out];
}

const inputBox =
  "w-full rounded-md border border-[rgb(var(--foreground))]/30 bg-transparent px-3 py-2 text-[rgb(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--foreground))]";

const PromptTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [replacements, setReplacements] = useState<Record<string, string>>({});
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // localStorage 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved templates", e);
      }
    }
    setLoaded(true);
  }, []);

  // localStorage 저장
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates, loaded]);

  const vars = useMemo(() => (draft ? extractVariables(draft.body) : []), [draft]);

  // 치환된 최종 본문 (복사 대상)
  const resolved = useMemo(() => {
    if (!draft) return "";
    return draft.body.replace(new RegExp(VAR_RE), (_m, name: string) => replacements[name] || `{{${name}}}`);
  }, [draft, replacements]);

  const openTemplate = (t: Template) => {
    setSelectedId(t.id);
    setDraft({ id: t.id, name: t.name, body: t.body });
    setReplacements(t.replacements ?? {});
  };

  const startNew = () => {
    setSelectedId(null);
    setDraft({ name: "", body: "" });
    setReplacements({});
  };

  const cancel = () => {
    setSelectedId(null);
    setDraft(null);
    setReplacements({});
  };

  // 커서 위치에 {{varN}} 삽입 (N은 기존 varN 다음 번호)
  const insertVariable = () => {
    if (!draft) return;
    const nums = [...draft.body.matchAll(/\{\{\s*var(\d+)\s*\}\}/g)].map((m) => Number(m[1]));
    const token = `{{var${(nums.length ? Math.max(...nums) : 0) + 1}}}`;
    const ta = bodyRef.current;
    const start = ta?.selectionStart ?? draft.body.length;
    const end = ta?.selectionEnd ?? draft.body.length;
    const next = draft.body.slice(0, start) + token + draft.body.slice(end);
    setDraft({ ...draft, body: next });
    setTimeout(() => {
      if (ta) {
        ta.focus();
        const pos = start + token.length;
        ta.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  // 변수명 변경: 본문 토큰 일괄 치환 + 치환값 키 이동
  const renameVariable = (oldName: string, raw: string) => {
    const newName = raw.trim();
    setEditingVar(null);
    if (!draft || !newName || newName === oldName) return;
    if (/[{}]/.test(newName)) return; // 중괄호는 토큰을 깨므로 금지
    const esc = oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\{\\{\\s*${esc}\\s*\\}\\}`, "g");
    setDraft({ ...draft, body: draft.body.replace(re, `{{${newName}}}`) });
    setReplacements((prev) => {
      if (!(oldName in prev)) return prev;
      const next = { ...prev };
      next[newName] = next[oldName]!;
      delete next[oldName];
      return next;
    });
  };

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const id = draft.id ?? crypto.randomUUID();
    // 본문에 현존하는 변수의 치환값만 저장 (삭제된 변수 값은 버림)
    const kept = Object.fromEntries(vars.filter((v) => replacements[v]).map((v) => [v, replacements[v]!]));
    const tpl: Template = { id, name: draft.name.trim(), body: draft.body, replacements: kept };
    setTemplates((prev) =>
      prev.some((t) => t.id === id) ? prev.map((t) => (t.id === id ? tpl : t)) : [...prev, tpl]
    );
    setSelectedId(id);
    setDraft({ ...draft, id });
  };

  const remove = () => {
    if (!draft?.id) return;
    if (!confirm(`"${draft.name}" 템플릿을 삭제할까?`)) return;
    setTemplates((prev) => prev.filter((t) => t.id !== draft.id));
    cancel();
  };

  const handleCopy = () => {
    if (!resolved) return;
    navigator.clipboard.writeText(resolved).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">템플릿</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            자주 쓰는 프롬프트를 저장. 본문 안의{" "}
            <code className="rounded bg-[rgb(var(--foreground))]/10 px-1 text-xs">{"{{변수}}"}</code> 는 아래
            치환 폼에서 값을 채울 슬롯.
          </p>
        </div>
        <Button onClick={startNew}>+ 새 템플릿</Button>
      </div>

      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* 목록 */}
        <div className="rounded-lg border border-[rgb(var(--foreground))]/30">
          {templates.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">아직 템플릿이 없어.</div>
          ) : (
            <ul className="divide-y divide-[rgb(var(--foreground))]/15">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openTemplate(t)}
                    className={`w-full truncate px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === t.id
                        ? "bg-[rgb(var(--foreground))]/10 font-medium"
                        : "text-gray-600 hover:bg-[rgb(var(--foreground))]/5 dark:text-gray-300"
                    }`}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 편집 영역 */}
        <div className="flex flex-col rounded-lg border border-[rgb(var(--foreground))]/30 p-4">
          {!draft ? (
            <div className="m-auto text-sm text-gray-500 dark:text-gray-400">
              좌측에서 템플릿 선택 또는 “새 템플릿”.
            </div>
          ) : (
            <>
              {/* 제목 + 액션 버튼 */}
              <div className="flex items-center justify-between gap-2">
                <input
                  className={`${inputBox} max-w-sm`}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="템플릿 이름"
                />
                <div className="flex items-center gap-1">
                  {isCopied && <span className="mr-1 text-xs text-green-500">복사 완료!</span>}
                  <Button size="sm" disabled={!draft.name.trim()} onClick={save}>
                    저장
                  </Button>
                  <Button size="sm" variant="outline" disabled={!draft.body} onClick={handleCopy}>
                    복사
                  </Button>
                  {draft.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="삭제"
                      className="text-gray-500 hover:text-red-500"
                      onClick={remove}
                    >
                      🗑
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" aria-label="닫기" onClick={cancel}>
                    ×
                  </Button>
                </div>
              </div>

              {/* 본문 */}
              <div className="mt-4 flex flex-1 flex-col">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs text-gray-500 dark:text-gray-400">본문</label>
                  <Button size="sm" variant="outline" onClick={insertVariable}>
                    변수 삽입
                  </Button>
                </div>
                <textarea
                  ref={bodyRef}
                  className={`${inputBox} min-h-[220px] flex-1 resize-none font-mono text-sm`}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder={"예: {{var1}} 에 대해서 설명해줘"}
                />
              </div>

              {/* 변수 치환 */}
              <div className="mt-4">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  변수 치환 <span className="opacity-70">(변수명 더블클릭 시 이름 변경)</span>
                </p>
                {vars.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    본문에 <code className="rounded bg-[rgb(var(--foreground))]/10 px-1">{"{{변수}}"}</code> 를
                    추가하면 여기서 값을 채울 수 있어.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-md border border-[rgb(var(--foreground))]/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[rgb(var(--foreground))]/20 text-left text-xs text-gray-500 dark:text-gray-400">
                          <th className="w-1/3 px-3 py-2 font-medium">source</th>
                          <th className="px-3 py-2 font-medium">target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vars.map((v) => (
                          <tr key={v} className="border-b border-[rgb(var(--foreground))]/10 last:border-0">
                            <td className="px-3 py-1.5 align-middle">
                              {editingVar === v ? (
                                <input
                                  autoFocus
                                  className={`${inputBox} h-8 text-sm`}
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  onBlur={() => renameVariable(v, editingName)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") renameVariable(v, editingName);
                                    if (e.key === "Escape") setEditingVar(null);
                                  }}
                                />
                              ) : (
                                <code
                                  className="cursor-pointer rounded bg-[rgb(var(--foreground))]/10 px-1.5 py-0.5"
                                  title="더블클릭하여 변수명 변경"
                                  onDoubleClick={() => {
                                    setEditingVar(v);
                                    setEditingName(v);
                                  }}
                                >
                                  {v}
                                </code>
                              )}
                            </td>
                            <td className="px-3 py-1.5">
                              <input
                                className={`${inputBox} h-8 text-sm`}
                                placeholder={`${v} 치환값`}
                                value={replacements[v] ?? ""}
                                onChange={(e) =>
                                  setReplacements((prev) => ({ ...prev, [v]: e.target.value }))
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTemplate;
