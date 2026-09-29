// 共用工具、狀態，以及把原始資料整理成統計用的 ctx
(function () {
  const C = window.CONFIG, D = window.DATA;
  const App = window.App = { C, D };

  App.$ = id => document.getElementById(id);
  App.css = v => `var(--${v})`;
  App.fmt = n => Number(n).toLocaleString('en-US');
  App.esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  // 所有圖表點擊、篩選器都只改這個 state，再呼叫 App.render() 重畫表格
  App.st = { tab: 'p', q: '', stance: '', topic: '', cat: '', day: '', ent: '', sort: 'd', dir: -1 };
  App.clearFilters = () => Object.assign(App.st, { q: '', stance: '', topic: '', cat: '', day: '', ent: '' });

  // 單則貼文對聲量的貢獻：count 模式算 1；likes 模式算讚數（引用型貼文互動屬於原文，不計）
  App.val = p => C.metric === 'count' ? 1 : (p.q ? 0 : p.l || 0);
  App.phaseIndex = d => { const i = C.phases.findIndex(p => d <= p.until); return i < 0 ? C.phases.length - 1 : i; };

  App.entChips = e => (e || []).map(k => `<span class="chip ech">${App.esc(C.entities[k] ? C.entities[k].label : k)}</span>`).join('');
  App.chipClass = color => 'c-' + (color || 'neu');

  // 補齊欄位：自動標實體、自動歸類留言
  ['posts', 'owner', 'coms'].forEach(t => { D[t] = D[t] || []; });
  const tagEntities = r => Object.keys(C.entities).filter(k => C.entities[k].match.test(`${r.x || ''} ${r.a || ''}`));
  [...D.posts, ...D.owner, ...D.coms].forEach(r => { if (!r.e) r.e = tagEntities(r); if (r.l == null) r.l = 0; });
  D.coms.forEach(c => {
    if (!c.c || !c.c.length) {
      c.c = Object.keys(C.cats).filter(k => C.cats[k].match && C.cats[k].match.test(c.x));
      if (!c.c.length) c.c = ['other'];
    }
  });

  // 統計用的中間結果，KPI、圖表共用
  App.buildCtx = function () {
    const posts = D.posts, focus = posts.filter(p => p.s === C.focus.stance);
    const byDay = {};
    focus.filter(p => p.d).forEach(p => { const b = byDay[p.d] = byDay[p.d] || { v: 0, n: 0 }; b.v += App.val(p); b.n += 1; });
    const days = Object.keys(byDay).sort();
    const totalV = days.reduce((s, d) => s + byDay[d].v, 0);
    const peakDay = days.slice().sort((a, b) => byDay[b].v - byDay[a].v)[0] || null;
    const postAccts = new Set(posts.map(p => p.a));
    const comAccts = new Set(D.coms.map(c => c.a));
    const topicsByAcct = {};
    focus.forEach(p => { (topicsByAcct[p.a] = topicsByAcct[p.a] || new Set()).add(p.t); });
    const multiTopicAccts = Object.keys(topicsByAcct).filter(a => topicsByAcct[a].size >= 2);
    // 兩個群體都有出現的帳號（有留言資料時才有意義）
    const bridges = [...new Set(posts.filter(p => p.s !== 'neu').map(p => p.a))].filter(a => comAccts.has(a));
    return App.ctx = { posts, focus, owner: D.owner, coms: D.coms, byDay, days, totalV, peakDay, postAccts, comAccts, multiTopicAccts, bridges };
  };
})();
