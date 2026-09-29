// 每日聲量長條圖（手寫 SVG）：階段分帶、關鍵事件三角形，點長條篩選下方表格
(function () {
  const App = window.App, { C, $, fmt } = App;
  const nice = x => { const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };

  App.renderTimeline = function (ctx) {
    const svg = $('tl'), { byDay, days } = ctx;
    $('tlLead').textContent = `每日${C.focus.label}的聲量（單位：${C.metricLabel}）。點長條可以篩選下方的原始紀錄，紅色三角形是關鍵事件。`;
    if (!days.length) { svg.innerHTML = '<text x="450" y="150" text-anchor="middle" fill="var(--muted)">沒有帶日期的資料</text>'; return; }
    const W = 900, H = 300, L = 64, R = 20, T = 56, B = 46, pw = W - L - R, ph = H - T - B;
    const step = nice(Math.max(...days.map(d => byDay[d].v)) / 5), peak = step * 5;
    const bw = pw / days.length, y = v => T + ph - v / peak * ph;
    const colorOf = d => C.phases[App.phaseIndex(d)].color;
    let h = '';
    for (let i = 0; i <= 5; i++) {
      const t = i * step;
      h += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${t === 0 ? 'var(--muted)' : 'var(--line)'}"/>`;
      h += `<text x="${L - 8}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--muted)" class="num">${fmt(t)}</text>`;
    }
    C.phases.forEach((ph_, p) => {
      const idx = days.map((d, i) => App.phaseIndex(d) === p ? i : -1).filter(i => i >= 0);
      if (!idx.length) return;
      const x0 = L + idx[0] * bw, x1 = L + (idx[idx.length - 1] + 1) * bw;
      h += `<rect x="${x0 + 2}" y="${T - 34}" width="${x1 - x0 - 4}" height="3" fill="var(--${ph_.color})"/>`;
      h += `<text x="${x0 + 4}" y="${T - 40}" font-size="12" fill="var(--ink)" font-weight="700">${ph_.label}</text>`;
    });
    days.forEach((d, i) => {
      const v = byDay[d].v, x = L + i * bw + bw * 0.18, w = bw * 0.64;
      h += `<g class="tlbar" data-day="${d}" style="cursor:pointer"><rect x="${L + i * bw}" y="${T}" width="${bw}" height="${ph}" fill="transparent"/>`;
      h += `<rect x="${x}" y="${y(v)}" width="${w}" height="${Math.max(y(0) - y(v), 1.5)}" fill="var(--${colorOf(d)})" rx="1"><title>${d}：${byDay[d].n} 則，${fmt(v)} ${C.metricLabel}</title></rect>`;
      h += `<text x="${x + w / 2}" y="${y(v) - 6}" text-anchor="middle" font-size="11" fill="var(--ink)" class="num">${fmt(v)}</text>`;
      h += `<text x="${x + w / 2}" y="${H - B + 18}" text-anchor="middle" font-size="12" fill="var(--muted)" class="num">${d.replace(/^0/, '')}</text></g>`;
    });
    const byMarkerDay = {};
    C.markers.forEach(m => (byMarkerDay[m.date] = byMarkerDay[m.date] || []).push(m));
    Object.keys(byMarkerDay).forEach(d => {
      const i = days.indexOf(d); if (i < 0) return;
      const cx = L + i * bw + bw / 2, ms = byMarkerDay[d];
      ms.forEach((m, k) => {
        const o = (k - (ms.length - 1) / 2) * 10;
        h += `<path d="M${cx + o - 4},${T - 18} l8,0 l-4,7 z" fill="var(--neg)"><title>${d} ${m.label}</title></path>`;
      });
    });
    h += `<text x="${L + pw / 2}" y="${H - 6}" text-anchor="middle" font-size="12" fill="var(--muted)">日期</text>`;
    svg.innerHTML = h;
    svg.querySelectorAll('.tlbar').forEach(g => g.addEventListener('click', () => {
      App.st.day = App.st.day === g.dataset.day ? '' : g.dataset.day; App.setTab('p'); App.render();
    }));
  };
})();
