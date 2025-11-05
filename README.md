## Teleprompter App (MVP)

### 專案介紹
純前端提詞器（SPA），以平滑滾動、快捷鍵與高對比呈現為核心。支援本機儲存設定，無需登入。

### 功能列表（MVP）
- 文字輸入/編輯、播放/暫停、速度控制（含預設檔 1/2/3）
- 字體大小、行距、行寬設定
- 對比模式（白/黑/黃）、鏡像（水平/垂直）
- 全螢幕、快捷鍵（Space/↑↓/1–3/M/F/Esc）
- localStorage 自動保存稿件與設定

### 需求
- Node 版本：見 `.nvmrc`（建議使用 nvm 對齊）

### 安裝與啟動
```bash
npm install
npm run dev
```

### 建置
```bash
npm run build
npm run preview
```

### 部署到 GitHub Pages（master 分支觸發）
1. 將 repository 的 Pages 來源設為 `gh-pages` 分支。
2. 推送到 `master` 後由 GitHub Actions 自動建置與部署。

### 授權
MIT
