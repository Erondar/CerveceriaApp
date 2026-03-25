'use strict';

// ── Taunts: Friendly Fire ─────────────────────────────────────────────────────

const TAUNTS_FF = [
  { s: '**{name}** aparentemente confundió a sus compañeros con Gruul. Talento innato. 🏆',
    p: '**{name}** — al parecer todos confundieron a sus compañeros con Gruul. Talento colectivo. 🏆' },
  { s: '**{name}** causó {damage} de daño a aliados. Gruul manda sus saludos. 🐉',
    p: '**{name}** causaron {damage} cada uno de daño a aliados. Gruul les envía una nota de agradecimiento. 🐉' },
  { s: '**{name}** — oficialmente más peligroso para la raid que el propio jefe. 👑',
    p: '**{name}** — oficialmente más peligrosos para la raid que el propio jefe. Empate en la vergüenza. 👑' },
  { s: '**{name}** trabajó duro... para hundir a sus compañeros. Gran aportación. 🤝',
    p: '**{name}** trabajaron en equipo para lo único que no debían: hundirse mutuamente junto al resto. 🤝' },
  { s: '**{name}** demuestra que el verdadero Gruul estaba dentro de nosotros todo el tiempo. 💀',
    p: '**{name}** demuestran que el verdadero Gruul estaba repartido entre ellos todo el tiempo. 💀' },
  { s: 'Dicen que la unidad es la fuerza. **{name}** discrepa. {damage} de daño a los suyos. 💪',
    p: 'Dicen que la unidad es la fuerza. **{name}** demostraron que también puede ser una amenaza. {damage} cada uno a los suyos. 💪' },
  { s: '**{name}** no discrimina. Jefes, aliados, lo que se mueva. {damage} de daño a compañeros. ⚔️',
    p: '**{name}** no discriminan. Jefes, aliados, lo que se mueva. {damage} a compañeros cada uno. ⚔️' },
  { s: 'Gruul podría aprender de **{name}**. {damage} de daño a la raid y ni un "lo siento". 😤',
    p: 'Gruul podría contratar a **{name}** como refuerzo. {damage} a aliados cada uno y ni una disculpa entre todos. 😤' },
  { s: '**{name}**: la amenaza que nadie fichó en el cuaderno de rotación, pero que todos sintieron. 📋',
    p: '**{name}**: las amenazas que nadie fichó en el cuaderno de rotación, pero que todos sintieron por igual. 📋' },
];

const TAUNTS_FF_HIST = [
  { s: '**{name}** no solo gana esta raid, sino que sigue liderando el ranking histórico. Consistencia ante todo. 📊',
    p: '**{name}** empatan en el liderazgo histórico. El Salón de la Vergüenza amplía su aforo. 📊' },
  { s: '**{name}** defiende su trono. Nadie le quita el primer puesto del Salón de la Vergüenza. 👹',
    p: '**{name}** comparten el trono del Salón de la Vergüenza. El deshonor, a partes iguales. 👹' },
  { s: '**{name}** es tan bueno dañando aliados que ya nadie se sorprende. Número 1 histórico, otra vez. 🔁',
    p: '**{name}** son tan buenos dañando aliados que ya nadie se sorprende. Empate histórico, otra vez. 🔁' },
  { s: '**{name}** lleva temporadas perfeccionando el arte de dañar a los suyos. Y se nota. 🎓',
    p: '**{name}** llevan temporadas perfeccionando juntos el arte de dañar a los suyos. Y se nota. 🎓' },
];

// ── Taunts: Muertes ───────────────────────────────────────────────────────────

const TAUNTS_MUERTES = [
  { s: '**{name}** murió {count} veces. Gruul tampoco lo mata tanto a él. 💀',
    p: '**{name}** — {count} muertes cada uno. Gruul tampoco los mata a ellos tanto. Algo están haciendo mal. 💀' },
  { s: 'Con {count} muertes, **{name}** se convirtió en el principal cliente del cementerio. ⚰️',
    p: 'Con {count} muertes cada uno, **{name}** monopolizaron el cementerio. Turnos de a dos. ⚰️' },
  { s: '**{name}** decidió que vivir era opcional esta noche. {count} muertes para demostrarlo. 🪦',
    p: '**{name}** decidieron que vivir era opcional esta noche. {count} muertes cada uno para demostrarlo. 🪦' },
  { s: '{count} veces en el suelo. **{name}** se sabe el camino del cementerio de memoria. 🗺️',
    p: '{count} veces en el suelo cada uno. **{name}** ya se saben el camino del cementerio de memoria. Podrían hacer visitas guiadas. 🗺️' },
  { s: '**{name}** probó a morir {count} veces. Spoiler: no mejoró con la práctica. 📉',
    p: '**{name}** probaron a morir {count} veces cada uno. Spoiler: ninguno mejoró con la práctica. 📉' },
  { s: 'El boss mató a **{name}** {count} veces. Los compañeros, silencio cómplice. 🤐',
    p: 'El boss mató a **{name}** {count} veces a cada uno. Los compañeros, silencio cómplice doble. 🤐' },
];

