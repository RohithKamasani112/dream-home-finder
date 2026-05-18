import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, X, Home as HomeIcon, KeyRound, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSession } from "@/hooks/use-session";
import { addProperty, type Listing, type PropertyType } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/add-property")({
  head: () => ({ meta: [{ title: "Add property — Estale Admin" }] }),
  component: Page,
});

const DRAFT_KEY = "estate.draft.v1";

interface Draft {
  listing?: Listing;
  step: number;
  fields: Record<string, string>;
  amenities: string[];
  images: string[];
}

const AMENITIES = [
  "Pool", "Gym", "Spa", "Concierge", "Smart Home", "EV Charging",
  "Garden", "Wine Cellar", "Home Theatre", "Gated Community", "Tennis Court", "Sauna",
];

function Page() {
  const { session } = useSession();
  const nav = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => {
    if (typeof window === "undefined") return { step: 1, fields: {}, amenities: [], images: [] };
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : { step: 1, fields: {}, amenities: [], images: [] };
  });
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (session && session.role !== "admin") nav({ to: "/" });
    if (session === null) nav({ to: "/login" });
  }, [session, nav]);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedToast(true);
      const id = setTimeout(() => setSavedToast(false), 1200);
      return () => clearTimeout(id);
    }, 600);
    return () => clearTimeout(t);
  }, [draft]);

  const setField = (k: string, v: string) =>
    setDraft((d) => ({ ...d, fields: { ...d.fields, [k]: v } }));

  const toggleAmenity = (a: string) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a],
    }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 8).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setDraft((d) => ({ ...d, images: [...d.images, url].slice(0, 12) }));
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) =>
    setDraft((d) => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }));

  const finish = () => {
    const f = draft.fields;
    const created = addProperty({
      type: (f.type as PropertyType) || "apartment",
      listing: draft.listing ?? "sell",
      title: f.title || "Untitled listing",
      price: draft.listing === "sell" ? Number(f.price || 0) : undefined,
      rent: draft.listing === "rent" ? Number(f.rent || 0) : undefined,
      deposit: draft.listing === "rent" ? Number(f.deposit || 0) : undefined,
      leaseMonths: draft.listing === "rent" ? Number(f.leaseMonths || 12) : undefined,
      currency: "USD",
      address: f.address || "—",
      beds: Number(f.beds || 0),
      baths: Number(f.baths || 0),
      area: Number(f.area || 0),
      verified: false,
      furnished: f.furnishing === "furnished",
      parking: Number(f.parking || 0),
      facing: f.facing,
      age: Number(f.age || 0),
      description: f.description || "",
      amenities: draft.amenities,
      youtubeId: extractYouTubeId(f.youtube),
      images: draft.images.length ? draft.images : [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80",
      ],
    });
    localStorage.removeItem(DRAFT_KEY);
    nav({ to: "/properties/$id", params: { id: String(created.id) } });
  };

  const setListing = (l: Listing) => setDraft((d) => ({ ...d, listing: l, step: 2 }));
  const next = () => setDraft((d) => ({ ...d, step: d.step + 1 }));
  const prev = () => setDraft((d) => ({ ...d, step: Math.max(1, d.step - 1) }));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar floating={false} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {draft.step} of 4</span>
          {savedToast && <span className="inline-flex items-center gap-1 text-primary"><Check className="h-3 w-3" /> Draft saved</span>}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(draft.step / 4) * 100}%` }}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-background p-8 shadow-card">
          {draft.step === 1 && (
            <>
              <h1 className="font-display text-3xl">What would you like to list?</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can change this later.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ChoiceCard active={draft.listing === "sell"} onClick={() => setListing("sell")} icon={<HomeIcon />} title="Sell property" subtitle="One-time sale with ownership transfer" />
                <ChoiceCard active={draft.listing === "rent"} onClick={() => setListing("rent")} icon={<KeyRound />} title="Rent property" subtitle="Monthly rental with lease terms" />
              </div>
            </>
          )}

          {draft.step === 2 && (
            <>
              <h1 className="font-display text-3xl">{draft.listing === "sell" ? "Sale details" : "Rental details"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">The essentials buyers and renters want first.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Text label="Listing title" value={draft.fields.title} onChange={(v) => setField("title", v)} placeholder="e.g. Sunlit corner apartment in Soho" full />
                <Select label="Property type" value={draft.fields.type} onChange={(v) => setField("type", v)}
                  options={["apartment", "villa", "plot", "commercial"]} />
                <Text label="Address" value={draft.fields.address} onChange={(v) => setField("address", v)} placeholder="City, neighborhood" />

                {draft.listing === "sell" ? (
                  <>
                    <Text label="Sale price (USD)" value={draft.fields.price} onChange={(v) => setField("price", v)} type="number" />
                    <Text label="Ownership" value={draft.fields.ownership} onChange={(v) => setField("ownership", v)} placeholder="Freehold / Leasehold" />
                    <Text label="Registration" value={draft.fields.registration} onChange={(v) => setField("registration", v)} placeholder="Reg. number" />
                    <Text label="Plot size (sqft)" value={draft.fields.area} onChange={(v) => setField("area", v)} type="number" />
                  </>
                ) : (
                  <>
                    <Text label="Monthly rent (USD)" value={draft.fields.rent} onChange={(v) => setField("rent", v)} type="number" />
                    <Text label="Security deposit (USD)" value={draft.fields.deposit} onChange={(v) => setField("deposit", v)} type="number" />
                    <Text label="Lease duration (months)" value={draft.fields.leaseMonths} onChange={(v) => setField("leaseMonths", v)} type="number" placeholder="12" />
                    <Select label="Furnishing" value={draft.fields.furnishing} onChange={(v) => setField("furnishing", v)} options={["furnished", "semi", "unfurnished"]} />
                    <Text label="Available from" value={draft.fields.availableFrom} onChange={(v) => setField("availableFrom", v)} type="date" />
                    <Text label="Maintenance (USD/mo)" value={draft.fields.maintenance} onChange={(v) => setField("maintenance", v)} type="number" />
                    <Text label="Tenant preference" value={draft.fields.tenantPref} onChange={(v) => setField("tenantPref", v)} placeholder="Family / Bachelors / Any" />
                  </>
                )}

                <Text label="Bedrooms" value={draft.fields.beds} onChange={(v) => setField("beds", v)} type="number" />
                <Text label="Bathrooms" value={draft.fields.baths} onChange={(v) => setField("baths", v)} type="number" />
                <Text label="Parking" value={draft.fields.parking} onChange={(v) => setField("parking", v)} type="number" />
                <Select label="Facing" value={draft.fields.facing} onChange={(v) => setField("facing", v)} options={["North", "South", "East", "West"]} />
                <Text label="Property age (yrs)" value={draft.fields.age} onChange={(v) => setField("age", v)} type="number" />
              </div>
            </>
          )}

          {draft.step === 3 && (
            <>
              <h1 className="font-display text-3xl">Amenities & description</h1>
              <p className="mt-1 text-sm text-muted-foreground">Help your listing stand out.</p>

              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground">Amenities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AMENITIES.map((a) => {
                    const on = draft.amenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                          on ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-foreground/40",
                        )}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="mt-6 block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</span>
                <textarea
                  rows={6}
                  value={draft.fields.description ?? ""}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Tell the story of this property — what makes it special?"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              <Text label="YouTube walkthrough URL" value={draft.fields.youtube} onChange={(v) => setField("youtube", v)} placeholder="https://youtube.com/watch?v=..." full />
            </>
          )}

          {draft.step === 4 && (
            <>
              <h1 className="font-display text-3xl">Photos & media</h1>
              <p className="mt-1 text-sm text-muted-foreground">Drag and drop, or pick from your device. The first image is the cover.</p>

              <DropZone onFiles={handleFiles} />

              {draft.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {draft.images.map((src, i) => (
                    <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold text-background">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Nav */}
          {draft.step > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <button onClick={prev} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent">
                Back
              </button>
              {draft.step < 4 ? (
                <button onClick={next} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90">
                  Continue
                </button>
              ) : (
                <button onClick={finish} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
                  Publish listing
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ChoiceCard({
  active, onClick, icon, title, subtitle,
}: { active?: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-2xl border p-6 text-left transition",
        active ? "border-foreground bg-surface" : "border-border bg-background hover:border-foreground/40",
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function Text({
  label, value = "", onChange, placeholder, type = "text", full,
}: {
  label: string; value?: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; full?: boolean;
}) {
  return (
    <label className={cn("block", full && "sm:col-span-2")}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function Select({
  label, value = "", onChange, options,
}: { label: string; value?: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm capitalize focus:border-primary focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function DropZone({ onFiles }: { onFiles: (f: FileList | null) => void }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
      className={cn(
        "mt-6 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed bg-surface px-6 py-12 text-center transition",
        drag ? "border-primary bg-primary-soft" : "border-border hover:border-foreground/40",
      )}
    >
      <Upload className="h-7 w-7 text-muted-foreground" />
      <p className="mt-3 font-semibold">Drag & drop photos</p>
      <p className="text-xs text-muted-foreground">or click to browse — up to 12 images</p>
      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </label>
  );
}

function extractYouTubeId(url?: string) {
  if (!url) return undefined;
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m?.[1];
}
