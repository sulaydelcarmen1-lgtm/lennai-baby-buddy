import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PremiumLock } from "@/components/PremiumLock";
import { useProfile } from "@/hooks/useProfile";
import { advancedRoutineFn } from "@/lib/lennai.functions";
import { buildRoutine, getBabyAge, stageFor } from "@/lib/baby";

export const Route = createFileRoute("/rutinas")({
  head: () => ({
    meta: [
      { title: "Rutina diaria del bebé — LennAI" },
      {
        name: "description",
        content: "Generador de rutinas diarias según la edad y las necesidades de tu bebé.",
      },
      { property: "og:title", content: "Rutina diaria del bebé — LennAI" },
      {
        property: "og:description",
        content: "Horarios de sueño, tomas y juego adaptados a la edad de tu bebé.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Rutinas />
    </AppShell>
  ),
});

function Rutinas() {
  const { data: profile } = useProfile();
  const age = getBabyAge(profile?.baby_birth_date);
  const stage = stageFor(age?.months ?? 0);
  const [routine, setRoutine] = useState(() => buildRoutine(age?.months ?? 0, profile?.feeding_type));
  const [advanced, setAdvanced] = useState<string | null>(null);
  const generateAdvanced = useServerFn(advancedRoutineFn);

  const advancedMutation = useMutation({
    mutationFn: () => generateAdvanced({ data: undefined }),
    onSuccess: (res) => {
      if (res.premiumRequired) {
        toast.info("Las rutinas avanzadas son parte de Premium");
        return;
      }
      setAdvanced(res.routine);
    },
    onError: () => toast.error("No pudimos generar la rutina avanzada"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Generador de rutinas"
        title="La rutina de hoy"
        subtitle={`${stage.title} · ${age ? age.label : "define la fecha de nacimiento"}`}
      />

      <button
        type="button"
        onClick={() => {
          setRoutine(buildRoutine(age?.months ?? 0, profile?.feeding_type));
          toast.success("Rutina actualizada para su edad actual");
        }}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft active:scale-95"
      >
        <Wand2 className="h-4 w-4" /> Regenerar rutina sugerida
      </button>

      <ol className="space-y-2">
        {routine.map((b) => (
          <li key={b.time} className="card-soft flex items-start gap-3 p-3.5">
            <span className="shrink-0 rounded-2xl bg-sky px-2.5 py-1 text-xs font-bold text-sky-foreground">
              {b.time}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {b.icon} {b.title}
              </p>
              <p className="text-xs text-muted-foreground">{b.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {profile?.is_premium ? (
          <div className="card-soft p-4">
            <h2 className="text-base font-bold">Rutina avanzada con IA</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Se ajusta a tus registros reales de sueño y alimentación.
            </p>
            <button
              type="button"
              onClick={() => advancedMutation.mutate()}
              disabled={advancedMutation.isPending}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-premium-gradient px-4 py-3 text-sm font-bold text-premium-foreground active:scale-95 disabled:opacity-60"
            >
              {advancedMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generar rutina avanzada
            </button>
            {advanced && (
              <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-muted p-3 text-xs leading-relaxed">
                {advanced}
              </pre>
            )}
          </div>
        ) : (
          <PremiumLock
            title="Rutinas avanzadas con IA"
            description="Rutinas que aprenden de tus registros reales y se ajustan cada semana."
          />
        )}
      </div>
    </div>
  );
}