const TAUNTS_MUERTES_HIST = [
  { s: '**{name}** lidera las muertes históricas y las de esta raid. Coherencia brutal. ☠️',
    p: '**{name}** lideran empatados las muertes históricas. El médium ya no sabe a cuál llamar primero. ☠️' },
  { s: 'En el histórico y en esta raid: **{name}** sigue al frente. Alguien avisad al médium. 🔮',
    p: 'En el histórico y en esta raid: **{name}** siguen al frente, empatados. El médium necesita refuerzos. 🔮' },
  { s: '**{name}** acumula el mayor número histórico de muertes y esta noche lo amplía. En algún punto ya es un estilo de vida. 🪦',
    p: '**{name}** acumulan el mayor número histórico de muertes empatados. En algún punto ya es un estilo de vida compartido. 🪦' },
  { s: '**{name}** suma {count} muertes más al marcador histórico. El cementerio ya le tiene reservado sitio fijo. 🪦',
    p: '**{name}** suman {count} muertes más al marcador histórico, empatados. El cementerio ya les tiene reservada un ala entera. 🪦' },
  { s: 'El récord histórico de muertes sigue en manos de **{name}**. Esta raid lo reafirma con {count} caídas más. Impecable. ☠️',
    p: 'El récord histórico de muertes lo comparten **{name}**. Esta raid lo reafirman con {count} caídas más cada uno. Impecables. ☠️' },
];

const TAUNTS_PRIMERO = [
  '🪦 **{name}** abrió la noche como le gusta: desde el suelo.',
  '🪦 **{name}** no esperó ni al primer trash para caer. Eficiencia.',
  '🪦 Alguien tenía que ser el primero. **{name}** se ofreció voluntario sin saberlo.',
  '🪦 **{name}** se adelantó a todo el mundo. Por desgracia, no era una carrera.',
  '🪦 El primer "preparado" de la noche lo dio el suelo con **{name}** encima.',
];

const TAUNTS_PRIMERO_REINCIDENTE = [
  '🪦 **{name}** abre el cementerio esta noche. Y con esta ya van **{count}** veces. Tradición de guild.',
  '🪦 Primera muerte de la noche: **{name}**. Va **{count}** de **{count}** raids siendo el primero en caer. Talento.',
  '🪦 **{name}** otra vez el primero en morder el polvo. Llevan **{count}** raids así. El suelo ya le reserva sitio.',
  '🪦 Sorpresa: **{name}** estrena el cementerio esta noche también. Van **{count}**. Esto ya no es casualidad.',
  '🪦 **{name}** lidera el ranking de "primero en caer": **{count}** veces. Esta noche suma una más.',
];

const TAUNTS_PRIMERO_Y_MAS_MUERTES = [
  '🪦 **{name}** fue el primero en morir Y el que más veces murió ({count}). Compromiso total con el cementerio.',
  '🪦 **{name}** abrió el baile y lo cerró con {count} muertes. Coherencia, al menos.',
  '🪦 Primero en caer y campeón de muertes ({count}). **{name}** no hace las cosas a medias.',
  '🪦 **{name}** inauguró el cementerio y se negó a marcharse: {count} muertes en total. El primero en llegar y el último en irse.',
  '🪦 Doble distinción para **{name}**: pionero de la muerte y líder del marcador con {count} caídas. Cuando se propone algo, lo cumple.',
];

// ── Taunts: Tiempo muerto ─────────────────────────────────────────────────────

const TAUNTS_TIEMPO = [
  { s: '**{name}** pasó {time} en el suelo. Técnicamente participó en la raid. Técnicamente. 🛏️',
    p: '**{name}** — {time} en el suelo cada uno. Técnicamente participaron en la raid. Técnicamente. 🛏️' },
  { s: '{time} muerto. **{name}** aprovechó para descansar mientras el resto limpiaba. 😴',
    p: '{time} muertos cada uno. **{name}** aprovecharon para descansar mientras el resto limpiaba. Turnos de siesta coordinados. 😴' },
  { s: '**{name}** contribuyó con {time} de tiempo muerto. La próxima vez que venga, que avise. ⏱️',
    p: '**{name}** contribuyeron con {time} de tiempo muerto cada uno. La próxima vez que vengan, que avisen. ⏱️' },
  { s: 'Si el tiempo muerto contara como DPS, **{name}** con {time} sería el MVP. Pero no cuenta. 📊',
    p: 'Si el tiempo muerto contara como DPS, **{name}** con {time} cada uno serían el dúo MVP. Pero no cuenta. 📊' },
  { s: '**{name}** estuvo {time} de espectador. Eso sí, con el mejor sitio de la sala. 🎭',
    p: '**{name}** estuvieron {time} de espectadores cada uno. Eso sí, con los mejores sitios de la sala. 🎭' },
  { s: '{time} sin hacer nada. **{name}** lleva el AFK al siguiente nivel. 💤',
    p: '{time} sin hacer nada cada uno. **{name}** llevan el AFK al siguiente nivel. En pareja. 💤' },
];

const TAUNTS_TIEMPO_HIST = [
  { s: '**{name}** también lidera el tiempo muerto histórico. A este paso va a necesitar una cama permanente en el cementerio. 🛏️',
    p: '**{name}** lideran empatados el tiempo muerto histórico. El cementerio instala literas. 🛏️' },
  { s: 'Más tiempo muerto en esta raid Y en el histórico. **{name}** es consistente en lo suyo. ⏳',
    p: 'Más tiempo muerto en esta raid Y en el histórico. **{name}** son consistentes en lo suyo. Empate en la desidia. ⏳' },
  { s: '**{name}** no es que muera mucho, es que lo hace con dedicación. Líder histórico de tiempo muerto, otra vez. 🥇',
    p: '**{name}** no es que mueran mucho, es que lo hacen con dedicación. Líderes históricos de tiempo muerto, otra vez. 🥇' },
  { s: 'Históricamente, nadie ha pasado más tiempo en el suelo que **{name}**. Esta noche añade {time} más. Disciplina de hierro. 💤',
    p: 'Históricamente, nadie ha pasado más tiempo en el suelo que **{name}**, empatados. Esta noche añaden {time} más cada uno. Disciplina de hierro compartida. 💤' },
  { s: '**{name}** acumula más tiempo muerto que muchos de sus compañeros en pie. Líder histórico, y no precisamente por las buenas razones. ⏱️',
    p: '**{name}** acumulan más tiempo muerto que muchos de sus compañeros en pie. Líderes históricos, y no precisamente por las buenas razones. ⏱️' },
];

