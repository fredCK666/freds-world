# Fred’s World — 曾慶寬個人作品集

Minecraft 風格的中英文個人作品集。完整靜態網站，包含背景影片、音樂連播、作品、技能、個人經歷與聯絡入口。

## 固定發布位置

目標儲存庫：`fredCK666/freds-world`。
GitHub Pages 使用 `main` 分支根目錄。首次建立儲存庫並啟用 Pages 後，預定網址為 https://fredck666.github.io/freds-world/ 。

之後新增作品與調整技能，統一更新這個儲存庫。GitHub Pages 會從 main 發布更新。

## 更新內容

- `app.js`：中英文內容、作品、技能、個人介紹與聯絡方式。
- `index.html`：主頁與音樂控制列。
- `style.css`、`pixel.css`：版面與像素字型。
- `music.js`、`tracks.js`：音樂播放器與歌單。
- `assets/`：影片、圖片、字型、音樂與音效。

作品在 `app.js` 的 projects 中維護；順風計程車會自動排在最後並重新編號。更新腳本或樣式後，同步增加 index.html 對應的 ?v= 版本，避免瀏覽器快取舊內容。

無需建置。保留 `.nojekyll`，所有本機素材使用相對路徑，支援 GitHub Pages 子目錄。

Minecraft 與 C418 配樂的原作者資訊保留於網站與歌單；本網站不是 Minecraft 官方網站。
