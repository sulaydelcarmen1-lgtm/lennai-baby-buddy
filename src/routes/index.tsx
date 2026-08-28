import { createFileRoute, Link } from "@tanstack/react-router";
import { BookHeart, CalendarClock, Crown, HeartHandshake, Moon, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CloudDecor } from "@/components/Decor";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { useLogs, useProfile } from "@/hooks/useProfile";
import { buildRoutine, getBabyAge, momMessages, stageFor } from "@/lib/baby";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu día con tu bebé — LennAI" },
      {
        name: "description",
        content:
          "Inicio personalizado de LennAI: edad de tu bebé, próximas tareas y recomendaciones del día.",
      },
      { property: "og:title", content: "Tu día con tu bebé — LennAI" },
      {
        property: "og:description",
        content: "Rutinas, registros y recomendaciones diarias para mamás primerizas.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Inicio />
    </AppShell>
  ),
});

function Inicio() {
  const { data: profile } = useProfile();
  const { data: logs = [] } = useLogs(1);
  const age = getBabyAge(profile?.baby_birth_date);
  const stage = stageFor(age?.months ?? 0);
  const routine = buildRoutine(age?.months ?? 0, profile?.feeding_type);
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const upcoming = routine.filter((b) => b.time >= currentTime).slice(0, 3);
  const next = upcoming.length ? upcoming : routine.slice(0, 3);
  const message = momMessages[now.getDate() % momMessages.length];

  const todaySleep = logs
    .filter((l) => l.kind === "sueno")
    .reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const todayFeeds = logs.filter((l) => l.kind === "alimentacion").length;
  const todayDiapers = logs.filter((l) => l.kind === "panal").length;

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-5 shadow-float">
        <CloudDecor />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/60">
            Tu día con tu bebé
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">
            Hola{profile?.mom_name ? `, ${profile.mom_name}` : ""} 💕
          </h1>
          <p className="mt-1 text-sm text-foreground/75">
            {profile?.baby_name ?? "Tu bebé"} tiene{" "}
            <strong>{age ? age.label : "edad sin definir"}</strong>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Sueño hoy" value={`${Math.round((todaySleep / 60) * 10) / 10} h`} />
            <Stat label="Tomas" value={String(todayFeeds)} />
            <Stat label="Pañales" value={String(todayDiapers)} />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-lg font-bold">Próximas tareas</h2>
        <p className="text-xs text-muted-foreground">Basadas en la rutina sugerida para su edad</p>
        <ul className="mt-3 space-y-2">
          {next.map((b) => (
            <li key={b.time} className="card-soft flex items-center gap-3 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-gradient text-lg">
                {b.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{b.title}</p>
                <p className="truncate text-xs text-muted-foreground">{b.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-bold">
                {b.time}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <h2 className="text-lg font-bold">Recomendado para hoy</h2>
        <div className="mt-3 card-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">{stage.title}</p>
          <p className="mt-1 text-sm">{stage.summary}</p>
          <div className="mt-3 grid gap-2 text-xs">
            <span className="rounded-2xl bg-lavender px-3 py-2 text-lavender-foreground">
              🌙 Sueño: {stage.sleep}
            </span>
            <span className="rounded-2xl bg-cream px-3 py-2 text-cream-foreground">
              🍽️ Alimentación: {stage.feeding}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <QuickAction
          to="/seguimiento"
          icon={<Moon className="h-5 w-5" />}
          title="Registrar"
          hint="Sueño, tomas y pañales"
          tone="bg-sky"
        />
        <QuickAction
          to="/lennai"
          icon={<Sparkles className="h-5 w-5" />}
          title="Preguntar a LennAI"
          hint="Respuestas personalizadas"
          tone="bg-lavender"
        />
        <QuickAction
          to="/rutinas"
          icon={<CalendarClock className="h-5 w-5" />}
          title="Rutina del día"
          hint="Generador por edad"
          tone="bg-mint"
        />
        <QuickAction
          to="/recuerdos"
          icon={<BookHeart className="h-5 w-5" />}
          title="Recuerdos"
          hint="Guarda momentos"
          tone="bg-rose"
        />
      </section>

      <section className="mt-5 card-soft p-4">
        <div className="flex items-center gap-2 text-primary">
          <HeartHandshake className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Para mamá</span>
        </div>
        <p className="mt-2 text-sm font-semibold">“{message}”</p>
        <Link
          to="/para-mama"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-rose-foreground"
        >
          Hacer mi check-in emocional
        </Link>
      </section>

      {!profile?.is_premium && (
        <Link
          to="/premium"
          className="mt-5 flex items-center gap-3 rounded-3xl bg-premium-gradient p-4 shadow-soft"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card">
            <Crown className="h-5 w-5 text-premium-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-premium-foreground">
              Prueba LennAI Premium
            </span>
            <span className="block text-xs text-premium-foreground/80">
              IA ilimitada, analíticas y rutinas avanzadas · US$7/mes
            </span>
          </span>
        </Link>
      )}

      <div className="mt-5">
        <WhatsAppSupport />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card/80 px-3 py-2.5 text-center shadow-soft">
      <p className="text-base font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  hint,
  tone,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
  tone: string;
}) {
  return (
    <Link
      to={to}
      className="card-soft flex flex-col gap-2 p-4 transition-transform active:scale-95"
      aria-label={`${title}: ${hint}`}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone}`}>{icon}</span>
      <span className="text-sm font-bold">{title}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </Link>
  );
}