const TAUNTS_MUERTES_Y_TIEMPO = [
  '**{name}** murió más veces ({count}) Y pasó más tiempo muerto ({time}). Básicamente hizo la raid desde el más allá.',
  'Más muertes y más tiempo en el suelo: **{name}** con {count} muertes y {time} fuera de juego. Artesano de la muerte.',
  '**{name}** ({count} muertes, {time} muerto). No es que juegue mal, es que juega a otro juego.',
  '**{name}** lideró tanto las muertes ({count}) como el tiempo en el suelo ({time}). Una actuación completa, en el peor sentido posible. 🏆',
  'Nadie murió más ni estuvo más tiempo muerto. **{name}** con {count} caídas y {time} de ausencia. MVP del cementerio, indiscutible. ⚰️',
];

const TAUNTS_FF_Y_MUERTES = [
  '**{name}** dañó más a sus aliados Y murió más veces. Cargas de trabajo bien distribuidas. ⚖️',
  '**{name}**: más daño amistoso de la raid y más muertes. El MVP inverso. 🔄',
  'Esta raid de **{name}**: {damage} de daño a aliados y {count} muertes. Récord de eficiencia negativa. 📉',
  '**{name}** fue una amenaza para sus compañeros Y para sí mismo: {damage} de daño amistoso y {count} muertes. Equidistribución del caos. 💥',
  'Dañar a los aliados y morirse encima. **{name}** lo perfeccionó esta noche: {damage} a compañeros, {count} visitas al cementerio. Arte conceptual. 🎨',
];

// ── Taunts: Interrupts ────────────────────────────────────────────────────────

const TAUNTS_INTERRUPT_HEROE = [
  { s: '**{name}** calló más hechizos que nadie. {total} interrupts. El silencio tiene nombre propio.',
    p: '**{name}** — {total} interrupts cada uno. El silencio esta noche tiene varios dueños.' },
  { s: '**{name}** — {total} veces dijo "ni hablar" y lo cumplió. MVP del silencio forzado.',
    p: '**{name}** — {total} veces cada uno dijeron "ni hablar" y lo cumplieron. Co-MVPs del silencio forzado.' },
  { s: 'Con {total} interrupts, **{name}** dedicó la noche a que los mobs no pudieran terminar ni una frase.',
    p: 'Con {total} interrupts cada uno, **{name}** se aseguraron de que los mobs no terminaran ni media frase entre todos.' },
  { s: '**{name}** interrumpió {total} veces. Nadie le deja hablar a los NPCs y él lo sabe bien.',
    p: '**{name}** interrumpieron {total} veces cada uno. Los NPCs directamente dejaron de intentarlo.' },
  { s: '{total} interrupts de **{name}**. Cuando este señor dice "no casteas", no casteas.',
    p: '{total} interrupts por cabeza de **{name}**. Cuando estos señores dicen "no casteas", no casteas.' },
];

const TAUNTS_INTERRUPT_HEROE_HIST = [
  { s: '**{name}** lidera los interrupts esta raid Y el histórico. Silencio en toda la sala cuando él entra.',
    p: '**{name}** lideran los interrupts esta raid Y el histórico, empatados. Doble silencio en la sala.' },
  { s: '**{name}** defiende su trono de los interrupts. {total} esta raid, el mayor acumulado histórico. Hay vocación.',
    p: '**{name}** comparten el trono de los interrupts. {total} esta raid cada uno, el mayor acumulado histórico compartido. Hay vocación doble.' },
  { s: 'Histórico y presente: **{name}** sigue siendo el maestro del silencio. {total} interrupts más al marcador.',
    p: 'Histórico y presente: **{name}** siguen siendo los maestros del silencio. {total} interrupts cada uno más al marcador.' },
  { s: '**{name}** acumula el mayor número de interrupts de la historia de la guild. {total} más esta noche, por si quedaba alguna duda.',
    p: '**{name}** acumulan el mayor número de interrupts de la historia de la guild, empatados. {total} más esta noche cada uno, por si quedaba alguna duda.' },
  { s: 'El boss intenta castear. **{name}** dice que no. {total} interrupts esta raid, récord histórico incluido. Veterano del silencio.',
    p: 'El boss intenta castear. **{name}** dicen que no. {total} interrupts esta raid cada uno, récord histórico incluido. Veteranos del silencio.' },
];

// Para cuando el mínimo entre los capaces es 0
const TAUNTS_SHAME_CERO = [
  '🤫 {names} — {count} interrupts. Tienen la habilidad y eligieron no usarla. Respeto.',
  '🤫 {count} interrupts de {names}. El boss les envía sus más sinceras gracias.',
  '🤫 {names}: {count} interrupts entre los que sí pueden cortar. La Q estaba ahí.',
  '🤫 {names} — {count} interrupts esta noche. Decidieron que cortar era trabajo de otro. Spoiler: no lo era.',
  '🤫 Aportación de {names} a los interrupts de la raid: {count}. Redondo.',
];

// Para cuando el mínimo es > 0 (todos cortaron algo pero estos son los que menos)
const TAUNTS_SHAME_FEW = [
  '🤫 Los que menos cortaron esta noche ({count}): {names}. Una contribución... digamos que simbólica.',
  '🤫 {names} — {count} interrupt(s) cada uno. El peldaño más bajo del podio del silencio.',
  '🤫 {count} interrupt(s) por cabeza: {names}. El boss sobrevivió algún casteo de más por su culpa.',
  '🤫 Que conste en acta: {names} sí cortaron. {count} vez cada uno. El esfuerzo es lo que cuenta, supongo.',
  '🤫 {names} — {count} interrupt(s) al marcador. Técnicamente participaron en los interrupts.',
];

