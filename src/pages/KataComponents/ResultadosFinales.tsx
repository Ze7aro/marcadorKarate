import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
} from '@heroui/react';
import { Competidor } from '@/types';

interface ResultadosFinalesProps {
  isOpen: boolean;
  onClose: () => void;
  competidores: Competidor[];
  categoria: string;
  area: string;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

export default function ResultadosFinales({
  isOpen,
  onClose,
  competidores,
  categoria,
  area,
  onExportExcel,
  onExportPDF,
}: ResultadosFinalesProps) {
  // Separar competidores evaluados y no evaluados
  const competidoresEvaluados = competidores
    .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
    .sort((a, b) => (b.PuntajeFinal || 0) - (a.PuntajeFinal || 0));

  const competidoresDescalificados = competidores.filter((c) => c.Kiken);
  const competidoresNoEvaluados = competidores.filter(
    (c) => c.PuntajeFinal === null && !c.Kiken
  );

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Resultados Finales</h2>
          <div className="flex gap-2 mt-2">
            {area && (
              <Chip size="sm" color="primary">
                Área {area}
              </Chip>
            )}
            {categoria && (
              <Chip size="sm" color="secondary">
                {categoria}
              </Chip>
            )}
            <Chip size="sm" variant="flat">
              {competidores.length} Competidores
            </Chip>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Podio - Top 3 */}
            {competidoresEvaluados.length >= 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-center">Podio</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Segundo lugar */}
                  <Card className="bg-gradient-to-br from-gray-300 to-gray-400">
                    <CardBody className="text-center py-6">
                      <div className="text-6xl mb-2">🥈</div>
                      <p className="text-3xl font-bold text-white mb-1">2°</p>
                      <p className="text-xl font-semibold text-white mb-2">
                        {competidoresEvaluados[1].Nombre}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {competidoresEvaluados[1].PuntajeFinal?.toFixed(2)}
                      </p>
                    </CardBody>
                  </Card>

                  {/* Primer lugar */}
                  <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 -mt-4">
                    <CardBody className="text-center py-8">
                      <div className="text-7xl mb-2">🥇</div>
                      <p className="text-4xl font-bold text-white mb-1">1°</p>
                      <p className="text-2xl font-semibold text-white mb-2">
                        {competidoresEvaluados[0].Nombre}
                      </p>
                      <p className="text-4xl font-bold text-white">
                        {competidoresEvaluados[0].PuntajeFinal?.toFixed(2)}
                      </p>
                    </CardBody>
                  </Card>

                  {/* Tercer lugar */}
                  <Card className="bg-gradient-to-br from-orange-400 to-orange-600">
                    <CardBody className="text-center py-6">
                      <div className="text-6xl mb-2">🥉</div>
                      <p className="text-3xl font-bold text-white mb-1">3°</p>
                      <p className="text-xl font-semibold text-white mb-2">
                        {competidoresEvaluados[2].Nombre}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {competidoresEvaluados[2].PuntajeFinal?.toFixed(2)}
                      </p>
                    </CardBody>
                  </Card>
                </div>
                <Divider className="my-6" />
              </div>
            )}

            {/* Ranking completo */}
            {competidoresEvaluados.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Ranking Completo</h3>
                <div className="space-y-3">
                  {competidoresEvaluados.map((competidor, index) => (
                    <Card key={competidor.id}>
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                                index === 0
                                  ? 'bg-yellow-500 text-white'
                                  : index === 1
                                  ? 'bg-gray-400 text-white'
                                  : index === 2
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {getMedalEmoji(index + 1) || index + 1}
                            </div>
                            <div>
                              <p className="text-xl font-semibold">
                                {competidor.Nombre}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Edad: {competidor.Edad}
                              </p>
                              {competidor.PuntajesJueces && competidor.PuntajesJueces.length > 0 && (
                                <div className="flex gap-2 mt-1">
                                  {competidor.PuntajesJueces.map((puntaje, idx) => (
                                    puntaje && (
                                      <Chip key={idx} size="sm" variant="flat">
                                        J{idx + 1}: {puntaje}
                                      </Chip>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                              {competidor.PuntajeFinal?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Competidores no evaluados */}
            {competidoresNoEvaluados.length > 0 && (
              <div>
                <Divider className="my-6" />
                <h3 className="text-xl font-semibold mb-4">No Evaluados</h3>
                <div className="space-y-2">
                  {competidoresNoEvaluados.map((competidor) => (
                    <Card key={competidor.id} className="bg-gray-100 dark:bg-gray-800">
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{competidor.Nombre}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Edad: {competidor.Edad}
                            </p>
                          </div>
                          <Chip size="sm" variant="flat">
                            Sin evaluar
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Competidores descalificados */}
            {competidoresDescalificados.length > 0 && (
              <div>
                <Divider className="my-6" />
                <h3 className="text-xl font-semibold mb-4">Descalificados</h3>
                <div className="space-y-2">
                  {competidoresDescalificados.map((competidor) => (
                    <Card key={competidor.id} className="bg-red-50 dark:bg-red-900/20">
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{competidor.Nombre}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Edad: {competidor.Edad}
                            </p>
                          </div>
                          <Chip size="sm" color="danger">
                            Kiken
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje si no hay resultados */}
            {competidoresEvaluados.length === 0 &&
              competidoresNoEvaluados.length === 0 &&
              competidoresDescalificados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🥋</div>
                  <p className="text-xl">No hay resultados para mostrar</p>
                  <p className="text-sm mt-2">
                    Agrega competidores y evalúalos para ver los resultados
                  </p>
                </div>
              )}
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <div className="flex gap-2">
            {onExportExcel && (
              <Button
                color="default"
                variant="bordered"
                onPress={onExportExcel}
                isDisabled={competidores.length === 0}
              >
                Exportar Excel
              </Button>
            )}
            {onExportPDF && (
              <Button
                color="default"
                variant="bordered"
                onPress={onExportPDF}
                isDisabled={competidores.length === 0}
              >
                Exportar PDF
              </Button>
            )}
          </div>
          <Button color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
