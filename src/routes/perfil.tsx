import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookHeart, CalendarClock, Crown, HeartHandshake, KeyRound, Loader2, LogOut } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { getBabyAge } from "@/lib/baby";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tu perfil y datos del bebé — LennAI" },
      {
        name: "description",
        content: "Actualiza los datos de tu bebé, tu suscripción y accede al soporte de LennAI.",
      },
      { property: "og:title", content: "Tu perfil — LennAI" },
      {
        property: "og:description",
        content: "Gestiona tus datos, tu plan y tus preferencias en LennAI.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Perfil />
    </AppShell>
  ),
});

const feedingOptions = [
  { id: "pecho", label: "Pecho" },
  { id: "formula", label: "Fórmula" },
  { id: "mixta", label: "Mixta" },
  { id: "solidos", label: "Sólidos" },
];

function Perfil() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState({ momName: "", babyName: "", birthDate: "", feeding: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        momName: profile.mom_name ?? "",
        babyName: profile.baby_name ?? "",
        birthDate: profile.baby_birth_date ?? "",
        feeding: profile.feeding_type ?? "",
      });
    }
  }, [profile]);

  const age = getBabyAge(profile?.baby_birth_date);

  async function save() {
    try {
      await update.mutateAsync({
        mom_name: form.momName,
        baby_name: form.babyName,
        baby_birth_date: form.birthDate || null,
        feeding_type: form.feeding || null,
      });
      toast.success("Datos actualizados 🌸");
    } catch {
      toast.error("No pudimos guardar los cambios");
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Perfil" title={form.momName || "Tu perfil"} subtitle={user?.email ?? ""} />

      <section className="card-soft flex items-center gap-3 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose text-xl">
          🍼
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{form.babyName || "Tu bebé"}</p>
          <p className="text-xs text-muted-foreground">{age ? age.label : "Sin fecha de nacimiento"}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            profile?.is_premium ? "bg-premium-gradient text-premium-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {profile?.is_premium ? "Premium" : "Gratis"}
        </span>
      </section>

      <section className="card-soft mt-4 p-4">
        <h2 className="text-base font-bold">Datos del bebé</h2>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-muted-foreground">Tu nombre</span>
          <input
            value={form.momName}
            onChange={(e) => setForm({ ...form, momName: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-muted-foreground">Nombre del bebé</span>
          <input
            value={form.babyName}
            onChange={(e) => setForm({ ...form, babyName: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-muted-foreground">Fecha de nacimiento</span>
          <input
            type="date"
            value={form.birthDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div className="mt-3">
          <span className="text-xs font-semibold text-muted-foreground">Alimentación</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {feedingOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setForm({ ...form, feeding: o.id })}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold ${
                  form.feeding === o.id ? "border-primary bg-sky text-sky-foreground" : "border-input"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="mt-4 w-full rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft active:scale-95 disabled:opacity-60"
        >
          Guardar cambios
        </button>
      </section>

      <section className="mt-4 space-y-2">
        <NavRow to="/premium" icon={<Crown className="h-4 w-4" />} label="Suscripción Premium" hint="Gestiona tu plan y pago" />
        <NavRow to="/rutinas" icon={<CalendarClock className="h-4 w-4" />} label="Rutinas diarias" hint="Generador por edad" />
        <NavRow to="/recuerdos" icon={<BookHeart className="h-4 w-4" />} label="Diario de recuerdos" hint="Tus momentos guardados" />
        <NavRow to="/para-mama" icon={<HeartHandshake className="h-4 w-4" />} label="Para mamá" hint="Motivación y check-in" />
        <ResetPasswordRow email={user?.email ?? ""} />
      </section>

      <div className="mt-4">
        <WhatsAppSupport />
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          navigate({ to: "/auth" });
        }}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-input px-4 py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );
}

function ResetPasswordRow({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (next.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: next,
      current_password: current,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Contraseña actualizada 💕");
    setTimeout(() => {
      setOpen(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(false);
    }, 1500);
  }

  async function sendResetEmail() {
    if (!email) {
      toast.error("No hay un correo asociado a esta sesión");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Te enviamos un correo para restablecer tu contraseña 💌");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card-soft flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky text-sky-foreground">
          <KeyRound className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">Cambiar contraseña</span>
          <span className="block text-xs text-muted-foreground">Actualízala desde tu cuenta</span>
        </span>
        <span className="shrink-0 text-muted-foreground">›</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-float">
            <h3 className="text-lg font-bold">Cambiar contraseña</h3>
            <p className="text-xs text-muted-foreground">Escribe tu contraseña actual y la nueva.</p>

            {done ? (
              <div className="mt-4 rounded-2xl bg-muted p-4 text-center text-sm font-medium text-foreground">
                ¡Listo! Tu contraseña fue actualizada.
              </div>
            ) : (
              <form onSubmit={changePassword} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Contraseña actual</span>
                  <input
                    type="password"
                    required
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Nueva contraseña</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Confirmar nueva contraseña</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full rounded-2xl bg-primary-gradient px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-60"
                >
                  {busy && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}
                  Actualizar contraseña
                </button>
              </form>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={sendResetEmail}
                disabled={busy}
                className="text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
              >
                ¿Olvidaste tu contraseña actual? Envíame un correo de recuperación
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-muted-foreground"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavRow({
  to,
  icon,
  label,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link to={to} className="card-soft flex items-center gap-3 p-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lavender text-lavender-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span className="shrink-0 text-muted-foreground">›</span>
    </Link>
  );
}
