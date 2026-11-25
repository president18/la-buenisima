/* =================================================================
   LA BUENÍSIMA WRAPPED · resumen de temporada estilo Spotify Wrapped
   - Uno privado por equipo (cada manager abre el suyo con su link)
   - Uno de toda la liga
   - Bloqueado hasta LB_CONFIG.wrappedUnlock (2 días después de la final)
   - Música: una canción de YouTube por tarjeta (reproductor visible)
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, pct, rec } = UI;
  const W = (LB.wrapped = {});
  const T = (D, r) => esc(UI.tName(D, r));
  const N = (D, r) => esc(UI.oName(D, r));
  const P = (D, p) => esc(D.players[p] ? D.players[p].name : p);
  const fmt = (n) => Math.round(n).toLocaleString("es-MX");
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* Paletas por tarjeta: fondo, texto, acento */
  const PAL = {
    forest: { bg: "#0F3D2E", fg: "#F4F1E8", ac: "#C8F169" },
    lime: { bg: "#C8F169", fg: "#0F2A20", ac: "#0F3D2E" },
    navy: { bg: "#1E2E6B", fg: "#F4F1E8", ac: "#FF8BA7" },
    coral: { bg: "#FF5A36", fg: "#1A0F0A", ac: "#FFE3C2" },
    cream: { bg: "#F6E7CB", fg: "#2A1A10", ac: "#E4572E" },
    purple: { bg: "#5B2A86", fg: "#F4F1E8", ac: "#7CF2C2" },
    black: { bg: "#121212", fg: "#F4F1E8", ac: "#C8F169" },
    mustard: { bg: "#F2B33D", fg: "#1A1206", ac: "#6B3E26" },
    blue: { bg: "#2F6CA8", fg: "#F4F1E8", ac: "#FFD166" },
    cafe: { bg: "#6B3E26", fg: "#F6E7CB", ac: "#F2B33D" },
    pink: { bg: "#FF8BA7", fg: "#1E1030", ac: "#1E2E6B" },
    mint: { bg: "#7CF2C2", fg: "#0E2A24", ac: "#5B2A86" },
  };
  const POSC = { QB: "#E4572E", RB: "#2BB673", WR: "#3E7CB1", TE: "#F2B33D", K: "#8E8D8A", DEF: "#5B2A86" };

  /* Música: YouTube solo en los momentos clave (ids), beats originales en el resto (beat).
     Se puede cambiar en config.js con wrappedSongs */
  const BEAT_A = "Beat original · La Buenísima";
  const SONGS = Object.assign({
    portada: { t: "Sirius", a: "The Alan Parsons Project", ids: ["UywKZcH_Wk0", "E_NNCNDYEpU"], s: 0 },
    personalidad: { t: "Who Are You", a: "The Who", ids: ["PNbBDrceCy8", "LYb_nqU_43w"], s: 0 },
    campeon: { t: "We Are the Champions", a: "Queen", ids: ["04854XqcfCY", "62v4y43D-3k"], s: 0 },
    cierre: { t: "Good Riddance (Time of Your Life)", a: "Green Day", ids: ["CnQ8N1KacJc", "zwEyuzaNUTA"], s: 0 },
    liga: { t: "Seven Nation Army", a: "The White Stripes", ids: ["0J2QdDbelmY"], s: 0 },
    numeros: { t: "Modo Bestia", a: BEAT_A, beat: "hype" },
    montana: { t: "Subidas y Bajadas", a: BEAT_A, beat: "rusa" },
    adivina: { t: "Cuenta Regresiva", a: BEAT_A, beat: "suspense" },
    vsliga: { t: "Tú contra Todos", a: BEAT_A, beat: "battle" },
    mvp: { t: "Salón de la Fama", a: BEAT_A, beat: "epic" },
    fiel: { t: "Siempre Titular", a: BEAT_A, beat: "chill" },
    ladrillo: { t: "Ladrillazo", a: BEAT_A, beat: "ladrillo" },
    banca: { t: "La Banca Llora", a: BEAT_A, beat: "sad" },
    movidas: { t: "Wall Street", a: BEAT_A, beat: "funk" },
    versus: { t: "Némesis", a: BEAT_A, beat: "battle" },
    suerte: { t: "Casino", a: BEAT_A, beat: "lounge" },
    resumen: { t: "Otra Temporada", a: BEAT_A, beat: "hype" },
    carrera: { t: "Sprint Final", a: BEAT_A, beat: "sprint" },
    partido: { t: "Final de Infarto", a: BEAT_A, beat: "battle" },
    robo: { t: "Robo a Mano Armada", a: BEAT_A, beat: "funk" },
    personalidades: { t: "Quién es Quién", a: BEAT_A, beat: "lounge" },
  }, CFG.wrappedSongs || {});
  W.SONGS = SONGS;

  W.unlockAt = () => new Date(CFG.wrappedUnlock || "2027-01-06T00:00:00-06:00");
  W.isOpen = () => Date.now() >= W.unlockAt().getTime();
  W.codeFor = (D, rid) => { const own = D.teams[rid].owner; const m = CFG.wrappedCodes || {}; return Object.keys(m).find((c) => (m[c] || "").toLowerCase() === (own || "").toLowerCase()); };
  W.ridForCode = (D, code) => { const own = (CFG.wrappedCodes || {})[code]; if (!own) return null; return D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === own.toLowerCase())) || null; };

  /* ---------------- datos ---------------- */
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

  /* datos extra para gráficas */
  W.extra = function (D, r, X) {
    const avgWk = {};
    D.playedWeeks.forEach((w) => { const v = D.rids.map((x) => D.tw[x][w] && D.tw[x][w].pf).filter((x) => x != null); avgWk[w] = LB.util.avg(v); });
    let mvpInfo = null;
    if (X.mvp) {
      const p = X.mvp[0]; let wk = 0, bestG = 0, bestW = null;
      D.playedWeeks.forEach((w) => { const e = D.weeks[w][r]; if (!e) return; const i = e.starters.indexOf(p); if (i < 0) return; wk++; const v = e.sp[i] || 0; if (v > bestG) { bestG = v; bestW = w; } });
      mvpInfo = { p, pts: X.mvp[1], wk, bestG, bestW, share: X.mvpShare };
    }
    const st = (x) => D.standings.find((s) => s.rid === x) || {};
    const ms = D.moveStats;
    const metric = (label, f, hi, fmtv) => {
      const vals = D.rids.map((x) => ({ r: x, v: f(x) }));
      const sorted = vals.slice().sort((a, b) => (hi ? b.v - a.v : a.v - b.v));
      return { label, vals, rank: sorted.findIndex((x) => x.r === r) + 1, me: f(r), fmtv, hi };
    };
    const vs = [
      metric("Puntos a favor", (x) => st(x).pf || 0, true, (v) => fmt(v)),
      metric("Alineaciones (% del máximo)", (x) => st(x).eff || 0, true, (v) => pct(v)),
      metric("Movidas en el waiver", (x) => ms[x].moves || 0, true, (v) => fmt(v)),
      metric("Puntos en contra", (x) => st(x).pa || 0, false, (v) => fmt(v)),
    ];
    return { avgWk, mvpInfo, vs };
  };

  /* ---------------- piezas visuales (lienzo 1080x1920) ---------------- */
  const svgWrap = (inner) => `<svg class="wr-decor" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  function decor(kind, p) {
    const A = p.ac, F = p.fg;
    switch (kind) {
      case "orbs": return svgWrap(`<g class="wr-f1"><circle cx="1010" cy="150" r="290" fill="${A}"/></g><g class="wr-f2"><circle cx="60" cy="1830" r="360" fill="${A}"/></g><g class="wr-f3"><circle cx="980" cy="1560" r="110" fill="${F}" opacity=".16"/></g><g class="wr-f1" style="animation-delay:-3s"><circle cx="120" cy="330" r="46" fill="${F}" opacity=".22"/></g>`);
      case "stripes": return svgWrap(`<g transform="rotate(-28 540 960)"><g class="wr-slide">${[...Array(9)].map((_, i) => `<rect x="${-300 + i * 190}" y="1450" width="90" height="900" fill="${i % 2 ? F : A}" opacity="${i % 2 ? 0.12 : 0.95}"/>`).join("")}</g></g>`);
      case "rings": return svgWrap([...Array(6)].map((_, i) => `<g class="wr-pulse" style="animation-delay:${-i * 0.5}s"><circle cx="540" cy="1980" r="${220 + i * 170}" fill="none" stroke="${A}" stroke-width="${34 - i * 4}" opacity="${0.95 - i * 0.13}"/></g>`).join(""));
      case "burst": return svgWrap(`<g class="wr-spin" style="transform-origin:540px 1650px">${[...Array(18)].map((_, i) => { const a = (i * 20 * Math.PI) / 180, b = ((i * 20 + 9) * Math.PI) / 180, R = 1400; return `<polygon points="540,1650 ${540 + R * Math.cos(a)},${1650 + R * Math.sin(a)} ${540 + R * Math.cos(b)},${1650 + R * Math.sin(b)}" fill="${A}" opacity=".22"/>`; }).join("")}</g><circle cx="540" cy="1650" r="150" fill="${A}"/>`);
      case "waves": return svgWrap([...Array(3)].map((_, i) => { const y = 1700 + i * 100; let d = `M-500,${y}`; for (let x = -500; x <= 1600; x += 140) d += ` Q${x + 70},${y + (i % 2 ? 70 : -70)} ${x + 140},${y}`; return `<g class="wr-wave" style="animation-duration:${5 + i}s"><path d="${d}" fill="none" stroke="${i % 2 ? F : A}" stroke-width="30" opacity="${i % 2 ? 0.18 : 0.9}" stroke-linecap="round"/></g>`; }).join(""));
      case "squares": return svgWrap([[880, 120, 170], [1010, 330, 90], [90, 1640, 210], [300, 1820, 110], [960, 1760, 70]].map(([x, y, s], i) => `<g class="wr-rot" style="animation-delay:${-i * 1.3}s"><rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="${s * 0.18}" fill="${i % 2 ? F : A}" opacity="${i % 2 ? 0.2 : 1}"/></g>`).join(""));
      case "zig": return svgWrap([0, 1].map((k) => { let d = ""; for (let x = -400, j = 0; x <= 1500; x += 95, j++) d += `${j ? "L" : "M"}${x},${(k ? 1870 : 1770) + (j % 2 ? 50 : -50)}`; return `<g class="wr-slide" style="animation-duration:${7 + k * 3}s"><path d="${d}" fill="none" stroke="${k ? F : A}" stroke-width="26" opacity="${k ? 0.25 : 1}" stroke-linejoin="round"/></g>`; }).join(""));
      case "dots": return svgWrap(`<g class="wr-spin" style="transform-origin:900px 1700px;animation-duration:30s"><path d="M900,1380 C1120,1380 1240,1560 1210,1730 C1180,1900 1010,2020 850,1990 C690,1960 560,1830 590,1660 C620,1490 700,1380 900,1380Z" fill="${A}"/></g>${[...Array(7)].map((_, i) => [...Array(4)].map((__, j) => `<circle class="wr-tw" style="animation-delay:${-(i + j) * 0.37}s" cx="${70 + j * 60}" cy="${1380 + i * 70}" r="9" fill="${F}" opacity=".35"/>`).join("")).join("")}`);
      default: return "";
    }
  }

  // Títulos: cada palabra entra con retraso; el tamaño se ajusta a la palabra más larga
  function title(txt, base = 120) {
    const plain = String(txt).replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "x");
    const longest = Math.max(...plain.split(/\s+/).map((w) => w.length), 1);
    let size = Math.min(base, Math.floor(930 / (longest * 0.52)));
    if (plain.length > 40) size = Math.min(size, 92);
    let k = 0;
    const words = String(txt).split(/(\s+)/).map((w) => (/^\s+$/.test(w) || !w ? w : `<span class="wr-w" style="--d:${k++ * 90}ms">${w}</span>`)).join("");
    return `<div class="wr-title" style="font-size:${size}px">${words}</div>`;
  }
  const kick = (t) => `<div class="wr-kick"><span>${t}</span></div>`;
  const big = (n, cls = "", suf = "") => `<div class="wr-big ${cls}"><span data-count="${typeof n === "number" ? n : ""}">${typeof n === "number" ? fmt(n) : n}</span>${suf}</div>`;
  const line = (t, cls = "") => `<div class="wr-line ${cls}">${t}</div>`;
  const tiles = (arr, cols = 3) => `<div class="wr-tiles" style="grid-template-columns:repeat(${cols},1fr)">${arr.map(([v, l, hl], i) => `<div class="${hl ? "hl" : ""}" style="--i:${i}"><b${String(v).replace(/<[^>]+>|&[a-z#0-9]+;/g, "x").length > 8 * (3 / cols) ? ' class="sm"' : ""}>${v}</b><span>${l}</span></div>`).join("")}</div>`;

  function card(o, inner, D, foot) {
    const p = PAL[o.pal] || PAL.forest;
    const h = `<div class="wr-card ${o.cls || ""}" style="--bg:${p.bg};--fg:${p.fg};--ac:${p.ac};background:${p.bg};color:${p.fg}">
      ${decor(o.fx, p)}
      <div class="wr-top"><img src="${esc(CFG.logo || "")}" alt=""><span>La Buenísima Wrapped ${esc(D.season)}</span></div>
      <div class="wr-body">${inner}</div>
      <div class="wr-foot"><span>${foot || ""}</span><span>labuenisima</span></div></div>`;
    return { h, song: o.song, conf: o.conf, kind: o.kind };
  }

  /* --- gráficas --- */
  function barsWeekly(ws, bestW, avgWk, p) {
    if (!ws.length) return "";
    const w = 920, h = 560, n = ws.length, gap = 10, bw = (w - 60 - gap * (n - 1)) / n;
    const mx = Math.max(...ws.map((x) => x.pf), ...Object.values(avgWk)) * 1.08;
    const y = (v) => h - 60 - (v / mx) * (h - 110);
    const avgD = ws.map((x, i) => `${i ? "L" : "M"}${(60 + i * (bw + gap) + bw / 2).toFixed(1)},${y(avgWk[x.w] || 0).toFixed(1)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart">
      ${ws.map((x, i) => { const X = 60 + i * (bw + gap), Y = y(x.pf), hi = x.w === bestW; return `<rect class="wr-grow" style="animation-delay:${200 + i * 70}ms" x="${X.toFixed(1)}" y="${Y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(h - 60 - Y).toFixed(1)}" rx="8" fill="${hi ? p.ac : p.fg}" opacity="${hi ? 1 : x.res === "W" ? 0.55 : 0.28}"/>${hi ? `<text x="${(X + bw / 2).toFixed(1)}" y="${(Y - 16).toFixed(1)}" text-anchor="middle" font-size="34" font-weight="800" fill="${p.ac}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${f1(x.pf)}</text>` : ""}<text x="${(X + bw / 2).toFixed(1)}" y="${h - 22}" text-anchor="middle" font-size="22" fill="${p.fg}" opacity=".7" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${x.w}</text>`; }).join("")}
      <path d="${avgD}" fill="none" stroke="${p.fg}" stroke-width="4" stroke-dasharray="10 10" opacity=".9" class="wr-fade" style="animation-delay:1.3s"/>
      <text x="0" y="${y(LB.util.avg(Object.values(avgWk))) + 8}" font-size="22" fill="${p.fg}" opacity=".8" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif" class="wr-fade" style="animation-delay:1.3s">LIGA</text></svg>
      <div class="wr-legend"><i style="background:${p.fg};opacity:.55"></i>Ganaste <i style="background:${p.fg};opacity:.28"></i>Perdiste <i class="dash" style="border-color:${p.fg}"></i>Promedio de la liga</div>`;
  }
  function rankChart(ranks, n, p) {
    if (ranks.length < 2) return "";
    const w = 920, h = 620, x = (i) => 70 + (i * (w - 110)) / (ranks.length - 1), y = (k) => 50 + ((k - 1) * (h - 110)) / Math.max(1, n - 1);
    const d = ranks.map((q, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(q.rank).toFixed(1)}`).join("");
    const area = `${d}L${x(ranks.length - 1).toFixed(1)},${h - 40}L${x(0)},${h - 40}Z`;
    const hiI = ranks.reduce((b, q, i) => (q.rank < ranks[b].rank ? i : b), 0), loI = ranks.reduce((b, q, i) => (q.rank > ranks[b].rank ? i : b), 0);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart">
      ${[...Array(n)].map((_, k) => `<line x1="60" x2="${w}" y1="${y(k + 1)}" y2="${y(k + 1)}" stroke="${p.fg}" opacity="${k === 3 ? 0.5 : 0.1}" stroke-width="2" ${k === 3 ? 'stroke-dasharray="8 8"' : ""}/>`).join("")}
      <text x="0" y="${y(1) + 10}" font-size="30" font-weight="800" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">1°</text><text x="0" y="${y(n) + 10}" font-size="30" font-weight="800" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${n}°</text>
      <text x="${w}" y="${y(4) - 12}" font-size="22" fill="${p.fg}" opacity=".7" text-anchor="end" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">ZONA DE PLAYOFFS</text>
      <path d="${area}" fill="${p.ac}" opacity=".18" class="wr-fade" style="animation-delay:1s"/>
      <path d="${d}" fill="none" stroke="${p.ac}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" class="wr-draw"/>
      ${ranks.map((q, i) => `<circle class="wr-pop" style="animation-delay:${300 + i * 90}ms" cx="${x(i)}" cy="${y(q.rank)}" r="${i === hiI || i === loI ? 20 : 9}" fill="${i === hiI || i === loI ? p.ac : p.fg}" stroke="${p.bg}" stroke-width="5"/>`).join("")}
      <text x="${x(hiI)}" y="${y(ranks[hiI].rank) - 34}" text-anchor="middle" font-size="30" font-weight="800" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${ranks[hiI].rank}° · S${ranks[hiI].w}</text>
      ${loI !== hiI ? `<text x="${x(loI)}" y="${y(ranks[loI].rank) + 56}" text-anchor="middle" font-size="30" font-weight="800" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${ranks[loI].rank}° · S${ranks[loI].w}</text>` : ""}</svg>`;
  }
  function vsRows(D, r, vs, p) {
    return `<div class="wr-vs">${vs.map((m, i) => {
      const vals = m.vals.map((x) => x.v), lo = Math.min(...vals), hi = Math.max(...vals), sp = hi - lo || 1;
      const pos = (v) => (m.hi ? (v - lo) / sp : (hi - v) / sp) * 100;
      return `<div class="wr-vsr" style="--i:${i}"><div class="wr-vsl"><span>${m.label}<small>${m.fmtv(m.me)}</small></span><b>${m.rank}° <small>de ${D.numTeams}</small></b></div>
        <div class="wr-track">${m.vals.filter((x) => x.r !== r).map((x) => `<i style="left:${pos(x.v).toFixed(1)}%"></i>`).join("")}<em style="left:${pos(m.me).toFixed(1)}%;--d:${400 + i * 200}ms"></em></div>
        <div class="wr-vse"><span>${m.hi ? "Peor" : "Más"}</span><span>${m.hi ? "Mejor" : "Menos"}</span></div></div>`;
    }).join("")}</div>`;
  }
  function donut(share, p, label) {
    const R = 150, C = 2 * Math.PI * R, off = C * (1 - clamp(share, 0, 1));
    return `<svg viewBox="0 0 360 360" width="360" height="360" class="wr-donut"><circle cx="180" cy="180" r="${R}" fill="none" stroke="${p.fg}" stroke-opacity=".18" stroke-width="40"/><circle cx="180" cy="180" r="${R}" fill="none" stroke="${p.ac}" stroke-width="40" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" style="--c:${C.toFixed(1)};stroke-dashoffset:${off.toFixed(1)}" class="wr-dash" transform="rotate(-90 180 180)"/><text x="180" y="196" text-anchor="middle" font-size="64" font-weight="800" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${pct(share)}</text><text x="180" y="240" text-anchor="middle" font-size="24" fill="${p.fg}" opacity=".75" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${label}</text></svg>`;
  }
  function attendance(D, r, pid, p) {
    const ws = D.playedWeeks;
    return `<div class="wr-att" style="grid-template-columns:repeat(${ws.length <= 9 ? ws.length : Math.ceil(ws.length / 2)},1fr)">${ws.map((w, i) => { const e = D.weeks[w][r]; const on = e && e.starters.includes(pid); return `<div class="${on ? "on" : ""}" style="--d:${i * 70}ms"><b>${w}</b></div>`; }).join("")}</div>`;
  }
  function meter(pf, bench, p) {
    const tot = pf + bench || 1;
    return `<div class="wr-meter"><div class="a" style="width:${((pf / tot) * 100).toFixed(1)}%"><span>${fmt(pf)} jugaron</span></div><div class="b" style="width:${((bench / tot) * 100).toFixed(1)}%"><span>${fmt(bench)}</span></div></div>`;
  }
  function gauge(luck, p) {
    const a = clamp(luck / 3, -1, 1) * 80;
    return `<svg viewBox="0 0 600 340" width="760" height="430" class="wr-chart"><path d="M60,300 A240,240 0 0 1 540,300" fill="none" stroke="${p.fg}" stroke-opacity=".2" stroke-width="54"/><path d="M60,300 A240,240 0 0 1 300,60" fill="none" stroke="${p.fg}" stroke-opacity=".45" stroke-width="54"/><path d="M300,60 A240,240 0 0 1 540,300" fill="none" stroke="${p.ac}" stroke-width="54"/>
      <text x="40" y="336" font-size="26" fill="${p.fg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif" font-weight="700">SALADO</text><text x="560" y="336" font-size="26" fill="${p.fg}" text-anchor="end" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif" font-weight="700">SUERTUDO</text>
      <g class="wr-needle" style="--a:${a.toFixed(1)}deg;transform:rotate(${a.toFixed(1)}deg)"><line x1="300" y1="300" x2="300" y2="92" stroke="${p.fg}" stroke-width="14" stroke-linecap="round"/></g><circle cx="300" cy="300" r="26" fill="${p.fg}"/></svg>`;
  }
  function spark(ws, p, w = 920, h = 180) {
    if (ws.length < 2) return "";
    const mx = Math.max(...ws.map((x) => x.pf)), mn = Math.min(...ws.map((x) => x.pf)), sp = mx - mn || 1;
    const X = (i) => 10 + (i * (w - 20)) / (ws.length - 1), Y = (v) => h - 14 - ((v - mn) / sp) * (h - 34);
    const d = ws.map((x, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(x.pf).toFixed(1)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart sm"><path d="${d}" fill="none" stroke="${p.ac}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" class="wr-draw"/>${ws.map((x, i) => `<circle cx="${X(i)}" cy="${Y(x.pf)}" r="7" fill="${x.res === "W" ? p.ac : p.fg}" class="wr-pop" style="animation-delay:${400 + i * 60}ms"/>`).join("")}</svg>`;
  }

  /* --- cromos de jugador --- */
  const initials = (n) => String(n || "").replace(/[^A-Za-zÀ-ÿ' .-]/g, "").split(/[\s.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  function chromo(D, pid, rows, o = {}) {
    const pl = D.players[pid] || { name: pid, pos: "?", team: "" };
    const pc = o.cursed ? "#6E6E6E" : POSC[pl.pos] || "#5C6B3A";
    const cracks = o.cursed ? `<svg class="wr-crack" viewBox="0 0 600 600"><path d="M330,0 L300,120 L360,190 L280,300 L330,380 L250,600 M300,120 L200,160 M280,300 L420,330 M330,380 L160,430" fill="none" stroke="#111" stroke-width="7" stroke-linejoin="round"/></svg>` : "";
    return `<div class="wr-chromo ${o.cursed ? "cursed" : ""} ${o.sm ? "sm" : ""}" style="--pc:${pc}">
      <div class="wr-ch-in">
        <div class="wr-ch-top"><b>${esc(pl.pos || "")}</b><span>${esc(pl.team || "")}</span><em>${o.badge || "MVP"}</em></div>
        <div class="wr-ch-art"><svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">${[...Array(16)].map((_, i) => { const a = (i * 22.5 * Math.PI) / 180, b = ((i * 22.5 + 11) * Math.PI) / 180; return `<polygon points="300,300 ${300 + 700 * Math.cos(a)},${300 + 700 * Math.sin(a)} ${300 + 700 * Math.cos(b)},${300 + 700 * Math.sin(b)}" fill="#fff" opacity=".12"/>`; }).join("")}
          <g transform="rotate(-28 300 300)"><ellipse cx="300" cy="300" rx="210" ry="128" fill="#6B3E26" stroke="#2A1A10" stroke-width="10"/><path d="M118,300 Q300,250 482,300" fill="none" stroke="#fff" stroke-width="10" opacity=".85"/><line x1="230" y1="300" x2="370" y2="300" stroke="#fff" stroke-width="12"/>${[250, 280, 310, 340].map((x) => `<line x1="${x}" y1="284" x2="${x}" y2="316" stroke="#fff" stroke-width="9"/>`).join("")}</g>
          <text x="300" y="560" text-anchor="middle" font-size="150" font-weight="800" fill="#fff" opacity=".92" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${esc(initials(pl.name))}</text></svg>${cracks}</div>
        <div class="wr-ch-name">${esc(pl.name)}</div>
        <div class="wr-ch-stats">${rows.map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join("")}</div>
        <div class="wr-ch-foot">${o.foot || `Edición La Buenísima ${esc(D.season)}`}</div>
      </div><i class="wr-shine"></i></div>`;
  }

  /* --- sello de personalidad --- */
  function seal(name, p, size = 520) {
    const txt = `LA BUENÍSIMA · WRAPPED · ${name.toUpperCase()} · `;
    return `<svg viewBox="0 0 520 520" width="${size}" height="${size}" class="wr-seal"><defs><path id="wrsc" d="M260,260 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"/></defs>
      <circle cx="260" cy="260" r="250" fill="${p.ac}"/><circle cx="260" cy="260" r="150" fill="${p.bg}"/>
      <g class="wr-spin" style="transform-origin:260px 260px;animation-duration:18s"><text font-size="34" font-weight="800" letter-spacing="6" fill="${p.bg}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif"><textPath href="#wrsc">${esc(txt + txt).slice(0, 120)}</textPath></text></g>
      <text x="260" y="296" text-anchor="middle" font-size="110" font-weight="800" fill="${p.ac}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif">${esc(initials(name.replace(/^(El|La|Los)\s+/i, "")))}</text></svg>`;
  }

  /* ---------------- tarjetas del equipo ---------------- */
  W.teamCards = function (D, r) {
    const X = W.teamData(D, r);
    const E = W.extra(D, r, X);
    const s = X.st, nick = N(D, r), team = T(D, r).replace(/\.+\s*$/, "");
    const cards = [];
    // 1 portada
    cards.push(card({ pal: "forest", fx: "orbs", song: "portada", kind: "cover" }, `${kick("Tu temporada " + esc(D.season))}${title(nick + ",", 150)}${line(`esta fue la temporada de <b>${team}</b>.`, "lg")}<div class="wr-tap"><i></i>Toca para empezar<span>con música</span></div>`, D));
    // 2 números
    cards.push(card({ pal: "cream", fx: "squares", song: "numeros" }, `${kick("Tus números")}${big(s.pf || 0, "ac")}${line("puntos en toda la temporada")}${barsWeekly(X.ws, X.best && X.best.w, E.avgWk, PAL.cream)}${tiles([[rec(s), "récord"], [s.rank + "°", "de " + D.numTeams], [f1(s.ppg), "por partido"]])}`, D, team));
    // 3 montaña rusa
    if (X.ranks.length > 1) cards.push(card({ pal: "navy", fx: "waves", song: "montana" }, `${kick("Tu montaña rusa")}${title(X.high.rank === 1 ? "Llegaste a la cima" : X.low.rank >= D.numTeams - 1 ? "Tocaste fondo" : "Subidas y bajadas", 120)}${rankChart(X.ranks, D.numTeams, PAL.navy)}${line(X.low.rank > X.high.rank ? `De <b>${X.low.rank}°</b> en la semana ${X.low.w} a <b>${X.high.rank}°</b> en la semana ${X.high.w}.` : "Arriba casi toda la temporada.", "dim")}`, D, team));
    // 4 adivina
    if (X.best) {
      const opts = [X.best.w, ...X.ws.filter((x) => x.w !== X.best.w).sort((a, b) => b.pf - a.pf).slice(1, 3).map((x) => x.w)].sort((a, b) => a - b);
      const bs = X.bestStarter(X.best);
      cards.push(card({ pal: "coral", fx: "burst", song: "adivina", kind: "guess" }, `${kick("Pregunta")}${title("¿Adivinas tu mejor semana?", 120)}<div class="wr-guess" data-ans="${X.best.w}">${opts.map((w) => `<button data-w="${w}">Semana ${w}</button>`).join("")}</div><div class="wr-reveal">${big(X.best.pf, "", '<small>pts</small>')}${line(`en la <b>semana ${X.best.w}</b>. ${X.bestRankAll === 1 ? "La mejor marca de toda la liga." : `La ${X.bestRankAll}ª mejor marca de la liga.`}`)}${bs ? line(`La figura: ${P(D, bs.p)} con ${f1(bs.pts)}.`, "dim") : ""}</div>`, D, team));
    }
    // 5 tú vs la liga
    cards.push(card({ pal: "black", fx: "zig", song: "vsliga" }, `${kick("Tú contra la liga")}${title("Así te comparas con los otros " + (D.numTeams - 1), 100)}${vsRows(D, r, E.vs, PAL.black)}`, D, team));
    // 6 MVP (cromo)
    if (E.mvpInfo) {
      const m = E.mvpInfo;
      cards.push(card({ pal: "purple", fx: "rings", song: "mvp", conf: true, cls: "chromo-card" }, `${kick("Tu MVP")}<div class="wr-row">${chromo(D, m.p, [["Puntos", fmt(m.pts)], ["Semanas titular", m.wk], ["Mejor juego", `${f1(m.bestG)} · S${m.bestW}`]], { badge: "MVP" })}${donut(m.share, PAL.purple, "de tus puntos")}</div>${line(`Cargó con el <b>${pct(m.share)}</b> de todo lo que anotaste.`, "lg")}`, D, team));
    }
    // 7 jugador fiel
    if (X.loyal) cards.push(card({ pal: "mint", fx: "dots", song: "fiel" }, `${kick("Tu jugador fiel")}${title(P(D, X.loyal[0]), 130)}${big(X.loyal[1], "", `<small>de ${X.ws.length}</small>`)}${line("semanas de titular. Ni en las malas lo sentaste.")}${attendance(D, r, X.loyal[0], PAL.mint)}`, D, team));
    // 8 ladrillo (cromo maldito)
    if (X.worst) {
      const ws = X.worstStarter(X.worst);
      cards.push(card({ pal: "cafe", fx: "stripes", song: "ladrillo", cls: "chromo-card" }, `${kick("Tu ladrillo")}${big(X.worst.pf, "", "<small>pts</small>")}${line(`en la semana ${X.worst.w}. Mejor ni hablamos.`, "lg")}${ws ? `<div class="wr-row">${chromo(D, ws.p, [["Puntos ese día", f1(ws.pts)], ["Semana", X.worst.w], ["Rol", "Titular"]], { cursed: true, badge: "LADRILLO", foot: "Edición maldita", sm: true })}<div class="wr-side">${line(`<b>${P(D, ws.p)}</b> hizo ${f1(ws.pts)}. Y lo pusiste de titular.`, "")}</div></div>` : ""}`, D, team));
    }
    // 9 banca
    cards.push(card({ pal: "blue", fx: "waves", song: "banca" }, `${kick("La banca que dolió")}${big(X.bench, "ac")}${line("puntos se quedaron sentados en tu banca.", "lg")}${meter(s.pf || 0, X.bench, PAL.blue)}${line(`Eso es como <b>${f1(X.bench / Math.max(1, s.ppg || 1))}</b> partidos completos tuyos.`, "dim")}${X.benchLoss ? line(`La semana ${X.benchLoss.w} la ganabas: perdiste ${f1(X.benchLoss.pf)}–${f1(X.benchLoss.pa)} con ${f1(X.benchLoss.max - X.benchLoss.pf)} en la banca.`, "dim") : line("Y nunca perdiste un partido por eso. Bien ahí.", "dim")}`, D, team));
    // 10 movidas (boletos)
    const ms = D.moveStats[r] || {};
    cards.push(card({ pal: "mustard", fx: "squares", song: "movidas" }, `${kick("Tus movidas")}${tiles([[fmt(ms.moves || 0), "altas y bajas"], [fmt(ms.trades || 0), "trades"], [f1(ms.waiverStart || 0), "pts del waiver"]])}
      ${X.bestMove ? `<div class="wr-ticket" style="--i:1"><div><span>La mejor</span><b>${X.bestMove.txt}</b><em>${X.bestMove.sub}</em></div><strong>+${f1(X.bestMove.v)}</strong></div>` : line("No hiciste ni una movida. Respeto.", "lg")}
      ${X.gift && X.gift.gave > 10 ? `<div class="wr-ticket bad" style="--i:2"><div><span>La que dolió</span><b>Soltar a ${P(D, X.gift.pid)}</b><em>Se lo regalaste a ${T(D, X.gift.to)}</em></div><strong>−${f1(X.gift.gave)}</strong></div>` : ""}`, D, team));
    // 11 tú contra ellos
    if (X.nemesis) {
      const rv = X.rivals[0];
      const vsAll = Object.values(X.ws.reduce((m, x) => { if (x.opp == null) return m; const v = (m[x.opp] = m[x.opp] || { r: x.opp, W: 0, L: 0 }); if (x.res === "W") v.W++; else if (x.res === "L") v.L++; return m; }, {})).sort((a, b) => b.W - b.L - (a.W - a.L));
      cards.push(card({ pal: "pink", fx: "orbs", song: "versus" }, `${kick("Tú contra ellos")}
        <div class="wr-duel"><div><span>Tu némesis</span><i>${esc(initials(UI.oName(D, X.nemesis.r)))}</i><b>${N(D, X.nemesis.r)}</b><em>te ganó ${X.nemesis.L} de ${X.nemesis.W + X.nemesis.L}</em></div><strong>VS</strong><div><span>Tu víctima</span><i>${esc(initials(UI.oName(D, X.victim.r)))}</i><b>${N(D, X.victim.r)}</b><em>le ganaste ${X.victim.W} de ${X.victim.W + X.victim.L}</em></div></div>
        <div class="wr-h2h">${vsAll.map((v, i) => `<div style="--i:${i}"><span>${N(D, v.r)}</span><div class="l"><i style="width:${v.L * 40}px"></i></div><b>${v.W}-${v.L}</b><div class="w"><i style="width:${v.W * 40}px"></i></div></div>`).join("")}</div>
        ${rv ? line(`<b>${esc(rv.name)}:</b> ${rv.W > rv.L ? `fue tuyo, ${rv.W}-${rv.L}.` : rv.W < rv.L ? `lo perdiste ${rv.W}-${rv.L}. Hay revancha en 2027.` : `quedó ${rv.W}-${rv.L}. Nadie presume.`}`, "dim") : ""}`, D, team));
    }
    // 12 suerte
    cards.push(card({ pal: "lime", fx: "rings", song: "suerte" }, `${kick("El suertómetro")}${gauge(s.luck || 0, PAL.lime)}${tiles([[s.W || 0, "victorias reales"], [f1(s.expW || 0), "las que merecías"]], 2)}${line(s.luck >= 1 ? "La suerte te debe la cuenta. Págala en 2027." : s.luck <= -1 ? "El calendario te odió. No fue tu culpa (casi)." : "Ni suertudo ni salado: tienes lo que jugaste.", "lg")}`, D, team));
    // 13 personalidad
    cards.push(card({ pal: "black", fx: "burst", song: "personalidad", conf: true, cls: "pers" }, `${kick("Tu personalidad de manager")}<div class="wr-sub">Eres</div>${title(esc(X.pers.name), 150)}${seal(X.pers.name, PAL.black, 460)}${line(esc(X.pers.line), "lg")}`, D, team));
    // 14 cierre
    const cierre = X.champ ? `Campeón de La Buenísima ${esc(D.season)}` : X.runner ? "Subcampeón. Tan cerca…" : `Terminaste ${s.rank}° de ${D.numTeams}`;
    cards.push(card({ pal: X.champ ? "mustard" : "forest", fx: X.champ ? "burst" : "orbs", song: X.champ ? "campeon" : "cierre", conf: !!X.champ }, `${kick("Eso fue todo")}${title(cierre, 130)}${X.oscars.length ? `<div class="wr-pills">${X.oscars.map((o, i) => `<span style="--i:${i}">${esc(o)}</span>`).join("")}</div>` : ""}${line("Nos vemos en el draft 2027.", "lg")}${line("Toca para ver tu resumen.", "dim")}`, D, team));
    // 15 resumen para compartir
    const pal = PAL.navy;
    cards.push(card({ pal: "navy", fx: "zig", song: "resumen", kind: "summary", cls: "summary" }, `${kick("Mi Wrapped " + esc(D.season))}${title(team, 110)}${line(nick, "dim")}
      <div class="wr-sumhead">${seal(X.pers.name, pal, 300)}<div><span>Personalidad</span><b>${esc(X.pers.name)}</b></div></div>
      ${tiles([[fmt(s.pf || 0), "puntos", true], [rec(s), "récord"], [s.rank + "°", "lugar"], [X.best ? f1(X.best.pf) : "—", X.best ? "mejor semana · S" + X.best.w : "mejor semana"], [X.mvp ? P(D, X.mvp[0]).split(" ").slice(-1)[0] : "—", "MVP"], [X.nemesis ? N(D, X.nemesis.r) : "—", "némesis"]])}
      ${spark(X.ws, pal)}`, D, team));
    return cards;
  };

  /* ---------------- tarjetas de la liga ---------------- */
  W.leagueCards = function (D) {
    const cards = [];
    const tot = D.rids.reduce((s, r) => s + weeksOf(D, r).reduce((a, x) => a + x.pf, 0), 0);
    const nGames = D.records.games.length;
    const avgWk = {}; D.playedWeeks.forEach((w) => { avgWk[w] = LB.util.avg(D.rids.map((x) => D.tw[x][w] && D.tw[x][w].pf).filter((x) => x != null)); });
    const lws = D.playedWeeks.map((w) => ({ w, pf: avgWk[w], res: "W" }));
    const bestLw = lws.slice().sort((a, b) => b.pf - a.pf)[0];
    cards.push(card({ pal: "forest", fx: "orbs", song: "liga", kind: "cover" }, `${kick("La liga")}${title("La Buenísima " + esc(D.season) + ", en números", 130)}${big(tot, "ac")}${line("puntos entre los " + D.numTeams + " equipos")}${tiles([[nGames, "partidos"], [D.trades.length, "trades"], [D.pickups.length, "altas"]])}<div class="wr-tap"><i></i>Toca para empezar<span>con música</span></div>`, D));
    cards.push(card({ pal: "cream", fx: "squares", song: "numeros" }, `${kick("Semana a semana")}${title("El promedio de la liga", 110)}${barsWeekly(lws, bestLw && bestLw.w, avgWk, PAL.cream).replace(/<div class="wr-legend">[\s\S]*<\/div>/, "")}${bestLw ? line(`La semana más explosiva fue la <b>${bestLw.w}</b>: ${f1(bestLw.pf)} de promedio por equipo.`, "lg") : ""}`, D));
    const final = D.bracket && D.bracket.length ? D.bracket.filter((m) => m.r === Math.max(...D.bracket.map((x) => x.r)) && m.p === 1)[0] : null;
    const champ = final && final.w ? final.w : null;
    const cr = champ || D.standings[0].rid;
    cards.push(card({ pal: "mustard", fx: "burst", song: "campeon", conf: true, cls: "champ" }, `${kick(champ ? "El campeón" : "El líder (vista previa)")}<svg class="wr-trophy" viewBox="0 0 300 300" width="320" height="320"><path d="M90,40 H210 V110 A60,60 0 0 1 90,110 Z" fill="${PAL.mustard.fg}"/><path d="M90,55 H50 A40,40 0 0 0 95,130 M210,55 H250 A40,40 0 0 1 205,130" fill="none" stroke="${PAL.mustard.fg}" stroke-width="14"/><rect x="138" y="165" width="24" height="50" fill="${PAL.mustard.fg}"/><rect x="95" y="215" width="110" height="26" rx="6" fill="${PAL.mustard.fg}"/><rect x="80" y="241" width="140" height="30" rx="6" fill="${PAL.mustard.ac}"/></svg>${title(T(D, cr), 140)}${line(N(D, cr), "lg")}${champ ? line(`Venció a ${T(D, final.l)} en la final.`, "dim") : line("El campeón se define en la semana " + D.totalWeeks + ".", "dim")}`, D));
    const weeks = D.regWeeksPlayed;
    if (weeks.length > 1) {
      const w = 960, h = 1050, x = (i) => 30 + (i * (w - 300)) / (weeks.length - 1), y = (k) => 40 + ((k - 1) * (h - 80)) / (D.numTeams - 1);
      const tables = weeks.map((wk) => D.standingsAt(wk));
      const lead = D.standings[0].rid;
      const lines = D.rids.map((r, n) => { const pts = tables.map((t) => (t.find((s) => s.rid === r) || {}).rank); const d = pts.map((k, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(k).toFixed(1)}`).join(""); const hi = r === lead; return `<path d="${d}" fill="none" stroke="${hi ? PAL.navy.ac : UI.color(r)}" stroke-width="${hi ? 12 : 6}" stroke-linejoin="round" stroke-linecap="round" class="wr-draw" style="animation-delay:${n * 120}ms"/><circle cx="${x(weeks.length - 1)}" cy="${y(pts[pts.length - 1])}" r="${hi ? 14 : 9}" fill="${hi ? PAL.navy.ac : UI.color(r)}"/><text x="${x(weeks.length - 1) + 22}" y="${y(pts[pts.length - 1]) + 10}" font-size="28" fill="${PAL.navy.fg}" font-weight="${hi ? 800 : 500}" font-family="Barlow Condensed, Arial Narrow, Arial, sans-serif" class="wr-fade" style="animation-delay:1.6s">${T(D, r).slice(0, 16)}</text>`; }).join("");
      cards.push(card({ pal: "navy", fx: "waves", song: "carrera" }, `${kick("La carrera")}${title("Así se movió la tabla", 110)}<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="wr-chart">${lines}</svg>`, D));
    }
    const close = D.records.closest[0], high = D.records.games.slice().sort((a, b) => b.pa + b.pb - (a.pa + a.pb))[0];
    if (close) {
      const aw = close.pa > close.pb, A = aw ? close.a : close.b, B = aw ? close.b : close.a;
      cards.push(card({ pal: "black", fx: "zig", song: "partido" }, `${kick("El partido del año")}${title("Semana " + close.w, 120)}<div class="wr-score"><div><b>${T(D, A)}</b><strong class="ac">${f1(Math.max(close.pa, close.pb))}</strong></div><div><b>${T(D, B)}</b><strong>${f1(Math.min(close.pa, close.pb))}</strong></div></div>${line(`Se decidió por <b>${f1(Math.abs(close.pa - close.pb))}</b> puntos.`, "lg")}${high ? line(`Y el de más puntos: ${f1(high.pa + high.pb)} combinados en la semana ${high.w}.`, "dim") : ""}`, D));
    }
    const rv = (CFG.rivalries || []).map((x) => {
      const ra = D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === (x.a || "").toLowerCase()));
      const rb = D.rids.find((r) => D.teams[r].owners.some((o) => o.toLowerCase() === (x.b || "").toLowerCase()));
      if (ra == null || rb == null) return null;
      let wa = 0, wb = 0; weeksOf(D, ra).forEach((t) => { if (t.opp === rb) { if (t.res === "W") wa++; else if (t.res === "L") wb++; } });
      return `<div class="wr-rv"><span>${esc(x.name)}</span><div><b>${N(D, ra)}</b><strong>${wa}</strong><em>–</em><strong>${wb}</strong><b>${N(D, rb)}</b></div></div>`;
    }).filter(Boolean);
    if (rv.length) cards.push(card({ pal: "coral", fx: "stripes", song: "vsliga" }, `${kick("Las rivalidades")}${title("Nadie olvida", 130)}${rv.join("")}`, D));
    const by = {}; D.playedWeeks.forEach((w) => D.rids.forEach((r) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { const k = p + "|" + r; by[k] = (by[k] || 0) + (e.sp[i] || 0); }); }));
    const mvp = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    const steal = D.draft.filter((p) => p.round >= 4).sort((a, b) => b.value - a.value)[0];
    if (mvp) {
      const [p, r] = mvp[0].split("|");
      cards.push(card({ pal: "purple", fx: "rings", song: "robo", cls: "chromo-card" }, `${kick("Los cromos del año")}<div class="wr-row two">${chromo(D, p, [["Puntos", fmt(mvp[1])], ["Equipo", T(D, Number(r)).slice(0, 14)]], { badge: "MVP LIGA", sm: true })}${steal ? chromo(D, steal.pid, [["Ronda", steal.round], ["Puntos", "#" + steal.ptsRank]], { badge: "ROBO", sm: true, foot: "Robo del draft" }) : ""}</div>${line(`<b>${P(D, p)}</b> fue el titular con más puntos de la liga.`, "lg")}${steal ? line(`Y el robo del draft: ${P(D, steal.pid)}, ronda ${steal.round}, terminó #${steal.ptsRank} en puntos.`, "dim") : ""}`, D));
    }
    const pers = personalities(D);
    cards.push(card({ pal: "black", fx: "squares", song: "personalidades" }, `${kick("Las personalidades")}${title("Quién es quién", 120)}<div class="wr-list">${D.standings.map((s, i) => `<div style="--i:${i}"><span>${N(D, s.rid)}</span><b>${esc(pers[s.rid].name)}</b></div>`).join("")}</div>`, D));
    cards.push(card({ pal: "forest", fx: "burst", song: "cierre", conf: true }, `${kick("Fin")}${title("Gracias por otra temporada", 150)}${line("Nos vemos en el draft 2027.", "lg")}`, D));
    return cards;
  };



  /* ---------------- beats originales (Web Audio) ----------------
     Motor con reverb, delay, sidechain, piano eléctrico FM, supersaw, 808,
     hats metálicos y clap. Cada estilo es un loop de 4 compases (16 pasos). */
  const _ = null;
  const MOODS = {
    // Trap: 808, hats con redobles, clap, campanita
    hype: { bpm: 140, duck: 1, crackle: 0,
      bars: [{ c: [60, 63, 67], r: 36 }, { c: [60, 63, 68], r: 32 }, { c: [58, 63, 67], r: 39 }, { c: [58, 62, 65], r: 34 }],
      kick: "x......x..x.....", clap: "........x.......", hat: "x.x.x.x.x.x.x.x.", roll: 1, b808: "x......x..x.....",
      pad: "super", padCut: 1400, padV: 0.6,
      lead: { type: "bell", v: 0.9, notes: [[75, _, _, 72, _, _, 70, _, 72, _, _, _, 67, _, 70, _], [72, _, _, 75, _, _, 77, _, 79, _, 77, _, 75, _, 72, _]] } },
    // Synthwave épico
    epic: { bpm: 104, duck: 1,
      bars: [{ c: [57, 60, 64], r: 45 }, { c: [57, 60, 65], r: 41 }, { c: [55, 60, 64], r: 48 }, { c: [55, 59, 62], r: 43 }],
      kick: "x...x...x...x...", snare: "....x.......x...", hat: "..x...x...x...x.", bass: { type: "saw", pat: "0.1.0.1.0.1.0.1." },
      pad: "super", padCut: 2200, padV: 0.8, arp: { pat: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 3], oct: 12, v: 0.55 },
      lead: { type: "pluck", v: 0.7, notes: [[76, _, _, _, _, _, 74, _, 72, _, _, _, 71, _, _, _], [72, _, _, _, 74, _, _, _, 76, _, _, _, 79, _, 76, _]] } },
    // Synthpop que sube y baja
    rusa: { bpm: 122, duck: 1,
      bars: [{ c: [60, 64, 67], r: 48 }, { c: [59, 62, 67], r: 43 }, { c: [60, 64, 69], r: 45 }, { c: [60, 65, 69], r: 41 }],
      kick: "x...x...x...x...", clap: "....x.......x...", hat: "xxxxxxxxxxxxxxxx", hatV: 0.45, ohat: "..x...x...x...x.", bass: { type: "saw", pat: "0..0..0.0..0..0." },
      pad: "super", padCut: 1800, padV: 0.55, arp: { pat: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5], oct: 12, v: 0.6, climb: 1 } },
    // Lo-fi para relajarse
    chill: { bpm: 80, swing: 0.2, crackle: 1,
      bars: [{ c: [53, 57, 60, 64], r: 41 }, { c: [52, 55, 59, 62], r: 40 }, { c: [50, 53, 57, 60], r: 38 }, { c: [48, 52, 55, 59], r: 36 }],
      kick: "x.......x.x.....", snare: "....x.......x...", snareSoft: 1, hat: "x.x.x.x.x.x.x.x.", hatV: 0.5, bass: { type: "sine", pat: "0.........0....." },
      keys: "x......x..x.....", epV: 1.3,
      lead: { type: "ep", v: 0.8, notes: [[72, _, _, _, 69, _, _, 67, _, _, 64, _, _, _, _, _], [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [65, _, _, _, 64, _, _, 62, _, _, 60, _, _, _, _, _], [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]] } },
    // Lo-fi con trombón triste
    ladrillo: { bpm: 80, swing: 0.2, crackle: 1, trombone: 1,
      bars: [{ c: [52, 55, 59, 60], r: 36 }, { c: [52, 55, 57, 60], r: 45 }, { c: [53, 57, 60, 62], r: 38 }, { c: [53, 55, 59, 62], r: 43 }],
      kick: "x.......x.x.....", snare: "....x.......x...", snareSoft: 1, hat: "x.x.x.x.x.x.x.x.", hatV: 0.5, bass: { type: "sine", pat: "0.........0....." }, keys: "x......x........" },
    // Casino / lounge con bajo caminante
    lounge: { bpm: 112, swing: 0.28,
      bars: [{ c: [53, 57, 60, 64], walk: [38, 41, 45, 48] }, { c: [53, 59, 62, 65], walk: [43, 47, 50, 53] }, { c: [52, 55, 59, 62], walk: [36, 40, 43, 45] }, { c: [55, 61, 64, 67], walk: [45, 44, 43, 40] }],
      kick: "x.......x.......", kickV: 0.5, rim: "....x.......x...", hat: "x...x.x.x...x.x.", hatV: 0.55, keys: "x.....x...x.....",
      lead: { type: "bell", v: 0.5, notes: [[_, _, _, _, _, _, _, _, 77, _, 76, _, 74, _, 72, _], [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]] } },
    // Suspenso: reloj, latido y tensión que sube
    suspense: { bpm: 120, riser: 1,
      bars: [{ c: [48, 51, 55], r: 36 }, { c: [48, 51, 55], r: 36 }, { c: [49, 52, 56], r: 37 }, { c: [48, 51, 54], r: 36 }],
      kick: "x..x............", kickV: 0.7, tick: "x...x...x...x...", bass: { type: "pulse", pat: "xxxxxxxxxxxxxxxx" }, pad: "dark", padCut: 700, padV: 0.7 },
    // Triste: piano eléctrico con mucha reverb
    sad: { bpm: 66,
      bars: [{ c: [57, 60, 64, 69], r: 45 }, { c: [53, 57, 60, 65], r: 41 }, { c: [52, 55, 60, 64], r: 36 }, { c: [50, 55, 59, 62], r: 43 }],
      rim: "............x...", arpEp: [0, _, 1, _, 2, _, 3, _, 2, _, 1, _, 2, _, 1, _], keysLow: 1, epV: 2.4, pad: "super", padCut: 900, padV: 0.5 },
    // Funk / disco
    funk: { bpm: 112, duck: 0,
      bars: [{ c: [64, 67, 71], r: 40 }, { c: [64, 67, 71], r: 40 }, { c: [61, 64, 67], r: 45 }, { c: [61, 64, 67], r: 45 }],
      kick: "x.....x...x.....", clap: "....x.......x...", hat: "xxxxxxxxxxxxxxxx", hatV: 0.4, ohat: "..x...x...x...x.",
      bass: { type: "funk", notes: [0, _, 12, _, _, 0, _, 0, _, 12, _, _, 10, _, 12, _] }, clav: "..x..x.x..x..x.x" },
    // Batalla: épico con tambores y bajo distorsionado
    battle: { bpm: 150, duck: 0,
      bars: [{ c: [62, 65, 69], r: 38 }, { c: [62, 65, 70], r: 34 }, { c: [60, 64, 67], r: 36 }, { c: [61, 64, 69], r: 33 }],
      kick: "x.x...x.x.x...x.", snare: "....x.......x...", hat: "x.x.x.x.x.x.x.x.", hatV: 0.6, bass: { type: "reese", pat: "x.x.x.x.x.x.x.x." },
      brass: "x..x..x.........", tomFill: 1 },
    // Sprint: drum & bass
    sprint: { bpm: 172, duck: 1,
      bars: [{ c: [56, 60, 65], r: 41 }, { c: [56, 61, 65], r: 37 }, { c: [56, 60, 63], r: 44 }, { c: [55, 58, 63], r: 39 }],
      kick: "x.........x.....", snare: "....x.......x...", hat: "..x...x...x...x.", hatV: 0.7, ohat: "......x.......x.", bass: { type: "reese", pat: "x..............." , long: 1 },
      pad: "super", padCut: 2000, padV: 0.6, arp: { pat: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], oct: 24, v: 0.4 } },
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  W._Beat = () => Beat();

  function Beat() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const B = { ctx: null, mood: null, next: null, step: 0, bar: 0, t: 0, timer: null, sfxOn: true };
    let X, master, noise, ch = {}, delay;
    B.init = () => {
      if (B.ctx || !AC) return !!B.ctx;
      X = B.ctx = new AC();
      const lim = X.createDynamicsCompressor(); lim.threshold.value = -6; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.1;
      const glue = X.createDynamicsCompressor(); glue.threshold.value = -18; glue.ratio.value = 3; glue.attack.value = 0.01; glue.release.value = 0.2;
      master = X.createGain(); master.gain.value = 0;
      master.connect(glue); glue.connect(lim); lim.connect(X.destination);
      noise = X.createBuffer(1, X.sampleRate * 2, X.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      // reverb
      const len = X.sampleRate * 2.6, ir = X.createBuffer(2, len, X.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      const rev = X.createConvolver(); rev.buffer = ir; const revG = X.createGain(); revG.gain.value = 0.9; rev.connect(revG); revG.connect(master);
      // delay
      delay = X.createDelay(2); const fb = X.createGain(); fb.gain.value = 0.33; const dlp = X.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2800;
      delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(master);
      const strip = (vol, r, d) => { const g = X.createGain(); g.gain.value = vol; g.connect(master); if (r) { const s = X.createGain(); s.gain.value = r; g.connect(s); s.connect(rev); } if (d) { const s = X.createGain(); s.gain.value = d; g.connect(s); s.connect(delay); } return g; };
      ch.drums = strip(0.9, 0.08); ch.snare = strip(0.8, 0.28); ch.bass = strip(0.85, 0); ch.keys = strip(0.8, 0.32, 0.12); ch.lead = strip(0.55, 0.25, 0.3); ch.fx = strip(0.7, 0.35);
      ch.duck = X.createGain(); ch.duck.connect(master); ch.pad = strip(0.5, 0.4); ch.pad.disconnect(); ch.pad.connect(ch.duck);
      const ps = X.createGain(); ps.gain.value = 0.4; ch.pad.connect(ps); ps.connect(rev);
      ch.sfx = strip(0.8, 0.3);
      const sat = X.createWaveShaper(); const cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = (i / 512) - 1; cv[i] = Math.tanh(x * 2.2); } sat.curve = cv; B.sat = sat;
      return true;
    };
    B.resume = () => { if (X && X.state !== "running") X.resume(); };
    const env = (g, t, a, peak, dec, hold = 0) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (hold) g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + dec); };
    const O = (type, f, t) => { const o = X.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); return o; };
    const F = (type, f, q = 0.7) => { const fl = X.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; return fl; };
    const G = () => X.createGain();
    const N = (t, dur) => { const s = X.createBufferSource(); s.buffer = noise; s.start(t, Math.random()); s.stop(t + dur + 0.05); return s; };
    const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };

    /* batería */
    const kick = (t, v = 1) => {
      const o = O("sine", 165, t), g = G(); o.frequency.exponentialRampToValueAtTime(48, t + 0.09); chain(o, g, ch.drums); env(g, t, 0.002, 0.95 * v, 0.42); o.start(t); o.stop(t + 0.5);
      const c = N(t, 0.02), cg = G(); chain(c, F("highpass", 2500), cg, ch.drums); env(cg, t, 0.001, 0.25 * v, 0.012);
      if (B.duck) { const d = ch.duck.gain; d.cancelScheduledValues(t); d.setValueAtTime(0.25, t); d.linearRampToValueAtTime(1, t + 0.28); }
    };
    const k808 = (t, f, dur) => {
      const o = O("sine", f * 1.6, t), g = G(); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
      const sh = X.createWaveShaper(); sh.curve = B.sat.curve; chain(o, sh, g, ch.bass); env(g, t, 0.004, 0.5, dur); o.start(t); o.stop(t + dur + 0.1);
      kick(t, 0.55);
    };
    const snare = (t, v = 1) => {
      const n = N(t, 0.25), g = G(); chain(n, F("bandpass", 1900, 0.7), g, ch.snare); env(g, t, 0.002, 0.55 * v, 0.2);
      const o = O("triangle", 200, t), og = G(); o.frequency.exponentialRampToValueAtTime(150, t + 0.08); chain(o, og, ch.snare); env(og, t, 0.002, 0.35 * v, 0.1); o.start(t); o.stop(t + 0.2);
    };
    const clap = (t) => {
      const n = N(t, 0.3), g = G(); chain(n, F("bandpass", 1250, 1.1), g, ch.snare);
      g.gain.setValueAtTime(0.0001, t); [0, 0.011, 0.022].forEach((d) => { g.gain.setValueAtTime(0.55, t + d); g.gain.exponentialRampToValueAtTime(0.08, t + d + 0.009); });
      g.gain.setValueAtTime(0.5, t + 0.033); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    };
    const rim = (t) => { const o = O("triangle", 1650, t), g = G(); chain(o, F("bandpass", 1700, 3), g, ch.drums); env(g, t, 0.001, 0.35, 0.04); o.start(t); o.stop(t + 0.08); };
    const HR = [205.3, 304.4, 369.6, 522.7, 540, 800];
    const hat = (t, open, v = 1) => {
      const g = G(), bp = F("bandpass", 10000, 0.8), hp = F("highpass", 7200); chain(bp, hp, g, ch.drums);
      HR.forEach((f) => { const o = O("square", f, t); o.connect(bp); o.start(t); o.stop(t + (open ? 0.4 : 0.08)); });
      env(g, t, 0.001, (open ? 0.16 : 0.13) * v, open ? 0.3 : 0.045);
    };
    const tick = (t, hi) => { const o = O("sine", hi ? 2300 : 1700, t), g = G(); chain(o, g, ch.drums); env(g, t, 0.001, 0.22, 0.03); o.start(t); o.stop(t + 0.06); };
    const tom = (t, f) => { const o = O("sine", f, t), g = G(); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + 0.3); chain(o, g, ch.snare); env(g, t, 0.002, 0.7, 0.35); o.start(t); o.stop(t + 0.45); };
    const crackle = (t) => { const n = N(t, 0.01), g = G(); chain(n, F("highpass", 3000), g, ch.fx); env(g, t, 0.0005, 0.04 + Math.random() * 0.05, 0.004); };

    /* sintetizadores */
    const supersaw = (t, notes, dur, cut, v) => {
      const fl = F("lowpass", cut, 0.4), g = G(); chain(fl, g, ch.pad); env(g, t, 0.35, 0.11 * v, 0.6, Math.max(0, dur - 0.6));
      notes.forEach((n) => [-14, -5, 5, 14].forEach((d) => { const o = O("sawtooth", mtof(n), t); o.detune.value = d; o.connect(fl); o.start(t); o.stop(t + dur + 0.8); }));
    };
    const darkpad = (t, notes, dur, cut, v) => {
      const fl = F("lowpass", cut, 2), g = G(); fl.frequency.setValueAtTime(cut, t); fl.frequency.linearRampToValueAtTime(cut * 2.2, t + dur); chain(fl, g, ch.pad); env(g, t, 0.6, 0.12 * v, 0.6, Math.max(0, dur - 0.9));
      notes.forEach((n) => [-8, 8].forEach((d) => { const o = O("sawtooth", mtof(n - 12), t); o.detune.value = d; o.connect(fl); o.start(t); o.stop(t + dur + 0.8); }));
    };
    const ep = (t, n, dur, v = 1, dest) => { // piano eléctrico FM
      const f = mtof(n), car = O("sine", f, t), mod = O("sine", f, t), mg = G(), tine = O("sine", f * 14, t), tg = G(), g = G();
      mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.25, t + 0.7);
      tg.gain.setValueAtTime(f * 0.9, t); tg.gain.exponentialRampToValueAtTime(1, t + 0.06);
      mod.connect(mg); mg.connect(car.frequency); tine.connect(tg); tg.connect(car.frequency);
      chain(car, g, dest || ch.keys); env(g, t, 0.004, 0.16 * v, dur);
      [car, mod, tine].forEach((o) => { o.start(t); o.stop(t + dur + 0.1); });
    };
    const bell = (t, n, v = 1) => {
      const f = mtof(n), car = O("sine", f, t), mod = O("sine", f * 3.5, t), mg = G(), g = G();
      mg.gain.setValueAtTime(f * 3, t); mg.gain.exponentialRampToValueAtTime(f * 0.1, t + 0.9);
      mod.connect(mg); mg.connect(car.frequency); chain(car, g, ch.lead); env(g, t, 0.003, 0.22 * v, 1.3);
      [car, mod].forEach((o) => { o.start(t); o.stop(t + 1.5); });
    };
    const pluck = (t, n, v = 1, dur = 0.35, dest) => {
      const fl = F("lowpass", 4200, 3), g = G(); fl.frequency.setValueAtTime(4200, t); fl.frequency.exponentialRampToValueAtTime(380, t + dur);
      chain(fl, g, dest || ch.lead); env(g, t, 0.003, 0.17 * v, dur);
      [-7, 7].forEach((d) => { const o = O("sawtooth", mtof(n), t); o.detune.value = d; o.connect(fl); o.start(t); o.stop(t + dur + 0.1); });
    };
    const clav = (t, notes) => {
      notes.forEach((n) => { const o = O("square", mtof(n), t), fl = F("bandpass", 2600, 4), g = G(); fl.frequency.setValueAtTime(2600, t); fl.frequency.exponentialRampToValueAtTime(700, t + 0.14); chain(o, fl, g, ch.lead); env(g, t, 0.002, 0.14, 0.13); o.start(t); o.stop(t + 0.2); });
    };
    const brass = (t, notes, dur) => {
      const fl = F("lowpass", 400, 2), g = G(); fl.frequency.setValueAtTime(400, t); fl.frequency.linearRampToValueAtTime(2600, t + 0.07); fl.frequency.exponentialRampToValueAtTime(900, t + dur);
      chain(fl, g, ch.lead); env(g, t, 0.03, 0.16, dur);
      notes.forEach((n) => [-6, 6].forEach((d) => { const o = O("sawtooth", mtof(n), t); o.detune.value = d; o.connect(fl); o.start(t); o.stop(t + dur + 0.1); }));
    };
    const bassNote = (t, n, dur, type) => {
      const f = mtof(n);
      if (type === "sine") { const o = O("sine", f, t), o2 = O("triangle", f, t), g = G(); chain(o, g, ch.bass); o2.connect(g); env(g, t, 0.01, 0.55, dur); [o, o2].forEach((x) => { x.start(t); x.stop(t + dur + 0.1); }); return; }
      if (type === "reese") { const fl = F("lowpass", 700, 1.5), g = G(), sh = X.createWaveShaper(); sh.curve = B.sat.curve; chain(fl, sh, g, ch.bass); env(g, t, 0.01, 0.32, dur * 0.9, dur * 0.1); [-16, 16].forEach((d) => { const o = O("sawtooth", f, t); o.detune.value = d; o.connect(fl); o.start(t); o.stop(t + dur + 0.1); }); const s = O("sine", f / 2, t), sg = G(); chain(s, sg, ch.bass); env(sg, t, 0.01, 0.35, dur); s.start(t); s.stop(t + dur + 0.1); return; }
      const fl = F("lowpass", type === "pulse" ? 300 + (B.bar % 4) * 260 : 1300, type === "funk" ? 6 : 3), g = G(); fl.frequency.setValueAtTime(fl.frequency.value, t); fl.frequency.exponentialRampToValueAtTime(type === "funk" ? 350 : 260, t + dur);
      chain(fl, g, ch.bass); env(g, t, 0.004, 0.42, dur);
      const o = O("sawtooth", f, t), s = O("sine", f, t); o.connect(fl); s.connect(g); o.start(t); o.stop(t + dur + 0.1); s.start(t); s.stop(t + dur + 0.1);
    };
    const trombone = (t, sd) => { // "wah wah wah waaah"
      [[58, 3], [57, 3], [56, 3], [55, 10]].reduce((tt, [n, len]) => {
        const dur = len * sd * 1.6, o = O("sawtooth", mtof(n), tt), fl = F("lowpass", 500, 5), g = G(), lfo = O("sine", 5.5, tt), lg = G();
        fl.frequency.setValueAtTime(400, tt); fl.frequency.linearRampToValueAtTime(1500, tt + Math.min(0.15, dur / 2)); fl.frequency.linearRampToValueAtTime(600, tt + dur);
        lg.gain.value = len > 5 ? 14 : 0; lfo.connect(lg); lg.connect(o.detune);
        chain(o, fl, g, ch.lead); env(g, tt, 0.04, 0.3, 0.12, dur - 0.16);
        [o, lfo].forEach((x) => { x.start(tt); x.stop(tt + dur + 0.2); });
        return tt + dur;
      }, t);
    };
    const riser = (t, dur) => { const n = N(t, dur), fl = F("bandpass", 300, 2), g = G(); fl.frequency.exponentialRampToValueAtTime(7000, t + dur); chain(n, fl, g, ch.fx); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.95); g.gain.linearRampToValueAtTime(0, t + dur); };

    function tick16(m, t, sd) {
      const s = B.step % 16, bi = B.bar % m.bars.length, bar = m.bars[bi], at = (p) => p && p[s] && p[s] !== ".";
      B.duck = !!m.duck;
      if (at(m.kick)) kick(t, m.kickV || 1);
      if (at(m.b808)) { let len = 1; while (len < 16 && !(m.b808[s + len] === "x") && s + len < 16) len++; k808(t, mtof(bar.r), len * sd * 0.95); }
      if (at(m.snare)) snare(t, m.snareSoft ? 0.55 : 1);
      if (at(m.clap)) clap(t);
      if (at(m.rim)) rim(t);
      if (at(m.hat)) { hat(t, false, m.hatV || 1); if (m.roll && bi % 2 === 1 && s >= 12) hat(t + sd / 2, false, 0.7); }
      if (at(m.ohat)) hat(t, true, 0.8);
      if (at(m.tick)) tick(t, s % 8 === 0);
      if (m.crackle && Math.random() < 0.35) crackle(t + Math.random() * sd);
      if (m.tomFill && bi === 3 && s >= 12) tom(t, [180, 150, 120, 95][s - 12]);
      if (m.riser && bi === 3 && s === 0) riser(t, sd * 16);
      if (m.trombone && B.bar % 8 === 0 && s === 0) trombone(t, sd);
      // bajo
      if (m.bass) {
        const bs = m.bass;
        if (bs.notes) { const off = bs.notes[s]; if (off != null) bassNote(t, bar.r + off, sd * 1.5, "funk"); }
        else if (bs.pat && at(bs.pat)) { const off = bs.pat[s] === "1" ? 12 : 0; bassNote(t, bar.r + off, bs.long ? sd * 15 : bs.type === "pulse" ? sd * 0.9 : sd * 1.8, bs.type); }
      }
      if (bar.walk && s % 4 === 0) bassNote(t, bar.walk[s / 4], sd * 3.6, "sine");
      // armonía
      if (m.pad && s === 0) (m.pad === "dark" ? darkpad : supersaw)(t, bar.c, sd * 16, m.padCut, m.padV || 1);
      if (at(m.keys)) bar.c.forEach((n, k) => ep(t + k * 0.012, n, s === 0 ? sd * 8 : sd * 5, 0.75 * (m.epV || 1)));
      if (m.keysLow && s === 0) ep(t, bar.r, sd * 14, 0.9 * (m.epV || 1));
      if (m.arpEp) { const k = m.arpEp[s]; if (k != null) ep(t, bar.c[k % bar.c.length] + 12, sd * 6, 0.8 * (m.epV || 1)); }
      if (m.arp) { const a = m.arp, k = a.pat[s]; const pool = a.climb ? [...bar.c, ...bar.c.map((x) => x + 12)] : bar.c; if (k != null && pool[k % pool.length] != null) pluck(t, pool[k % pool.length] + (a.climb ? 0 : a.oct), a.v, 0.16); }
      if (at(m.clav)) clav(t, bar.c);
      if (at(m.brass)) brass(t, bar.c.map((x) => x - 12), sd * 2);
      if (m.lead) { const ph = m.lead.notes[B.bar % m.lead.notes.length], n = ph && ph[s]; if (n != null) { const L = m.lead; if (L.type === "bell") bell(t, n, L.v); else if (L.type === "ep") ep(t, n, sd * 6, L.v, ch.lead); else pluck(t, n, L.v, 0.45); } }
    }
    function loop() {
      if (!X) return;
      while (B.t < X.currentTime + 0.15) {
        if (B.step % 16 === 0 && B.next) { B.mood = B.next; B.next = null; B.bar = 0; }
        const m = MOODS[B.mood]; if (!m) { B.t += 0.1; continue; }
        const sd = 60 / m.bpm / 4, sw = m.swing && B.step % 2 ? sd * m.swing : 0;
        try { tick16(m, Math.max(B.t + sw, X.currentTime + 0.005), sd); } catch (e) {}
        B.t += sd; B.step++; if (B.step % 16 === 0) B.bar++;
      }
    }
    B.setMood = (mood) => {
      if (!X) return;
      if (!B.timer) { B.mood = mood; B.step = 0; B.bar = 0; B.t = X.currentTime + 0.06; B.timer = setInterval(loop, 25); }
      else if (mood !== B.mood) { B.next = mood; B.step = Math.ceil(B.step / 16) * 16; B.t = Math.max(B.t, X.currentTime + 0.04); }
    };
    B.fade = (to, sec = 0.4) => { if (!X) return; const g = master.gain, n = X.currentTime; g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(to, n + sec); };
    B.stop = () => { clearInterval(B.timer); B.timer = null; B.fade(0, 0.2); };
    B.sfx = (kind) => {
      if (!X || !B.sfxOn) return; const t = X.currentTime + 0.01;
      if (kind === "whoosh") { const n = N(t, 0.45), fl = F("bandpass", 350, 1.8), g = G(); fl.frequency.exponentialRampToValueAtTime(5000, t + 0.35); chain(n, fl, g, ch.sfx); env(g, t, 0.18, 0.28, 0.2); }
      if (kind === "ding") { [84, 88, 91].forEach((n, i) => { const f = mtof(n), c = O("sine", f, t + i * 0.08), m = O("sine", f * 3.5, t + i * 0.08), mg = G(), g = G(); mg.gain.value = f * 1.5; m.connect(mg); mg.connect(c.frequency); chain(c, g, ch.sfx); env(g, t + i * 0.08, 0.003, 0.25, 0.9); [c, m].forEach((o) => { o.start(t + i * 0.08); o.stop(t + 1.2); }); }); }
      if (kind === "buzz") { [0, 0.18].forEach((d) => { const o = O("sawtooth", 92, t + d), fl = F("lowpass", 900), g = G(); chain(o, fl, g, ch.sfx); env(g, t + d, 0.005, 0.22, 0.14); o.start(t + d); o.stop(t + d + 0.2); }); }
      if (kind === "pop") { const n = N(t, 0.1), g = G(); chain(n, F("highpass", 1200), g, ch.sfx); env(g, t, 0.001, 0.35, 0.07); [76, 83, 88].forEach((x, i) => { const o = O("triangle", mtof(x), t + i * 0.05), og = G(); chain(o, og, ch.sfx); env(og, t + i * 0.05, 0.002, 0.15, 0.25); o.start(t + i * 0.05); o.stop(t + 0.5); }); }
    };
    B.close = () => { B.stop(); try { X && X.close(); } catch (e) {} X = B.ctx = null; };
    B._MOODS = MOODS;
    return B;
  }

  /* ---------------- música (YouTube, reproductor visible) ---------------- */
  function ytAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (W._ytp) return W._ytp;
    W._ytp = new Promise((res, rej) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) try { prev(); } catch (e) {} res(); };
      const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.onerror = rej; document.head.appendChild(s);
    });
    return W._ytp;
  }
  function Music(ov) {
    const M = { pl: null, ready: false, on: true, started: false, want: null, cur: null, idx: 0, vt: null, B: Beat() };
    const npT = ov.querySelector(".wr-np b"), npA = ov.querySelector(".wr-np span"), hint = ov.querySelector(".wr-ythint");
    const label = (key, extra) => { const s = SONGS[key]; npT.textContent = s ? s.t : "—"; npA.textContent = extra || (s ? s.a : ""); };
    const isYT = (k) => SONGS[k] && SONGS[k].ids;
    const ramp = (to, ms, cb) => { clearInterval(M.vt); if (!M.pl || !M.pl.getVolume) { cb && cb(); return; } let v = M.pl.getVolume() || 0; const st = (to - v) / Math.max(1, ms / 40); M.vt = setInterval(() => { v += st; if ((st >= 0 && v >= to) || (st < 0 && v <= to)) { v = to; clearInterval(M.vt); cb && cb(); } try { M.pl.setVolume(Math.round(v)); } catch (e) {} }, 40); };
    const ytPause = () => { clearInterval(M.vt); try { M.pl && M.pl.pauseVideo(); } catch (e) {} };
    const load = () => {
      const s = SONGS[M.cur]; if (!s) return;
      const id = s.ids[M.idx]; if (!id) { label(M.cur, "No disponible aquí"); M.B.setMood("hype"); M.B.fade(0.55); return; }
      try { M.pl.unMute(); M.pl.setVolume(0); M.pl.loadVideoById({ videoId: id, startSeconds: s.s || 0 }); } catch (e) {}
      label(M.cur);
      setTimeout(() => ramp(85, 900), 400);
      setTimeout(() => { try { if (M.on && M.cur && isYT(M.cur) && M.pl.getPlayerState() !== 1 && M.pl.getPlayerState() !== 3) hint.classList.add("on"); } catch (e) {} }, 3500);
    };
    M.play = (key) => {
      if (key) M.want = key;
      if (!M.want) return;
      const yt = isYT(M.want);
      ov.classList.toggle("ytoff", !yt);
      label(M.want);
      if (!M.on || !M.started) return;
      if (!yt) { // beat propio
        hint.classList.remove("on");
        if (M.cur && isYT(M.cur)) ytPause();
        M.cur = M.want; M.B.resume(); M.B.setMood(SONGS[M.want].beat); M.B.fade(0.55, 0.5); ov.classList.add("playing");
        return;
      }
      M.B.fade(0, 0.4);
      if (!M.ready) return;
      if (M.cur === M.want) { try { if (M.pl.getPlayerState() !== 1) M.pl.playVideo(); } catch (e) {} return; }
      M.cur = M.want; M.idx = 0; load();
    };
    M.start = () => {
      if (M.started) return false; M.started = true;
      if (M.B.init()) M.B.resume();
      M.play(); return true;
    };
    M.sfx = (k) => { if (M.on && M.started) M.B.sfx(k); };
    M.toggle = () => {
      M.on = !M.on; ov.classList.toggle("nomus", !M.on);
      if (!M.on) { ytPause(); M.B.fade(0, 0.2); ov.classList.remove("playing"); }
      else if (M.started) { const k = M.want; M.cur = isYT(k) ? M.cur : null; if (isYT(k) && M.cur === k) { try { M.pl.playVideo(); } catch (e) {} } else M.play(k); }
      return M.on;
    };
    M.destroy = () => { clearInterval(M.vt); M.B.close(); try { M.pl && M.pl.destroy(); } catch (e) {} };
    ytAPI().then(() => {
      M.pl = new YT.Player(ov.querySelector(".wr-ytbox"), {
        width: 200, height: 200, playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 1, fs: 0, iv_load_policy: 3 },
        events: {
          onReady: () => { M.ready = true; if (M.started && isYT(M.want)) M.play(); },
          onError: () => { M.idx++; load(); },
          onStateChange: (e) => { if (isYT(M.cur)) ov.classList.toggle("playing", e.data === 1); if (e.data === 1) hint.classList.remove("on"); if (e.data === 0 && M.cur && isYT(M.cur)) { const s = SONGS[M.cur]; try { M.pl.seekTo(s.s || 0); M.pl.playVideo(); } catch (x) {} } },
        },
      });
    }).catch(() => { M.ytDead = true; });
    return M;
  }

  /* ---------------- confeti ---------------- */
  function confetti(cv, colors) {
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const Wd = (cv.width = cv.clientWidth * (window.devicePixelRatio || 1)), Hd = (cv.height = cv.clientHeight * (window.devicePixelRatio || 1));
    const ps = [...Array(160)].map(() => ({ x: Wd / 2 + (Math.random() - 0.5) * Wd * 0.3, y: Hd * 0.55, vx: (Math.random() - 0.5) * Wd * 0.03, vy: -Math.random() * Hd * 0.028 - Hd * 0.01, s: (6 + Math.random() * 8) * (window.devicePixelRatio || 1), r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[Math.floor(Math.random() * colors.length)], sh: Math.random() < 0.5 }));
    let t = 0; cancelAnimationFrame(cv._raf);
    const step = () => {
      ctx.clearRect(0, 0, Wd, Hd); t++;
      ps.forEach((p) => { p.vy += Hd * 0.0009; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; if (p.sh) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.4, 0, 7); ctx.fill(); } ctx.restore(); });
      if (t < 220) cv._raf = requestAnimationFrame(step); else ctx.clearRect(0, 0, Wd, Hd);
    };
    step();
  }

  /* ---------------- visor tipo historias ---------------- */
  W.open = function (D, cards, title) {
    cards = cards.map((c) => (typeof c === "string" ? { h: c } : c));
    let i = 0;
    const ov = document.createElement("div");
    ov.className = "wr-ov";
    ov.innerHTML = `<div class="wr-bars">${cards.map(() => "<i><b></b></i>").join("")}</div>
      <div class="wr-stage"><div class="wr-scale"></div><canvas class="wr-conf"></canvas></div>
      <div class="wr-dock">
        <div class="wr-yt"><div class="wr-ytbox"></div></div>
        <div class="wr-dinfo">
          <div class="wr-np"><div class="wr-eq"><i></i><i></i><i></i><i></i></div><div><b>Música</b><span>Toca la tarjeta para arrancar</span></div></div>
          <div class="wr-ythint">Si no suena, dale play al video. A veces YouTube pone un anuncio antes.</div>
          <div class="wr-btns"><button data-a="mus">Música: sí</button><button data-a="img">Guardar</button><button data-a="close">Cerrar</button></div>
        </div>
      </div>`;
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    const scale = ov.querySelector(".wr-scale"), stage = ov.querySelector(".wr-stage"), cv = ov.querySelector(".wr-conf");
    const M = Music(ov); W._M = M;
    const fit = () => { const s = Math.min(stage.clientWidth / 1080, stage.clientHeight / 1920); scale.style.transform = `scale(${s})`; scale.style.width = "1080px"; scale.style.height = "1920px"; scale.style.marginLeft = (stage.clientWidth - 1080 * s) / 2 + "px"; };
    const boom = () => { const c = cards[i]; const st = getComputedStyle(scale.firstElementChild); confetti(cv, [st.getPropertyValue("--ac").trim() || "#C8F169", st.getPropertyValue("--fg").trim() || "#fff", "#FF5A36", "#FFD166", "#7CF2C2", "#FF8BA7"]); };
    const show = () => {
      const c = cards[i];
      scale.innerHTML = c.h;
      ov.querySelectorAll(".wr-bars i").forEach((b, k) => { b.classList.toggle("done", k < i); b.classList.toggle("on", k === i); });
      ov.querySelector('[data-a="img"]').textContent = c.kind === "summary" ? "Compartir resumen" : "Guardar";
      scale.querySelectorAll("[data-count]").forEach((el) => { const n = Number(el.dataset.count); if (!n) return; const t0 = performance.now(); const step = (t) => { const p = Math.min(1, (t - t0) / 1100); el.textContent = fmt(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
      const g = scale.querySelector(".wr-guess");
      if (g) {
        const rv = scale.querySelector(".wr-reveal"); rv.classList.add("hid");
        g.onclick = (e) => { const b = e.target.closest("button"); if (!b || g.dataset.done) return; e.stopPropagation(); g.dataset.done = 1; g.querySelectorAll("button").forEach((x) => x.classList.add(x.dataset.w === g.dataset.ans ? "ok" : x === b ? "no" : "off")); rv.classList.remove("hid"); if (b.dataset.w === g.dataset.ans) { M.sfx("ding"); boom(); } else M.sfx("buzz"); };
      }
      if (c.conf) setTimeout(() => { M.sfx("pop"); boom(); }, 700);
      if (c.song) M.play(c.song);
      fit();
    };
    const close = () => { M.destroy(); cancelAnimationFrame(cv._raf); ov.remove(); document.body.style.overflow = ""; window.removeEventListener("resize", fit); document.removeEventListener("keydown", key); };
    const key = (e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); if (e.key === "Escape") close(); };
    const next = () => { if (M.start()) return; if (i < cards.length - 1) { i++; M.sfx("whoosh"); show(); } };
    const prev = () => { if (M.start()) return; if (i > 0) { i--; M.sfx("whoosh"); show(); } };
    stage.onclick = (e) => { const x = e.clientX - stage.getBoundingClientRect().left; if (x < stage.clientWidth / 3) prev(); else next(); };
    ov.querySelector('[data-a="close"]').onclick = close;
    ov.querySelector('[data-a="mus"]').onclick = (e) => { const on = M.toggle(); e.target.textContent = "Música: " + (on ? "sí" : "no"); setTimeout(fit, 50); };
    ov.querySelector('[data-a="img"]').onclick = () => { const html = cards[i].h; UI.makeImage(`<div class="wr-export">${html}</div>`, `wrapped-${(title || "liga").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cards[i].kind === "summary" ? "resumen" : i + 1}`); };
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
    const PIN_HASH = "6aaf1778";
    const pinHash = (v) => (LB.util.hashStr("lb-" + v) >>> 0).toString(16).padStart(8, "0").slice(0, 8);
    let commish = false; try { commish = sessionStorage.getItem("lb-pin") === PIN_HASH; } catch (e) {}
    if (!open && commish && !rid) {
      el.innerHTML = `<div class="h2">Wrapped ${esc(D.season)} · vista del comisionado</div><p class="sub">Solo tú lo ves. Para la liga se abre el <b>${esc(fecha)}</b>. Datos hasta la semana ${D.lastScored}. Súbele al volumen.</p>
        <div class="wr-entry"><button class="btn pri" id="wrLeague">Wrapped de la liga</button><button class="btn" id="wrLock">Salir de la vista previa</button></div>
        <div class="card" style="margin-top:16px"><div class="h3">Wrapped de cada equipo</div><div class="wr-entry" style="margin-top:8px">${D.standings.map((x) => `<button class="btn" data-wr="${x.rid}">${T(D, x.rid)}</button>`).join("")}</div></div>`;
      el.querySelector("#wrLeague").onclick = () => W.open(D, W.leagueCards(D), "liga");
      el.querySelectorAll("[data-wr]").forEach((b) => (b.onclick = () => { const r = Number(b.dataset.wr); W.open(D, W.teamCards(D, r), UI.tName(D, r)); }));
      el.querySelector("#wrLock").onclick = () => { try { sessionStorage.removeItem("lb-pin"); } catch (e) {} W.render(D, el, opts); };
      return;
    }
    if (!open) {
      el.innerHTML = `<div class="wr-lock"><img src="${esc(CFG.logo || "")}" alt=""><div class="h2">Wrapped ${esc(D.season)}</div><p class="sub">Tu temporada, contada como nunca. Con música. Se abre el <b>${esc(fecha)}</b>, dos días después de la final.</p><div class="wr-count" id="wrCount"></div><p class="small muted">Cada manager recibe su link privado. El Wrapped de la liga se abre para todos el mismo día.</p>
        <details class="wr-pin"><summary class="small muted">Acceso del comisionado</summary><div class="wr-entry" style="justify-content:center;margin-top:10px"><input id="wrPin" type="password" inputmode="numeric" autocomplete="off" placeholder="Contraseña" style="padding:9px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--tx);font:inherit;width:140px"><button class="btn pri" id="wrPinBtn">Entrar</button></div><p class="small" id="wrPinErr" style="display:none;color:var(--coral)">Contraseña incorrecta.</p></details></div>`;
      const tick = () => { const ms = unlock - Date.now(); if (ms <= 0) return W.render(D, el); const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), mi = Math.floor((ms % 36e5) / 6e4); const c = document.getElementById("wrCount"); if (c) c.innerHTML = `<div><b>${d}</b><span>días</span></div><div><b>${h}</b><span>horas</span></div><div><b>${mi}</b><span>min</span></div>`; };
      tick(); clearInterval(W._t); W._t = setInterval(tick, 30000);
      const go = () => { if (pinHash(el.querySelector("#wrPin").value.trim()) === PIN_HASH) { try { sessionStorage.setItem("lb-pin", PIN_HASH); } catch (e) {} W.render(D, el, opts); } else el.querySelector("#wrPinErr").style.display = "block"; };
      el.querySelector("#wrPinBtn").onclick = go;
      el.querySelector("#wrPin").onkeydown = (e) => { if (e.key === "Enter") go(); };
      return;
    }
    el.innerHTML = `<div class="h2">Wrapped ${esc(D.season)}</div><p class="sub">${opts.preview ? "Vista previa privada con los datos hasta la semana " + D.lastScored + "." : "La temporada se acabó. Así nos fue."} Súbele al volumen.</p>
      <div class="wr-entry"><button class="btn pri" id="wrLeague">Ver el Wrapped de la liga</button>
      ${rid ? `<button class="btn pri" id="wrMine">Ver el Wrapped de ${T(D, rid)}</button>` : `<p class="small muted" style="margin:10px 0 0">Tu Wrapped personal se abre con el link que te mandó el comisionado.</p>`}</div>`;
    el.querySelector("#wrLeague").onclick = () => W.open(D, W.leagueCards(D), "liga");
    const b = el.querySelector("#wrMine"); if (b) b.onclick = () => W.open(D, W.teamCards(D, rid), UI.tName(D, rid));
    if (rid && opts.autoOpen !== false && !W._opened) { W._opened = true; W.open(D, W.teamCards(D, rid), UI.tName(D, rid)); }
  };
})();
