/**
 * LA BUENÍSIMA · Registro de accesos
 * Pega este código en Extensiones → Apps Script de tu hoja de Google
 * e impleméntalo como "Aplicación web" (ver instrucciones que te mandó Claude).
 *
 * - doPost: el sitio manda aquí cada visita (nombre, fecha, aparato…)
 * - doGet:  tu página privada lee el registro (requiere la clave)
 */
const CLAVE = "6e9f37aa77693efca5619ea9";   // la misma que accessLogKey en config.js
const HOJA = "Accesos";
const COLUMNAS = ["Fecha (CDMX)", "Nombre", "Usuario Sleeper", "Evento", "Aparato", "Navegador", "Modo", "Sección", "ID aparato", "Fecha ISO"];

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(COLUMNAS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold");
  }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const rows = (body.rows || []).slice(0, 60).map(function (r) {
      const d = new Date(r.ts || Date.now());
      const local = Utilities.formatDate(d, "America/Mexico_City", "yyyy-MM-dd HH:mm");
      const t = function (v) { return String(v == null ? "" : v).slice(0, 60); };
      return [local, t(r.name), t(r.user), t(r.event), t(r.device), t(r.browser), t(r.mode), t(r.section), t(r.id), d.toISOString()];
    });
    if (rows.length) {
      const sh = hoja_();
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, COLUMNAS.length).setValues(rows);
    }
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const out = function (o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); };
  if (!e || !e.parameter || e.parameter.key !== CLAVE) return out({ error: "clave" });
  const sh = hoja_();
  const n = sh.getLastRow() - 1;
  if (n <= 0) return out({ rows: [] });
  const start = Math.max(2, sh.getLastRow() - 1999);
  const vals = sh.getRange(start, 1, sh.getLastRow() - start + 1, COLUMNAS.length).getValues();
  return out({
    rows: vals.map(function (v) {
      return { ts: v[9] instanceof Date ? v[9].toISOString() : String(v[9]), name: v[1], user: v[2], event: v[3], device: v[4], browser: v[5], mode: v[6], section: v[7], id: v[8] };
    }),
  });
}
