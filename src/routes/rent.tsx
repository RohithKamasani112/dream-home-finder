import { createFileRoute } from "@tanstack/react-router";
import { ListingsPage } from "@/components/ListingsPage";

interface Search { q?: string; type?: string; max?: string; beds?: string }

export const Route = createFileRoute("/rent")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: s.q as string | undefined,
    type: s.type as string | undefined,
    max: s.max as string | undefined,
    beds: s.beds as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rent a home — Estale" },
      { name: "description", content: "Considered rentals — apartments, villas, and commercial spaces with verified listings." },
      { property: "og:title", content: "Rent a home — Estale" },
    ],
  }),
  component: Page,
});

function Page() {
  const search = Route.useSearch();
  return (
    <ListingsPage
      preset={{ listing: "rent" }}
      title="Homes for rent"
      initialQuery={search as Record<string, string>}
    />
  );
}
