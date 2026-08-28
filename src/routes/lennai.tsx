import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, Sparkles } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PremiumLock } from "@/components/PremiumLock";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { askLennAiFn } from "@/lib/lennai.functions";

export const Route = createFileRoute("/lennai")({
  head: () => ({
    meta: [
      { title: "Asistente LennAI — Preguntas de maternidad" },
      {
        name: "description",
        content:
          "Pregunta lo que necesites sobre sueño, lactancia y cuidados. LennAI responde con tus datos registrados.",
      },
      { property: "og:title", content: "Asistente LennAI" },
      {
        property: "og:description",
        content: "Una asistente cálida con recomendaciones personalizadas para tu bebé.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Chat />
    </AppShell>
  ),
});

const suggestions = [
  "¿Cómo alargo las siestas de mi bebé?",
  "¿Cuántas tomas necesita a su edad?",
  "Mi bebé llora al atardecer, ¿qué hago?",
  "¿Cómo empiezo la alimentación complementaria?",
];

type Msg = { role: string; content: string; id?: string };

function Chat() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [input, setInput] = useState("");
  const [local, setLocal] = useState<Msg[]>([]);
  const [limited, setLimited] = useState(false);
  const [used, setUsed] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askLennAiFn);

  const { data: history = [] } = useQuery({
    queryKey: ["ai_messages", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Msg[]> => {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("id, role, content")
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Msg[];
    },
  });

  const messages = [...history, ...local];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const mutation = useMutation({
    mutationFn: (question: string) => ask({ data: { question } }),
    onSuccess: (res) => {
      setUsed(res.used);
      setLimited(res.limited);
      setLocal((m) => [...m, { role: "assistant", content: res.answer }]);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "LennAI no pudo responder ahora"),
  });

  function send(question: string) {
    const q = question.trim();
    if (!q || mutation.isPending) return;
    setLocal((m) => [...m, { role: "user", content: q }]);
    setInput("");
    mutation.mutate(q);
  }

  const isPremium = Boolean(profile?.is_premium);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        eyebrow="Asistente"
        title="LennAI"
        subtitle={
          isPremium
            ? "Conversaciones ilimitadas ✨"
            : `Plan gratuito · ${Math.max(0, 5 - used)} preguntas restantes hoy`
        }
      />

      {messages.length === 0 && (
        <div className="card-soft p-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Empecemos</span>
          </div>
          <p className="mt-2 text-sm">
            Conozco la edad de {profile?.baby_name ?? "tu bebé"} y tus registros, así que puedo darte
            respuestas hechas a tu medida.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full bg-lavender px-3 py-2 text-xs font-semibold text-lavender-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-3">
        {messages.map((m, i) => (
          <div
            key={m.id ?? `local-${i}`}
            className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-soft ${
              m.role === "user"
                ? "ml-auto bg-primary-gradient text-primary-foreground"
                : "bg-card text-card-foreground"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex items-center gap-2 rounded-3xl bg-card px-4 py-3 text-sm shadow-soft">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> LennAI está pensando…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {limited && !isPremium && (
        <div className="mt-4">
          <PremiumLock
            title="IA ilimitada con Premium"
            description="Pregunta a LennAI todas las veces que necesites, día y noche."
          />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-24 mt-4 flex items-center gap-2 rounded-3xl border border-border bg-card p-2 shadow-float"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          aria-label="Pregunta para LennAI"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          aria-label="Enviar pregunta"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground active:scale-95 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-3">
        <WhatsAppSupport />
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        LennAI da orientación general y no sustituye a tu pediatra.
      </p>
    </div>
  );
}
