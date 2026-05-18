import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  BedDouble, Bath, Maximize2, Car, Compass, BadgeCheck, Heart, MapPin,
  Download, MessageSquare, CalendarDays, Phone, Play, ChevronLeft,
} from "lucide-react";
import { Navbar, MobileBottomBar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { LeadModal } from "@/components/LeadModal";
import { getProperty, listProperties, fullMoney, money, toggleFavorite, getFavorites, type Property } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/properties/$id")({
  loader: ({ params }): Property => {
    const p = getProperty(Number(params.id));
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Estale` : "Property — Estale" },
      { name: "description", content: loaderData?.description?.slice(0, 160) },
      { property: "og:title", content: loaderData?.title },
      { property: "og:image", content: loaderData?.images?.[0] },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="font-display text-3xl">Property not found</h1>
        <Link to="/explore" className="mt-4 inline-block text-primary underline">Browse all properties</Link>
      </div>
    </div>
  ),
  component: Page,
});

function Page() {
  const p = Route.useLoaderData() as Property;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lead, setLead] = useState<{ open: boolean; intent: "brochure" | "info" | "visit" | "contact"; title: string }>(
    { open: false, intent: "info", title: "" },
  );
  const [fav, setFav] = useState(getFavorites().includes(p.id));

  const similar = listProperties().filter((x) => x.id !== p.id && x.type === p.type).slice(0, 4);

  const openLead = (intent: typeof lead.intent, title: string) => setLead({ open: true, intent, title });

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar floating={false} />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to listings
        </Link>

        {/* Header */}
        <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {p.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold capitalize text-foreground">
                For {p.listing === "sell" ? "Sale" : "Rent"}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold capitalize text-foreground">
                {p.type}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">{p.title}</h1>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {p.address}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { toggleFavorite(p.id); setFav(!fav); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
            >
              <Heart className={cn("h-3.5 w-3.5", fav && "fill-destructive stroke-destructive")} />
              {fav ? "Saved" : "Save"}
            </button>
          </div>
        </header>

        {/* Gallery */}
        <section className="mt-6 grid grid-cols-4 gap-2 overflow-hidden rounded-3xl">
          <button onClick={() => setLightbox(true)} className="relative col-span-4 aspect-[16/9] sm:col-span-2 sm:row-span-2">
            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition hover:opacity-95" />
          </button>
          {p.images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => { setActive(i + 1); setLightbox(true); }}
              className="relative hidden aspect-[4/3] sm:block"
            >
              <img src={img} alt="" className="h-full w-full object-cover transition hover:opacity-95" />
              {i === 3 && p.images.length > 5 && (
                <div className="absolute inset-0 grid place-items-center bg-foreground/60 text-sm font-semibold text-background">
                  +{p.images.length - 5} more
                </div>
              )}
            </button>
          ))}
        </section>

        {/* Body */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Spec icon={<BedDouble />} label="Bedrooms" value={p.beds || "—"} />
              <Spec icon={<Bath />} label="Bathrooms" value={p.baths || "—"} />
              <Spec icon={<Maximize2 />} label="Area" value={`${p.area.toLocaleString()} sqft`} />
              <Spec icon={<Car />} label="Parking" value={p.parking ?? "—"} />
            </div>

            <Block title="About this property">
              <p className="text-[15px] leading-relaxed text-muted-foreground">{p.description}</p>
            </Block>

            <Block title="Amenities">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-primary">•</span>
                    {a}
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Property details">
              <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
                <DT label="Facing" value={p.facing ?? "—"} icon={<Compass className="h-3.5 w-3.5" />} />
                <DT label="Age" value={`${p.age ?? 0} yrs`} />
                <DT label="Furnishing" value={p.furnished ? "Furnished" : "Unfurnished"} />
                <DT label="Type" value={p.type} />
                <DT label="Verified" value={p.verified ? "Yes" : "No"} />
                {p.listing === "rent" && p.leaseMonths && <DT label="Lease" value={`${p.leaseMonths} months`} />}
              </dl>
            </Block>

            {p.youtubeId && (
              <Block title="Watch property tour">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${p.youtubeId}`}
                    title="Property tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${p.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  <Play className="h-3.5 w-3.5" /> Open on YouTube
                </a>
              </Block>
            )}

            <Block title="Nearby">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Schools", "Hospitals", "Cafés", "Transit"].map((t) => (
                  <div key={t} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{t}</p>
                    <p className="mt-1 text-lg font-semibold">{Math.round(2 + Math.random() * 8)} nearby</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
                <iframe
                  title="Map"
                  className="h-full w-full"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik&marker=0,0`}
                />
              </div>
            </Block>
          </div>

          {/* Sticky CTA */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {p.listing === "sell" ? "Asking price" : "Monthly rent"}
              </p>
              <p className="mt-1 font-display text-4xl">
                {p.listing === "sell" ? fullMoney(p.price, p.currency) : `${fullMoney(p.rent, p.currency)}`}
                {p.listing === "rent" && <span className="ml-1 text-sm text-muted-foreground">/mo</span>}
              </p>
              {p.listing === "rent" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Deposit {money(p.deposit, p.currency)} · {p.leaseMonths} mo lease
                </p>
              )}

              <div className="mt-5 grid gap-2">
                <button
                  onClick={() => openLead("contact", "Contact owner")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                >
                  <Phone className="h-4 w-4" /> Contact owner
                </button>
                <button
                  onClick={() => openLead("visit", "Schedule a visit")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-accent"
                >
                  <CalendarDays className="h-4 w-4" /> Schedule visit
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openLead("brochure", "Download brochure")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" /> Brochure
                  </button>
                  <button
                    onClick={() => openLead("info", "Get more information")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-semibold hover:bg-accent"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Get info
                  </button>
                </div>
              </div>

              <p className="mt-5 text-[11px] text-muted-foreground">
                Our team responds within an hour during business hours.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl">Similar properties</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-3 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-background p-2 shadow-pop md:hidden">
        <button
          onClick={() => openLead("contact", "Contact owner")}
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          Contact owner
        </button>
        <button
          onClick={() => openLead("visit", "Schedule visit")}
          className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold"
        >
          Schedule visit
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 p-4 animate-fade-in" onClick={() => setLightbox(false)}>
          <button className="absolute right-5 top-5 text-white text-sm" onClick={() => setLightbox(false)}>
            Close
          </button>
          <div className="grid h-full place-items-center">
            <img src={p.images[active]} alt="" className="max-h-[88vh] max-w-full rounded-2xl object-contain" />
          </div>
          <div className="mx-auto mt-4 flex max-w-3xl gap-2 overflow-x-auto no-scrollbar">
            {p.images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2", i === active ? "ring-white" : "ring-transparent")}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <LeadModal
        open={lead.open}
        propertyId={p.id}
        intent={lead.intent}
        title={lead.title}
        onClose={() => setLead({ ...lead, open: false })}
      />

      <Footer />
      <MobileBottomBar />
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DT({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
      <dt className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</dt>
      <dd className="text-sm font-semibold capitalize">{value}</dd>
    </div>
  );
}
