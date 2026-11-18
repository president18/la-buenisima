/* =================================================================
   LOS ÓSCAR DE LA BUENÍSIMA · nominados y ganadores
   Las categorías viven en /awards.js
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui;
  const { esc, f1, pct, sign } = UI;
  const AW = (LB.awards = {});
  const T = (D, r) => UI.tName(D, r);
  const P = (D, p) => (D.players[p] ? D.players[p].name : p);

  // Cada métrica devuelve candidatos ordenados: {label, sub, val}
  const M = {
    mvp(D) {
      const by = {};
      D.playedWeeks.filter((w) => w <= D.regEnd).forEach((w) => D.rids.forEach((r) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { const k = p + "|" + r; by[k] = (by[k] || 0) + (e.sp[i] || 0); }); }));
      return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => { const [p, r] = k.split("|"); return { label: P(D, p), sub: T(D, Number(r)), val: f1(v) + " pts" }; });
    },
    equipo: (D) => D.powerAt(Math.min(D.lastScored, D.regEnd)).map((x) => ({ label: T(D, x.rid), sub: UI.rec(x), val: f1(x.score) })),
    cirujano: (D) => D.standings.slice().sort((a, b) => b.eff - a.eff).map((x) => ({ label: T(D, x.rid), sub: UI.oName(D, x.rid), val: pct(x.eff, 1) })),
    banca: (D) => D.standings.slice().sort((a, b) => (b.max - b.pf) - (a.max - a.pf)).map((x) => ({ label: T(D, x.rid), sub: UI.oName(D, x.rid), val: f1(x.max - x.pf) + " pts" })),
    pickup: (D) => D.pickups.slice().sort((a, b) => b.start - a.start).map((x) => ({ label: P(D, x.pid), sub: T(D, x.rid) + " · sem " + x.week, val: f1(x.start) + " pts" })),
    mejorTrade(D) { const s = []; D.trades.forEach((t) => { if (t.sides.length !== 2) return; const [a, b] = t.sides; s.push({ r: a.rid, n: a.startPts - b.startPts, w: t.week, g: a.gets }); s.push({ r: b.rid, n: b.startPts - a.startPts, w: t.week, g: b.gets }); }); return s.sort((x, y) => y.n - x.n).map((x) => ({ label: T(D, x.r), sub: "Sem " + x.w + ": recibió " + x.g.map((g) => UI.plName(D, g.pid)).join(", "), val: sign(x.n) })); },
    peorTrade(D) { return M.mejorTrade(D).reverse(); },
    roboDraft: (D) => D.draft.filter((p) => p.round >= 4).sort((a, b) => b.value - a.value).map((p) => ({ label: P(D, p.pid), sub: `${T(D, p.rid)} · ronda ${p.round}`, val: `#${p.ptsRank} en pts` })),
    fracasoDraft: (D) => D.draft.filter((p) => p.round <= 3).sort((a, b) => a.value - b.value).map((p) => ({ label: P(D, p.pid), sub: `${T(D, p.rid)} · pick ${p.pick}`, val: `#${p.ptsRank} en pts` })),
    salado: (D) => D.standings.slice().sort((a, b) => a.luck - b.luck).map((x) => ({ label: T(D, x.rid), sub: UI.rec(x), val: sign(x.luck) + " V" })),
    suertudo: (D) => D.standings.slice().sort((a, b) => b.luck - a.luck).map((x) => ({ label: T(D, x.rid), sub: UI.rec(x), val: sign(x.luck) + " V" })),
    explosion: (D) => D.records.highScore.filter((x) => x.reg).map((x) => ({ label: T(D, x.rid), sub: "Semana " + x.w, val: f1(x.pf) })),
    ladrillo: (D) => D.records.lowScore.filter((x) => x.reg).map((x) => ({ label: T(D, x.rid), sub: "Semana " + x.w, val: f1(x.pf) })),
    paliza: (D) => D.records.blowouts.map((g) => { const aw = g.pa > g.pb; return { label: `${T(D, aw ? g.a : g.b)} sobre ${T(D, aw ? g.b : g.a)}`, sub: "Semana " + g.w, val: "+" + f1(Math.abs(g.pa - g.pb)) }; }),
    infarto: (D) => D.records.closest.map((g) => { const aw = g.pa > g.pb; return { label: `${T(D, aw ? g.a : g.b)} vs ${T(D, aw ? g.b : g.a)}`, sub: `Semana ${g.w} · ${f1(Math.max(g.pa, g.pb))}–${f1(Math.min(g.pa, g.pb))}`, val: f1(Math.abs(g.pa - g.pb)) }; }),
    raton: (D) => D.rids.slice().sort((a, b) => D.moveStats[b].moves - D.moveStats[a].moves).map((r) => ({ label: T(D, r), sub: UI.oName(D, r), val: D.moveStats[r].moves + " altas" })),
    racha(D) { const out = []; D.rids.forEach((r) => { let c = 0, b = 0; Object.values(D.tw[r]).filter((x) => x.reg).forEach((x) => { c = x.res === "W" ? c + 1 : 0; b = Math.max(b, c); }); out.push({ r, b }); }); return out.sort((x, y) => y.b - x.b).map((x) => ({ label: T(D, x.r), sub: UI.oName(D, x.r), val: x.b + " V" })); },
    actuacion: (D) => D.records.bestPerf.map((x) => ({ label: P(D, x.pid), sub: `${T(D, x.rid)} · sem ${x.w}`, val: f1(x.pts) })),
    campeon(D) { const f = final(D); return f && f.w ? [{ label: T(D, f.w), sub: UI.oName(D, f.w), val: "🏆" }] : null; },
    subcampeon(D) { const f = final(D); return f && f.l ? [{ label: T(D, f.l), sub: UI.oName(D, f.l), val: "🥈" }] : null; },
    mvpPlayoffs(D) {
      const ws = D.playedWeeks.filter((w) => w > D.regEnd);
      if (!ws.length) return null;
      const by = {};
      ws.forEach((w) => D.rids.forEach((r) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { const k = p + "|" + r; by[k] = (by[k] || 0) + (e.sp[i] || 0); }); }));
      return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => { const [p, r] = k.split("|"); return { label: P(D, p), sub: T(D, Number(r)), val: f1(v) + " pts" }; });
    },
    ultimo: (D) => D.standings.slice().reverse().map((x) => ({ label: T(D, x.rid), sub: UI.rec(x), val: D.sim && D.sim.remaining.length ? pct(D.sim.out[x.rid].last) + " prob." : x.rank + "°" })),
  };
  function final(D) {
    if (!D.bracket || !D.bracket.length) return null;
    const maxR = Math.max(...D.bracket.map((m) => m.r));
    return D.bracket.find((m) => m.r === maxR && m.p === 1) || null;
  }
  AW.metrics = Object.keys(M);
  AW.ceremonyDone = (D, c) => (c === "regular" ? D.lastScored >= D.regEnd : !!(final(D) && final(D).w));

  AW.render = function (D, el) {
    const cfg = window.LB_AWARDS || { categories: [], ceremonies: {} };
    const html = ["regular", "final"].map((c) => {
      const cer = cfg.ceremonies[c] || { name: c };
      const done = AW.ceremonyDone(D, c);
      const reveal = done && cer.reveal;
      const cards = cfg.categories.filter((k) => k.ceremony === c).map((k) => {
        let inner = "";
        if (k.type === "data") {
          const fn = M[k.metric];
          const list = fn ? fn(D) : null;
          if (!fn) inner = `<p class="small bad">Métrica "${esc(k.metric)}" no existe.</p>`;
          else if (!list || !list.length) inner = `<p class="small muted">Se define ${c === "final" ? "en los playoffs" : "más adelante"}.</p>`;
          else if (reveal) inner = `<div class="aw-win">🏆 ${esc(list[0].label)}</div><div class="small muted">${esc(list[0].sub)} · <b>${esc(list[0].val)}</b></div>`;
          else inner = `<div class="small faint" style="margin-bottom:4px">${done ? "Nominados (ganador en la ceremonia)" : "Nominados · van punteando"}</div>` +
            list.slice(0, 3).map((x) => `<div class="list-row small"><span>${esc(x.label)} <span class="faint">${esc(x.sub)}</span></span><span class="sp"></span><b class="num">${esc(x.val)}</b></div>`).join("");
        } else {
          const noms = k.nominees && k.nominees.length ? k.nominees : D.rids.map((r) => UI.tName(D, r));
          if (reveal && k.winner) inner = `<div class="aw-win">🏆 ${esc(k.winner)}</div>`;
          else inner = `<div class="small faint">Votación secreta${k.winner && !reveal ? " · resultado guardado 🤫" : ""}</div>
            <div class="chips" style="margin-top:6px">${noms.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}</div>
            ${cfg.voteFormUrl ? `<a class="btn pri" style="margin-top:10px" href="${esc(cfg.voteFormUrl)}" target="_blank" rel="noopener">🗳️ Votar</a>` : `<p class="small faint" style="margin-top:8px">El comisionado captura el resultado.</p>`}`;
        }
        return `<div class="card"><div class="row" style="flex-wrap:nowrap"><span style="font-size:26px">${k.emoji || "🏆"}</span><div style="min-width:0"><div class="tn">${esc(k.name)}</div><div class="small muted">${esc(k.description)}</div></div><span class="sp"></span><span class="pill">${k.type === "vote" ? "Votación" : "Datos"}</span></div><div style="margin-top:10px">${inner}</div></div>`;
      }).join("");
      return `<div class="h3">${esc(cer.name)}</div><p class="sub">${esc(cer.when || "")} · ${reveal ? "¡Ya hay ganadores!" : done ? "Lista para la ceremonia: el comisionado revela ganadores." : "Todavía en juego."}</p><div class="grid g2">${cards}</div>`;
    }).join("");
    el.innerHTML = `<div class="h2">Los Óscar de La Buenísima</div><p class="sub">Premios de fin de temporada. Los de datos se calculan solos; los de votación son secretos.</p>${html}`;
  };
})();
