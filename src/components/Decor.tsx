import { cn } from "@/lib/utils";

/** Nubes, estrellas y globos decorativos: solo estética, sin interacción. */
export function CloudDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg className="float-slow absolute -left-6 top-6 h-12 w-24 opacity-70" viewBox="0 0 100 50">
        <path
          d="M20 40c-10 0-16-6-16-13s7-13 15-12c3-8 11-13 19-13 11 0 19 7 21 16 9 0 15 5 15 11s-6 11-15 11z"
          fill="var(--color-card)"
        />
      </svg>
      <svg className="float-slower absolute right-4 top-2 h-9 w-20 opacity-60" viewBox="0 0 100 50">
        <path
          d="M20 40c-10 0-16-6-16-13s7-13 15-12c3-8 11-13 19-13 11 0 19 7 21 16 9 0 15 5 15 11s-6 11-15 11z"
          fill="var(--color-card)"
        />
      </svg>
      <span className="float-slow absolute right-10 top-20 text-lg">⭐</span>
      <span className="float-slower absolute left-1/3 top-3 text-sm">✨</span>
      <span className="float-slow absolute right-1/4 bottom-4 text-base">🎀</span>
    </div>
  );
}

export function StarsRow() {
  return (
    <div className="flex items-center gap-1 text-xs" aria-hidden>
      <span>✨</span>
      <span className="text-muted-foreground">·</span>
      <span>⭐</span>
      <span className="text-muted-foreground">·</span>
      <span>☁️</span>
    </div>
  );
}
