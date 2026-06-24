# hanjulcoding

한줄코딩

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                            |
| :------------------------ | :------------------------------------------------ |
| `pnpm install`            | Installs dependencies                             |
| `pnpm run dev`            | Starts local dev server at `localhost:4321`       |
| `pnpm run build`          | Build your production site to `./dist/`           |
| `pnpm dlx`                | Executes a package without installing it globally |

## 📚 Framework & Library

- <https://docs.astro.build/ko/getting-started>
- <https://ko.vitejs.dev>
- <https://tailwindcss.com>

## 📡 RSS 구독

새 글이 올라오면 RSS 리더로 자동으로 받아볼 수 있습니다. 아래 피드 주소를 리더에 추가하세요.

```text
https://hanjulcoding.com/rss.xml
```

- **RSS 리더 예시**: Feedly, Inoreader, NetNewsWire(macOS/iOS), Thunderbird, Vivaldi 등
- 대부분의 리더에서 `피드 추가 / Add feed`에 위 주소를 붙여넣으면 구독됩니다.
- 피드는 [@astrojs/rss](https://docs.astro.build/ko/guides/rss/)로 `posts` 콜렉션에서 자동 생성됩니다 (소스: [src/pages/rss.xml.js](src/pages/rss.xml.js)).
