import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AlertCircle, Baby, BookHeart, Home, Sparkles, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/seguimiento", label: "Seguimiento", icon: Baby },
  { to: "/lennai", label: "LennAI", icon: Sparkles },
  { to: "/contenido", label: "Contenido", icon: BookHeart },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              aria-label={label}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition-colors",
                      isActive ? "bg-primary-gradient text-primary-foreground shadow-soft" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="truncate">{label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Envoltorio de páginas privadas: exige sesión y onboarding completo. */
export function AppShell({
  children,
  requireOnboarding = true,
}: {
  children: ReactNode;
  requireOnboarding?: boolean;
}) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isPending, isError, refetch } = useProfile();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (requireOnboarding && profile && !profile.onboarded) navigate({ to: "/onboarding" });
  }, [profile, requireOnboarding, navigate]);

  if (loading || (session && isPending)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="float-slow text-4xl">🍼</div>
          <p className="mt-3 text-sm text-muted-foreground">Cargando LennAI…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h1 className="mt-3 text-xl font-bold">No pudimos cargar tu espacio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu sesión está activa. Intenta cargar tus datos nuevamente.
          </p>
          <Button className="mt-4 rounded-2xl" onClick={() => void refetch()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
