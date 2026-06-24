---
category: trend
title: 한줄코딩 사이트 리뉴얼 작업기
author: 6lueparr0t
displayDate: 2026-06-24T00:00:00.000Z
pubDate: 2026-06-24T00:00:00.000Z
tags: 'astro, 리뉴얼'
---

## 리뉴얼 배경

오래 묵혀둔 사이트를 걷어내고 다시 정리했다. 더 이상 쓰지 않는 CMS와 외부 서비스를 들어내고, 글쓰기 흐름을 단순하게 다시 잡는 게 목표였다.

## 걷어낸 것들

기존에 얽혀 있던 도구들을 전부 제거했다.

- **TinaCMS**: 네이티브 모듈(`better-sqlite3`) 빌드 문제도 있어서 정리
- **Builder.io**: About 페이지의 랜딩 컴포넌트 제거
- **Contentful**: News 연동 및 관련 컴포넌트 제거

의존성과 환경변수, 죽은 링크(`/admin` 등)까지 같이 정리했다.

## Astro 7 + Tailwind 4 업그레이드

코어 스택을 최신으로 끌어올렸다.

1. **Astro 5 → 7**: 메이저 2단계 업그레이드 (새 Rust 컴파일러, Vite 8)
2. **Tailwind 3 → 4**: `@astrojs/tailwind`(폐기) 대신 `@tailwindcss/vite`로 전환
3. 기존 shadcn 토큰은 `@config`로 재사용해 재작성을 최소화

## Astro Editor로 글쓰기

글을 content collection으로 옮기고 Zod 스키마를 정의했다. 이제 [Astro Editor](https://github.com/dannysmith/astro-editor)로 프론트매터를 폼처럼 채워가며 글을 쓴다. 이 글도 그렇게 작성했다.

## News 게시판

블로그를 News로 바꾸면서 게시판에 필요한 기능을 붙였다.

- **검색**: 제목·태그 실시간 필터
- **페이징**: 페이지당 10개
- **태그 다중 선택**: 여러 태그를 동시에 골라 필터링

## 글 상세 — 목차

데스크탑에서는 본문 왼쪽에 목차(TOC)가 붙어 현재 위치를 따라 하이라이트된다. 지금 이 글 왼쪽에 보이는 게 그것이다.
