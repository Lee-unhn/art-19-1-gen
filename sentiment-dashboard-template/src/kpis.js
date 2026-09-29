(function () {
  const { C, $, esc } = window.App;
  window.App.renderKpis = function (ctx) {
    $('kpis').innerHTML = C.kpis.map(k => {
      const [v, sub] = k.compute(ctx);
      return `<div class="kpi${k.alert ? ' alert' : ''}"><b>${esc(v)}</b><span>${esc(k.label)}${sub ? '<br>' + esc(sub) : ''}</span></div>`;
    }).join('');
  };
})();
