import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Apple, ChromeIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { loginUser, setSession } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Estale" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({ id: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const u = loginUser(form.id, mode === "phone" ? "user123" : form.password);
      setSession({ userId: u.id, role: u.role, name: u.name });
      navigate({ to: u.role === "admin" ? "/admin" : "/" });
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar floating={false} />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-3xl bg-primary text-primary-foreground">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
              alt="Premium home interior"
              className="h-[60vh] w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <h2 className="font-display text-3xl leading-tight">Welcome back.</h2>
              <p className="mt-2 max-w-sm text-sm text-primary-foreground/80">
                Pick up where you left off — your saved homes, searches and conversations.
              </p>
            </div>
          </div>
        </aside>

        <section>
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-background p-8 shadow-card">
            <h1 className="font-display text-3xl">Log in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Try <span className="font-mono text-foreground">admin@estate.app / admin123</span> or{" "}
              <span className="font-mono text-foreground">user@estate.app / user123</span>
            </p>

            <div className="mt-6 flex rounded-full border border-border p-1 text-xs font-semibold">
              {(["email", "phone"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-full py-2 transition ${
                    mode === m ? "bg-foreground text-background" : "text-muted-foreground"
                  }`}
                >
                  {m === "email" ? "Email" : "Mobile OTP"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              {mode === "email" ? (
                <>
                  <Input icon={<Mail className="h-4 w-4" />} placeholder="Email address"
                    value={form.id} onChange={(v) => setForm({ ...form, id: v })} type="email" />
                  <Input placeholder="Password" type="password"
                    value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                </>
              ) : (
                <>
                  <Input icon={<Phone className="h-4 w-4" />} placeholder="Mobile number"
                    value={form.id} onChange={(v) => setForm({ ...form, id: v })} type="tel" />
                  {otpSent ? (
                    <Input placeholder="Enter 6-digit OTP" value={otp} onChange={setOtp} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold"
                    >
                      Send OTP
                    </button>
                  )}
                </>
              )}

              {err && <p className="text-xs text-destructive">{err}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
              >
                Continue
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-accent">
                <ChromeIcon className="h-4 w-4" /> Google
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-accent">
                <Apple className="h-4 w-4" /> Apple
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              New here? <Link to="/signup" className="font-semibold text-primary">Create an account</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Input({
  icon, value, onChange, ...rest
}: {
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border bg-background py-3 ${icon ? "pl-11 pr-4" : "px-4"} text-sm focus:border-primary focus:outline-none`}
      />
    </div>
  );
}
