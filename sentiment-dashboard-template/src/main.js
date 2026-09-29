// 進入點：依序把各區塊畫出來。要新增圖表就寫一個 App.renderXxx，再在這裡呼叫。
(function () {
  const App = window.App, { C, $ } = App;
  document.title = C.title;
  $('title').textContent = C.title;
  $('subtitle').textContent = C.subtitle;
  $('stamp').textContent = C.stamp;
  $('notes').innerHTML = C.notes.map(n => `<div>${App.esc(n)}</div>`).join('');

  const ctx = App.buildCtx();
  App.renderKpis(ctx);
  App.renderTimeline(ctx);
  App.renderBars(ctx);
  App.initTable();
  App.setTab('p');
  App.render();
  App.renderMatrix();
  App.initNet();
})();
