/* Modo noche: sigue el modo del teléfono salvo que el usuario elija. */
(function () {
  var KEY = "lb-theme";
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function system() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "dark" ? "#1B1916" : "#EAE7DC");
    var b = document.getElementById("themeBtn"); if (b) b.innerHTML = icon(t);
  }
  function icon(t) {
    return t === "dark"
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
  apply(saved() || system());
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () { if (!saved()) apply(system()); });
  document.addEventListener("DOMContentLoaded", function () {
    var live = document.querySelector(".live");
    if (!live) return;
    var b = document.createElement("button");
    b.id = "themeBtn"; b.className = "theme-btn"; b.title = "Modo noche"; b.setAttribute("aria-label", "Cambiar modo claro u oscuro");
    b.onclick = function () { var t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); };
    live.insertBefore(b, live.querySelector("#refreshBtn"));
    apply(document.documentElement.getAttribute("data-theme"));
  });
})();
