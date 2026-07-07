import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CategoriaImportada, Disciplina } from "@/types/categoryCatalog";

const STORAGE_KEY = "kenshukanCategoryCatalog";

export function useCategoryCatalog() {
  const [categories, setCategories] = useLocalStorage<CategoriaImportada[]>(
    STORAGE_KEY,
    [],
  );

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.categoria.localeCompare(b.categoria, "es", { sensitivity: "base" }),
      ),
    [categories],
  );

  const upsertCategory = (entry: CategoriaImportada) => {
    setCategories((current) => {
      const filtered = current.filter(
        (item) =>
          !(
            item.disciplina === entry.disciplina &&
            item.categoria.trim().toLowerCase() ===
              entry.categoria.trim().toLowerCase()
          ),
      );

      return [...filtered, entry];
    });
  };

  const removeCategory = (id: string) => {
    setCategories((current) => current.filter((item) => item.id !== id));
  };

  const getByDiscipline = (disciplina: Disciplina) =>
    sortedCategories.filter((item) => item.disciplina === disciplina);

  return {
    categories: sortedCategories,
    upsertCategory,
    removeCategory,
    getByDiscipline,
  };
}
