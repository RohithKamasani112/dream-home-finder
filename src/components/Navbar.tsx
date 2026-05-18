import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon, Heart, LayoutGrid } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const links = [
  { to: "/buy", label: "Buy" },
  { to: "/rent", label: "Rent" },
  { to: "/explore", label: "Explore" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar({ floating = true }: { floating?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session, logout } = useSession();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        floating && !scrolled ? "bg-transparent" : "glass border-b border-border/60",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-display text-sm transition-transform group-hover:scale-105"
          >
            E
          </span>
          <span className="font-display text-xl tracking-tight">Estale</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-2 text-xs font-semibold text-primary md:inline-flex"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {session ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-muted-foreground">Hi, {session.name.split(" ")[0]}</span>
              <button
                onClick={logout}
                className="rounded-full border border-border px-3.5 py-2 text-xs font-semibold hover:bg-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-accent md:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 md:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="mx-4 mb-4 rounded-2xl border border-border bg-card p-3 shadow-pop animate-scale-in">
            <div className="grid">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent">
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              {session ? (
                <>
                  {session.role === "admin" && (
                    <Link to="/admin" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent">
                      Admin dashboard
                    </Link>
                  )}
                  <button onClick={logout} className="rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-accent">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent">
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="mt-1 rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function MobileBottomBar() {
  const tabs = [
    { to: "/", label: "Home", icon: LayoutGrid },
    { to: "/buy", label: "Buy", icon: LayoutGrid },
    { to: "/rent", label: "Rent", icon: LayoutGrid },
    { to: "/favorites", label: "Saved", icon: Heart },
    { to: "/login", label: "Account", icon: UserIcon },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
