import { createFileRoute } from "@tanstack/react-router";
import { ListingsPage } from "@/components/ListingsPage";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Saved homes — Estale" }] }),
  component: () => <ListingsPage title="Saved homes" subtitle="Homes you've favorited" favoritesOnly />,
});
