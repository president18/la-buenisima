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
  nicknames: {
    "EytanSt": "Pelvis",
    "Napugi": "El Commish",
    "EDUPUGI": "El Cummish",
    "reylago": "Rey Lago",
    "oldaktlamete": "Oldak",
    "Arizg99": "El Doc",
    "MITRALAN": "Mitrani",
    "marcossaade13": "Marcos",
    "MVPurdy26": "Juan",
    "Pony28": "Porny",
    "TofiZonana": "Tofi"
  },

  // Apodo del equipo completo (opcional), por usuario dueño.
  teamNicknames: { "Napugi": "Pupko Bros" },

  // Rivalidades con nombre: usuarios de Sleeper de cada lado. Se destacan en previews, periódico y noticias.
  rivalries: [
    { a: "EytanSt", b: "Napugi", name: "El Clásico" },
    { a: "EytanSt", b: "Arizg99", name: "Clásico Primos" },
    { a: "Arizg99", b: "reylago", name: "El ZaGay" }
  ],

  // Trofeo y castigo (se muestran en la sección Historia).
  trophy: "",
  punishment: "",

  // Campeones de temporadas pasadas que NO están en Sleeper (opcional).
  // Ej: [{ season: "2025", champion: "Napugi", runnerUp: "Pony28", note: "" }]
  pastChampions: [],
  // Wrapped de fin de temporada: se abre en esta fecha (2 días después de la final, semana 17).
  wrappedUnlock: "2027-01-06T00:00:00-06:00",
  // Link privado de cada manager: sitio/#wrapped-CODIGO  (código -> usuario de Sleeper)
  wrappedCodes: {
    "da5472a4": "Napugi",
    "127dfa99": "marcossaade13",
    "c92dd989": "Pony28",
    "5a717f49": "oldaktlamete",
    "74072373": "MITRALAN",
    "7f16f90d": "MVPurdy26",
    "4b42d0e0": "TofiZonana",
    "8b557813": "EytanSt",
    "7177ce62": "reylago",
    "c742c531": "Arizg99"
  }
};
