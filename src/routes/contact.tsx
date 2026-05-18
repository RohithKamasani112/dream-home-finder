import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Navbar, MobileBottomBar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Estale" },
      { name: "description", content: "Talk to an Estale specialist about buying, renting or listing your property." },
    ],
  }),
  component: Page,
});

function Page() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar floating={false} />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <h1 className="font-display text-5xl tracking-tight">Let's talk.</h1>
          <p className="mt-3 text-muted-foreground">
            Whether you're buying, renting or listing — a real person will get back to you within the hour.
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="rounded-3xl border border-border bg-card p-8 shadow-card"
          >
            {sent ? (
              <div className="grid place-items-center py-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary text-xl">✓</div>
                <h3 className="mt-4 font-display text-2xl">Message received</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">We'll be in touch shortly.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(["First name", "Last name", "Email", "Phone"] as const).map((l) => (
                  <label key={l} className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{l}</span>
                    <input required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                  </label>
                ))}
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">How can we help?</span>
                  <textarea rows={5} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
                </label>
                <button className="sm:col-span-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
                  Send message
                </button>
              </div>
            )}
          </form>

          <aside className="space-y-4">
            <Info icon={<Mail />} label="Email" value="hello@estale.app" />
            <Info icon={<Phone />} label="Phone" value="+1 (555) 010-0000" />
            <Info icon={<MapPin />} label="Office" value="115 Greene St, New York, NY" />
          </aside>
        </div>
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
