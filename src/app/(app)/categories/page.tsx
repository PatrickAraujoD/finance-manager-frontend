import type { Metadata } from "next";
import { CategoriesView } from "./categories-view";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriesPage() {
  return <CategoriesView />;
}
