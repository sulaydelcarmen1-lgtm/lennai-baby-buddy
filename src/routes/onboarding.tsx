import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { CloudDecor } from "@/components/Decor";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Cuéntame de tu bebé — LennAI" },
      {
        name: "description",
        content: "Configura LennAI con la edad de tu bebé, su alimentación y tus preferencias.",
      },
      { property: "og:title", content: "Cuéntame de tu bebé — LennAI" },
      {
        property: "og:description",
        content: "Personaliza tu experiencia en LennAI en menos de un minuto.",
      },
    ],
  }),
  component: Onboarding,
});

const feedingOptions = [
  { id: "pecho", label: "Lactancia materna", emoji: "🤱" },
  { id: "formula", label: "Fórmula", emoji: "🍼" },
  { id: "mixta", label: "Mixta", emoji: "💞" },
  { id: "solidos", label: "Ya come sólidos", emoji: "🥑" },
];

const prefOptions = [
  { id: "sueno", label: "Ayuda con el sueño", emoji: "🌙" },
  { id: "alimentacion", label: "Alimentación", emoji: "🍽️" },
  { id: "rutinas", label: "Rutinas diarias", emoji: "⏰" },
  { id: "desarrollo", label: "Desarrollo e hitos", emoji: "🌱" },
  { id: "emocional", label: "Bienestar de mamá", emoji: "💗" },
  { id: "postparto", label: "Recuperación postparto", emoji: "🌸" },
];

function Onboarding() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [step, setStep] = useState(0);
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [feeding, setFeeding] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile?.baby_name) setBabyName(profile.baby_name);
    if (profile?.baby_birth_date) setBirthDate(profile.baby_birth_date);
  }, [profile]);

  async function finish() {
    try {
      await update.mutateAsync({
        baby_name: babyName || "mi bebé",
        baby_birth_date: birthDate || null,
        feeding_type: feeding,
        preferences: prefs,
        onboarded: true,
      });
      toast.success("¡Todo listo! Tu espacio está personalizado 🌸");
      navigate({ to: "/" });
    } catch {
      toast.error("No pudimos guardar tus datos");
    }
  }

  const canContinue = step === 0 ? Boolean(birthDate) : step === 1 ? Boolean(feeding) : true;

  return (
    <div className="relative min-h-screen bg-hero-gradient px-5 pb-10 pt-12">
      <CloudDecor />
      <div className="relative mx-auto w-full max-w-md">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-card/70"}`}
            />
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-float">
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-bold">Cuéntame de tu bebé</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Con la fecha de nacimiento personalizo rutinas, contenido e hitos.
              </p>
              <label className="mt-5 block">
                <span className="text-xs font-semibold text-muted-foreground">Nombre del bebé</span>
                <input
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Lenn"
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="mt-3 block">
                <span className="text-xs font-semibold text-muted-foreground">
                  Fecha de nacimiento
                </span>
                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold">¿Cómo se alimenta?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Puedes cambiarlo cuando quieras desde tu perfil.
              </p>
              <div className="mt-5 grid gap-2">
                {feedingOptions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setFeeding(o.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      feeding === o.id
                        ? "border-primary bg-rose text-rose-foreground"
                        : "border-input bg-background"
                    }`}
                  >
                    <span className="text-lg">{o.emoji}</span>
                    <span className="min-w-0 flex-1">{o.label}</span>
                    {feeding === o.id && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold">¿En qué te acompaño?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Elige todo lo que te interese. LennAI priorizará estos temas.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {prefOptions.map((o) => {
                  const active = prefs.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() =>
                        setPrefs((p) => (active ? p.filter((x) => x !== o.id) : [...p, o.id]))
                      }
                      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "border-primary bg-lavender text-lavender-foreground"
                          : "border-input bg-background"
                      }`}
                    >
                      {o.emoji} {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!canContinue || update.isPending}
            onClick={() => (step < 2 ? setStep(step + 1) : finish())}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-50"
          >
            {update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {step < 2 ? "Continuar" : "Empezar con LennAI"}
          </button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mt-2 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-muted-foreground"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
