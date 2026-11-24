/* =================================================================
   LA BUENÍSIMA · sitio de la liga
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, pct, sign, rec } = UI;
  const $ = (s) => document.querySelector(s);
  const TABS = [
    ["inicio", "Inicio", "🏠"], ["power", "Power Rankings", "📊"], ["semana", "Semana", "🏈"], ["manianera", "La Mañanera", "📰"], ["playoffs", "Playoffs", "🏆"],
    ["roast", "Roast", "🔥"], ["h2h", "Cara a cara", "🥊"], ["calendarios", "Calendarios", "📅"],
    ["movimientos", "Trades y Waivers", "🔁"], ["draft", "Draft", "📋"], ["oscars", "Óscars", "🎬"], ["historia", "Historia", "📜"],
  ];
  const BNAV = ["inicio", "power", "semana", "manianera"];
  let D = null;
  const sel = { power: null, semana: null, np: null, npMode: null, bnAll: false };

  function header() {
    $("#brandLogo").outerHTML = UI.logoHTML(D);
    $("#brandSub").textContent = `Temporada ${D.season} · ${D.numTeams} equipos · Half PPR`;
    const live = $("#liveTxt"), dot = $("#liveDot");
    if (D.liveWeek) { live.textContent = `Semana ${D.liveWeek} en vivo`; dot.classList.remove("off"); }
    else { live.textContent = `Actualizado ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`; dot.classList.add("off"); }
  }
  function tabs() {
    $("#tabs").innerHTML = TABS.map(([k, l]) => `<button class="tab" data-k="${k}">${l}</button>`).join("");
    $("#tabs").onclick = (e) => { const b = e.target.closest(".tab"); if (b) location.hash = b.dataset.k; };
    const short = { inicio: "Inicio", power: "Power", semana: "Semana", manianera: "Mañanera" };
    $("#bnav").innerHTML = BNAV.map((k) => { const t = TABS.find((x) => x[0] === k); return `<button data-k="${k}"><i>${t[2]}</i>${short[k]}</button>`; }).join("") + `<button data-k="__more"><i>☰</i>Más</button>`;
    $("#bnav").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.k === "__more") $("#sheet").classList.add("on"); else location.hash = b.dataset.k; };
    $("#sheetIn").innerHTML = '<div class="grab"></div>' + TABS.filter((t) => !BNAV.includes(t[0])).map(([k, l, i]) => `<button data-k="${k}"><span>${i}</span>${l}</button>`).join("");
    $("#sheetIn").onclick = (e) => { const b = e.target.closest("button"); if (b) { $("#sheet").classList.remove("on"); location.hash = b.dataset.k; } };
  }
  function show() {
    const k = (location.hash || "#inicio").slice(1);
    const key = TABS.some((t) => t[0] === k) ? k : "inicio";
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.k === key));
    document.querySelectorAll("#bnav button").forEach((b) => b.classList.toggle("on", b.dataset.k === key || (b.dataset.k === "__more" && !BNAV.includes(key))));
    document.querySelectorAll(".sec").forEach((s) => s.classList.toggle("on", s.id === "s-" + key));
    window.scrollTo(0, 0);
  }

  /* ============ INICIO ============ */
  function renderInicio() {
    const st = D.standings, sim = D.sim.out;
    const w = Math.min(D.lastScored, D.regEnd);
    const byPF = st.slice().sort((a, b) => b.pf - a.pf)[0];
    const byEff = st.slice().sort((a, b) => b.eff - a.eff)[0];
    const lucky = st.slice().sort((a, b) => b.luck - a.luck)[0];
    const unlucky = st.slice().sort((a, b) => a.luck - b.luck)[0];
    const kpi = (l, v, d) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
    const rows = st.map((s) => {
      const o = sim[s.rid];
      return `<tr class="${UI.isMine(D, s.rid) ? "me" : ""}">
        <td class="num">${s.rank}</td><td class="sticky-col">${UI.teamCell(D, s.rid, { sm: true })}</td>
        <td class="num">${rec(s)}</td><td class="r num">${f1(s.pf)}</td><td class="r num hide-m">${f1(s.pa)}</td>
        <td class="r num hide-m">${f1(s.max)}</td><td class="r num">${pct(s.eff, 1)}</td>
        <td class="num hide-m">${s.apW}-${s.apL}</td><td class="r num ${s.luck > 0.5 ? "good" : s.luck < -0.5 ? "bad" : ""}">${sign(s.luck)}</td>
        <td class="c">${s.streak}</td><td class="r num">${D.sim.remaining.length ? pct(o.playoff) : s.rank <= D.playoffTeams ? "✔" : "✘"}</td></tr>`;
    }).join("");
    $("#s-inicio").innerHTML = installHTML() + breakingHTML() + `
      <div class="row"><div><div class="h2">Tabla general</div><p class="sub">Después de la semana ${w} · Top ${D.playoffTeams} a playoffs (semana ${D.regEnd + 1})</p></div><span class="sp"></span>
      <button class="btn" id="imgStand">🖼️ Imagen</button></div>
      <div class="kpis" style="margin-bottom:14px">
        ${kpi("Líder", esc(D.teams[st[0].rid].name), rec(st[0]) + " · " + esc(D.teams[st[0].rid].ownersNick))}
        ${kpi("Más puntos", f1(byPF.pf), esc(D.teams[byPF.rid].name))}
        ${kpi("Mejor lineup", pct(byEff.eff, 1), esc(D.teams[byEff.rid].name) + " · de su máximo")}
        ${kpi("Más suertudo", sign(lucky.luck), esc(D.teams[lucky.rid].name) + " · victorias vs esperado")}
        ${kpi("Más salado", sign(unlucky.luck), esc(D.teams[unlucky.rid].name))}
      </div>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th class="sticky-col">Equipo</th><th>Récord</th><th class="r">PF</th><th class="r hide-m">PC</th><th class="r hide-m">Máx</th><th class="r">Efic.</th><th class="hide-m">All-play</th><th class="r">Suerte</th><th class="c">Racha</th><th class="r">Playoffs</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="small faint">PF: puntos a favor · PC: en contra · Máx: lo que hubiera sumado con el lineup perfecto · All-play: récord si jugara contra todos cada semana · Suerte: victorias reales menos las esperadas por puntos.</p>
      ${D.sim.remaining.length ? renderOdds() : ""}
      ${topScorersHTML()}`;
    bindBreaking();
    const ts = $("#imgTop"); if (ts) ts.onclick = () => UI.makeImage(cardTop(), `mas-puntos-por-semana`);
    $("#imgStand").onclick = () => UI.makeImage(cardStandings(), `tabla-semana-${w}`);
    const ib = $("#imgOdds"); if (ib) ib.onclick = () => UI.makeImage(cardOdds(), `playoffs-semana-${w}`);
  }
  function renderOdds() {
    const sim = D.sim.out;
    const ord = D.rids.slice().sort((a, b) => sim[b].playoff - sim[a].playoff || sim[b].wins - sim[a].wins);
    const rows = ord.map((r) => {
      const o = sim[r];
      return `<tr class="${UI.isMine(D, r) ? "me" : ""}"><td class="sticky-col">${UI.teamCell(D, r, { sm: true })}</td><td class="r num hide-m">${f1(o.wins)}</td>
      <td class="r num"><b>${pct(o.playoff)}</b></td><td class="r num">${pct(o.bye)}</td><td class="r num hide-m">${pct(o.first)}</td><td class="r num ${o.last > 0.25 ? "bad" : ""}">${pct(o.last)}</td></tr>`;
    }).join("");
    return `<div class="row" style="margin-top:20px"><div><div class="h3" style="margin:0">Probabilidades de playoffs</div><p class="sub" style="margin:4px 0 10px">${D.sim.N.toLocaleString()} simulaciones de las semanas ${D.lastScored + 1}–${D.regEnd} con el calendario real</p></div><span class="sp"></span><button class="btn" id="imgOdds">🖼️ Imagen</button></div>
      <div class="tbl-wrap"><table><thead><tr><th class="sticky-col">Equipo</th><th class="r hide-m">Victorias proy.</th><th class="r">Playoffs</th><th class="r">Bye</th><th class="r hide-m">#1</th><th class="r">Último</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function cardStandings() {
    const w = Math.min(D.lastScored, D.regEnd);
    const body = D.standings.map((s) => `<div class="ic-row" style="padding:10px 22px"><div class="ic-rk" style="font-size:46px">${s.rank}</div>
      <div><div class="ic-name">${esc(D.teams[s.rid].name)}</div><div class="ic-meta">${esc(D.teams[s.rid].ownersNick)} · ${f1(s.pf)} PF · racha ${s.streak}</div></div>
      <div class="ic-score" style="color:${s.rank <= D.playoffTeams ? "#5E8C61" : "#2E2C29"}">${rec(s)}</div></div>`).join("");
    return UI.icFrame(D, `Semana ${w}`, "Tabla general", body);
  }
  function cardOdds() {
    const sim = D.sim.out;
    const ord = D.rids.slice().sort((a, b) => sim[b].playoff - sim[a].playoff);
    const body = ord.map((r, i) => `<div class="ic-row" style="padding:10px 22px"><div class="ic-rk" style="font-size:42px">${i + 1}</div>
      <div><div class="ic-name">${esc(D.teams[r].name)}</div><div class="ic-meta">Bye ${pct(sim[r].bye)} · #1 ${pct(sim[r].first)} · Último ${pct(sim[r].last)}</div></div>
      <div class="ic-score" style="color:${sim[r].playoff > 0.5 ? "#5E8C61" : "#E85A4F"}">${pct(sim[r].playoff)}</div></div>`).join("");
    return UI.icFrame(D, "Probabilidades", "¿Quién entra a playoffs?", body);
  }


  /* ---- Instalar como app ---- */
  function installHTML() {
    let off = false; try { off = localStorage.getItem("lb-install-off") === "1"; } catch (e) {}
    const standalone = window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    if (off || standalone || !/iPhone|iPad|Android/i.test(navigator.userAgent)) return "";
    const ios = /iPhone|iPad/i.test(navigator.userAgent);
    return `<div class="card" id="instBox" style="display:flex;gap:12px;align-items:center;margin-bottom:14px">${UI.logoHTML(D)}<div class="small" style="flex:1"><b>Tenlo como app</b><br>${ios ? "En Safari toca Compartir ⬆️ y luego “Agregar a inicio”." : "Abre el menú ⋮ y toca “Agregar a pantalla principal”."}</div><button class="btn" onclick="try{localStorage.setItem('lb-install-off','1')}catch(e){};document.getElementById('instBox').remove()">✕</button></div>`;
  }
  /* ---- Breaking News ---- */
  function breakingHTML() {
    const all = LB.stories.breaking(D);
    const list = sel.bnAll ? all : all.slice(0, 5);
    if (!list.length) return "";
    return `<div class="row"><div><div class="h2" style="color:var(--bad)">🚨 Breaking News</div><p class="sub">Lo más fuerte que ha pasado en la liga. Toca 🗞️ para la portada.</p></div></div>
      <div class="grid" style="gap:8px">${list.map((e, i) => `<div class="bn"><div class="bn-art">${LB.art.toImg(LB.art.iconFor(e.type), 52, 52)}</div><div style="min-width:0"><div class="bn-w" style="text-align:left;font-size:12px;letter-spacing:.1em">SEMANA ${e.week}</div><div class="bn-k">${esc(e.kicker)}</div><div class="bn-h">${esc(e.headline)}</div><div class="bn-s">${esc(e.sub)}</div></div><button class="btn" data-bn="${i}" style="padding:7px 10px">🗞️</button></div>`).join("")}</div>
      ${all.length > 5 ? `<div style="text-align:center;margin-top:8px"><button class="btn" id="bnMore">${sel.bnAll ? "Ver menos" : `Ver todas (${all.length})`}</button></div>` : ""}<div style="height:10px"></div>`;
  }
  function bindBreaking() {
    const all = LB.stories.breaking(D);
    const list = sel.bnAll ? all : all.slice(0, 5);
    document.querySelectorAll("[data-bn]").forEach((b) => (b.onclick = () => { const e = list[Number(b.dataset.bn)]; UI.makeImage(LB.np.breaking(D, e), `breaking-${slug(e.headline)}`); }));
    const m = $("#bnMore"); if (m) m.onclick = () => { sel.bnAll = !sel.bnAll; renderInicio(); };
  }
  /* ---- Equipo con más puntos por semana ---- */
  function topScorersHTML() {
    const R = D.records;
    const rows = R.weeklyTop.slice().reverse().map((x) => {
      const second = D.rids.filter((r) => r !== x.rid && D.tw[r][x.w]).map((r) => D.tw[r][x.w].pf).sort((a, b) => b - a)[0];
      return `<tr><td class="num">S${x.w}</td><td>${UI.teamCell(D, x.rid, { sm: true })}</td><td class="r num"><b>${f1(x.pts)}</b></td><td class="r num faint">+${f1(x.pts - (second || 0))}</td><td class="c">${D.tw[x.rid][x.w].res === "W" ? '<span class="good">G</span>' : '<span class="bad">P</span>'}</td></tr>`;
    }).join("");
    const counts = D.rids.filter((r) => R.weeklyTopCount[r]).sort((a, b) => R.weeklyTopCount[b] - R.weeklyTopCount[a]).map((r) => `<span class="chip">${esc(D.teams[r].name)} <b>×${R.weeklyTopCount[r]}</b></span>`).join("");
    return `<div class="row" style="margin-top:20px"><div><div class="h3" style="margin:0">👑 El que más metió cada semana</div><p class="sub" style="margin:4px 0 10px">Equipo con más puntos de cada jornada y su ventaja sobre el segundo.</p></div><span class="sp"></span><button class="btn" id="imgTop">🖼️ Imagen</button></div>
      <div class="chips" style="margin-bottom:10px">${counts}</div>
      <div class="tbl-wrap"><table><thead><tr><th>Sem</th><th>Equipo</th><th class="r">Pts</th><th class="r">Ventaja</th><th class="c">Res</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function cardTop() {
    const R = D.records;
    const body = R.weeklyTop.map((x) => `<div class="ic-row" style="padding:8px 22px;grid-template-columns:90px 1fr auto"><div class="ic-rk" style="font-size:40px">S${x.w}</div><div><div class="ic-name" style="font-size:27px">${esc(D.teams[x.rid].name)}</div></div><div class="ic-score" style="font-size:40px">${f1(x.pts)}</div></div>`).join("");
    return UI.icFrame(D, "Temporada " + D.season, "El que más metió", body);
  }

  /* ============ LA MAÑANERA ============ */
  function renderManianera() {
    const played = D.playedWeeks.slice();
    const future = Object.keys(D.games).map(Number).filter((w) => w > D.lastScored && D.games[w].length);
    const mode = sel.npMode || (future.includes(D.projWeek) ? "preview" : "results");
    const weeks = mode === "preview" ? future : played;
    let w = sel.np && weeks.includes(sel.np) ? sel.np : mode === "preview" ? (future.includes(D.projWeek) ? D.projWeek : future[0]) : played[played.length - 1];
    $("#s-manianera").innerHTML = `<div class="row"><div><div class="h2">La Mañanera</div><p class="sub">El periódico oficial de La Buenísima, listo para mandarlo al chat.</p></div></div>
      <div class="row" style="margin-bottom:12px"><button class="btn ${mode === "preview" ? "pri" : ""}" id="npPrev" ${future.length ? "" : "disabled"}>📰 Preview</button><button class="btn ${mode === "results" ? "pri" : ""}" id="npRes" ${played.length ? "" : "disabled"}>🏁 Resultados</button>
      <select id="npWeek">${weeks.map((x) => `<option value="${x}" ${x === w ? "selected" : ""}>Semana ${x}</option>`).join("")}</select><span class="sp"></span><button class="btn pri" id="npImg">🖼️ Generar imagen</button></div>
      ${mode === "preview" && w !== D.projWeek ? '<p class="note">Para semanas futuras no hay proyecciones todavía: se usan promedios de temporada.</p>' : ""}
      <div id="npBox"></div>`;
    const html = w ? (mode === "preview" ? LB.np.preview(D, w) : LB.np.results(D, w)) : "";
    if (html) LB.np.mount($("#npBox"), html);
    $("#npPrev").onclick = () => { sel.npMode = "preview"; sel.np = null; renderManianera(); };
    $("#npRes").onclick = () => { sel.npMode = "results"; sel.np = null; renderManianera(); };
    $("#npWeek").onchange = (e) => { sel.np = Number(e.target.value); renderManianera(); };
    $("#npImg").onclick = () => UI.makeImage(html, `la-mananera-${mode === "preview" ? "preview" : "resultados"}-semana-${w}`);
  }

  /* ============ POWER RANKINGS ============ */
  function renderPower() {
    const w = sel.power || Math.min(D.lastScored, D.totalWeeks);
    const regW = Math.min(w, D.regEnd);
    const rows = D.powerAt(regW);
    const opts = D.regWeeksPlayed.map((x) => `<option value="${x}" ${x === regW ? "selected" : ""}>Semana ${x}</option>`).join("");
    const cards = rows.map((r) => {
      const g = D.grades[r.rid];
      const d = r.delta;
      return `<div class="card pr ${UI.isMine(D, r.rid) ? "me" : ""}">
        <div><div class="pr-rank">${r.prank}</div><div class="delta ${d > 0 ? "good" : d < 0 ? "bad" : "faint"}">${d > 0 ? "▲" + d : d < 0 ? "▼" + -d : "—"}</div></div>
        <div style="min-width:0">
          <div class="row" style="flex-wrap:nowrap">${UI.teamCell(D, r.rid)}<span class="sp"></span><div class="pill y num" title="Power score">${f1(r.score)}</div></div>
          <div class="bar"><i style="width:${Math.max(4, r.score)}%"></i></div>
          <div class="stats"><span>Récord <b>${rec(r)}</b></span><span>PPG <b>${f1(r.ppg)}</b></span><span>Últ. 3 <b>${f1(r.last3)}</b></span><span>All-play <b>${pct(r.apPct)}</b></span><span>Efic. <b>${pct(r.eff, 1)}</b></span><span>Suerte <b class="${r.luck > 0.5 ? "good" : r.luck < -0.5 ? "bad" : ""}">${sign(r.luck)}</b></span></div>
          <p class="blurb">${esc(UI.powerBlurb(D, r, regW, rows.length))}</p>
          ${regW === Math.min(D.lastScored, D.regEnd) ? `<div class="chips"><span class="chip">Draft <b>${g.draft.grade}</b></span><span class="chip">Waivers <b>${g.waivers.grade}</b></span><span class="chip">Trades <b>${g.trades.grade}</b></span><span class="chip">Lineups <b>${g.lineups.grade}</b></span></div>` : ""}
        </div></div>`;
    }).join("");
    $("#s-power").innerHTML = `
      <div class="row"><div><div class="h2">Power Rankings</div><p class="sub">No es la tabla: es quién está jugando mejor de verdad.</p></div><span class="sp"></span>
      <select id="pwWeek">${opts}</select><button class="btn" id="imgPower">🖼️ Imagen</button></div>
      <details class="card tight" style="margin-bottom:12px"><summary class="small muted" style="cursor:pointer">¿Cómo se calcula?</summary>
        <p class="small muted">Power score de 0 a 100: <b>30%</b> puntos por partido · <b>25%</b> récord all-play (contra todos, cada semana) · <b>20%</b> forma de las últimas 3 semanas · <b>15%</b> récord real · <b>10%</b> eficiencia de lineup (puntos hechos ÷ máximo posible). Las calificaciones de Draft, Waivers, Trades y Lineups comparan a los ${D.numTeams} equipos: puntos como titular de sus picks del draft, puntos como titular de sus altas por waiver/agente libre, puntos netos ganados en trades y eficiencia de lineup.</p></details>
      <div class="grid">${cards}</div>`;
    $("#pwWeek").onchange = (e) => { sel.power = Number(e.target.value); renderPower(); };
    $("#imgPower").onclick = () => UI.makeImage(cardPower(rows, regW), `power-rankings-semana-${regW}`);
  }
  function cardPower(rows, w) {
    const body = rows.map((r) => {
      const d = r.delta;
      const sents = UI.powerBlurb(D, r, w, rows.length).split(/(?<=\.)\s+/).filter((x) => !/^Playoffs/.test(x));
      const short = sents[1] || sents[0] || "";
      return `<div class="ic-row" style="grid-template-columns:70px 1fr auto;padding:10px 22px">
        <div style="text-align:center"><div class="ic-rk" style="font-size:50px">${r.prank}</div><div style="font-size:18px;font-weight:800;color:${d > 0 ? "#5E8C61" : d < 0 ? "#E85A4F" : "#8E8D8A"}">${d > 0 ? "▲" + d : d < 0 ? "▼" + -d : "—"}</div></div>
        <div><div class="ic-name">${esc(D.teams[r.rid].name)} <span style="font-size:22px;color:#6E6C68;font-weight:600">${rec(r)}</span></div><div class="ic-meta">${esc(short)}</div></div>
        <div class="ic-score">${f1(r.score)}</div></div>`;
    }).join("");
    return UI.icFrame(D, `Semana ${w}`, "Power Rankings", body);
  }

  /* ============ SEMANA: review y preview ============ */
  function renderSemana() {
    const avail = Object.keys(D.games).map(Number).filter((w) => D.games[w].length);
    const def = Math.min(D.curWeek, D.totalWeeks);
    const w = sel.semana || (avail.includes(def) ? def : avail[avail.length - 1]);
    const opts = avail.map((x) => `<option value="${x}" ${x === w ? "selected" : ""}>Semana ${x}${x > D.regEnd ? " (playoffs)" : ""}${x === D.liveWeek ? " · en vivo" : x <= D.lastScored ? "" : x === D.projWeek ? " · próxima" : ""}</option>`).join("");
    const played = w <= D.lastScored;
    const canProject = w === D.projWeek;
    const mus = D.games[w].map((g) => LB.matchupInfo(D, w, g));
    const cards = mus.map((M, i) => muCard(M, i)).join("");
    let note = "";
    if (!played && !canProject) note = `<p class="note">Las proyecciones de Sleeper solo están disponibles para la semana ${D.projWeek}. Aquí se comparan promedios de temporada.</p>`;
    $("#s-semana").innerHTML = `
      <div class="row"><div><div class="h2">${played ? "Review" : D.liveWeek === w ? "En vivo" : "Preview"} · Semana ${w}</div><p class="sub">${played ? "Cómo quedó cada partido y quién la regó." : "Lo que viene: favoritos, proyecciones y jugadores clave."}</p></div><span class="sp"></span><select id="wkSel">${opts}</select></div>
      ${note}
      ${played ? awards(w) : ""}
      <div class="grid g2" style="margin-top:12px">${cards}</div>`;
    $("#wkSel").onchange = (e) => { sel.semana = Number(e.target.value); renderSemana(); };
    mus.forEach((M, i) => { const b = document.getElementById("muImg" + i); if (b) b.onclick = () => UI.makeImage(cardMatchup(M), `semana-${w}-${slug(UI.tName(D, M.g.a))}-vs-${slug(UI.tName(D, M.g.b))}`); });
    const ab = $("#imgAwards"); if (ab) ab.onclick = () => UI.makeImage(cardAwards(w), `premios-semana-${w}`);
    const allB = $("#imgAll"); if (allB) allB.onclick = () => UI.makeImage(cardAllMatchups(mus), `semana-${w}-resumen`);
  }
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
  function muCard(M, i) {
    const D_ = D;
    const showPts = M.played || M.live;
    const sA = showPts ? f1(M.ta ? M.ta.pf : M.ea.pts) : M.pa != null ? f1(M.pa) : f1(M.sa.ppg);
    const sB = showPts ? f1(M.tb ? M.tb.pf : M.eb.pts) : M.pb != null ? f1(M.pb) : f1(M.sb.ppg);
    const aWin = showPts && Number(sA) > Number(sB), bWin = showPts && Number(sB) > Number(sA);
    const label = M.played ? "Final" : M.live ? "En vivo" : M.pa != null ? "Proyectado" : "Promedio";
    const side = (rid, s, win, st) => `<div class="mu-side ${win ? "winner" : ""}">${UI.avatar(D_.teams[rid])}<div class="tn" style="max-width:100%">${esc(D_.teams[rid].name)}</div><div class="to">${st && st.W != null ? rec(st) : ""} · ${esc(D_.teams[rid].ownersNick)}</div><div class="mu-score num">${s}</div></div>`;
    const wpA = M.winA == null ? 0.5 : M.winA;
    const by = showPts ? "pts" : "proj";
    const lst = (arr) => arr.slice(0, 4).map((p) => `<div><span>${UI.pl(D_, p.pid)}</span><b class="num">${f1(p[by])}</b></div>`).join("");
    const txt = M.played ? UI.recapText(D_, M) : UI.previewText(D_, M);
    let extra = "";
    if (M.played) {
      extra = `<div class="stats" style="margin-top:8px"><span>Máximo posible: <b>${f1(M.ta.max)}</b> vs <b>${f1(M.tb.max)}</b></span><span>Pts en banca: <b>${f1(M.ta.max - M.ta.pf)}</b> vs <b>${f1(M.tb.max - M.tb.pf)}</b></span></div>`;
    }
    return `<div class="card mu">
      <div class="row" style="padding:10px 14px 0"><span class="tag">${label}</span>${UI.rivals(D_, M.g.a, M.g.b) ? '<span class="tag" style="color:var(--bad)">🔥 Rivalidad</span>' : ""}<span class="sp"></span><button class="btn" style="padding:5px 10px;font-size:12.5px" id="muImg${i}">🖼️</button></div>
      <div class="mu-head">${side(M.g.a, sA, aWin, M.sa)}<div class="mu-vs">VS</div>${side(M.g.b, sB, bWin, M.sb)}</div>
      ${!M.played ? `<div style="padding:0 14px 12px"><div class="row small muted" style="margin-bottom:4px"><span>${pct(wpA)}</span><span class="sp"></span><span>Prob. de ganar</span><span class="sp"></span><span>${pct(1 - wpA)}</span></div><div class="wp"><i style="width:${wpA * 100}%"></i></div></div>` : ""}
      <div class="mu-body"><p style="margin:0;font-size:14px">${esc(txt)}</p>
        <div class="plist"><div style="display:block">${lst(M.topA)}</div><div style="display:block">${lst(M.topB)}</div></div>${extra}</div></div>`;
  }
  function weekAwards(w) {
    const tws = D.rids.map((r) => ({ rid: r, ...D.tw[r][w] })).filter((x) => x.pf != null);
    const top = tws.slice().sort((a, b) => b.pf - a.pf)[0];
    const low = tws.slice().sort((a, b) => a.pf - b.pf)[0];
    const bench = tws.slice().sort((a, b) => b.max - b.pf - (a.max - a.pf))[0];
    const eff = tws.slice().sort((a, b) => b.pf / b.max - a.pf / a.max)[0];
    const gs = D.games[w].map((g) => ({ ...g, pa: D.tw[g.a][w].pf, pb: D.tw[g.b][w].pf }));
    const blow = gs.slice().sort((a, b) => Math.abs(b.pa - b.pb) - Math.abs(a.pa - a.pb))[0];
    const close = gs.slice().sort((a, b) => Math.abs(a.pa - a.pb) - Math.abs(b.pa - b.pb))[0];
    const robbed = tws.filter((x) => x.res === "W").sort((a, b) => a.pf - b.pf)[0];
    const sad = tws.filter((x) => x.res === "L").sort((a, b) => b.pf - a.pf)[0];
    let mvp = null;
    D.rids.forEach((r) => { const e = D.weeks[w][r]; e.starters.forEach((p, i) => { const pts = e.sp[i] || 0; if (!mvp || pts > mvp.pts) mvp = { pid: p, pts, rid: r }; }); });
    return { top, low, bench, eff, blow, close, robbed, sad, mvp };
  }
  function awards(w) {
    const A = weekAwards(w);
    const it = (ic, t, who, d) => `<div class="kpi"><div class="l">${ic} ${t}</div><div class="v" style="font-size:22px;line-height:1.15;margin:3px 0">${who}</div><div class="d">${d}</div></div>`;
    const gn = (g) => `${esc(UI.tName(D, g.pa > g.pb ? g.a : g.b))} ${f1(Math.max(g.pa, g.pb))}–${f1(Math.min(g.pa, g.pb))}`;
    return `<div class="row" style="margin-top:6px"><div class="h3" style="margin:6px 0">🏆 Premios de la semana</div><span class="sp"></span><button class="btn" id="imgAwards">🖼️ Premios</button><button class="btn" id="imgAll">🖼️ Resultados</button></div>
      <div class="kpis">
        ${it("👑", "Equipo de la semana", esc(UI.tName(D, A.top.rid)), f1(A.top.pf) + " pts")}
        ${it("⭐", "MVP", UI.pl(D, A.mvp.pid), f1(A.mvp.pts) + " pts · " + esc(UI.tName(D, A.mvp.rid)))}
        ${it("🧠", "Lineup perfecto", esc(UI.tName(D, A.eff.rid)), pct(A.eff.pf / A.eff.max, 1) + " de su máximo")}
        ${it("🪑", "Banca de oro", esc(UI.tName(D, A.bench.rid)), f1(A.bench.max - A.bench.pf) + " pts sin usar")}
        ${it("💩", "Peor equipo", esc(UI.tName(D, A.low.rid)), f1(A.low.pf) + " pts")}
        ${it("💥", "Paliza", gn(A.blow), "Diferencia " + f1(Math.abs(A.blow.pa - A.blow.pb)))}
        ${it("😱", "Infarto", gn(A.close), "Diferencia " + f1(Math.abs(A.close.pa - A.close.pb)))}
        ${A.robbed ? it("🍀", "Robo", esc(UI.tName(D, A.robbed.rid)), "Ganó con solo " + f1(A.robbed.pf)) : ""}
        ${A.sad ? it("😭", "Mala suerte", esc(UI.tName(D, A.sad.rid)), "Perdió con " + f1(A.sad.pf)) : ""}
      </div>`;
  }
  function cardAwards(w) {
    const A = weekAwards(w);
    const row = (ic, t, who, d) => `<div class="ic-row" style="grid-template-columns:70px 1fr auto"><div style="font-size:48px;text-align:center">${ic}</div><div><div class="ic-meta" style="text-transform:uppercase;letter-spacing:2px;color:#E85A4F;font-weight:700;font-size:18px">${t}</div><div class="ic-name">${esc(who)}</div></div><div class="ic-score" style="font-size:36px">${esc(d)}</div></div>`;
    const gw = (g) => UI.tName(D, g.pa > g.pb ? g.a : g.b) + " vs " + UI.tName(D, g.pa > g.pb ? g.b : g.a);
    const body = [
      row("👑", "Equipo de la semana", UI.tName(D, A.top.rid), f1(A.top.pf)),
      row("⭐", "MVP", `${UI.plName(D, A.mvp.pid)} (${UI.tName(D, A.mvp.rid)})`, f1(A.mvp.pts)),
      row("🧠", "Lineup perfecto", UI.tName(D, A.eff.rid), pct(A.eff.pf / A.eff.max)),
      row("🪑", "Banca de oro", UI.tName(D, A.bench.rid), f1(A.bench.max - A.bench.pf)),
      row("💩", "Peor equipo", UI.tName(D, A.low.rid), f1(A.low.pf)),
      row("💥", "Paliza", gw(A.blow), "+" + f1(Math.abs(A.blow.pa - A.blow.pb))),
      row("😱", "Infarto", gw(A.close), "+" + f1(Math.abs(A.close.pa - A.close.pb))),
      A.robbed ? row("🍀", "Robo", UI.tName(D, A.robbed.rid), f1(A.robbed.pf)) : "",
    ].join("");
    return UI.icFrame(D, `Semana ${w}`, "Premios de la semana", body);
  }
  function cardMatchup(M) {
    const showPts = M.played || M.live;
    const sA = showPts ? M.ea.pts : M.pa != null ? M.pa : M.sa.ppg, sB = showPts ? M.eb.pts : M.pb != null ? M.pb : M.sb.ppg;
    const by = showPts ? "pts" : "proj";
    const side = (rid, s, st, top, win) => `<div style="flex:1;text-align:center;background:#F6F4EE;border:1px solid #DCD4C4;border-radius:22px;padding:24px 16px">
      <div style="width:110px;height:110px;border-radius:50%;margin:0 auto 12px;background:${UI.color(rid)};display:grid;place-items:center;font-size:44px;font-weight:800;color:#111">${esc(D.teams[rid].name.slice(0, 2).toUpperCase())}</div>
      <div class="ic-name" style="font-size:32px">${esc(D.teams[rid].name)}</div><div class="ic-meta">${st && st.W != null ? rec(st) : ""} · ${esc(D.teams[rid].ownersNick)}</div>
      <div style="font-family:var(--fh);font-size:110px;line-height:1;margin-top:10px;color:${win ? "#5E8C61" : "#2E2C29"}">${f1(s)}</div>
      <div style="margin-top:12px;text-align:left">${top.slice(0, 3).map((p) => `<div style="display:flex;justify-content:space-between;font-size:22px;padding:4px 0;color:#6E6C68"><span>${esc(UI.plName(D, p.pid))}</span><b style="color:#2E2C29">${f1(p[by])}</b></div>`).join("")}</div></div>`;
    const txt = M.played ? UI.recapText(D, M) : UI.previewText(D, M);
    const wp = M.winA == null ? 0.5 : M.winA;
    const body = `<div style="display:flex;gap:18px;align-items:stretch">${side(M.g.a, sA, M.sa, M.topA, showPts && sA > sB)}<div style="align-self:center;font-family:var(--fh);font-size:50px;color:#8E8D8A">VS</div>${side(M.g.b, sB, M.sb, M.topB, showPts && sB > sA)}</div>
      ${!M.played ? `<div style="margin-top:22px"><div style="display:flex;justify-content:space-between;font-size:24px;font-weight:700"><span style="color:#5E8C61">${pct(wp)}</span><span style="color:#6E6C68">Probabilidad de ganar</span><span style="color:#E85A4F">${pct(1 - wp)}</span></div><div style="height:16px;border-radius:12px;background:#E85A4F;overflow:hidden;margin-top:8px"><div style="height:100%;width:${wp * 100}%;background:#5E8C61"></div></div></div>` : ""}
      <div style="margin-top:22px;font-size:27px;line-height:1.4;color:#2E2C29;background:#F6F4EE;border-left:6px solid #E85A4F;padding:18px 22px;border-radius:0 16px 16px 0">${esc(txt)}</div>`;
    return UI.icFrame(D, `Semana ${M.w} · ${M.played ? "Review" : "Preview"}`, M.played ? "Así quedó" : "Lo que viene", body);
  }
  function cardAllMatchups(mus) {
    const body = mus.map((M) => {
      const a = M.ea.pts, b = M.eb.pts;
      return `<div class="ic-row" style="grid-template-columns:1fr auto 1fr;padding:18px 24px">
        <div><div class="ic-name" style="color:${a > b ? "#5E8C61" : "#2E2C29"}">${esc(UI.tName(D, M.g.a))}</div><div class="ic-meta">${esc(UI.oName(D, M.g.a))}</div></div>
        <div style="font-family:var(--fh);font-size:52px;text-align:center"><span style="color:${a > b ? "#5E8C61" : "#2E2C29"}">${f1(a)}</span> <span style="color:#8E8D8A">–</span> <span style="color:${b > a ? "#5E8C61" : "#2E2C29"}">${f1(b)}</span></div>
        <div style="text-align:right"><div class="ic-name" style="color:${b > a ? "#5E8C61" : "#2E2C29"}">${esc(UI.tName(D, M.g.b))}</div><div class="ic-meta">${esc(UI.oName(D, M.g.b))}</div></div></div>`;
    }).join("");
    return UI.icFrame(D, `Semana ${mus[0].w}`, "Resultados", body);
  }

  /* ============ CALENDARIOS ============ */
  function renderCalendarios() {
    const { M, summary, hardness } = D.scheduleMatrix;
    const ord = D.standings.map((s) => s.rid);
    const head = ord.map((j) => `<th class="c" title="${esc(D.teams[j].name)}">${UI.avatar(D.teams[j], "sm")}</th>`).join("");
    const body = ord.map((i) => {
      const cells = ord.map((j) => {
        const x = M[i][j], act = M[i][i];
        const diff = x.W - act.W;
        const bg = i === j ? "rgba(216,195,165,.55)" : diff > 0 ? `rgba(94,140,97,${Math.min(0.45, 0.1 * diff)})` : diff < 0 ? `rgba(232,90,79,${Math.min(0.45, -0.1 * diff)})` : "transparent";
        return `<td class="c num" style="background:${bg}">${x.W}-${x.L}${x.T ? "-" + x.T : ""}</td>`;
      }).join("");
      return `<tr class="${UI.isMine(D, i) ? "me" : ""}"><td class="sticky-col">${UI.teamCell(D, i, { sm: true, noOwner: true })}</td>${cells}</tr>`;
    }).join("");
    const sum = summary.slice().sort((a, b) => (b.best.W - b.actual.W) - (a.best.W - a.actual.W)).map((s) => `<div class="list-row">${UI.teamCell(D, s.rid, { sm: true })}<span class="sp"></span>
      <div class="small" style="text-align:right">Real <b>${s.actual.W}-${s.actual.L}</b> · Mejor <b class="good">${s.best.W}-${s.best.L}</b> <span class="faint">(cal. de ${esc(UI.tName(D, s.best.j))})</span><br>Peor <b class="bad">${s.worst.W}-${s.worst.L}</b> <span class="faint">(cal. de ${esc(UI.tName(D, s.worst.j))})</span> · Promedio <b>${f1(s.avgW)}</b> V</div></div>`).join("");
    const hard = hardness.slice().sort((a, b) => a.givesAvgW - b.givesAvgW);
    $("#s-calendarios").innerHTML = `
      <div class="row"><div><div class="h2">¿Y si tuvieras otro calendario?</div><p class="sub">Cada fila es un equipo con sus puntos reales; cada columna es el calendario de otro equipo. Verde = le hubiera ido mejor, rojo = peor. La diagonal es su récord real.</p></div><span class="sp"></span><button class="btn" id="imgCal">🖼️ Imagen</button></div>
      <div class="tbl-wrap"><table class="heat"><thead><tr><th class="sticky-col">Equipo ↓ / Calendario →</th>${head}</tr></thead><tbody>${body}</tbody></table></div>
      <div class="grid g2" style="margin-top:16px">
        <div class="card"><div class="h3" style="margin-top:0">Lo mejor y lo peor posible</div>${sum}</div>
        <div class="card"><div class="h3" style="margin-top:0">Calendarios más duros</div>
          <p class="small muted">Victorias promedio que tendrían los demás equipos con este calendario. Menos = más difícil.</p>
          ${hard.map((h, k) => `<div class="list-row"><span class="num faint" style="width:18px">${k + 1}</span>${UI.teamCell(D, h.rid, { sm: true })}<span class="sp"></span><b class="num">${f1(h.givesAvgW)} V</b></div>`).join("")}</div></div>`;
    $("#imgCal").onclick = () => UI.makeImage(cardCal(ord), `calendarios-semana-${D.lastScored}`);
  }
  function cardCal(ord) {
    const { M } = D.scheduleMatrix;
    const head = ord.map((j) => `<th style="padding:6px 2px;font-size:15px;color:#6E6C68;width:78px">${esc(D.teams[j].name.slice(0, 7))}</th>`).join("");
    const body = ord.map((i) => `<tr><td style="padding:8px 8px;font-size:19px;font-weight:700;white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis">${esc(D.teams[i].name.slice(0, 14))}</td>${ord.map((j) => {
      const x = M[i][j], d = x.W - M[i][i].W;
      const bg = i === j ? "rgba(216,195,165,.7)" : d > 0 ? `rgba(94,140,97,${Math.min(0.55, 0.13 * d)})` : d < 0 ? `rgba(232,90,79,${Math.min(0.55, -0.13 * d)})` : "transparent";
      return `<td style="text-align:center;font-size:20px;padding:8px 2px;background:${bg};font-weight:700">${x.W}-${x.L}</td>`;
    }).join("")}</tr>`).join("");
    return UI.icFrame(D, "Calendarios alternos", "¿Y si…?", `<table style="width:100%;border-collapse:collapse;background:#F6F4EE;border-radius:16px;overflow:hidden"><thead><tr><th style="text-align:left;padding:8px;font-size:15px;color:#8E8D8A">Equipo ↓ / Calendario de →</th>${head}</tr></thead><tbody>${body}</tbody></table>`);
  }

  /* ============ MOVIMIENTOS ============ */
  function renderMovimientos() {
    const tr = D.trades.map((t) => {
      const sides = t.sides.map((s) => `<div class="card tight" style="background:var(--card2);flex:1;min-width:240px">
        <div class="row">${UI.teamCell(D, s.rid, { sm: true })}<span class="sp"></span>${t.winner === s.rid ? '<span class="pill g">Va ganando</span>' : ""}</div>
        <div class="small faint" style="margin:8px 0 4px">Recibe:</div>
        ${s.gets.map((g) => `<div class="list-row small"><span>${UI.pl(D, g.pid)}</span><span class="sp"></span><span class="num">${f1(g.start)} <span class="faint">pts tit.</span></span></div>`).join("") || '<div class="small faint">—</div>'}
        ${s.picks.map((p) => `<div class="small">Pick ronda ${p.round} ${p.season}</div>`).join("")}
        <div class="stats"><span>Pts como titular desde el trade <b>${f1(s.startPts)}</b></span><span>Valor hoy <b>${f1(s.valueNow)}</b> ppg</span></div></div>`).join("");
      return `<div class="card"><div class="row small muted"><span class="tag">Semana ${t.week}</span><span>${new Date(t.time).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</span><span class="sp"></span>${t.winner ? `<span>Diferencia: <b class="gold">${f1(t.margin)}</b> pts</span>` : '<span class="pill">Parejo</span>'}</div>
        <div class="row" style="margin-top:10px;align-items:stretch">${sides}</div></div>`;
    }).join("") || '<p class="muted">No hay trades todavía.</p>';
    const best = D.pickups.filter((p) => p.start > 0).sort((a, b) => b.start - a.start).slice(0, 12);
    const bestRows = best.map((p, i) => `<tr><td class="num faint">${i + 1}</td><td>${UI.pl(D, p.pid)}</td><td>${UI.teamCell(D, p.rid, { sm: true, noOwner: true })}</td><td class="c">${p.week}</td><td class="c">${p.type === "waiver" ? "Waiver" : "FA"}</td><td class="r num"><b>${f1(p.start)}</b></td><td class="c">${p.still ? "✔" : "<span class='faint'>soltado</span>"}</td></tr>`).join("");
    const regalos = D.drops.filter((d) => d.to && d.gave > 15).sort((a, b) => b.gave - a.gave).slice(0, 8);
    const regRows = regalos.map((d) => `<div class="list-row small"><span>${UI.pl(D, d.pid)}</span><span class="sp"></span><span>${esc(UI.tName(D, d.rid))} lo soltó (sem ${d.week}) → <b>${esc(UI.tName(D, d.to))}</b> le sacó <b class="bad">${f1(d.gave)}</b></span></div>`).join("") || '<p class="small muted">Nadie ha regalado nada (todavía).</p>';
    const gradeRows = D.standings.map((s) => s.rid).map((r) => {
      const g = D.grades[r], m = D.moveStats[r];
      return `<tr class="${UI.isMine(D, r) ? "me" : ""}"><td class="sticky-col">${UI.teamCell(D, r, { sm: true })}</td>
        <td class="c"><b>${g.draft.grade}</b></td><td class="c"><b>${g.waivers.grade}</b></td><td class="c"><b>${g.trades.grade}</b></td><td class="c"><b>${g.lineups.grade}</b></td>
        <td class="r num">${m.moves}</td><td class="r num">${f1(m.waiverStart)}</td><td class="r num">${m.trades}</td><td class="r num ${m.tradeNet > 0 ? "good" : m.tradeNet < 0 ? "bad" : ""}">${m.trades ? sign(m.tradeNet) : "—"}</td></tr>`;
    }).join("");
    $("#s-movimientos").innerHTML = `
      <div class="h2">Trades y waivers</div><p class="sub">Quién se mueve bien en el mercado y quién nomás hace ruido.</p>
      <div class="h3">Calificaciones de manager</div>
      <div class="tbl-wrap"><table><thead><tr><th class="sticky-col">Equipo</th><th class="c">Draft</th><th class="c">Waivers</th><th class="c">Trades</th><th class="c">Lineups</th><th class="r">Altas</th><th class="r">Pts waiver</th><th class="r">Trades</th><th class="r">Neto trades</th></tr></thead><tbody>${gradeRows}</tbody></table></div>
      <p class="small faint">Pts waiver: puntos que le dieron como titulares los jugadores que agarró de waivers/agentes libres. Neto trades: puntos como titular que recibió menos los que le dio al otro equipo.</p>
      <div class="row"><div class="h3">Historial de trades (${D.trades.length})</div><span class="sp"></span>${D.trades.length ? '<button class="btn" id="imgTrades">🖼️ Imagen</button>' : ""}</div>
      <div class="grid">${tr}</div>
      <div class="grid g2" style="margin-top:6px">
        <div><div class="row"><div class="h3">💎 Joyas del waiver</div><span class="sp"></span><button class="btn" id="imgWaiv">🖼️</button></div>
        <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th class="c">Sem</th><th class="c">Vía</th><th class="r">Pts tit.</th><th class="c">Sigue</th></tr></thead><tbody>${bestRows}</tbody></table></div></div>
        <div><div class="h3">🎁 Regalos (drops que dolieron)</div><div class="card">${regRows}</div></div></div>`;
    const ti = $("#imgTrades"); if (ti) ti.onclick = () => UI.makeImage(cardTrades(), "historial-trades");
    $("#imgWaiv").onclick = () => UI.makeImage(cardWaivers(best), "joyas-del-waiver");
  }
  function cardTrades() {
    const body = D.trades.slice(0, 6).map((t) => `<div class="ic-row" style="grid-template-columns:1fr 1fr;gap:20px;padding:16px 22px">${t.sides.map((s) => `<div>
      <div class="ic-name" style="font-size:26px;color:${t.winner === s.rid ? "#5E8C61" : "#2E2C29"}">${esc(UI.tName(D, s.rid))} ${t.winner === s.rid ? "✔" : ""}</div>
      <div class="ic-meta" style="font-size:19px">Recibe: ${esc(s.gets.map((g) => UI.plName(D, g.pid)).join(", ") || "—")}</div>
      <div class="ic-meta" style="font-size:19px">${f1(s.startPts)} pts como titular</div></div>`).join("")}</div>`).join("");
    return UI.icFrame(D, "Mercado", "Trades de la temporada", body + (D.trades.length > 6 ? `<div class="ic-meta" style="text-align:center">+ ${D.trades.length - 6} más en el sitio</div>` : ""));
  }
  function cardWaivers(best) {
    const body = best.slice(0, 10).map((p, i) => `<div class="ic-row" style="padding:10px 22px"><div class="ic-rk" style="font-size:44px">${i + 1}</div><div><div class="ic-name">${esc(D.players[p.pid] ? D.players[p.pid].name : p.pid)}</div><div class="ic-meta">${esc(UI.tName(D, p.rid))} · semana ${p.week}</div></div><div class="ic-score">${f1(p.start)}</div></div>`).join("");
    return UI.icFrame(D, "Waivers", "Joyas del waiver", body);
  }

  /* ============ DRAFT ============ */
  function renderDraft() {
    if (!D.draft.length) { $("#s-draft").innerHTML = '<div class="h2">Draft</div><p class="muted">No hay datos del draft.</p>'; return; }
    const steals = D.draft.filter((p) => p.round >= 3).sort((a, b) => b.value - a.value).slice(0, 10);
    const busts = D.draft.filter((p) => p.round <= 5).sort((a, b) => a.value - b.value).slice(0, 10);
    const row = (p) => `<tr><td class="num">${p.round}.${String(((p.pick - 1) % D.numTeams) + 1).padStart(2, "0")}</td><td>${UI.pl(D, p.pid)}</td><td>${UI.teamCell(D, p.rid, { sm: true, noOwner: true })}</td><td class="r num">${f1(p.pts)}</td><td class="r num">#${p.ptsRank}</td></tr>`;
    const teamRows = D.rids.slice().sort((a, b) => D.draftStats[b].start - D.draftStats[a].start).map((r, i) => `<div class="list-row"><span class="num faint" style="width:18px">${i + 1}</span>${UI.teamCell(D, r, { sm: true })}<span class="sp"></span><div class="small" style="text-align:right"><b class="num">${f1(D.draftStats[r].start)}</b> pts tit.<br><span class="faint">${f1(D.draftStats[r].pts)} pts totales de sus picks</span></div></div>`).join("");
    const th = '<thead><tr><th>Pick</th><th>Jugador</th><th>Equipo</th><th class="r">Pts temp.</th><th class="r">Rank</th></tr></thead>';
    $("#s-draft").innerHTML = `<div class="h2">Draft ${D.season}</div><p class="sub">¿Quién la armó en el draft? Rank = lugar en puntos entre todos los jugadores drafteados.</p>
      <div class="grid g2"><div><div class="h3">🕵️ Robos</div><div class="tbl-wrap"><table>${th}<tbody>${steals.map(row).join("")}</tbody></table></div></div>
      <div><div class="h3">💸 Fracasos (rondas 1–5)</div><div class="tbl-wrap"><table>${th}<tbody>${busts.map(row).join("")}</tbody></table></div></div></div>
      <div class="h3">Puntos que le ha dado su draft a cada equipo</div><div class="card">${teamRows}</div>`;
  }

  /* ============ PLAYOFFS / ROAST / CARA A CARA ============ */
  function renderPlayoffs() { LB.extras.renderPlayoffs(D, $("#s-playoffs")); }
  function renderRoast() { LB.extras.renderRoast(D, $("#s-roast")); }
  let h2hDone = false;
  function renderH2H() { LB.extras.renderH2H(D, $("#s-h2h")); }

  /* ============ ÓSCARS ============ */
  function renderOscars() { LB.awards.render(D, $("#s-oscars")); }

  /* ============ HISTORIA ============ */
  function renderHistoria() {
    const el = $("#s-historia");
    el.innerHTML = '<div class="loading" style="min-height:30vh"><div><div class="spin"></div>Cargando la historia…</div></div>';
    LB.history.load(D).then((list) => LB.history.render(D, el, list)).catch((e) => { el.innerHTML = '<p class="bad">No se pudo cargar la historia: ' + esc(e.message) + '</p>'; });
  }

  /* ============ arranque ============ */
  function renderAll() {
    header();
    [renderInicio, renderPower, renderSemana, renderManianera, renderPlayoffs, renderRoast, renderH2H, renderCalendarios, renderMovimientos, renderDraft, renderOscars, renderHistoria].forEach((f) => {
      try { f(); } catch (e) { console.error(e); }
    });
  }
  async function boot(silent) {
    try {
      const data = await LB.load((t) => { if (!silent) $("#loadTxt").textContent = t; });
      D = data;
      $("#loading").style.display = "none";
      $("#main").style.display = "block";
      renderAll();
      show();
    } catch (e) {
      console.error(e);
      if (!silent) $("#loadTxt").innerHTML = `No se pudo conectar con Sleeper (${esc(e.message)}).<br><button class="btn pri" onclick="location.reload()" style="margin-top:12px">Reintentar</button>`;
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    tabs();
    window.addEventListener("hashchange", show);
    $("#refreshBtn").onclick = async () => { UI.toast("Actualizando…"); await boot(true); UI.toast("Listo ✔"); };
    boot(false);
    // En días de partido se refresca solo cada 2 minutos
    setInterval(() => { if (D && D.liveWeek && !document.hidden) boot(true); }, 120000);
  });
})();
