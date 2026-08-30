import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Crown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PremiumLock } from "@/components/PremiumLock";
import { useProfile } from "@/hooks/useProfile";
import { articles, getBabyAge, stageFor, stages } from "@/lib/baby";

export const Route = createFileRoute("/contenido")({
  head: () => ({
    meta: [
      { title: "Contenido por edad del bebé — LennAI" },
      {
        name: "description",
        content:
          "Artículos cortos de sueño, alimentación y desarrollo seleccionados según la edad de tu bebé.",
      },
      { property: "og:title", content: "Contenido por edad del bebé — LennAI" },
      {
        property: "og:description",
        content: "Guías breves y confiables para cada etapa del primer año.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Contenido />
    </AppShell>
  ),
});

function Contenido() {
  const { data: profile } = useProfile();
  const age = getBabyAge(profile?.baby_birth_date);
  const currentStage = stageFor(age?.months ?? 0);
  const [stageId, setStageId] = useState(currentStage.id);
  const [open, setOpen] = useState<string | null>(null);
  const list = articles.filter((a) => a.stageId === stageId);
  const isPremium = Boolean(profile?.is_premium);

  return (
    <div>
      <PageHeader
        eyebrow="Contenido personalizado"
        title="Para esta etapa"
        subtitle={`Seleccionado para ${profile?.baby_name ?? "tu bebé"} · ${age ? age.label : "sin edad definida"}`}
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {stages.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStageId(s.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              stageId === s.id ? "bg-primary-gradient text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {s.title.split("(")[0]?.trim()}
          </button>
        ))}
      </div>

      <div className="card-soft mb-4 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {stageFor(stages.find((s) => s.id === stageId)!.min).title}
        </p>
        <p className="mt-1 text-sm">{stages.find((s) => s.id === stageId)!.summary}</p>
      </div>

      <ul className="space-y-3">
        {list.map((a) => {
          const locked = a.premium && !isPremium;
          if (locked) {
            return (
              <li key={a.id}>
                <PremiumLock title={a.title} description={a.body} cta="Ver con Premium" />
              </li>
            );
          }
          return (
            <li key={a.id} className="card-soft overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === a.id ? null : a.id)}
                aria-expanded={open === a.id}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-gradient text-lg">
                  {a.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{a.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {a.minutes} min de lectura
                    {a.premium && <Crown className="ml-1 h-3 w-3 text-premium-foreground" />}
                  </span>
                </span>
              </button>
              {open === a.id && (
                <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {a.body}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!isPremium && (
        <div className="mt-5">
          <PremiumLock
            title="Biblioteca exclusiva Premium"
            description="Guías largas, planes de sueño de 14 días y menús semanales por edad."
          />
        </div>
      )}
    </div>
  );
}
