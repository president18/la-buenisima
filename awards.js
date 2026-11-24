// ===================================================================
//  LOS ÓSCAR DE LA BUENÍSIMA · categorías
//  -------------------------------------------------------------------
//  Cómo agregar una categoría (tú, Claude o cualquier agente):
//  copia un bloque de "categories" y cambia los campos.
//
//  id          identificador único, sin espacios
//  ceremony    "regular" (al terminar la temporada regular) o "final" (al terminar playoffs)
//  icon        ícono (star, trophy, flame, zap, target, couch, gem, swap, frown, search, dollar,
//              droplet, dice, brick, hammer, pulse, repeat, message, tag, eyeoff, medal, trash, film, user)
//  name        nombre que se muestra
//  description qué premia, en palabras normales (es lo que lee un agente para decidir)
//  type        "data"  -> el ganador sale solo de los datos, con "metric"
//              "vote"  -> se decide por votación secreta o lo captura el comisionado
//  metric      (solo type "data") uno de los cálculos disponibles:
//      mvp            jugador con más puntos como titular para un equipo
//      equipo         mejor power score de la temporada
//      cirujano       mejor eficiencia de lineup (puntos hechos / máximo posible)
//      banca          más puntos totales dejados en la banca
//      pickup         alta de waiver/agente libre con más puntos como titular
//      mejorTrade     lado de un trade que más puntos netos ganó
//      peorTrade      lado de un trade que más puntos netos perdió
//      roboDraft      pick de ronda 4+ que más rindió contra su lugar de draft
//      fracasoDraft   pick de rondas 1-3 que menos rindió contra su lugar de draft
//      salado         más victorias perdidas por mala suerte (récord vs puntos)
//      suertudo       más victorias regaladas por la suerte
//      explosion      más puntos de un equipo en una semana
//      ladrillo       menos puntos de un equipo en una semana
//      paliza         mayor diferencia en un partido
//      infarto        partido más cerrado
//      raton          más altas de waiver/agentes libres
//      racha          racha ganadora más larga
//      actuacion      mejor actuación individual de un jugador en una semana
//      campeon        campeón (solo ceremonia "final")
//      subcampeon     subcampeón (solo "final")
//      mvpPlayoffs    jugador con más puntos como titular en playoffs (solo "final")
//      ultimo         último lugar de la temporada regular (el del castigo)
//  winner      (solo type "vote") escribe aquí el ganador cuando se decida, ej. "Napugi"
//  nominees    (opcional, type "vote") lista de nominados; si se deja vacío, nominan todos los equipos
// ===================================================================
window.LB_AWARDS = {
  // Link de un formulario de votación secreta (ej. Google Forms). Si está vacío no se muestra el botón.
  voteFormUrl: "",

  // reveal: false = se muestran nominados pero NO ganadores. Cámbialo a true para la ceremonia.
  ceremonies: {
    regular: { name: "Óscars de la Temporada Regular", when: "Al terminar la semana 14", reveal: false },
    final: { name: "Óscars de Fin de Temporada", when: "Al terminar la final (semana 17)", reveal: false }
  },

  categories: [
    { id: "mvp", ceremony: "regular", icon: "star", name: "MVP de la temporada", type: "data", metric: "mvp", description: "El jugador que más puntos le dio a su equipo como titular." },
    { id: "equipo", ceremony: "regular", icon: "ball", name: "Equipo del año", type: "data", metric: "equipo", description: "El equipo con el mejor power score: el que jugó mejor de verdad, no solo el del mejor récord." },
    { id: "cirujano", ceremony: "regular", icon: "target", name: "Lineup de cirujano", type: "data", metric: "cirujano", description: "El manager que mejor arma su lineup: el que menos puntos deja en la banca en proporción." },
    { id: "banca", ceremony: "regular", icon: "couch", name: "Banca de oro", type: "data", metric: "banca", description: "El que más puntos dejó sentados en la banca en toda la temporada." },
    { id: "pickup", ceremony: "regular", icon: "gem", name: "Joya del waiver", type: "data", metric: "pickup", description: "La mejor alta de waiver o agente libre, por puntos como titular." },
    { id: "mejorTrade", ceremony: "regular", icon: "swap", name: "Trade del año", type: "data", metric: "mejorTrade", description: "El equipo que más ganó con un trade (puntos como titular recibidos menos los entregados)." },
    { id: "peorTrade", ceremony: "regular", icon: "frown", name: "El atraco (peor trade)", type: "data", metric: "peorTrade", description: "El equipo al que peor le salió un trade." },
    { id: "roboDraft", ceremony: "regular", icon: "search", name: "Robo del draft", type: "data", metric: "roboDraft", description: "El pick de ronda 4 en adelante que más rindió comparado con donde se escogió." },
    { id: "fracasoDraft", ceremony: "regular", icon: "dollar", name: "Fracaso del draft", type: "data", metric: "fracasoDraft", description: "El pick de rondas 1 a 3 que más decepcionó." },
    { id: "salado", ceremony: "regular", icon: "droplet", name: "El más salado", type: "data", metric: "salado", description: "Al que la suerte más le quitó: merecía más victorias por sus puntos." },
    { id: "suertudo", ceremony: "regular", icon: "dice", name: "El más suertudo", type: "data", metric: "suertudo", description: "Al que la suerte más le regaló victorias." },
    { id: "explosion", ceremony: "regular", icon: "zap", name: "Explosión del año", type: "data", metric: "explosion", description: "La mayor cantidad de puntos de un equipo en una sola semana." },
    { id: "ladrillo", ceremony: "regular", icon: "brick", name: "El ladrillo", type: "data", metric: "ladrillo", description: "La peor semana de un equipo en toda la temporada." },
    { id: "paliza", ceremony: "regular", icon: "hammer", name: "Paliza del año", type: "data", metric: "paliza", description: "El partido con mayor diferencia de puntos." },
    { id: "infarto", ceremony: "regular", icon: "pulse", name: "Partido del año", type: "data", metric: "infarto", description: "El partido más cerrado de la temporada." },
    { id: "raton", ceremony: "regular", icon: "repeat", name: "Ratón de waiver", type: "data", metric: "raton", description: "El más activo en el waiver: más altas en la temporada." },
    { id: "actuacion", ceremony: "regular", icon: "flame", name: "Actuación individual del año", type: "data", metric: "actuacion", description: "La mejor semana de un jugador como titular." },
    { id: "trash", ceremony: "regular", icon: "message", name: "Rey del trash talk", type: "vote", description: "El que más carrilla echó en el chat de la liga.", winner: "", nominees: [] },
    { id: "nombre", ceremony: "regular", icon: "tag", name: "Mejor nombre de equipo", type: "vote", description: "El nombre de equipo más creativo o chistoso.", winner: "", nominees: [] },
    { id: "decision", ceremony: "regular", icon: "eyeoff", name: "Peor decisión del año", type: "vote", description: "La movida que más se arrepintió alguien: un drop, un trade, un lineup.", winner: "", nominees: [] },

    { id: "campeon", ceremony: "final", icon: "trophy", name: "Campeón", type: "data", metric: "campeon", description: "El ganador de la final." },
    { id: "subcampeon", ceremony: "final", icon: "medal", name: "Subcampeón", type: "data", metric: "subcampeon", description: "El que perdió la final." },
    { id: "mvpPlayoffs", ceremony: "final", icon: "star", name: "MVP de playoffs", type: "data", metric: "mvpPlayoffs", description: "El jugador con más puntos como titular en los playoffs." },
    { id: "ultimo", ceremony: "final", icon: "trash", name: "El del castigo", type: "data", metric: "ultimo", description: "Último lugar de la temporada regular." },
    { id: "momento", ceremony: "final", icon: "film", name: "Momento del año", type: "vote", description: "La jugada, partido o historia que más se va a recordar de la temporada.", winner: "", nominees: [] },
    { id: "manager", ceremony: "final", icon: "user", name: "Manager del año", type: "vote", description: "El que mejor manejó su equipo en toda la temporada: draft, waivers, trades y lineups.", winner: "", nominees: [] }
  ]
};
