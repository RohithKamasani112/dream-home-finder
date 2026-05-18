// Shared listings page used by /buy, /rent, /explore, /favorites.
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar, MobileBottomBar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FilterBar, AdvancedFilterModal } from "@/components/FilterBar";
import { PropertyCard } from "@/components/PropertyCard";
import { applyFilters, DEFAULT_FILTERS, type Filters } from "@/lib/filters";
import { listProperties, getFavorites } from "@/lib/store";
import { SlidersHorizontal } from "lucide-react";

export interface ListingsPageProps {
  preset?: Partial<Filters>;
  title: string;
  subtitle?: string;
  favoritesOnly?: boolean;
  initialQuery?: Record<string, string>;
}

export function ListingsPage({ preset, title, subtitle, favoritesOnly, initialQuery }: ListingsPageProps) {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    ...preset,
    ...(initialQuery?.q ? { q: initialQuery.q } : {}),
    ...(initialQuery?.type ? { types: [initialQuery.type as Filters["types"][number]] } : {}),
    ...(initialQuery?.max ? { maxPrice: Number(initialQuery.max) } : {}),
    ...(initialQuery?.beds ? { beds: Number(initialQuery.beds) } : {}),
  }));
  const [open, setOpen] = useState(false);
  const [favs, setFavs] = useState<number[]>(() => getFavorites());

  useEffect(() => {
    const sync = () => setFavs(getFavorites());
    window.addEventListener("estate:favorites", sync);
    return () => window.removeEventListener("estate:favorites", sync);
  }, []);

  const items = useMemo(() => {
    let base = listProperties();
    if (favoritesOnly) base = base.filter((p) => favs.includes(p.id));
    return applyFilters(base, filters);
  }, [filters, favs, favoritesOnly]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar floating={false} />
      <FilterBar filters={filters} onChange={setFilters} onOpenAdvanced={() => setOpen(true)} />
      <AdvancedFilterModal open={open} filters={filters} onClose={() => setOpen(false)} onApply={setFilters} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle ?? `${items.length} ${items.length === 1 ? "home" : "homes"} match your filters`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={filters.q ?? ""}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search by city or title"
              className="hidden rounded-full border border-border bg-card px-4 py-2 text-xs font-medium md:block w-64 focus:border-foreground focus:outline-none"
            />
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState onReset={() => setFilters({ ...DEFAULT_FILTERS, ...preset })} />
        ) : (
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % 8) * 40}ms` }}>
                <PropertyCard property={p} priority={i < 4} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile floating filter button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold text-background shadow-pop md:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
      </button>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-20 grid place-items-center text-center">
      <div className="max-w-md">
        <h3 className="font-display text-2xl">No homes match these filters</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try widening your search — relax the price, drop a few amenities, or broaden the location.
        </p>
        <button
          onClick={onReset}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Reset filters
        </button>
        <p className="mt-6 text-xs text-muted-foreground">
          Or <Link to="/contact" className="underline">talk to a specialist</Link>.
        </p>
      </div>
    </div>
  );
}
