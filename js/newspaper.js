/* =================================================================
   LA MAÑANERA 6 · el periódico oficial de La Buenísima
   Portadas de 1080x1920 (formato estado de WhatsApp)
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG;
  const { esc, f1, pct, rec } = UI;
  const NP = (LB.np = {});
  const NAME = "La Mañanera 6";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const hoy = () => { const d = new Date(); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const T = (D, r) => esc(UI.tName(D, r));
  const TN = (D, r) => { const n = UI.tName(D, r); return `<div class="np-tn" style="${n.length > 20 ? "font-size:21px" : n.length > 16 ? "font-size:23px" : ""}">${esc(n)}</div>`; };

  function masthead(D, section, w, small) {
    return `<div class="np-top"><span>Año ${Number(D.season) - 2025} · Edición No. ${w}</span><span>${hoy()}</span><span>Precio: una cerveza</span></div>
      <div class="np-mast ${small ? "sm" : ""}">${NAME}</div>
      <div class="np-strap"><span>El diario oficial de ${esc(CFG.leagueName)}</span><span class="np-sec">${esc(section)}</span><span>Fantasy Football · Temporada ${esc(D.season)}</span></div>`;
  }
  function wrap(inner) { return `<div class="np">${inner}<div class="np-foot">${NAME} · Hecho con datos en vivo de Sleeper · ${esc(CFG.leagueName)}</div></div>`; }

  /* ------------- PREVIEW ------------- */
  NP.preview = function (D, w) {
    const S = LB.stories.preview(D, w);
    const rows = S.mus.map((M) => {
      const showProj = M.pa != null;
      const sa = showProj ? M.pa : M.sa.ppg, sb = showProj ? M.pb : M.sb.ppg;
      const wa = M.winA == null ? 0.5 : M.winA;
      const kA = M.topA[0], kB = M.topB[0];
      return `<div class="np-mu">
        <div class="np-mu-t">${TN(D, M.g.a)}<div class="np-rec">${M.sa.W != null ? rec(M.sa) : ""} · ${esc(UI.oName(D, M.g.a))}</div></div>
        <div class="np-mu-s"><b>${f1(sa)}</b><i>vs</i><b>${f1(sb)}</b></div>
        <div class="np-mu-t r">${TN(D, M.g.b)}<div class="np-rec">${M.sb.W != null ? rec(M.sb) : ""} · ${esc(UI.oName(D, M.g.b))}</div></div>
        <div class="np-bar"><i style="width:${wa * 100}%"></i></div>
        <div class="np-mu-x"><span>${pct(wa)}</span><span>${kA && kB ? `Clave: ${esc(UI.plName(D, kA.pid))} vs ${esc(UI.plName(D, kB.pid))}` : ""}</span><span>${pct(1 - wa)}</span></div></div>`;
    }).join("");
    const sim = D.sim && D.sim.out;
    const bubble = sim && D.sim.remaining.length ? D.rids.filter((r) => sim[r].playoff > 0.05 && sim[r].playoff < 0.95).sort((a, b) => sim[b].playoff - sim[a].playoff).slice(0, 5) : [];
    const body = `${masthead(D, `Preview · Semana ${w}`, w)}
      <div class="np-kick">${esc(S.kicker)}</div>
      <div class="np-h1">${esc(S.headline)}</div>
      <div class="np-sub">${esc(S.sub)}</div>
      <div class="np-body drop">${esc(S.body)}</div>
      <div class="np-rule"><span>La cartelera</span></div>
      <div class="np-mus">${rows}</div>
      <div class="np-cols3">
        <div><div class="np-box-h">Power Top 3</div>${S.powerTop.map((p) => `<div class="np-li"><b>${p.prank}.</b> ${T(D, p.rid)}</div>`).join("")}</div>
        <div><div class="np-box-h">Dato de la semana</div><div class="np-li it">${esc(S.fact || "")}</div></div>
        <div><div class="np-box-h">${bubble.length ? "La burbuja" : "Lo demás"}</div>${bubble.length ? bubble.map((r) => `<div class="np-li">${T(D, r)} <b>${pct(sim[r].playoff)}</b></div>`).join("") : S.others.slice(0, 3).map((o) => `<div class="np-li">${esc(o)}</div>`).join("")}</div>
      </div>`;
    return wrap(body);
  };

  /* ------------- RESULTADOS ------------- */
  NP.results = function (D, w) {
    const S = LB.stories.results(D, w);
    const rows = S.lines.map((l) => `<div class="np-res">
      <div class="np-res-sc"><span class="w">${T(D, l.W)}</span><b>${f1(l.tW.pf)}</b><i>–</i><b class="l">${f1(l.tL.pf)}</b><span class="l">${T(D, l.L)}</span></div>
      <div class="np-res-tx">${esc(l.text)}</div></div>`).join("");
    const A = S.awards;
    const tabla = S.standings.slice(0, D.numTeams).map((s) => {
      const p = S.prev ? (S.prev.find((x) => x.rid === s.rid) || {}).rank : null;
      const d = p ? p - s.rank : 0;
      return `<div class="np-li tb ${s.rank === D.playoffTeams ? "cut" : ""}"><b>${s.rank}.</b> ${T(D, s.rid)} <span class="np-mv ${d > 0 ? "up" : d < 0 ? "dn" : ""}">${d > 0 ? "▲" + d : d < 0 ? "▼" + -d : ""}</span><span class="rr">${rec(s)}</span></div>`;
    }).join("");
    const body = `${masthead(D, `Resultados · Semana ${w}`, w)}
      <div class="np-kick">${esc(S.kicker)}</div>
      <div class="np-h1">${esc(S.headline)}</div>
      <div class="np-sub">${esc(S.sub)}</div>
      <div class="np-body drop">${esc(S.body)}</div>
      <div class="np-rule"><span>Los marcadores</span></div>
      <div>${rows}</div>
      <div class="np-cols2">
        <div><div class="np-box-h">Premios de la semana</div>
          <div class="np-li">👑 <b>Equipo:</b> ${T(D, A.top.rid)} (${f1(A.top.pf)})</div>
          <div class="np-li">⭐ <b>MVP:</b> ${esc(UI.plName(D, A.mvp.pid))} (${f1(A.mvp.pts)})</div>
          <div class="np-li">🪑 <b>Banca de oro:</b> ${T(D, A.bench.rid)} (${f1(A.bench.max - A.bench.pf)})</div>
          <div class="np-li">💩 <b>Ladrillo:</b> ${T(D, A.low.rid)} (${f1(A.low.pf)})</div>
          ${S.extra.map((e) => `<div class="np-li it">• ${esc(e.headline)}</div>`).join("")}</div>
        <div><div class="np-box-h">Así va la tabla</div>${tabla}</div>
      </div>`;
    return wrap(body);
  };

  /* ------------- BREAKING NEWS ------------- */
  NP.breaking = function (D, e) {
    const others = LB.stories.breaking(D, 12).filter((x) => x.id !== e.id).slice(0, 4);
    const body = `${masthead(D, `Semana ${e.week}`, e.week, true)}
      <div class="np-bk"><span>ÚLTIMA HORA</span><b>BREAKING NEWS</b></div>
      <div class="np-kick big">${esc(e.kicker)}</div>
      <div class="np-h1 xl">${esc(e.headline)}</div>
      <div class="np-sub">${esc(e.sub)}</div>
      ${e.stat ? `<div class="np-stat"><b>${esc(e.stat.v)}</b><span>${esc(e.stat.l)}</span></div>` : ""}
      <div class="np-body one drop">${esc(e.body)}</div>
      <div class="np-body one" style="margin-top:14px;font-size:26px;color:#3A332A">${esc(LB.stories.context(D, e))}</div>
      ${others.length ? `<div class="np-rule"><span>Otras noticias</span></div>${others.map((o) => `<div class="np-li other"><b>Sem ${o.week} · ${esc(o.kicker)}:</b> ${esc(o.headline)}</div>`).join("")}` : ""}`;
    return wrap(body);
  };

  /* ------------- vista en el sitio ------------- */
  NP.mount = function (container, html) {
    container.innerHTML = `<div class="np-view"><div class="np-scale">${html}</div></div>`;
    const fit = () => {
      const v = container.querySelector(".np-view");
      if (!v) return;
      if (!v.clientWidth) return;
      const s = Math.min(1, v.clientWidth / 1080);
      const sc = container.querySelector(".np-scale");
      sc.style.transform = `scale(${s})`;
      v.style.height = (container.querySelector(".np").offsetHeight || 1920) * s + "px";
    };
    fit();
    const v = container.querySelector(".np-view");
    if (window.ResizeObserver) new ResizeObserver(fit).observe(v);
    else window.addEventListener("resize", fit);
  };
})();
