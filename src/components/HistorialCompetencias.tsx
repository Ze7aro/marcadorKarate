import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Spinner,
  Chip,
} from '@heroui/react';
import { invoke } from '@tauri-apps/api/core';
import { CompetenciaKata } from '@/types';
import { showToast } from '@/utils/toast';

interface HistorialCompetenciasProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCompetencia?: (competencia: CompetenciaKata) => void;
}

export default function HistorialCompetencias({
  isOpen,
  onClose,
  onLoadCompetencia,
}: HistorialCompetenciasProps) {
  const [competencias, setCompetencias] = useState<CompetenciaKata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<CompetenciaKata | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar historial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadHistorial();
    }
  }, [isOpen]);

  const loadHistorial = async () => {
    setLoading(true);
    try {
      const historial = await invoke<CompetenciaKata[]>('obtener_historial_competencias', {
        limit: 50,
      });
      setCompetencias(historial);
    } catch (error) {
      console.error('Error loading historial:', error);
      showToast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (competenciaId: number) => {
    setLoadingDetails(true);
    try {
      const detalles = await invoke<CompetenciaKata>('obtener_detalles_competencia', {
        competenciaId,
      });
      setSelectedCompetencia(detalles);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading details:', error);
      showToast.error('Error al cargar detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (competenciaId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta competencia?')) {
      return;
    }

    try {
      await invoke('eliminar_competencia', { competenciaId });
      showToast.success('Competencia eliminada');
      loadHistorial();
      if (selectedCompetencia?.id === competenciaId) {
        setShowDetails(false);
        setSelectedCompetencia(null);
      }
    } catch (error) {
      console.error('Error deleting competencia:', error);
      showToast.error('Error al eliminar competencia');
    }
  };

  const handleLoadCompetencia = () => {
    if (selectedCompetencia && onLoadCompetencia) {
      onLoadCompetencia(selectedCompetencia);
      showToast.success('Competencia cargada');
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <>
      {/* Modal Principal - Lista de Historial */}
      <Modal isOpen={isOpen && !showDetails} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl">Historial de Competencias</h2>
            <p className="text-sm text-gray-500">Competencias guardadas de Kata</p>
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : competencias.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No hay competencias guardadas</p>
                <p className="text-sm mt-2">Las competencias guardadas aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {competencias.map((competencia) => (
                  <Card key={competencia.id} isPressable>
                    <CardBody>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{competencia.nombre}</h3>
                          <div className="flex gap-2 flex-wrap mb-2">
                            <Chip size="sm" color="primary" variant="flat">
                              Área {competencia.area}
                            </Chip>
                            {competencia.categoria && (
                              <Chip size="sm" color="secondary" variant="flat">
                                {competencia.categoria}
                              </Chip>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(competencia.fecha)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleViewDetails(competencia.id!)}
                            isLoading={loadingDetails}
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => handleDelete(competencia.id!)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Secundario - Detalles de Competencia */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl">{selectedCompetencia?.nombre}</h2>
            <div className="flex gap-2 mt-2">
              <Chip size="sm" color="primary">
                Área {selectedCompetencia?.area}
              </Chip>
              {selectedCompetencia?.categoria && (
                <Chip size="sm" color="secondary">
                  {selectedCompetencia.categoria}
                </Chip>
              )}
              <Chip size="sm" variant="flat">
                {selectedCompetencia?.fecha &&
                  formatDate(selectedCompetencia.fecha)}
              </Chip>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedCompetencia && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Competidores ({selectedCompetencia.competidores.length})
                </h3>
                <div className="space-y-3">
                  {selectedCompetencia.competidores
                    .sort((a, b) => (b.puntajeFinal || 0) - (a.puntajeFinal || 0))
                    .map((competidor, index) => (
                      <Card key={index}>
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                  index === 0
                                    ? 'bg-yellow-500 text-white'
                                    : index === 1
                                    ? 'bg-gray-400 text-white'
                                    : index === 2
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-blue-500 text-white'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-lg">
                                  {competidor.nombre}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Edad: {competidor.edad}
                                </p>
                                {competidor.descalificado && (
                                  <Chip size="sm" color="danger" variant="flat" className="mt-1">
                                    Descalificado
                                  </Chip>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {competidor.puntajeFinal !== null ? (
                                <div>
                                  <p className="text-3xl font-bold text-green-600">
                                    {competidor.puntajeFinal.toFixed(2)}
                                  </p>
                                  {competidor.puntajesJueces.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                      {competidor.puntajesJueces.map((puntaje, idx) => (
                                        <Chip key={idx} size="sm" variant="flat">
                                          J{idx + 1}: {puntaje.toFixed(2)}
                                        </Chip>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin evaluar</p>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setShowDetails(false)}
            >
              Volver
            </Button>
            {onLoadCompetencia && (
              <Button color="primary" onPress={handleLoadCompetencia}>
                Cargar Competencia
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
