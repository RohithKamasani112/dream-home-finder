import { useState } from "react";
import { X } from "lucide-react";
import { addLead, type Lead } from "@/lib/store";

export function LeadModal({
  open,
  propertyId,
  intent,
  title,
  onClose,
  onSuccess,
}: {
  open: boolean;
  propertyId: number;
  intent: Lead["intent"];
  title: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({ propertyId, intent, ...form });
    setDone(true);
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-pop animate-scale-in">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 px-6 py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">✓</div>
            <h3 className="font-display text-xl">Thank you</h3>
            <p className="text-sm text-muted-foreground">
              Our team will contact you shortly with more details.
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-6 py-6">
            <Field label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Mobile number">
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="+1 555 000 1234"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="jane@email.com"
              />
            </Field>
            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              Submit
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              By submitting you agree to be contacted about this property.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
