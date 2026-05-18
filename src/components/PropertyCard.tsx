import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, BedDouble, Bath, Maximize2, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { type Property, money, getFavorites, toggleFavorite } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(getFavorites().includes(property.id));
    sync();
    window.addEventListener("estate:favorites", sync);
    return () => window.removeEventListener("estate:favorites", sync);
  }, [property.id]);

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setIdx((i) => (i + 1) % property.images.length);
  };
  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setIdx((i) => (i - 1 + property.images.length) % property.images.length);
  };

  const priceLabel =
    property.listing === "rent"
      ? `${money(property.rent, property.currency)}/mo`
      : money(property.price, property.currency);

  return (
    <Link
      to="/properties/$id"
      params={{ id: String(property.id) }}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] shadow-soft">
        <img
          src={property.images[idx]}
          alt={property.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* gradient for chips */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-primary">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {property.luxury && (
            <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold text-background">
              Luxury
            </span>
          )}
          {property.newlyAdded && (
            <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-semibold text-foreground">
              New
            </span>
          )}
        </div>

        {/* fav */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(property.id);
          }}
          aria-label="Save"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4 transition", fav ? "fill-destructive stroke-destructive" : "stroke-foreground")} />
        </button>

        {/* carousel arrows */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 opacity-0 shadow-soft transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 opacity-0 shadow-soft transition group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
              {property.images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{property.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{property.address}</p>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold text-foreground">{priceLabel}</p>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Spec icon={<BedDouble className="h-3.5 w-3.5" />} value={property.beds || "—"} label="bd" />
          <Spec icon={<Bath className="h-3.5 w-3.5" />} value={property.baths || "—"} label="ba" />
          <Spec icon={<Maximize2 className="h-3.5 w-3.5" />} value={property.area.toLocaleString()} label="sqft" />
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      <span className="font-medium text-foreground">{value}</span> {label}
    </span>
  );
}
