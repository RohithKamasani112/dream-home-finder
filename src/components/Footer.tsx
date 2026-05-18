import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-display text-sm">
              E
            </span>
            <span className="font-display text-xl">Estale</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A modern marketplace for luxury homes, considered rentals, and grounded
            commercial spaces.
          </p>
        </div>

        <FooterCol
          title="Discover"
          items={[
            { to: "/buy", label: "Buy a home" },
            { to: "/rent", label: "Rent a home" },
            { to: "/explore", label: "Explore cities" },
            { to: "/buy?type=villa", label: "Luxury villas" },
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            { to: "/contact", label: "Contact" },
            { to: "/about", label: "About us" },
            { to: "/admin", label: "List a property" },
          ]}
        />
        <FooterCol
          title="Legal"
          items={[
            { to: "/terms", label: "Terms" },
            { to: "/privacy", label: "Privacy" },
            { to: "/cookies", label: "Cookies" },
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Estale. All rights reserved.</span>
          <span>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold tracking-wide text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              to={i.to as never}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
