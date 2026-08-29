import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Apple, Check, CreditCard, Crown, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CloudDecor } from "@/components/Decor";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "LennAI Premium — US$7 al mes" },
      {
        name: "description",
        content:
          "LennAI Premium: IA ilimitada, rutinas avanzadas, analíticas y contenido exclusivo por US$7 al mes.",
      },
      { property: "og:title", content: "LennAI Premium — US$7 al mes" },
      {
        property: "og:description",
        content: "Desbloquea IA ilimitada, analíticas y rutinas avanzadas para acompañar tu maternidad.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Premium />
    </AppShell>
  ),
});

const benefits = [
  { emoji: "✨", title: "IA ilimitada", detail: "Pregunta a LennAI todas las veces que quieras." },
  { emoji: "📅", title: "Rutinas avanzadas", detail: "Generadas con tus registros reales." },
  { emoji: "📊", title: "Analíticas completas", detail: "Gráficas de sueño, tomas y tendencias." },
  { emoji: "🔔", title: "Automatizaciones", detail: "Recordatorios inteligentes de tomas y siestas." },
  { emoji: "📚", title: "Contenido exclusivo", detail: "Planes de sueño y menús semanales." },
];

function Premium() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"apple" | "card">("apple");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [busy, setBusy] = useState(false);

  async function activate() {
    setBusy(true);
    try {
      await update.mutateAsync({ is_premium: true });
      toast.success("¡Bienvenida a Premium! Todo desbloqueado 👑");
      navigate({ to: "/" });
    } catch {
      toast.error("No pudimos activar tu suscripción");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    try {
      await update.mutateAsync({ is_premium: false });
      toast.success("Tu suscripción se canceló. Puedes volver cuando quieras 💕");
    } catch {
      toast.error("No pudimos cancelar la suscripción");
    }
  }

  if (profile?.is_premium) {
    return (
      <div>
        <section className="relative overflow-hidden rounded-3xl bg-premium-gradient p-5 shadow-float">
          <CloudDecor />
          <div className="relative">
            <Crown className="h-6 w-6 text-premium-foreground" />
            <h1 className="mt-2 text-2xl font-extrabold text-premium-foreground">
              Eres LennAI Premium
            </h1>
            <p className="mt-1 text-sm text-premium-foreground/80">
              US$7/mes · se renueva automáticamente
            </p>
          </div>
        </section>

        <section className="card-soft mt-5 p-4">
          <h2 className="text-base font-bold">Gestionar suscripción</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Plan" value="Premium mensual" />
            <Row label="Precio" value="US$7.00 / mes" />
            <Row label="Método de pago" value={method === "apple" ? "Apple Pay" : "Tarjeta"} />
            <Row
              label="Próximo cobro"
              value={new Date(Date.now() + 30 * 86400000).toLocaleDateString("es-DO", {
                day: "2-digit",
                month: "long",
              })}
            />
          </dl>
          <button
            type="button"
            onClick={() => setMethod(method === "apple" ? "card" : "apple")}
            className="mt-4 w-full rounded-2xl border border-input px-4 py-3 text-sm font-semibold"
          >
            Cambiar método de pago
          </button>
          <button
            type="button"
            onClick={cancel}
            className="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-destructive"
          >
            Cancelar suscripción
          </button>
        </section>

        <div className="mt-5">
          <WhatsAppSupport />
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-premium-gradient p-5 shadow-float">
        <CloudDecor />
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-bold">
            <Crown className="h-3 w-3 text-premium-foreground" /> Premium
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-premium-foreground">
            Todo LennAI, sin límites
          </h1>
          <p className="mt-1 text-sm text-premium-foreground/85">
            <strong className="text-2xl">US$7</strong> /mes · cancela cuando quieras
          </p>
        </div>
      </section>

      <ul className="mt-5 space-y-2">
        {benefits.map((b) => (
          <li key={b.title} className="card-soft flex items-center gap-3 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream text-lg">
              {b.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.detail}</p>
            </div>
            <Check className="h-4 w-4 shrink-0 text-primary" />
          </li>
        ))}
      </ul>

      <section className="card-soft mt-5 p-4">
        <h2 className="text-base font-bold">Método de pago</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("apple")}
            aria-pressed={method === "apple"}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold ${
              method === "apple" ? "border-primary bg-muted" : "border-input"
            }`}
          >
            <Apple className="h-4 w-4" /> Apple Pay
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            aria-pressed={method === "card"}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold ${
              method === "card" ? "border-primary bg-muted" : "border-input"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Tarjeta
          </button>
        </div>

        {method === "card" && (
          <div className="mt-3 space-y-2">
            <input
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              placeholder="Nombre en la tarjeta"
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={card.exp}
                onChange={(e) => setCard({ ...card, exp: e.target.value })}
                placeholder="MM/AA"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                placeholder="CVC"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={activate}
          disabled={busy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft active:scale-95 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {method === "apple" ? "Suscribirme con Apple Pay" : "Suscribirme con tarjeta"}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Cobro mensual de US$7. Cancela en cualquier momento desde esta pantalla.
        </p>
      </section>

      <div className="mt-5">
        <WhatsAppSupport />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
