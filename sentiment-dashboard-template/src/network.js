// 帳號連動網路圖（D3 力導向）：大圓點 = 議題／留言區，小圓點 = 帳號
(function () {
  const App = window.App, { C, D, $, esc, fmt, css } = App;
  const rail = $('rail');

  function railDefault(ctx) {
    rail.innerHTML = `<h3>怎麼看這張圖</h3><div class="meta">點任一個圓點看詳細內容</div>
      <div class="item">大圓點是議題${D.coms.length ? '與留言區' : ''}，小圓點是發內容的帳號。</div>
      <div class="item">同時連到多個議題的帳號用紫色標示，代表它報導的面向比較廣。</div>` +
      (D.coms.length ? `<div class="item">黑色的點是兩個群體都有出現的帳號，共 ${ctx.bridges.length} 個。</div>` : '');
  }
  function showAcct(a) {
    const ps = D.posts.filter(p => p.a === a), cs = D.coms.filter(c => c.a === a);
    const likes = ps.reduce((s, p) => s + p.l, 0) + cs.reduce((s, c) => s + c.l, 0);
    rail.innerHTML = `<h3>${esc(a)}</h3><div class="meta">${ps.length} 則主貼文 · ${cs.length} 則留言${likes ? ' · 共 ' + fmt(likes) + ' 讚' : ''}</div>` +
      ps.map(p => `<div class="item">${App.stanceChip(p)} <span class="num">${p.d || ''}</span><br>${esc(p.x)} <a href="${esc(p.u || '#')}" target="_blank" rel="noopener">原文</a></div>`).join('') +
      cs.map(c => `<div class="item">${c.c.map(k => `<span class="chip ${App.chipClass(C.cats[k].color)}">${esc(C.cats[k].label)}</span>`).join('')}<br>${esc(c.x)}</div>`).join('');
  }
  function showHub(h) {
    rail.innerHTML = `<h3>${esc(h.label)}</h3><div class="meta">${h.members.length} 個帳號</div>` +
      h.members.slice(0, 40).map(a => `<div class="item"><button class="clear" data-a="${esc(a)}">${esc(a)}</button></div>`).join('') +
      (h.members.length > 40 ? `<div class="item">另有 ${h.members.length - 40} 個帳號</div>` : '');
    rail.querySelectorAll('button[data-a]').forEach(b => b.onclick = () => showAcct(b.dataset.a));
  }

  App.buildNet = function () {
    const ctx = App.ctx, svgEl = $('netsvg');
    const W = svgEl.clientWidth || 800, H = 560;
    const showOther = $('showOther').checked, showReply = C.replyPattern && $('showReply').checked;
    const hubs = [];
    Object.keys(C.topics).forEach(k => {
      const m = [...new Set(ctx.focus.filter(p => p.t === k).map(p => p.a))];
      if (m.length) hubs.push({ id: 'T' + k, label: C.topics[k].label, kind: 'topic', col: C.topics[k].color, members: m });
    });
    if (showOther) hubs.push({ id: 'OTHER', label: '其他立場', kind: 'other', col: 'neu', members: [...new Set(D.posts.filter(p => p.s !== C.focus.stance).map(p => p.a))] });
    C.commentAreas.forEach(a => {
      const m = [...new Set(D.coms.filter(c => c.w === a.id).map(c => c.a))];
      if (m.length) hubs.push({ id: 'S' + a.id, label: a.label, kind: 'area', col: 'pol', members: m });
    });

    const acct = new Map(), links = [];
    hubs.forEach(h => h.members.forEach(a => {
      if (!acct.has(a)) acct.set(a, { id: '@' + a, a, kinds: new Set(), topics: 0, likes: 0 });
      const n = acct.get(a); n.kinds.add(h.kind); if (h.kind === 'topic') n.topics++;
      links.push({ source: '@' + a, target: h.id });
    }));
    acct.forEach(n => { n.likes = D.posts.filter(p => p.a === n.a).reduce((s, p) => s + p.l, 0) + D.coms.filter(c => c.a === n.a).reduce((s, c) => s + c.l, 0); });
    const reply = [];
    if (showReply) {
      const re = new RegExp(C.replyPattern, 'g');
      D.posts.forEach(p => [...p.x.matchAll(re)].forEach(x => {
        if (x[1] !== p.a && acct.has(p.a)) {
          if (!acct.has(x[1])) acct.set(x[1], { id: '@' + x[1], a: x[1], kinds: new Set(['topic']), topics: 1, likes: 0 });
          reply.push({ source: '@' + p.a, target: '@' + x[1], reply: true });
        }
      }));
    }
    const nodes = [...hubs.map(h => ({ ...h, hub: true })), ...acct.values()];
    nodes.forEach(n => {
      if (n.hub) return;
      n.grp = n.kinds.has('area') && (n.kinds.has('topic') || n.kinds.has('other')) ? 'bridge' : n.kinds.has('area') ? 'area' : n.topics >= 2 ? 'multi' : n.kinds.has('other') && !n.kinds.has('topic') ? 'other' : 'topic';
    });
    const r = n => n.hub ? 10 + Math.sqrt(n.members.length) * 2.2 : 4 + Math.sqrt(n.likes) / 10 + (n.topics >= 2 ? 2 : 0);
    const COLOR = { bridge: 'var(--ink)', area: 'var(--pol)', multi: 'var(--accent)', other: 'var(--neu)', topic: 'var(--event)' };
    const fillOf = n => n.hub ? css(n.col) : COLOR[n.grp];
    const tx = n => n.hub ? (n.kind === 'area' ? W * 0.8 : n.kind === 'other' ? W * 0.12 : W * 0.3) : ({ area: W * 0.8, bridge: W * 0.55, multi: W * 0.5, other: W * 0.12, topic: W * 0.3 })[n.grp];

    const svg = d3.select(svgEl); svg.selectAll('*').remove(); svg.attr('viewBox', `0 0 ${W} ${H}`);
    const all = links.concat(reply);
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(all).id(d => d.id).distance(l => l.reply ? 30 : 50).strength(l => l.reply ? 0.2 : 0.5))
      .force('charge', d3.forceManyBody().strength(d => d.hub ? -260 : -12))
      .force('x', d3.forceX(tx).strength(d => d.hub ? 0.25 : 0.06))
      .force('y', d3.forceY(H / 2).strength(0.07))
      .force('collide', d3.forceCollide(d => r(d) + 1.5));
    const L = svg.append('g').selectAll('line').data(all).join('line').attr('stroke', d => d.reply ? 'var(--ink)' : 'var(--line)').attr('stroke-dasharray', d => d.reply ? '3 3' : null).attr('stroke-width', d => d.reply ? 1.2 : 0.8);
    const N = svg.append('g').selectAll('circle').data(nodes).join('circle').attr('r', r).attr('fill', fillOf).attr('stroke', 'var(--panel)').attr('stroke-width', 1.5).style('cursor', 'pointer')
      .on('click', (e, d) => d.hub ? showHub(d) : showAcct(d.a));
    N.append('title').text(d => d.hub ? `${d.label}：${d.members.length} 個帳號` : d.a);
    const T = svg.append('g').selectAll('text').data(nodes.filter(n => n.hub || n.grp === 'bridge' || n.grp === 'multi')).join('text')
      .text(d => d.hub ? d.label : d.a).attr('font-size', d => d.hub ? 12 : 11).attr('font-weight', d => d.hub ? 700 : 500).attr('fill', 'var(--ink)')
      .attr('paint-order', 'stroke').attr('stroke', 'var(--soft)').attr('stroke-width', 3).attr('text-anchor', 'middle').style('pointer-events', 'none');
    N.call(d3.drag().on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; }).on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; }).on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
    const cx = d => Math.max(r(d) + 4, Math.min(W - r(d) - 4, d.x)), cy = d => Math.max(r(d) + 18, Math.min(H - r(d) - 4, d.y));
    const draw = () => {
      nodes.forEach(d => { d.x = cx(d); d.y = cy(d); });
      L.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      N.attr('cx', d => d.x).attr('cy', d => d.y);
      T.attr('x', d => d.x).attr('y', d => d.y - r(d) - 5);
    };
    sim.on('tick', draw);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { sim.stop(); for (let i = 0; i < 300; i++) sim.tick(); draw(); }

    const used = new Set(nodes.filter(n => !n.hub).map(n => n.grp));
    const LEG = { topic: ['topic', '只出現在單一議題'], multi: ['multi', '同時報導多個議題'], other: ['other', '其他立場'], area: ['area', '只在留言區出現'], bridge: ['bridge', '兩邊都有出現'] };
    $('legend').innerHTML = Object.keys(LEG).filter(k => used.has(k)).map(k => `<span><i style="background:${COLOR[LEG[k][0]]}"></i>${LEG[k][1]}</span>`).join('') + '<span>圓點大小代表互動量</span>';
  };

  App.initNet = function () {
    const ctx = App.ctx;
    $('replyLabel').hidden = !C.replyPattern;
    $('bridgeNote').hidden = !D.coms.length;
    if (D.coms.length) $('bridgeNote').innerHTML = `發文帳號與留言區留言者的重疊：兩邊都有出現的有 ${ctx.bridges.length} 個帳號${ctx.bridges.length ? '（' + ctx.bridges.map(esc).join('、') + '）' : ''}。`;
    else $('bridgeNote').innerHTML = '';
    railDefault(ctx);
    $('showOther').onchange = App.buildNet; $('showReply').onchange = App.buildNet;
    if (window.d3) App.buildNet(); else rail.innerHTML = '<h3>網路圖載入失敗</h3><div class="meta">繪圖程式庫沒有載入成功，請重新整理頁面。其他區塊不受影響。</div>';
    let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (window.d3) App.buildNet(); }, 250); });
  };
})();
