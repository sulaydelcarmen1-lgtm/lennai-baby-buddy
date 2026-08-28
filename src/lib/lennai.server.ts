import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_DAILY_LIMIT = 5;

type Ctx = {
  supabase: SupabaseClient<any, any, any>;
  userId: string;
};

export async function askLennAI(ctx: Ctx, question: string) {
  const { supabase, userId } = ctx;

  const { data: profile } = await supabase
    .from("profiles")
    .select("mom_name, baby_name, baby_birth_date, feeding_type, preferences, is_premium")
    .eq("id", userId)
    .maybeSingle();

  const isPremium = Boolean(profile?.is_premium);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", startOfDay.toISOString());

  const used = count ?? 0;
  if (!isPremium && used >= FREE_DAILY_LIMIT) {
    return {
      limited: true as const,
      used,
      limit: FREE_DAILY_LIMIT,
      answer:
        "Has alcanzado tus 5 preguntas gratuitas de hoy 💕 Con LennAI Premium puedes conversar sin límites, cuando quieras.",
    };
  }

  const { data: logs } = await supabase
    .from("baby_logs")
    .select("kind, started_at, duration_minutes, amount_ml, detail")
    .order("started_at", { ascending: false })
    .limit(25);

  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .order("created_at", { ascending: false })
    .limit(10);

  let ageText = "edad desconocida";
  if (profile?.baby_birth_date) {
    const days = Math.floor(
      (Date.now() - new Date(profile.baby_birth_date + "T00:00:00").getTime()) / 86400000,
    );
    ageText = `${days} días (~${Math.floor(days / 30.4375)} meses)`;
  }

  const system = `Eres LennAI, una asistente cálida y empática para madres primerizas. Respondes SIEMPRE en español, en tono cercano, breve (máximo 180 palabras), con pasos concretos y sin juzgar.
Contexto de la usuaria:
- Nombre de mamá: ${profile?.mom_name ?? "no indicado"}
- Bebé: ${profile?.baby_name ?? "no indicado"}, edad: ${ageText}
- Alimentación: ${profile?.feeding_type ?? "no indicada"}
- Preferencias: ${(profile?.preferences ?? []).join(", ") || "ninguna"}
- Registros recientes: ${JSON.stringify(logs ?? []).slice(0, 1500)}
Personaliza tus recomendaciones con estos datos. No das diagnósticos médicos: ante señales de alarma (fiebre en menores de 3 meses, dificultad para respirar, deshidratación, llanto inconsolable) recomienda acudir a su pediatra.`;

  const messages = [
    { role: "system", content: system },
    ...(history ?? []).reverse().map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: question },
  ];

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Falta la configuración de IA.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("AI gateway error", res.status, text);
    throw new Error("LennAI no pudo responder ahora mismo. Intenta de nuevo en un momento.");
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const answer = json.choices?.[0]?.message?.content?.trim() ?? "No pude generar una respuesta.";

  await supabase.from("ai_messages").insert([
    { user_id: userId, role: "user", content: question },
    { user_id: userId, role: "assistant", content: answer },
  ]);

  return { limited: false as const, used: used + 1, limit: FREE_DAILY_LIMIT, answer };
}

export async function buildAdvancedRoutine(ctx: Ctx) {
  const { supabase, userId } = ctx;
  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_name, baby_birth_date, feeding_type, is_premium")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.is_premium) {
    return { premiumRequired: true as const, routine: "" };
  }

  const { data: logs } = await supabase
    .from("baby_logs")
    .select("kind, started_at, duration_minutes, amount_ml")
    .order("started_at", { ascending: false })
    .limit(40);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Falta la configuración de IA.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Eres LennAI. Creas rutinas diarias para bebés en español, en formato de lista con horas (HH:MM — actividad — consejo breve). Máximo 10 bloques. Tono cálido.",
        },
        {
          role: "user",
          content: `Crea una rutina avanzada para ${profile.baby_name ?? "el bebé"}, nacido el ${
            profile.baby_birth_date ?? "fecha no indicada"
          }, alimentación ${profile.feeding_type ?? "no indicada"}. Ajústala a estos registros reales: ${JSON.stringify(
            logs ?? [],
          ).slice(0, 1500)}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("No se pudo generar la rutina avanzada.");
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return {
    premiumRequired: false as const,
    routine: json.choices?.[0]?.message?.content?.trim() ?? "",
  };
}
