import type { Competidor } from "@/types";

export type Disciplina = "kata" | "kumite";

export interface CategoriaImportada {
  id: string;
  disciplina: Disciplina;
  categoria: string;
  competidores: Competidor[];
  sourceFileName: string;
  importedAt: string;
}
