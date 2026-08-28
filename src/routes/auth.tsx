import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { CloudDecor } from "@/components/Decor";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar a LennAI — Tu acompañante de maternidad" },
      {
        name: "description",
        content: "Crea tu cuenta LennAI o inicia sesión para seguir el día a día de tu bebé.",
      },
      { property: "og:title", content: "Entrar a LennAI" },
      {
        property: "og:description",
        content: "Regístrate en LennAI y recibe acompañamiento personalizado como mamá primeriza.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [momName, setMomName] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { mom_name: momName },
          },
        });
        if (error) throw error;
        toast.success("¡Bienvenida a LennAI! 💕");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Qué bueno verte de nuevo 🌸");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo no salió bien");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("No se pudo entrar con Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen bg-hero-gradient px-5 pb-10 pt-14">
      <CloudDecor />
      <div className="relative mx-auto w-full max-w-md">
        <div className="text-center">
          <div className="float-slow mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-card text-3xl shadow-float">
            🍼
          </div>
          <h1 className="mt-4 text-3xl font-extrabold">LennAI</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Acompañamiento cálido para mamás primerizas
          </p>
        </div>

        <div className="mt-7 rounded-3xl border border-border bg-card p-5 shadow-float">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "signup" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                mode === "login" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              Iniciar sesión
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Tu nombre</span>
                <input
                  value={momName}
                  onChange={(e) => setMomName(e.target.value)}
                  placeholder="Ana"
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Correo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mama@correo.com"
                className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Crear mi cuenta" : "Entrar"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-input bg-background px-4 py-3 text-sm font-semibold transition-transform active:scale-95 disabled:opacity-60"
          >
            Continuar con Google
          </button>
        </div>

        <div className="mt-5">
          <WhatsAppSupport />
        </div>
        <p className="mt-4 text-center text-xs text-foreground/60">
          LennAI ofrece orientación general y nunca sustituye a tu pediatra.
        </p>
      </div>
    </div>
  );
}
