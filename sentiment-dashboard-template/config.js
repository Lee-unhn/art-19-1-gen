// ============================================================
// 換活動時，主要改這個檔案和 data.js；src/ 底下的程式不用動。
// 範例：2026 臺灣國際兒童及青少年嘉年華（高雄，9/23–9/27）
// ============================================================
window.CONFIG = {
  title: '2026 臺灣國際兒童及青少年嘉年華 聲量監測台',
  subtitle: '2026/9/23–27 高雄展覽館、高雄總圖：媒體報導聲量、議題分布、單位被提及的情況（示範資料）',
  stamp: '資料截至 2026/09/29 · 公開新聞搜尋結果（示範）',

  // 聲量指標：'count' = 以則數計；'likes' = 以讚數合計（引用型貼文 q:true 不計）
  metric: 'count',
  metricLabel: '則',

  // 「重點立場」：時間軸、議題長條圖、網路圖聚焦在這個立場的貼文
  // 輿情事件用 neg（負面）；活動宣傳與口碑用 pos（正面）
  focus: { stance: 'pos', label: '正面報導' },
  stances: { neg: '負面', pos: '正面', neu: '中性' },

  // 三份資料表的顯示名稱；owner / coms 沒有資料時，相關區塊會自動隱藏
  groups: {
    posts: '媒體報導（關鍵字搜尋）',
    owner: '官方發布（主辦／官網）',
    coms: '官方貼文下的留言'
  },
  // coms 的 w 欄位對應的留言區（沒有留言資料可留空陣列）
  commentAreas: [],

  // 時間軸階段：d <= until 就屬於該階段（日期格式 MM/DD）
  phases: [
    { label: '宣傳期', until: '09/22', color: 'neu' },
    { label: '展期', until: '09/27', color: 'event' },
    { label: '閉幕後', until: '12/31', color: 'pol' }
  ],
  // 時間軸上的關鍵事件（紅色三角形）
  markers: [
    { date: '09/26', label: '中秋連假首日，入場破 10 萬人次' },
    { date: '09/27', label: '閉幕，宣布 2027 年由臺南接辦' }
  ],

  // 議題字典：代碼 → 顯示名稱、色系（event / pol / pos / neu / accent）
  topics: {
    A: { label: '人潮與入場規模', color: 'event' },
    B: { label: '排隊、領號碼牌', color: 'accent' },
    C: { label: '書展與親子購書', color: 'pos' },
    D: { label: '表演節目', color: 'pol' },
    E: { label: '校園參訪與教育推廣', color: 'neu' },
    F: { label: '開幕與內容介紹', color: 'neu' },
    G: { label: '交通與輕軌接駁', color: 'accent' },
    H: { label: '閉幕與後續（2027、巡迴）', color: 'pol' }
  },

  // 留言類別（沒有留言資料時可不填）。match 是關鍵字規則，沒手動標 c 的留言會自動歸類
  cats: {
    praise: { label: '稱讚活動', color: 'pos', match: /讚|好玩|推|棒|喜歡/ },
    ops: { label: '動線、排隊、營運', color: 'event', match: /排隊|人多|擠|動線|停車/ },
    other: { label: '其他反應', color: 'neu' }
  },

  // 實體（單位／品牌／人物）：match 命中內文或帳號名稱時，自動填入 e 欄位
  entities: {
    moc: { label: '文化部', note: '主辦機關', match: /文化部/ },
    khh: { label: '高雄市政府', note: '在地合作、場館', match: /高雄市政府|高雄市觀光|khh\.travel|高雄展覽館|高雄總圖/ },
    tiffi: { label: '兒童影展（Tiffi）', note: '影展單元', match: /Tiffi|兒童影展|TICFF/i },
    pf: { label: '紙風車劇團', note: '《諸葛四郎》演出', match: /紙風車|諸葛四郎/ }
  },

  // 實體查證卡片（選填）。ver 的第一欄：ok 有依據 / part 部分有依據 / no 無法查證
  entityCards: [
    {
      key: 'moc', name: '文化部', role: '本屆嘉年華主辦機關',
      src: '官方新聞稿與多家媒體報導都寫明由文化部主辦，首度結合閱讀、表演藝術與電影',
      echo: '各家媒體皆轉述官方數據，沒有出現不同的說法',
      ver: [['ok', '文化部官網新聞稿：精彩內容先睹為快', 'https://www.moc.gov.tw/News_Content.aspx?n=105&s=262147']]
    },
    {
      key: 'pf', name: '紙風車劇團', role: '戶外舞台《諸葛四郎》演出',
      src: '多家媒體報導 9/26 晚間演出，觀賞人次逾 5,000',
      echo: '風傳媒、Yahoo 奇摩新聞、蕃新聞的標題都以此為亮點',
      ver: [['part', '人次數字出自媒體與主辦方說法，未見獨立統計', 'https://www.storm.mg/article/11167852']]
    }
  ],

  // KPI 卡片。ctx 內容見 src/lib.js 的 App.buildCtx
  // compute 回傳 [主數字, 副標]；alert:true 會用強調色
  kpis: [
    { label: '相關報導', compute: c => [c.posts.length, `${c.postAccts.size} 個媒體／帳號`] },
    { label: '正面報導', compute: c => [c.focus.length, `${new Set(c.focus.map(p => p.a)).size} 個媒體／帳號`] },
    { label: '單日峰值占比', compute: c => c.peakDay ? [Math.round(c.byDay[c.peakDay].v / c.totalV * 100) + '%', `${c.peakDay} 占重點立場聲量`] : ['–', ''] },
    { label: '官方發布', compute: c => [c.owner.length, `${new Set(c.owner.map(o => o.a)).size} 個官方管道`] },
    { label: '跨議題媒體', compute: c => [c.multiTopicAccts.length, '同時報導 2 個以上議題'] },
    { label: '提及紙風車的報導', alert: true, compute: c => [c.posts.filter(p => p.e.includes('pf')).length, '演出成為報導亮點'] }
  ],

  // 回覆關係的正則（選填；社群平台才有，例如 Threads 的「正在回覆 @xxx」）
  replyPattern: null,

  notes: [
    '資料範圍：2026/9/29 以公開新聞搜尋結果整理的標題與摘要，共 16 則報導、3 則官方發布。這份是「示範資料」，用來展示模板，不是完整的社群聲量調查。',
    '沒有抓到 Threads、Facebook 等社群貼文與留言，也沒有讚數，所以聲量以則數計，留言區塊自動隱藏。',
    '部分報導頁面無法開啟，日期只填能從標題、網址確認的；其餘留空，不會出現在時間軸上。立場（正面、中性）與議題是人工判讀。',
    '接上真實社群資料時，把 data.js 換成同格式的 JSON，並在這個檔案改 metric 為 likes 即可。'
  ]
};
