import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/baby";
import { cn } from "@/lib/utils";

/** Botón de soporte: abre WhatsApp con el número de atención de LennAI. */
export function WhatsAppSupport({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "floating";
  className?: string;
}) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Soporte por WhatsApp al +1 820-990-3366"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-mint px-4 py-3 text-sm font-semibold text-mint-foreground shadow-soft transition-transform active:scale-95",
        variant === "floating" && "fixed bottom-24 right-4 z-40 h-14 w-14 p-0",
        variant === "inline" && "w-full",
        className,
      )}
    >
      <MessageCircle className="h-5 w-5 shrink-0" />
      {variant === "inline" && <span>Soporte por WhatsApp</span>}
    </a>
  );
}
