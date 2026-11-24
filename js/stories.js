/* =================================================================
   LA BUENÍSIMA · motor de historias
   Detecta lo que pasó (rachas, récords, trades, batacazos…) y lo
   redacta como nota periodística. Lo usan Breaking News y La Mañanera.
   ================================================================= */
(function () {
  const LB = window.LB, UI = LB.ui;
  const { rng, sum } = LB.util;
  const f1 = (x) => UI.f1(x);
  const ST = (LB.stories = {});
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const T = (D, r) => UI.tName(D, r);
  const O = (D, r) => UI.oName(D, r);
  const P = (D, p) => (D.players[p] ? D.players[p].name : p);
  const num = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce"];
  const n2 = (n) => num[n] || String(n);

  function resultsUpTo(D, r, w) {
    return Object.values(D.tw[r]).filter((x) => x.w <= w && x.reg !== false).map((x) => x.res);
  }
  function streakBefore(seq) {
    // racha que traía antes del último resultado
    const prev = seq.slice(0, -1);
    if (!prev.length) return { t: null, n: 0 };
    const t = prev[prev.length - 1];
    let n = 0;
    for (let i = prev.length - 1; i >= 0 && prev[i] === t; i--) n++;
    return { t, n };
  }
  function currentStreak(seq) {
    if (!seq.length) return { t: null, n: 0 };
    const t = seq[seq.length - 1];
    let n = 0;
    for (let i = seq.length - 1; i >= 0 && seq[i] === t; i--) n++;
    return { t, n };
  }

  /* ---------------- detección de eventos ---------------- */
  ST.events = function (D) {
    if (D._events) return D._events;
    const ev = [];
    const add = (e) => { e.id = `${e.type}-${e.week}-${(e.rids || []).join("_")}-${(e.pids || []).join("_")}`; ev.push(e); };
    let maxScore = -1, minScore = 1e9, maxMargin = -1, maxPerf = -1;
    for (const w of D.playedWeeks) {
      const R = rng("ev" + w);
      const reg = w <= D.regEnd;
      const st = reg ? D.standingsAt(w) : null;
      const prev = reg && w > 1 ? D.standingsAt(w - 1) : null;
      const tws = D.rids.map((r) => ({ rid: r, ...D.tw[r][w] })).filter((x) => x.pf != null);

      // Cambio de líder
      if (reg && prev && w >= 3 && st[0].rid !== prev[0].rid) {
        const r = st[0].rid;
        add({ week: w, type: "lider", imp: 72, rids: [r, prev[0].rid], kicker: "CAMBIO EN LA CIMA",
          headline: pick(R, [`${T(D, r)}, nuevo líder de La Buenísima`, `Hay nuevo rey: ${T(D, r)} toma el primer lugar`, `${T(D, r)} le arrebata la cima a ${T(D, prev[0].rid)}`]),
          sub: `Con récord de ${UI.rec(st[0])}, ${O(D, r)} manda en la tabla después de la semana ${w}.`,
          body: `${T(D, prev[0].rid)} venía como líder, pero la semana ${w} movió todo. ${T(D, r)} suma ${f1(st[0].pf)} puntos a favor en la temporada y ahora todos lo persiguen a él.`,
          stat: { v: UI.rec(st[0]), l: "récord" } });
      }

      for (const x of tws) {
        if (!reg || !x.res) continue;
        const seq = resultsUpTo(D, x.rid, w);
        const before = streakBefore(seq), cur = currentStreak(seq);
        // Fin de racha perdedora
        if (x.res === "W" && before.t === "L" && before.n >= 3) {
          const firstWin = seq.filter((s) => s === "W").length === 1;
          add({ week: w, type: "porfin", imp: 45 + before.n * 9 + (firstWin ? 15 : 0), rids: [x.rid, x.opp],
            kicker: firstWin ? "¡POR FIN!" : "SE ACABÓ LA SEQUÍA",
            headline: firstWin ? `${T(D, x.rid)} gana su primer partido de la temporada` : `${T(D, x.rid)} rompe una racha de ${n2(before.n)} derrotas`,
            sub: `Venció a ${T(D, x.opp)} ${f1(x.pf)}–${f1(x.pa)} después de ${before.n} semanas sin ganar.`,
            body: pick(R, [
              `Hubo fiesta en la casa de ${O(D, x.rid)}. Tras ${n2(before.n)} derrotas al hilo, ${T(D, x.rid)} por fin sacó la victoria, y nada menos que ante ${T(D, x.opp)}. ¿Es el inicio de una remontada o solo un respiro?`,
              `Se rompió la maldición. ${T(D, x.rid)} llevaba ${n2(before.n)} semanas sin ganar y esta vez le metió ${f1(x.pf)} puntos a ${T(D, x.opp)}. La liga ya tiene un equipo menos al que ganarle seguro.`,
            ]), stat: { v: before.n, l: "derrotas seguidas que terminan" } });
        }
        // Fin de racha ganadora / invicto
        if (x.res === "L" && before.t === "W" && before.n >= 4) {
          const undefeated = seq.slice(0, -1).every((s) => s === "W");
          add({ week: w, type: "cae", imp: 40 + before.n * 7 + (undefeated ? 25 : 0), rids: [x.rid, x.opp],
            kicker: undefeated ? "CAE EL INVICTO" : "SE ACABÓ LA RACHA",
            headline: undefeated ? `${T(D, x.opp)} le quita el invicto a ${T(D, x.rid)}` : `${T(D, x.opp)} frena a ${T(D, x.rid)} tras ${n2(before.n)} victorias`,
            sub: `${f1(x.pa)}–${f1(x.pf)} en la semana ${w}.`,
            body: `${T(D, x.rid)} traía ${n2(before.n)} triunfos seguidos y parecía imparable. ${T(D, x.opp)} no leyó el guion y lo bajó de la nube con ${f1(x.pa)} puntos.`,
            stat: { v: before.n, l: "victorias seguidas que terminan" } });
        }
        if (x.res === "L" && cur.t === "L" && (cur.n === 5 || cur.n === 8)) {
          add({ week: w, type: "crisis", imp: 38 + cur.n * 5, rids: [x.rid], kicker: "CRISIS",
            headline: `${T(D, x.rid)} suma ${n2(cur.n)} derrotas seguidas`,
            sub: `Perdió ${f1(x.pf)}–${f1(x.pa)} contra ${T(D, x.opp)}.`,
            body: pick(R, [`Alarmas encendidas en el cuartel de ${O(D, x.rid)}. Ya son ${n2(cur.n)} semanas sin ganar y el castigo del último lugar empieza a verse muy cerca.`, `Nada le sale a ${T(D, x.rid)}: ${n2(cur.n)} derrotas al hilo. Se aceptan sugerencias, rezos y trades.`]),
            stat: { v: cur.n, l: "derrotas seguidas" } });
        }
        if (x.res === "W" && cur.t === "W" && (cur.n === 5 || cur.n === 7 || cur.n === 9)) {
          add({ week: w, type: "racha", imp: 36 + cur.n * 5, rids: [x.rid], kicker: "IMPARABLE",
            headline: `${T(D, x.rid)} hila ${n2(cur.n)} victorias`, sub: `La última: ${f1(x.pf)}–${f1(x.pa)} sobre ${T(D, x.opp)}.`,
            body: `${O(D, x.rid)} no conoce la derrota desde hace ${n2(cur.n)} semanas. ¿Alguien lo va a parar antes de playoffs?`,
            stat: { v: cur.n, l: "victorias seguidas" } });
        }
        // Batacazo
        if (prev && x.res === "W" && w >= 4) {
          const pw = prev.find((s) => s.rid === x.rid), pl = prev.find((s) => s.rid === x.opp);
          if (pw && pl && pl.rank === 1 && pw.rank >= D.numTeams - 2) {
            add({ week: w, type: "batacazo", imp: 74, rids: [x.rid, x.opp], kicker: "BATACAZO",
              headline: `${T(D, x.rid)} tumba al líder`, sub: `El ${pw.rank}° lugar venció al ${pl.rank}°: ${f1(x.pf)}–${f1(x.pa)}.`,
              body: `Nadie le daba chance. ${T(D, x.rid)} llegaba con ${UI.rec(pw)} y ${T(D, x.opp)} con ${UI.rec(pl)}. En el fantasy no hay enemigo pequeño.`,
              stat: { v: f1(x.pf - x.pa), l: "pts de diferencia" } });
          }
        }
        // Derrota con la victoria en la banca
        if (x.res === "L" && x.max > x.pa && x.max - x.pf >= 22) {
          add({ week: w, type: "banca", imp: 42 + Math.min(20, (x.max - x.pf - 22)), rids: [x.rid, x.opp], kicker: "LA REGÓ",
            headline: `${T(D, x.rid)} dejó el triunfo en la banca`, sub: `Perdió por ${f1(x.pa - x.pf)} con ${f1(x.max - x.pf)} pts sin usar.`,
            body: `Con su mejor lineup posible, ${T(D, x.rid)} hubiera hecho ${f1(x.max)} y le ganaba a ${T(D, x.opp)}. ${O(D, x.rid)}, la próxima revisa el lineup antes del domingo.`,
            stat: { v: f1(x.max - x.pf), l: "pts en la banca" } });
        }
      }

      // Récords de la temporada
      const top = tws.slice().sort((a, b) => b.pf - a.pf)[0];
      const low = tws.slice().sort((a, b) => a.pf - b.pf)[0];
      if (top && w >= 3 && top.pf > maxScore) {
        add({ week: w, type: "record_alto", imp: 78, rids: [top.rid], kicker: "RÉCORD",
          headline: `${f1(top.pf)}: ${T(D, top.rid)} rompe el récord de puntos`, sub: `La mejor semana de la temporada. Superó la marca anterior de ${f1(maxScore)}.`,
          body: `${T(D, top.rid)} se volvió loco en la semana ${w}. Nadie en La Buenísima había metido tantos puntos en una sola jornada.`, stat: { v: f1(top.pf), l: "pts, récord de la temporada" } });
      }
      if (low && w >= 3 && low.pf < minScore) {
        add({ week: w, type: "record_bajo", imp: 56, rids: [low.rid], kicker: "PARA EL OLVIDO",
          headline: `${T(D, low.rid)} firma la peor semana de la temporada`, sub: `Apenas ${f1(low.pf)} puntos en la semana ${w}.`,
          body: `Hay semanas malas y luego está esta. ${O(D, low.rid)} va a querer borrar la semana ${w} de su memoria.`, stat: { v: f1(low.pf), l: "pts, la peor marca" } });
      }
      if (top) maxScore = Math.max(maxScore, top.pf);
      if (low) minScore = Math.min(minScore, low.pf);
      for (const g of D.games[w]) {
        const a = D.tw[g.a][w], b = D.tw[g.b][w];
        if (!a || !b) continue;
        const m = Math.abs(a.pf - b.pf);
        if (w >= 3 && m > maxMargin) {
          const W = a.pf > b.pf ? g.a : g.b, L = W === g.a ? g.b : g.a;
          add({ week: w, type: "paliza", imp: 58, rids: [W, L], kicker: "PALIZA HISTÓRICA",
            headline: `${T(D, W)} humilla a ${T(D, L)} por ${f1(m)} puntos`, sub: `La paliza más grande de la temporada.`,
            body: `Fue un atropello. ${T(D, W)} le pasó por encima a ${T(D, L)} y estableció la mayor diferencia del año en La Buenísima.`, stat: { v: "+" + f1(m), l: "pts de diferencia" } });
        }
        maxMargin = Math.max(maxMargin, m);
      }
      // Actuaciones individuales
      for (const r of D.rids) {
        const e = D.weeks[w][r];
        if (!e) continue;
        e.starters.forEach((p, i) => {
          const pts = e.sp[i] || 0;
          if (pts >= 36 || (w >= 3 && pts > maxPerf && pts >= 30)) {
            add({ week: w, type: "explosion", imp: 44 + (pts - 30) * 1.8 + (pts > maxPerf && w >= 3 ? 10 : 0), rids: [r], pids: [p], kicker: pts > maxPerf && w >= 3 ? "ACTUACIÓN RÉCORD" : "EXPLOSIÓN",
              headline: `${P(D, p)} explota con ${f1(pts)} puntos`, sub: D.tw[r][w] && D.tw[r][w].res === "W" ? `Le dio la victoria a ${T(D, r)}.` : `Jugó para ${T(D, r)}, que aun así perdió.`,
              body: `${P(D, p)} tuvo una semana de otro planeta y ${O(D, r)} lo tenía de titular. ${D.tw[r][w].res === "W" ? "Y sí, le alcanzó para ganar." : "Ni así le alcanzó para ganar."}`, stat: { v: f1(pts), l: "pts de un solo jugador" } });
          }
          maxPerf = Math.max(maxPerf, pts);
        });
      }
      // Joyas de waiver (mismo week del alta)
      D.pickups.filter((p) => p.week === w).forEach((p) => {
        const e = D.weeks[w][p.rid];
        if (!e) return;
        const i = e.starters.indexOf(p.pid);
        const pts = i >= 0 ? e.sp[i] || 0 : 0;
        if (pts >= 24) add({ week: w, type: "waiver", imp: 40 + (pts - 24) * 1.5, rids: [p.rid], pids: [p.pid], kicker: "JOYA DEL WAIVER",
          headline: `${P(D, p.pid)} llega del waiver y mete ${f1(pts)}`, sub: `${T(D, p.rid)} lo levantó esta misma semana.`,
          body: `Mientras unos duermen, ${O(D, p.rid)} trabaja el waiver. ${P(D, p.pid)} llegó sin costo y respondió de inmediato.`, stat: { v: f1(pts), l: "pts en su debut" } });
      });
    }
    // Trades
    for (const t of D.trades) {
      if (t.sides.length !== 2) continue;
      const tot = sum(t.sides.flatMap((s) => s.gets.map((g) => D.ppg(g.pid))));
      const R = rng("tr" + t.time);
      const [a, b] = t.sides;
      const names = (s) => s.gets.map((g) => P(D, g.pid)).join(" y ");
      const big = tot >= 28;
      add({ week: t.week, type: "trade", imp: 38 + Math.min(45, tot * 1.1), rids: [a.rid, b.rid], pids: t.sides.flatMap((s) => s.gets.map((g) => g.pid)),
        kicker: big ? "BOMBAZO" : "TRADE",
        headline: big ? pick(R, [`Bombazo: ${names(a)} se va con ${T(D, a.rid)}`, `Se mueve el mercado: ${T(D, a.rid)} y ${T(D, b.rid)} cierran un trade grande`]) : `${T(D, a.rid)} y ${T(D, b.rid)} hacen negocio`,
        sub: `${T(D, a.rid)} recibe a ${names(a) || "—"}; ${T(D, b.rid)} se queda con ${names(b) || "—"}.`,
        body: t.winner ? `Desde el trade, ${T(D, t.winner)} va ganando el intercambio por ${f1(t.margin)} puntos como titulares. El tiempo dirá quién se equivocó.` : `Hasta ahora el trade va parejo. Ninguno de los dos se puede burlar todavía.`,
        stat: { v: f1(tot), l: "pts por partido en juego" } });
    }
    // Playoffs: clasificados / eliminados (estado actual)
    if (D.sim && D.sim.remaining.length && D.lastScored <= D.regEnd) {
      const w = D.lastScored;
      D.rids.forEach((r) => {
        const o = D.sim.out[r];
        const s = D.standings.find((x) => x.rid === r);
        if (o.playoff >= 0.995 && w >= 9) add({ week: w, type: "clasificado", imp: 60, rids: [r], kicker: "A PLAYOFFS", headline: `${T(D, r)} ya tiene un pie en playoffs`, sub: `En ${D.sim.N.toLocaleString()} simulaciones entra en más del 99.5%.`, body: `Con ${UI.rec(s)}, ${O(D, r)} prácticamente asegura su boleto. Ahora la pelea es por el bye.`, stat: { v: UI.pct(o.playoff, 1), l: "prob. de playoffs" } });
        if (o.playoff <= 0.005 && w >= 9) add({ week: w, type: "eliminado", imp: 64, rids: [r], kicker: "ELIMINADO", headline: `${T(D, r)}, prácticamente fuera de playoffs`, sub: `Sus probabilidades cayeron por debajo de 0.5%.`, body: `Matemáticamente quizá queda algo, pero en la realidad ${O(D, r)} ya juega por el orgullo… y por no quedar último.`, stat: { v: UI.pct(o.playoff, 1), l: "prob. de playoffs" } });
      });
    }
    // Campeón
    if (D.bracket && D.bracket.length) {
      const maxR = Math.max(...D.bracket.map((m) => m.r));
      const fin = D.bracket.find((m) => m.r === maxR && m.p === 1);
      if (fin && fin.w) add({ week: D.totalWeeks, type: "campeon", imp: 250, rids: [fin.w, fin.l], kicker: "¡CAMPEÓN!", headline: `${T(D, fin.w)}, campeón de La Buenísima ${D.season}`, sub: `Venció a ${T(D, fin.l)} en la gran final.`, body: `Se acabó la temporada y hay un rey. ${O(D, fin.w)} levanta el trofeo y se gana el derecho de presumir todo el año.`, stat: { v: D.season, l: "campeón" } });
    }
    ev.sort((a, b) => b.week - a.week || b.imp - a.imp);
    D._events = ev;
    return ev;
  };

  // Contexto extra para la portada de Breaking News
  ST.context = function (D, e) {
    const out = [];
    const r = (e.rids || [])[0];
    if (r == null) return "";
    const w = e.week;
    const t = D.tw[r] && D.tw[r][w];
    if (t && t.opp != null && e.type !== "trade") {
      const W = t.pf >= t.pa ? r : t.opp, L = W === r ? t.opp : r;
      out.push(`Resultado final: ${T(D, W)} ${f1(Math.max(t.pf, t.pa))}, ${T(D, L)} ${f1(Math.min(t.pf, t.pa))}.`);
    }
    if (w <= D.regEnd) {
      const st = D.standingsAt(Math.min(w, D.regEnd)).find((x) => x.rid === r);
      if (st && st.gp) out.push(`Después de la semana ${w}, ${T(D, r)} quedó con récord de ${UI.rec(st)}, en el ${st.rank}° lugar de la tabla, con ${f1(st.ppg)} puntos por partido.`);
      if (D.sim && D.sim.remaining.length && e.type !== "clasificado" && e.type !== "eliminado") out.push(`Hoy sus probabilidades de playoffs son de ${UI.pct(D.sim.out[r].playoff)}.`);
    }
    if (e.type === "trade") {
      const tr = D.trades.find((x) => x.week === w && x.rids.includes(r));
      if (tr) tr.sides.forEach((sd) => out.push(`${T(D, sd.rid)} ha sacado ${f1(sd.startPts)} puntos como titular de lo que recibió.`));
    }
    return out.join(" ");
  };

  // Breaking news: lo más fuerte (máx 2 por semana)
  ST.breaking = function (D, limit) {
    const per = {};
    const out = [];
    for (const e of ST.events(D)) {
      if (e.imp < 55) continue;
      per[e.week] = per[e.week] || 0;
      if (per[e.week] >= 2) continue;
      per[e.week]++;
      out.push(e);
    }
    return limit ? out.slice(0, limit) : out;
  };

  /* ---------------- narrativa del preview ---------------- */
  ST.preview = function (D, w) {
    const R = rng("np-pv" + w);
    const mus = D.games[w].map((g) => LB.matchupInfo(D, w, g));
    const reg = w <= D.regEnd;
    const st = D.standingsAt(Math.min(w - 1, D.regEnd));
    const pw = D.powerAt(Math.min(w - 1, D.regEnd));
    const sim = D.sim && D.sim.out;
    const rank = (r) => (st.find((x) => x.rid === r) || {}).rank || 99;
    const prank = (r) => (pw.find((x) => x.rid === r) || {}).prank || 99;
    const scored = mus.map((M) => {
      let s = 0; const tags = [];
      const ra = rank(M.g.a), rb = rank(M.g.b);
      if (ra <= 3 && rb <= 3) { s += 50; tags.push("titanes"); }
      if (UI.rivals(D, M.g.a, M.g.b)) { s += 45; tags.push("rivalidad"); }
      if (M.h2h.length) { s += 15; tags.push("revancha"); }
      if (M.winA != null && Math.abs(M.winA - 0.5) < 0.08) { s += 20; tags.push("parejo"); }
      if (sim && reg) {
        const bub = [M.g.a, M.g.b].filter((r) => sim[r].playoff > 0.2 && sim[r].playoff < 0.8);
        if (bub.length) { s += 18 * bub.length; tags.push("burbuja"); }
      }
      const sa = M.sa.streak || "", sb = M.sb.streak || "";
      if (/^[4-9]/.test(sa) || /^[4-9]/.test(sb)) { s += 15; tags.push("racha"); }
      s += (20 - ra - rb);
      return { M, s, tags };
    }).sort((a, b) => b.s - a.s);
    const main = scored[0];
    const M = main.M, A = M.g.a, B = M.g.b;
    const favA = (M.winA == null ? 0.5 : M.winA) >= 0.5;
    const fav = favA ? A : B, dog = favA ? B : A;
    const wp = Math.round(Math.max(M.winA || 0.5, 1 - (M.winA || 0.5)) * 100);
    const sA = st.find((x) => x.rid === A) || {}, sB = st.find((x) => x.rid === B) || {};
    let headline, kicker;
    if (main.tags.includes("rivalidad")) { kicker = "DUELO DE RIVALES"; headline = `${T(D, A)} vs ${T(D, B)}: aquí se juega el orgullo`; }
    else if (main.tags.includes("titanes")) { kicker = "DUELO DE TITANES"; headline = pick(R, [`Choque de gigantes: ${T(D, A)} contra ${T(D, B)}`, `${T(D, A)} y ${T(D, B)}, el partido que paraliza a la liga`]); }
    else if (main.tags.includes("revancha")) { const l = M.h2h[M.h2h.length - 1]; const lost = l.pa > l.pb ? B : A; kicker = "LA REVANCHA"; headline = `${T(D, lost)} busca venganza contra ${T(D, lost === A ? B : A)}`; }
    else if (main.tags.includes("burbuja")) { kicker = "SE DEFINE LA BURBUJA"; headline = `${T(D, A)} vs ${T(D, B)}: partido de vida o muerte`; }
    else { kicker = "PARTIDO ESTELAR"; headline = `${T(D, fav)} quiere confirmar su favoritismo ante ${T(D, dog)}`; }
    const parts = [];
    parts.push(`${T(D, A)} (${sA.W != null ? UI.rec(sA) : "—"}, ${rank(A)}° en la tabla) recibe a ${T(D, B)} (${sB.W != null ? UI.rec(sB) : "—"}, ${rank(B)}°) en el partido más atractivo de la semana ${w}.`);
    if (M.pa != null) parts.push(`Las proyecciones de Sleeper le dan ventaja a ${T(D, fav)}: ${f1(favA ? M.pa : M.pb)} contra ${f1(favA ? M.pb : M.pa)}, con ${wp}% de probabilidad de ganar.`);
    else parts.push(`Por promedio de temporada, ${T(D, fav)} llega como favorito con ${wp}% de probabilidad.`);
    if (M.h2h.length) { const l = M.h2h[M.h2h.length - 1]; parts.push(`En la semana ${l.w} se vieron las caras y ganó ${T(D, l.pa > l.pb ? A : B)} ${f1(Math.max(l.pa, l.pb))}–${f1(Math.min(l.pa, l.pb))}.`); }
    const kA = M.topA[0], kB = M.topB[0];
    if (kA && kB) parts.push(`Las miradas estarán en ${P(D, kA.pid)} por un lado y ${P(D, kB.pid)} por el otro.`);
    if (sim && reg && D.sim.remaining.length) parts.push(`Hay mucho en juego: ${T(D, A)} tiene ${UI.pct(sim[A].playoff)} de llegar a playoffs y ${T(D, B)} ${UI.pct(sim[B].playoff)}.`);
    const inj = [...M.injA, ...M.injB];
    if (inj.length) parts.push(`Ojo con el reporte médico: ${inj.map((p) => P(D, p) + " (" + D.players[p].inj + ")").join(", ")}.`);
    // notas del resto
    const others = scored.slice(1).map(({ M: m, tags }) => {
      const fa = (m.winA == null ? 0.5 : m.winA) >= 0.5 ? m.g.a : m.g.b;
      const pp = Math.round(Math.max(m.winA || 0.5, 1 - (m.winA || 0.5)) * 100);
      let line;
      if (tags.includes("parejo")) line = `Moneda al aire entre ${T(D, m.g.a)} y ${T(D, m.g.b)}.`;
      else if (pp >= 72) line = `${T(D, fa)} es amplio favorito (${pp}%).`;
      else line = `Ligera ventaja para ${T(D, fa)} (${pp}%).`;
      if (tags.includes("burbuja")) line += " Partido clave para la burbuja de playoffs.";
      return line;
    });
    const fact = factOfWeek(D, w, R);
    return { w, kicker, headline, sub: `Semana ${w}: ${mus.length} partidos y ${reg ? "la carrera a playoffs al rojo vivo" : "se juegan los playoffs"}.`, body: parts.join(" "), others, mus, main: M, fact, powerTop: pw.slice(0, 3), standings: st };
  };

  function factOfWeek(D, w, R) {
    const recs = D.records;
    const opts = [];
    if (recs.highScore[0]) opts.push(`El récord de puntos en una semana es de ${T(D, recs.highScore[0].rid)}: ${f1(recs.highScore[0].pf)} (semana ${recs.highScore[0].w}).`);
    if (recs.winStreak && recs.winStreak.rid) opts.push(`La racha ganadora más larga del año es de ${recs.winStreak.n} partidos (${T(D, recs.winStreak.rid)}).`);
    const lucky = D.standings.slice().sort((a, b) => b.luck - a.luck)[0];
    if (lucky) opts.push(`${T(D, lucky.rid)} es el más suertudo de la liga: ${UI.sign(lucky.luck)} victorias sobre lo que dicen sus puntos.`);
    const eff = D.standings.slice().sort((a, b) => a.eff - b.eff)[0];
    if (eff) opts.push(`${T(D, eff.rid)} es quien más puntos deja en la banca: solo usa el ${UI.pct(eff.eff)} de su máximo.`);
    return pick(R, opts);
  }

  /* ---------------- narrativa de resultados ---------------- */
  ST.results = function (D, w) {
    const R = rng("np-rs" + w);
    const evs = ST.events(D).filter((e) => e.week === w && e.type !== "trade" && e.type !== "clasificado" && e.type !== "eliminado").sort((a, b) => b.imp - a.imp);
    const mus = D.games[w].map((g) => LB.matchupInfo(D, w, g));
    const reg = w <= D.regEnd;
    const st = reg ? D.standingsAt(w) : D.standings;
    const prev = reg && w > 1 ? D.standingsAt(w - 1) : null;
    const tws = D.rids.map((r) => ({ rid: r, ...D.tw[r][w] })).filter((x) => x.pf != null);
    const top = tws.slice().sort((a, b) => b.pf - a.pf)[0];
    const low = tws.slice().sort((a, b) => a.pf - b.pf)[0];
    let kicker, headline, sub;
    if (evs[0]) { kicker = evs[0].kicker; headline = evs[0].headline; sub = evs[0].sub; }
    else { kicker = "RESULTADOS"; headline = `${T(D, top.rid)} manda en la semana ${w} con ${f1(top.pf)}`; sub = `El equipo con más puntos de la jornada.`; }
    const parts = [];
    if (evs[0]) parts.push(evs[0].body);
    parts.push(`${T(D, top.rid)} fue el equipo de la semana con ${f1(top.pf)} puntos, mientras que ${T(D, low.rid)} se quedó en ${f1(low.pf)}.`);
    // rango histórico del top
    const allWeeks = []; D.rids.forEach((r) => D.playedWeeks.filter((x) => x <= w).forEach((x) => D.tw[r][x] && allWeeks.push(D.tw[r][x].pf)));
    allWeeks.sort((a, b) => b - a);
    const pos = allWeeks.indexOf(top.pf) + 1;
    if (pos > 1 && pos <= 5 && w > 2) parts.push(`Es la ${pos}ª mejor marca de toda la temporada.`);
    if (reg && prev) {
      const moved = st.map((s) => ({ s, d: (prev.find((p) => p.rid === s.rid) || {}).rank - s.rank })).filter((x) => Math.abs(x.d) >= 2).sort((a, b) => b.d - a.d);
      const newLeader = prev[0] && st[0] && prev[0].rid !== st[0].rid;
      if (moved[0] && moved[0].d > 0 && moved[0].s.rid !== st[0].rid) parts.push(`El que más subió en la tabla: ${T(D, moved[0].s.rid)}, ahora ${moved[0].s.rank}°.`);
      if (st[0]) parts.push(newLeader ? `${T(D, st[0].rid)} es el nuevo líder con ${UI.rec(st[0])}.` : `${T(D, st[0].rid)} sigue al frente con ${UI.rec(st[0])}.`);
      const cut = st[D.playoffTeams - 1], out = st[D.playoffTeams];
      if (cut && out) parts.push(`La línea de playoffs está en ${T(D, cut.rid)} (${UI.rec(cut)}); ${T(D, out.rid)} (${UI.rec(out)}) es el primero de afuera.`);
    }
    const lines = mus.map((m) => {
      const aw = m.ta.pf >= m.tb.pf;
      const W = aw ? m.g.a : m.g.b, L = aw ? m.g.b : m.g.a;
      const tW = aw ? m.ta : m.tb, tL = aw ? m.tb : m.ta;
      const top1 = (aw ? m.topA : m.topB)[0];
      const mg = tW.pf - tL.pf;
      let s;
      if (mg < 5) s = `Infarto: ganó por ${f1(mg)}.`;
      else if (mg > 40) s = `Paliza de ${f1(mg)} puntos.`;
      else s = `Triunfo por ${f1(mg)}.`;
      if (top1) s += ` Figura: ${UI.plName(D, top1.pid)} (${f1(top1.pts)}).`;
      if (tL.max > tW.pf) s += ` ${T(D, L)} tenía la victoria en la banca.`;
      const ser = m.h2h.length ? seriesText(D, m, W) : "";
      const h2h = ser && !ser.startsWith("empatada") ? ` Serie: ${ser}.` : "";
      return { m, W, L, tW, tL, text: s + h2h };
    });
    const awards = { top, low, mvp: null };
    D.rids.forEach((r) => { const e = D.weeks[w][r]; e.starters.forEach((p, i) => { const pts = e.sp[i] || 0; if (!awards.mvp || pts > awards.mvp.pts) awards.mvp = { pid: p, pts, rid: r }; }); });
    awards.bench = tws.slice().sort((a, b) => (b.max - b.pf) - (a.max - a.pf))[0];
    return { w, kicker, headline, sub, body: parts.join(" "), lines, standings: st, prev, awards, extra: evs.slice(1, 3) };
  };

  /* ---------------- secciones de humor del periódico ---------------- */
  function weakPos(D, r) {
    const P = ["QB", "RB", "WR", "TE"];
    const val = (rid, k) => { const e = D.weeks[D.lastScored] && D.weeks[D.lastScored][rid]; return 0; };
    const by = {};
    P.forEach((k) => {
      const ord = D.rids.slice().sort((a, b) => posPts(D, b, k) - posPts(D, a, k));
      by[k] = ord.indexOf(r) + 1;
    });
    return P.slice().sort((a, b) => by[b] - by[a])[0];
  }
  function posPts(D, r, k) {
    let s = 0;
    D.playedWeeks.slice(-4).forEach((w) => { const e = D.weeks[w][r]; if (!e) return; e.starters.forEach((p, i) => { if (D.posOf(p) === k) s += e.sp[i] || 0; }); });
    return s;
  }
  ST.clasificados = function (D, w) {
    const R = rng("cl" + w);
    const st = D.standings;
    const out = [];
    const last = st[st.length - 1];
    const bench = st.slice().sort((a, b) => (b.max - b.pf) - (a.max - a.pf))[0];
    const eff = st.slice().sort((a, b) => a.eff - b.eff)[0];
    const cold = st.filter((x) => x.gp >= 3).sort((a, b) => (a.last3 - a.ppg) - (b.last3 - b.ppg))[0];
    const needy = st[Math.floor(R() * st.length)];
    out.push({ h: "SE BUSCA", t: `${weakPos(D, needy.rid)} que sí juegue. Pagamos en lo que se pueda (menos en el K). Informes con ${O(D, needy.rid)}, ${T(D, needy.rid)}.` });
    out.push({ h: "SE VENDE", t: `Banca de lujo con ${f1(bench.max - bench.pf)} pts sin estrenar. Poco uso (nunca). Trato directo: ${T(D, bench.rid)}.` });
    out.push({ h: "SE RENTA", t: `Sótano de la tabla, amplio y con vista a los playoffs (de lejos). Disponible de inmediato. Pregunte por ${T(D, last.rid)}.` });
    out.push({ h: "CURSOS", t: `"Cómo armar tu lineup en 5 pasos". Inscripciones abiertas. Becado al 100%: ${T(D, eff.rid)}.` });
    if (cold && cold.last3 < cold.ppg) out.push({ h: "SE PERDIÓ", t: `La ofensiva de ${T(D, cold.rid)}. Vista por última vez hace un mes. Se gratifica.` });
    // mezcla estable
    out.forEach((o) => (o.t = o.t.replace(/\.\.(?!\.)/g, ".")));
    return out.sort(() => R() - 0.5).slice(0, 3);
  };
  const SIGNOS = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];
  ST.horoscopo = function (D, w) {
    const R = rng("hs" + w);
    const mus = (D.games[w] || []).map((g) => LB.matchupInfo(D, w, g));
    const lines = [];
    mus.forEach((M) => [M.g.a, M.g.b].forEach((r) => {
      const isA = r === M.g.a;
      const wp = M.winA == null ? 0.5 : isA ? M.winA : 1 - M.winA;
      const opp = isA ? M.g.b : M.g.a;
      let t;
      const k = lines.length;
      const pk = (arr) => arr[(k + Math.floor(R() * 3)) % arr.length];
      if (wp >= 0.7) t = pk([`Los astros te sonríen (${Math.round(wp * 100)}%). No hagas nada estúpido el domingo.`, `Semana de abundancia. ${T(D, opp)} será tu escalón.`]);
      else if (wp <= 0.3) t = pk([`Mercurio retrógrado en tu lineup (${Math.round(wp * 100)}%). Prende una veladora.`, `Evita decisiones importantes… y a ${T(D, opp)}.`]);
      else t = pk([`Energía de moneda al aire. Tu número de la suerte: ${Math.round(40 + R() * 60)}.`, `Un desconocido del waiver cambiará tu semana.`, `Escucha a tu corazón, pero más a las proyecciones.`, `Hoy no es día para experimentos: pon a los de siempre.`, `Un amigo te ofrecerá un trade. Desconfía.`]);
      lines.push({ r, sign: SIGNOS[(r - 1) % 12], t });
    }));
    return lines.sort(() => R() - 0.5).slice(0, 3);
  };
  ST.clima = function (D, w) {
    const mus = (D.games[w] || []).map((g) => LB.matchupInfo(D, w, g));
    if (!mus.length) return [];
    const comb = (M) => (M.pa != null ? M.pa + M.pb : (M.sa.ppg || 0) + (M.sb.ppg || 0));
    const hot = mus.slice().sort((a, b) => comb(b) - comb(a))[0];
    const fog = mus.slice().sort((a, b) => Math.abs((a.winA || 0.5) - 0.5) - Math.abs((b.winA || 0.5) - 0.5))[0];
    const sun = mus.slice().sort((a, b) => Math.abs((b.winA || 0.5) - 0.5) - Math.abs((a.winA || 0.5) - 0.5))[0];
    const fav = (M) => ((M.winA || 0.5) >= 0.5 ? M.g.a : M.g.b);
    return [
      { i: "sun", t: `Soleado para ${T(D, fav(sun))}: ${Math.round(Math.max(sun.winA || 0.5, 1 - (sun.winA || 0.5)) * 100)}% de probabilidad de victoria.` },
      { i: "storm", t: `Tormenta de puntos en ${T(D, hot.g.a)} vs ${T(D, hot.g.b)}: se esperan ${f1(comb(hot))} combinados.` },
      { i: "fog", t: `Neblina total en ${T(D, fog.g.a)} vs ${T(D, fog.g.b)}. No se ve quién gana.` },
    ];
  };
  ST.erratas = function (D, w) {
    if (w <= 1) return "Primera edición: todavía no hemos tenido tiempo de equivocarnos.";
    const pw = D.powerAt(Math.min(w - 1, D.regEnd));
    const pr = (r) => (pw.find((x) => x.rid === r) || {}).prank || 0;
    let best = null;
    for (const g of D.games[w] || []) {
      const a = D.tw[g.a][w], b = D.tw[g.b][w];
      if (!a || !b) continue;
      const W = a.pf > b.pf ? g.a : g.b, L = W === g.a ? g.b : g.a;
      const gap = pr(W) - pr(L);
      if (gap >= 3 && (!best || gap > best.gap)) best = { W, L, gap };
    }
    if (!best) return "Esta semana no hubo erratas. Nuestro departamento de análisis pide un aumento.";
    return `En nuestro Power Ranking pusimos a ${T(D, best.L)} en el ${pr(best.L)}° lugar y a ${T(D, best.W)} en el ${pr(best.W)}°. ${T(D, best.W)} ganó. El analista responsable ya fue reubicado en la sección de horóscopos.`;
  };
  // Remates chistosos para Breaking News
  ST.quip = function (D, e) {
    const R = rng("q" + e.id);
    const Q = {
      lider: ["Fuentes cercanas al vestidor reportan que ya se mandó a hacer la corona.", "Los demás equipos piden revisión del VAR."],
      porfin: ["Se reportan fuegos artificiales y un par de vecinos molestos.", "Testigos aseguran haber visto lágrimas de felicidad."],
      cae: ["Se busca al responsable de la derrota. Se sospecha del kicker.", "El ego del afectado fue trasladado al hospital más cercano."],
      crisis: ["La directiva ya consulta a un chamán.", "Se recomienda no preguntarle nada al manager en los próximos días."],
      racha: ["Nadie sabe cómo pararlo. Se aceptan sugerencias, rezos y trades.", "Expertos confirman que es real y no un error de Sleeper."],
      batacazo: ["Los apostadores siguen en shock.", "El líder ya pidió el replay… tres veces."],
      banca: ["La banca agradece la confianza.", "Se busca: alguien que le recuerde revisar el lineup el domingo."],
      record_alto: ["La calculadora de Sleeper pidió vacaciones.", "Se reportan daños en el marcador."],
      record_bajo: ["Ni el equipo de prácticas hubiera hecho menos.", "La directiva emitió un comunicado: 'Fue el clima'."],
      paliza: ["Se recomienda discreción al pasar cerca del perdedor.", "La ONU pidió un cese al fuego."],
      explosion: ["Sus compañeros piden que le aumenten el sueldo.", "Los demás managers ya lo están buscando en el waiver (no está)."],
      waiver: ["Mientras otros dormían, alguien sí revisó el waiver.", "Costo: cero. Valor: incalculable."],
      trade: ["Uno de los dos se va a arrepentir. Aún no sabemos cuál.", "Abogados de ambas partes revisan la letra chiquita."],
      clasificado: ["Ya están cotizando el viaje a los playoffs.", "Que alguien le avise que todavía falta ganarlos."],
      eliminado: ["Le queda jugar por el orgullo… y por no quedar último.", "Descanse en paz su temporada."],
      campeon: ["Que alguien le quite el celular: ya empezó a presumir.", "El trofeo ya tiene dueño por un año entero."],
    };
    const poll = { si: 50 + Math.round(R() * 45) };
    return { quip: pick(R, Q[e.type] || ["La redacción sigue en shock."]), poll: poll.si };
  };
  function seriesText(D, m, W) {
    let wa = 0, wb = 0;
    m.h2h.forEach((h) => (h.pa > h.pb ? wa++ : wb++));
    if (m.ta.pf > m.tb.pf) wa++; else wb++;
    const lead = wa === wb ? null : wa > wb ? m.g.a : m.g.b;
    return lead ? `${T(D, lead)} domina ${Math.max(wa, wb)}-${Math.min(wa, wb)}` : `empatada ${wa}-${wb}`;
  }
})();
