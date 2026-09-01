import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Chrome, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { CloudDecor } from "@/components/Decor";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { Button } from "@/components/ui/button";

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
  const [status, setStatus] = useState<string | null>(null);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/", replace: true });
  }, [session, navigate]);

  function friendlyAuthError(message: string) {
    const normalized = message.toLowerCase();
    if (normalized.includes("invalid login credentials")) {
      return "El correo o la contraseña no coinciden. Si creaste tu cuenta con Google, entra con Google; si no recuerdas tu contraseña, puedes restablecerla.";
    }
    if (normalized.includes("email not confirmed")) {
      return "Tu correo todavía no está confirmado. Revisa tu bandeja de entrada o restablece tu contraseña.";
    }
    if (normalized.includes("already registered")) {
      return "Ese correo ya tiene una cuenta. Cambia a “Iniciar sesión” o entra con Google.";
    }
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { mom_name: momName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setStatus("Tu cuenta fue creada. Revisa tu correo para confirmarla y luego inicia sesión.");
          toast.success("Cuenta creada. Revisa tu correo 💌");
          setMode("login");
          return;
        }
        toast.success("¡Bienvenida a LennAI! 💕");
        navigate({ to: "/", replace: true });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("No se pudo crear una sesión. Intenta de nuevo.");
        toast.success("Qué bueno verte de nuevo 🌸");
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      const message = friendlyAuthError(err instanceof Error ? err.message : "Algo no salió bien");
      setStatus(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Escribe tu correo primero");
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
    toast.success("Te enviamos un correo para crear una contraseña nueva 💌");
  }

  async function handleGoogle() {
    setBusy(true);
    setStatus("Abriendo Google de forma segura…");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        const message = friendlyAuthError(result.error.message);
        setStatus(message);
        toast.error(message);
        return;
      }
      if (result.redirected) return;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error ?? new Error("Google no pudo completar la sesión.");
      toast.success("¡Bienvenida a LennAI! 💕");
      navigate({ to: "/", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo entrar con Google";
      setStatus(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
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
            <Button
              type="submit"
              disabled={busy}
              className="mt-2 h-auto w-full rounded-2xl bg-primary-gradient px-4 py-3.5 font-bold shadow-soft active:scale-95"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Crear mi cuenta" : "Entrar"}
            </Button>
          </form>

          {status && (
            <p role="status" className="mt-3 rounded-2xl bg-muted px-3 py-2.5 text-center text-xs text-muted-foreground">
              {status}
            </p>
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={busy}
              className="mt-3 w-full text-center text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={busy}
            className="h-auto w-full rounded-2xl px-4 py-3 font-semibold active:scale-95"
          >
            {busy ? <Loader2 className="animate-spin" /> : <Chrome />}
            Continuar con Google
          </Button>
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
