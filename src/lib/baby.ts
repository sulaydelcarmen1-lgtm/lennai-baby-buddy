export type BabyAge = {
  days: number;
  weeks: number;
  months: number;
  label: string;
};

export function getBabyAge(birthDate?: string | null): BabyAge | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate + "T00:00:00");
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / 86400000));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.4375);

  let label: string;
  if (days < 14) label = `${days} ${days === 1 ? "día" : "días"}`;
  else if (days < 84) label = `${weeks} semanas`;
  else if (months < 24) label = `${months} ${months === 1 ? "mes" : "meses"}`;
  else label = `${Math.floor(months / 12)} años`;

  return { days, weeks, months, label };
}

export type AgeStage = {
  id: string;
  min: number;
  max: number;
  title: string;
  summary: string;
  sleep: string;
  feeding: string;
};

export const stages: AgeStage[] = [
  {
    id: "recien-nacido",
    min: 0,
    max: 1,
    title: "Recién nacido (0-1 mes)",
    summary: "Piel con piel, tomas frecuentes y muchísimo descanso para las dos.",
    sleep: "14-17 h al día en siestas cortas de 2-3 h.",
    feeding: "8-12 tomas al día, a demanda.",
  },
  {
    id: "2-3-meses",
    min: 2,
    max: 3,
    title: "Descubriendo el mundo (2-3 meses)",
    summary: "Primeras sonrisas sociales y ventanas de vigilia un poco más largas.",
    sleep: "14-16 h al día, empieza a alargar la noche.",
    feeding: "6-8 tomas al día.",
  },
  {
    id: "4-6-meses",
    min: 4,
    max: 6,
    title: "Manitos y sabores (4-6 meses)",
    summary: "Agarra objetos, rueda y quizá comienza la alimentación complementaria.",
    sleep: "12-15 h con 3 siestas.",
    feeding: "5-6 tomas + posible inicio de sólidos a los 6 meses.",
  },
  {
    id: "7-9-meses",
    min: 7,
    max: 9,
    title: "En movimiento (7-9 meses)",
    summary: "Se sienta sola, gatea y disfruta jugar a esconderse.",
    sleep: "11-14 h con 2 siestas.",
    feeding: "3 comidas + 4 tomas de leche.",
  },
  {
    id: "10-12-meses",
    min: 10,
    max: 12,
    title: "Primeros pasos (10-12 meses)",
    summary: "Se pone de pie, señala y dice sus primeras palabras.",
    sleep: "11-14 h con 1-2 siestas.",
    feeding: "3 comidas + 2 meriendas.",
  },
  {
    id: "13-24-meses",
    min: 13,
    max: 240,
    title: "Pequeño explorador (1-2 años)",
    summary: "Camina, imita todo y su vocabulario crece cada semana.",
    sleep: "11-14 h con 1 siesta.",
    feeding: "3 comidas + 2 meriendas en familia.",
  },
];

export function stageFor(months: number | null | undefined): AgeStage {
  const m = months ?? 0;
  return stages.find((s) => m >= s.min && m <= s.max) ?? stages[stages.length - 1];
}

export type Article = {
  id: string;
  stageId: string;
  emoji: string;
  title: string;
  minutes: number;
  body: string;
  premium?: boolean;
};

