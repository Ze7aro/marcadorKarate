import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useKataStats } from "@/hooks/useKataStats";
import StatsCard from "@/components/StatsCard";
import { generateStatsPDF } from "@/utils/pdfUtils";
import { showToast } from "@/utils/toast";

export default function StatsPage() {
  const navigate = useNavigate();
  const {
    totalCompetencias,
    totalCompetidores,
    ultimaCompetencia,
    competenciasPorArea,
    loading,
    refresh,
  } = useKataStats();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleExportPDF = async () => {
    try {
      if (totalCompetencias === 0) {
        showToast.error("No hay estadísticas para exportar");
        return;
      }

      const fileName = `estadisticas_kata_${Date.now()}.pdf`;
      const filePath = await save({
        defaultPath: fileName,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });

      if (!filePath) return;

      const pdfBuffer = generateStatsPDF(
        totalCompetencias,
        totalCompetidores,
        competenciasPorArea,
      );

      await writeFile(filePath, new Uint8Array(pdfBuffer));
      showToast.success("Estadísticas exportadas a PDF exitosamente");
    } catch (error) {
      console.error("Error exporting stats PDF:", error);
      showToast.error("Error al exportar estadísticas");
    }
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="app-header">
          <div>
            <p className="app-label mb-4">Historial y métricas</p>
            <h1 className="app-title">Estadísticas</h1>
            <p className="app-subtitle">
              Resumen del historial de competencias de kata.
            </p>
          </div>
          <div className="app-toolbar">
            <Button className="app-button-secondary" onPress={() => refresh()}>
              Actualizar
            </Button>
            <Button
              className="app-button-secondary"
              onPress={handleExportPDF}
              isDisabled={totalCompetencias === 0}
            >
              Exportar PDF
            </Button>
            <Button className="app-button-primary" onPress={() => navigate("/inicio")}>
              Volver al inicio
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="app-empty-state min-h-[20rem]">
            <Spinner size="lg" />
            <p>Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            <div className="app-stat-grid mb-8">
              <StatsCard
                title="Total de competencias"
                value={totalCompetencias}
                icon="🏆"
                color="primary"
                description="Competencias registradas"
              />
              <StatsCard
                title="Total de competidores"
                value={totalCompetidores}
                icon="🥋"
                color="success"
                description="A través de todas las competencias"
              />
              <StatsCard
                title="Última competencia"
                value={ultimaCompetencia ? formatDate(ultimaCompetencia) : "N/A"}
                icon="📅"
                color="secondary"
                description="Fecha más reciente"
              />
            </div>

            {Object.keys(competenciasPorArea).length > 0 && (
              <Card className="app-panel rounded-[1.75rem] mb-8">
                <CardBody className="p-8">
                  <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <div>
                      <p className="app-label mb-2">Distribución</p>
                      <h2 className="app-section-title">Competencias por área</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(competenciasPorArea)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([area, count]) => (
                        <Card
                          key={area}
                          className="app-panel-muted rounded-3xl border border-[rgba(80,125,196,0.16)]"
                        >
                          <CardBody className="text-center py-6">
                            <p className="app-label mb-3">Área {area}</p>
                            <p className="text-4xl font-black text-sky-300">{count}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {count === 1 ? "competencia" : "competencias"}
                            </p>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {totalCompetencias === 0 && (
              <Card className="app-panel rounded-[1.75rem]">
                <CardBody className="p-8">
                  <div className="app-empty-state min-h-[16rem]">
                    <div className="text-6xl">📊</div>
                    <p className="text-xl font-semibold text-slate-100">
                      No hay estadísticas disponibles
                    </p>
                    <p className="text-sm text-slate-400">
                      Guarda algunas competencias para empezar a ver métricas.
                    </p>
                    <Button className="app-button-primary mt-4" onPress={() => navigate("/kata")}>
                      Ir a Kata
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