// ── Taunts: Dispels ───────────────────────────────────────────────────────────

const TAUNTS_DISPEL_HEROE = [
  { s: '**{name}** limpió {total} veces. Alguien tiene que hacerlo, y esta noche fue él.',
    p: '**{name}** — {total} dispels cada uno. Esta noche la limpieza fue asunto de varios.' },
  { s: '**{name}** — {total} veces quitó lo que el boss intentó poner. Trabajo sucio, manos limpias.',
    p: '**{name}** — {total} veces cada uno quitaron lo que el boss intentó poner. Trabajo sucio, manos limpias, en equipo.' },
  { s: 'Con {total} dispels, **{name}** fue el conserje de la raid. Sin él, la mitad habría muerto envenenada.',
    p: 'Con {total} dispels cada uno, **{name}** fueron los conserjes de la raid. Sin ellos, la mitad habría muerto envenenada.' },
  { s: '**{name}** y sus {total} dispels. Porque los debuffs no se quitan solos, aunque algunos actúen como si sí.',
    p: '**{name}** y sus {total} dispels cada uno. Porque los debuffs no se quitan solos, aunque el resto actuara como si sí.' },
];

const TAUNTS_DISPEL_HEROE_HIST = [
  { s: '**{name}** lidera los dispels esta raid Y el histórico. La escoba tiene dueño.',
    p: '**{name}** lideran los dispels esta raid Y el histórico, empatados. La escoba ahora tiene dos dueños.' },
  { s: '**{name}** — {total} dispels esta noche, más el mayor acumulado histórico. Vocación de limpieza.',
    p: '**{name}** — {total} dispels esta noche cada uno, y el mayor acumulado histórico compartido. Vocación de limpieza en dúo.' },
  { s: 'Histórico y presente: **{name}** sigue siendo el amo de la purificación. {total} dispels más al marcador.',
    p: 'Histórico y presente: **{name}** siguen siendo los amos de la purificación. {total} dispels más al marcador cada uno.' },
  { s: 'Raid tras raid, **{name}** quitando lo que otros ignoran. {total} dispels más al marcador histórico. Insustituible.',
    p: 'Raid tras raid, **{name}** quitando lo que otros ignoran. {total} dispels más al marcador histórico cada uno. Insustituibles.' },
  { s: '**{name}** acumula más dispels históricos que nadie. Esta noche suma {total} más. El debuff no tiene escapatoria.',
    p: '**{name}** acumulan más dispels históricos que nadie, empatados. Esta noche suman {total} más cada uno. El debuff no tiene escapatoria.' },
];

// ── Taunts: Golpes épicos ─────────────────────────────────────────────────────

const TAUNTS_GOLPE_RECIBIDO = [
  'Se la comió **{victima}**: **{amount}** de **{agresor}** con *{ability}*. El seguro no cubre esto.',
  '**{victima}** recibió **{amount}** de **{agresor}** vía *{ability}*. Sin previo aviso. Sin anestesia.',
  '**{agresor}** le mandó **{amount}** a **{victima}** con *{ability}*. Recibido.',
  '**{amount}** de **{agresor}** directo a **{victima}** (*{ability}*). Eso duele aunque tengas armadura.',
  '**{victima}** se llevó el golpe más gordo de la noche: **{amount}** de **{agresor}** — *{ability}*.',
];

const TAUNTS_GOLPE_DADO = [
  '**{heroe}** le metió **{amount}** a **{objetivo}** con *{ability}*. Cuando quiere, puede.',
  '**{amount}** de **{heroe}** a **{objetivo}** (*{ability}*). Al jefe sí que no le perdona.',
  '**{heroe}** pegó el hit más bestia de la noche: **{amount}** a **{objetivo}** vía *{ability}*. Lástima que no siempre.',
  '**{heroe}** a **{objetivo}**: **{amount}** con *{ability}*. Alguien sí vino a jugar.',
  'El golpe de la noche fue de **{heroe}** — **{amount}** a **{objetivo}** (*{ability}*).',
];

const TAUNTS_CURA = [
  { s: '💚 **{healer}** salvó a **{target}** con **{amount}** de *{ability}*. Lástima que no cure la vergüenza ajena.',
    p: '💚 **{healer}** — **{amount}** de *{ability}* a **{target}**. Trabajan el doble que los DPS. Al menos alguien trabaja.' },
  { s: '💚 **{amount}** de *{ability}* de **{healer}** a **{target}**. El héroe de la noche que nadie merece.',
    p: '💚 **{amount}** por cabeza de **{healer}** (*{ability}*) a **{target}**. Los héroes anónimos de siempre.' },
  { s: '💚 **{healer}** pegó una cura de **{amount}** a **{target}** (*{ability}*). Spoiler: **{target}** volvió a morirse igual.',
    p: '💚 **{healer}** — **{amount}** a **{target}** (*{ability}*). Spoiler: **{target}** volvió a palmarla de todos modos.' },
  { s: '💚 **{healer}** curó **{amount}** a **{target}** con *{ability}*. Ese número no justifica que el resto se comporte como si fueran inmortales.',
    p: '💚 **{healer}** — **{amount}** a **{target}** con *{ability}*. Que no se acostumbren.' },
  { s: '💚 La cura más bestia de la noche: **{amount}** de **{healer}** a **{target}** (*{ability}*). El suelo la estaba esperando también.',
    p: '💚 La cura más bestia: **{amount}** de **{healer}** a **{target}** (*{ability}*). Y aun así algunos se las arreglaron para morir.' },
];

