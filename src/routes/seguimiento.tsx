import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Baby, Droplets, Milk, Moon, Trash2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PremiumLock } from "@/components/PremiumLock";
import {
  useAddLog,
  useDeleteLog,
  useLogs,
  useMilestones,
  useProfile,
  useToggleMilestone,
} from "@/hooks/useProfile";
import { getBabyAge, milestoneList } from "@/lib/baby";

export const Route = createFileRoute("/seguimiento")({
  head: () => ({
    meta: [
      { title: "Seguimiento de sueño, tomas y pañales — LennAI" },
      {
        name: "description",
        content:
          "Registra el sueño, la alimentación y los pañales de tu bebé y sigue sus hitos de desarrollo.",
      },
      { property: "og:title", content: "Seguimiento diario — LennAI" },
      {
        property: "og:description",
        content: "Un registro simple y visual del día a día de tu bebé.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Seguimiento />
    </AppShell>
  ),
});

type Tab = "registro" | "hitos" | "analiticas";

function Seguimiento() {
  const [tab, setTab] = useState<Tab>("registro");

  return (
    <div>
      <PageHeader
        eyebrow="Seguimiento"
        title="El día de tu bebé"
        subtitle="Registra en un toque y observa los patrones."
      />

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {(
          [
            ["registro", "Registro"],
            ["hitos", "Hitos"],
            ["analiticas", "Analíticas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-2 py-2 text-xs font-bold transition-colors ${
              tab === id ? "bg-card shadow-soft" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "registro" && <RegistroTab />}
      {tab === "hitos" && <HitosTab />}
      {tab === "analiticas" && <AnaliticasTab />}
    </div>
  );
}

const kinds = {
  sueno: { label: "Sueño", icon: Moon, tone: "bg-lavender text-lavender-foreground" },
  alimentacion: { label: "Alimentación", icon: Milk, tone: "bg-cream text-cream-foreground" },
  panal: { label: "Pañal", icon: Droplets, tone: "bg-sky text-sky-foreground" },
} as const;

function RegistroTab() {
  const { data: logs = [] } = useLogs(7);
  const addLog = useAddLog();
  const deleteLog = useDeleteLog();
  const [form, setForm] = useState<{ kind: keyof typeof kinds | null; value: string; note: string }>({
    kind: null,
    value: "",
    note: "",
  });

  async function save() {
    if (!form.kind) return;
    const payload =
      form.kind === "sueno"
        ? { kind: "sueno", duration_minutes: Number(form.value) || 0, note: form.note }
        : form.kind === "alimentacion"
          ? { kind: "alimentacion", amount_ml: Number(form.value) || null, note: form.note }
          : { kind: "panal", detail: form.value || "mixto", note: form.note };
    try {
      await addLog.mutateAsync(payload);
      toast.success("Registro guardado 🌸");
      setForm({ kind: null, value: "", note: "" });
    } catch {
      toast.error("No pudimos guardar el registro");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(kinds) as (keyof typeof kinds)[]).map((k) => {
          const Icon = kinds[k].icon;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setForm({ kind: k, value: "", note: "" })}
              aria-label={`Registrar ${kinds[k].label}`}
              className={`flex flex-col items-center gap-2 rounded-3xl p-4 shadow-soft transition-transform active:scale-95 ${kinds[k].tone}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-bold">{kinds[k].label}</span>
            </button>
          );
        })}
      </div>

      {form.kind && (
        <div className="card-soft mt-4 p-4">
          <h2 className="text-base font-bold">Nuevo registro · {kinds[form.kind].label}</h2>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">
              {form.kind === "sueno"
                ? "Duración (minutos)"
                : form.kind === "alimentacion"
                  ? "Cantidad (ml, opcional)"
                  : "Tipo (pipí, popó, mixto)"}
            </span>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              inputMode={form.kind === "panal" ? "text" : "numeric"}
              placeholder={form.kind === "panal" ? "pipí" : "45"}
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">Nota (opcional)</span>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Se durmió en brazos"
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={addLog.isPending}
              className="flex-1 rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft active:scale-95 disabled:opacity-60"
            >
              Guardar registro
            </button>
            <button
              type="button"
              onClick={() => setForm({ kind: null, value: "", note: "" })}
              className="rounded-2xl border border-input px-4 py-3 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <h2 className="mt-6 text-base font-bold">Últimos 7 días</h2>
      {logs.length === 0 ? (
        <p className="mt-2 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Aún no hay registros. Toca un botón de arriba para empezar.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {logs.map((l) => {
            const meta = kinds[l.kind as keyof typeof kinds] ?? kinds.panal;
            const Icon = meta.icon;
            return (
              <li key={l.id} className="card-soft flex items-center gap-3 p-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${meta.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {meta.label}
                    {l.duration_minutes ? ` · ${l.duration_minutes} min` : ""}
                    {l.amount_ml ? ` · ${l.amount_ml} ml` : ""}
                    {l.detail ? ` · ${l.detail}` : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(l.started_at).toLocaleString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {l.note ? ` · ${l.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Eliminar registro"
                  onClick={() => deleteLog.mutate(l.id)}
                  className="shrink-0 rounded-full p-2 text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function HitosTab() {
  const { data: profile } = useProfile();
  const { data: achieved = [] } = useMilestones();
  const toggle = useToggleMilestone();
  const age = getBabyAge(profile?.baby_birth_date);
  const done = new Set(achieved.map((m: { slug: string }) => m.slug));

  return (
    <div>
      <div className="card-soft flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint">
          <Baby className="h-5 w-5 text-mint-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">
            {done.size} de {milestoneList.length} hitos alcanzados
          </p>
          <p className="text-xs text-muted-foreground">
            Cada bebé tiene su ritmo. Esto es solo una guía.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {milestoneList.map((m) => {
          const isDone = done.has(m.slug);
          const expected = (age?.months ?? 0) >= m.monthFrom;
          return (
            <li key={m.slug}>
              <button
                type="button"
                onClick={() => toggle.mutate({ slug: m.slug, achieved: !isDone })}
                aria-pressed={isDone}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                  isDone ? "border-primary bg-rose" : "border-border bg-card"
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    Desde ~{m.monthFrom} meses {expected && !isDone ? "· ya podría lograrlo" : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold">{isDone ? "✓" : "+"}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AnaliticasTab() {
  const { data: profile } = useProfile();
  const { data: logs = [] } = useLogs(7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((l) => l.started_at.slice(0, 10) === key);
    return {
      dia: d.toLocaleDateString("es-DO", { weekday: "short" }),
      sueno:
        Math.round(
          (dayLogs.filter((l) => l.kind === "sueno").reduce((s, l) => s + (l.duration_minutes ?? 0), 0) /
            60) *
            10,
        ) / 10,
      tomas: dayLogs.filter((l) => l.kind === "alimentacion").length,
      panales: dayLogs.filter((l) => l.kind === "panal").length,
    };
  });

  if (!profile?.is_premium) {
    return (
      <div className="space-y-4">
        <div className="card-soft p-4">
          <h2 className="text-base font-bold">Resumen básico</h2>
          <p className="mt-1 text-xs text-muted-foreground">Tus últimos 7 días en números.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MiniStat
              label="Sueño prom."
              value={`${Math.round((days.reduce((s, d) => s + d.sueno, 0) / 7) * 10) / 10} h`}
            />
            <MiniStat label="Tomas prom." value={String(Math.round(days.reduce((s, d) => s + d.tomas, 0) / 7))} />
            <MiniStat
              label="Pañales prom."
              value={String(Math.round(days.reduce((s, d) => s + d.panales, 0) / 7))}
            />
          </div>
        </div>
        <PremiumLock
          title="Analíticas completas"
          description="Gráficas de sueño y alimentación, tendencias semanales y alertas de patrones."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-soft p-4">
        <h2 className="text-base font-bold">Horas de sueño por día</h2>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="dia" fontSize={11} stroke="var(--color-muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />
              <Tooltip />
              <Line type="monotone" dataKey="sueno" stroke="var(--color-lavender-foreground)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card-soft p-4">
        <h2 className="text-base font-bold">Tomas y pañales</h2>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="dia" fontSize={11} stroke="var(--color-muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--color-muted-foreground)" />
              <Tooltip />
              <Bar dataKey="tomas" fill="var(--color-cream-foreground)" radius={6} />
              <Bar dataKey="panales" fill="var(--color-sky-foreground)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-2 py-3">
      <p className="text-base font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
