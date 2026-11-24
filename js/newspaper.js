/* =================================================================
   LA MAÑANERA · el periódico oficial de La Buenísima
   Portadas de 1080x1920 (formato estado de WhatsApp)
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui, CFG = window.LB_CONFIG, ART = LB.art;
  const { esc, f1, pct, rec } = UI;
  const NP = (LB.np = {});
  const NAME = "La Mañanera";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hoy = () => { const d = new Date(); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const T = (D, r) => esc(UI.tName(D, r));
  const fit = (n, base, step = 2, from = 14) => (n.length > from ? Math.max(base - (n.length - from) * step * 0.5, base * 0.7) : base);

  /* ---------- textura de papel (se genera una vez) ---------- */
  let TEX = null;
  function texture() {
    if (TEX) return TEX;
    try {
      const c = document.createElement("canvas"); c.width = c.height = 360;
      const x = c.getContext("2d");
      const img = x.createImageData(360, 360);
      const R = LB.util.rng("papel");
      for (let i = 0; i < img.data.length; i += 4) {
        const n = 200 + R() * 55;
        img.data[i] = n; img.data[i + 1] = n * 0.97; img.data[i + 2] = n * 0.9; img.data[i + 3] = 26;
      }
      x.putImageData(img, 0, 0);
      x.globalAlpha = 0.07; x.strokeStyle = "#6B5A3E";
      for (let i = 0; i < 70; i++) { x.beginPath(); const sx = R() * 360, sy = R() * 360; x.moveTo(sx, sy); x.quadraticCurveTo(sx + R() * 30, sy + R() * 8, sx + 20 + R() * 40, sy + R() * 12); x.lineWidth = 0.6; x.stroke(); }
      TEX = c.toDataURL("image/png");
    } catch (e) { TEX = ""; }
    return TEX;
  }

  function masthead(D, w, edition) {
    return `<div class="np-top"><span>Año ${Math.max(1, Number(D.season) - 2025)} · No. ${w}</span><span>${hoy()}</span><span>Precio: una cerveza</span></div>
      <div class="np-mast-row"><img class="np-logo" src="${esc(CFG.logo || "")}" alt=""><div class="np-mast">${NAME}</div><img class="np-logo" src="${esc(CFG.logo || "")}" alt=""></div>
      <div class="np-strap"><span>El diario oficial de ${esc(CFG.leagueName)}</span><span class="np-sec">${esc(edition)}</span><span>"Lo que pasa en la liga, aquí se publica"</span></div>`;
  }
  const band = (text, sub) => `<div class="np-band"><b>${esc(text)}</b><span>${esc(sub)}</span></div>`;
  function wrap(inner, cls) {
    return `<div class="np ${cls}" style="background-image:url(${texture()}),radial-gradient(circle at 15% 8%,rgba(255,255,255,.6),transparent 50%),radial-gradient(circle at 92% 96%,rgba(150,110,60,.16),transparent 45%)">${inner}
      <div class="np-foot"><span>${NAME}</span><span>Hecho con datos en vivo de Sleeper</span><span>${esc(CFG.leagueName)}</span></div></div>`;
  }
  const byline = (w) => `<div class="np-by">Por <b>la Redacción</b> · Corresponsales en las 10 franquicias · Semana ${w}</div>`;
  function figure(svgImg, caption) { return `<figure class="np-fig">${svgImg}<figcaption>${esc(caption)}</figcaption></figure>`; }
  const box = (title, inner, cls = "") => `<div class="np-box ${cls}"><div class="np-box-h">${esc(title)}</div>${inner}</div>`;

  /* ------------- PREVIEW ------------- */
  NP.preview = function (D, w) {
    const S = LB.stories.preview(D, w);
    const M = S.main;
    // gráfica: cara a cara por posición del partido estelar
    const ea = M.ea, eb = M.eb;
    const val = (p) => (w === D.projWeek ? D.projPts[p] || 0 : D.ppg(p));
    const labels = D.slots.map((s) => (s === "FLEX" ? "FLX" : s));
    const left = ea.starters.map(val), right = eb.starters.map(val);
    const chart = ART.toImg(ART.mirror(labels, left, right, { w: 360, rowH: 27, a: UI.tName(D, M.g.a).slice(0, 16), b: UI.tName(D, M.g.b).slice(0, 16) }), 360, 9 * 27 + 40);
    const rows = S.mus.map((m) => {
      const pr = m.pa != null;
      const sa = pr ? m.pa : m.sa.ppg, sb = pr ? m.pb : m.sb.ppg;
      const wa = m.winA == null ? 0.5 : m.winA;
      const kA = m.topA[0], kB = m.topB[0];
      const na = UI.tName(D, m.g.a), nb = UI.tName(D, m.g.b);
      return `<div class="np-mu">
        <div class="np-mu-t"><div class="np-tn" style="font-size:${fit(na, 26)}px">${esc(na)}</div><div class="np-rec">${m.sa.W != null ? rec(m.sa) : ""} · ${esc(UI.oName(D, m.g.a))}</div></div>
        <div class="np-mu-s"><b>${f1(sa)}</b><i>vs</i><b>${f1(sb)}</b></div>
        <div class="np-mu-t r"><div class="np-tn" style="font-size:${fit(nb, 26)}px">${esc(nb)}</div><div class="np-rec">${m.sb.W != null ? rec(m.sb) : ""} · ${esc(UI.oName(D, m.g.b))}</div></div>
        <div class="np-bar"><i style="width:${wa * 100}%"></i></div>
        <div class="np-mu-x"><span>${pct(wa)}</span><span>${kA && kB ? `A vigilar: ${esc(UI.plName(D, kA.pid))} vs ${esc(UI.plName(D, kB.pid))}` : ""}</span><span>${pct(1 - wa)}</span></div></div>`;
    }).join("");
    const clima = LB.stories.clima(D, w).map((c) => `<div class="np-li"><span class="np-ico">${c.i}</span>${esc(c.t)}</div>`).join("");
    const horo = LB.stories.horoscopo(D, w).slice(0, 2).map((h) => `<div class="np-li"><b>${esc(h.sign)} · ${T(D, h.r)}:</b> ${esc(h.t)}</div>`).join("");
    const clas = LB.stories.clasificados(D, w).slice(0, 2).map((c) => `<div class="np-ad"><b>${esc(c.h)}</b> ${esc(c.t)}</div>`).join("");
    const body = `${masthead(D, w, "Edición matutina")}
      ${band(`Preview · Semana ${w}`, "Lo que viene")}
      <div class="np-kick">${esc(S.kicker)}</div>
      <div class="np-h1">${esc(S.headline)}</div>
      <div class="np-sub">${esc(S.sub)}</div>
      ${byline(w)}
      <div class="np-lead"><div class="np-body drop">${esc(S.body)}</div>${figure(chart, `Cara a cara por posición: ${w === D.projWeek ? "puntos proyectados por Sleeper" : "promedio de temporada"} de cada titular.`)}</div>
      <div class="np-rule"><span>La cartelera</span></div>
      <div class="np-mus">${rows}</div>
      <div class="np-cols3">${box("El clima en la liga", clima)}${box("Horóscopo fantasy", horo)}${box("Clasificados", clas, "ads")}</div>`;
    return wrap(body, "pv");
  };

  /* ------------- RESULTADOS ------------- */
  NP.results = function (D, w) {
    const S = LB.stories.results(D, w);
    const tws = D.rids.map((r) => ({ r, ...D.tw[r][w] })).filter((x) => x.pf != null).sort((a, b) => b.pf - a.pf);
    const avg = tws.reduce((s, x) => s + x.pf, 0) / (tws.length || 1);
    const chart = ART.toImg(ART.hbars(tws.map((x) => ({ label: UI.tName(D, x.r), value: x.pf, color: x.res === "W" ? ART.colors.red : ART.colors.sand, strong: x.res === "W" })), { w: 380, rowH: 27, labelW: 150, avg }), 380, tws.length * 27 + 12);
    const rows = S.lines.map((l) => {
      const nw = UI.tName(D, l.W), nl = UI.tName(D, l.L);
      return `<div class="np-res"><div class="np-final">FINAL</div>
        <div class="np-res-sc"><span class="w" style="font-size:${fit(nw, 25)}px">${esc(nw)}</span><b>${f1(l.tW.pf)}</b><i>–</i><b class="l">${f1(l.tL.pf)}</b><span class="l" style="font-size:${fit(nl, 25)}px">${esc(nl)}</span></div>
        <div class="np-res-tx">${esc(l.text)}</div></div>`;
    }).join("");
    const A = S.awards;
    const tabla = S.standings.slice(0, D.numTeams).map((s) => {
      const p = S.prev ? (S.prev.find((x) => x.rid === s.rid) || {}).rank : null;
      const d = p ? p - s.rank : 0;
      return `<div class="np-li tb ${s.rank === D.playoffTeams ? "cut" : ""}"><b>${s.rank}.</b> ${T(D, s.rid)} <span class="np-mv ${d > 0 ? "up" : d < 0 ? "dn" : ""}">${d > 0 ? "▲" + d : d < 0 ? "▼" + -d : ""}</span><span class="rr">${rec(s)}</span></div>`;
    }).join("");
    const premios = `<div class="np-li">👑 <b>Equipo:</b> ${T(D, A.top.rid)} (${f1(A.top.pf)})</div>
      <div class="np-li">⭐ <b>MVP:</b> ${esc(UI.plName(D, A.mvp.pid))} (${f1(A.mvp.pts)})</div>
      <div class="np-li">🪑 <b>Banca de oro:</b> ${T(D, A.bench.rid)} (${f1(A.bench.max - A.bench.pf)})</div>
      <div class="np-li">🧱 <b>Ladrillo:</b> ${T(D, A.low.rid)} (${f1(A.low.pf)})</div>`;
    const ad = LB.stories.clasificados(D, w)[0];
    const body = `${masthead(D, w, "Edición de la noche")}
      ${band(`Resultados · Semana ${w}`, "Así quedó")}
      <div class="np-kick">${esc(S.kicker)}</div>
      <div class="np-h1">${esc(S.headline)}</div>
      <div class="np-sub">${esc(S.sub)}</div>
      ${byline(w)}
      <div class="np-lead"><div class="np-body drop">${esc(S.body)}</div>${figure(chart, `Puntos de la semana ${w}. En rojo, los que ganaron; la línea punteada es el promedio.`)}</div>
      <div class="np-rule"><span>Los marcadores</span></div>
      <div class="np-res-list">${rows}</div>
      <div class="np-cols3 rs">${box("Premios de la semana", premios + S.extra.slice(0, 1).map((e) => `<div class="np-li it">• ${esc(e.headline)}</div>`).join(""))}${box("Así va la tabla", tabla)}${box("Fe de erratas", `<div class="np-li it">${esc(LB.stories.erratas(D, w))}</div>${ad ? `<div class="np-ad" style="margin-top:10px"><b>${esc(ad.h)}</b> ${esc(ad.t)}</div>` : ""}`)}</div>`;
    return wrap(body, "rs");
  };

  /* ------------- BREAKING NEWS (noticiero de TV) ------------- */
  function avatarBig(D, r, size) {
    const t = D.teams[r];
    const ini = esc((t.name || "?").replace(/[^A-Za-z0-9ÁÉÍÓÚÑ ]/gi, "").split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase());
    return `<div class="tv-av" style="width:${size}px;height:${size}px;background:${UI.color(r)};font-size:${size * 0.36}px">${ini}${t.avatar ? `<img crossorigin="anonymous" onerror="this.remove()" src="https://sleepercdn.com/avatars/${t.avatarId}" alt="">` : ""}</div>`;
  }
  NP.breaking = function (D, e) {
    const others = LB.stories.breaking(D, 14).filter((x) => x.id !== e.id).slice(0, 5);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const Q = LB.stories.quip(D, e);
    const r0 = (e.rids || [])[0], r1 = (e.rids || [])[1];
    const art = ART.toImg(ART.iconFor(e.type), 300, 300, "border-radius:50%");
    const head = e.headline;
    return `<div class="tv">
      <div class="tv-top"><img class="tv-logo-img" src="${esc(CFG.logo || "")}" alt=""><div class="tv-logo"><b>LBN</b><span>La Buenísima<br>Noticias</span></div><div class="tv-live"><i></i>EN VIVO</div><div class="tv-clock">${hh}<span>SEMANA ${e.week}</span></div></div>
      <div class="tv-slab"><div class="tv-br">BREAKING</div><div class="tv-nw">NEWS</div></div>
      <div class="tv-hero">
        <div class="tv-art">${art}${r0 != null ? `<div class="tv-av-wrap">${avatarBig(D, r0, 130)}</div>` : ""}</div>
        <div class="tv-hero-r"><div class="tv-kick">${esc(e.kicker)}</div>${r0 != null ? `<div class="tv-team">${T(D, r0)}${r1 != null && e.type !== "racha" && e.type !== "crisis" && e.type !== "clasificado" && e.type !== "eliminado" ? ` <span>vs</span> ${T(D, r1)}` : ""}</div>` : ""}
          ${e.stat ? `<div class="tv-stat"><b>${esc(e.stat.v)}</b><span>${esc(e.stat.l)}</span></div>` : ""}</div>
      </div>
      <div class="tv-head" style="font-size:${head.length > 60 ? 70 : head.length > 42 ? 82 : 94}px">${esc(head)}</div>
      <div class="tv-sub">${esc(e.sub)}</div>
      <div class="tv-report"><div class="tv-report-h">● REPORTE DESDE EL LUGAR DE LOS HECHOS</div><p>${esc(e.body)}</p><p class="ctx">${esc(LB.stories.context(D, e))}</p><p class="quip">🎙️ ${esc(Q.quip)}</p></div>
      <div class="tv-poll"><div class="tv-poll-h">ENCUESTA LBN <span>(totalmente científica)</span></div><div class="tv-poll-q">¿Fue puro talento?</div>
        <div class="tv-poll-b"><i style="width:${Q.poll}%">SÍ ${Q.poll}%</i><em>NO ${100 - Q.poll}%</em></div></div>
      ${others.length ? `<div class="tv-more"><div class="tv-more-h">MÁS TITULARES</div>${others.slice(0, 3).map((o) => `<div class="tv-more-i"><span>S${o.week}</span><b>${esc(o.kicker)}</b> ${esc(o.headline)}</div>`).join("")}</div>` : ""}
      <div class="tv-ticker"><div class="tv-tk-l">ÚLTIMA HORA</div><div class="tv-tk-t">${others.map((o) => `<span>S${o.week} · ${esc(o.headline)}</span>`).join("<i>•</i>")}</div></div>
      <div class="tv-foot">LBN · ${esc(CFG.leagueName)} · Temporada ${esc(D.season)} · Datos en vivo de Sleeper</div>
    </div>`;
  };

  /* ------------- vista en el sitio ------------- */
  NP.mount = function (container, html) {
    container.innerHTML = `<div class="np-view"><div class="np-scale">${html}</div></div>`;
    const v = container.querySelector(".np-view");
    const doFit = () => {
      if (!v.clientWidth) return;
      const s = Math.min(1, v.clientWidth / 1080);
      const node = container.querySelector(".np,.tv");
      container.querySelector(".np-scale").style.transform = `scale(${s})`;
      v.style.height = ((node && node.offsetHeight) || 1920) * s + "px";
    };
    doFit();
    if (window.ResizeObserver) new ResizeObserver(doFit).observe(v);
    else window.addEventListener("resize", doFit);
  };
})();
