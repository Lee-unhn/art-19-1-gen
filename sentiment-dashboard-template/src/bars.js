// 議題／留言類別橫條圖；點一列就設定對應的篩選條件
(function () {
  const App = window.App, { C, D, $, esc, fmt, css } = App;

  function bars(el, rows, key, tab) {
    const max = Math.max(1, ...rows.map(r => r.v));
    el.innerHTML = rows.map(r => `<button class="bar" data-k="${esc(r.k)}" aria-pressed="false"><span class="lab" title="${esc(r.lab)}">${esc(r.lab)}</span><span class="trk"><span class="fill" style="display:block;width:${r.v / max * 100}%;background:${css(r.col)}"></span></span><span class="v">${fmt(r.v)}</span></button>`).join('');
    el.querySelectorAll('.bar').forEach(b => b.addEventListener('click', () => {
      App.st[key] = App.st[key] === b.dataset.k ? '' : b.dataset.k; App.setTab(tab); App.render();
    }));
  }

  App.renderBars = function (ctx) {
    const tRows = Object.keys(C.topics).map(k => ({
      k, lab: C.topics[k].label, col: C.topics[k].color,
      v: ctx.focus.filter(p => p.t === k).reduce((s, p) => s + App.val(p), 0)
    })).sort((a, b) => b.v - a.v);
    $('topicLead').textContent = `${ctx.focus.length} 則${C.focus.label}依議題分類，數字是${C.metricLabel}數。點議題可以篩選原始紀錄。`;
    bars($('topicBars'), tRows, 'topic', 'p');

    $('catPanel').hidden = !D.coms.length;
    if (D.coms.length) {
      const cRows = Object.keys(C.cats).map(k => ({ k, lab: C.cats[k].label, col: C.cats[k].color, v: D.coms.filter(c => c.c.includes(k)).length })).sort((a, b) => b.v - a.v);
      $('catLead').textContent = `${D.coms.length} 則留言依內容分類，一則留言可以屬於多類。點類別可以篩選留言。`;
      bars($('catBars'), cRows, 'cat', 'c');
    }
  };
})();
