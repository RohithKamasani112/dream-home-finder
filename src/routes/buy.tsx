import { createFileRoute } from "@tanstack/react-router";
import { ListingsPage } from "@/components/ListingsPage";

interface Search { q?: string; type?: string; max?: string; beds?: string }

export const Route = createFileRoute("/buy")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: s.q as string | undefined,
    type: s.type as string | undefined,
    max: s.max as string | undefined,
    beds: s.beds as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Buy a home — Estale" },
      { name: "description", content: "Browse verified homes for sale: apartments, villas, plots, and commercial spaces." },
      { property: "og:title", content: "Buy a home — Estale" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <ListingsPage
      preset={{ listing: "sell" }}
      title="Homes for sale"
      initialQuery={search as Record<string, string>}
    />
  );
}