export const articles: Article[] = [
  {
    id: "sueno-seguro",
    stageId: "recien-nacido",
    emoji: "🌙",
    title: "Sueño seguro desde el primer día",
    minutes: 4,
    body: "Boca arriba, superficie firme, sin objetos suaves en la cuna y en tu habitación los primeros meses. Un ambiente fresco y una rutina corta antes de dormir ayudan a que tu bebé asocie calma con descanso.",
  },
  {
    id: "lactancia-inicio",
    stageId: "recien-nacido",
    emoji: "🤱",
    title: "Cómo saber si la toma va bien",
    minutes: 5,
    body: "Busca un agarre profundo, mejillas redondeadas, deglución audible y al menos 6 pañales mojados al día. Si duele, cambia la postura: el dolor persistente merece acompañamiento profesional.",
  },
  {
    id: "colicos",
    stageId: "2-3-meses",
    emoji: "🫧",
    title: "Cólicos: qué calma de verdad",
    minutes: 4,
    body: "Movimiento suave, contacto piel con piel, ruido blanco y masaje abdominal en sentido horario. Los picos suelen ser al atardecer y mejoran cerca de los 3-4 meses.",
  },
  {
    id: "ventanas-sueno",
    stageId: "2-3-meses",
    emoji: "⏰",
    title: "Ventanas de sueño por edad",
    minutes: 3,
    body: "A los 2-3 meses tu bebé aguanta despierto entre 60 y 90 minutos. Respetar esa ventana reduce el llanto al dormir y mejora la calidad de las siestas.",
  },
  {
    id: "solidos",
    stageId: "4-6-meses",
    emoji: "🥑",
    title: "Empezar con sólidos sin miedo",
    minutes: 6,
    body: "Señales de listo: se sostiene sentada, buen control de cabeza y muestra interés. Empieza con un alimento nuevo cada 2-3 días y ofrece hierro (lentejas, carne, cereal fortificado).",
  },
  {
    id: "juego-motor",
    stageId: "4-6-meses",
    emoji: "🧸",
    title: "Juegos que estimulan el movimiento",
    minutes: 3,
    body: "Tiempo boca abajo varias veces al día, alcanzar objetos a la altura del pecho y espejos. Diez minutos activos valen más que una hora de estímulos pasivos.",
  },
  {
    id: "ansiedad-separacion",
    stageId: "7-9-meses",
    emoji: "🤗",
    title: "Ansiedad por separación",
    minutes: 4,
    body: "Es una señal de vínculo sano. Despídete siempre, breve y con la misma frase; jugar a esconderse le enseña que lo que desaparece vuelve.",
  },
  {
    id: "primeros-pasos",
    stageId: "10-12-meses",
    emoji: "👣",
    title: "Preparando los primeros pasos",
    minutes: 4,
    body: "Pies descalzos en casa, muebles estables para apoyarse y espacio libre. No hacen falta andadores: el suelo es el mejor entrenador.",
  },
  {
    id: "rabietas",
    stageId: "13-24-meses",
    emoji: "🌈",
    title: "Rabietas con calma",
    minutes: 5,
    body: "Nombra la emoción, ofrece dos opciones simples y sostén el límite con voz suave. Tu regulación es su regulación.",
  },
  {
    id: "plan-sueno-premium",
    stageId: "recien-nacido",
    emoji: "✨",
    title: "Plan de sueño personalizado de 14 días",
    minutes: 12,
    body: "Programa guiado paso a paso, ajustado a la edad de tu bebé y a tus registros de sueño.",
    premium: true,
  },
  {
    id: "menu-premium",
    stageId: "4-6-meses",
    emoji: "✨",
    title: "Menús semanales por edad",
    minutes: 10,
    body: "Planificador de comidas con lista de compras e ideas para cada textura.",
    premium: true,
  },
];

export type Milestone = { slug: string; label: string; monthFrom: number; emoji: string };

export const milestoneList: Milestone[] = [
  { slug: "sostiene-cabeza", label: "Sostiene la cabeza", monthFrom: 2, emoji: "🍼" },
  { slug: "primera-sonrisa", label: "Primera sonrisa social", monthFrom: 2, emoji: "😊" },
  { slug: "sigue-objetos", label: "Sigue objetos con la mirada", monthFrom: 3, emoji: "👀" },
  { slug: "se-voltea", label: "Se voltea sola", monthFrom: 5, emoji: "🔄" },
  { slug: "agarra-objetos", label: "Agarra objetos", monthFrom: 5, emoji: "✋" },
  { slug: "se-sienta", label: "Se sienta sin apoyo", monthFrom: 7, emoji: "🧘" },
  { slug: "balbucea", label: "Balbucea sílabas", monthFrom: 8, emoji: "💬" },
  { slug: "gatea", label: "Gatea", monthFrom: 9, emoji: "🐛" },
  { slug: "se-para", label: "Se pone de pie", monthFrom: 10, emoji: "🦵" },
  { slug: "primera-palabra", label: "Primera palabra", monthFrom: 12, emoji: "🗣️" },
  { slug: "camina", label: "Camina sola", monthFrom: 13, emoji: "👣" },
  { slug: "usa-cuchara", label: "Come con cuchara", monthFrom: 16, emoji: "🥄" },
];

