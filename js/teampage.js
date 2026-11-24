/* =================================================================
   LA BUENÍSIMA · página por equipo (pública)
   Sin recomendaciones de trades ni agentes libres: eso vive solo en la página privada.
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui;
  const { esc, f1, pct, sign, rec } = UI;
  const TP = (LB.teampage = {});
  const T = (D, r) => esc(UI.tName(D, r));
  const ord = (n) => n + "°";

  function picker(D, cur) {
    return `<div class="tp-pick">${D.standings.map((s) => `<button class="tp-chip ${s.rid === cur ? "on" : ""}" data-r="${s.rid}">${UI.avatar(D.teams[s.rid], "sm")}<span>${T(D, s.rid)}</span></button>`).join("")}</div>`;
  }

  function teamMVP(D, r) {
    const by = {};
    D.playedWeeks.forEach((w) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => (by[p] = (by[p] || 0) + (e.sp[i] || 0))); });
    const b = Object.entries(by).sort((a, b) => b[1] - a[1]);
    return b.slice(0, 3).map(([p, v]) => ({ p, v }));
  }

  function strength(D) {
    const groups = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];
    const tv = {};
    D.rids.forEach((r) => {
      const ros = D.teams[r].roster.filter((p) => !D.teams[r].reserve.includes(p));
      const lu = LB.optimalLineup(ros, D.slots, (p) => D.ppg(p), D.posOf);
      const g = {}; groups.forEach((k) => (g[k] = 0));
      lu.lineup.forEach((x) => { const k = x.slot.includes("FLEX") ? "FLEX" : x.slot; g[k] = (g[k] || 0) + x.val; });
      g.total = lu.total; tv[r] = g;
    });
    const ranks = {};
    [...groups, "total"].forEach((k) => { const o = D.rids.slice().sort((a, b) => tv[b][k] - tv[a][k]); D.rids.forEach((r) => { (ranks[r] = ranks[r] || {})[k] = o.indexOf(r) + 1; }); });
    return { tv, ranks, groups };
  }

  function chart(D, r) {
    const ws = D.playedWeeks.filter((w) => D.tw[r][w]);
    if (ws.length < 2) return "";
    const W = 640, H = 260, pl = 44, pr = 12, pt = 14, pb = 30;
    const pts = ws.map((w) => D.tw[r][w].pf), mx = ws.map((w) => D.tw[r][w].max);
    const avg = ws.map((w) => { const a = D.rids.map((x) => D.tw[x][w]).filter(Boolean); return a.reduce((s, t) => s + t.pf, 0) / a.length; });
    const all = [...pts, ...mx, ...avg];
    const lo = Math.floor(Math.min(...all) / 10) * 10 - 5, hi = Math.ceil(Math.max(...all) / 10) * 10 + 5;
    const x = (i) => pl + (i * (W - pl - pr)) / (ws.length - 1);
    const y = (v) => pt + ((hi - v) * (H - pt - pb)) / (hi - lo);
    const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    let grid = "";
    for (let v = Math.ceil(lo / 20) * 20; v <= hi; v += 20) grid += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#D3CAB8"/><text x="${pl - 6}" y="${y(v) + 4}" font-size="16" text-anchor="end" fill="#8A857C">${v}</text>`;
    const xl = ws.map((w, i) => `<text x="${x(i)}" y="${H - 6}" font-size="16" text-anchor="middle" fill="#8A857C">S${w}</text>`).join("");
    const dots = ws.map((w, i) => { const t = D.tw[r][w]; return `<circle cx="${x(i)}" cy="${y(t.pf)}" r="6" fill="${t.res === "W" ? "#2F5D50" : "#EAE7DC"}" stroke="#2F5D50" stroke-width="2"><title>Semana ${w}: ${f1(t.pf)} (${t.res === "W" ? "ganó" : "perdió"})</title></circle>`; }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;max-width:${W}px">${grid}
      <path d="${path(mx)}" fill="none" stroke="#B9A47E" stroke-width="1.5" stroke-dasharray="2 4"/>
      <path d="${path(avg)}" fill="none" stroke="#8A857C" stroke-width="1.5" stroke-dasharray="6 5"/>
      <path d="${path(pts)}" fill="none" stroke="#2F5D50" stroke-width="3.5"/>${dots}${xl}</svg>
      <div class="tp-legend"><span><i style="background:#2F5D50"></i>Sus puntos (relleno = ganó)</span><span><i class="dash"></i>Promedio de la liga</span><span><i class="dot2"></i>Su máximo posible</span></div>`;
  }

  TP.render = function (D, el, rid, onPick) {
    if (!rid || !D.teams[rid]) {
      el.innerHTML = `<div class="h2">Equipos</div><p class="sub">Escoge un equipo para ver su temporada completa. El sitio se acuerda de tu elección en este teléfono.</p>${picker(D, null)}`;
      el.querySelectorAll(".tp-chip").forEach((b) => (b.onclick = () => onPick(Number(b.dataset.r))));
      return;
    }
    const t = D.teams[rid];
    const st = D.standings.find((x) => x.rid === rid) || {};
    const lastW = Math.min(D.lastScored, D.regEnd);
    const pw = (D.powerAt(lastW).find((x) => x.rid === rid) || {});
    const sim = D.sim.out[rid];
    const g = D.grades[rid];
    const S = strength(D);
    const ppgRank = D.standings.slice().sort((a, b) => b.ppg - a.ppg).findIndex((x) => x.rid === rid) + 1;
    const effRank = D.standings.slice().sort((a, b) => b.eff - a.eff).findIndex((x) => x.rid === rid) + 1;
    const form = Object.values(D.tw[rid]).filter((x) => x.reg && x.res).slice(-5).map((x) => `<span class="tp-f ${x.res === "W" ? "w" : "l"}">${x.res === "W" ? "G" : "P"}</span>`).join("");

    // Diagnóstico
    const diag = [];
    if (st.luck >= 1) diag.push(`La suerte le ha ayudado: tiene ${sign(st.luck)} victorias más de las que dicen sus puntos.`);
    else if (st.luck <= -1) diag.push(`Le ha tocado un calendario pesado: merecía ${sign(-st.luck)} victorias más por sus puntos.`);
    else diag.push(`Su récord refleja bien lo que ha jugado: ni suertudo ni salado.`);
    diag.push(effRank <= 3 ? `Es de los que mejor arman su lineup: saca el ${pct(st.eff, 1)} de su máximo (${ord(effRank)} de la liga).` : effRank >= D.numTeams - 2 ? `Deja muchos puntos en la banca: solo usa el ${pct(st.eff, 1)} de su máximo (${ord(effRank)} de la liga).` : `Su eficiencia de lineup es de ${pct(st.eff, 1)}, ${ord(effRank)} de la liga.`);
    if (st.gp >= 3) diag.push(st.last3 > st.ppg * 1.08 ? `Viene en ascenso: ${f1(st.last3)} pts por semana en las últimas 3, arriba de su promedio de ${f1(st.ppg)}.` : st.last3 < st.ppg * 0.92 ? `Viene a la baja: ${f1(st.last3)} pts en las últimas 3 contra ${f1(st.ppg)} de promedio.` : `Se mantiene estable alrededor de ${f1(st.ppg)} pts por semana.`);
    const gradeTxt = {
      draft: `Sus picks del draft le han dado ${f1(g.draft.val)} pts como titulares (${ord(g.draft.rank)} de la liga).`,
      waivers: `Sus altas de waivers y agentes libres suman ${f1(g.waivers.val)} pts como titulares (${ord(g.waivers.rank)}).`,
      trades: g.trades.rank ? `En trades lleva ${sign(g.trades.val)} pts netos (${ord(g.trades.rank)}).` : `No ha hecho trades.`,
      lineups: `Eficiencia de lineup de ${pct(g.lineups.val, 1)} (${ord(g.lineups.rank)}).`,
    };
    const gradeLbl = { draft: "Draft", waivers: "Waivers", trades: "Trades", lineups: "Lineups" };

    // Roster
    const cw = Math.min(D.projWeek, D.totalWeeks);
    const cur = D.weeks[cw] && D.weeks[cw][rid];
    const starters = cur ? cur.starters : t.starters;
    const roster = t.roster.slice().sort((a, b) => { const sa = starters.indexOf(a), sb = starters.indexOf(b); if (sa >= 0 && sb >= 0) return sa - sb; if (sa >= 0) return -1; if (sb >= 0) return 1; return D.ppg(b) - D.ppg(a); });
    const rosterRows = roster.map((p) => { const isS = starters.includes(p); const pl = D.players[p] || {}; return `<tr><td>${isS ? `<span class="pill">${esc(D.slots[starters.indexOf(p)] || pl.pos)}</span>` : `<span class="faint small">BN</span>`}</td><td>${UI.pl(D, p)}</td><td class="r num">${f1(D.ppg(p))}</td><td class="r num">${D.projPts[p] != null ? f1(D.projPts[p]) : "—"}</td></tr>`; }).join("");
    const lbl = { QB: "QB", RB: "RB", WR: "WR", TE: "TE", FLEX: "FLEX", K: "K", DEF: "DEF", total: "Lineup total" };
    const strRows = [...S.groups, "total"].map((k) => { const rk = S.ranks[rid][k]; return `<div class="tp-str"><span>${lbl[k]}</span><div class="tp-strbar"><i style="width:${((D.numTeams - rk + 1) / D.numTeams) * 100}%"></i></div><b class="${rk <= 3 ? "good" : rk >= D.numTeams - 2 ? "bad" : ""}">${ord(rk)}</b></div>`; }).join("");

    // Lo que viene
    const rem = D.sim.remaining.filter((x) => x.a === rid || x.b === rid);
    const remRows = rem.map((x) => {
      const opp = x.a === rid ? x.b : x.a;
      const m1 = D.sim.model[rid], m2 = D.sim.model[opp];
      const wp = LB.util.normCdf((m1.mean - m2.mean) / Math.sqrt(m1.sd ** 2 + m2.sd ** 2));
      const so = D.standings.find((y) => y.rid === opp) || {};
      const rv = UI.rivals(D, rid, opp);
      return `<div class="list-row"><span class="tag">S${x.w}</span>${UI.teamCell(D, opp, { sm: true })}${rv ? `<span class="pill b">${esc(rv)}</span>` : ""}<span class="sp"></span><div class="small" style="text-align:right">${so.W != null ? rec(so) : ""}<br><b class="${wp >= 0.5 ? "good" : "bad"}">${pct(wp)}</b> de ganar</div></div>`;
    }).join("");
    let scn = "";
    if (rem.length) {
      const s = LB.extras.scenarios(D).res[rid];
      scn = `<div class="scn" style="margin-top:10px">${s.rows.map((r) => `<span class="chip">Gana ${r.k} de ${r.left}: <b>${r.p == null ? "—" : pct(r.p)}</b></span>`).join("")}</div>`;
    }

    // Movimientos
    const picks = D.pickups.filter((p) => p.rid === rid).sort((a, b) => b.start - a.start).slice(0, 6);
    const gifts = D.drops.filter((d) => d.rid === rid && d.to && d.gave > 10).sort((a, b) => b.gave - a.gave).slice(0, 3);
    const trades = D.trades.filter((x) => x.rids.includes(rid));
    const draft = D.draft.filter((p) => p.rid === rid).sort((a, b) => a.pick - b.pick);
    const bestPick = draft.slice().sort((a, b) => b.value - a.value)[0];
    const worstPick = draft.filter((p) => p.round <= 5).sort((a, b) => a.value - b.value)[0];

    // Contra cada rival
    const vs = {};
    D.rids.filter((r) => r !== rid).forEach((r) => (vs[r] = { W: 0, L: 0, pf: 0, pa: 0 }));
    Object.values(D.tw[rid]).forEach((x) => { if (x.opp == null || !vs[x.opp]) return; const v = vs[x.opp]; if (x.res === "W") v.W++; else if (x.res === "L") v.L++; v.pf += x.pf; v.pa += x.pa || 0; });
    const vsRows = D.standings.filter((s) => s.rid !== rid).map((s) => { const v = vs[s.rid]; const n = rem.find((x) => x.a === s.rid || x.b === s.rid); const rv = UI.rivals(D, rid, s.rid); return `<tr><td class="sticky-col">${UI.teamCell(D, s.rid, { sm: true, noOwner: true })}</td><td>${rv ? `<span class="pill b">${esc(rv)}</span>` : ""}</td><td class="c num"><b>${v.W}-${v.L}</b></td><td class="r num">${v.W + v.L ? f1(v.pf) + " – " + f1(v.pa) : "—"}</td><td class="small">${n ? "Semana " + n.w : ""}</td></tr>`; }).join("");

    // Momentos
    const evs = LB.stories.events(D).filter((e) => (e.rids || [])[0] === rid && e.imp >= 40).sort((a, b) => b.imp - a.imp).slice(0, 6);
    const tws = Object.values(D.tw[rid]);
    const best = tws.slice().sort((a, b) => b.pf - a.pf)[0], worst = tws.slice().sort((a, b) => a.pf - b.pf)[0];
    const bigWin = tws.filter((x) => x.res === "W").sort((a, b) => (b.pf - b.pa) - (a.pf - a.pa))[0];
    const mvp = teamMVP(D, rid);

    el.innerHTML = `<div class="row" style="margin-bottom:8px"><select id="tpSel">${D.standings.map((s) => `<option value="${s.rid}" ${s.rid === rid ? "selected" : ""}>${T(D, s.rid)}</option>`).join("")}</select><span class="sp"></span><button class="btn" id="tpImg">${IC("image", 16)} Ficha</button></div>
      <div class="tp-head">${UI.avatar(t, "xl")}<div style="min-width:0"><div class="h2" style="margin:0">${T(D, rid)}</div><div class="muted">${esc(t.ownersNick)}${(window.LB_CONFIG.teamNicknames || {})[t.owner] ? " · " + esc(window.LB_CONFIG.teamNicknames[t.owner]) : ""}</div><div class="tp-form">${form}</div></div></div>
      <div class="kpis"><div class="kpi"><div class="l">Récord</div><div class="v">${rec(st)}</div><div class="d">${ord(st.rank)} lugar · racha ${st.streak}</div></div>
        <div class="kpi"><div class="l">Power</div><div class="v">${pw.prank ? ord(pw.prank) : "—"}</div><div class="d">score ${f1(pw.score)}</div></div>
        <div class="kpi"><div class="l">Puntos por partido</div><div class="v">${f1(st.ppg)}</div><div class="d">${ord(ppgRank)} de la liga</div></div>
        <div class="kpi"><div class="l">Playoffs</div><div class="v">${D.sim.remaining.length ? pct(sim.playoff) : st.rank <= D.playoffTeams ? "Adentro" : "Fuera"}</div><div class="d">${D.sim.remaining.length ? "Bye " + pct(sim.bye) : ""}</div></div></div>

      <div class="h3">Cómo va su temporada</div>${chart(D, rid)}
      <div class="h3">Diagnóstico</div><div class="tp-diag">${diag.map((d) => `<p>${esc(d)}</p>`).join("")}</div>
      <div class="tp-grades">${["draft", "waivers", "trades", "lineups"].map((k) => `<div class="tp-grade"><b>${g[k].grade}</b><div><div class="tn">${gradeLbl[k]}</div><div class="small muted">${esc(gradeTxt[k])}</div></div></div>`).join("")}</div>

      <div class="grid g2" style="margin-top:6px"><div><div class="h3">Su roster · semana ${cw}</div><div class="tbl-wrap"><table><thead><tr><th>Pos</th><th>Jugador</th><th class="r">PPG</th><th class="r">Proy.</th></tr></thead><tbody>${rosterRows}</tbody></table></div></div>
        <div><div class="h3">Fuerza por posición</div><p class="small muted" style="margin-top:-4px">Lugar en la liga de sus titulares, por promedio de puntos.</p>${strRows}
        ${mvp.length ? `<div class="h3">Sus figuras</div>${mvp.map((m, i) => `<div class="list-row"><span class="faint num">${i + 1}</span><span>${UI.pl(D, m.p)}</span><span class="sp"></span><b class="num">${f1(m.v)}</b><span class="small faint">pts tit.</span></div>`).join("")}` : ""}</div></div>

      ${rem.length ? `<div class="h3">Lo que viene</div>${remRows}${scn}` : ""}

      <div class="h3">Sus movimientos</div>
      <div class="grid g2"><div><div class="small muted" style="margin-bottom:4px">Mejores altas (pts como titular)</div>${picks.map((p) => `<div class="list-row small"><span>${UI.pl(D, p.pid)}</span><span class="faint">sem ${p.week}</span><span class="sp"></span><b class="num">${f1(p.start)}</b></div>`).join("") || '<p class="small muted">Sin altas que hayan jugado.</p>'}
        ${gifts.length ? `<div class="small muted" style="margin:12px 0 4px">Los que soltó y le dolieron</div>${gifts.map((d) => `<div class="list-row small"><span>${UI.pl(D, d.pid)}</span><span class="sp"></span><span>${T(D, d.to)} le sacó <b class="bad">${f1(d.gave)}</b></span></div>`).join("")}` : ""}</div>
        <div><div class="small muted" style="margin-bottom:4px">Trades</div>${trades.map((x) => { const me = x.sides.find((s) => s.rid === rid), ot = x.sides.find((s) => s.rid !== rid); return `<div class="list-row small"><span>S${x.week}: recibió ${esc(me.gets.map((q) => UI.plName(D, q.pid)).join(", ") || "—")} de ${T(D, ot.rid)}</span><span class="sp"></span><b class="${me.startPts >= ot.startPts ? "good" : "bad"}">${sign(me.startPts - ot.startPts)}</b></div>`; }).join("") || '<p class="small muted">No ha hecho trades.</p>'}
        ${draft.length ? `<div class="small muted" style="margin:12px 0 4px">Su draft</div>${bestPick ? `<div class="list-row small"><span>Mejor pick: ${UI.pl(D, bestPick.pid)} (ronda ${bestPick.round})</span><span class="sp"></span><b>#${bestPick.ptsRank}</b></div>` : ""}${worstPick ? `<div class="list-row small"><span>Peor pick: ${UI.pl(D, worstPick.pid)} (ronda ${worstPick.round})</span><span class="sp"></span><b>#${worstPick.ptsRank}</b></div>` : ""}` : ""}</div></div>

      <div class="h3">Contra cada rival</div>
      <div class="tbl-wrap"><table><thead><tr><th class="sticky-col">Rival</th><th></th><th class="c">Récord</th><th class="r">Puntos</th><th>Próximo</th></tr></thead><tbody>${vsRows}</tbody></table></div>

      <div class="h3">Sus momentos</div>
      <div class="grid g2"><div>${evs.map((e, i) => `<div class="latest-i" data-ev="${i}"><div class="lt-w">Sem ${e.week}</div><div><div class="lt-k">${esc(e.kicker)}</div><div class="lt-h">${esc(e.headline)}</div></div></div>`).join("") || '<p class="small muted">Todavía no sale en las noticias.</p>'}</div>
        <div>${best ? `<div class="list-row small"><span>Mejor semana</span><span class="sp"></span><b>${f1(best.pf)}</b><span class="faint">sem ${best.w}</span></div>` : ""}${worst ? `<div class="list-row small"><span>Peor semana</span><span class="sp"></span><b>${f1(worst.pf)}</b><span class="faint">sem ${worst.w}</span></div>` : ""}${bigWin ? `<div class="list-row small"><span>Victoria más amplia</span><span class="sp"></span><b>+${f1(bigWin.pf - bigWin.pa)}</b><span class="faint">vs ${T(D, bigWin.opp)}</span></div>` : ""}<div class="list-row small"><span>Veces equipo de la semana</span><span class="sp"></span><b>${D.records.weeklyTopCount[rid] || 0}</b></div></div></div>`;

    el.querySelector("#tpSel").onchange = (e) => onPick(Number(e.target.value));
    el.querySelectorAll("[data-ev]").forEach((b) => (b.onclick = () => LB.openArticle && LB.openArticle(evs[Number(b.dataset.ev)])));
    el.querySelector("#tpImg").onclick = () => {
      const body = `<div style="display:flex;align-items:center;gap:28px;margin:6px 0 26px"><div style="width:150px;height:150px;border-radius:50%;background:${UI.color(rid)};display:grid;place-items:center;font-family:'Barlow Condensed',sans-serif;font-size:64px;font-weight:700;color:#fff">${esc(UI.tName(D, rid).replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase())}</div><div><div class="ic-name" style="font-size:52px;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase">${T(D, rid)}</div><div class="ic-meta" style="font-size:26px">${esc(t.ownersNick)}</div></div></div>
        ${[["Récord", `${rec(st)} · ${ord(st.rank)} lugar`], ["Power ranking", pw.prank ? ord(pw.prank) : "—"], ["Puntos por partido", `${f1(st.ppg)} (${ord(ppgRank)})`], ["Playoffs", D.sim.remaining.length ? pct(sim.playoff) : st.rank <= D.playoffTeams ? "Adentro" : "Fuera"], ["Mejor semana", best ? `${f1(best.pf)} (sem ${best.w})` : "—"], ["Su figura", mvp[0] ? `${UI.plName(D, mvp[0].p)} · ${f1(mvp[0].v)}` : "—"], ["Calificaciones", `Draft ${g.draft.grade} · Waivers ${g.waivers.grade} · Trades ${g.trades.grade} · Lineups ${g.lineups.grade}`]].map(([a, b]) => `<div class="ic-row" style="grid-template-columns:1fr auto"><div class="ic-meta" style="font-size:24px;text-transform:uppercase;letter-spacing:2px;font-weight:700;color:#7A5236">${a}</div><div class="ic-name" style="text-align:right">${esc(b)}</div></div>`).join("")}
        <div style="font-family:Lora,Georgia,serif;font-size:27px;line-height:1.45;margin-top:22px">${esc(diag[0])} ${esc(diag[2] || "")}</div>`;
      UI.makeImage(UI.icFrame(D, "Ficha del equipo", "Así va", body), `ficha-${UI.tName(D, rid).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    };
  };
})();
