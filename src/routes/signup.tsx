import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { signupUser, setSession } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create an account — Estale" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const u = signupUser(form);
      setSession({ userId: u.id, role: u.role, name: u.name });
      nav({ to: "/" });
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar floating={false} />
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border bg-background p-8 shadow-card">
          <h1 className="font-display text-3xl">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Save homes, get visit reminders, and message owners.</p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            {(
              [
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Mobile number", "tel"],
                ["password", "Password", "password"],
              ] as const
            ).map(([k, label, type]) => (
              <label key={k} className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
                <input
                  required
                  type={type}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            ))}
            {err && <p className="text-xs text-destructive">{err}</p>}
            <button className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft">
              Create account
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already a member? <Link to="/login" className="font-semibold text-primary">Log in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
