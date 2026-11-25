/* =================================================================
   ACCESO AL SITIO
   - Contraseña de la liga (se guarda solo su huella, no el texto)
   - El aparato se recuerda: no se vuelve a pedir
   - La primera vez cada quien elige quién es
   - Cada visita se registra en Google Sheets (si está configurado)
   ================================================================= */
(function () {
  const CFG = window.LB_CONFIG || {};
  const KEY = "lb-access", QKEY = "lb-log-queue", LKEY = "lb-log-last";
  const SITE_HASH = "13e83bbf37003e";
  const G = (window.LBGate = {});

  // Huella de 53 bits (cyrb53) con sal; suficiente para no dejar la contraseña en texto plano
  function hash(str) {
    let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }
  const pwHash = (pw) => hash("la-buenisima|" + pw);
  G._hash = pwHash;

  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  G.me = () => { const a = ls.get(KEY); return a && a.h === SITE_HASH ? a : null; };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* --- aparato --- */
  function device() {
    const ua = navigator.userAgent || "";
    const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad" : /Android/.test(ua) ? (/Mobile/.test(ua) ? "Android" : "Tablet Android") : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Otro";
    const br = /CriOS|Chrome\//.test(ua) && !/Edg/.test(ua) ? "Chrome" : /Edg/.test(ua) ? "Edge" : /FxiOS|Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Otro";
    const app = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone ? "App" : "Navegador";
    return { os, br, app };
  }

  /* --- registro de visitas --- */
  function flush() {
    const url = CFG.accessLogUrl, q = ls.get(QKEY) || [];
    if (!url || !q.length) return;
    ls.set(QKEY, []);
    fetch(url, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ rows: q }) })
      .catch(() => { const back = ls.get(QKEY) || []; ls.set(QKEY, q.concat(back).slice(-60)); });
  }
  function send(ev) {
    const q = ls.get(QKEY) || [];
    q.push(ev);
    while (q.length > 60) q.shift();
    ls.set(QKEY, q);
    flush();
  }
  G.log = function (event, force) {
    const me = G.me(); if (!me) return;
    const now = Date.now(), last = Number(localStorage.getItem(LKEY) || 0);
    if (!force && now - last < 30 * 60 * 1000) return;
    try { localStorage.setItem(LKEY, String(now)); } catch (e) {}
    const d = device();
    send({ ts: new Date(now).toISOString(), name: me.name, user: me.user || "", event, device: d.os, browser: d.br, mode: d.app, section: (location.hash || "#inicio").slice(1), id: me.id });
  };

  /* --- pantalla de acceso --- */
  function people() {
    const nick = CFG.nicknames || {};
    return Object.keys(nick).map((u) => ({ user: u, name: nick[u] })).concat(CFG.accessExtra || []).sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  function gate(onDone) {
    const el = document.createElement("div");
    el.id = "lbGate";
    el.innerHTML = `<div class="gt-box">
      <img class="gt-logo" src="${esc(CFG.logo || "")}" alt="">
      <div class="gt-kick">Fantasy Football · Temporada ${new Date().getFullYear()}</div>
      <h1 class="gt-title">La Buenísima</h1>
      <div class="gt-step" id="gtPw">
        <p>Este sitio es solo para la liga. Escribe la contraseña que mandó el comisionado.</p>
        <div class="gt-field"><input id="gtIn" type="password" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Contraseña"><button type="button" id="gtEye" aria-label="Mostrar contraseña">Ver</button></div>
        <p class="gt-err" id="gtErr">Contraseña incorrecta. Revisa mayúsculas y símbolos.</p>
        <button class="btn pri gt-go" id="gtGo">Entrar</button>
      </div>
      <div class="gt-step" id="gtWho" hidden>
        <p><b>¿Quién eres?</b> Solo te lo preguntamos una vez en este aparato.</p>
        <div class="gt-people">${people().map((p) => `<button data-u="${esc(p.user)}" data-n="${esc(p.name)}"><b>${esc(p.name)}</b><span>${esc(p.user)}</span></button>`).join("")}<button data-u="" data-n="" class="gt-other"><b>Otro</b><span>Escribir mi nombre</span></button></div>
        <div class="gt-field" id="gtOtherBox" hidden><input id="gtOther" type="text" maxlength="40" placeholder="Tu nombre"></div>
        <p class="gt-err" id="gtErr2">Escribe tu nombre.</p>
        <button class="btn pri gt-go" id="gtGo2" disabled>Entrar</button>
      </div>
    </div>`;
    document.body.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const input = $("#gtIn");
    setTimeout(() => input.focus(), 50);
    $("#gtEye").onclick = () => { const on = input.type === "password"; input.type = on ? "text" : "password"; $("#gtEye").textContent = on ? "Ocultar" : "Ver"; };
    const tryPw = () => {
      if (pwHash(input.value) === SITE_HASH) { $("#gtPw").hidden = true; $("#gtWho").hidden = false; }
      else { $("#gtErr").classList.add("on"); input.select(); }
    };
    $("#gtGo").onclick = tryPw;
    input.onkeydown = (e) => { $("#gtErr").classList.remove("on"); if (e.key === "Enter") tryPw(); };
    let pick = null;
    el.querySelectorAll(".gt-people button").forEach((b) => (b.onclick = () => {
      el.querySelectorAll(".gt-people button").forEach((x) => x.classList.toggle("on", x === b));
      pick = { user: b.dataset.u, name: b.dataset.n };
      const other = b.classList.contains("gt-other");
      $("#gtOtherBox").hidden = !other; if (other) $("#gtOther").focus();
      $("#gtGo2").disabled = false;
    }));
    const finish = () => {
      if (!pick) return;
      let name = pick.name;
      if (!pick.user) { name = $("#gtOther").value.trim(); if (!name) { $("#gtErr2").classList.add("on"); return; } }
      const prev = ls.get(KEY);
      ls.set(KEY, { h: SITE_HASH, name, user: pick.user, id: (prev && prev.id) || Math.random().toString(36).slice(2, 10), at: new Date().toISOString() });
      G.log("primer ingreso", true);
      el.classList.add("out");
      setTimeout(() => { el.remove(); document.documentElement.classList.remove("lb-locked"); onDone && onDone(); }, 350);
    };
    $("#gtGo2").onclick = finish;
    $("#gtOther").onkeydown = (e) => { $("#gtErr2").classList.remove("on"); if (e.key === "Enter") finish(); };
  }

  /* --- botón de ayuda (recorrido y cambiar de usuario) --- */
  function helpButton() {
    const live = document.querySelector(".live"); if (!live || document.getElementById("helpBtn")) return;
    const b = document.createElement("button");
    b.id = "helpBtn"; b.className = "theme-btn"; b.title = "Ayuda"; b.setAttribute("aria-label", "Ayuda y recorrido");
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.5-2.7 4"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>';
    live.insertBefore(b, document.getElementById("themeBtn") || live.querySelector("#refreshBtn"));
    b.onclick = () => {
      const me = G.me() || {};
      const sh = document.getElementById("sheet"), inn = document.getElementById("sheetIn");
      if (!sh || !inn) return;
      inn.innerHTML = `<div class="h3" style="margin-top:0">Ayuda</div>
        <button class="btn pri" id="hTour" style="width:100%;justify-content:center;margin:6px 0 14px">Ver el recorrido del sitio</button>
        <p class="small muted" style="margin:0 0 8px">Entraste como <b>${esc(me.name || "—")}</b> en este aparato.</p>
        <button class="btn" id="hSwitch" style="width:100%;justify-content:center">No soy yo: cambiar de usuario</button>`;
      sh.classList.add("on");
      inn.querySelector("#hTour").onclick = () => { sh.classList.remove("on"); window.LBTour && window.LBTour.start(true); };
      inn.querySelector("#hSwitch").onclick = () => {
        try { localStorage.removeItem(KEY); localStorage.removeItem(LKEY); } catch (e) {}
        sh.classList.remove("on"); document.documentElement.classList.add("lb-locked");
        gate(() => {});
      };
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    helpButton();
    if (G.me()) {
      document.documentElement.classList.remove("lb-locked");
      G.log("visita");
      flush();
    } else {
      gate(() => { G.ready = true; window.LBTour && window.LBTour.maybe(); });
    }
  });
})();
