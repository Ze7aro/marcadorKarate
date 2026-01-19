import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { useKataStats } from "@/hooks/useKataStats";
import StatsCard from "@/components/StatsCard";
import { generateStatsPDF } from "@/utils/pdfUtils";
import { showToast } from "@/utils/toast";

export default function StatsPage() {
  const navigate = useNavigate();
  const { totalCompetencias, totalCompetidores, ultimaCompetencia, competenciasPorArea, loading, refresh } = useKataStats();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleExportPDF = async () => {
    try {
      if (totalCompetencias === 0) {
        showToast.error('No hay estadísticas para exportar');
        return;
      }

      const fileName = `estadisticas_kata_${Date.now()}.pdf`;

      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: 'PDF',
            extensions: ['pdf'],
          },
        ],
      });

      if (!filePath) return;

      const pdfBuffer = generateStatsPDF(
        totalCompetencias,
        totalCompetidores,
        competenciasPorArea
      );

      await writeFile(filePath, new Uint8Array(pdfBuffer));

      showToast.success('Estadísticas exportadas a PDF exitosamente');
    } catch (error) {
      console.error('Error exporting stats PDF:', error);
      showToast.error('Error al exportar estadísticas');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Estadísticas
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Resumen del historial de competencias Kata
            </p>
          </div>
          <div className="flex gap-3">
            <Button color="primary" variant="flat" onPress={() => refresh()}>
              Actualizar
            </Button>
            <Button
              color="default"
              variant="bordered"
              onPress={handleExportPDF}
              isDisabled={totalCompetencias === 0}
            >
              Exportar PDF
            </Button>
            <Button color="default" onPress={() => navigate('/inicio')}>
              Volver al Inicio
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Cards de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total de Competencias"
                value={totalCompetencias}
                icon="🏆"
                color="primary"
                description="Competencias registradas"
              />
              <StatsCard
                title="Total de Competidores"
                value={totalCompetidores}
                icon="🥋"
                color="success"
                description="A través de todas las competencias"
              />
              <StatsCard
                title="Última Competencia"
                value={ultimaCompetencia ? formatDate(ultimaCompetencia) : 'N/A'}
                icon="📅"
                color="secondary"
                description="Fecha más reciente"
              />
            </div>

            {/* Competencias por Área */}
            {Object.keys(competenciasPorArea).length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="text-2xl font-bold mb-6">Competencias por Área</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(competenciasPorArea)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([area, count]) => (
                        <Card key={area} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                          <CardBody className="text-center py-6">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Área {area}
                            </p>
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                              {count}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {count === 1 ? 'competencia' : 'competencias'}
                            </p>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Mensaje si no hay datos */}
            {totalCompetencias === 0 && (
              <Card>
                <CardBody>
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl mb-2">No hay estadísticas disponibles</p>
                    <p className="text-sm">
                      Guarda algunas competencias para ver estadísticas aquí
                    </p>
                    <Button
                      color="primary"
                      className="mt-6"
                      onPress={() => navigate('/kata')}
                    >
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
