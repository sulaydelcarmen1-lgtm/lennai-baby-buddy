import { Link } from "@tanstack/react-router";
import { Crown, Lock } from "lucide-react";

/** Tarjeta de función bloqueada que invita a mejorar a Premium. */
export function PremiumLock({
  title,
  description,
  cta = "Desbloquear con Premium",
}: {
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-premium/40 bg-premium-gradient p-5 shadow-soft">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-card/40 blur-xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2 text-premium-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Premium</span>
        </div>
        <h3 className="mt-2 text-lg font-bold text-premium-foreground">{title}</h3>
        <p className="mt-1 text-sm text-premium-foreground/80">{description}</p>
        <Link
          to="/premium"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-transform active:scale-95"
        >
          <Crown className="h-4 w-4 text-premium-foreground" />
          {cta}
        </Link>
      </div>
    </div>
  );
}
