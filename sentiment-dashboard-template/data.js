// 資料格式（欄位縮寫）：
//  posts : 主貼文／報導  a 帳號或媒體  d 日期 MM/DD（不確定就留 ''）  s 立場 neg|pos|neu
//          t 議題代碼  l 讚數  q 是否引用他人貼文  x 內文或標題摘要  u 連結  e 提及實體（可省略，會自動標）
//  owner : 官方或主辦方自己發的貼文  a、k(post|reply)、lab、d、l、x、u
//  coms  : 官方貼文下的留言  a、w(留言區代碼)、c(類別陣列，可省略)、l、x、u
// 以下為 2026/9/29 公開新聞搜尋結果整理（標題大意，非全文）。
window.DATA = {
  posts: [
    { a: '自由時報', d: '09/26', s: 'pos', t: 'A', l: 0, q: false, x: '連假首日單日湧入逾 10 萬人，家長形容是「最強放電神器」', u: 'https://news.ltn.com.tw/news/Kaohsiung/breakingnews/5586599' },
    { a: '自由時報', d: '09/27', s: 'pos', t: 'A', l: 0, q: false, x: '高雄兒少嘉年華 2 天湧進 10 萬人', u: 'https://news.ltn.com.tw/news/Kaohsiung/paper/1772327' },
    { a: 'Newtalk新聞', d: '09/26', s: 'pos', t: 'B', l: 0, q: false, x: '湧逾 10 萬人，表演與書攤大排長龍；小豬探舞台劇開演前 3 小時就有人排隊領號碼牌', u: 'https://newtalk.tw/news/view/2026-09-26/1062036' },
    { a: '聯合新聞網', d: '09/26', s: 'pos', t: 'B', l: 0, q: false, x: '國際兒少嘉年華人潮湧現，表演、書攤大排長龍', u: 'https://udn.com/news/story/7327/9778679' },
    { a: '中央社', d: '09/26', s: 'pos', t: 'A', l: 0, q: false, x: '國際兒少嘉年華湧逾 10 萬人，連假首日熱鬧', u: 'https://www.cna.com.tw/news/aloc/202609260059.aspx' },
    { a: '風傳媒', d: '09/26', s: 'pos', t: 'D', l: 0, q: false, x: '中秋首日 10 萬人次湧進展覽館，紙風車《諸葛四郎》嗨翻全場', u: 'https://www.storm.mg/article/11167852' },
    { a: 'Yahoo奇摩新聞', d: '09/26', s: 'pos', t: 'D', l: 0, q: false, x: '首日破 10 萬人次，紙風車《諸葛四郎》引爆最高潮，展期至 9/27', u: 'https://tw.news.yahoo.com/%E5%9C%8B%E9%9A%9B%E5%85%92%E5%B0%91%E5%98%89%E5%B9%B4%E8%8F%AF%E9%A6%96%E6%97%A5%E7%A0%B410%E8%90%AC%E4%BA%BA%E6%AC%A1%E6%B9%A7-%E7%B4%99%E9%A2%A8%E8%BB%8A-%E8%AB%B8%E8%91%9B%E5%9B%9B%E9%83%8E-%E5%BC%95%E7%88%86%E6%9C%80%E9%AB%98%E6%BD%AE-%E5%B1%95%E6%9C%9F%E8%87%B39-155344431.html' },
    { a: '蕃新聞', d: '09/26', s: 'pos', t: 'D', l: 0, q: false, x: '首日破 10 萬人次，紙風車《諸葛四郎》引爆最高潮', u: 'https://n.yam.com/Article/20260926183406' },
    { a: 'Yahoo奇摩新聞', d: '09/26', s: 'pos', t: 'C', l: 0, q: false, x: '連假首日兒少書展人潮湧現，看書、看戲、逛市集，世界青年創作者齊聚高雄', u: 'https://tw.news.yahoo.com/%E4%B8%AD%E7%A7%8B%E9%80%A3%E5%81%87%E9%A6%96%E6%97%A5%E8%87%BA%E7%81%A3%E5%9C%8B%E9%9A%9B%E5%85%92%E5%B0%91%E6%9B%B8%E5%B1%95%E4%BA%BA%E6%BD%AE%E6%B9%A7%E7%8F%BE-%E7%9C%8B%E6%9B%B8-%E7%9C%8B%E6%88%B2-%E9%80%9B%E5%B8%82%E9%9B%86-%E4%B8%96%E7%95%8C%E9%9D%92%E5%B9%B4%E5%89%B5%E4%BD%9C%E8%80%85%E9%BD%8A%E8%81%9A%E9%AB%98%E9%9B%84%E8%B6%85chill-154301602.html' },
    { a: '青年日報', d: '', s: 'pos', t: 'F', l: 0, q: false, x: '2026 年臺灣國際兒童及青少年嘉年華高雄盛大開幕', u: 'https://today.line.me/tw/v3/article/rmpml08' },
    { a: '臺灣導報', d: '', s: 'pos', t: 'F', l: 0, q: false, x: '嘉年華盛大開幕，法國為主題國，紀念《小王子》出版 80 週年', u: 'https://taiwanreports.com/archives/1014958' },
    { a: '臺灣郵報', d: '09/16', s: 'neu', t: 'G', l: 0, q: false, x: '輕軌彩繪專車 9/16 開跑，移動式藝文體驗串聯港灣', u: 'https://taiwanpost.net/2026/taidaily/168832' },
    { a: 'Yahoo奇摩新聞', d: '', s: 'neu', t: 'E', l: 0, q: false, x: '學校參訪最高補助 6,000 元，98 校、3,095 名學生參與', u: 'https://tw.news.yahoo.com/2026%E8%87%BA%E7%81%A3%E5%9C%8B%E9%9A%9B%E5%85%92%E7%AB%A5%E5%8F%8A%E9%9D%92%E5%B0%91%E5%B9%B4%E5%98%89%E5%B9%B4%E8%8F%AF-%E5%AD%B8%E6%A0%A1%E5%8F%83%E8%A8%AA%E6%9C%80%E9%AB%98%E8%A3%9C%E5%8A%A96000%E5%85%83-092908114.html' },
    { a: 'NOWnews今日新聞', d: '09/27', s: 'pos', t: 'H', l: 0, q: false, x: '嘉年華圓滿閉幕', u: 'https://www.nownews.com/news/6878631' },
    { a: 'Yahoo奇摩新聞', d: '09/27', s: 'pos', t: 'H', l: 0, q: false, x: '嘉年華圓滿閉幕，同時宣布 2027 年交棒臺南', u: 'https://tw.news.yahoo.com/2026%E5%B9%B4%E8%87%BA%E7%81%A3%E5%9C%8B%E9%9A%9B%E5%85%92%E7%AB%A5%E5%8F%8A%E9%9D%92%E5%B0%91%E5%B9%B4%E5%98%89%E5%B9%B4%E8%8F%AF%E5%9C%93%E6%BB%BF%E9%96%89%E5%B9%95-%E5%90%8C%E6%99%82%E5%AE%A3%E5%B8%832027%E4%BA%A4%E6%A3%92%E8%87%BA%E5%8D%97-120146433.html' },
    { a: '立報傳媒', d: '', s: 'neu', t: 'H', l: 0, q: false, x: '閉幕不只收尾，文化部定調後續巡迴各縣市', u: 'https://www.limedia.tw/edu/74136/' }
  ],
  owner: [
    { a: '文化部', k: 'post', lab: '新聞稿', d: '', l: 0, x: '2026 年臺灣國際兒童及青少年嘉年華精彩內容先睹為快：未來世代書展、Young Boom! 劇場、Tiffi 兒童及青少年影展', u: 'https://www.moc.gov.tw/News_Content.aspx?n=105&s=262147' },
    { a: '高雄市觀光（khh.travel）', k: 'post', lab: '活動頁', d: '', l: 0, x: '活動行事曆：2026 臺灣國際兒童及青少年嘉年華', u: 'https://khh.travel/zh-tw/event/calendardetail/7989/' },
    { a: 'TICFF 官網', k: 'post', lab: '公告', d: '', l: 0, x: '2026 年嘉年華 9 月高雄登場，未來世代跨域多元藝文體驗', u: 'https://www.ticff.org.tw/zh_tw/more_announcement/2026%E5%B9%B4%E8%87%BA%E7%81%A3%E5%9C%8B%E9%9A%9B%E5%85%92%E7%AB%A5%E5%8F%8A%E9%9D%92%E5%B0%91%E5%B9%B4%E5%98%89%E5%B9%B4%E8%8F%AF9%E6%9C%88%E9%AB%98%E9%9B%84%E7%99%BB%E5%A0%B4-%E6%9C%AA%E4%BE%86%E4%B8%96%E4%BB%A3%E8%B7%A8%E5%9F%9F%E5%A4%9A%E5%85%83%E8%97%9D%E6%96%87%E9%AB%94%E9%A9%97-17812869' }
  ],
  coms: []
};
