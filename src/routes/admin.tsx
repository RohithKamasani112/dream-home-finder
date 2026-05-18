import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, Edit3, Inbox } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSession } from "@/hooks/use-session";
import { deleteProperty, listLeads, listProperties, money, type Property, type Lead } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Estale" }] }),
  component: Page,
});

function Page() {
  const { session } = useSession();
  const nav = useNavigate();
  const [tab, setTab] = useState<"props" | "leads">("props");
  const [props, setProps] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setProps(listProperties());
    setLeads(listLeads());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !session) nav({ to: "/login" });
    if (session && session.role !== "admin") nav({ to: "/" });
  }, [session, nav]);

  if (!session || session.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar floating={false} />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in with <span className="font-mono">admin@estate.app / admin123</span>.
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Log in
          </Link>
        </main>
      </div>
    );
  }

  const remove = (id: number) => {
    if (!confirm("Delete this listing?")) return;
    deleteProperty(id);
    setProps(listProperties());
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar floating={false} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Admin dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage listings, leads and team activity.</p>
          </div>
          <Link
            to="/admin/add-property"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add property
          </Link>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <Stat label="Total listings" value={props.length} />
          <Stat label="For sale" value={props.filter((p) => p.listing === "sell").length} />
          <Stat label="For rent" value={props.filter((p) => p.listing === "rent").length} />
          <Stat label="Leads" value={leads.length} />
        </div>

        <div className="mt-8 inline-flex rounded-full border border-border bg-background p-1 text-xs font-semibold">
          {(["props", "leads"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 ${tab === t ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              {t === "props" ? "Listings" : "Leads"}
            </button>
          ))}
        </div>

        {tab === "props" ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {props.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="h-10 w-14 rounded object-cover" />
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize">{p.type}</td>
                    <td className="px-5 py-3 capitalize">{p.listing === "sell" ? "For sale" : "For rent"}</td>
                    <td className="px-5 py-3 font-semibold">
                      {p.listing === "sell" ? money(p.price) : `${money(p.rent)}/mo`}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to="/properties/$id"
                          params={{ id: String(p.id) }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent"
                          aria-label="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Edit">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-background">
            {leads.length === 0 ? (
              <div className="grid place-items-center px-6 py-16 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-semibold">No leads yet</p>
                <p className="text-xs text-muted-foreground">When visitors request brochures or info, you'll see them here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {leads.map((l) => (
                  <li key={l.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-semibold">{l.name} <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">{l.intent}</span></p>
                      <p className="text-xs text-muted-foreground">{l.email} · {l.phone} · Property #{l.propertyId}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}
