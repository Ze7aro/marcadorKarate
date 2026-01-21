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
import { calculateKataMetrics, compareCompetitors, getRoundStructure } from '@/utils/kataUtils';

interface ResultadosFinalesProps {
  isOpen: boolean;
  onClose: () => void;
  competidores: Competidor[];
  categoria: string;
  area: string;
  currentRound: number;
  initialCompetitorCount: number;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onStartTieBreaker?: (tiedCompetitorIds: number[]) => void;
  onNextRound?: (cutoff: number) => void;
}

export default function ResultadosFinales({
  isOpen,
  onClose,
  competidores,
  categoria,
  area,
  currentRound,
  initialCompetitorCount,
  onExportExcel,
  onExportPDF,
  onStartTieBreaker,
  onNextRound,
}: ResultadosFinalesProps) {
  // Calcular métricas para todos los competidores evaluados
  const competidoresConMetricas = competidores
    .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
    .map((c) => ({
      competidor: c,
      metrics: calculateKataMetrics((c.PuntajesJueces || []).map(p => p || '0'), 5), // Asumiendo 5 jueces por defecto
    }));

  // Ordenar usando la lógica de tie-breaking
  const competidoresEvaluados = competidoresConMetricas
    .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
    .map(wrapper => wrapper.competidor);

  const competidoresDescalificados = competidores.filter((c) => c.Kiken);
  const competidoresNoEvaluados = competidores.filter(
    (c) => c.PuntajeFinal === null && !c.Kiken
  );

  // Lógica de Rondas
  const roundStructure = getRoundStructure(initialCompetitorCount, currentRound);
  const showNextRoundButton = roundStructure.nextRoundCutoff !== null;

  // Validar si hay empate en el corte
  const checkForCutoffTie = (): boolean => {
    if (!roundStructure.nextRoundCutoff || competidoresEvaluados.length <= roundStructure.nextRoundCutoff) return false;

    // El competidor en la posición del corte (index = cutoff - 1)
    // El competidor justo fuera del corte (index = cutoff)
    const cutoffIndex = roundStructure.nextRoundCutoff - 1;
    const lastInIndex = cutoffIndex;
    const firstOutIndex = cutoffIndex + 1;

    if (!competidoresEvaluados[lastInIndex] || !competidoresEvaluados[firstOutIndex]) return false;

    const metricsIn = competidoresConMetricas.find(c => c.competidor.id === competidoresEvaluados[lastInIndex].id)!.metrics;
    const metricsOut = competidoresConMetricas.find(c => c.competidor.id === competidoresEvaluados[firstOutIndex].id)!.metrics;

    return compareCompetitors(metricsIn, metricsOut) === 0;
  };

  const isCutoffTied = checkForCutoffTie();

  // Detectar empates en los primeros 3 puestos (o relevantes)
  const checkForTies = () => {
    if (competidoresEvaluados.length < 2) return null;

    // Agrupar por métricas idénticas
    // Como ya están ordenados, los empatados estarán adyacentes
    const tiedGroups: Competidor[][] = [];
    let currentGroup: Competidor[] = [competidoresEvaluados[0]];

    for (let i = 1; i < competidoresEvaluados.length; i++) {
      const prev = competidoresConMetricas.find(c => c.competidor.id === currentGroup[0].id)!.metrics;
      const curr = competidoresConMetricas.find(c => c.competidor.id === competidoresEvaluados[i].id)!.metrics;

      if (compareCompetitors({ ...prev, total: prev.total }, { ...curr, total: curr.total }) === 0) {
        currentGroup.push(competidoresEvaluados[i]);
      } else {
        if (currentGroup.length > 1) {
          // Solo nos interesan empates que afecten el podio (para este caso simple)
          // O si el usuario quiere resolver cualquier empate.
          // Asumamos que si hay empate en el Top 4 (por las medallas dobles de bronce a veces, o solo top 3)
          // Vamos a reportar el grupo de empate más alto.
          tiedGroups.push([...currentGroup]);
        }
        currentGroup = [competidoresEvaluados[i]];
      }
    }
    if (currentGroup.length > 1) {
      tiedGroups.push([...currentGroup]);
    }

    // Retorna el primer grupo de empate relevante encontrado
    return tiedGroups.length > 0 ? tiedGroups[0] : null;
  };

  const tieGroup = checkForTies();
  // El empate bloqueante real es si afecta el corte o el podio. 
  // Si hay empate en corte, la prioridad es desempatar eso.
  const blockingTie = isCutoffTied ? { type: 'cutoff', message: `Empate en el puesto ${roundStructure.nextRoundCutoff} (Corte). Se requiere desempate.` }
    : tieGroup ? { type: 'medal', message: 'Empate en medallas detectado.' } : null;



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

          {blockingTie && (
            <div className={`mt-4 p-4 rounded-lg flex justify-between items-center ${isCutoffTied ? 'bg-red-50 dark:bg-red-900/30 border-red-200' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200'}`}>
              <div>
                <h3 className={`text-lg font-bold ${isCutoffTied ? 'text-red-700' : 'text-yellow-700'}`}>
                  {isCutoffTied ? '🛑 Empate Crítico en Corte' : '⚠️ Empate Detectado'}
                </h3>
                <p className="text-sm">{blockingTie.message}</p>
                {tieGroup && (
                  <div className="flex gap-2 mt-1">
                    {tieGroup.map(c => <Chip key={c.id} size="sm">{c.Nombre}</Chip>)}
                  </div>
                )}
              </div>
              {onStartTieBreaker && (
                <Button
                  color="warning"
                  onPress={() => onStartTieBreaker(tieGroup ? tieGroup.map(c => c.id) : [])}
                >
                  Generar Ronda de Desempate
                </Button>
              )}
            </div>
          )}

          {showNextRoundButton && !isCutoffTied && competidoresEvaluados.length >= (roundStructure.nextRoundCutoff || 0) && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">Siguiente Ronda: {roundStructure.label}</h3>
                <p className="text-sm">Clasifican los mejores {roundStructure.nextRoundCutoff} competidores.</p>
              </div>
              {onNextRound && (
                <Button
                  color="primary"
                  onPress={() => roundStructure.nextRoundCutoff && onNextRound(roundStructure.nextRoundCutoff)}
                >
                  Pasar a Siguiente Ronda
                </Button>
              )}
            </div>
          )}

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
                      <p className="text-3xl font-bold text-white">
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Ranking Completo</h3>
                  <div className="text-xs text-gray-500">
                    * Ordenado por: Total &gt; Min Incluido &gt; Max Incluido
                  </div>
                </div>

                <div className="space-y-3">
                  {competidoresEvaluados.map((competidor, index) => {
                    const metrics = competidoresConMetricas.find(c => c.competidor.id === competidor.id)?.metrics;

                    return (
                      <Card key={competidor.id}>
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${index === 0
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
                                  <div className="flex flex-col gap-1 mt-1">
                                    <div className="flex gap-2">
                                      {competidor.PuntajesJueces.map((puntaje, idx) => (
                                        puntaje && (
                                          <Chip key={idx} size="sm" variant="flat" className="text-xs h-6">
                                            J{idx + 1}: {puntaje}
                                          </Chip>
                                        )
                                      ))}
                                    </div>
                                    {/* Mostrar desglose de desempate y min/max total */}
                                    {metrics && (
                                      <div className="flex gap-2 text-xs text-gray-400">
                                        <span>Min: {metrics.minTotal?.toFixed(1) || '-'}</span>
                                        <span>Max: {metrics.maxTotal?.toFixed(1) || '-'}</span>
                                      </div>
                                    )}
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
                    )
                  })}
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
