# CardFlow 點數作業管理台

公開展示網址：https://fredck666.github.io/freds-world/cardflow-demo/

此資料夾是本專案後續修改與部署的固定來源；更新提交至 `fredCK666/freds-world` 的 `main` 分支，由既有 GitHub Pages 發布。請同步更新 HTML 中的靜態資源版本參數以避免舊快取。不要覆蓋根目錄的個人作品集。

## 檔案
- `index.html`、`login.js`：展示密碼入口。
- `app.html`、`app.js`、`style.css`：管理台與操作模擬。
- `gate.js`：分頁登入狀態及直接開啟管理台時的導回。

## 展示範圍
點卡 Excel／CSV 匯入、QR 圖片任務清單、模擬執行／暫停／停止、模擬批次鎖定、交易查詢、CSV 匯出與複製回覆。所有交易均為模擬，未串接 MyCard、QR 解碼或真實付款。

此密碼入口只提供前端展示流程；原始碼為公開靜態資源，並非安全驗證或存取控制。不得放入真實密鑰、正式卡密或客戶交易資料。登入狀態使用分頁 sessionStorage；重新整理會重置示範交易資料。
