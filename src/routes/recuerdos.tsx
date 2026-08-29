import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useAddMemory, useMemories } from "@/hooks/useProfile";

export const Route = createFileRoute("/recuerdos")({
  head: () => ({
    meta: [
      { title: "Diario de recuerdos — LennAI" },
      {
        name: "description",
        content: "Guarda los momentos especiales de tu bebé en tu diario privado de recuerdos.",
      },
      { property: "og:title", content: "Diario de recuerdos — LennAI" },
      {
        property: "og:description",
        content: "Un lugar cálido para escribir los momentos que no quieres olvidar.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Recuerdos />
    </AppShell>
  ),
});

function Recuerdos() {
  const { data: memories = [] } = useMemories();
  const addMemory = useAddMemory();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  async function save() {
    if (!title.trim()) return;
    try {
      await addMemory.mutateAsync({ title, body, happened_on: date });
      toast.success("Recuerdo guardado 💗");
      setTitle("");
      setBody("");
      setOpen(false);
    } catch {
      toast.error("No pudimos guardar el recuerdo");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Diario"
        title="Recuerdos"
        subtitle="Los momentos que quieres guardar para siempre."
      />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft active:scale-95"
      >
        <Plus className="h-4 w-4" /> Nuevo recuerdo
      </button>

      {open && (
        <div className="card-soft mb-4 p-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Su primera sonrisa"
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">¿Qué pasó?</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Estábamos en la cama y me miró…"
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={addMemory.isPending}
            className="mt-4 w-full rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-rose-foreground active:scale-95 disabled:opacity-60"
          >
            Guardar recuerdo
          </button>
        </div>
      )}

      {memories.length === 0 ? (
        <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Tu diario está esperando su primera página ✨
        </p>
      ) : (
        <ul className="space-y-3">
          {memories.map((m: { id: string; title: string; body: string | null; happened_on: string }) => (
            <li key={m.id} className="card-soft p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {new Date(m.happened_on + "T00:00:00").toLocaleDateString("es-DO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h2 className="mt-1 text-base font-bold">{m.title}</h2>
              {m.body && <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
