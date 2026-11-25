/* =================================================================
   LA BUENÍSIMA WRAPPED · resumen de temporada estilo Spotify Wrapped
   - Uno privado por equipo (cada manager abre el suyo con su link)
   - Uno de toda la liga
   - Bloqueado hasta LB_CONFIG.wrappedUnlock (2 días después de la final)
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, pct, rec } = UI;
  const W = (LB.wrapped = {});
  const T = (D, r) => esc(UI.tName(D, r));
  const N = (D, r) => esc(UI.oName(D, r));
  const P = (D, p) => esc(D.players[p] ? D.players[p].name : p);
  const COL = { forest: "#2F5D50", cafe: "#7A5236", blue: "#3E5C76", sand: "#D8C3A5", coral: "#C4553D", ink: "#22201C", paper: "#EAE7DC", olive: "#5C6B3A", plum: "#5E4A63" };
  const fmt = (n) => Math.round(n).toLocaleString("es-MX");

  W.unlockAt = () => new Date(CFG.wrappedUnlock || "2027-01-06T00:00:00-06:00");
  W.isOpen = () => Date.now() >= W.unlockAt().getTime();
  W.codeFor = (D, rid) => { const own = D.teams[rid].owner; const m = CFG.wrappedCodes || {}; return Object.keys(m).find((c) => (m[c] || "").toLowerCase() === (own || "").toLowerCase()); };
  W.ridForCode = (D, code) => { const own = (CFG.wrappedCodes || {})[code]; if (!own) return null; return D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === own.toLowerCase())) || null; };

  /* ---------------- datos ---------------- */
  function weeksOf(D, r) { return D.playedWeeks.filter((w) => D.tw[r][w]).map((w) => D.tw[r][w]); }
  function startersPts(D, r) {
    const by = {}, wk = {};
    D.playedWeeks.forEach((w) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { by[p] = (by[p] || 0) + (e.sp[i] || 0); wk[p] = (wk[p] || 0) + 1; }); });
    return { by, wk };
  }
  function personalities(D) {
    if (D._pers) return D._pers;
    const st = D.standings, get = (r) => st.find((x) => x.rid === r) || {};
    const ms = D.moveStats;
    const sdOf = (r) => LB.util.sd(weeksOf(D, r).map((x) => x.pf));
    const types = [
      { k: "cirujano", name: "El Cirujano", line: "Nunca dejas un punto en la mesa.", v: (r) => get(r).eff },
      { k: "alquimista", name: "El Alquimista", line: "Conviertes basura del waiver en oro.", v: (r) => ms[r].waiverStart },
      { k: "lobo", name: "El Lobo de Wall Street", line: "Cada trade tuyo es un atraco legal.", v: (r) => (ms[r].trades ? ms[r].tradeNet : -1e9) },
      { k: "ratero", name: "El Ratero", line: "Vives en el waiver. Tu familia te extraña.", v: (r) => ms[r].moves },
      { k: "monje", name: "El Monje", line: "Draft y a rezar. Cero estrés.", v: (r) => -ms[r].moves - ms[r].trades * 3 },
      { k: "bendecido", name: "El Bendecido", line: "Ganas sin saber cómo, y no pides perdón.", v: (r) => get(r).luck },
      { k: "salado", name: "El Salado", line: "Jugaste para más. El calendario te odia.", v: (r) => -get(r).luck },
      { k: "rusa", name: "La Montaña Rusa", line: "Contigo nunca se sabe: 160 o 70.", v: (r) => sdOf(r) },
      { k: "suizo", name: "El Reloj Suizo", line: "Siempre igual. Aburrido, pero efectivo.", v: (r) => -sdOf(r) },
      { k: "bancas", name: "El Coleccionista de Bancas", line: "Tu banca jugaría playoffs.", v: (r) => get(r).max - get(r).pf },
    ];
    const pairs = [];
    types.forEach((t) => {
      const vals = D.rids.map((r) => t.v(r)).filter((x) => x > -1e8);
      const m = LB.util.avg(vals), s = LB.util.sd(vals) || 1;
      D.rids.forEach((r) => { const v = t.v(r); if (v > -1e8) pairs.push({ t, r, z: (v - m) / s }); });
    });
    pairs.sort((a, b) => b.z - a.z);
    const out = {}, usedT = new Set();
    for (const p of pairs) { if (out[p.r] || usedT.has(p.t.k)) continue; out[p.r] = p.t; usedT.add(p.t.k); }
    D.rids.forEach((r) => { if (!out[r]) out[r] = types.find((t) => !usedT.has(t.k)) || types[0]; });
    D._pers = out;
    return out;
  }
  W.teamData = function (D, r) {
    const st = D.standings.find((x) => x.rid === r) || {};
    const ws = weeksOf(D, r);
    const best = ws.slice().sort((a, b) => b.pf - a.pf)[0], worst = ws.slice().sort((a, b) => a.pf - b.pf)[0];
    const allPf = []; D.rids.forEach((x) => weeksOf(D, x).forEach((t) => allPf.push(t.pf))); allPf.sort((a, b) => b - a);
    const bestRankAll = best ? allPf.indexOf(best.pf) + 1 : null;
    const { by, wk } = startersPts(D, r);
    const total = Object.values(by).reduce((s, x) => s + x, 0) || 1;
    const mvp = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    const loyalList = Object.entries(wk).sort((a, b) => b[1] - a[1] || by[b[0]] - by[a[0]]);
    const loyal = loyalList.find((x) => !mvp || x[0] !== mvp[0] || x[1] < loyalList[0][1]) && loyalList[0][0] === (mvp && mvp[0]) && loyalList[1] && loyalList[1][1] === loyalList[0][1] ? loyalList[1] : loyalList[0];
    const worstStarter = (w) => { const e = D.weeks[w.w][r]; return e.starters.map((p, i) => ({ p, pts: e.sp[i] || 0 })).sort((a, b) => a.pts - b.pts)[0]; };
    const bestStarter = (w) => { const e = D.weeks[w.w][r]; return e.starters.map((p, i) => ({ p, pts: e.sp[i] || 0 })).sort((a, b) => b.pts - a.pts)[0]; };
    const bench = ws.reduce((s, x) => s + (x.max - x.pf), 0);
    const benchLoss = ws.filter((x) => x.res === "L" && x.max > (x.pa || 0)).sort((a, b) => (b.max - b.pf) - (a.max - a.pf))[0];
    const pick = D.pickups.filter((p) => p.rid === r).sort((a, b) => b.start - a.start)[0];
    let trade = null;
    D.trades.forEach((t) => { if (t.sides.length !== 2 || !t.rids.includes(r)) return; const me = t.sides.find((s) => s.rid === r), ot = t.sides.find((s) => s.rid !== r); const n = me.startPts - ot.startPts; if (!trade || n > trade.n) trade = { n, me, ot, w: t.week }; });
    const gift = D.drops.filter((d) => d.rid === r && d.to).sort((a, b) => b.gave - a.gave)[0];
    const bestMove = trade && (!pick || trade.n > pick.start) ? { kind: "trade", v: trade.n, txt: `El trade de la semana ${trade.w} con ${T(D, trade.ot.rid)}`, sub: `Te trajo a ${trade.me.gets.map((g) => P(D, g.pid)).join(" y ")}` } : pick ? { kind: "pick", v: pick.start, txt: `Levantar a ${P(D, pick.pid)} del waiver`, sub: `Semana ${pick.week}` } : null;
    // rivales
    const vs = {};
    ws.forEach((x) => { if (x.opp == null) return; const v = (vs[x.opp] = vs[x.opp] || { r: x.opp, W: 0, L: 0, diff: 0 }); if (x.res === "W") v.W++; else if (x.res === "L") v.L++; v.diff += x.pf - (x.pa || 0); });
    const vl = Object.values(vs);
    const nemesis = vl.slice().sort((a, b) => b.L - a.L || a.diff - b.diff)[0];
    const victim = vl.slice().sort((a, b) => b.W - a.W || b.diff - a.diff)[0];
    const rivals = vl.filter((v) => UI.rivals(D, r, v.r)).map((v) => ({ ...v, name: UI.rivals(D, r, v.r) }));
    // montaña rusa
    const ranks = D.regWeeksPlayed.map((w) => ({ w, rank: (D.standingsAt(w).find((x) => x.rid === r) || {}).rank }));
    const low = ranks.slice().sort((a, b) => b.rank - a.rank || a.w - b.w)[0], high = ranks.slice().sort((a, b) => a.rank - b.rank || a.w - b.w)[0];
    // óscars (datos) donde va primero
    const oscars = [];
    try { (window.LB_AWARDS.categories || []).filter((k) => k.type === "data").forEach((k) => { const L = LB.awards._metric && LB.awards._metric(k.metric, D); if (L && L[0] && L[0].rid === r) oscars.push(k.name); }); } catch (e) {}
    const final = D.bracket && D.bracket.length ? D.bracket.filter((m) => m.r === Math.max(...D.bracket.map((x) => x.r)) && m.p === 1)[0] : null;
    return { r, st, ws, best, worst, bestRankAll, mvp, mvpShare: mvp ? mvp[1] / total : 0, loyal, bench, benchLoss, bestMove, gift, nemesis, victim, rivals, ranks, low, high, pers: personalities(D)[r], worstStarter, bestStarter, oscars, champ: final && final.w === r, runner: final && final.l === r };
  };

  /* ---------------- tarjetas (1080x1920) ---------------- */
  // Títulos: ajusta el tamaño para que la palabra más larga quepa sin partirse
  const fitTitles = (html) => html.replace(/<div class="wr-title( xl)?">([\s\S]*?)<\/div>/g, (m, xl, txt) => {
    const plain = txt.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "x");
    const longest = Math.max(...plain.split(/\s+/).map((w) => w.length), 1);
    const base = xl ? 150 : 112;
    const words = plain.length;
    let size = Math.min(base, Math.floor(920 / (longest * 0.56)));
    if (words > 40) size = Math.min(size, 84);
    return `<div class="wr-title" style="font-size:${size}px">${txt}</div>`;
  });
  const card = (bg, fg, inner, D, foot) => fitTitles(`<div class="wr-card" style="background:${bg};color:${fg}">
    <div class="wr-top"><img src="${esc(CFG.logo || "")}" alt=""><span>La Buenísima Wrapped ${esc(D.season)}</span></div>
    <div class="wr-body">${inner}</div>
    <div class="wr-foot"><span>${foot || ""}</span><span>labuenisima</span></div></div>`);
  const big = (n, cls = "") => `<div class="wr-big ${cls}" data-count="${typeof n === "number" ? n : ""}">${typeof n === "number" ? fmt(n) : n}</div>`;
  const kick = (t) => `<div class="wr-kick">${t}</div>`;
  const line = (t, cls = "") => `<div class="wr-line ${cls}">${t}</div>`;

  function rankChart(ranks, n, fg) {
    if (ranks.length < 2) return "";
    const w = 900, h = 520, x = (i) => 40 + (i * (w - 80)) / (ranks.length - 1), y = (k) => 40 + ((k - 1) * (h - 80)) / Math.max(1, n - 1);
    const d = ranks.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.rank).toFixed(1)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart">${[1, n].map((k) => `<text x="0" y="${y(k) + 8}" font-size="34" font-weight="700" fill="${fg}" opacity=".7">${k}°</text>`).join("")}<path d="${d}" fill="none" stroke="${fg}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" class="wr-draw"/>${ranks.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.rank)}" r="${i === ranks.length - 1 ? 16 : 8}" fill="${fg}"/>`).join("")}<text x="${x(0)}" y="${h - 2}" font-size="24" fill="${fg}" opacity=".6">S${ranks[0].w}</text><text x="${x(ranks.length - 1)}" y="${h - 2}" font-size="24" fill="${fg}" opacity=".6" text-anchor="end">S${ranks[ranks.length - 1].w}</text></svg>`;
  }

  W.teamCards = function (D, r) {
    const X = W.teamData(D, r);
    const s = X.st, nick = N(D, r), team = T(D, r);
    const cards = [];
    cards.push(card(COL.forest, COL.paper, `${kick("Tu temporada")}<div class="wr-title">${nick},</div>${line(`esta fue la temporada ${esc(D.season)} de <b>${team.replace(/\.+$/, "")}</b>.`, "lg")}${line("Toca para empezar.", "dim")}`, D));
    cards.push(card(COL.paper, COL.ink, `${kick("Tus números")}${big(s.pf || 0)}${line("puntos en la temporada")}<div class="wr-grid"><div><b>${rec(s)}</b><span>récord</span></div><div><b>${s.rank}°</b><span>lugar de ${D.numTeams}</span></div><div><b>${f1(s.ppg)}</b><span>por partido</span></div></div>`, D, team));
    if (X.ranks.length > 1) cards.push(card(COL.blue, COL.paper, `${kick("Tu montaña rusa")}${line(X.low.rank > X.high.rank ? `Llegaste a estar <b>${X.low.rank}°</b> en la semana ${X.low.w}.` : "Estuviste arriba casi toda la temporada.", "lg")}${rankChart(X.ranks, D.numTeams, COL.paper)}${line(X.high.rank === 1 ? `Y en la semana ${X.high.w} estabas en la cima.` : `Tu mejor momento: ${X.high.rank}° en la semana ${X.high.w}.`, "dim")}`, D, team));
    if (X.best) {
      const opts = [X.best.w, ...X.ws.filter((x) => x.w !== X.best.w).sort((a, b) => b.pf - a.pf).slice(1, 3).map((x) => x.w)].sort((a, b) => a - b);
      const bs = X.bestStarter(X.best);
      cards.push(card(COL.sand, COL.ink, `${kick("¿Adivinas tu mejor semana?")}<div class="wr-guess" data-ans="${X.best.w}">${opts.map((w) => `<button data-w="${w}">Semana ${w}</button>`).join("")}</div><div class="wr-reveal">${big(X.best.pf)}${line(`puntos en la <b>semana ${X.best.w}</b>.`)}${line(X.bestRankAll === 1 ? "La mejor marca de toda la liga." : `La ${X.bestRankAll}ª mejor marca de toda la liga.`, "dim")}${bs ? line(`La figura: ${P(D, bs.p)} con ${f1(bs.pts)}.`, "dim") : ""}</div>`, D, team));
    }
    if (X.mvp) cards.push(card(COL.forest, COL.paper, `${kick("Tu MVP")}<div class="wr-title">${P(D, X.mvp[0])}</div>${big(X.mvp[1])}${line(`puntos como titular: el <b>${pct(X.mvpShare)}</b> de toda tu temporada.`)}`, D, team));
    if (X.loyal) cards.push(card(COL.cafe, COL.paper, `${kick("Tu jugador fiel")}<div class="wr-title">${P(D, X.loyal[0])}</div>${big(X.loyal[1])}${line(`semanas de titular de ${X.ws.length}. Ni en las malas lo sentaste.`)}`, D, team));
    if (X.worst) { const ws = X.worstStarter(X.worst); cards.push(card(COL.ink, COL.paper, `${kick("Tu ladrillo")}${big(X.worst.pf)}${line(`puntos en la semana ${X.worst.w}. Mejor ni hablamos.`)}${ws ? line(`${P(D, ws.p)} hizo ${f1(ws.pts)}. De titular.`, "dim") : ""}`, D, team)); }
    cards.push(card(COL.sand, COL.ink, `${kick("La banca que dolió")}${big(X.bench)}${line("puntos se quedaron sentados en tu banca.")}${X.benchLoss ? line(`La semana ${X.benchLoss.w} la ganabas: perdiste ${f1(X.benchLoss.pf)}–${f1(X.benchLoss.pa)} con ${f1(X.benchLoss.max - X.benchLoss.pf)} en la banca.`, "dim") : line("Y nunca perdiste un partido por eso. Bien ahí.", "dim")}`, D, team));
    cards.push(card(COL.blue, COL.paper, `${kick("Tus movidas")}${X.bestMove ? `<div class="wr-sub">La mejor</div>${line(X.bestMove.txt, "lg")}${line(`+${f1(X.bestMove.v)} pts · ${X.bestMove.sub}`, "dim")}` : line("No hiciste ni una movida. Respeto.", "lg")}${X.gift && X.gift.gave > 10 ? `<div class="wr-sub" style="margin-top:70px">La que dolió</div>${line(`Soltar a ${P(D, X.gift.pid)}`, "lg")}${line(`Le regalaste ${f1(X.gift.gave)} pts a ${T(D, X.gift.to)}.`, "dim")}` : ""}`, D, team));
    if (X.nemesis) {
      const rv = X.rivals[0];
      cards.push(card(COL.coral, COL.paper, `${kick("Tú contra ellos")}<div class="wr-sub">Tu némesis</div>${line(`<b>${N(D, X.nemesis.r)}</b> te ganó ${X.nemesis.L} de ${X.nemesis.W + X.nemesis.L}.`, "lg")}<div class="wr-sub" style="margin-top:60px">Tu víctima</div>${line(`<b>${N(D, X.victim.r)}</b>: le ganaste ${X.victim.W} de ${X.victim.W + X.victim.L}.`, "lg")}${rv ? `<div class="wr-sub" style="margin-top:60px">${esc(rv.name)}</div>${line(rv.W > rv.L ? `Fue tuyo: ${rv.W}-${rv.L}.` : rv.W < rv.L ? `Lo perdiste ${rv.W}-${rv.L}. Hay revancha en 2027.` : `Quedó ${rv.W}-${rv.L}. Nadie presume.`, "lg")}` : ""}`, D, team));
    }
    cards.push(card(COL.olive, COL.paper, `${kick("La suerte")}<div class="wr-pair"><div>${big(s.W || 0, "md")}<span>victorias reales</span></div><div>${big(f1(s.expW || 0), "md")}<span>las que merecías</span></div></div>${line(s.luck >= 1 ? "La suerte te debe la cuenta. Págala en 2027." : s.luck <= -1 ? "El calendario te odió. No fue tu culpa (casi)." : "Ni suertudo ni salado: tienes lo que jugaste.", "lg")}`, D, team));
    cards.push(card(COL.ink, COL.paper, `${kick("Tu personalidad de manager")}<div class="wr-sub">Eres</div><div class="wr-title xl">${esc(X.pers.name)}</div>${line(esc(X.pers.line), "lg")}`, D, team));
    const cierre = X.champ ? `Campeón de La Buenísima ${esc(D.season)}.` : X.runner ? `Subcampeón. Tan cerca…` : `Terminaste ${s.rank}° de ${D.numTeams}.`;
    cards.push(card(COL.forest, COL.paper, `${kick("Eso fue todo")}<div class="wr-title">${cierre}</div>${X.oscars.length ? line(`Óscars: ${X.oscars.map(esc).join(", ")}.`, "dim") : ""}${line("Nos vemos en el draft 2027.", "lg")}`, D, team));
    return cards;
  };

  W.leagueCards = function (D) {
    const cards = [];
    const tot = D.rids.reduce((s, r) => s + weeksOf(D, r).reduce((a, x) => a + x.pf, 0), 0);
    const nGames = D.records.games.length;
    cards.push(card(COL.forest, COL.paper, `${kick("La liga")}<div class="wr-title">La Buenísima ${esc(D.season)}, en números</div><div class="wr-grid two"><div><b>${fmt(tot)}</b><span>puntos</span></div><div><b>${nGames}</b><span>partidos</span></div><div><b>${D.trades.length}</b><span>trades</span></div><div><b>${D.pickups.length}</b><span>altas</span></div></div>`, D));
    const final = D.bracket && D.bracket.length ? D.bracket.filter((m) => m.r === Math.max(...D.bracket.map((x) => x.r)) && m.p === 1)[0] : null;
    const champ = final && final.w ? final.w : null;
    cards.push(card(COL.ink, COL.paper, `${kick(champ ? "El campeón" : "El líder (vista previa)")}<div class="wr-title xl">${T(D, champ || D.standings[0].rid)}</div>${line(N(D, champ || D.standings[0].rid), "lg")}${champ ? line(`Venció a ${T(D, final.l)} en la final.`, "dim") : line("El campeón se define en la semana " + D.totalWeeks + ".", "dim")}`, D));
    // carrera de los 10
    const weeks = D.regWeeksPlayed;
    if (weeks.length > 1) {
      const w = 960, h = 1000, x = (i) => 30 + (i * (w - 260)) / (weeks.length - 1), y = (k) => 30 + ((k - 1) * (h - 60)) / (D.numTeams - 1);
      const tables = weeks.map((wk) => D.standingsAt(wk));
      const lead = D.standings[0].rid;
      const lines = D.rids.map((r) => { const pts = tables.map((t) => (t.find((s) => s.rid === r) || {}).rank); const d = pts.map((k, i) => `${i ? "L" : "M"}${x(i)},${y(k)}`).join(""); const hi = r === lead; return `<path d="${d}" fill="none" stroke="${hi ? COL.paper : UI.color(r)}" stroke-width="${hi ? 10 : 5}" opacity="${hi ? 1 : 0.85}" stroke-linejoin="round"/><text x="${x(weeks.length - 1) + 16}" y="${y(pts[pts.length - 1]) + 9}" font-size="26" fill="${COL.paper}" font-weight="${hi ? 700 : 400}">${T(D, r).slice(0, 14)}</text>`; }).join("");
      cards.push(card(COL.blue, COL.paper, `${kick("La carrera")}<div class="wr-title">Así se movió la tabla</div><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart">${lines}</svg>`, D));
    }
    const close = D.records.closest[0], high = D.records.games.slice().sort((a, b) => b.pa + b.pb - (a.pa + a.pb))[0];
    if (close) { const aw = close.pa > close.pb; cards.push(card(COL.sand, COL.ink, `${kick("El partido del año")}<div class="wr-title">${T(D, aw ? close.a : close.b)} vs ${T(D, aw ? close.b : close.a)}</div>${big(`${f1(Math.max(close.pa, close.pb))}–${f1(Math.min(close.pa, close.pb))}`, "md")}${line(`Semana ${close.w}. Se decidió por ${f1(Math.abs(close.pa - close.pb))} puntos.`, "lg")}${high ? line(`Y el de más puntos: ${f1(high.pa + high.pb)} combinados en la semana ${high.w}.`, "dim") : ""}`, D)); }
    const rv = (CFG.rivalries || []).map((x) => {
      const ra = D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === (x.a || "").toLowerCase()));
      const rb = D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === (x.b || "").toLowerCase()));
      if (ra == null || rb == null) return null;
      let wa = 0, wb = 0; weeksOf(D, ra).forEach((t) => { if (t.opp === rb) { if (t.res === "W") wa++; else if (t.res === "L") wb++; } });
      return `<div class="wr-rv"><div class="wr-sub">${esc(x.name)}</div>${line(`${N(D, ra)} <b>${wa}</b> – <b>${wb}</b> ${N(D, rb)}`, "lg")}</div>`;
    }).filter(Boolean);
    if (rv.length) cards.push(card(COL.coral, COL.paper, `${kick("Las rivalidades")}${rv.join("")}`, D));
    const by = {}; D.playedWeeks.forEach((w) => D.rids.forEach((r) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { const k = p + "|" + r; by[k] = (by[k] || 0) + (e.sp[i] || 0); }); }));
    const mvp = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    const steal = D.draft.filter((p) => p.round >= 4).sort((a, b) => b.value - a.value)[0];
    if (mvp) { const [p, r] = mvp[0].split("|"); cards.push(card(COL.forest, COL.paper, `${kick("El MVP de la liga")}<div class="wr-title">${P(D, p)}</div>${big(mvp[1])}${line(`puntos como titular para ${T(D, Number(r))}.`)}${steal ? `<div class="wr-sub" style="margin-top:70px">El robo del draft</div>${line(`${P(D, steal.pid)}, ronda ${steal.round}: terminó #${steal.ptsRank} en puntos.`, "lg")}` : ""}`, D)); }
    const pers = personalities(D);
    cards.push(card(COL.ink, COL.paper, `${kick("Las personalidades")}<div class="wr-list">${D.standings.map((s) => `<div><span>${N(D, s.rid)}</span><b>${esc(pers[s.rid].name)}</b></div>`).join("")}</div>`, D));
    cards.push(card(COL.forest, COL.paper, `${kick("Fin")}<div class="wr-title xl">Gracias por otra temporada</div>${line("Nos vemos en el draft 2027.", "lg")}`, D));
    return cards;
  };

  /* ---------------- visor tipo historias ---------------- */
  W.open = function (D, cards, title) {
    let i = 0;
    const ov = document.createElement("div");
    ov.className = "wr-ov";
    ov.innerHTML = `<div class="wr-bars">${cards.map(() => "<i><b></b></i>").join("")}</div><div class="wr-stage"><div class="wr-scale"></div></div>
      <div class="wr-ctl"><button class="btn" data-a="close">Cerrar</button><span class="sp"></span><button class="btn pri" data-a="img">Guardar esta tarjeta</button></div>`;
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    const scale = ov.querySelector(".wr-scale"), stage = ov.querySelector(".wr-stage");
    const fit = () => { const s = Math.min(stage.clientWidth / 1080, stage.clientHeight / 1920); scale.style.transform = `scale(${s})`; scale.style.width = "1080px"; scale.style.height = "1920px"; scale.style.marginLeft = (stage.clientWidth - 1080 * s) / 2 + "px"; };
    const show = () => {
      scale.innerHTML = cards[i];
      ov.querySelectorAll(".wr-bars i").forEach((b, k) => b.classList.toggle("done", k < i) || b.classList.toggle("on", k === i));
      ov.querySelectorAll(".wr-bars i").forEach((b, k) => b.classList.toggle("on", k === i));
      // contar hacia arriba
      scale.querySelectorAll("[data-count]").forEach((el) => { const n = Number(el.dataset.count); if (!n) return; const t0 = performance.now(); const step = (t) => { const p = Math.min(1, (t - t0) / 900); el.textContent = fmt(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
      const g = scale.querySelector(".wr-guess");
      if (g) { scale.querySelector(".wr-reveal").style.visibility = "hidden"; g.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; e.stopPropagation(); g.querySelectorAll("button").forEach((x) => x.classList.add(x.dataset.w === g.dataset.ans ? "ok" : x === b ? "no" : "off")); scale.querySelector(".wr-reveal").style.visibility = "visible"; }; }
      fit();
    };
    const close = () => { ov.remove(); document.body.style.overflow = ""; window.removeEventListener("resize", fit); document.removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); if (e.key === "Escape") close(); };
    const next = () => { if (i < cards.length - 1) { i++; show(); } };
    const prev = () => { if (i > 0) { i--; show(); } };
    stage.onclick = (e) => { const x = e.clientX - stage.getBoundingClientRect().left; if (x < stage.clientWidth / 3) prev(); else next(); };
    ov.querySelector('[data-a="close"]').onclick = close;
    ov.querySelector('[data-a="img"]').onclick = () => { const html = cards[i].replace('class="wr-reveal"', 'class="wr-reveal" style="visibility:visible"'); UI.makeImage(`<div class="wr-export">${html}</div>`, `wrapped-${(title || "liga").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i + 1}`); };
    window.addEventListener("resize", fit);
    document.addEventListener("keydown", key);
    show();
  };

  /* ---------------- sección en el sitio ---------------- */
  W.render = function (D, el, opts = {}) {
    const unlock = W.unlockAt();
    const open = opts.preview || W.isOpen();
    const m = (location.hash || "").match(/^#wrapped-([A-Za-z0-9]+)$/);
    const code = m ? m[1] : null;
    const rid = code ? W.ridForCode(D, code) : null;
    const fecha = unlock.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (!open) {
      el.innerHTML = `<div class="wr-lock"><img src="${esc(CFG.logo || "")}" alt=""><div class="h2">Wrapped ${esc(D.season)}</div><p class="sub">Tu temporada, contada como nunca. Se abre el <b>${esc(fecha)}</b>, dos días después de la final.</p><div class="wr-count" id="wrCount"></div><p class="small muted">Cada manager recibe su link privado. El Wrapped de la liga se abre para todos el mismo día.</p></div>`;
      const tick = () => { const ms = unlock - Date.now(); if (ms <= 0) return W.render(D, el); const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), mi = Math.floor((ms % 36e5) / 6e4); const c = document.getElementById("wrCount"); if (c) c.innerHTML = `<div><b>${d}</b><span>días</span></div><div><b>${h}</b><span>horas</span></div><div><b>${mi}</b><span>min</span></div>`; };
      tick(); clearInterval(W._t); W._t = setInterval(tick, 30000);
      return;
    }
    el.innerHTML = `<div class="h2">Wrapped ${esc(D.season)}</div><p class="sub">${opts.preview ? "Vista previa privada con los datos hasta la semana " + D.lastScored + "." : "La temporada se acabó. Así nos fue."}</p>
      <div class="wr-entry"><button class="btn pri" id="wrLeague">Ver el Wrapped de la liga</button>
      ${rid ? `<button class="btn pri" id="wrMine">Ver el Wrapped de ${T(D, rid)}</button>` : `<p class="small muted" style="margin:10px 0 0">Tu Wrapped personal se abre con el link que te mandó el comisionado.</p>`}</div>`;
    el.querySelector("#wrLeague").onclick = () => W.open(D, W.leagueCards(D), "liga");
    const b = el.querySelector("#wrMine"); if (b) b.onclick = () => W.open(D, W.teamCards(D, rid), UI.tName(D, rid));
    if (rid && opts.autoOpen !== false && !W._opened) { W._opened = true; W.open(D, W.teamCards(D, rid), UI.tName(D, rid)); }
  };
})();
