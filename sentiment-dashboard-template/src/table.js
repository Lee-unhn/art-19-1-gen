// 原始紀錄表：分頁籤 + 搜尋 + 篩選 + 排序，所有圖表點擊最後都落在這裡
(function () {
  const App = window.App, { C, D, $, esc, fmt, st } = App;
  const fT = $('fTopic'), fC = $('fCat');
  const TABS = { p: 'tabP', o: 'tabO', c: 'tabC' };

  App.setTab = function (t) {
    st.tab = t;
    Object.keys(TABS).forEach(k => $(TABS[k]).setAttribute('aria-selected', k === t));
    $('fStance').hidden = t !== 'p'; fT.hidden = t !== 'p'; fC.hidden = t !== 'c';
  };

  function stanceChip(p) {
    const t = C.topics[p.t];
    if (p.s === C.focus.stance) return `<span class="chip ${App.chipClass(t ? t.color : 'neu')}">${esc(t ? t.label : p.t)}</span>`;
    const cls = p.s === 'pos' ? 'pos' : p.s === 'neg' ? 'neg' : 'neu';
    return `<span class="chip c-${cls}">${esc(C.stances[p.s] || p.s)}</span>${t ? `<span class="chip c-neu">${esc(t.label)}</span>` : ''}`;
  }
  App.stanceChip = stanceChip;

  App.initTable = function () {
    $('tabP').textContent = C.groups.posts; $('tabO').textContent = C.groups.owner; $('tabC').textContent = C.groups.coms;
    $('tabO').hidden = !D.owner.length; $('tabC').hidden = !D.coms.length;
    $('fStance').innerHTML = '<option value="">全部立場</option>' + Object.keys(C.stances).map(k => `<option value="${k}">${C.stances[k]}</option>`).join('');
    fT.innerHTML = '<option value="">全部議題</option>' + Object.keys(C.topics).map(k => `<option value="${k}">${esc(C.topics[k].label)}</option>`).join('');
    fC.innerHTML = '<option value="">全部類別</option>' + Object.keys(C.cats).map(k => `<option value="${k}">${esc(C.cats[k].label)}</option>`).join('');
    $('fEnt').innerHTML = '<option value="">全部單位提及</option>' + Object.keys(C.entities).map(k => `<option value="${k}">${esc(C.entities[k].label)}</option>`).join('');
    $('tabP').onclick = () => { App.setTab('p'); App.render(); };
    $('tabO').onclick = () => { App.setTab('o'); App.render(); };
    $('tabC').onclick = () => { App.setTab('c'); App.render(); };
    $('fEnt').onchange = e => { st.ent = e.target.value; App.render(); };
    $('q').oninput = e => { st.q = e.target.value; App.render(); };
    $('fStance').onchange = e => { st.stance = e.target.value; App.render(); };
    fT.onchange = e => { st.topic = e.target.value; App.render(); };
    fC.onchange = e => { st.cat = e.target.value; App.render(); };
    $('clr').onclick = () => { App.clearFilters(); App.render(); };
  };

  const link = r => r.u ? `<a href="${esc(r.u)}" target="_blank" rel="noopener">@${esc(r.a)}</a>` : '@' + esc(r.a);
  const likes = p => p.q ? '<span title="互動數屬於被引用的原文">—</span>' : (C.metric === 'likes' || p.l ? fmt(p.l) : '—');

  App.render = function () {
    $('q').value = st.q; $('fEnt').value = st.ent; $('fStance').value = st.stance; fT.value = st.topic; fC.value = st.cat;
    document.querySelectorAll('#topicBars .bar').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === st.topic));
    document.querySelectorAll('#catBars .bar').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === st.cat));
    const q = st.q.trim().toLowerCase(), th = $('th'), tb = $('tb');
    const hit = r => !q || (r.a || '').toLowerCase().includes(q) || (r.x || '').toLowerCase().includes(q);
    const entOk = r => !st.ent || r.e.includes(st.ent);
    const arrow = k => st.sort === k ? (st.dir < 0 ? ' ↓' : ' ↑') : '';
    const cmp = (a, b) => st.sort === 'd' ? st.dir * (a.d || '').localeCompare(b.d || '') : st.dir * (a.l - b.l);

    if (st.tab === 'p') {
      const rows = D.posts.filter(p => hit(p) && entOk(p) && (!st.stance || p.s === st.stance) && (!st.topic || p.t === st.topic) && (!st.day || p.d === st.day)).sort(cmp);
      th.innerHTML = `<tr><th data-s="d">日期${arrow('d')}</th><th>帳號</th><th>分類</th><th data-s="l">讚${arrow('l')}</th><th>內文</th></tr>`;
      tb.innerHTML = rows.map(p => `<tr><td class="num">${p.d || '–'}</td><td>${link(p)}</td><td>${stanceChip(p)}${App.entChips(p.e)}</td><td class="n">${likes(p)}</td><td>${esc(p.x)}</td></tr>`).join('');
      $('count').textContent = `${rows.length} 則${C.groups.posts}` + (st.day ? `，日期 ${st.day}` : '');
    } else if (st.tab === 'o') {
      const rows = D.owner.filter(o => hit(o) && entOk(o));
      th.innerHTML = '<tr><th>來源</th><th>類型</th><th>提及單位</th><th>內容</th></tr>';
      tb.innerHTML = rows.map(o => `<tr><td>${link(o)}</td><td>${esc(o.lab || '')}</td><td>${App.entChips(o.e) || '<span class="chip c-neu">未提及</span>'}</td><td>${esc(o.x)}</td></tr>`).join('');
      $('count').textContent = `${rows.length} 則${C.groups.owner}`;
    } else {
      const area = w => { const a = C.commentAreas.find(x => x.id === w); return a ? a.label : (w || '–'); };
      const rows = D.coms.filter(c => hit(c) && entOk(c) && (!st.cat || c.c.includes(st.cat))).sort((a, b) => st.dir * (a.l - b.l));
      th.innerHTML = `<tr><th>留言區</th><th>帳號</th><th>類別</th><th data-s="l">讚${arrow('l')}</th><th>留言</th></tr>`;
      tb.innerHTML = rows.map(c => `<tr><td>${esc(area(c.w))}</td><td>${link(c)}</td><td>${c.c.map(k => `<span class="chip ${App.chipClass(C.cats[k].color)}">${esc(C.cats[k].label)}</span>`).join('')}${App.entChips(c.e)}</td><td class="n">${fmt(c.l)}</td><td>${esc(c.x)}</td></tr>`).join('');
      $('count').textContent = `${rows.length} 則留言`;
    }
    th.querySelectorAll('th[data-s]').forEach(h => h.addEventListener('click', () => {
      const s = h.dataset.s; if (st.sort === s) st.dir *= -1; else { st.sort = s; st.dir = -1; } App.render();
    }));
  };
})();
