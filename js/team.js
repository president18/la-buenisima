/* =================================================================
   LA BUENÍSIMA · página privada de mi equipo
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, pct, sign, rec } = UI;
  const { normCdf, sum } = LB.util;
  const $ = (s) => document.querySelector(s);
  const PIN_HASH = "6aaf1778"; // se cambia pidiéndoselo a Claude
  let D, ME;

  function pinHash(s) { return (LB.util.hashStr("lb-" + s) >>> 0).toString(16).padStart(8, "0").slice(0, 8); }

  /* ---------- valores ---------- */
  function tradeValue(pid) {
    const ppg = D.ppg(pid), pr = D.projPts[pid] || 0, inj = D.players[pid] && D.players[pid].inj;
    let v = pr > 0 ? 0.75 * ppg + 0.25 * pr : ppg;
    if (inj === "IR") v *= 0.25; else if (inj === "Out") v *= 0.55; else if (inj === "Doubtful") v *= 0.8;
    return v;
  }
  const LU = (pids, vf) => LB.optimalLineup(pids, D.slots, vf, D.posOf);
  const rosterOf = (rid) => D.teams[rid].roster.filter((p) => !D.teams[rid].reserve.includes(p));

  /* ---------- secciones ---------- */
  function resumen() {
    const s = D.standings.find((x) => x.rid === ME);
    const pw = D.powerAt(Math.min(D.lastScored, D.regEnd)).find((x) => x.rid === ME);
    const o = D.sim.out[ME];
    const ppgRank = D.standings.slice().sort((a, b) => b.ppg - a.ppg).findIndex((x) => x.rid === ME) + 1;
    const effRank = D.standings.slice().sort((a, b) => b.eff - a.eff).findIndex((x) => x.rid === ME) + 1;
    const kpi = (l, v, d) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
    // calendario restante
    const rem = D.sim.remaining.filter((g) => g.a === ME || g.b === ME).map((g) => {
      const opp = g.a === ME ? g.b : g.a;
      const m1 = D.sim.model[ME], m2 = D.sim.model[opp];
      const wp = normCdf((m1.mean - m2.mean) / Math.sqrt(m1.sd ** 2 + m2.sd ** 2));
      const so = D.standings.find((x) => x.rid === opp);
      const po = D.powerAt(Math.min(D.lastScored, D.regEnd)).find((x) => x.rid === opp);
      return `<div class="list-row"><span class="tag">S${g.w}</span>${UI.teamCell(D, opp, { sm: true })}<span class="sp"></span><div class="small" style="text-align:right">${rec(so)} · Power #${po.prank}<br><b class="${wp >= 0.5 ? "good" : "bad"}">${pct(wp)}</b> de ganar</div></div>`;
    }).join("");
    const g = D.grades[ME];
    // diagnóstico
    const notes = [];
    if (s.luck > 1) notes.push(`Ojo: tu récord está inflado por suerte (${sign(s.luck)} victorias sobre lo esperado). Tus puntos dicen que eres más un ${(s.expW).toFixed(1)}-${(s.gp - s.expW).toFixed(1)}.`);
    if (s.luck < -1) notes.push(`Te ha tocado calendario pesado: mereces ${sign(-s.luck)} victorias más.`);
    if (effRank > D.numTeams / 2) notes.push(`Tu eficiencia de lineup es #${effRank} de ${D.numTeams} (${pct(s.eff, 1)}). Estás dejando puntos en la banca: revisa la sección de lineup cada semana.`);
    if (s.last3 < s.ppg * 0.92) notes.push(`Vienes a la baja: ${f1(s.last3)} pts en las últimas 3 vs ${f1(s.ppg)} de promedio.`);
    if (s.last3 > s.ppg * 1.08) notes.push(`Vienes encendido: ${f1(s.last3)} pts en las últimas 3.`);
    if (o.bye > 0.5) notes.push(`Vas bien para el bye de primera ronda (${pct(o.bye)}). Prioridad: asegurar top 2.`);
    else if (o.playoff < 0.5) notes.push(`Estás en riesgo de quedarte fuera de playoffs (${pct(o.playoff)}). Toca arriesgar en trades.`);
    return `<div class="h2">${esc(D.teams[ME].name)}</div><p class="sub">${esc(D.teams[ME].ownersNick)} · tu tablero privado</p>
      <div class="kpis">
        ${kpi("Lugar", "#" + s.rank, rec(s) + " · racha " + s.streak)}
        ${kpi("Power ranking", "#" + pw.prank, "score " + f1(pw.score))}
        ${kpi("Puntos por partido", f1(s.ppg), "#" + ppgRank + " de la liga")}
        ${kpi("Eficiencia", pct(s.eff, 1), "#" + effRank + " · " + f1(s.max - s.pf) + " pts en banca")}
        ${kpi("Playoffs", pct(o.playoff), "Bye " + pct(o.bye) + " · #1 " + pct(o.first))}
        ${kpi("Suerte", sign(s.luck), "victorias vs esperadas")}
      </div>
      ${notes.length ? `<div class="note" style="margin-top:12px">${notes.map(esc).join("<br>")}</div>` : ""}
      <div class="chips" style="margin-top:10px"><span class="chip">Draft <b>${g.draft.grade}</b></span><span class="chip">Waivers <b>${g.waivers.grade}</b></span><span class="chip">Trades <b>${g.trades.grade}</b></span><span class="chip">Lineups <b>${g.lineups.grade}</b></span></div>
      ${rem ? `<div class="h3">Lo que te falta de temporada regular</div><div class="card">${rem}</div>` : ""}`;
  }

  function lineup() {
    const w = D.projWeek;
    const e = D.weeks[w] && D.weeks[w][ME];
    if (!e) return "";
    const pids = e.players.filter((p) => !D.teams[ME].reserve.includes(p));
    const proj = (p) => D.projPts[p] || 0;
    const best = LU(pids, proj);
    const cur = sum(e.starters.map(proj));
    const curSet = new Set(e.starters), bestSet = new Set(best.lineup.map((x) => x.pid));
    const outs = e.starters.filter((p) => !bestSet.has(p)), ins = [...bestSet].filter((p) => p && !curSet.has(p));
    const rows = best.lineup.map((x, i) => {
      const curP = e.starters[i];
      const changed = !curSet.has(x.pid);
      return `<tr><td><span class="pill">${x.slot}</span></td><td>${curP ? UI.pl(D, curP) : "—"}</td><td class="r num">${f1(proj(curP))}</td><td>${changed ? `<b class="gold">→ ${UI.pl(D, x.pid)}</b>` : bestSet.has(curP) ? '<span class="faint">${IC("check", 15)}</span>' : '<span class="bad">sentarlo</span>'}</td><td class="r num">${changed ? f1(x.val) : ""}</td></tr>`;
    }).join("");
    const bench = pids.filter((p) => !curSet.has(p)).sort((a, b) => proj(b) - proj(a)).map((p) => `<span class="chip">${UI.pl(D, p)} <b>${f1(proj(p))}</b></span>`).join("");
    const done = D.liveWeek === w ? `<p class="note">La semana ${w} ya empezó: solo puedes mover a jugadores cuyo partido no ha arrancado.</p>` : "";
    return `<div class="h3">Lineup de la semana ${w}</div>${done}
      <div class="kpis" style="margin-bottom:10px"><div class="kpi"><div class="l">Tu lineup proyecta</div><div class="v">${f1(cur)}</div></div><div class="kpi"><div class="l">Lineup óptimo</div><div class="v gold">${f1(best.total)}</div><div class="d">${best.total - cur > 0.4 ? sign(best.total - cur) + " pts si haces los cambios" : "Ya tienes el mejor lineup"}</div></div></div>
      ${outs.length && best.total - cur > 0.4 ? `<div class="note">Sugerencia: sienta a ${outs.map((p) => esc(UI.plName(D, p))).join(", ")} y mete a ${ins.map((p) => esc(UI.plName(D, p))).join(", ")}.</div>` : ""}
      <div class="tbl-wrap" style="margin-top:10px"><table><thead><tr><th>Pos</th><th>Titular actual</th><th class="r">Proy.</th><th>Óptimo</th><th class="r">Proy.</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="chips" style="margin-top:8px"><span class="small faint" style="align-self:center">Banca:</span>${bench}</div>
      <p class="small faint">Proyecciones de Sleeper (half PPR). Revísalas el domingo antes de los partidos: cambian con lesiones y reportes.</p>`;
  }

  function posStrength() {
    // valor de cada slot del lineup óptimo por equipo
    const groups = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];
    const tv = {};
    D.rids.forEach((r) => {
      const lu = LU(rosterOf(r), tradeValue);
      const g = {};
      groups.forEach((k) => (g[k] = 0));
      lu.lineup.forEach((x) => { const k = x.slot === "FLEX" || x.slot.includes("FLEX") ? "FLEX" : x.slot; g[k] = (g[k] || 0) + x.val; });
      // profundidad: mejores suplentes RB/WR
      const used = new Set(lu.lineup.map((x) => x.pid));
      g.bench = rosterOf(r).filter((p) => !used.has(p) && ["RB", "WR", "TE", "QB"].includes(D.posOf(p))).map(tradeValue).sort((a, b) => b - a).slice(0, 3).reduce((s, x) => s + x, 0);
      g.total = lu.total;
      tv[r] = g;
    });
    const keys = [...groups, "bench", "total"];
    const label = { bench: "Banca (top 3)", total: "Lineup total", FLEX: "FLEX" };
    const ranks = {};
    keys.forEach((k) => { const ord = D.rids.slice().sort((a, b) => tv[b][k] - tv[a][k]); ranks[k] = ord.indexOf(ME) + 1; ranks[k + "_best"] = ord[0]; });
    const avgOf = (k) => sum(D.rids.map((r) => tv[r][k])) / D.rids.length;
    const rows = keys.map((k) => {
      const rk = ranks[k];
      const cls = rk <= 3 ? "good" : rk >= D.numTeams - 2 ? "bad" : "";
      return `<tr><td><b>${label[k] || k}</b></td><td class="r num">${f1(tv[ME][k])}</td><td class="r num">${f1(avgOf(k))}</td><td class="c"><b class="${cls}">#${rk}</b></td><td class="small">${esc(UI.tName(D, ranks[k + "_best"]))}</td></tr>`;
    }).join("");
    const weak = groups.filter((k) => ranks[k] >= D.numTeams - 3 && k !== "K" && k !== "DEF");
    const strong = groups.filter((k) => ranks[k] <= 3 && k !== "K" && k !== "DEF");
    STATE.weak = weak; STATE.strong = strong; STATE.tv = tv; STATE.ranks = ranks;
    return `<div class="h3">Fuerza por posición</div>
      <p class="sub">Valor = puntos por partido esperados de tus titulares (promedio de temporada + proyección, castigando lesiones).</p>
      <div class="tbl-wrap"><table><thead><tr><th>Posición</th><th class="r">Tú</th><th class="r">Promedio liga</th><th class="c">Rank</th><th>El mejor</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="note" style="margin-top:10px">${strong.length ? `${IC("up", 15)} Fuerte en: <b>${strong.join(", ")}</b>. ` : ""}${weak.length ? `${IC("down", 15)} Débil en: <b>${weak.join(", ")}</b> — ahí es donde hay que buscar mejoras.` : "Sin huecos graves en el lineup."}</div>`;
  }
  const STATE = {};

  function freeAgents() {
    const owned = new Set();
    D.rids.forEach((r) => { D.teams[r].roster.forEach((p) => owned.add(p)); D.teams[r].reserve.forEach((p) => owned.add(p)); });
    const mine = rosterOf(ME);
    const base = LU(mine, tradeValue).total;
    const used = new Set(LU(mine, tradeValue).lineup.map((x) => x.pid));
    const cands = Object.keys(D.players).filter((p) => !owned.has(p) && (D.projPts[p] > 0 || D.ppg(p) > 0) && ["QB", "RB", "WR", "TE", "K", "DEF"].includes(D.posOf(p)));
    const worstAt = (pos) => mine.filter((p) => D.posOf(p) === pos).sort((a, b) => tradeValue(a) - tradeValue(b))[0];
    const scored = cands.map((p) => {
      const gain = LU([...mine, p], tradeValue).total - base;
      const w = worstAt(D.posOf(p));
      const vs = w ? tradeValue(p) - tradeValue(w) : tradeValue(p);
      const trend = D.trendMap[p] || 0;
      return { p, gain, vs, worst: w, val: tradeValue(p), proj: D.projPts[p] || 0, ppg: D.ppg(p), trend, score: gain * 3 + vs + Math.log10(1 + trend) * 0.3 };
    }).filter((x) => x.val > 4).sort((a, b) => b.score - a.score);
    const top = scored.filter((x) => !["K", "DEF"].includes(D.posOf(x.p))).slice(0, 12);
    const stream = (pos) => scored.filter((x) => D.posOf(x.p) === pos).sort((a, b) => b.proj - a.proj).slice(0, 3);
    const myK = mine.find((p) => D.posOf(p) === "K"), myD = mine.find((p) => D.posOf(p) === "DEF");
    // candidato a soltar: menor valor fuera del lineup (no K/DEF)
    const dropC = mine.filter((p) => !used.has(p) && !["K", "DEF"].includes(D.posOf(p))).sort((a, b) => tradeValue(a) - tradeValue(b)).slice(0, 2);
    const rows = top.map((x, i) => `<tr><td class="num faint">${i + 1}</td><td>${UI.pl(D, x.p)}</td><td class="r num">${f1(x.ppg)}</td><td class="r num">${f1(x.proj)}</td><td class="r num">${x.trend ? (x.trend / 1000).toFixed(0) + "k" : "—"}</td><td class="r num ${x.gain > 0.3 ? "good" : ""}">${x.gain > 0.05 ? "+" + f1(x.gain) : "—"}</td><td class="small">${x.worst ? (x.vs > 0 ? `<span class="good">mejor que</span> ${esc(UI.plName(D, x.worst))}` : `<span class="faint">no supera a ${esc(UI.plName(D, x.worst))}</span>`) : ""}</td></tr>`).join("");
    const st = (arr, mineP) => arr.map((x) => `<div class="list-row small"><span>${UI.pl(D, x.p)}</span><span class="sp"></span><b class="num">${f1(x.proj)}</b>${mineP ? `<span class="faint">vs ${f1(D.projPts[mineP] || 0)}</span>` : ""}</div>`).join("");
    return `<div class="h3">Agentes libres recomendados</div>
      <p class="sub">Disponibles ahorita. "Mejora lineup" = cuántos pts por semana sube tu lineup ideal si lo agregas. Tendencia = altas en todo Sleeper (72 h).</p>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Jugador</th><th class="r">PPG</th><th class="r">Proy S${D.projWeek}</th><th class="r">Tendencia</th><th class="r">Mejora lineup</th><th>vs tu peor en su posición</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${dropC.length ? `<p class="note" style="margin-top:10px">Para hacer espacio, los candidatos a soltar son: <b>${dropC.map((p) => esc(UI.plName(D, p)) + " (" + f1(tradeValue(p)) + ")").join(", ")}</b>.</p>` : ""}
      <div class="grid g2" style="margin-top:10px">
        <div class="card"><div class="h3" style="margin-top:0;font-size:20px">${IC("target")} Streaming de K · semana ${D.projWeek}</div>${st(stream("K"), myK)}<p class="small faint">Tu K: ${myK ? UI.pl(D, myK) + " · " + f1(D.projPts[myK] || 0) : "—"}</p></div>
        <div class="card"><div class="h3" style="margin-top:0;font-size:20px">${IC("shield")} Streaming de DEF · semana ${D.projWeek}</div>${st(stream("DEF"), myD)}<p class="small faint">Tu DEF: ${myD ? UI.pl(D, myD) + " · " + f1(D.projPts[myD] || 0) : "—"}</p></div></div>`;
  }

  /* ---------- valor de mercado ---------- */
  let MKT = {}, MKT_SRC = "modelo";
  async function loadMarket() {
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 8000);
      const r = await fetch("https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=10&ppr=0.5", { signal: ctl.signal });
      clearTimeout(to);
      const arr = await r.json();
      const m = {};
      (arr || []).forEach((x) => { const id = x.player && (x.player.sleeperId || x.player.sleeper_id); const v = x.redraftValue || x.value; if (id && v) m[String(id)] = v; });
      if (Object.keys(m).length > 100) { MKT = m; MKT_SRC = "FantasyCalc"; return; }
    } catch (e) { /* se usa el modelo propio */ }
    MKT = modelMarket(); MKT_SRC = "modelo";
  }
  // Modelo propio: valor sobre reemplazo, con premio a estrellas (los cracks valen más que la suma de dos medianos)
  function modelMarket() {
    const repl = { QB: 11, RB: 25, WR: 26, TE: 11 };
    const mult = { QB: 0.75, RB: 1.12, WR: 1.0, TE: 0.95 };
    const byPos = {};
    Object.keys(D.players).forEach((p) => { const pos = D.posOf(p); if (repl[pos]) (byPos[pos] = byPos[pos] || []).push({ p, v: tradeValue(p) }); });
    const m = {};
    for (const pos in byPos) {
      const arr = byPos[pos].sort((a, b) => b.v - a.v);
      const rv = (arr[repl[pos] - 1] || arr[arr.length - 1] || { v: 0 }).v;
      arr.forEach((x) => (m[x.p] = Math.round(Math.pow(Math.max(0, x.v - rv) + 0.5, 1.45) * 120 * mult[pos])));
    }
    return m;
  }
  const mv = (p) => MKT[p] || 0;

  function posRanks() {
    // rank por posición de titulares y profundidad
    const res = {};
    D.rids.forEach((r) => (res[r] = {}));
    ["QB", "RB", "WR", "TE"].forEach((k) => {
      const ord = D.rids.slice().sort((a, b) => STATE.tv[b][k] - STATE.tv[a][k]);
      ord.forEach((r, i) => (res[r][k] = i + 1));
    });
    D.rids.forEach((r) => {
      const ros = rosterOf(r);
      const used = new Set(LU(ros, tradeValue).lineup.map((x) => x.pid));
      ["QB", "RB", "WR", "TE"].forEach((k) => {
        const bench = ros.filter((p) => !used.has(p) && D.posOf(p) === k).map(tradeValue).sort((a, b) => b - a);
        res[r][k + "_bench"] = bench[0] || 0;
      });
    });
    return res;
  }

  function trades() {
    const PR = posRanks();
    const mine = rosterOf(ME);
    const myBase = LU(mine, tradeValue).total;
    const myStarters = new Set(LU(mine, tradeValue).lineup.map((x) => x.pid));
    const ok = (p) => !["K", "DEF"].includes(D.posOf(p)) && !(D.players[p] && D.players[p].inj === "IR") && mv(p) > 0;
    const ideas = [];
    const fairOk = (give, get) => {
      const g = give.reduce((s, p) => s + mv(p), 0), r = get.reduce((s, p) => s + mv(p), 0);
      const big = Math.max(g, r) || 1;
      // Ellos (reciben "give") no pueden perder más de 8% de valor; tú no pagas más de 25% de sobreprecio
      return { ok: g >= r * 0.92 && g <= r * 1.25, g, r, diff: (g - r) / big };
    };
    for (const r of D.rids) {
      if (r === ME) continue;
      const theirs = rosterOf(r);
      const thBase = LU(theirs, tradeValue).total;
      const mineT = mine.filter(ok), theirT = theirs.filter(ok);
      const evalT = (give, get) => {
        const f = fairOk(give, get);
        if (!f.ok) return;
        const my = LU([...mine.filter((p) => !give.includes(p)), ...get], tradeValue).total - myBase;
        if (my < 0.6) return;
        const th = LU([...theirs.filter((p) => !get.includes(p)), ...give], tradeValue).total - thBase;
        // Nivel A: a los dos les mejora el lineup. Nivel B: a ellos no les empeora y ganan en valor de mercado.
        if (th >= 0.3) ideas.push({ r, give, get, my, th, f, tier: "A" });
        else if (th >= -0.5 && f.g >= f.r) ideas.push({ r, give, get, my, th, f, tier: "B" });
      };
      for (const a of mineT) for (const b of theirT) evalT([a], [b]);
      for (let i = 0; i < mineT.length; i++) for (let j = i + 1; j < mineT.length; j++) for (const b of theirT) evalT([mineT[i], mineT[j]], [b]);
      for (const a of mineT) for (let i = 0; i < theirT.length; i++) for (let j = i + 1; j < theirT.length; j++) evalT([a], [theirT[i], theirT[j]]);
    }
    ideas.forEach((x) => {
      x.score = x.my * 2 + Math.min(x.th, 5) - Math.abs(x.f.diff) * 6 - (x.give.length + x.get.length - 2) * 0.8 + (x.tier === "A" ? 3 : 0);
    });
    ideas.sort((a, b) => b.score - a.score);
    const picked = [], perTeam = {}, usedP = new Set();
    for (const x of ideas) {
      if ((perTeam[x.r] || 0) >= 2) continue;
      if ([...x.get, ...x.give].some((p) => usedP.has(p))) continue;
      picked.push(x); perTeam[x.r] = (perTeam[x.r] || 0) + 1; [...x.get].forEach((p) => usedP.add(p));
      if (picked.length >= 8) break;
    }
    const need = (r) => ["QB", "RB", "WR", "TE"].map((k) => ({ k, rank: PR[r][k] })).sort((a, b) => b.rank - a.rank)[0];
    const myNeed = need(ME);
    const names = (arr) => arr.map((p) => UI.plName(D, p)).join(" y ");
    const cards = picked.map((x, i) => {
      const nd = need(x.r);
      const giveMain = x.give.slice().sort((a, b) => mv(b) - mv(a))[0];
      const getMain = x.get.slice().sort((a, b) => mv(b) - mv(a))[0];
      const whyThem = [];
      const gpos = [...new Set(x.give.map(D.posOf))];
      if (gpos.includes(nd.k)) whyThem.push(`Su punto más débil es ${nd.k} (#${nd.rank} de la liga) y ${UI.plName(D, giveMain)} le entra de titular.`);
      else if (x.th > 0.2) whyThem.push(`Su lineup sube ${f1(x.th)} pts por semana.`);
      else whyThem.push(`Recibe más valor de mercado del que entrega (${Math.round(x.f.g).toLocaleString()} vs ${Math.round(x.f.r).toLocaleString()}), y su lineup casi no cambia.`);
      const gp = D.posOf(getMain);
      if (PR[x.r][gp + "_bench"] > 6) whyThem.push(`Tiene profundidad en ${gp}, así que puede soltar a ${UI.plName(D, getMain)}.`);
      const whyMe = D.posOf(getMain) === myNeed.k ? `Refuerza tu ${myNeed.k}, tu posición más floja (#${myNeed.rank}).` : `Tu lineup sube ${f1(x.my)} pts por semana.`;
      const owner = UI.oName(D, x.r);
      const msg = `¿Qué onda ${owner}? Te propongo un trade: te doy a ${names(x.give)} por ${names(x.get)}. Te ayuda en ${nd.k}, que es donde más lo necesitas, y en valor de mercado está parejo. ¿Cómo lo ves?`;
      const pl = (p) => `<div class="list-row small" style="display:block"><div>${UI.pl(D, p)}</div><div class="faint num" style="font-size:11.5px">${f1(tradeValue(p))} ppg · valor <b style="color:var(--tx)">${mv(p).toLocaleString()}</b></div></div>`;
      return `<div class="card"><div class="row">${UI.teamCell(D, x.r, { sm: true })}<span class="sp"></span><span class="pill ${x.tier === "A" ? "g" : "y"}">${x.tier === "A" ? "Ganan los dos" : "Ganan en valor"}</span></div>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-top:10px"><div><div class="small faint">Das</div>${x.give.map(pl).join("")}</div><div><div class="small faint">Recibes</div>${x.get.map(pl).join("")}</div></div>
        <div class="stats"><span>Tu lineup <b class="good">+${f1(x.my)}</b> pts/sem</span><span>El suyo <b class="${x.th >= 0 ? "good" : "bad"}">${sign(x.th)}</b></span><span>Mercado <b>${Math.round(x.f.g).toLocaleString()}</b> vs <b>${Math.round(x.f.r).toLocaleString()}</b></span></div>
        <p class="small" style="margin:8px 0 0"><b>Por qué tú:</b> ${esc(whyMe)}<br><b>Por qué ellos dirían que sí:</b> ${esc(whyThem.join(" "))}</p>
        <div class="row" style="margin-top:8px"><button class="btn" data-copy="${i}" style="padding:6px 10px;font-size:12.5px">${IC("copy", 15)} Copiar mensaje</button></div>
        <textarea id="msg${i}" style="display:none">${esc(msg)}</textarea></div>`;
    }).join("");
    STATE.afterRender = () => document.querySelectorAll("[data-copy]").forEach((b) => (b.onclick = async () => {
      const t = document.getElementById("msg" + b.dataset.copy).value;
      try { await navigator.clipboard.writeText(t); UI.toast("Mensaje copiado"); } catch (e) { UI.toast("No se pudo copiar"); }
    }));
    // necesidades de la liga
    const needRows = D.rids.filter((r) => r !== ME).map((r) => { const n = need(r); const strong = ["QB", "RB", "WR", "TE"].map((k) => ({ k, rank: PR[r][k] })).sort((a, b) => a.rank - b.rank)[0]; return `<tr><td>${UI.teamCell(D, r, { sm: true, noOwner: true })}</td><td><span class="pill b">${n.k} #${n.rank}</span></td><td><span class="pill g">${strong.k} #${strong.rank}</span></td></tr>`; }).join("");
    return `<div class="h3">Trades recomendados</div>
      <p class="sub">Primero los trades que <b>les mejoran el lineup a los dos</b>; luego los que a ellos les dan <b>más valor de mercado</b> sin empeorar su lineup. Siempre con valor parejo (${MKT_SRC === "FantasyCalc" ? "valores de FantasyCalc, sacados de miles de trades reales en ligas redraft half-PPR de 10 equipos" : "modelo propio de valor sobre reemplazo, con premio a las estrellas"}). Así hay chance real de que acepten.</p>
      ${cards ? `<div class="grid g2">${cards}</div>` : '<p class="muted">No encontré trades justos que les mejoren el lineup a los dos. Tu roster está bien armado; revisa otra vez la próxima semana.</p>'}
      <div class="h3" style="font-size:20px">Mapa de necesidades de la liga</div>
      <div class="tbl-wrap"><table><thead><tr><th>Equipo</th><th>Necesita</th><th>Su fuerte</th></tr></thead><tbody>${needRows}</tbody></table></div>
      <p class="small faint">Tu necesidad principal: <b>${myNeed.k}</b> (#${myNeed.rank} de la liga). Ofrécele a quien le sobre ${myNeed.k} lo que a él le falta.</p>`;
  }

  function myHistory() {
    const ws = Object.values(D.tw[ME]);
    const rows = ws.map((x) => `<tr><td>S${x.w}</td><td>${x.opp ? UI.teamCell(D, x.opp, { sm: true, noOwner: true }) : "—"}</td><td class="c"><b class="${x.res === "W" ? "good" : "bad"}">${x.res === "W" ? "G" : x.res === "L" ? "P" : x.res || ""}</b></td><td class="r num">${f1(x.pf)}</td><td class="r num">${f1(x.pa)}</td><td class="r num">${f1(x.max)}</td><td class="r num ${x.max - x.pf > 20 ? "bad" : ""}">${f1(x.max - x.pf)}</td><td class="r num">${x.apW}-${x.apL}</td></tr>`).join("");
    const mp = D.pickups.filter((p) => p.rid === ME).sort((a, b) => b.start - a.start).slice(0, 8);
    const mt = D.trades.filter((t) => t.rids.includes(ME));
    return `<div class="h3">Semana por semana</div>
      <div class="tbl-wrap"><table><thead><tr><th>Sem</th><th>Rival</th><th class="c">Res</th><th class="r">PF</th><th class="r">PC</th><th class="r">Máx</th><th class="r">Banca</th><th>All-play</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="grid g2" style="margin-top:12px">
        <div class="card"><div class="h3" style="margin-top:0;font-size:20px">Tus mejores altas</div>${mp.map((p) => `<div class="list-row small"><span>${UI.pl(D, p.pid)}</span><span class="faint">sem ${p.week}</span><span class="sp"></span><b class="num">${f1(p.start)}</b> pts tit.</div>`).join("") || '<p class="small muted">Sin altas todavía.</p>'}</div>
        <div class="card"><div class="h3" style="margin-top:0;font-size:20px">Tus trades</div>${mt.map((t) => { const me = t.sides.find((s) => s.rid === ME), ot = t.sides.find((s) => s.rid !== ME); return `<div class="list-row small"><span>S${t.week}: recibiste ${esc(me.gets.map((g) => UI.plName(D, g.pid)).join(", "))} de ${esc(UI.tName(D, ot.rid))}</span><span class="sp"></span><b class="${me.startPts >= ot.startPts ? "good" : "bad"}">${sign(me.startPts - ot.startPts)}</b></div>`; }).join("") || '<p class="small muted">No has hecho trades.</p>'}</div></div>`;
  }

  function render() {
    $("#main").innerHTML = [resumen(), lineup(), posStrength(), freeAgents(), trades(), myHistory()].map((h) => `<section style="padding-top:8px">${h}</section>`).join("");
    if (STATE.afterRender) STATE.afterRender();
  }

  async function boot() {
    $("#gate").style.display = "none";
    $("#loading").style.display = "grid";
    try {
      D = await LB.load((t) => ($("#loadTxt").textContent = t));
      ME = UI.myRid(D);
      $("#loadTxt").textContent = "Bajando valores de mercado…";
      await loadMarket();
      if (!ME) throw new Error("No encontré el equipo de " + CFG.myUsername);
      $("#loading").style.display = "none";
      $("#main").style.display = "block";
      $("#brandLogo").outerHTML = UI.logoHTML(D);
      $("#liveTxt").textContent = D.liveWeek ? `Semana ${D.liveWeek} en vivo` : "Actualizado " + new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
      render();
    } catch (e) {
      console.error(e);
      $("#loadTxt").innerHTML = `No se pudo cargar (${esc(e.message)}).<br><button class="btn pri" onclick="location.reload()" style="margin-top:12px">Reintentar</button>`;
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    let ok = false;
    try { ok = sessionStorage.getItem("lb-pin") === PIN_HASH; } catch (e) {}
    if (ok) return boot();
    const go = () => {
      if (pinHash($("#pin").value.trim()) === PIN_HASH) {
        try { sessionStorage.setItem("lb-pin", PIN_HASH); } catch (e) {}
        boot();
      } else { $("#pinErr").style.display = "block"; }
    };
    $("#pinBtn").onclick = go;
    $("#pin").onkeydown = (e) => { if (e.key === "Enter") go(); };
    $("#refreshBtn").onclick = () => boot();
  });
  LB._pinHash = pinHash;
})();
