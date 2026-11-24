/* =================================================================
   LA BUENÍSIMA · utilidades de interfaz, textos e imágenes
   ================================================================= */
(function () {
  const LB = window.LB;
  const CFG = window.LB_CONFIG;
  const { r1, rng } = LB.util;
  const UI = (LB.ui = {});

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  UI.esc = esc;
  UI.f1 = (x) => (x == null || isNaN(x) ? "—" : (Math.round(x * 10) / 10).toFixed(1));
  UI.f2 = (x) => (x == null || isNaN(x) ? "—" : (Math.round(x * 100) / 100).toFixed(2));
  UI.pct = (x, d = 0) => (x == null || isNaN(x) ? "—" : (x * 100).toFixed(d) + "%");
  UI.sign = (x, d = 1) => (x > 0 ? "+" : x < 0 ? "−" : "±") + Math.abs(x).toFixed(d);
  UI.rec = (s) => `${s.W}-${s.L}${s.T ? "-" + s.T : ""}`;

  const PALETTE = ["#E85A4F", "#C9A27E", "#6B8F71", "#5B7DB1", "#B47EB3", "#D4A24C", "#4F9A94", "#A0522D", "#7A6F9B", "#E98074", "#8E8D8A", "#C77D5A"];
  UI.color = (rid) => PALETTE[(rid - 1) % PALETTE.length];
  const initials = (s) => (s || "?").replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  UI.avatar = (t, cls = "") => {
    const ini = `<div class="av ${cls}" style="background:${UI.color(t.rid)}">${esc(initials(t.name))}</div>`;
    if (!t.avatar) return ini;
    return `<img class="av ${cls}" src="${t.avatar}" alt="" loading="lazy" onerror="this.outerHTML=this.dataset.f" data-f='${ini.replace(/'/g, "&#39;")}'>`;
  };
  UI.teamCell = (D, rid, opts = {}) => {
    const t = D.teams[rid];
    return `<div class="team">${UI.avatar(t, opts.sm ? "sm" : "")}<div style="min-width:0"><div class="tn">${esc(t.name)}</div>${opts.noOwner ? "" : `<div class="to">${esc(t.ownersNick)}</div>`}</div></div>`;
  };
  UI.pl = (D, pid, opts = {}) => {
    const p = D.players[pid];
    if (!p) return esc(pid);
    const inj = p.inj && opts.inj !== false ? ` <span class="pill b" style="font-size:10px;padding:1px 5px">${esc(injShort(p.inj))}</span>` : "";
    return `${esc(opts.full ? p.name : p.short)} <span class="faint small">${esc(p.pos)}${p.team && p.pos !== "DEF" ? " · " + esc(p.team) : ""}</span>${inj}`;
  };
  const injShort = (s) => ({ Questionable: "Q", Doubtful: "D", Out: "OUT", IR: "IR", Sus: "SUS", PUP: "PUP", NA: "NA" }[s] || s);
  UI.plName = (D, pid) => (D.players[pid] ? D.players[pid].short : pid);
  UI.tName = (D, rid) => D.teams[rid].name;
  UI.oName = (D, rid) => D.teams[rid].ownersNick;
  UI.isMine = (D, rid) => D.teams[rid].owners.some((o) => o.toLowerCase() === (CFG.myUsername || "").toLowerCase());
  UI.myRid = (D) => D.rids.find((r) => UI.isMine(D, r));
  UI.logoHTML = (D, cls = "logo") => {
    const src = CFG.logo || (D.league.avatar ? `https://sleepercdn.com/avatars/${D.league.avatar}` : "");
    return src ? `<img class="${cls}" src="${src}" alt="" onerror="this.outerHTML='<div class=&quot;${cls}&quot;>LB</div>'">` : `<div class="${cls}">LB</div>`;
  };
  UI.rivals = (D, a, b) => {
    const oa = D.teams[a].owners, ob = D.teams[b].owners;
    return (CFG.rivalries || []).some(([x, y]) => (oa.includes(x) && ob.includes(y)) || (oa.includes(y) && ob.includes(x)));
  };

  /* ---------------- textos ---------------- */
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? String(o[k]).trim() : "")).replace(/\.\.(?!\.)/g, ".");

  UI.powerBlurb = function (D, row, week, total) {
    const R = rng(`pb-${week}-${row.rid}`);
    const t = D.teams[row.rid];
    const sim = D.sim && D.sim.out[row.rid];
    const o = { team: t.name, rec: UI.rec(row), ppg: UI.f1(row.ppg), l3: UI.f1(row.last3), eff: Math.round(row.eff * 100), luck: Math.abs(row.luck).toFixed(1), po: sim ? Math.round(sim.playoff * 100) : null };
    const out = [];
    if (row.prank === 1) out.push(pick(R, ["El equipo a vencer, y no está cerca.", "Número uno y con argumentos: {ppg} pts por semana.", "Aquí está la vara. Todos los demás están jugando por el segundo lugar… por ahora."]));
    else if (row.prank <= 3) out.push(pick(R, ["Contendiente serio, de los que nadie quiere en playoffs.", "Top 3 con todas las de la ley.", "Se ve que va en serio: {rec} y {ppg} pts por partido."]));
    else if (row.prank >= total) out.push(pick(R, ["El sótano tiene dueño. Ya huele a castigo.", "Último en el power. Hay que pedir milagro… o un trade.", "Ni el waiver lo salva esta semana."]));
    else if (row.prank >= total - 2) out.push(pick(R, ["Zona de peligro. Necesita reaccionar ya.", "Va cuesta abajo y sin frenos.", "Le urge una semana grande para no quedarse atrás."]));
    else out.push(pick(R, ["En la pelea, sin ser favorito.", "Equipo de media tabla buscando identidad.", "Puede ganarle a cualquiera… y perder con cualquiera."]));
    if (row.luck >= 1.2) out.push(pick(R, ["Le están saliendo todas: lleva {luck} victorias más de lo que dicen sus puntos.", "La suerte trae su camiseta: +{luck} victorias sobre lo esperado."]));
    else if (row.luck <= -1.2) out.push(pick(R, ["El calendario lo odia: {luck} victorias menos de lo que merecen sus puntos.", "Juega para más, pero le tocan rivales encendidos (−{luck} victorias de pura mala suerte)."]));
    if (row.gp >= 3 && row.last3 > row.ppg * 1.1) out.push(pick(R, ["Viene encendido: {l3} pts por semana en las últimas 3.", "Tendencia hacia arriba: {l3} de promedio reciente."]));
    else if (row.gp >= 3 && row.last3 < row.ppg * 0.9) out.push(pick(R, ["Se está enfriando: bajó a {l3} en las últimas 3.", "Alerta roja: solo {l3} pts por semana en el último mes."]));
    if (row.eff < 0.86) out.push(pick(R, ["Y deja demasiados puntos en la banca (saca el {eff}% de su máximo).", "Alguien explíquele el lineup: {eff}% de eficiencia."]));
    else if (row.eff > 0.93) out.push(pick(R, ["Lineup de cirujano: {eff}% de su máximo posible.", "Casi no se equivoca con titulares ({eff}% de eficiencia)."]));
    if (o.po != null && week <= D.regEnd && D.sim.remaining.length) out.push(`Playoffs: ${o.po}%.`);
    return fill(out.slice(0, 3).join(" "), o);
  };

  UI.recapText = function (D, M) {
    const R = rng(`rc-${M.w}-${M.g.mid}`);
    const aWon = M.ta.pf >= M.tb.pf;
    const W = aWon ? M.g.a : M.g.b, L = aWon ? M.g.b : M.g.a;
    const tW = aWon ? M.ta : M.tb, tL = aWon ? M.tb : M.ta;
    const topW = (aWon ? M.topA : M.topB)[0], topL = (aWon ? M.topB : M.topA)[0];
    const margin = tW.pf - tL.pf;
    const o = { w: UI.tName(D, W), l: UI.tName(D, L), ow: UI.oName(D, W), ol: UI.oName(D, L), sw: UI.f1(tW.pf), sl: UI.f1(tL.pf), m: UI.f1(margin), pw: topW ? UI.plName(D, topW.pid) : "", ppw: topW ? UI.f1(topW.pts) : "", pl: topL ? UI.plName(D, topL.pid) : "", ppl: topL ? UI.f1(topL.pts) : "", bench: UI.f1(tL.max - tL.pf) };
    if (tW.pf === tL.pf) return fill("Empate {sw} a {sl}. Nadie se lleva la gloria, todos se llevan la vergüenza.", o);
    let s;
    if (margin < 5) s = pick(R, ["{w} se lo llevó por un pelo, {sw} a {sl}. Infarto hasta el último snap.", "Partidazo: {w} gana por apenas {m} pts. {ol} todavía no lo supera.", "Cardiaco. {w} {sw}, {l} {sl}. Diferencia: {m}."]);
    else if (margin > 40) s = pick(R, ["Paliza. {w} le pasó por encima a {l}, {sw} a {sl}.", "{w} le metió {m} pts de diferencia a {l}. Esto fue un atropello.", "Se acabó temprano: {w} {sw}, {l} {sl}. Sin piedad."]);
    else s = pick(R, ["{w} venció a {l} {sw} a {sl}.", "Triunfo sólido de {w}: {sw} contra {sl} de {l}.", "{w} hizo su chamba y le ganó a {l} por {m}."]);
    const parts = [s];
    if (topW) parts.push(pick(R, ["La figura: {pw} con {ppw} pts.", "{pw} cargó al equipo con {ppw}.", "MVP del partido: {pw} ({ppw} pts)."]));
    if (topL && topL.pts >= 20) parts.push(pick(R, ["Por {l} no alcanzó ni con {pl} ({ppl}).", "{pl} hizo {ppl} pero se quedó solo."]));
    if (tL.max > tW.pf) parts.push(pick(R, ["Lo que más duele: con su mejor lineup posible, {l} ganaba. Dejó {bench} pts en la banca. 🤦", "Ojo {ol}: ese partido estaba en la banca. {bench} pts sin usar."]));
    return fill(parts.join(" "), o);
  };

  UI.previewText = function (D, M) {
    const R = rng(`pv-${M.w}-${M.g.mid}`);
    const A = M.g.a, B = M.g.b;
    const favA = (M.winA == null ? 0.5 : M.winA) >= 0.5;
    const fav = favA ? A : B, dog = favA ? B : A;
    const wp = Math.round(Math.max(M.winA, 1 - M.winA) * 100);
    const sf = favA ? M.sa : M.sb, sd = favA ? M.sb : M.sa;
    const keyF = (favA ? M.topA : M.topB)[0], keyD = (favA ? M.topB : M.topA)[0];
    const o = { f: UI.tName(D, fav), d: UI.tName(D, dog), of: UI.oName(D, fav), od: UI.oName(D, dog), wp, rf: sf.W != null ? UI.rec(sf) : "", rd: sd.W != null ? UI.rec(sd) : "", kf: keyF ? UI.plName(D, keyF.pid) : "", kd: keyD ? UI.plName(D, keyD.pid) : "", pf: UI.f1(favA ? M.pa : M.pb), pd: UI.f1(favA ? M.pb : M.pa) };
    const parts = [];
    if (UI.rivals(D, A, B)) parts.push(pick(R, ["🔥 RIVALIDAD. Esto no es un partido cualquiera.", "🔥 Duelo de rivales. Aquí se juega el orgullo."]));
    if (wp >= 70) parts.push(pick(R, ["{f} ({rf}) llega como favorito claro: {wp}% de probabilidad.", "En el papel no hay partido: {f} con {wp}% de ganar."]));
    else if (wp <= 56) parts.push(pick(R, ["Moneda al aire: {f} apenas {wp}% contra {d}.", "Partido parejísimo. Las proyecciones casi no separan a {f} y {d}."]));
    else parts.push(pick(R, ["{f} ({rf}) es favorito con {wp}%, pero {d} ({rd}) tiene con qué.", "Ventaja para {f} ({wp}%), sin nada asegurado."]));
    if (M.pa != null) parts.push(fill("Proyección: {f} {pf} – {pd} {d}.", o));
    if (keyF && keyD) parts.push(pick(R, ["A vigilar: {kf} de un lado y {kd} del otro.", "El duelo dentro del duelo: {kf} vs {kd}."]));
    if (M.h2h.length) {
      const last = M.h2h[M.h2h.length - 1];
      const wonA = last.pa > last.pb;
      parts.push(`Ya se vieron en la semana ${last.w}: ganó ${UI.tName(D, wonA ? A : B)} ${UI.f1(Math.max(last.pa, last.pb))}–${UI.f1(Math.min(last.pa, last.pb))}.`);
    }
    const injs = [...M.injA, ...M.injB];
    if (injs.length) parts.push(`⚠️ Ojo con el lineup: ${injs.map((p) => UI.plName(D, p) + " (" + D.players[p].inj + ")").join(", ")} ${injs.length > 1 ? "están de titulares" : "está de titular"}.`);
    if (sd.streak && /^[3-9]P/.test(sd.streak)) parts.push(fill("{d} trae racha de " + sd.streak.replace("P", " derrotas") + ". Necesita reaccionar.", o));
    if (sf.streak && /^[3-9]G/.test(sf.streak)) parts.push(fill("{f} viene de " + sf.streak.replace("G", " victorias seguidas") + ".", o));
    return fill(parts.join(" "), o);
  };

  /* ---------------- imágenes ---------------- */
  let h2cP = null;
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve();
    if (h2cP) return h2cP;
    h2cP = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar el generador de imágenes"));
      document.head.appendChild(s);
    });
    return h2cP;
  }
  UI.toast = (msg) => {
    const t = document.getElementById("toast");
    t.textContent = msg; t.style.display = "block";
    clearTimeout(UI._tt); UI._tt = setTimeout(() => (t.style.display = "none"), 2600);
  };
  UI.makeImage = async function (html, filename) {
    UI.toast("Generando imagen…");
    try {
      await loadH2C();
      const host = document.getElementById("canvasHost");
      host.innerHTML = html;
      const node = host.firstElementChild;
      await Promise.all([...node.querySelectorAll("img")].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const canvas = await window.html2canvas(node, { backgroundColor: "#EAE7DC", scale: 1, useCORS: true, logging: false });
      host.innerHTML = "";
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const url = URL.createObjectURL(blob);
      const m = document.getElementById("imgModal");
      m.querySelector(".modal-body").innerHTML = `<img src="${url}" alt="">
        <p class="small muted" style="margin:10px 2px">En el celular: mantén presionada la imagen para guardarla, o usa Compartir para mandarla directo a WhatsApp.</p>
        <div class="row"><button class="btn pri" id="shareBtn">📤 Compartir</button><a class="btn" href="${url}" download="${filename}.png">⬇️ Descargar</a><span class="sp"></span><button class="btn" onclick="document.getElementById('imgModal').classList.remove('on')">Cerrar</button></div>`;
      m.classList.add("on");
      document.getElementById("shareBtn").onclick = async () => {
        const file = new File([blob], filename + ".png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: CFG.leagueName }); } catch (e) { /* cancelado */ }
        } else UI.toast("Tu navegador no permite compartir directo; usa Descargar.");
      };
    } catch (e) {
      UI.toast("Error: " + e.message);
    }
  };
  UI.icLogo = (D) => {
    const src = CFG.logo || (D.league.avatar ? `https://sleepercdn.com/avatars/${D.league.avatar}` : "");
    return src ? `<img class="ic-logo" crossorigin="anonymous" src="${src}">` : `<div class="ic-logo">LB</div>`;
  };
  UI.icFrame = (D, kicker, title, body) => `<div class="ic">
    <div class="ic-top">${UI.icLogo(D)}<div><div class="ic-kicker">${esc(CFG.leagueName)} · ${esc(kicker)}</div><div class="ic-title">${esc(title)}</div></div></div>
    ${body}
    <div class="ic-foot"><span>Temporada ${esc(D.season)}</span><span>Datos en vivo de Sleeper</span></div></div>`;
})();
