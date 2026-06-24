# 한줄코딩 리뉴얼 작업 계획

> Builder.io / Contentful 완전 제거 + 메뉴 리뉴얼(Home · About · Recents).
> Recents는 Astro Editor로 작성하는 글 메뉴 (= 기존 Blog, content collection `posts` 기반).

## 목표

- [ ] Builder.io 의존성/코드 전부 제거
- [ ] Contentful 의존성/코드 전부 제거 (News 메뉴 폐지)
- [ ] 메뉴를 `Home · About · Recents` 3개로 단순화
- [ ] Recents = Astro Editor로 글 쓰는 메뉴 (이미 깔린 `posts` 컬렉션 사용)
- [ ] 빌드 통과(`pnpm build`) + 죽은 링크 정리

---

## 1. Builder.io 제거

| 항목 | 경로 | 처리 |
|---|---|---|
| Landing 컴포넌트 | `src/components/builder-io/Landing.tsx` | 삭제 |
| About 페이지 | `src/pages/about.astro` | `<Landing>` 제거 후 정적 About로 재작성 |
| 패키지 | `@builder.io/sdk-react` | `package.json`에서 제거 |
| 환경변수 | `PUBLIC_BUILDER_API_PUBLIC_KEY` | `src/env.d.ts`에서 제거 |

- [ ] `src/components/builder-io/` 디렉터리 삭제
- [ ] `about.astro` 재작성 (아래 4번 참고)
- [ ] `package.json` / `env.d.ts` 정리

## 2. Contentful 제거 (News 폐지)

| 항목 | 경로 | 처리 |
|---|---|---|
| API 래퍼 | `src/lib/contentful.ts` | 삭제 |
| 컴포넌트 | `src/components/contentful/` (Image, Post, PostList) | 디렉터리 삭제 |
| News 페이지 | `src/pages/news/` (index.astro, post.astro) | 디렉터리 삭제 |
| News 레이아웃 | `src/layouts/ContentfulPostLayout.astro` | 삭제 (news 전용) |
| 패키지 | `@contentful/rich-text-html-renderer`, `@contentful/rich-text-types`, `html-react-parser` | 제거 (`html-react-parser`는 `ContentfulPost.tsx`에서만 사용) |
| 환경변수 | `PUBLIC_CONTENTFUL_SPACE_ID`, `PUBLIC_CONTENTFUL_DELIVERY_TOKEN` | `src/env.d.ts`에서 제거 |

- [ ] 위 파일/디렉터리 삭제
- [ ] `package.json` / `env.d.ts` 정리

## 3. 메뉴 리뉴얼 — `src/components/astro/Navigation.astro`

현재:
```js
const links = [
  { href: "/", text: "home" },
  { href: "/about", text: "about" },
  { href: "/news", text: "news" },   // 제거
  { href: "/blog", text: "blog" },   // → Recents
];
// + 개발용 Admin 링크(/admin/index.html) — Tina 제거로 죽은 링크
```

변경:
```js
const links = [
  { href: "/", text: "home" },
  { href: "/about", text: "about" },
  { href: "/recents", text: "recents" },
];
```

- [ ] `news` 링크 제거
- [ ] `blog` → `recents`로 변경
- [ ] 죽은 `Admin`(`/admin/index.html`) 링크 + `isDevelopment` 분기 제거

## 4. Recents (= 기존 Blog) — Astro Editor 글쓰기 메뉴

콘텐츠 기반은 이미 완료됨: `src/content.config.ts`의 `posts` 컬렉션 + Astro Editor 연동.
이번엔 **라우트 이름만 blog → recents로** 정리한다.

- [ ] `src/pages/blog/` → `src/pages/recents/`로 이름 변경 (`index.astro`, `[tag].astro`)
- [ ] 내부 링크 일괄 수정:
  - `src/layouts/MarkdownPostLayout.astro`: 태그 링크 `/blog/${tag}` → `/recents/${tag}`
  - `src/pages/recents/[tag].astro`: 뒤로가기 링크 `/blog` → `/recents`
- [ ] 글 작성은 Astro Editor에서 `posts` 컬렉션으로 (별도 코드 작업 없음)

