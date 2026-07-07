import { Button, Card, CardBody } from "@heroui/react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { readExcelFile } from "@/utils/excelUtils";
import { showToast } from "@/utils/toast";
import type { CategoriaImportada, Disciplina } from "@/types/categoryCatalog";

interface CategoryUploadPanelProps {
  disciplina: Disciplina;
  categories: CategoriaImportada[];
  onImport: (entry: CategoriaImportada) => void;
  onRemove: (id: string) => void;
}

function disciplinaLabel(disciplina: Disciplina) {
  return disciplina === "kata" ? "Kata" : "Kumite";
}

export default function CategoryUploadPanel({
  disciplina,
  categories,
  onImport,
  onRemove,
}: CategoryUploadPanelProps) {
  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: "Excel",
            extensions: ["xlsx", "xls"],
          },
        ],
      });

      if (!selected || !Array.isArray(selected) || selected.length === 0) {
        return;
      }

      let importedCount = 0;

      for (const filePath of selected) {
        const fileContent = await readFile(filePath);
        const { competidores, categoria } = await readExcelFile(
          fileContent.buffer,
        );

        if (!categoria.trim()) {
          showToast.error(
            `El archivo ${filePath.split(/[\\/]/).pop()} no tiene categoria en B1`,
          );
          continue;
        }

        onImport({
          id: `${disciplina}-${categoria.trim().toLowerCase()}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          disciplina,
          categoria: categoria.trim(),
          competidores: competidores.map((competidor, index) => ({
            ...competidor,
            id: index + 1,
            Categoria: categoria.trim(),
          })),
          sourceFileName: filePath.split(/[\\/]/).pop() || "archivo.xlsx",
          importedAt: new Date().toISOString(),
        });
        importedCount += 1;
      }

      if (importedCount > 0) {
        showToast.success(
          `${importedCount} categor${importedCount === 1 ? "ia importada" : "ias importadas"} en ${disciplinaLabel(disciplina)}`,
        );
      }
    } catch (error) {
      console.error("Error importing category files:", error);
      showToast.error("No se pudieron importar los archivos Excel");
    }
  };

  return (
    <Card className="app-panel rounded-[1.75rem] h-full">
      <CardBody className="p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="app-label mb-2">Carga central</p>
            <h2 className="app-section-title text-3xl">
              Categorias de {disciplinaLabel(disciplina)}
            </h2>
            <p className="text-slate-400 mt-2">
              Puedes seleccionar varios archivos a la vez. Un Excel por categoria.
            </p>
          </div>
          <Button className="app-button-primary" onPress={handleImport}>
            Subir uno o varios Excel
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="app-empty-state min-h-[10rem]">
            <p className="text-lg text-slate-100">
              No hay categorias cargadas
            </p>
            <p className="text-sm text-slate-400">
              Importa uno o varios Excel para {disciplinaLabel(disciplina)}.
            </p>
          </div>
        ) : (
          <div className="app-card-list">
            {categories.map((category) => (
              <div
                key={category.id}
                className="app-list-row rounded-[1.25rem] p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-100">
                    {category.categoria}
                  </p>
                  <p className="text-sm text-slate-400">
                    {category.competidores.length} competidores
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {category.sourceFileName}
                  </p>
                </div>
                <Button
                  className="app-button-danger"
                  size="sm"
                  onPress={() => onRemove(category.id)}
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