export type RoutineBlock = { time: string; title: string; detail: string; icon: string };

export function buildRoutine(months: number, feedingType?: string | null): RoutineBlock[] {
  const milk =
    feedingType === "formula"
      ? "Biberón"
      : feedingType === "mixta"
        ? "Toma (pecho o biberón)"
        : "Toma de pecho";

  if (months < 4) {
    return [
      { time: "07:00", title: `${milk} de la mañana`, detail: "Luz natural y piel con piel.", icon: "🌅" },
      { time: "08:00", title: "Siesta 1", detail: "Ventana de vigilia de 60-90 min.", icon: "😴" },
      { time: "10:00", title: `${milk} + juego suave`, detail: "5-10 min boca abajo.", icon: "🧸" },
      { time: "11:30", title: "Siesta 2", detail: "Ambiente oscuro y ruido blanco.", icon: "🌙" },
      { time: "13:30", title: `${milk}`, detail: "Momento de calma para ti también.", icon: "🤱" },
      { time: "15:00", title: "Siesta 3", detail: "Paseo o porteo si no conecta.", icon: "🚼" },
      { time: "18:30", title: "Baño y masaje", detail: "Agua tibia y aceite vegetal.", icon: "🛁" },
      { time: "19:30", title: "Rutina de noche", detail: `${milk}, canción y a dormir.`, icon: "⭐" },
    ];
  }
  if (months < 9) {
    return [
      { time: "07:00", title: `${milk} al despertar`, detail: "Abre cortinas y saluda al día.", icon: "🌅" },
      { time: "08:30", title: "Juego en el suelo", detail: "Alcanzar, rodar, sentarse.", icon: "🧸" },
      { time: "09:15", title: "Siesta 1", detail: "60-90 min.", icon: "😴" },
      { time: "11:00", title: "Comida / puré", detail: "Ofrece hierro y verduras.", icon: "🥑" },
      { time: "13:00", title: "Siesta 2", detail: "La siesta más larga del día.", icon: "🌙" },
      { time: "15:30", title: `${milk} + paseo`, detail: "Aire fresco 20 min.", icon: "🚼" },
      { time: "18:00", title: "Cena suave", detail: "Textura acorde a su edad.", icon: "🍠" },
      { time: "19:30", title: "Baño y noche", detail: "Rutina de 20 min siempre igual.", icon: "⭐" },
    ];
  }
  return [
    { time: "07:00", title: "Despertar y desayuno", detail: "Fruta + cereal + leche.", icon: "🌅" },
    { time: "09:00", title: "Juego activo", detail: "Gateo, empujar, apilar.", icon: "🧱" },
    { time: "09:45", title: "Siesta 1", detail: "45-60 min.", icon: "😴" },
    { time: "12:00", title: "Almuerzo en familia", detail: "Deja que explore con las manos.", icon: "🍽️" },
    { time: "13:30", title: "Siesta 2", detail: "1-2 h.", icon: "🌙" },
    { time: "16:00", title: "Merienda + parque", detail: "Motricidad y socialización.", icon: "🌳" },
    { time: "18:30", title: "Cena y baño", detail: "Baja las luces después.", icon: "🛁" },
    { time: "19:45", title: "Cuento y a dormir", detail: "Mismo orden cada noche.", icon: "📖" },
  ];
}

export const momMessages = [
  "Estás haciendo un trabajo enorme, aunque hoy no lo sientas así.",
  "Tu bebé no necesita una mamá perfecta, te necesita a ti.",
  "Descansar también es cuidar de tu bebé.",
  "Pedir ayuda es un acto de amor, no de debilidad.",
  "Cada día aprendes algo nuevo. Eso es crecer juntas.",
  "Tu cuerpo hizo algo extraordinario. Trátalo con ternura.",
  "Las noches difíciles no borran todo lo bueno que haces.",
];

export const WHATSAPP_NUMBER = "18209903366";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hola, necesito ayuda con LennAI 💕",
)}`;
