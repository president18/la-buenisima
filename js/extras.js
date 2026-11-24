/* =================================================================
   LA BUENÍSIMA · Playoffs (bracket y escenarios), Cara a cara, Roast
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui;
  const { esc, f1, pct, rec } = UI;
  const X = (LB.extras = {});
  const T = (D, r) => esc(UI.tName(D, r));

  /* ---------------- escenarios de playoffs ---------------- */
  X.scenarios = function (D, N = 6000) {
    if (D._scn) return D._scn;
    const st = D.standings;
    const rem = D.sim.remaining;
    const model = D.sim.model;
    const rand = LB.util.rng("scn-" + D.lastScored);
    const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const P = D.playoffTeams;
    const byWins = {}; // rid -> wins -> [made, total]
    const nextW = rem.length ? rem[0].w : null;
    const nextGames = rem.map((g, i) => ({ ...g, i })).filter((g) => g.w === nextW);
    const cond = {}; // rid -> gameIdx -> {aWin:[m,t], bWin:[m,t]}
    D.rids.forEach((r) => { byWins[r] = {}; cond[r] = {}; nextGames.forEach((g) => (cond[r][g.i] = { a: [0, 0], b: [0, 0] })); });
    for (let n = 0; n < N; n++) {
      const rec = {}, add = {};
      st.forEach((s) => { rec[s.rid] = { w: s.W + s.T / 2, pf: s.pf }; add[s.rid] = 0; });
      const outs = new Array(rem.length);
      rem.forEach((g, i) => {
        const pa = model[g.a].mean + model[g.a].sd * gauss(), pb = model[g.b].mean + model[g.b].sd * gauss();
        rec[g.a].pf += pa; rec[g.b].pf += pb;
        const aw = pa > pb; outs[i] = aw;
        if (aw) { rec[g.a].w++; add[g.a]++; } else { rec[g.b].w++; add[g.b]++; }
      });
      const ord = D.rids.slice().sort((a, b) => rec[b].w - rec[a].w || rec[b].pf - rec[a].pf);
      const made = new Set(ord.slice(0, P));
      D.rids.forEach((r) => {
        const k = add[r];
        const c = (byWins[r][k] = byWins[r][k] || [0, 0]);
        c[1]++; if (made.has(r)) c[0]++;
        nextGames.forEach((g) => {
          if (g.a === r || g.b === r) return;
          const o = cond[r][g.i][outs[g.i] ? "a" : "b"];
          o[1]++; if (made.has(r)) o[0]++;
        });
      });
    }
    const res = {};
    D.rids.forEach((r) => {
      const left = rem.filter((g) => g.a === r || g.b === r).length;
      const rows = [];
      for (let k = left; k >= 0; k--) { const c = byWins[r][k]; rows.push({ k, left, p: c && c[1] ? c[0] / c[1] : null }); }
      const help = nextGames.filter((g) => g.a !== r && g.b !== r).map((g) => {
        const o = cond[r][g.i];
        const pa = o.a[1] ? o.a[0] / o.a[1] : 0, pb = o.b[1] ? o.b[0] / o.b[1] : 0;
        return { g, root: pa >= pb ? g.a : g.b, delta: Math.abs(pa - pb) };
      }).sort((a, b) => b.delta - a.delta);
      res[r] = { rows, left, help };
    });
    D._scn = { res, nextW };
    return D._scn;
  };

  X.renderPlayoffs = function (D, el) {
    const sim = D.sim.out;
    const S = D.sim.remaining.length ? X.scenarios(D) : null;
    // --- bracket ---
    const bracketHTML = bracket(D);
    // --- escenarios ---
    let scn = "";
    if (S) {
      const ord = D.standings.map((s) => s.rid);
      scn = ord.map((r) => {
        const o = sim[r], s = S.res[r];
        const status = o.playoff >= 0.995 ? '<span class="pill g">Prácticamente adentro</span>' : o.playoff <= 0.005 ? '<span class="pill b">Prácticamente fuera</span>' : `<span class="pill y">${pct(o.playoff)}</span>`;
        const rows = s.rows.map((x) => `<span class="chip">Gana ${x.k} de ${x.left}: <b>${x.p == null ? "—" : pct(x.p)}</b></span>`).join("");
        const help = s.help.filter((h) => h.delta >= 0.03).slice(0, 2).map((h) => `${T(D, h.root)} (le sube ${Math.round(h.delta * 100)} pts %)`).join(" y ");
        return `<div class="card ${UI.isMine(D, r) ? "me" : ""}"><div class="row">${UI.teamCell(D, r)}<span class="sp"></span>${status}</div>
          <div class="small muted" style="margin:8px 0 6px">${rec(D.standings.find((x) => x.rid === r))} · Le faltan ${s.left} partido${s.left === 1 ? "" : "s"}</div>
          <div class="scn">${rows}</div>
          ${help && o.playoff > 0.005 && o.playoff < 0.995 ? `<p class="small" style="margin:8px 0 0">${IC("megaphone", 15)} Esta semana le conviene que ganen: <b>${help}</b>.</p>` : ""}</div>`;
      }).join("");
    }
    el.innerHTML = `<div class="h2">Playoffs</div><p class="sub">Top ${D.playoffTeams} entran, los 2 primeros descansan la primera ronda. Semanas ${D.regEnd + 1} a ${D.totalWeeks}.</p>
      <div class="row"><div class="h3" style="margin-top:0">Bracket</div><span class="sp"></span><button class="btn" id="imgBracket">${IC("image", 16)} Imagen</button></div>${bracketHTML}
      ${S ? `<div class="h3">¿Qué necesita cada equipo?</div><p class="sub">Probabilidad de entrar según cuántos partidos gane de los que le faltan (${D.sim.N.toLocaleString()} simulaciones con el calendario real).</p><div class="grid g2">${scn}</div>` : ""}`;
    const b = document.getElementById("imgBracket");
    if (b) b.onclick = () => UI.makeImage(UI.icFrame(D, "Playoffs " + D.season, "El bracket", `<div style="zoom:1">${bracketCard(D)}</div>`), "bracket-playoffs");
  };

  function seedsNow(D) { return D.standings.slice(0, D.playoffTeams).map((s) => s.rid); }
  function bracketModel(D) {
    // Usa el bracket real de Sleeper si ya existe; si no, proyecta con la tabla actual.
    const B = (D.bracket || []).filter((m) => !m.p || m.p === 1);
    const seeds = seedsNow(D);
    const seedOf = (r) => seeds.indexOf(r) + 1;
    const ptsOf = (r, w) => (r != null && D.weeks[w] && D.weeks[w][r] ? D.weeks[w][r].pts : null);
    if (B.length) {
      const rounds = [...new Set(B.map((m) => m.r))].sort((a, b) => a - b);
      return { real: true, rounds: rounds.map((rr) => ({ r: rr, w: D.regEnd + rr, ms: B.filter((m) => m.r === rr).map((m) => ({ t1: m.t1, t2: m.t2, w: m.w, s1: ptsOf(m.t1, D.regEnd + rr), s2: ptsOf(m.t2, D.regEnd + rr) })) })), seedOf };
    }
    const [s1, s2, s3, s4, s5, s6] = seeds;
    return { real: false, seedOf, rounds: [
      { r: 1, w: D.regEnd + 1, ms: [{ t1: s3, t2: s6 }, { t1: s4, t2: s5 }], bye: [s1, s2] },
      { r: 2, w: D.regEnd + 2, ms: [{ t1: s1, t2: null, ph: "Ganador 4 vs 5" }, { t1: s2, t2: null, ph: "Ganador 3 vs 6" }] },
      { r: 3, w: D.regEnd + 3, ms: [{ t1: null, t2: null, ph: "Final" }] },
    ] };
  }
  const RN = ["", "Primera ronda", "Semifinales", "Final"];
  function bracket(D) {
    const Bm = bracketModel(D);
    const team = (r, s, win, ph) => r == null ? `<div class="br-t"><span class="faint">${esc(ph || "Por definirse")}</span></div>` :
      `<div class="br-t ${win ? "w" : ""}"><span class="seed">${Bm.seedOf(r) || ""}</span>${UI.avatar(D.teams[r], "sm")}<span class="tn" style="max-width:130px">${T(D, r)}</span><span class="s">${s != null && s > 0 ? f1(s) : ""}</span></div>`;
    const cols = Bm.rounds.map((R) => `<div class="br-col"><div class="br-h">${RN[R.r] || "Ronda " + R.r} · Sem ${R.w}</div>
      ${R.ms.map((m) => `<div class="br-m">${team(m.t1, m.s1, m.w && m.w === m.t1)}${team(m.t2, m.s2, m.w && m.w === m.t2, m.ph)}</div>`).join("")}
      ${R.bye ? `<p class="small faint" style="margin:0">Descansan: ${R.bye.map((r) => T(D, r)).join(" y ")}</p>` : ""}</div>`).join("");
    return `${Bm.real ? "" : '<p class="small muted">Proyección con la tabla de hoy. Se vuelve el bracket real cuando arranquen los playoffs.</p>'}<div class="bracket">${cols}</div>`;
  }
  function bracketCard(D) {
    const Bm = bracketModel(D);
    const t = (r, s, win, ph) => `<div style="display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #DCD4C4;font-size:24px;${win ? "background:#F7E7DA;font-weight:700" : ""}"><span>${r == null ? `<span style="color:#8E8D8A">${esc(ph || "Por definirse")}</span>` : `<span style="color:#8E8D8A;font-size:18px">${Bm.seedOf(r) || ""}</span> ${T(D, r)}`}</span><span>${s ? f1(s) : ""}</span></div>`;
    return `<div style="display:grid;grid-template-columns:repeat(${Bm.rounds.length},1fr);gap:18px">${Bm.rounds.map((R) => `<div><div style="font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:#8E8D8A;margin-bottom:10px">${RN[R.r]}</div>${R.ms.map((m) => `<div style="background:#F6F4EE;border:1px solid #DCD4C4;border-radius:16px;overflow:hidden;margin-bottom:16px">${t(m.t1, m.s1, m.w && m.w === m.t1)}${t(m.t2, m.s2, m.w && m.w === m.t2, m.ph)}</div>`).join("")}${R.bye ? `<div style="font-size:20px;color:#8E8D8A">Descansan: ${R.bye.map((r) => T(D, r)).join(" y ")}</div>` : ""}</div>`).join("")}</div>`;
  }

  /* ---------------- Cara a cara ---------------- */
  X.renderH2H = function (D, el) {
    el.innerHTML = '<div class="loading" style="min-height:30vh"><div><div class="spin"></div>Cargando historial…</div></div>';
    LB.history.load(D).then((seasons) => {
      const owners = {};
      seasons.forEach((S) => S.rids.forEach((r) => { const t = S.teams[r]; const k = t.ownerId || t.owner; owners[k] = owners[k] || { k, name: t.ownersNick, team: t.name }; }));
      const list = Object.values(owners).sort((a, b) => a.name.localeCompare(b.name));
      const me = list.find((o) => D.rids.some((r) => UI.isMine(D, r) && (D.teams[r].ownerId === o.k))) || list[0];
      const opts = (sel) => list.map((o) => `<option value="${esc(o.k)}" ${o.k === sel ? "selected" : ""}>${esc(o.name)} · ${esc(o.team)}</option>`).join("");
      el.innerHTML = `<div class="h2">Cara a cara</div><p class="sub">Escoge dos managers y mira su historial completo entre ellos.</p>
        <div class="row" style="margin-bottom:14px"><select id="h2a">${opts(me.k)}</select><span class="faint">vs</span><select id="h2b">${opts((list.find((o) => o.k !== me.k) || me).k)}</select></div><div id="h2out"></div>`;
      const run = () => {
        const a = document.getElementById("h2a").value, b = document.getElementById("h2b").value;
        const out = document.getElementById("h2out");
        if (a === b) { out.innerHTML = '<p class="muted">Escoge dos managers distintos.</p>'; return; }
        const games = [];
        seasons.forEach((S) => {
          const ra = S.rids.find((r) => (S.teams[r].ownerId || S.teams[r].owner) === a), rb = S.rids.find((r) => (S.teams[r].ownerId || S.teams[r].owner) === b);
          if (ra == null || rb == null) return;
          S.playedWeeks.forEach((w) => { const t = S.tw[ra][w]; if (t && t.opp === rb) games.push({ S, w, pa: t.pf, pb: t.pa, po: w > S.regEnd, ra, rb }); });
        });
        const wa = games.filter((g) => g.pa > g.pb).length, wb = games.filter((g) => g.pb > g.pa).length;
        const pa = games.reduce((s, g) => s + g.pa, 0), pb = games.reduce((s, g) => s + g.pb, 0);
        const big = games.slice().sort((x, y) => Math.abs(y.pa - y.pb) - Math.abs(x.pa - x.pb))[0];
        const na = owners[a].name, nb = owners[b].name;
        // ¿se enfrentan pronto?
        const next = D.sim.remaining.find((g) => { const ta = D.teams[g.a], tb = D.teams[g.b]; const ka = ta.ownerId || ta.owner, kb = tb.ownerId || tb.owner; return (ka === a && kb === b) || (ka === b && kb === a); });
        out.innerHTML = `<div class="kpis"><div class="kpi"><div class="l">${esc(na)}</div><div class="v">${wa}</div><div class="d">victorias</div></div><div class="kpi"><div class="l">${esc(nb)}</div><div class="v">${wb}</div><div class="d">victorias</div></div>
          <div class="kpi"><div class="l">Puntos</div><div class="v" style="font-size:22px">${f1(pa)} – ${f1(pb)}</div><div class="d">${games.length} partidos</div></div>
          <div class="kpi"><div class="l">Paliza más grande</div><div class="v" style="font-size:22px">${big ? "+" + f1(Math.abs(big.pa - big.pb)) : "—"}</div><div class="d">${big ? esc(big.pa > big.pb ? na : nb) + " · " + big.S.season + " sem " + big.w : ""}</div></div></div>
          ${next ? `<p class="note" style="margin-top:12px">${IC("flame", 15)} Se vuelven a ver en la semana ${next.w}.</p>` : ""}
          <div class="h3">Todos sus partidos</div>
          ${games.length ? `<div class="tbl-wrap"><table><thead><tr><th>Temp.</th><th>Sem</th><th class="r">${esc(na)}</th><th class="r">${esc(nb)}</th><th>Ganó</th></tr></thead><tbody>${games.map((g) => `<tr><td>${g.S.season}</td><td>${g.w}${g.po ? " " + IC("trophy", 13) : ""}</td><td class="r num ${g.pa > g.pb ? "good" : ""}">${f1(g.pa)}</td><td class="r num ${g.pb > g.pa ? "good" : ""}">${f1(g.pb)}</td><td>${esc(g.pa > g.pb ? na : nb)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="muted">Todavía no se han enfrentado.</p>'}`;
      };
      document.getElementById("h2a").onchange = run; document.getElementById("h2b").onchange = run; run();
    });
  };

  /* ---------------- Roast semanal ---------------- */
  X.roasts = function (D, w) {
    const R = LB.util.rng("roast" + w);
    const pick = (a) => a[Math.floor(R() * a.length)];
    const tws = D.rids.map((r) => ({ r, ...D.tw[r][w] })).filter((x) => x.pf != null);
    const avg = tws.reduce((s, x) => s + x.pf, 0) / (tws.length || 1);
    const st = D.standingsAt(Math.min(w, D.regEnd));
    return D.rids.map((r) => {
      const t = D.tw[r][w]; if (!t) return null;
      const e = D.weeks[w][r];
      const s = st.find((x) => x.rid === r) || {};
      const worst = e.starters.map((p, i) => ({ p, pts: e.sp[i] || 0 })).sort((a, b) => a.pts - b.pts)[0];
      const best = e.starters.map((p, i) => ({ p, pts: e.sp[i] || 0 })).sort((a, b) => b.pts - a.pts)[0];
      const bench = t.max - t.pf;
      const lines = [];
      if (t.res === "W" && t.pf < avg - 8) lines.push(pick([`Ganó con ${f1(t.pf)}. No fue talento, fue el calendario.`, `Victoria fea, pero victoria. ${f1(t.pf)} puntos y a dormir tranquilo.`]));
      else if (t.res === "W") lines.push(pick([`${f1(t.pf)} puntos y victoria. Hoy no hay mucho de qué burlarse… por ahora.`, `Ganó y lo sabe. Ya está insoportable en el chat.`, `Victoria con ${f1(t.pf)}. Que no se le suba, que la semana que entra hay más.`]));
      else if (t.pf >= avg - 3 && t.pf <= avg + 8) lines.push(pick([`Perdió con ${f1(t.pf)}, arriba del promedio. Con eso le ganaba a media liga, pero le tocó la otra mitad.`, `${f1(t.pf)} puntos decentes… y aun así derrota. El fantasy no perdona.`]));
      else if (t.pf > avg + 8) lines.push(pick([`Metió ${f1(t.pf)} y perdió. La vida no es justa y el fantasy menos.`, `${f1(t.pf)} puntos para nada. Que le pida perdón el calendario.`]));
      else lines.push(pick([`${f1(t.pf)} puntos. Hay equipos de la liga infantil con más ganas.`, `Perdió con ${f1(t.pf)}. Se aceptan donaciones de puntos.`, `${f1(t.pf)} puntos. Ni el kicker quería jugar.`]));
      if (worst && worst.pts < 4) lines.push(`${UI.plName(D, worst.p)} sumó ${f1(worst.pts)}. Lo pusieron de titular. Con toda la intención.`);
      if (bench >= 20) lines.push(pick([`Dejó ${f1(bench)} puntos en la banca. La banca ya pidió ser titular.`, `${f1(bench)} puntos sentados mirando el partido. Muy buenos asientos, por cierto.`, `Su banca hizo ${f1(bench)} puntos más de lo que debía. Alguien revise ese lineup.`, `${f1(bench)} puntos en la banca: ni en un buffet se desperdicia tanto.`]));
      else if (bench < 2) lines.push(`Lineup perfecto: ${f1(bench)} pts en la banca. Sospechosamente responsable.`);
      if (best && best.pts >= 25) lines.push(pick([`${UI.plName(D, best.p)} cargó con todo (${f1(best.pts)}). Que le paguen horas extra.`, `${UI.plName(D, best.p)} hizo ${f1(best.pts)}. El resto del equipo nomás vino a ver.`, `Sin ${UI.plName(D, best.p)} (${f1(best.pts)}) esto hubiera sido una tragedia.`]));
      if (s.streak && /^[3-9]P/.test(s.streak)) lines.push(`Racha de ${s.streak.replace("P", " derrotas")}. Ya le dicen "el colchón": todos se le acuestan.`);
      if (s.streak && /^[3-9]G/.test(s.streak)) lines.push(`${s.streak.replace("G", " victorias")} al hilo. Alguien deténgalo, por favor.`);
      if (s.rank === D.numTeams) lines.push(`Último lugar. El castigo ya le está guardando lugar.`);
      return { r, t, lines: lines.slice(0, 3), rank: s.rank };
    }).filter(Boolean);
  };
  X.renderRoast = function (D, el, selW) {
    const weeks = D.playedWeeks;
    const w = selW && weeks.includes(selW) ? selW : weeks[weeks.length - 1];
    if (!w) { el.innerHTML = '<p class="muted">Todavía no hay semanas jugadas.</p>'; return; }
    const list = X.roasts(D, w);
    el.innerHTML = `<div class="row"><div><div class="h2">Roast semanal</div><p class="sub">Una tarjeta de carrilla para cada equipo, lista para el chat.</p></div><span class="sp"></span><select id="roW">${weeks.map((x) => `<option value="${x}" ${x === w ? "selected" : ""}>Semana ${x}</option>`).join("")}</select></div>
      <div class="grid g2">${list.map((x, i) => `<div class="card"><div class="row">${UI.teamCell(D, x.r)}<span class="sp"></span><span class="pill ${x.t.res === "W" ? "g" : "b"}">${x.t.res === "W" ? "Ganó" : "Perdió"} · ${f1(x.t.pf)}</span></div>
        ${x.lines.map((l) => `<p style="margin:10px 0 0;display:flex;gap:8px"><span style="color:var(--coral);flex:none">${IC("flame", 17)}</span><span>${esc(l)}</span></p>`).join("")}<div style="margin-top:10px"><button class="btn" data-ro="${i}" style="padding:6px 12px;font-size:13px">${IC("image", 16)} Imagen</button></div></div>`).join("")}</div>`;
    document.getElementById("roW").onchange = (e) => X.renderRoast(D, el, Number(e.target.value));
    el.querySelectorAll("[data-ro]").forEach((b) => (b.onclick = () => {
      const x = list[Number(b.dataset.ro)];
      const body = `<div style="display:flex;align-items:center;gap:26px;margin:10px 0 30px"><div style="width:150px;height:150px;border-radius:50%;background:${UI.color(x.r)};display:grid;place-items:center;font-size:56px;font-weight:700;color:#fff">${esc(UI.tName(D, x.r).slice(0, 2).toUpperCase())}</div><div><div class="ic-name" style="font-size:46px">${T(D, x.r)}</div><div class="ic-meta" style="font-size:26px">${esc(UI.oName(D, x.r))} · ${x.t.res === "W" ? "Ganó" : "Perdió"} ${f1(x.t.pf)}–${f1(x.t.pa)}</div></div></div>
        ${x.lines.map((l) => `<div class="ic-row" style="grid-template-columns:60px 1fr;font-size:32px;line-height:1.35"><div>${LB.icoImg("flame", 44, "#E85A4F", 1.8)}</div><div>${esc(l)}</div></div>`).join("")}`;
      UI.makeImage(UI.icFrame(D, `Semana ${w}`, "Roast", body), `roast-semana-${w}-${UI.tName(D, x.r).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    }));
  };
})();
