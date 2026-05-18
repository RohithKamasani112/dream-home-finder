import { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal,
  Building2,
  Home as HomeIcon,
  Trees,
  Briefcase,
  Sofa,
  KeyRound,
  Sparkles,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { type Filters, activeFilterCount } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { fullMoney } from "@/lib/store";

const QUICK = [
  { id: "apartment", label: "Apartments", icon: Building2, kind: "type" as const },
  { id: "villa", label: "Villas", icon: HomeIcon, kind: "type" as const },
  { id: "plot", label: "Plots", icon: Trees, kind: "type" as const },
  { id: "commercial", label: "Commercial", icon: Briefcase, kind: "type" as const },
  { id: "furnished", label: "Furnished", icon: Sofa, kind: "quick" as const },
  { id: "readyToMove", label: "Ready to move", icon: KeyRound, kind: "quick" as const },
  { id: "newlyAdded", label: "Newly added", icon: Sparkles, kind: "quick" as const },
  { id: "luxury", label: "Luxury", icon: Sparkles, kind: "quick" as const },
  { id: "verified", label: "Verified", icon: BadgeCheck, kind: "quick" as const },
  { id: "petFriendly", label: "Pet friendly", icon: HomeIcon, kind: "quick" as const },
];

export function FilterBar({
  filters,
  onChange,
  onOpenAdvanced,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onOpenAdvanced: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState({ l: false, r: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setShowArrows({
        l: el.scrollLeft > 4,
        r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: -1 | 1) =>
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const toggle = (item: (typeof QUICK)[number]) => {
    if (item.kind === "type") {
      const set = new Set(filters.types);
      set.has(item.id as never) ? set.delete(item.id as never) : set.add(item.id as never);
      onChange({ ...filters, types: [...set] as Filters["types"] });
    } else {
      const set = new Set(filters.quick);
      set.has(item.id) ? set.delete(item.id) : set.add(item.id);
      onChange({ ...filters, quick: [...set] });
    }
  };

  const active = (item: (typeof QUICK)[number]) =>
    item.kind === "type" ? filters.types.includes(item.id as never) : filters.quick.includes(item.id);

  const count = activeFilterCount(filters);

  return (
    <div className="sticky top-16 z-30 border-b border-border/70 glass">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* listing toggle */}
        <div className="flex shrink-0 rounded-full border border-border bg-card p-1 shadow-soft">
          {(["all", "sell", "rent"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, listing: opt })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                filters.listing === opt
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt === "all" ? "All" : opt === "sell" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>

        {/* scroll quick filters */}
        <div className="relative min-w-0 flex-1">
          {showArrows.l && (
            <button
              aria-label="Scroll left"
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background shadow-soft md:grid h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div
            ref={scrollRef}
            className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth"
          >
            {QUICK.map((item) => {
              const Icon = item.icon;
              const on = active(item);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item)}
                  className={cn(
                    "group inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition",
                    on
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 opacity-80" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {showArrows.r && (
            <button
              aria-label="Scroll right"
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background shadow-soft md:grid h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* advanced */}
        <button
          onClick={onOpenAdvanced}
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold shadow-soft transition hover:border-foreground/40"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ----------------------- Advanced filter modal ----------------------- */

const ALL_AMENITIES = [
  "Pool", "Gym", "Spa", "Concierge", "Smart Home", "EV Charging",
  "Garden", "Roof Deck", "Wine Cellar", "Home Theatre", "Parking",
  "Gated Community", "Tennis Court", "Sauna",
];
const FACINGS = ["any", "North", "South", "East", "West"];

export function AdvancedFilterModal({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);
  useEffect(() => setDraft(filters), [filters, open]);

  if (!open) return null;

  const setMaxPrice = (v: number) => setDraft({ ...draft, maxPrice: v });
  const toggleAmenity = (a: string) => {
    const set = new Set(draft.amenities);
    set.has(a) ? set.delete(a) : set.add(a);
    setDraft({ ...draft, amenities: [...set] });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 animate-fade-in">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-background shadow-pop animate-scale-in">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl">Filters</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-7 overflow-y-auto px-6 py-6">
          <Section title="Budget">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Up to</span>
              <span className="font-semibold">{fullMoney(draft.maxPrice ?? 10_000_000)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={10_000_000}
              step={50000}
              value={draft.maxPrice ?? 10_000_000}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[color:var(--color-primary)]"
            />
          </Section>

          <Section title="Bedrooms">
            <Pills
              values={[1, 2, 3, 4, 5]}
              active={draft.beds}
              onSelect={(v) => setDraft({ ...draft, beds: draft.beds === v ? undefined : v })}
              suffix="+"
            />
          </Section>

          <Section title="Bathrooms">
            <Pills
              values={[1, 2, 3, 4]}
              active={draft.baths}
              onSelect={(v) => setDraft({ ...draft, baths: draft.baths === v ? undefined : v })}
              suffix="+"
            />
          </Section>

          <Section title="Parking">
            <Pills
              values={[1, 2, 3, 4]}
              active={draft.parking}
              onSelect={(v) => setDraft({ ...draft, parking: draft.parking === v ? undefined : v })}
              suffix="+"
            />
          </Section>

          <Section title="Property size (sqft, min)">
            <Pills
              values={[500, 1000, 2000, 3000, 5000]}
              active={draft.minArea}
              onSelect={(v) => setDraft({ ...draft, minArea: draft.minArea === v ? undefined : v })}
              suffix=""
              format={(v) => v.toLocaleString()}
            />
          </Section>

          <Section title="Facing direction">
            <div className="flex flex-wrap gap-2">
              {FACINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => setDraft({ ...draft, facing: f })}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-medium capitalize",
                    (draft.facing ?? "any") === f
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Furnishing">
            <div className="flex flex-wrap gap-2">
              {(["any", "furnished", "semi", "unfurnished"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDraft({ ...draft, furnishing: f })}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-medium capitalize",
                    (draft.furnishing ?? "any") === f
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Amenities">
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((a) => {
                const on = draft.amenities.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                      on
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Sort">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["recent", "Most recent"],
                  ["priceAsc", "Price: low to high"],
                  ["priceDesc", "Price: high to low"],
                  ["viewed", "Most viewed"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setDraft({ ...draft, sort: id })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                    draft.sort === id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            onClick={() => setDraft({ ...filters, listing: "all", types: [], quick: [], amenities: [], sort: "recent" })}
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Pills<T extends number>({
  values,
  active,
  onSelect,
  suffix,
  format,
}: {
  values: T[];
  active?: T;
  onSelect: (v: T) => void;
  suffix: string;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className={cn(
            "min-w-12 rounded-full border px-3.5 py-1.5 text-xs font-medium",
            active === v
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground/40",
          )}
        >
          {format ? format(v) : v}
          {suffix}
        </button>
      ))}
    </div>
  );
}