> **결정 ①(확정)** — 글 상세 URL은 `/posts/[...slug]` 유지. 리스트=`/recents`, 글=`/posts`로 역할 분리.

### 4-1. Recents 게시판 기능 (검색 + 페이징)

정적 사이트라 별도 검색 서버 없이 **클라이언트 사이드**로 처리 (외부 의존성 추가 없음, 기존 인라인 스크립트 스타일 유지).

- [ ] 모든 글을 `/recents`에서 데이터로 렌더 후 vanilla JS로 제어
- [ ] **검색**: 입력창에서 제목 + 태그 기준 실시간 필터 (대소문자 무시)
- [ ] **페이징**: 페이지당 N개(기본 10), 이전/다음 + 페이지 번호. 검색 결과에도 페이징 적용
- [ ] 검색어/페이지 상태에 따라 목록·페이지네이션 갱신, 결과 0건 안내
- [ ] 스타일: 기존 `.tag`, `Post` 컴포넌트, gray 텍스트 클래스 등 현재 톤에 맞춤
- [ ] 태그 클릭 시 기존처럼 `/recents/[tag]`로 이동(태그별 목록은 유지)

> 글 수가 많아지면 [Pagefind](https://pagefind.app/) 같은 정적 검색 인덱스로 교체 검토 (지금은 불필요 — YAGNI)

### 4-2. 글 상세 페이지 — 좌측 TOC 네비게이션 (Desktop)

`src/pages/posts/[...slug].astro` + `src/layouts/MarkdownPostLayout.astro`

- [ ] `render(post)`의 `headings` 추출해 레이아웃으로 전달
- [ ] 마크다운 제목(h2/h3 등)으로 목차(TOC) 생성 — Astro가 heading에 자동 부여하는 `id`로 앵커 링크
- [ ] **Desktop**: 콘텐츠 좌측에 sticky 사이드바로 TOC 표시 (예: `md:` 이상에서 flex/grid 2열, 본문 `max-w` 유지)
- [ ] **Mobile**: TOC 숨김(기존 단일 컬럼 레이아웃 유지)
- [ ] (선택) 스크롤 위치에 따라 현재 섹션 하이라이트, 클릭 시 smooth scroll
- [ ] 제목 없는 글(예: shiba)은 TOC 자동 미표시

## 5. About 페이지 재작성 — `src/pages/about.astro`

Builder.io `<Landing>` 제거 후 정적 Astro 콘텐츠로.

- [ ] `BaseLayout` + 일반 마크업으로 자기소개/사이트 소개 작성
- [ ] (선택) About도 마크다운으로 쓰고 싶으면 `posts`와 별개 `about` 컬렉션 or 단일 `.astro`로

> **결정 필요 ②** — About 내용/구성 (직접 작성 vs 기존 텍스트 이관). 초안 필요하면 말해줘.

## 6. 정리 (죽은 링크 / 잔여물)

- [ ] `src/pages/index.astro`의 `/trend`, `/meme` 링크 — 해당 라우트 없음(죽은 링크). `/recents`로 연결하거나 제거
- [ ] `src/env.d.ts` — Contentful/Builder 환경변수 제거 후 남는 게 없으면 `ImportMetaEnv` 인터페이스 정리
- [ ] React 통합(`@astrojs/react`)은 **유지** — `src/components/test/Greeting`(index에서 `client:visible`)가 React라 필요

## 7. 검증

- [ ] `pnpm install` (제거된 패키지 반영)
- [ ] `pnpm build` → `astro check` 0 errors + 페이지 빌드 성공
- [ ] 남은 라우트 확인: `/`, `/about`, `/recents`, `/recents/[tag]`, `/posts/[...slug]`, `/rss.xml`
- [ ] `/news`, `/admin`, builder/contentful import 잔재 없는지 grep

---

## 제거 후 최종 라우트(예상)

```
/                     Home
/about                About (정적)
/recents              Recents 글 목록 (구 /blog)
/recents/[tag]        태그별 목록
/posts/[...slug]      글 상세 (Astro Editor로 작성)
/rss.xml              RSS
/404, /500
```

## 미리 정할 것 2가지

1. 글 상세 URL을 `/posts` 유지 vs `/recents`로 이동 (위 추천: 유지)
2. About 페이지 내용/구성
