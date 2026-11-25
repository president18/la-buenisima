/* =================================================================
   RECORRIDO GUIADO · se muestra la primera vez en cada aparato
   y se puede repetir con el botón de ayuda (?)
   ================================================================= */
(function () {
  const SEEN = "lb-tour-v1";
  const T = (window.LBTour = {});
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const vis = (el) => el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
  const pick = (sels) => { for (const s of sels) { const els = document.querySelectorAll(s); for (const e of els) if (vis(e)) return e; } return null; };
  const mobile = () => vis(document.getElementById("bnav"));
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function steps() {
    const me = (window.LBGate && window.LBGate.me()) || {};
    const first = me.name || "";
    return [
      { center: 1, title: first ? `¡Bienvenido, ${first}!` : "¡Bienvenido!", text: "Este es el sitio oficial de La Buenísima: tabla, power ranking, noticias, trash talk y la historia de la liga, todo con datos en vivo de Sleeper. Te lo enseño en un minuto." },
      { sel: [".live"], title: "En vivo desde Sleeper", text: "Todo sale directo de Sleeper. En días de partido se actualiza solo cada 2 minutos, y con la flechita lo actualizas cuando quieras." },
      { sel: ["#themeBtn"], title: "Modo noche", text: "Cambia entre modo claro y oscuro. Por defecto sigue el modo de tu teléfono." },
      { sel: ["#bnav", "#tabs"], title: "Cinco secciones", text: () => (mobile() ? "Abajo tienes las cinco secciones" : "Arriba tienes las cinco secciones") + ": Inicio, Liga, Semana, Equipos e Historia. Cada una tiene sus pestañas." },
      { nav: "inicio", sel: ["#s-inicio > :not(#instBox)"], title: "Inicio: las noticias", text: "El periódico en línea de la liga: breaking news, quién manda y cómo va la tabla. Toca cualquier nota para leerla completa.", tall: 1 },
      { nav: "tabla", sel: ["#subtabs"], title: "Liga", text: "La Tabla (con eficiencia y suerte), el Power Ranking de cada semana, Playoffs con probabilidades de 10,000 simulaciones y Calendarios: cómo irías si te hubiera tocado el calendario de otro." },
      { nav: "tabla", sel: ["#imgStand", "#s-tabla .btn"], title: "Todo se comparte", text: "Donde veas el botón Imagen se arma una imagen lista para mandar al grupo de WhatsApp. Úsalo para presumir (o para hundir a alguien)." },
      { nav: "semana", sel: ["#subtabs"], title: "Semana", text: "Partidos con preview y resultados de cada jornada, La Mañanera (el periódico de la liga) y el Roast, donde nadie se salva." },
      { nav: "equipo", sel: ["#s-equipo .tp-pick", "#tpSel", "#s-equipo"], title: "Equipos", text: "Escoge un equipo y ve su temporada completa: forma, gráfica, roster, próximos partidos y escenarios. En Cara a cara comparas a dos equipos frente a frente.", tall: 1 },
      { nav: "wrapped", sel: ['#subtabs button[data-k^="wrapped"]', "#subtabs"], title: "Wrapped 2026", text: "Tu temporada estilo Spotify Wrapped, con música. Cada quien recibe su link privado. Se abre el 6 de enero, dos días después de la final." },
      { nav: "historia", sel: ["#subtabs"], title: "Historia", text: "Récords de todos los tiempos, el draft con calificaciones, todos los trades y waivers, y los Óscars de la liga." },
      { nav: "inicio", sel: ["#helpBtn"], title: "¿Te perdiste?", text: "Con este botón vuelves a ver el recorrido cuando quieras." },
      { center: 1, final: 1, title: "Tenlo como app", text: ios ? "En Safari toca el botón Compartir y luego “Agregar a inicio”. Así abres La Buenísima como cualquier app." : "Abre el menú ⋮ del navegador y toca “Agregar a pantalla principal”. Así abres La Buenísima como cualquier app." },
    ];
  }

  let root, hole, cardEl, list, idx = 0, busy = false;
  function build() {
    root = document.createElement("div");
    root.id = "tour";
    root.innerHTML = `<div class="tr-hole"></div><div class="tr-card" role="dialog" aria-live="polite"></div>`;
    document.body.appendChild(root);
    hole = root.querySelector(".tr-hole"); cardEl = root.querySelector(".tr-card");
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
  }
  function onKey(e) { if (!root) return; if (e.key === "Escape") end(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }
  function end() {
    try { localStorage.setItem(SEEN, "1"); } catch (e) {}
    document.removeEventListener("keydown", onKey); window.removeEventListener("resize", place);
    if (root) { root.classList.add("out"); const r = root; setTimeout(() => r.remove(), 250); }
    root = null;
    if (location.hash !== "#inicio") location.hash = "inicio";
  }
  let target = null;
  function place() {
    if (!root) return;
    const s = list[idx], vw = window.innerWidth, vh = window.innerHeight;
    const cw = Math.min(360, vw - 24);
    cardEl.style.width = cw + "px";
    if (!target) {
      hole.style.cssText = `left:${vw / 2}px;top:${vh / 2}px;width:0;height:0`;
      cardEl.style.left = (vw - cw) / 2 + "px"; cardEl.style.top = Math.max(16, (vh - cardEl.offsetHeight) / 2) + "px";
      return;
    }
    const r = target.getBoundingClientRect(), pad = 6;
    let top = r.top - pad, h = r.height + pad * 2;
    if (s.tall) h = Math.min(h, vh * 0.42);
    const left = Math.max(4, r.left - pad), w = Math.min(vw - 8, r.width + pad * 2);
    hole.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:${h}px`;
    const ch = cardEl.offsetHeight, below = top + h + 12, above = top - 12 - ch;
    let ct = below + ch <= vh - 8 ? below : above >= 8 ? above : Math.max(8, vh - ch - 8);
    let cl = r.left + r.width / 2 - cw / 2; cl = Math.max(12, Math.min(vw - cw - 12, cl));
    cardEl.style.left = cl + "px"; cardEl.style.top = ct + "px";
  }
  async function show() {
    busy = true;
    const s = list[idx];
    if (s.nav && (location.hash || "#inicio").slice(1) !== s.nav) { location.hash = s.nav; await wait(380); }
    target = s.center ? null : pick(s.sel);
    if (target) {
      const pos = getComputedStyle(target).position;
      const fixed = pos === "fixed" || pos === "sticky" || target.closest(".top, #bnav");
      if (!fixed) { const r = target.getBoundingClientRect(); if (r.top < 70 || r.bottom > window.innerHeight * 0.55) { window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 90), behavior: "auto" }); await wait(60); } }
    }
    const n = list.length, text = typeof s.text === "function" ? s.text() : s.text;
    cardEl.innerHTML = `<div class="tr-head"><span>${idx + 1} de ${n}</span>${s.final ? "" : '<button class="tr-skip">Saltar</button>'}</div>
      <div class="tr-title">${esc(s.title)}</div><p class="tr-text">${esc(text)}</p>
      <div class="tr-dots">${list.map((_, k) => `<i class="${k === idx ? "on" : k < idx ? "done" : ""}"></i>`).join("")}</div>
      <div class="tr-btns">${idx > 0 ? '<button class="btn tr-back">Atrás</button>' : "<span></span>"}<button class="btn pri tr-next">${s.final ? "¡A darle!" : idx === 0 ? "Empezar" : "Siguiente"}</button></div>`;
    cardEl.querySelector(".tr-next").onclick = () => go(1);
    const bk = cardEl.querySelector(".tr-back"); if (bk) bk.onclick = () => go(-1);
    const sk = cardEl.querySelector(".tr-skip"); if (sk) sk.onclick = end;
    cardEl.classList.remove("in"); void cardEl.offsetWidth; cardEl.classList.add("in");
    place();
    busy = false;
  }
  function go(d) {
    if (busy || !root) return;
    const n = idx + d;
    if (n >= list.length) return end();
    if (n < 0) return;
    idx = n; show();
  }
  T.start = function (force) {
    if (root) return;
    if (!force) { try { if (localStorage.getItem(SEEN)) return; } catch (e) {} }
    list = steps(); idx = 0; build(); show();
  };
  // Espera a que el sitio termine de cargar los datos antes de arrancar
  T.maybe = function () {
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      const main = document.getElementById("main");
      const ready = main && main.style.display !== "none" && !document.getElementById("lbGate") && !document.documentElement.classList.contains("lb-locked");
      if (ready) { clearInterval(iv); setTimeout(() => T.start(false), 400); }
      else if (tries > 150) clearInterval(iv);
    }, 200);
  };
  document.addEventListener("DOMContentLoaded", () => { if (window.LBGate && window.LBGate.me()) T.maybe(); });
})();
