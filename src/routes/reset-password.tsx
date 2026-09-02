import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CloudDecor } from "@/components/Decor";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — LennAI" },
      {
        name: "description",
        content: "Crea una contraseña nueva para volver a entrar a tu cuenta LennAI.",
      },
      { property: "og:title", content: "Nueva contraseña — LennAI" },
      {
        property: "og:description",
        content: "Restablece tu contraseña de LennAI y sigue acompañando el día a día de tu bebé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function hasRecoveryHash() {
  if (typeof window === "undefined") return false;
  return window.location.hash.includes("type=recovery");
}


function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Contraseña actualizada 💕");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-hero-gradient px-5 pb-10 pt-16">
      <CloudDecor />
      <div className="relative mx-auto w-full max-w-md">
        <h1 className="text-center text-2xl font-extrabold">Nueva contraseña</h1>
        <p className="mt-1 text-center text-sm text-foreground/70">
          Escribe tu nueva contraseña para entrar a LennAI.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-float"
        >
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
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