// ── Taunts: Premios especiales ────────────────────────────────────────────────

const TAUNTS_JUGADOR_MES = [
  '🏆 **Jugador del Mes** (por las peores razones): **{name}**, con {puntos} puntos de vergüenza en {raids} raids.',
  '🏆 El MVP negativo del mes es **{name}**. {puntos} puntos en {raids} raids. Enhorabuena, supongo.',
  '🏆 **{name}** lidera el marcador mensual de la infamia con {puntos} puntos en {raids} raids. Mejorar es gratis, pero bueno.',
  '🏆 Mes a mes, **{name}** demuestra que la constancia tiene muchas formas. {puntos} puntos en {raids} raids. Esta es la peor.',
];

const TAUNTS_SIN_RESACA = [
  '✨ Premio "Sin Resaca": **{name}** — el jugador más limpio del historial con solo un {pct}% de vergüenza media en {raids} raids. Sospechoso.',
  '✨ **{name}** lleva {raids} raids siendo el menos vergonzoso del grupo ({pct}% de media). O juega bien o nadie se ha fijado aún.',
  '✨ **{name}** acumula solo un {pct}% de vergüenza media en {raids} raids. Silencio sospechoso. 🤫',
  '✨ **{name}** — {raids} raids y solo un {pct}% de vergüenza. O es el mejor de la guild o simplemente no hace nada. El debate sigue abierto.',
  '✨ **{name}** — {raids} raids y un {pct}% de vergüenza media. Tan limpio que resulta inquietante. 🔍',
  '✨ El jugador con menos vergüenza acumulada es **{name}**: {pct}% en {raids} raids. O tiene mucho talento o mucha suerte. Probablemente suerte.',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('es-ES');
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickTaunt(arr, plural = false) {
  const t = arr[Math.floor(Math.random() * arr.length)];
  return typeof t === 'string' ? t : (plural ? t.p : t.s);
}

function fill(tpl, vars) {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), tpl);
}

function buildDirectUrl(reportUrl, code, fightId) {
  const base = reportUrl.match(/https?:\/\/[^/]+/)[0];
  return `${base}/reports/${code}?fight=${fightId}&type=damage-taken&options=3`;
}

