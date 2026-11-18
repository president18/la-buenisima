/* =================================================================
   LA BUENÍSIMA · historia de la liga (todas las temporadas)
   Sigue la cadena previous_league_id de Sleeper: cada temporada nueva
   se agrega sola.
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, rec } = UI;
  const H = (LB.history = {});
  let seasons = null, loading = null;

  H.load = async function (D) {
    if (seasons) return seasons;
    if (loading) return loading;
    loading = (async () => {
      const list = [D];
      let prev = D.league.previous_league_id;
      let guard = 0;
      while (prev && prev !== "0" && guard++ < 15) {
        try { const P = await LB.load(null, prev); list.push(P); prev = P.league.previous_league_id; } catch (e) { break; }
      }
      seasons = list;
      return list;
    })();
    return loading;
  };

  function champ(S) {
    if (!S.bracket || !S.bracket.length) return null;
    const maxR = Math.max(...S.bracket.map((m) => m.r));
    const f = S.bracket.find((m) => m.r === maxR && m.p === 1);
    return f && f.w ? f : null;
  }
  const tl = (S, r) => `${esc(S.teams[r].name)} <span class="faint small">${esc(S.teams[r].ownersNick)}</span>`;

  H.render = function (D, el, list) {
    const cur = D;
    // Salón de la fama
    const champs = list.map((S) => ({ S, c: champ(S) })).filter((x) => x.c);
    const manual = (CFG.pastChampions || []).map((c) => `<div class="list-row"><span class="pill y">${esc(c.season)}</span><b>🏆 ${esc(c.champion)}</b>${c.runnerUp ? `<span class="faint small">vs ${esc(c.runnerUp)}</span>` : ""}</div>`).join("");
    const hall = champs.map(({ S, c }) => `<div class="list-row"><span class="pill y">${S.season}</span><b>🏆 ${tl(S, c.w)}</b><span class="sp"></span><span class="small faint">subcampeón: ${esc(S.teams[c.l].name)}</span></div>`).join("") + manual;

    // Temporadas
    const seasonCards = list.map((S) => {
      const c = champ(S);
      const st = S.standings;
      const most = st.slice().sort((a, b) => b.pf - a.pf)[0];
      const mvp = (LB.awards && LB.awards.metrics.includes("mvp")) ? mvpOf(S) : null;
      const live = !c && S.league.status !== "complete";
      return `<div class="card"><div class="row"><div class="h3" style="margin:0">${S.season}</div><span class="sp"></span>${live ? '<span class="pill g">En curso</span>' : ""}</div>
        <div class="list-row small"><span>🏆 Campeón</span><span class="sp"></span><b>${c ? esc(S.teams[c.w].name) : "Por definirse"}</b></div>
        <div class="list-row small"><span>🥇 Mejor récord${live ? " (hasta hoy)" : ""}</span><span class="sp"></span><b>${esc(S.teams[st[0].rid].name)} ${rec(st[0])}</b></div>
        <div class="list-row small"><span>💥 Más puntos</span><span class="sp"></span><b>${esc(S.teams[most.rid].name)} ${f1(most.pf)}</b></div>
        ${mvp ? `<div class="list-row small"><span>⭐ MVP</span><span class="sp"></span><b>${esc(mvp)}</b></div>` : ""}
        <div class="list-row small"><span>🔁 Trades</span><span class="sp"></span><b>${S.trades.length}</b></div></div>`;
    }).join("");

    // Tabla histórica por manager
    const mgr = {};
    list.forEach((S) => {
      const c = champ(S);
      S.standings.forEach((s) => {
        const t = S.teams[s.rid];
        const k = t.ownerId || t.owner;
        const m = (mgr[k] = mgr[k] || { name: t.ownersNick, W: 0, L: 0, T: 0, pf: 0, seasons: 0, titles: 0, po: 0, last: "" });
        m.W += s.W; m.L += s.L; m.T += s.T; m.pf += s.pf; m.seasons++;
        if (c && c.w === s.rid) m.titles++;
        if (S.league.status === "complete" && s.rank <= S.playoffTeams) m.po++;
        m.last = t.name; m.name = t.ownersNick;
      });
    });
    const mgrRows = Object.values(mgr).sort((a, b) => b.titles - a.titles || (b.W / Math.max(1, b.W + b.L)) - (a.W / Math.max(1, a.W + a.L)) || b.pf - a.pf).map((m, i) => `<tr><td class="num faint">${i + 1}</td><td><b>${esc(m.name)}</b><div class="to">${esc(m.last)}</div></td><td class="c">${m.titles ? "🏆".repeat(m.titles) : "—"}</td><td class="num">${m.W}-${m.L}${m.T ? "-" + m.T : ""}</td><td class="r num">${((m.W + m.T / 2) / Math.max(1, m.W + m.L + m.T) * 100).toFixed(0)}%</td><td class="r num hide-m">${f1(m.pf)}</td><td class="c hide-m">${m.seasons}</td><td class="c hide-m">${m.po}</td></tr>`).join("");

    // Récords de todos los tiempos
    const tw = [], games = [], perf = [];
    list.forEach((S) => {
      S.rids.forEach((r) => Object.values(S.tw[r]).forEach((x) => tw.push({ S, r, ...x })));
      S.records.games.forEach((g) => games.push({ S, ...g }));
      S.records.bestPerf.forEach((p) => perf.push({ S, ...p }));
    });
    const top = (arr, f, n = 5) => arr.slice().sort((a, b) => f(b) - f(a)).slice(0, n);
    const lbl = (x) => `${esc(x.S.teams[x.r].name)} <span class="faint small">${x.S.season} · sem ${x.w}</span>`;
    const glbl = (g) => { const aw = g.pa > g.pb; return `${esc(g.S.teams[aw ? g.a : g.b].name)} ${f1(Math.max(g.pa, g.pb))}–${f1(Math.min(g.pa, g.pb))} ${esc(g.S.teams[aw ? g.b : g.a].name)} <span class="faint small">${g.S.season} · sem ${g.w}</span>`; };
    const box = (t, arr, f, v) => `<div class="card"><div class="h3" style="margin-top:0;font-size:21px">${t}</div>${arr.map((x, i) => `<div class="list-row small"><span class="faint num" style="width:16px">${i + 1}</span><span>${f(x)}</span><span class="sp"></span><b class="num">${v(x)}</b></div>`).join("")}</div>`;
    const recs = `<div class="grid g3">
      ${box("Más puntos en una semana", top(tw, (x) => x.pf), lbl, (x) => f1(x.pf))}
      ${box("Menos puntos en una semana", top(tw, (x) => -x.pf), lbl, (x) => f1(x.pf))}
      ${box("Partidos con más puntos", top(games, (g) => g.pa + g.pb), glbl, (g) => f1(g.pa + g.pb))}
      ${box("Palizas", top(games, (g) => Math.abs(g.pa - g.pb)), glbl, (g) => "+" + f1(Math.abs(g.pa - g.pb)))}
      ${box("Partidos de infarto", top(games, (g) => -Math.abs(g.pa - g.pb)), glbl, (g) => f1(Math.abs(g.pa - g.pb)))}
      ${box("Más puntos y perdió", top(tw.filter((x) => x.res === "L"), (x) => x.pf), lbl, (x) => f1(x.pf))}
      ${box("Mejores actuaciones individuales", top(perf, (p) => p.pts, 6), (p) => `${UI.pl(p.S, p.pid)} <span class="faint small">${esc(p.S.teams[p.rid].name)} · ${p.S.season} sem ${p.w}</span>`, (p) => f1(p.pts))}
    </div>`;

    // Drafts
    const draftOpts = list.filter((S) => S.draft.length).map((S, i) => `<option value="${i}">${S.season}</option>`).join("");

    el.innerHTML = `<div class="h2">Historia de La Buenísima</div><p class="sub">Campeones, récords de todos los tiempos, managers y drafts. Cada temporada nueva en Sleeper se agrega sola.</p>
      <div class="grid g2"><div class="card"><div class="h3" style="margin-top:0">🏆 Salón de la fama</div>${hall || `<p class="small muted">El primer campeón se corona en la semana ${cur.totalWeeks} de ${cur.season}.</p>`}
        ${CFG.trophy ? `<p class="small"><b>Trofeo:</b> ${esc(CFG.trophy)}</p>` : ""}${CFG.punishment ? `<p class="small"><b>Castigo del último:</b> ${esc(CFG.punishment)}</p>` : ""}</div>
      <div class="grid">${seasonCards}</div></div>
      <div class="h3">Tabla histórica de managers</div>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Manager</th><th class="c">Títulos</th><th>Récord</th><th class="r">%</th><th class="r hide-m">PF</th><th class="c hide-m">Temp.</th><th class="c hide-m">Playoffs</th></tr></thead><tbody>${mgrRows}</tbody></table></div>
      <div class="h3">Récords de todos los tiempos</div>${recs}
      <div class="row"><div class="h3">Drafts</div><span class="sp"></span>${draftOpts ? `<select id="hDraft">${draftOpts}</select>` : ""}</div><div id="hDraftBox"></div>
      <div class="h3">Temporada ${cur.season}: puntos semana por semana</div><div id="hHeat"></div>`;
    const drafted = list.filter((S) => S.draft.length);
    const showDraft = (i) => { const S = drafted[i]; if (S) document.getElementById("hDraftBox").innerHTML = draftBoard(S); };
    if (drafted.length) { showDraft(0); document.getElementById("hDraft").onchange = (e) => showDraft(Number(e.target.value)); }
    document.getElementById("hHeat").innerHTML = heat(cur);
  };

  function mvpOf(S) {
    const by = {};
    S.playedWeeks.filter((w) => w <= S.regEnd).forEach((w) => S.rids.forEach((r) => { const e = S.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => (by[p] = (by[p] || 0) + (e.sp[i] || 0))); }));
    const b = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    return b ? `${S.players[b[0]] ? S.players[b[0]].name : b[0]} (${f1(b[1])})` : null;
  }

  const POSC = { QB: "#FF5C7A", RB: "#3DDC97", WR: "#5AA9FF", TE: "#F5C542", K: "#C084FC", DEF: "#A9B4C8" };
  function draftBoard(S) {
    const rounds = Math.max(...S.draft.map((p) => p.round));
    const n = S.numTeams;
    const slotTeam = {};
    S.draft.filter((p) => p.round === 1).forEach((p) => (slotTeam[((p.pick - 1) % n) + 1] = p.rid));
    let html = `<div class="tbl-wrap"><table class="draft"><thead><tr><th>R</th>${[...Array(n).keys()].map((i) => `<th>${slotTeam[i + 1] ? esc(S.teams[slotTeam[i + 1]].name.slice(0, 12)) : i + 1}</th>`).join("")}</tr></thead><tbody>`;
    for (let r = 1; r <= rounds; r++) {
      const ps = S.draft.filter((p) => p.round === r).sort((a, b) => a.pick - b.pick);
      const bySlot = {};
      ps.forEach((p) => { const idx = (p.pick - 1) % n; const slot = r % 2 ? idx + 1 : n - idx; bySlot[slot] = p; });
      html += `<tr><td class="num faint">${r}</td>${[...Array(n).keys()].map((i) => { const p = bySlot[i + 1]; if (!p) return "<td></td>"; const pl = S.players[p.pid] || { short: p.pid, pos: "?" }; return `<td style="border-left:3px solid ${POSC[pl.pos] || "#555"}"><div style="font-weight:600;font-size:12px">${esc(pl.short)}</div><div class="faint" style="font-size:10.5px">${esc(pl.pos)} · ${f1(p.pts)} pts · #${p.ptsRank}</div></td>`; }).join("")}</tr>`;
    }
    return html + `</tbody></table></div><p class="small faint">Debajo de cada jugador: puntos en la temporada y su lugar en puntos entre todos los drafteados.</p>`;
  }

  function heat(D) {
    const weeks = D.playedWeeks;
    const all = []; D.rids.forEach((r) => weeks.forEach((w) => D.tw[r][w] && all.push(D.tw[r][w].pf)));
    const mn = Math.min(...all), mx = Math.max(...all);
    const rows = D.standings.map((s) => s.rid).map((r) => `<tr class="${UI.isMine(D, r) ? "me" : ""}"><td class="sticky-col">${UI.teamCell(D, r, { sm: true, noOwner: true })}</td>${weeks.map((w) => {
      const x = D.tw[r][w]; if (!x) return "<td></td>";
      const t = (x.pf - mn) / (mx - mn || 1);
      return `<td style="background:hsla(${Math.round(t * 140)},70%,45%,${0.18 + 0.5 * Math.abs(t - 0.5)})">${f1(x.pf)}<div style="font-size:10px" class="${x.res === "W" ? "good" : "bad"}">${x.res === "W" ? "G" : x.res === "L" ? "P" : ""}</div></td>`;
    }).join("")}</tr>`).join("");
    return `<div class="tbl-wrap"><table class="heat"><thead><tr><th class="sticky-col">Equipo</th>${weeks.map((w) => `<th class="c">S${w}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
})();
