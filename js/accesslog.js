/* =================================================================
   TABLA PRIVADA DE ACCESOS (solo en la página privada)
   Lee el registro de Google Sheets que llena js/gate.js
   ================================================================= */
(function () {
  const LB = window.LB, CFG = window.LB_CONFIG;
  const A = (LB.accessLog = {});
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TZ = "America/Mexico_City";
  const fmtDate = (d) => d.toLocaleString("es-MX", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  function ago(d) {
    const m = Math.round((Date.now() - d) / 60000);
    if (m < 1) return "ahora"; if (m < 60) return `hace ${m} min`;
    const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
    const dd = Math.round(h / 24); return dd === 1 ? "ayer" : `hace ${dd} días`;
  }
  let rows = [], filter = "";

  A.html = () => `<div class="row" style="align-items:flex-end"><div><div class="h3" style="margin:0">Quién ha entrado</div><p class="sub" style="margin:4px 0 10px">Registro privado de entradas al sitio. Solo tú lo ves.</p></div><span class="sp"></span><button class="btn" id="alRefresh">Actualizar</button></div><div id="alBody"><p class="small muted">Cargando registro…</p></div>`;

  function people() { const n = CFG.nicknames || {}; return Object.keys(n).map((u) => ({ user: u, name: n[u] })).concat(CFG.accessExtra || []); }

  function view() {
    const body = document.getElementById("alBody"); if (!body) return;
    if (!rows.length) { body.innerHTML = `<p class="small muted">Todavía nadie ha entrado (o el registro está vacío).</p>`; return; }
    const by = {};
    rows.forEach((r) => {
      const k = (r.user || "") + "|" + r.name;
      const p = (by[k] = by[k] || { name: r.name, user: r.user, n: 0, last: 0, first: Infinity, dev: new Set() });
      const t = new Date(r.ts).getTime(); if (isNaN(t)) return;
      p.n++; p.last = Math.max(p.last, t); p.first = Math.min(p.first, t); if (r.device) p.dev.add(r.device + (r.mode === "App" ? " (app)" : ""));
    });
    const list = Object.values(by).sort((a, b) => b.last - a.last);
    const seen = new Set(list.map((p) => (p.user || "").toLowerCase()));
    const missing = people().filter((p) => !seen.has(p.user.toLowerCase()));
    const opts = list.map((p) => `<option value="${esc((p.user || "") + "|" + p.name)}" ${filter === (p.user || "") + "|" + p.name ? "selected" : ""}>${esc(p.name)}</option>`).join("");
    const shown = rows.filter((r) => !filter || (r.user || "") + "|" + r.name === filter).slice().sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 150);
    body.innerHTML = `
      <div class="kpis" style="margin-bottom:12px"><div class="kpi"><div class="l">Han entrado</div><div class="v">${list.length}</div><div class="d">de ${people().length} en la lista</div></div><div class="kpi"><div class="l">Visitas</div><div class="v">${rows.length}</div><div class="d">registradas</div></div><div class="kpi"><div class="l">Última</div><div class="v" style="font-size:22px">${list[0] ? esc(list[0].name) : "—"}</div><div class="d">${list[0] ? ago(list[0].last) : ""}</div></div></div>
      ${missing.length ? `<p class="small" style="margin:0 0 12px"><b>Todavía no entran:</b> ${missing.map((p) => esc(p.name)).join(", ")}</p>` : `<p class="small good" style="margin:0 0 12px"><b>Ya entraron todos.</b></p>`}
      <div class="tbl-wrap"><table><thead><tr><th>Quién</th><th class="r">Visitas</th><th>Última visita</th><th class="hide-m">Primera</th><th class="hide-m">Aparatos</th></tr></thead><tbody>
        ${list.map((p) => `<tr><td><b>${esc(p.name)}</b>${p.user ? `<div class="small faint">${esc(p.user)}</div>` : ""}</td><td class="r num">${p.n}</td><td>${ago(p.last)}<div class="small faint">${fmtDate(new Date(p.last))}</div></td><td class="hide-m small">${fmtDate(new Date(p.first))}</td><td class="hide-m small">${esc([...p.dev].join(", "))}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="row" style="margin:18px 0 8px"><div class="h3" style="margin:0;font-size:20px">Cada entrada</div><span class="sp"></span><select id="alFilter"><option value="">Todos</option>${opts}</select></div>
      <div class="tbl-wrap"><table><thead><tr><th>Fecha y hora</th><th>Quién</th><th>Evento</th><th>Aparato</th><th class="hide-m">Entró a</th></tr></thead><tbody>
        ${shown.map((r) => `<tr><td class="small">${fmtDate(new Date(r.ts))}</td><td>${esc(r.name)}</td><td class="small">${esc(r.event)}</td><td class="small">${esc(r.device)} · ${esc(r.browser)}${r.mode === "App" ? " · app" : ""}</td><td class="hide-m small">${esc(r.section)}</td></tr>`).join("")}
      </tbody></table></div>${rows.length > 150 && !filter ? `<p class="small faint">Mostrando las últimas 150. Todo el historial está en tu hoja de Google.</p>` : ""}`;
    const f = document.getElementById("alFilter"); if (f) f.onchange = () => { filter = f.value; view(); };
  }

  A.load = async function () {
    const body = document.getElementById("alBody"); if (!body) return;
    const btn = document.getElementById("alRefresh"); if (btn) btn.onclick = () => A.load();
    if (!CFG.accessLogUrl) {
      body.innerHTML = `<div class="card"><b>Falta conectar la hoja de Google.</b><p class="small muted" style="margin:6px 0 0">La contraseña y el recorrido ya funcionan. Las entradas se van guardando en cada aparato y se mandan solas en cuanto conectes la hoja.</p></div>`;
      return;
    }
    body.innerHTML = `<p class="small muted">Cargando registro…</p>`;
    try {
      const r = await fetch(CFG.accessLogUrl + "?key=" + encodeURIComponent(CFG.accessLogKey || "") + "&t=" + Date.now());
      const j = await r.json();
      if (j.error) throw new Error(j.error === "clave" ? "la clave no coincide" : j.error);
      rows = j.rows || [];
      view();
    } catch (e) {
      body.innerHTML = `<p class="small bad">No pude leer el registro (${esc(e.message)}).</p>`;
    }
  };
})();
