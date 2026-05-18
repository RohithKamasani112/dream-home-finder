import { createFileRoute } from "@tanstack/react-router";
import { ListingsPage } from "@/components/ListingsPage";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Estale" },
      { name: "description", content: "Explore every property on Estale, filterable by city, type, amenities, and more." },
      { property: "og:title", content: "Explore — Estale" },
    ],
  }),
  component: () => <ListingsPage title="Explore all homes" />,
});
