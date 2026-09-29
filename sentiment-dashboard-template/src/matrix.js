// 實體提及矩陣（誰在點名哪個單位）＋查證卡片
(function () {
  const App = window.App, { C, D, $, esc } = App;

  App.renderMatrix = function () {
    const rowsDef = [
      { k: 'o', lab: C.groups.owner, items: D.owner },
      { k: 'p', lab: C.groups.posts, items: D.posts },
      { k: 'c', lab: C.groups.coms, items: D.coms }
    ].filter(r => r.items.length);
    const cols = Object.keys(C.entities);
    const maxv = Math.max(1, ...rowsDef.flatMap(r => cols.map(c => r.items.filter(x => x.e.includes(c)).length)));
    let h = '<thead><tr><th>誰在發內容</th>' + cols.map(c => `<th style="text-align:center">${esc(C.entities[c].label)}<br><small>${esc(C.entities[c].note || '')}</small></th>`).join('') + '</tr></thead><tbody>';
    rowsDef.forEach(r => {
      h += `<tr><th style="white-space:normal">${esc(r.lab)}<br><small style="font-weight:400">${r.items.length} 則</small></th>`;
      cols.forEach(c => {
        const m = r.items.filter(x => x.e.includes(c));
        const bg = m.length ? `color-mix(in srgb, var(--event) ${Math.round(12 + m.length / maxv * 60)}%, transparent)` : 'transparent';
        h += `<td class="cell" data-t="${r.k}" data-e="${c}" style="background:${bg}" title="點一下查看內容">${m.length}<small>${m.length ? new Set(m.map(x => x.a)).size + ' 個帳號' : '—'}</small></td>`;
      });
      h += '</tr>';
    });
    $('mx').innerHTML = h + '</tbody>';
    $('mx').querySelectorAll('td.cell').forEach(td => td.addEventListener('click', () => {
      App.clearFilters(); App.st.ent = td.dataset.e; App.setTab(td.dataset.t); App.render();
      $('records').scrollIntoView({ behavior: 'smooth' });
    }));

    const vlab = { ok: '有依據', part: '部分有依據', no: '無法查證' };
    $('ecards').innerHTML = (C.entityCards || []).map(c => `<div class="ecard"><h3>${esc(c.name)}</h3><div class="role">${esc(c.role)}</div><dl>
      <dt>點名來源</dt><dd>${esc(c.src)}</dd><dt>其他人呼應</dt><dd>${esc(c.echo)}</dd>
      <dt>查證狀態</dt><dd>${c.ver.map(v => `<div><span class="ver ${v[0]}">${vlab[v[0]]}</span>${v[2] ? `<a href="${esc(v[2])}" target="_blank" rel="noopener">${esc(v[1])}</a>` : esc(v[1])}</div>`).join('')}</dd></dl></div>`).join('');
  };
})();
