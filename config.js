// ===============================================================
//  CONFIGURACIÓN DE LA BUENÍSIMA
//  Todo lo personalizable de la liga vive aquí.
// ===============================================================
window.LB_CONFIG = {
  leagueId: "1385748083580600320",
  leagueName: "La Buenísima",

  // Logo: pon aquí la ruta de tu logo (ej. "assets/logo.png").
  // Si lo dejas vacío se usa el avatar de la liga en Sleeper.
  logo: (window.LB_BASE || "") + "assets/logo.jpg",

  // Colores principales del sitio (y de las imágenes).
  colors: { bg: "#EAE7DC", sand: "#D8C3A5", gray: "#8E8D8A", coral: "#E98074", red: "#E85A4F" },

  // Usuario de Sleeper del dueño de la página privada.
  myUsername: "Napugi",

  // Apodos: user de Sleeper -> apodo que se muestra en recaps.
  // Ej: { "marcossaade13": "Marcos", "Pony28": "El Pony" }
  nicknames: {},

  // Rivalidades: pares de users de Sleeper. Se destacan en previews.
  // Ej: [["Napugi", "EDUPUGI"]]
  rivalries: [],

  // Trofeo y castigo (se muestran en la sección Historia).
  trophy: "",
  punishment: "",

  // Campeones de temporadas pasadas que NO están en Sleeper (opcional).
  // Ej: [{ season: "2025", champion: "Napugi", runnerUp: "Pony28", note: "" }]
  pastChampions: []
};
