/* =================================================================
   LA BUENÍSIMA · ilustraciones y gráficas (SVG)
   Se convierten en <img> para que también salgan en las imágenes.
   ================================================================= */
(function () {
  const LB = window.LB;
  const A = (LB.art = {});
  const C = { bg: "#EAE7DC", sand: "#D8C3A5", gray: "#8E8D8A", coral: "#E98074", red: "#E85A4F", ink: "#2E2C29", cream: "#F6F4EE", gold: "#E0B341" };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  A.toImg = (svg, w, h, style = "") => `<img alt="" width="${w}" height="${h}" style="display:block;${style}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}">`;

  /* ---------------- ilustraciones por tipo de noticia ---------------- */
  const base = (inner, bg = C.sand) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><circle cx="150" cy="150" r="150" fill="${bg}"/>${inner}</svg>`;
  const ICONS = {
    trofeo: () => base(`<path d="M95 70h110v40c0 40-25 68-55 68s-55-28-55-68z" fill="${C.gold}"/><path d="M95 85H65c0 35 15 52 38 55M205 85h30c0 35-15 52-38 55" fill="none" stroke="${C.gold}" stroke-width="12"/><rect x="138" y="176" width="24" height="34" fill="${C.gold}"/><rect x="105" y="208" width="90" height="22" rx="4" fill="${C.ink}"/><path d="M150 95l8 17 18 2-13 12 4 18-17-9-17 9 4-18-13-12 18-2z" fill="${C.cream}"/>`, C.red),
    corona: () => base(`<path d="M70 200l-10-100 50 45 40-70 40 70 50-45-10 100z" fill="${C.gold}"/><rect x="70" y="200" width="160" height="26" rx="5" fill="${C.ink}"/><circle cx="60" cy="98" r="11" fill="${C.cream}"/><circle cx="150" cy="72" r="11" fill="${C.cream}"/><circle cx="240" cy="98" r="11" fill="${C.cream}"/>`, C.red),
    fuego: () => base(`<path d="M150 50c10 40 60 60 60 120a60 60 0 0 1-120 0c0-30 15-45 25-60 5 20 15 30 25 32-10-35 0-70 10-92z" fill="${C.red}"/><path d="M150 140c5 20 30 30 30 55a30 30 0 0 1-60 0c0-15 10-25 15-32 3 10 8 14 12 15-3-15 0-28 3-38z" fill="${C.gold}"/>`, C.ink),
    cohete: () => base(`<path d="M150 45c35 25 50 70 40 130h-80c-10-60 5-105 40-130z" fill="${C.cream}"/><circle cx="150" cy="115" r="18" fill="${C.red}"/><path d="M110 150l-30 40 35-5zM190 150l30 40-35-5z" fill="${C.red}"/><path d="M125 180c5 30 15 50 25 70 10-20 20-40 25-70z" fill="${C.gold}"/>`, C.ink),
    cadena: () => base(`<rect x="45" y="120" width="90" height="50" rx="25" fill="none" stroke="${C.ink}" stroke-width="16" transform="rotate(-20 90 145)"/><rect x="165" y="130" width="90" height="50" rx="25" fill="none" stroke="${C.ink}" stroke-width="16" transform="rotate(20 210 155)"/><path d="M150 80v30M120 92l14 20M180 92l-14 20M150 200v30M120 218l14-20M180 218l-14-20" stroke="${C.red}" stroke-width="9" stroke-linecap="round"/>`),
    ambulancia: () => base(`<rect x="50" y="110" width="150" height="80" rx="8" fill="${C.cream}"/><path d="M200 130h35l25 30v30h-60z" fill="${C.cream}"/><rect x="212" y="138" width="22" height="20" fill="${C.gray}"/><rect x="110" y="128" width="16" height="46" fill="${C.red}"/><rect x="95" y="143" width="46" height="16" fill="${C.red}"/><circle cx="95" cy="195" r="18" fill="${C.ink}"/><circle cx="220" cy="195" r="18" fill="${C.ink}"/><rect x="120" y="92" width="24" height="18" rx="4" fill="${C.red}"/>`, C.coral),
    rayo: () => base(`<path d="M170 40l-80 125h55l-25 95 90-140h-58z" fill="${C.gold}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>`, C.red),
    sillon: () => base(`<rect x="65" y="110" width="170" height="70" rx="20" fill="${C.cream}"/><rect x="45" y="140" width="45" height="75" rx="18" fill="${C.cream}"/><rect x="210" y="140" width="45" height="75" rx="18" fill="${C.cream}"/><rect x="85" y="165" width="130" height="40" rx="10" fill="${C.coral}"/><rect x="70" y="214" width="12" height="22" fill="${C.ink}"/><rect x="218" y="214" width="12" height="22" fill="${C.ink}"/><text x="150" y="88" font-family="Helvetica,Arial" font-weight="700" font-size="40" fill="${C.ink}" text-anchor="middle">Zzz</text>`),
    ladrillo: () => base(`<g fill="${C.red}" stroke="${C.ink}" stroke-width="5"><rect x="55" y="170" width="90" height="45"/><rect x="155" y="170" width="90" height="45"/><rect x="100" y="120" width="100" height="45"/><rect x="45" y="120" width="50" height="45"/><rect x="205" y="120" width="50" height="45"/><rect x="80" y="70" width="90" height="45"/><rect x="175" y="70" width="45" height="45"/></g>`),
    martillo: () => base(`<rect x="140" y="110" width="22" height="140" rx="6" fill="${C.sand}" stroke="${C.ink}" stroke-width="6" transform="rotate(-30 150 180)"/><rect x="75" y="60" width="130" height="60" rx="8" fill="${C.ink}" transform="rotate(-30 140 90)"/><path d="M215 200l25 10M205 225l22 22M230 175l28-2" stroke="${C.cream}" stroke-width="8" stroke-linecap="round"/>`, C.red),
    diamante: () => base(`<path d="M90 110l25-35h70l25 35-60 115z" fill="${C.cream}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/><path d="M90 110h120M115 75l35 150 35-150M150 75v35" stroke="${C.ink}" stroke-width="5" fill="none"/>`, C.coral),
    trade: () => base(`<path d="M70 120h140l-30-30M230 180H90l30 30" fill="none" stroke="${C.cream}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`, C.ink),
    boleto: () => base(`<path d="M55 105h190v30a18 18 0 0 0 0 36v30H55v-30a18 18 0 0 0 0-36z" fill="${C.cream}" stroke="${C.ink}" stroke-width="6"/><text x="150" y="163" font-family="Helvetica,Arial" font-weight="800" font-size="30" fill="${C.red}" text-anchor="middle">PLAYOFFS</text>`, C.red),
    lapida: () => base(`<path d="M90 230V120a60 60 0 0 1 120 0v110z" fill="${C.gray}" stroke="${C.ink}" stroke-width="6"/><text x="150" y="150" font-family="Georgia,serif" font-weight="700" font-size="42" fill="${C.cream}" text-anchor="middle">RIP</text><rect x="70" y="228" width="160" height="16" fill="${C.ink}"/><path d="M118 180h64" stroke="${C.cream}" stroke-width="6"/>`, C.sand),
    fiesta: () => base(`<path d="M80 230l50-130 70 70z" fill="${C.red}"/><path d="M95 192l25 13M108 158l45 25" stroke="${C.gold}" stroke-width="8"/><g fill="${C.ink}"><circle cx="200" cy="80" r="8"/><circle cx="230" cy="130" r="6"/><circle cx="170" cy="60" r="5"/></g><g stroke="${C.cream}" stroke-width="7" stroke-linecap="round"><path d="M210 105l20-15M180 95l5-25M215 150l25 5"/></g>`, C.coral),
  };
  const BY_TYPE = { lider: "corona", porfin: "fiesta", cae: "cadena", crisis: "ambulancia", racha: "cohete", batacazo: "rayo", banca: "sillon", record_alto: "trofeo", record_bajo: "ladrillo", paliza: "martillo", explosion: "fuego", waiver: "diamante", trade: "trade", clasificado: "boleto", eliminado: "lapida", campeon: "trofeo" };
  A.iconFor = (type) => (ICONS[BY_TYPE[type] || "rayo"] || ICONS.rayo)();
  A.icon = (name) => (ICONS[name] || ICONS.rayo)();

  /* ---------------- gráficas ---------------- */
  // Barras horizontales: rows = [{label, value, color, strong}]
  A.hbars = function (rows, o = {}) {
    const W = o.w || 400, rh = o.rowH || 34, pad = 6, lw = o.labelW || 150, vw = 56;
    const H = rows.length * rh + (o.title ? 30 : 0) + 8;
    const max = o.max || Math.max(...rows.map((r) => r.value), 1);
    const font = o.font || "Georgia,serif";
    let y0 = o.title ? 30 : 4;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    if (o.title) s += `<text x="0" y="18" font-family="${font}" font-size="15" font-weight="700" letter-spacing="2" fill="${C.ink}">${esc(o.title.toUpperCase())}</text>`;
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      const bw = Math.max(2, ((W - lw - vw - 8) * r.value) / max);
      s += `<text x="${lw - 8}" y="${y + rh / 2 + 5}" font-family="${font}" font-size="14" text-anchor="end" fill="${C.ink}" ${r.strong ? 'font-weight="700"' : ""}>${esc(r.label.length > 19 ? r.label.slice(0, 18) + "…" : r.label)}</text>`;
      s += `<rect x="${lw}" y="${y + pad}" width="${bw}" height="${rh - pad * 2}" fill="${r.color || C.sand}"/>`;
      s += `<text x="${lw + bw + 6}" y="${y + rh / 2 + 5}" font-family="${font}" font-size="14" font-weight="700" fill="${C.ink}">${esc(r.display || r.value.toFixed(1))}</text>`;
    });
    if (o.avg) { const x = lw + ((W - lw - vw - 8) * o.avg) / max; s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + rows.length * rh}" stroke="${C.ink}" stroke-dasharray="4 4" stroke-width="1.5"/><text x="${x + 4}" y="${y0 + rows.length * rh + 2}" font-family="${font}" font-size="11" fill="${C.gray}">prom ${o.avg.toFixed(1)}</text>`; }
    return s + "</svg>";
  };
  // Cara a cara por posición (espejo)
  A.mirror = function (labels, left, right, o = {}) {
    const W = o.w || 400, rh = o.rowH || 30, mid = W / 2, cw = 44;
    const H = labels.length * rh + 40;
    const max = Math.max(...left, ...right, 1);
    const half = mid - cw / 2 - 34;
    const font = "Georgia,serif";
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    s += `<text x="${mid - cw / 2 - 4}" y="16" font-family="${font}" font-size="13" font-weight="700" text-anchor="end" fill="${C.red}">${esc(o.a || "")}</text><text x="${mid + cw / 2 + 4}" y="16" font-family="${font}" font-size="13" font-weight="700" fill="${C.ink}">${esc(o.b || "")}</text>`;
    labels.forEach((l, i) => {
      const y = 28 + i * rh;
      const lw = (half * left[i]) / max, rw = (half * right[i]) / max;
      const aWin = left[i] >= right[i];
      s += `<rect x="${mid - cw / 2 - lw}" y="${y + 4}" width="${lw}" height="${rh - 8}" fill="${aWin ? C.red : C.coral}" opacity="${aWin ? 1 : 0.55}"/>`;
      s += `<rect x="${mid + cw / 2}" y="${y + 4}" width="${rw}" height="${rh - 8}" fill="${!aWin ? C.ink : C.gray}" opacity="${!aWin ? 1 : 0.55}"/>`;
      s += `<text x="${mid}" y="${y + rh / 2 + 5}" font-family="Helvetica,Arial" font-size="12" font-weight="700" text-anchor="middle" fill="${C.ink}">${esc(l)}</text>`;
      s += `<text x="${mid - cw / 2 - lw - 4}" y="${y + rh / 2 + 5}" font-family="${font}" font-size="12" text-anchor="end" fill="${C.ink}">${left[i].toFixed(1)}</text>`;
      s += `<text x="${mid + cw / 2 + rw + 4}" y="${y + rh / 2 + 5}" font-family="${font}" font-size="12" fill="${C.ink}">${right[i].toFixed(1)}</text>`;
    });
    return s + "</svg>";
  };
  // Línea de puntos por semana de un equipo
  A.spark = function (vals, o = {}) {
    const W = o.w || 360, H = o.h || 110, p = 14;
    const mx = Math.max(...vals), mn = Math.min(...vals);
    const x = (i) => p + (i * (W - 2 * p)) / Math.max(1, vals.length - 1);
    const y = (v) => H - p - ((v - mn) * (H - 2 * p)) / Math.max(1, mx - mn);
    const d = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="${d}" fill="none" stroke="${C.red}" stroke-width="3"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === vals.length - 1 ? 6 : 3.5}" fill="${i === vals.length - 1 ? C.red : C.ink}"/>`).join("")}</svg>`;
  };
  A.colors = C;
})();
