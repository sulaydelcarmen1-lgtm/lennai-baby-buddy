import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { CloudDecor } from "@/components/Decor";
import { useAddMood, useMoods } from "@/hooks/useProfile";
import { momMessages } from "@/lib/baby";

export const Route = createFileRoute("/para-mama")({
  head: () => ({
    meta: [
      { title: "Para mamá: check-in emocional — LennAI" },
      {
        name: "description",
        content: "Mensajes de motivación y un check-in emocional diario pensado para ti, mamá.",
      },
      { property: "og:title", content: "Para mamá — LennAI" },
      {
        property: "og:description",
        content: "Tu bienestar también importa: registra cómo te sientes hoy.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ParaMama />
    </AppShell>
  ),
});

const moods = [
  { id: "genial", emoji: "🌞", label: "Genial" },
  { id: "bien", emoji: "🌸", label: "Bien" },
  { id: "cansada", emoji: "😴", label: "Cansada" },
  { id: "abrumada", emoji: "🌧️", label: "Abrumada" },
  { id: "triste", emoji: "💧", label: "Triste" },
];

function ParaMama() {
  const { data: history = [] } = useMoods();
  const addMood = useAddMood();
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const message = momMessages[new Date().getDate() % momMessages.length];

  async function save() {
    if (!mood) return;
    try {
      await addMood.mutateAsync({ mood, note });
      toast.success("Gracias por escucharte 💗");
      setMood(null);
      setNote("");
    } catch {
      toast.error("No pudimos guardar tu check-in");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Para mamá" title="¿Cómo estás tú hoy?" subtitle="Tu bienestar sostiene el de tu bebé." />

      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-5 shadow-float">
        <CloudDecor />
        <p className="relative text-base font-bold leading-snug">“{message}”</p>
      </section>

      <section className="card-soft mt-5 p-4">
        <h2 className="text-base font-bold">Check-in emocional</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {moods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              aria-pressed={mood === m.id}
              className={`rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                mood === m.id ? "border-primary bg-lavender text-lavender-foreground" : "border-input bg-background"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="¿Quieres contarme algo más? (opcional)"
          className="mt-3 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={save}
          disabled={!mood || addMood.isPending}
          className="mt-3 w-full rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft active:scale-95 disabled:opacity-50"
        >
          Guardar mi check-in
        </button>
      </section>

      {history.length > 0 && (
        <section className="mt-5">
          <h2 className="text-base font-bold">Tus últimos días</h2>
          <ul className="mt-3 space-y-2">
            {history.map((h: { id: string; mood: string; note: string | null; created_at: string }) => {
              const m = moods.find((x) => x.id === h.mood);
              return (
                <li key={h.id} className="card-soft flex items-center gap-3 p-3">
                  <span className="text-lg">{m?.emoji ?? "💗"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{m?.label ?? h.mood}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString("es-DO", {
                        day: "2-digit",
                        month: "short",
                      })}
                      {h.note ? ` · ${h.note}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-5">
        <WhatsAppSupport />
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Si te sientes muy triste o en riesgo, habla con un profesional de salud lo antes posible.
      </p>
    </div>
  );
}
