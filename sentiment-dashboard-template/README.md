# 活動聲量監測台模板

單一靜態網頁（原生 JS + D3），沒有後端與 build 流程，直接開 `index.html` 或丟到任何靜態空間即可。
範例資料是 2026 臺灣國際兒童及青少年嘉年華（高雄，9/23–27）的公開新聞整理，僅供示範。

## 換成新活動只要改兩個檔案

| 檔案 | 內容 |
|---|---|
| `config.js` | 標題、聲量指標（則數或讚數）、重點立場、階段分帶、關鍵事件、議題／留言類別／單位字典、KPI 定義、資料說明 |
| `data.js` | `posts`（主貼文或報導）、`owner`（官方自己發的）、`coms`（官方貼文下的留言），欄位縮寫見檔頭 |

`owner`、`coms` 沒資料時，對應的頁籤、圖表會自動隱藏。

## 程式結構（`src/`）

- `lib.js`：共用狀態 `App.st`、自動標記單位（`entities[].match`）與自動歸類留言（`cats[].match`）、統計用 `ctx`
- `kpis.js` / `timeline.js` / `bars.js` / `matrix.js` / `network.js` / `table.js`：各區塊各自獨立，只讀 `ctx` 與 config
- `main.js`：依序呼叫各區塊。新增圖表就寫一個 `App.renderXxx` 再加進來

所有圖表點擊只改 `App.st`，再呼叫 `App.render()`，表格是每個統計數字的原始依據。

## 接真實社群資料

1. 抓取結果整理成 `data.js` 同格式（日期用 `MM/DD`，日期不確定就留空字串）
2. `config.js` 把 `metric` 改成 `'likes'`，`focus.stance` 改成 `'neg'`（輿情事件）或 `'pos'`（口碑）
3. 有回覆關係的平台，設定 `replyPattern`，例如 `'正在回覆\\s?@([\\w.]+)'`

## 使用時注意

- 立場與議題是人工或關鍵字判讀，會誤判反諷與引用，敏感類別建議逐則複核
- 日期若由「N 小時前」倒推，會有半天到一天的誤差，請在 `notes` 註明
- 只涵蓋單一平台的關鍵字搜尋結果，有抽樣偏誤
- 頁面會顯示帳號與內文，公開前先評估個資與名譽風險，並把「事實」和「推論」分開標示

## 自動收集 Threads 貼文（`tools/`）

在自己的電腦執行（雲端沙盒連不上 Threads）：

```bash
cd tools
pip install -r requirements.txt && playwright install chromium
python collect_threads.py login    # 手動登入一次，登入狀態存在 tools/auth/（已加入 .gitignore）
# 編輯 collect.config.json：關鍵字、官方帳號、日期範圍、議題與立場關鍵字
python collect_threads.py run      # 搜尋 → 累積到 tools/collected/store.json → 寫出 ../data.js
```

- `collect.config.json` 是程式讀取的設定：`keywords`、`owner_accounts`、`window`、`must_match`（過濾不相關貼文）、`topics`（議題關鍵字，代碼要和 `config.js` 一致）、`stance`（正負面詞表）。
- 重複執行會累積並依連結去重；原本的示範資料會備份成 `data.sample.js`。
- 產出後把 `config.js` 的 `metric` 改成 `'likes'`，`focus.stance` 依需求選 `neg` 或 `pos`。
- 已測試：貼文解析、互動數換算（如 `2.5萬`）、日期推算、相關性過濾、分類、產出格式與儀表板讀取（用模擬頁面）。**尚未對真實 Threads 測試**，頁面改版時只需修 `collect_threads.py` 內的 `EXTRACT_JS`。
- 目前只收貼文與官方帳號頁，還沒有抓貼文底下的留言（`coms` 為空）。
- 立場與議題是關鍵字粗分，公開前請人工抽查。只收公開貼文、速度放慢，遇到登入牆會停下；請自行確認符合平台使用條款。