function formatFecha(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function getValue(e) {
  if (e.damage !== undefined) return e.damage;
  if (e.count  !== undefined) return e.count;
  if (e.ms     !== undefined) return e.ms;
  if (e.total  !== undefined) return e.total;
  if (e.score  !== undefined) return e.score;
  return 0;
}

// Devuelve todos los jugadores empatados en el primer puesto de una lista ordenada
function getTiedTop(list) {
  if (!list || list.length === 0) return [];
  const topVal = getValue(list[0]);
  return list.filter(e => getValue(e) === topVal);
}

// "Arak", "Arak y Bran", "Arak, Bran y Cali"
function joinNames(players) {
  if (players.length === 1) return players[0].name;
  const last = players[players.length - 1].name;
  const rest = players.slice(0, -1).map(p => p.name).join(', ');
  return `${rest} y ${last}`;
}

// 5 posiciones, cada posición puede tener varios jugadores empatados en la misma línea
function podioLines(list, limit, formatter) {
  const M = ['🥇', '🥈', '🥉'];
  const result = [];
  let i = 0;
  let position = 0;

  while (i < list.length && position < limit) {
    const val = getValue(list[i]);
    const group = [];
    while (i < list.length && getValue(list[i]) === val) {
      group.push(list[i]);
      i++;
    }
    const boldNames = group.map(e => `**${e.name}**`);
    const names = boldNames.length === 1
      ? boldNames[0]
      : boldNames.slice(0, -1).join(', ') + ' y ' + boldNames[boldNames.length - 1];
    const label = M[position] ?? `${position + 1}.`;
    result.push(`${label} ${names} — ${formatter(group[0])}`);
    position++;
  }

  return result;
}

// ── Sección muertes ───────────────────────────────────────────────────────────

function buildDeathSection(deathStats, historialData, ffWinner) {
  if (!deathStats) return [];
  const { deaths, timeDead, firstToDie } = deathStats;
  const { deathsPodio, timeDeadPodio, firstToDieCount } = historialData ?? {};

  const topMuertes      = deaths[0];
  const topTiempo       = timeDead[0];
  const histMuertes     = deathsPodio?.[0];
  const histTiempo      = timeDeadPodio?.[0];
  const tiedMuertes     = getTiedTop(deaths);
  const tiedTiempo      = getTiedTop(timeDead);
  const topMuertesName  = joinNames(tiedMuertes);
  const topTiempoName   = joinNames(tiedTiempo);
  const pluralMuertes   = tiedMuertes.length > 1;
  const pluralTiempo    = tiedTiempo.length > 1;

  // Primero en morir
  let primeroCaido = '';
  if (firstToDie) {
    const esTopMuertes = topMuertes?.name === firstToDie.name;
    primeroCaido = esTopMuertes
      ? fill(pickRandom(TAUNTS_PRIMERO_Y_MAS_MUERTES), { name: firstToDie.name, count: topMuertes.count })
      : fill(pickRandom(TAUNTS_PRIMERO), { name: firstToDie.name });

    const vecesFirst = firstToDieCount?.get(firstToDie.name) ?? 0;
    if (vecesFirst > 1) {
      primeroCaido = fill(pickRandom(TAUNTS_PRIMERO_REINCIDENTE), { name: firstToDie.name, count: vecesFirst });
    }
  }

  // Más muertes
  let tauntMuertes = '';
  if (topMuertes) {
    const esHistMuertes     = histMuertes?.name === topMuertes.name;
    const esTambienFF       = ffWinner?.name === topMuertes.name;
    const esTambienTopTiempo = topTiempo?.name === topMuertes.name;

    if (esHistMuertes) {
      tauntMuertes = fill(pickTaunt(TAUNTS_MUERTES_HIST, pluralMuertes), { name: topMuertesName, count: topMuertes.count });
    } else if (esTambienFF) {
      tauntMuertes = fill(pickRandom(TAUNTS_FF_Y_MUERTES), {
        name: topMuertesName, count: topMuertes.count, damage: formatNumber(ffWinner.damage),
      });
    } else if (esTambienTopTiempo) {
      tauntMuertes = fill(pickRandom(TAUNTS_MUERTES_Y_TIEMPO), {
        name: topMuertesName, count: topMuertes.count, time: formatTime(topTiempo.ms),
      });
    } else {
      tauntMuertes = fill(pickTaunt(TAUNTS_MUERTES, pluralMuertes), { name: topMuertesName, count: topMuertes.count });
    }
  }

  // Más tiempo muerto
  let tauntTiempo = '';
  if (topTiempo) {
    const esHistTiempo = histTiempo?.name === topTiempo.name;
    tauntTiempo = esHistTiempo
      ? fill(pickTaunt(TAUNTS_TIEMPO_HIST, pluralTiempo), { name: topTiempoName, time: formatTime(topTiempo.ms) })
      : fill(pickTaunt(TAUNTS_TIEMPO,      pluralTiempo), { name: topTiempoName, time: formatTime(topTiempo.ms) });
  }

  return [
    `**💀 Muertes esta raid** *(toda la raid)*:`,
    primeroCaido,
    ``,
    `** **`,
    `**Más muertes:**`,
    tauntMuertes,
    ...podioLines(deaths, 5, e => `${e.count} muertes`),
    ``,
    `** **`,
    `**Más tiempo muerto:**`,
    tauntTiempo,
    ...podioLines(timeDead, 5, e => formatTime(e.ms)),
    ``,
  ].filter(l => l !== '' && l !== undefined);
}

// ── Sección golpes épicos ─────────────────────────────────────────────────────

function buildBiggestHitsSection(biggestHits) {
  if (!biggestHits?.biggestReceived && !biggestHits?.biggestDealt && !biggestHits?.biggestHeal) return [];
  const { biggestReceived, biggestDealt, biggestHeal } = biggestHits;
  const lines = [`**💥 Golpes épicos de la noche** *(toda la raid)*:`];

  if (biggestReceived) {
    lines.push(`🛡️ **Mayor golpe recibido —** ` + fill(pickRandom(TAUNTS_GOLPE_RECIBIDO), {
      victima: biggestReceived.victima,
      agresor: biggestReceived.agresor,
      amount:  formatNumber(biggestReceived.amount),
      ability: biggestReceived.ability ?? '?',
    }));
  }
  if (biggestDealt) {
    lines.push(`⚔️ **Mayor golpe dado —** ` + fill(pickRandom(TAUNTS_GOLPE_DADO), {
      heroe:    biggestDealt.heroe,
      objetivo: biggestDealt.objetivo,
      amount:   formatNumber(biggestDealt.amount),
      ability:  biggestDealt.ability ?? '?',
    }));
  }
  if (biggestHeal) {
    lines.push(`💚 **Curación más gorda —** ` + fill(pickTaunt(TAUNTS_CURA), {
      healer:  biggestHeal.healer,
      target:  biggestHeal.target,
      amount:  formatNumber(biggestHeal.amount),
      ability: biggestHeal.ability ?? '?',
    }));
  }
  lines.push(``);
  return lines;
}

// ── Sección interrupts ────────────────────────────────────────────────────────

function buildInterruptSection(interrupts, shameInterrupts, interruptPodio, numRaids) {
  if (!interrupts || interrupts.length === 0) return [];

  const top = interrupts[0];
  const tiedInterrupts = getTiedTop(interrupts);
  const topName = joinNames(tiedInterrupts);
  const plural = tiedInterrupts.length > 1;
  const esLiderHist = interruptPodio?.length > 0 && interruptPodio[0].name === top.name;
  const heroTaunt = fill(
    pickTaunt(esLiderHist ? TAUNTS_INTERRUPT_HEROE_HIST : TAUNTS_INTERRUPT_HEROE, plural),
    { name: topName, total: top.total }
  );

  const lines = [
    `**⚡ Guardianes del Silencio** *(esta raid)*:`,
    heroTaunt,
    ...podioLines(interrupts, 5, e => `${e.total} interrupts (${e.topAbility})`),
    ``,
  ];

  // Vergüenza: clases con interrupt nativo que menos cortaron
  if (shameInterrupts?.length > 0) {
    const count     = shameInterrupts[0].total;
    const MAX_SHOW  = 6;
    const shown     = shameInterrupts.slice(0, MAX_SHOW).map(p => `**${p.name}**`);
    const extras    = shameInterrupts.length - MAX_SHOW;
    const namesList = extras > 0
      ? shown.join(', ') + ` *(y ${extras} más)*`
      : shown.join(', ');
    const tpl = pickRandom(count === 0 ? TAUNTS_SHAME_CERO : TAUNTS_SHAME_FEW);
    lines.push(fill(tpl, { names: namesList, count }));
    lines.push(``);
  }

  if (interruptPodio?.length > 0) {
    lines.push(`**⚡ Ranking histórico de interrupts** *(${numRaids} raids)*:`);
    lines.push(...podioLines(interruptPodio, 5, e => `${e.total} acumulados`));
    lines.push(``);
  }

  return lines;
}

// ── Sección dispels ───────────────────────────────────────────────────────────

function buildDispelSection(dispels, dispelPodio, numRaids) {
  if (!dispels || dispels.length === 0) return [];

  const top = dispels[0];
  const tiedDispels = getTiedTop(dispels);
  const topName = joinNames(tiedDispels);
  const plural = tiedDispels.length > 1;
  const esLiderHist = dispelPodio?.length > 0 && dispelPodio[0].name === top.name;
  const heroTaunt = fill(
    pickTaunt(esLiderHist ? TAUNTS_DISPEL_HEROE_HIST : TAUNTS_DISPEL_HEROE, plural),
    { name: topName, total: top.total }
  );

  const lines = [
    `**🧹 Purificadores de la Raid** *(esta raid)*:`,
    heroTaunt,
    ...podioLines(dispels, 5, e => `${e.total} dispels`),
    ``,
  ];

  if (dispelPodio?.length > 0) {
    lines.push(`**🧹 Ranking histórico de dispels** *(${numRaids} raids)*:`);
    lines.push(...podioLines(dispelPodio, 5, e => `${e.total} acumulados`));
    lines.push(``);
  }

  return lines;
}

// ── Sección premios especiales ────────────────────────────────────────────────

function buildPremiosSection(rankingVerguenza, sinResaca) {
  const lines = [];
  if (rankingVerguenza?.top?.length > 0) {
    const { top, numRaids } = rankingVerguenza;
    lines.push(`**🏆 Ranking de la Infamia — histórico (${numRaids} raids):**`);
    lines.push(`*(percentil medio de vergüenza en FF, muertes y tiempo muerto · mín. 30% de asistencia)*`);
    lines.push(...podioLines(top, 5, e => `${Math.round(e.score * 100)}% (${e.raidCount} raids)`));
    lines.push(``);
  }
  if (sinResaca) {
    const pct = Math.round(sinResaca.shameScore * 100);
    lines.push(fill(pickRandom(TAUNTS_SIN_RESACA), { name: sinResaca.name, raids: sinResaca.raidCount, pct }));
  }
  if (lines.length === 0) return [];
  return [`**🎖️ Premios especiales:**`, ...lines, ``];
}

// ── Portador info ─────────────────────────────────────────────────────────────

const PORTADOR_PRIMERA_VEZ = [
  'Primera vez. Ojalá fuera la última.',
  'Bienvenido al club. Nadie quería estar aquí.',
  'Primera vez que porta la resaca. Esperemos que sea vergüenza suficiente para no repetir.',
  'Primera vez. Ya tiene historial.',
  'Estreno oficial. El Salón de la Vergüenza ya tiene su nuevo inquilino.',
  'Primera vez, dicen. Siempre dicen eso.',
];

const PORTADOR_REPETIDOR = [
  '**{total} veces** ya. A estas alturas debería tener su propio aparcamiento reservado en el cementerio.',
  '**{total} veces** portando la resaca. En algún momento deja de ser mala suerte.',
  'Van **{total} veces**. La guild empieza a asumir que es intencional.',
  '**{total} veces**. Si hubiera un carnet de portador, ya estaría plastificado.',
  '**{total} veces**. Ya ni se sorprende nadie, solo se documenta.',
  '**{total} veces** cargando con la resaca. El boss ya le tiene más respeto a él que a los tanques.',
];

const PORTADOR_RACHA = [
  '🔥 **{racha} raids consecutivas** como Portador. Esto ya no es un accidente, es una identidad.',
  '🔥 **{racha}** seguidas. En este punto es un estilo de vida.',
  '🔥 **{racha} raids** consecutivas. Nadie le quita el trono.',
  '🔥 **{racha} raids** seguidas portando la resaca. En algún punto hay que plantearse si el problema es el boss o uno mismo.',
  '🔥 **{racha}** de racha. La guild ya no lo considera mala suerte, lo considera tradición.',
];

function buildPortadorInfo(name, total, racha) {
  const parts = [];
  if (total === 1) {
    parts.push(pickRandom(PORTADOR_PRIMERA_VEZ));
  } else {
    parts.push(fill(pickRandom(PORTADOR_REPETIDOR), { total }));
  }
  if (racha >= 2) {
    parts.push(fill(pickRandom(PORTADOR_RACHA), { racha }));
  }
  return parts.join(' ');
}

// ── Sección récords históricos ────────────────────────────────────────────────

function buildAllTimeRecordsSection(records) {
  if (!records) return [];
  const { biggestHit, biggestHeal, biggestReceived } = records;
  if (!biggestHit && !biggestHeal && !biggestReceived) return [];
  const lines = [`**🏅 Récords históricos de la guild:**`];
  if (biggestHit) {
    const ab = biggestHit.ability ? ` *${biggestHit.ability}*` : '';
    lines.push(`⚔️ **Mayor golpe dado:** **${formatNumber(biggestHit.amount)}**${ab} — **${biggestHit.heroe}** a ${biggestHit.objetivo} *(${formatFecha(biggestHit.fecha)})*`);
  }
  if (biggestHeal) {
    const ab = biggestHeal.ability ? ` *${biggestHeal.ability}*` : '';
    lines.push(`💚 **Mayor curación:** **${formatNumber(biggestHeal.amount)}**${ab} — **${biggestHeal.healer}** a ${biggestHeal.target} *(${formatFecha(biggestHeal.fecha)})*`);
  }
  if (biggestReceived) {
    const ab = biggestReceived.ability ? ` *${biggestReceived.ability}*` : '';
    lines.push(`🛡️ **Mayor golpe recibido:** **${formatNumber(biggestReceived.amount)}**${ab} — **${biggestReceived.victima}** de ${biggestReceived.agresor} *(${formatFecha(biggestReceived.fecha)})*`);
  }
  lines.push(``);
  return lines;
}

// ── Mensajes — devuelve array (Discord: límite 2000 chars por mensaje) ────────

function buildResacaMessage(leaderboard, reportUrl, code, fightId, historialData, fecha, deathStats, biggestHits, rankingVerguenza, sinResaca, interrupts, shameInterrupts, dispels, recordsGlobales) {
  const directUrl = buildDirectUrl(reportUrl, code, fightId);
  const fechaStr  = fecha ? ` — ${formatFecha(fecha)}` : '';
  const { ffPodio, deathsPodio, timeDeadPodio, portadorCount, rachaActiva, numRaids, totalDaño, interruptPodio, dispelPodio } = historialData ?? {};

  const salonLines = ffPodio?.length > 0 ? [
    `**🏛️ Salón de la Vergüenza — Acumulado histórico (${numRaids} raids):**`,
    ...podioLines(ffPodio, 5, e => `${formatNumber(e.damage)} de daño a aliados`),
    ``,
    `💥 Total de daño a aliados entre todas las raids: **${formatNumber(totalDaño)}**`,
    directUrl,
    ``,
  ] : [];

  const deathsHistLines = (deathsPodio?.length > 0 || timeDeadPodio?.length > 0) ? [
    `**💀 Salón de los Caídos — Muertes históricas (${numRaids} raids):**`,
    ...(deathsPodio?.length  > 0 ? podioLines(deathsPodio,  5, e => `${e.count} muertes`) : []),
    ``,
    `**⏳ Más tiempo muerto (histórico):**`,
    ...(timeDeadPodio?.length > 0 ? podioLines(timeDeadPodio, 5, e => formatTime(e.ms)) : []),
    ``,
  ] : [];

  const premiosLines        = buildPremiosSection(rankingVerguenza, sinResaca);
  const biggestHitsLines    = buildBiggestHitsSection(biggestHits);
  const allTimeRecordsLines = buildAllTimeRecordsSection(recordsGlobales);
  const interruptLines      = buildInterruptSection(interrupts, shameInterrupts, interruptPodio, numRaids);
  const dispelLines         = buildDispelSection(dispels, dispelPodio, numRaids);

  // ── Sin friendly fire ──
  if (!leaderboard || leaderboard.length === 0) {
    const msg1 = [
      `🍻 **La Resaca de Gruul**${fechaStr}`,
      ``,
      `Esta vez... ¡nadie dañó a sus compañeros! 🎉 La raid está limpia. Por esta vez. 😎`,
      ``,
      ...biggestHitsLines,
      ...allTimeRecordsLines,
      `---`,
      ...salonLines,
    ].join('\n');

    const msg2 = [
      `** **`,
      `⚡ **La Batalla del Silencio**${fechaStr}`,
      ``,
      ...interruptLines,
      ...(dispelLines.length > 0 ? [`---`, ...dispelLines] : []),
    ].join('\n');

    const msg3 = [
      `** **`,
      `⚰️ **El Cementerio**${fechaStr}`,
      ``,
      ...buildDeathSection(deathStats, historialData, null),
      `---`,
      ...deathsHistLines,
      ...premiosLines,
    ].join('\n');

    return [msg1, msg2, msg3].filter(m => m.trim().length > 30);
  }

  const winner        = leaderboard[0];
  const tiedFF        = getTiedTop(leaderboard);
  const winnerName    = joinNames(tiedFF);
  const esLiderFF     = ffPodio?.length > 0 && ffPodio[0].name === winner.name;
  const winnerLine    = fill(pickTaunt(esLiderFF ? TAUNTS_FF_HIST : TAUNTS_FF, tiedFF.length > 1), {
    name: winnerName, damage: formatNumber(winner.damage),
  });
  const vecesPortador = portadorCount?.get(winner.name) ?? 0;
  const racha         = rachaActiva?.name === winner.name ? rachaActiva.count : 1;
  const portadorInfo  = tiedFF.length === 1
    ? buildPortadorInfo(winner.name, vecesPortador, racha)
    : `${tiedFF.length} portadores esta noche. La vergüenza, compartida.`;

  // ── Mensaje 1: Friendly Fire ──
  const msg1 = [
    `🍻 **La Resaca de Gruul**${fechaStr}`,
    ``,
    `👉 El miembro que ha causado más daño a la raid es oficialmente declarado:`,
    ``,
    winnerLine,
    ``,
    `**"Portador de la Resaca de Gruul"** 🍺`,
    portadorInfo,
    ``,
    `---`,
    `**Clasificación FF esta raid:**`,
    ...podioLines(leaderboard, 5, e => `${formatNumber(e.damage)} de daño a aliados`),
    ``,
    `---`,
    ...salonLines,
    `---`,
    ...biggestHitsLines,
    ...allTimeRecordsLines,
  ].join('\n');

  // ── Mensaje 2: Interrupts + Dispels ──
  const msg2 = [
    `** **`,
    `⚡ **La Batalla del Silencio**${fechaStr}`,
    ``,
    ...interruptLines,
    ...(dispelLines.length > 0 ? [`---`, ...dispelLines] : []),
  ].join('\n');

  // ── Mensaje 3: Muertes + Premios ──
  const msg3 = [
    `** **`,
    `⚰️ **El Cementerio**${fechaStr}`,
    ``,
    ...buildDeathSection(deathStats, historialData, winner),
    `---`,
    ...deathsHistLines,
    ...premiosLines,
  ].join('\n');

  return [msg1, msg2, msg3];
}

module.exports = { buildResacaMessage };
