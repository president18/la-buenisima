/* =================================================================
   LA BUENÍSIMA · íconos (líneas, sin emojis)
   LB.ico(nombre, tamaño, color)    -> <svg> para el sitio
   LB.icoImg(nombre, tamaño, color) -> <img> (para las imágenes generadas)
   ================================================================= */
(function () {
  const LB = (window.LB = window.LB || {});
  const P = {
    home: "<path d='M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z'/>",
    chart: "<path d='M4 20V11M10 20V4M16 20v-7M2 20h20'/>",
    ball: "<ellipse cx='12' cy='12' rx='10' ry='6' transform='rotate(-35 12 12)'/><path d='M9 9l6 6M11 12.8l1.8-1.8M9.4 11.2l1-1M13.6 14.6l1-1'/>",
    news: "<rect x='3' y='4' width='15' height='16' rx='1'/><path d='M18 8h3v10a2 2 0 0 1-2 2M7 8h7M7 12h7M7 16h4'/>",
    trophy: "<path d='M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z'/><path d='M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4'/>",
    flame: "<path d='M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 2.5-6 .5 2 1.5 3 2.5 3-1-3.5 0-7 1-9z'/>",
    versus: "<path d='M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 21 18v3h-3L6.5 9.5M5 14l-3 3M8 17l-3 3'/>",
    calendar: "<rect x='3' y='5' width='18' height='16' rx='2'/><path d='M16 3v4M8 3v4M3 10h18'/>",
    swap: "<path d='M7 7h13l-4-4M17 17H4l4 4'/>",
    clipboard: "<rect x='5' y='4' width='14' height='17' rx='2'/><path d='M9 4V3h6v1M9 10h6M9 14h6M9 18h4'/>",
    award: "<circle cx='12' cy='9' r='6'/><path d='M8.5 14 7 22l5-3 5 3-1.5-8'/>",
    book: "<path d='M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z'/><path d='M8 8h6M8 12h6'/>",
    menu: "<path d='M3 6h18M3 12h18M3 18h18'/>",
    image: "<rect x='3' y='4' width='18' height='16' rx='2'/><circle cx='9' cy='10' r='2'/><path d='M21 16l-5-5-9 9'/>",
    share: "<path d='M12 3v13M7 8l5-5 5 5'/><path d='M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6'/>",
    download: "<path d='M12 3v13M7 11l5 5 5-5M5 21h14'/>",
    lock: "<rect x='4' y='11' width='16' height='10' rx='2'/><path d='M8 11V7a4 4 0 0 1 8 0v4'/>",
    crown: "<path d='M3 18 2 7l5 4 5-7 5 7 5-4-1 11z'/><path d='M3 21h18'/>",
    star: "<path d='m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z'/>",
    target: "<circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='5'/><circle cx='12' cy='12' r='1'/>",
    couch: "<path d='M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3'/><path d='M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z'/><path d='M5 18v2M19 18v2'/>",
    brick: "<rect x='2' y='5' width='20' height='14'/><path d='M2 12h20M12 5v7M7 12v7M17 12v7'/>",
    zap: "<path d='M13 2 4 14h7l-1 8 9-12h-7z'/>",
    pulse: "<path d='M3 12h4l3-8 4 16 3-8h4'/>",
    dice: "<rect x='3' y='3' width='18' height='18' rx='4'/><circle cx='8' cy='8' r='1.2'/><circle cx='16' cy='16' r='1.2'/><circle cx='12' cy='12' r='1.2'/><circle cx='16' cy='8' r='1.2'/><circle cx='8' cy='16' r='1.2'/>",
    rain: "<path d='M7 14a5 5 0 1 1 9.6-2H18a3 3 0 0 1 0 6H7a3 3 0 0 1 0-4z'/><path d='M9 21l1-2M13 21l1-2'/>",
    search: "<circle cx='11' cy='11' r='7'/><path d='m21 21-5-5'/>",
    dollar: "<path d='M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/>",
    gem: "<path d='M6 3h12l4 6-10 12L2 9z'/><path d='M2 9h20M12 21 8 9l4-6 4 6z'/>",
    gift: "<rect x='3' y='8' width='18' height='13' rx='1'/><path d='M3 12h18M12 8v13M12 8C10 4 6 4 6 7s6 1 6 1 6 2 6-1-4-3-6 1z'/>",
    flag: "<path d='M5 21V4h11l-2 4 2 4H5'/>",
    alert: "<path d='M12 3 2 20h20z'/><path d='M12 10v4M12 17h.01'/>",
    mic: "<rect x='9' y='3' width='6' height='11' rx='3'/><path d='M5 11a7 7 0 0 0 14 0M12 18v3'/>",
    sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'/>",
    storm: "<path d='M17 16a4 4 0 0 0-1-7.9A6 6 0 0 0 4.5 10 3.5 3.5 0 0 0 6 16'/><path d='m13 11-3 5h4l-3 5'/>",
    fog: "<path d='M4 9h16M2 13h20M6 17h12M8 5h8'/>",
    megaphone: "<path d='M3 10v4h4l8 5V5L7 10z'/><path d='M19 9a4 4 0 0 1 0 6'/>",
    ballot: "<rect x='3' y='11' width='18' height='10' rx='1'/><path d='M8 11V4h8v7M10 8h4'/>",
    up: "<path d='M3 17l6-6 4 4 8-8M15 7h6v6'/>",
    down: "<path d='M3 7l6 6 4-4 8 8M15 17h6v-6'/>",
    shield: "<path d='M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z'/>",
    check: "<path d='M4 12l5 5L20 6'/>",
    x: "<path d='M6 6l12 12M18 6 6 18'/>",
    message: "<path d='M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z'/>",
    tag: "<path d='M3 12V3h9l9 9-9 9z'/><circle cx='7.5' cy='7.5' r='1.5'/>",
    frown: "<circle cx='12' cy='12' r='9'/><path d='M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01'/>",
    eyeoff: "<path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'/><path d='M3 3l18 18'/>",
    hammer: "<path d='M14 4l6 6-3 3-6-6zM11 7 3 15l3 3 8-8'/>",
    user: "<circle cx='12' cy='8' r='4'/><path d='M4 21a8 8 0 0 1 16 0'/>",
    repeat: "<path d='M17 2l4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3'/>",
    droplet: "<path d='M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z'/>",
    trash: "<path d='M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15'/>",
    film: "<rect x='3' y='4' width='18' height='16' rx='2'/><path d='M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4'/>",
    copy: "<rect x='8' y='8' width='13' height='13' rx='2'/><path d='M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3'/>",
    clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>",
    medal: "<circle cx='12' cy='15' r='6'/><path d='M8 3l4 6 4-6M12 12v6'/>",
    siren: "<path d='M6 18v-6a6 6 0 0 1 12 0v6M4 21h16M12 3v2M4.5 6.5 6 8M19.5 6.5 18 8'/>",
    refresh: "<path d='M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5'/>",
  };
  const svg = (n, s, c, w) => `<svg class="ico" xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.star}</svg>`;
  LB.ico = (n, s = 18, c = "currentColor", w = 2) => svg(n, s, c, w);
  LB.icoImg = (n, s = 22, c = "#2E2C29", w = 2) => `<img alt="" width="${s}" height="${s}" style="display:inline-block;vertical-align:-${Math.round(s * 0.18)}px" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg(n, s, c, w).replace(' class="ico"', ""))}">`;
  window.IC = LB.ico;
})();
