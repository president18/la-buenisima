/* =================================================================
   LA BUENÍSIMA · motor de datos y análisis
   Lee en vivo la API pública de Sleeper y calcula todo en el navegador.
   ================================================================= */
(function () {
  const CFG = window.LB_CONFIG;
  const API = "https://api.sleeper.app";
  const POS_Q = "&position[]=QB&position[]=RB&position[]=WR&position[]=TE&position[]=K&position[]=DEF";
  const LB = (window.LB = window.LB || {});

  /* ---------------- utilidades ---------------- */
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const avg = (a) => (a.length ? sum(a) / a.length : 0);
  const sd = (a) => {
    if (a.length < 2) return 0;
    const m = avg(a);
    return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1));
  };
  const r1 = (x) => Math.round(x * 10) / 10;
  const r2 = (x) => Math.round(x * 100) / 100;
  const norm = (v, arr) => {
    const mn = Math.min(...arr), mx = Math.max(...arr);
    return mx === mn ? 0.5 : (v - mn) / (mx - mn);
  };
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = typeof seed === "string" ? hashStr(seed) : seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normCdf(x) {
    // Abramowitz-Stegun
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }
  LB.util = { sum, avg, sd, r1, r2, norm, rng, hashStr, normCdf };

  // Caché local (Cache Storage): lo que no cambia seguido se guarda en el teléfono para que cargue rápido.
  const CACHE = "lb-cache-v1";
  async function getJSON(url, ttlMin) {
    if (ttlMin && window.caches) {
      try {
        const c = await caches.open(CACHE);
        const hit = await c.match(url);
        if (hit) {
          const t = Number(hit.headers.get("x-lb-time") || 0);
          if (Date.now() - t < ttlMin * 60000) return hit.json();
        }
        const r = await fetch(url);
        if (!r.ok) throw new Error("Sleeper respondió " + r.status);
        const body = await r.text();
        c.put(url, new Response(body, { headers: { "content-type": "application/json", "x-lb-time": String(Date.now()) } })).catch(() => {});
        return JSON.parse(body);
      } catch (e) { if (String(e.message).startsWith("Sleeper")) throw e; }
    }
    const r = await fetch(url);
    if (!r.ok) throw new Error("Sleeper respondió " + r.status);
    return r.json();
  }

  /* ---------------- alineación óptima ---------------- */
  const ELIG = {
    QB: ["QB"], RB: ["RB"], WR: ["WR"], TE: ["TE"], K: ["K"], DEF: ["DEF"],
    FLEX: ["RB", "WR", "TE"], WRRB_FLEX: ["RB", "WR"], REC_FLEX: ["WR", "TE"],
    SUPER_FLEX: ["QB", "RB", "WR", "TE"],
  };
  function startSlots(rosterPositions) {
    return rosterPositions.filter((p) => ELIG[p]);
  }
  // Devuelve la mejor alineación posible con valueFn(pid) y posFn(pid).
  function optimalLineup(pids, slots, valueFn, posFn) {
    const order = slots.map((s, i) => ({ s, i })).sort((a, b) => ELIG[a.s].length - ELIG[b.s].length);
    const used = new Set();
    const lineup = new Array(slots.length);
    let total = 0;
    for (const { s, i } of order) {
      let best = null, bv = -Infinity;
      for (const p of pids) {
        if (used.has(p)) continue;
        if (!ELIG[s].includes(posFn(p))) continue;
        const v = valueFn(p);
        if (v > bv) { bv = v; best = p; }
      }
      if (best != null) { used.add(best); lineup[i] = { slot: s, pid: best, val: bv }; total += bv; }
      else lineup[i] = { slot: s, pid: null, val: 0 };
    }
    return { total, lineup };
  }
  LB.optimalLineup = optimalLineup;
  LB.ELIG = ELIG;

  /* ---------------- carga principal ---------------- */
  LB.load = async function (onProgress, leagueIdOverride) {
    const step = (t) => onProgress && onProgress(t);
    const id = leagueIdOverride || CFG.leagueId;
    step("Conectando con Sleeper…");
    const [state, league, users, rosters] = await Promise.all([
      getJSON(`${API}/v1/state/nfl`),
      getJSON(`${API}/v1/league/${id}`),
      getJSON(`${API}/v1/league/${id}/users`),
      getJSON(`${API}/v1/league/${id}/rosters`),
    ]);
    const S = league.settings;
    const regEnd = (S.playoff_week_start || 15) - 1;
    const poRounds = Math.ceil(Math.log2(Math.max(2, S.playoff_teams || 6)));
    const totalWeeks = regEnd + poRounds;
    const lastScored = S.last_scored_leg || 0;
    let curWeek;
    if (league.status === "complete") curWeek = totalWeeks + 1;
    else if (league.status === "in_season" && state.season === league.season) curWeek = Math.min(Math.max(state.week || 1, lastScored + 1), totalWeeks + 1);
    else curWeek = Math.max(1, lastScored + 1);

    step("Bajando partidos y movimientos…");
    const wk = [...Array(totalWeeks).keys()].map((i) => i + 1);
    const txWeeks = wk.filter((w) => w <= Math.min(curWeek, totalWeeks));
    const [mList, tList, drafts, bracket] = await Promise.all([
      Promise.all(wk.map((w) => getJSON(`${API}/v1/league/${id}/matchups/${w}`, w < lastScored ? 720 : 0).catch(() => []))),
      Promise.all(txWeeks.map((w) => getJSON(`${API}/v1/league/${id}/transactions/${w}`, w < curWeek - 1 ? 720 : 0).catch(() => []))),
      getJSON(`${API}/v1/league/${id}/drafts`).catch(() => []),
      getJSON(`${API}/v1/league/${id}/winners_bracket`).catch(() => []),
    ]);
    const draft = drafts.find((d) => d.status === "complete") || drafts[0];
    const draftPicks = draft ? await getJSON(`${API}/v1/draft/${draft.draft_id}/picks`, 1440).catch(() => []) : [];

    step("Bajando estadísticas y proyecciones de jugadores…");
    const projWeek = Math.min(curWeek, totalWeeks);
    const [stats, proj, trending] = await Promise.all([
      getJSON(`${API}/stats/nfl/${league.season}?season_type=regular${POS_Q}&order_by=pts_half_ppr`, 60).catch(() => []),
      getJSON(`${API}/projections/nfl/${league.season}/${projWeek}?season_type=regular${POS_Q}&order_by=pts_half_ppr`, 30).catch(() => []),
      getJSON(`${API}/v1/players/nfl/trending/add?lookback_hours=72&limit=60`).catch(() => []),
    ]);

    step("Calculando todo…");
    const D = build({ state, league, users, rosters, mList, tList, draft, draftPicks, bracket, stats, proj, trending, regEnd, totalWeeks, lastScored, curWeek, projWeek });

    // Jugadores sin nombre (ej. lesionados toda la temporada): bajar catálogo completo una vez.
    const missing = [...D.referenced].filter((p) => !D.players[p]);
    if (missing.length > 3) {
      step("Completando nombres de jugadores…");
      try {
        const all = await getJSON(`${API}/v1/players/nfl`, 1440);
        for (const p of missing) if (all[p]) D.players[p] = mkPlayer(p, all[p]);
      } catch (e) { /* no pasa nada */ }
    }
    for (const p of D.referenced) if (!D.players[p]) D.players[p] = { id: p, name: "Jugador " + p, short: "#" + p, pos: "?", team: "", inj: null };
    finalize(D);
    if (!leagueIdOverride) LB.data = D;
    return D;
  };

  function mkPlayer(pid, p) {
    if (!p) return null;
    const pos = p.position || (p.fantasy_positions || [])[0] || "?";
    let name, short;
    if (pos === "DEF") { name = `${p.first_name || ""} ${p.last_name || ""}`.trim() || pid; short = (p.team || pid) + " DEF"; }
    else { name = `${p.first_name || ""} ${p.last_name || ""}`.trim() || pid; short = p.first_name ? `${p.first_name[0]}. ${p.last_name}` : name; }
    return { id: pid, name, short, pos, team: p.team || "", inj: p.injury_status || null };
  }

  /* ---------------- construcción del modelo ---------------- */
  function build(raw) {
    const { league, users, rosters, mList, tList, draftPicks, stats, proj, trending, regEnd, totalWeeks, lastScored, curWeek, projWeek } = raw;
    const slots = startSlots(league.roster_positions);
    const players = {};
    const seasonPts = {}, seasonGp = {}, projPts = {};
    for (const s of stats) {
      if (!s.player_id) continue;
      if (s.player) players[s.player_id] = mkPlayer(s.player_id, s.player);
      seasonPts[s.player_id] = (s.stats && s.stats.pts_half_ppr) || 0;
      seasonGp[s.player_id] = (s.stats && (s.stats.gp || s.stats.gms_active)) || 0;
    }
    for (const s of proj) {
      if (!s.player_id) continue;
      if (s.player) { const np = mkPlayer(s.player_id, s.player); players[s.player_id] = Object.assign(players[s.player_id] || {}, np, { inj: np.inj }); }
      projPts[s.player_id] = (s.stats && s.stats.pts_half_ppr) || 0;
    }
    for (const dp of draftPicks) if (!players[dp.player_id] && dp.metadata) players[dp.player_id] = mkPlayer(dp.player_id, dp.metadata);

    const userById = {};
    users.forEach((u) => (userById[u.user_id] = u));
    const NK = {}; Object.keys(CFG.nicknames || {}).forEach((k) => (NK[k.toLowerCase()] = CFG.nicknames[k]));
    const nick = (u) => (u && (NK[(u.display_name || "").toLowerCase()] || u.display_name)) || "Sin dueño";
    const teams = {};
    rosters.forEach((r) => {
      const u = userById[r.owner_id];
      const co = (r.co_owners || []).map((c) => userById[c]).filter(Boolean);
      const tn = (u && u.metadata && u.metadata.team_name && u.metadata.team_name.trim()) || (u ? "Team " + u.display_name : "Equipo " + r.roster_id);
      teams[r.roster_id] = {
        rid: r.roster_id, name: tn, owner: u ? u.display_name : "—", ownerNick: nick(u), ownerId: r.owner_id,
        owners: [u, ...co].filter(Boolean).map((x) => x.display_name),
        ownersNick: [u, ...co].filter(Boolean).map(nick).join(" & "),
        avatar: u && u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : null,
        avatarId: u && u.avatar,
        roster: r.players || [], starters: r.starters || [], reserve: r.reserve || [],
        settings: r.settings || {}, sleeperRecord: (r.metadata && r.metadata.record) || "",
      };
    });
    const rids = Object.keys(teams).map(Number).sort((a, b) => a - b);

    // Semanas
    const weeks = {}; // w -> rid -> entry
    const games = {}; // w -> [{a,b}]
    mList.forEach((ml, i) => {
      const w = i + 1;
      weeks[w] = {};
      const byMid = {};
      (ml || []).forEach((m) => {
        weeks[w][m.roster_id] = {
          rid: m.roster_id, mid: m.matchup_id, pts: m.points || 0,
          starters: m.starters || [], sp: m.starters_points || [],
          pp: m.players_points || {}, players: m.players || Object.keys(m.players_points || {}),
        };
        if (m.matchup_id != null) (byMid[m.matchup_id] = byMid[m.matchup_id] || []).push(m.roster_id);
      });
      games[w] = Object.entries(byMid).filter(([, v]) => v.length === 2).map(([mid, v]) => ({ mid: Number(mid), a: v[0], b: v[1] }));
    });

    const referenced = new Set();
    rids.forEach((r) => teams[r].roster.forEach((p) => referenced.add(p)));
    Object.values(weeks).forEach((wm) => Object.values(wm).forEach((e) => e.players.forEach((p) => referenced.add(p))));

    // Transacciones
    const tx = [];
    tList.forEach((tl) => (tl || []).forEach((t) => {
      if (t.status !== "complete") return;
      tx.push({
        id: t.transaction_id, type: t.type, week: t.leg, time: t.status_updated || t.created,
        rids: t.roster_ids || [], adds: t.adds || {}, drops: t.drops || {},
        picks: t.draft_picks || [], faab: t.waiver_budget || [], settings: t.settings || {},
      });
      Object.keys(t.adds || {}).forEach((p) => referenced.add(p));
      Object.keys(t.drops || {}).forEach((p) => referenced.add(p));
    }));
    tx.sort((a, b) => a.time - b.time);

    const trendMap = {};
    trending.forEach((t) => (trendMap[t.player_id] = t.count));

    return {
      league, users, teams, rids, slots, weeks, games, tx, players, seasonPts, seasonGp, projPts, trendMap,
      draftPicks, bracket: raw.bracket || [], regEnd, totalWeeks, lastScored, curWeek, projWeek, referenced,
      season: league.season, numTeams: rids.length,
      playoffTeams: league.settings.playoff_teams || 6,
    };
  }

  /* ---------------- análisis ---------------- */
  function finalize(D) {
    const P = D.players;
    const posOf = (p) => (P[p] ? P[p].pos : "?");
    D.posOf = posOf;
    D.ppg = (p) => (D.seasonGp[p] ? D.seasonPts[p] / D.seasonGp[p] : 0);
    D.playedWeeks = [];
    for (let w = 1; w <= Math.min(D.lastScored, D.totalWeeks); w++) D.playedWeeks.push(w);
    D.regWeeksPlayed = D.playedWeeks.filter((w) => w <= D.regEnd);
    D.liveWeek = null;
    const cw = D.curWeek;
    if (cw <= D.totalWeeks && D.weeks[cw]) {
      const live = Object.values(D.weeks[cw]).some((e) => e.pts > 0);
      if (live) D.liveWeek = cw;
    }

    // Resultado por equipo por semana
    const tw = {}; // rid -> w -> {pf, pa, opp, res, max, ap}
    D.rids.forEach((r) => (tw[r] = {}));
    for (const w of D.playedWeeks) {
      const wm = D.weeks[w];
      const ptsAll = D.rids.map((r) => (wm[r] ? wm[r].pts : 0));
      for (const r of D.rids) {
        const e = wm[r];
        if (!e) continue;
        const g = D.games[w].find((x) => x.a === r || x.b === r);
        const opp = g ? (g.a === r ? g.b : g.a) : null;
        const pa = opp != null && wm[opp] ? wm[opp].pts : null;
        const opt = optimalLineup(e.players, D.slots, (p) => e.pp[p] || 0, posOf);
        const apW = ptsAll.filter((x) => x < e.pts).length;
        const apT = ptsAll.filter((x) => x === e.pts).length - 1;
        tw[r][w] = {
          w, pf: e.pts, pa, opp, max: Math.max(opt.total, e.pts), opt,
          res: pa == null ? null : e.pts > pa ? "W" : e.pts < pa ? "L" : "T",
          apW, apL: D.numTeams - 1 - apW - apT, apT,
          reg: w <= D.regEnd,
        };
      }
    }
    D.tw = tw;

    D.standingsAt = (uptoW) => standingsAt(D, uptoW);
    D.powerAt = (uptoW) => powerAt(D, uptoW);
    D.standings = standingsAt(D, Math.min(D.lastScored, D.regEnd));
    computeMoves(D);
    computeDraft(D);
    computeGrades(D);
    D.records = computeRecords(D);
    D.scheduleMatrix = scheduleMatrix(D);
    D.sim = simulate(D, 10000);
  }

  function standingsAt(D, uptoW) {
    const rows = D.rids.map((r) => {
      const ws = Object.values(D.tw[r]).filter((x) => x.w <= uptoW && x.reg);
      const W = ws.filter((x) => x.res === "W").length, L = ws.filter((x) => x.res === "L").length, T = ws.filter((x) => x.res === "T").length;
      const pf = sum(ws.map((x) => x.pf)), pa = sum(ws.map((x) => x.pa || 0)), mx = sum(ws.map((x) => x.max));
      const apW = sum(ws.map((x) => x.apW)), apL = sum(ws.map((x) => x.apL)), apT = sum(ws.map((x) => x.apT));
      const apPct = apW + apL + apT ? (apW + apT / 2) / (apW + apL + apT) : 0;
      const expW = sum(ws.map((x) => (x.apW + x.apT / 2) / (D.numTeams - 1)));
      const last3 = ws.slice(-3).map((x) => x.pf);
      let streak = "";
      if (ws.length) {
        const lastRes = ws[ws.length - 1].res; let n = 0;
        for (let i = ws.length - 1; i >= 0 && ws[i].res === lastRes; i--) n++;
        streak = n + (lastRes === "W" ? "G" : lastRes === "L" ? "P" : "E");
      }
      return {
        rid: r, W, L, T, gp: ws.length, pf, pa, max: mx, eff: mx ? pf / mx : 0,
        ppg: ws.length ? pf / ws.length : 0, papg: ws.length ? pa / ws.length : 0,
        apW, apL, apT, apPct, expW, luck: W + T / 2 - expW,
        last3: avg(last3), sdPts: sd(ws.map((x) => x.pf)), streak,
        winPct: ws.length ? (W + T / 2) / ws.length : 0,
        form: ws.slice(-5).map((x) => x.res).join(""),
        hi: ws.length ? Math.max(...ws.map((x) => x.pf)) : 0,
        lo: ws.length ? Math.min(...ws.map((x) => x.pf)) : 0,
      };
    });
    rows.sort((a, b) => b.winPct - a.winPct || b.pf - a.pf);
    rows.forEach((x, i) => (x.rank = i + 1));
    return rows;
  }

  function powerAt(D, uptoW) {
    const st = standingsAt(D, uptoW);
    if (!st.length || !st[0].gp) return [];
    const ppgs = st.map((x) => x.ppg), l3 = st.map((x) => x.last3), effs = st.map((x) => x.eff);
    const rows = st.map((x) => {
      const score = 100 * (0.30 * norm(x.ppg, ppgs) + 0.25 * x.apPct + 0.20 * norm(x.last3, l3) + 0.15 * x.winPct + 0.10 * norm(x.eff, effs));
      return Object.assign({}, x, { score });
    });
    rows.sort((a, b) => b.score - a.score);
    rows.forEach((x, i) => (x.prank = i + 1));
    if (uptoW > 1) {
      const prev = powerAt(D, uptoW - 1);
      rows.forEach((x) => {
        const p = prev.find((y) => y.rid === x.rid);
        x.prev = p ? p.prank : null;
        x.delta = p ? p.prank - x.prank : 0;
      });
    } else rows.forEach((x) => { x.prev = null; x.delta = 0; });
    return rows;
  }

  /* -------- movimientos: trades, waivers, agentes libres -------- */
  function stintPoints(D, rid, pid, fromW, toW) {
    // Puntos del jugador con ese equipo, como titular y totales, entre semanas.
    let start = 0, all = 0, weeksOn = 0;
    for (const w of D.playedWeeks) {
      if (w < fromW || w > toW) continue;
      const e = D.weeks[w][rid];
      if (!e || !e.players.includes(pid)) continue;
      weeksOn++;
      const pts = e.pp[pid] || 0;
      all += pts;
      if (e.starters.includes(pid)) start += pts;
    }
    return { start, all, weeksOn };
  }
  function leaveWeek(D, rid, pid, afterTime) {
    const t = D.tx.find((x) => x.time > afterTime && x.drops[pid] === rid);
    return t ? t.week - (isBeforeGames(t) ? 1 : 0) : 99;
  }
  function isBeforeGames() { return false; }
  function computeMoves(D) {
    const trades = [], pickups = [], drops = [];
    for (const t of D.tx) {
      if (t.type === "trade") {
        const sides = t.rids.map((rid) => {
          const gets = Object.keys(t.adds).filter((p) => t.adds[p] === rid);
          const picks = t.picks.filter((pk) => pk.owner_id === rid);
          const items = gets.map((pid) => {
            const sp = stintPoints(D, rid, pid, t.week, leaveWeek(D, rid, pid, t.time));
            return { pid, ...sp, ppg: D.ppg(pid) };
          });
          return { rid, gets: items, picks, startPts: sum(items.map((i) => i.start)), allPts: sum(items.map((i) => i.all)), valueNow: sum(items.filter((i) => D.teams[rid].roster.includes(i.pid)).map((i) => i.ppg)) };
        });
        const best = sides.slice().sort((a, b) => b.startPts - a.startPts);
        trades.push({ ...t, sides, winner: best.length > 1 && best[0].startPts - best[1].startPts > 5 ? best[0].rid : null, margin: best.length > 1 ? best[0].startPts - best[1].startPts : 0 });
      } else if (t.type === "waiver" || t.type === "free_agent") {
        for (const pid of Object.keys(t.adds)) {
          const rid = t.adds[pid];
          const sp = stintPoints(D, rid, pid, t.week, leaveWeek(D, rid, pid, t.time));
          const dropped = Object.keys(t.drops).filter((p) => t.drops[p] === rid);
          pickups.push({ time: t.time, week: t.week, type: t.type, rid, pid, dropped, ...sp, ppg: D.ppg(pid), still: D.teams[rid].roster.includes(pid) });
        }
        for (const pid of Object.keys(t.drops)) {
          const rid = t.drops[pid];
          // ¿quién lo agarró después y cuánto le dio?
          let gave = 0, to = null;
          for (const r of D.rids) {
            if (r === rid) continue;
            const s = stintPoints(D, r, pid, t.week, 99);
            if (s.start > gave) { gave = s.start; to = r; }
          }
          drops.push({ time: t.time, week: t.week, rid, pid, gave, to, ppg: D.ppg(pid) });
        }
      }
    }
    D.trades = trades.reverse();
    D.pickups = pickups;
    D.drops = drops;
    const by = {};
    D.rids.forEach((r) => (by[r] = { waiverStart: 0, moves: 0, tradeNet: 0, trades: 0 }));
    pickups.forEach((p) => { by[p.rid].waiverStart += p.start; by[p.rid].moves++; });
    trades.forEach((t) => {
      if (t.sides.length !== 2) return;
      const [a, b] = t.sides;
      by[a.rid].tradeNet += a.startPts - b.startPts; by[a.rid].trades++;
      by[b.rid].tradeNet += b.startPts - a.startPts; by[b.rid].trades++;
    });
    D.moveStats = by;
  }

  function computeDraft(D) {
    const picks = D.draftPicks.map((p) => ({
      pick: p.pick_no, round: p.round, rid: p.roster_id, pid: p.player_id,
      pts: D.seasonPts[p.player_id] || 0, ...stintPoints(D, p.roster_id, p.player_id, 1, leaveWeek(D, p.roster_id, p.player_id, 0)),
    }));
    // ranking de puntos entre los drafteados
    const sorted = picks.slice().sort((a, b) => b.pts - a.pts);
    sorted.forEach((p, i) => (p.ptsRank = i + 1));
    picks.forEach((p) => (p.value = p.pick - p.ptsRank)); // positivo = robo
    D.draft = picks;
    const by = {};
    D.rids.forEach((r) => (by[r] = { start: 0, pts: 0 }));
    picks.forEach((p) => { if (by[p.rid]) { by[p.rid].start += p.start; by[p.rid].pts += p.pts; } });
    D.draftStats = by;
  }

  function gradeFromRank(rank, n) {
    const scale = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
    const idx = Math.round(((rank - 1) / Math.max(1, n - 1)) * (scale.length - 1));
    return scale[idx];
  }
  function computeGrades(D) {
    const n = D.rids.length;
    const cats = {
      draft: (r) => D.draftStats[r].start,
      waivers: (r) => D.moveStats[r].waiverStart,
      trades: (r) => D.moveStats[r].tradeNet,
      lineups: (r) => (D.standings.find((s) => s.rid === r) || {}).eff || 0,
    };
    const grades = {};
    D.rids.forEach((r) => (grades[r] = {}));
    for (const [k, f] of Object.entries(cats)) {
      const ord = D.rids.slice().sort((a, b) => f(b) - f(a));
      ord.forEach((r, i) => (grades[r][k] = { rank: i + 1, grade: gradeFromRank(i + 1, n), val: f(r) }));
    }
    // Trades: quien no ha hecho trades queda "—"
    D.rids.forEach((r) => { if (!D.moveStats[r].trades) grades[r].trades = { rank: null, grade: "—", val: 0 }; });
    D.grades = grades;
  }

  /* ---------------- récords ---------------- */
  function computeRecords(D) {
    const g = [];
    for (const w of D.playedWeeks) for (const x of D.games[w]) {
      const ea = D.tw[x.a][w], eb = D.tw[x.b][w];
      if (!ea || !eb) continue;
      g.push({ w, a: x.a, b: x.b, pa: ea.pf, pb: eb.pf, ma: ea.max, mb: eb.max });
    }
    const teamWeeks = [];
    D.rids.forEach((r) => Object.values(D.tw[r]).forEach((x) => teamWeeks.push({ rid: r, ...x })));
    const by = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a));
    const R = {};
    R.highScore = by(teamWeeks, (x) => x.pf).slice(0, 5);
    R.lowScore = by(teamWeeks, (x) => -x.pf).slice(0, 5);
    R.blowouts = by(g, (x) => Math.abs(x.pa - x.pb)).slice(0, 5);
    R.closest = by(g, (x) => -Math.abs(x.pa - x.pb)).slice(0, 5);
    R.mostInLoss = by(teamWeeks.filter((x) => x.res === "L"), (x) => x.pf).slice(0, 5);
    R.fewestInWin = by(teamWeeks.filter((x) => x.res === "W"), (x) => -x.pf).slice(0, 5);
    R.benchFails = by(teamWeeks.filter((x) => x.res === "L" && x.max > (x.pa || 0)), (x) => x.max - x.pf).slice(0, 5);
    R.benchLeft = by(teamWeeks, (x) => x.max - x.pf).slice(0, 5);
    const perf = [];
    for (const w of D.playedWeeks) for (const r of D.rids) {
      const e = D.weeks[w][r];
      if (!e) continue;
      e.starters.forEach((p, i) => perf.push({ w, rid: r, pid: p, pts: e.sp[i] != null ? e.sp[i] : e.pp[p] || 0 }));
    }
    R.bestPerf = by(perf, (x) => x.pts).slice(0, 8);
    // top scorer por semana
    const weekly = {};
    D.rids.forEach((r) => (weekly[r] = 0));
    const weeklyTop = D.playedWeeks.map((w) => {
      const best = D.rids.filter((r) => D.tw[r][w]).sort((a, b) => D.tw[b][w].pf - D.tw[a][w].pf)[0];
      if (best != null) weekly[best]++;
      return { w, rid: best, pts: best != null ? D.tw[best][w].pf : 0 };
    });
    R.weeklyTop = weeklyTop;
    R.weeklyTopCount = weekly;
    // rachas
    let bestW = { n: 0 }, bestL = { n: 0 };
    D.rids.forEach((r) => {
      let cw = 0, cl = 0;
      Object.values(D.tw[r]).filter((x) => x.reg).forEach((x) => {
        if (x.res === "W") { cw++; cl = 0; } else if (x.res === "L") { cl++; cw = 0; } else { cw = 0; cl = 0; }
        if (cw > bestW.n) bestW = { n: cw, rid: r, w: x.w };
        if (cl > bestL.n) bestL = { n: cl, rid: r, w: x.w };
      });
    });
    R.winStreak = bestW; R.loseStreak = bestL;
    R.games = g;
    return R;
  }

  /* ---------------- calendarios alternos ---------------- */
  function scheduleMatrix(D) {
    const weeks = D.regWeeksPlayed;
    const M = {};
    for (const i of D.rids) {
      M[i] = {};
      for (const j of D.rids) {
        let W = 0, L = 0, T = 0;
        for (const w of weeks) {
          const tj = D.tw[j][w], ti = D.tw[i][w];
          if (!tj || !ti || tj.opp == null) continue;
          let opp = i === j ? ti.opp : tj.opp === i ? j : tj.opp;
          const po = D.tw[opp][w].pf;
          if (ti.pf > po) W++; else if (ti.pf < po) L++; else T++;
        }
        M[i][j] = { W, L, T };
      }
    }
    // resumen
    const summary = D.rids.map((i) => {
      const recs = D.rids.map((j) => ({ j, ...M[i][j] }));
      const best = recs.slice().sort((a, b) => b.W - a.W)[0];
      const worst = recs.slice().sort((a, b) => a.W - b.W)[0];
      const avgW = avg(recs.map((x) => x.W));
      return { rid: i, best, worst, avgW, actual: M[i][i] };
    });
    // ¿qué tan duro es cada calendario? (promedio de victorias que da a otros)
    const hardness = D.rids.map((j) => ({ rid: j, givesAvgW: avg(D.rids.filter((i) => i !== j).map((i) => M[i][j].W)) }));
    return { M, summary, hardness };
  }

  /* ---------------- simulación de playoffs ---------------- */
  function simulate(D, N) {
    const st = D.standings;
    const remaining = [];
    for (let w = D.lastScored + 1; w <= D.regEnd; w++) for (const g of D.games[w] || []) remaining.push({ w, a: g.a, b: g.b });
    const model = {};
    D.rids.forEach((r) => {
      const s = st.find((x) => x.rid === r);
      const mean = 0.7 * s.ppg + 0.3 * (s.last3 || s.ppg);
      model[r] = { mean: mean || 100, sd: Math.max(s.sdPts || 0, 15) };
    });
    const rand = rng("sim-" + D.lastScored);
    const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const out = {};
    D.rids.forEach((r) => (out[r] = { playoff: 0, bye: 0, first: 0, last: 0, wins: 0, seeds: new Array(D.rids.length).fill(0) }));
    const P = D.playoffTeams;
    for (let n = 0; n < N; n++) {
      const rec = {};
      st.forEach((s) => (rec[s.rid] = { w: s.W + s.T / 2, pf: s.pf }));
      for (const g of remaining) {
        const pa = model[g.a].mean + model[g.a].sd * gauss(), pb = model[g.b].mean + model[g.b].sd * gauss();
        rec[g.a].pf += pa; rec[g.b].pf += pb;
        if (pa > pb) rec[g.a].w++; else rec[g.b].w++;
      }
      const ord = D.rids.slice().sort((a, b) => rec[b].w - rec[a].w || rec[b].pf - rec[a].pf);
      ord.forEach((r, i) => {
        const o = out[r];
        o.seeds[i]++; o.wins += rec[r].w;
        if (i < P) o.playoff++;
        if (i < 2) o.bye++;
        if (i === 0) o.first++;
        if (i === ord.length - 1) o.last++;
      });
    }
    D.rids.forEach((r) => {
      const o = out[r];
      ["playoff", "bye", "first", "last", "wins"].forEach((k) => (o[k] /= N));
      o.seeds = o.seeds.map((x) => x / N);
    });
    return { out, remaining, model, N };
  }

  /* ---------------- partido de la semana (proyección) ---------------- */
  LB.matchupInfo = function (D, w, g) {
    const ea = D.weeks[w][g.a], eb = D.weeks[w][g.b];
    const projOf = (e) => (w === D.projWeek ? sum(e.starters.map((p) => D.projPts[p] || 0)) : null);
    const played = w <= D.lastScored;
    const live = D.liveWeek === w;
    const pa = projOf(ea), pb = projOf(eb);
    const sa = D.standingsAt(Math.min(w - 1, D.regEnd)).find((x) => x.rid === g.a) || {};
    const sb = D.standingsAt(Math.min(w - 1, D.regEnd)).find((x) => x.rid === g.b) || {};
    let winA = null;
    if (pa != null && pb != null && (pa + pb) > 0) winA = normCdf((pa - pb) / 26);
    else if (sa.ppg && sb.ppg) winA = normCdf((sa.ppg - sb.ppg) / Math.sqrt((sa.sdPts || 20) ** 2 + (sb.sdPts || 20) ** 2));
    // H2H previo
    const h2h = [];
    for (const pw of D.playedWeeks) {
      if (pw >= w) break;
      const t = D.tw[g.a][pw];
      if (t && t.opp === g.b) h2h.push({ w: pw, pa: t.pf, pb: t.pa });
    }
    const topStarters = (e, by) => e.starters.map((p, i) => ({ pid: p, pts: e.sp[i] != null ? e.sp[i] : e.pp[p] || 0, proj: D.projPts[p] || 0 }))
      .sort((x, y) => y[by] - x[by]);
    const benchBest = (e) => e.players.filter((p) => !e.starters.includes(p)).map((p) => ({ pid: p, pts: e.pp[p] || 0 })).sort((x, y) => y.pts - x.pts);
    return {
      w, g, ea, eb, played, live, pa, pb, winA, sa, sb, h2h,
      topA: topStarters(ea, played || live ? "pts" : "proj"), topB: topStarters(eb, played || live ? "pts" : "proj"),
      benchA: benchBest(ea), benchB: benchBest(eb),
      ta: D.tw[g.a][w], tb: D.tw[g.b][w],
      injA: ea.starters.filter((p) => D.players[p] && ["Out", "IR", "Doubtful", "Sus"].includes(D.players[p].inj)),
      injB: eb.starters.filter((p) => D.players[p] && ["Out", "IR", "Doubtful", "Sus"].includes(D.players[p].inj)),
    };
  };

  /* ---------------- valores de jugador (para trades / FA) ---------------- */
  LB.playerValue = function (D, pid) {
    const ppg = D.ppg(pid);
    const pr = D.projPts[pid];
    const inj = D.players[pid] && D.players[pid].inj;
    let v = pr != null && pr > 0 ? 0.55 * ppg + 0.45 * pr : ppg * (pr === 0 && D.seasonGp[pid] ? 0.9 : 1);
    if (inj === "IR" || inj === "Out") v *= 0.35;
    else if (inj === "Doubtful") v *= 0.6;
    else if (inj === "Questionable") v *= 0.92;
    return v;
  };
})();
