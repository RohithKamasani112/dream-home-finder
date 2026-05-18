import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Search, ArrowRight, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Navbar, MobileBottomBar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { listProperties } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estale — Buy & rent premium homes" },
      {
        name: "description",
        content:
          "Discover, buy, and rent considered homes. A modern marketplace for luxury villas, apartments, plots, and commercial spaces.",
      },
      { property: "og:title", content: "Estale — Buy & rent premium homes" },
      { property: "og:description", content: "Discover, buy, and rent considered homes." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sell" | "rent">("sell");
  const [q, setQ] = useState({ location: "", type: "", budget: "", beds: "" });

  const all = listProperties();
  const featured = all.filter((p) => p.luxury).slice(0, 6);
  const apartments = all.filter((p) => p.type === "apartment").slice(0, 4);
  const villas = all.filter((p) => p.type === "villa").slice(0, 4);
  const commercials = all.filter((p) => p.type === "commercial").slice(0, 4);
  const recent = [...all].sort((a, b) => b.id - a.id).slice(0, 8);

  const search = () => {
    const path = mode === "sell" ? "/buy" : "/rent";
    const params = new URLSearchParams();
    if (q.location) params.set("q", q.location);
    if (q.type) params.set("type", q.type);
    if (q.budget) params.set("max", q.budget);
    if (q.beds) params.set("beds", q.beds);
    navigate({ to: path, search: Object.fromEntries(params) as never });
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar floating />

      {/* HERO */}
      <section className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Modern luxury villa with pool at golden hour"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-background" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3 w-3" /> Curated daily
            </span>
            <h1 className="mt-5 text-balance font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
              Find a home worth coming back to.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Browse verified villas, apartments and commercial spaces — to buy or to rent.
            </p>
          </div>

          {/* Search panel */}
          <div className="relative mt-10 animate-fade-up">
            <div className="overflow-hidden rounded-3xl bg-background shadow-pop">
              <div className="flex items-center gap-1 border-b border-border px-4 pt-4">
                {(["sell", "rent"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative rounded-t-xl px-5 py-2.5 text-sm font-semibold transition ${
                      mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "sell" ? "Buy" : "Rent"}
                    {mode === m && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary" />}
                  </button>
                ))}
              </div>

              <div className="grid gap-px bg-border md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                <Cell label="Location" icon={<MapPin className="h-4 w-4" />}>
                  <input
                    value={q.location}
                    onChange={(e) => setQ({ ...q, location: e.target.value })}
                    placeholder="City, neighborhood or area"
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </Cell>
                <Cell label="Property type">
                  <select
                    value={q.type}
                    onChange={(e) => setQ({ ...q, type: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </Cell>
                <Cell label={mode === "sell" ? "Max price" : "Max rent"}>
                  <select
                    value={q.budget}
                    onChange={(e) => setQ({ ...q, budget: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  >
                    <option value="">Any</option>
                    {(mode === "sell"
                      ? [500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000]
                      : [2000, 5000, 10000, 25000]
                    ).map((v) => (
                      <option key={v} value={v}>
                        {mode === "sell"
                          ? `$${(v / 1_000_000).toFixed(v % 1_000_000 ? 2 : 0)}M`
                          : `$${v.toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                </Cell>
                <Cell label="Bedrooms">
                  <select
                    value={q.beds}
                    onChange={(e) => setQ({ ...q, beds: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((b) => (
                      <option key={b} value={b}>
                        {b}+ beds
                      </option>
                    ))}
                  </select>
                </Cell>
                <div className="bg-background p-2">
                  <button
                    onClick={search}
                    className="inline-flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
                  >
                    <Search className="h-4 w-4" /> Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING LOCATIONS */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead title="Trending locations" subtitle="Where buyers and renters are searching this week" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "New York", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80" },
            { name: "Los Angeles", img: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80" },
            { name: "Miami", img: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&q=80" },
            { name: "Dubai", img: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80" },
            { name: "London", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80" },
            { name: "Tuscany", img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&q=80" },
          ].map((c) => (
            <Link
              key={c.name}
              to="/buy"
              search={{ q: c.name } as never}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
            >
              <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-sm font-semibold">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <Strip title="Featured properties" subtitle="Hand-picked homes that set the bar" items={featured} link="/buy" />
      <Strip title="Apartments" subtitle="Considered city living" items={apartments} link="/buy?type=apartment" />
      <Strip title="Villas" subtitle="Space to breathe" items={villas} link="/buy?type=villa" />
      <Strip title="Commercial spaces" subtitle="Where good work happens" items={commercials} link="/rent?type=commercial" />
      <Strip title="Recently added" subtitle="Fresh on the market" items={recent} link="/explore" />

      {/* TESTIMONIALS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead title="Loved by people who care about their space" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { q: "Found a villa I didn't think existed. The whole experience felt premium.", a: "Maya, Los Angeles" },
            { q: "Filtering was so quick. Two evenings and I had three viewings booked.", a: "Daniel, NYC" },
            { q: "Verified listings made me trust what I was reading. Rare these days.", a: "Priya, London" },
          ].map((t) => (
            <figure key={t.a} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <blockquote className="font-display text-xl leading-snug text-balance">“{t.q}”</blockquote>
              <figcaption className="mt-5 text-sm text-muted-foreground">— {t.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-primary-foreground sm:px-16">
          <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Have a property to list? We'll make it look brilliant.
          </h2>
          <p className="mt-3 max-w-xl text-primary-foreground/80">
            Post in minutes, reach serious buyers and renters, and convert with built-in lead capture.
          </p>
          <Link
            to="/admin"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-soft"
          >
            List your property <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}

function Cell({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 bg-background px-5 py-3">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}

function SectionHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Strip({
  title,
  subtitle,
  items,
  link,
}: {
  title: string;
  subtitle?: string;
  items: ReturnType<typeof listProperties>;
  link: string;
}) {
  if (!items.length) return null;
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHead
        title={title}
        subtitle={subtitle}
        action={
          <Link to={link as never} className="text-sm font-semibold text-primary hover:underline">
            See all →
          </Link>
        }
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
