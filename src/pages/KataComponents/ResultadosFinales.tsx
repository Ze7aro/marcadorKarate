import { useEffect, useMemo, useState } from 'react';
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
} from '@heroui/react';
import { Round } from '@/context/KataContext';
import { Competidor } from '@/types';
import {
  buildKataFinalResults,
  calculateKataMetrics,
  compareCompetitors,
  getRoundStructure,
  KataRoundFormatKey,
} from '@/utils/kataUtils';

interface ResultadosFinalesProps {
  isOpen: boolean;
  onClose: () => void;
  competidores: Competidor[];
  previousRounds: Round[];
  numJudges: number;
  categoria: string;
  area: string;
  currentRound: number;
  roundFormat: KataRoundFormatKey;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onStartTieBreaker?: (tiedCompetitorIds: number[]) => void;
  onNextRound?: (selectedCompetitorIds: number[]) => void;
}

export default function ResultadosFinales({
  isOpen,
  onClose,
  competidores,
  previousRounds,
  numJudges,
  categoria,
  area,
  currentRound,
  roundFormat,
  onExportExcel,
  onExportPDF,
  onStartTieBreaker,
  onNextRound,
}: ResultadosFinalesProps) {
  const roundStructure = getRoundStructure(roundFormat, currentRound);
  const finalResults = buildKataFinalResults(
    previousRounds,
    competidores,
    roundStructure.countsForFinal,
  );
  const useAccumulatedResults = previousRounds.length > 0;
  const competidoresConMetricas = competidores
    .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
    .map((c) => ({
      competidor: c,
      metrics: calculateKataMetrics((c.PuntajesJueces || []).map((p) => p || '0'), numJudges),
    }));

  const competidoresEvaluados = competidoresConMetricas
    .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
    .map((wrapper) => wrapper.competidor);
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<number[]>([]);

  const competidoresDescalificados = competidores.filter((c) => c.Kiken);
  const competidoresNoEvaluados = competidores.filter(
    (c) => c.PuntajeFinal === null && !c.Kiken,
  );

  const showNextRoundButton = roundStructure.nextRoundCutoff !== null;
  const selectedCompetitors = useMemo(
    () => competidoresEvaluados.filter((competidor) => selectedCompetitorIds.includes(competidor.id)),
    [competidoresEvaluados, selectedCompetitorIds],
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCompetitorIds([]);
  }, [isOpen, competidores]);

  const checkForCutoffTie = (): boolean => {
    if (
      !roundStructure.nextRoundCutoff ||
      competidoresEvaluados.length <= roundStructure.nextRoundCutoff
    ) {
      return false;
    }

    const cutoffIndex = roundStructure.nextRoundCutoff - 1;
    const lastInIndex = cutoffIndex;
    const firstOutIndex = cutoffIndex + 1;

    if (!competidoresEvaluados[lastInIndex] || !competidoresEvaluados[firstOutIndex]) {
      return false;
    }

    const metricsIn = competidoresConMetricas.find(
      (c) => c.competidor.id === competidoresEvaluados[lastInIndex].id,
    )!.metrics;
    const metricsOut = competidoresConMetricas.find(
      (c) => c.competidor.id === competidoresEvaluados[firstOutIndex].id,
    )!.metrics;

    return compareCompetitors(metricsIn, metricsOut) === 0;
  };

  const isCutoffTied = checkForCutoffTie();

  const checkForTies = () => {
    if (competidoresEvaluados.length < 2) return null;

    const tiedGroups: Competidor[][] = [];
    let currentGroup: Competidor[] = [competidoresEvaluados[0]];

    for (let i = 1; i < competidoresEvaluados.length; i++) {
      const prev = competidoresConMetricas.find(
        (c) => c.competidor.id === currentGroup[0].id,
      )!.metrics;
      const curr = competidoresConMetricas.find(
        (c) => c.competidor.id === competidoresEvaluados[i].id,
      )!.metrics;

      if (compareCompetitors({ ...prev }, { ...curr }) === 0) {
        currentGroup.push(competidoresEvaluados[i]);
      } else {
        if (currentGroup.length > 1) tiedGroups.push([...currentGroup]);
        currentGroup = [competidoresEvaluados[i]];
      }
    }

    if (currentGroup.length > 1) tiedGroups.push([...currentGroup]);
    return tiedGroups.length > 0 ? tiedGroups[0] : null;
  };

  const tieGroup = checkForTies();
  const blockingTie = isCutoffTied
    ? {
        type: 'cutoff',
        title: 'Empate crítico',
        message: `Empate en el puesto ${roundStructure.nextRoundCutoff}.`,
      }
    : tieGroup
      ? {
          type: 'medal',
          title: 'Empate detectado',
          message: 'Empate en medallas detectado.',
        }
      : null;

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  const getPodiumCardClass = (position: number) => {
    if (position === 1) {
      return 'border border-amber-300/30 bg-[linear-gradient(180deg,rgba(255,210,76,0.22)_0%,rgba(92,61,8,0.48)_100%)]';
    }
    if (position === 2) {
      return 'border border-slate-300/20 bg-[linear-gradient(180deg,rgba(203,213,225,0.18)_0%,rgba(51,65,85,0.5)_100%)]';
    }
    return 'border border-orange-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,0.18)_0%,rgba(95,45,12,0.5)_100%)]';
  };

  const getFinalPositionBadge = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position.toString();
  };

  const handleToggleCompetitor = (competidorId: number) => {
    setSelectedCompetitorIds((current) =>
      current.includes(competidorId)
        ? current.filter((id) => id !== competidorId)
        : [...current, competidorId],
    );
  };

  const topThree = useAccumulatedResults ? finalResults.slice(0, 3) : competidoresEvaluados.slice(0, 3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{ backdrop: 'bg-slate-950/70' }}
    >
      <ModalContent className="app-panel max-h-[92vh] overflow-hidden rounded-[1.75rem] text-slate-100">
        <ModalHeader className="border-b border-[rgba(80,125,196,0.16)] px-7 py-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Resultados</h2>
            <p className="mt-1 text-sm text-slate-400">
              Resumen de ranking, podio y estado general de la ronda actual.
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="px-0 py-0">
          <div className="grid min-h-0 grid-cols-1 md:grid-cols-[280px_1fr]">
            <aside className="border-b border-[rgba(80,125,196,0.12)] px-7 py-6 md:border-b-0 md:border-r">
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="space-y-2">
                    {categoria && (
                      <Chip size="sm" className="border border-fuchsia-400/20 bg-fuchsia-500/15 text-fuchsia-100">
                        {categoria}
                      </Chip>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {area && (
                        <Chip size="sm" className="border border-sky-400/20 bg-sky-500/15 text-sky-100">
                          Área {area}
                        </Chip>
                      )}
                      <Chip size="sm" className="border border-slate-300/10 bg-slate-200/10 text-slate-200">
                        {competidores.length} competidores
                      </Chip>
                    </div>
                  </div>
                </div>

                {blockingTie && (
                  <Card className="rounded-[1.5rem] border border-amber-300/20 bg-[rgba(17,32,55,0.72)]">
                    <CardBody className="space-y-3 p-5">
                      <div>
                        <h3 className="text-xl font-black text-amber-100">{blockingTie.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{blockingTie.message}</p>
                      </div>
                      {tieGroup && (
                        <div className="flex flex-wrap gap-2">
                          {tieGroup.map((c) => (
                            <Chip
                              key={c.id}
                              size="sm"
                              className="border border-white/10 bg-white/8 text-slate-100"
                            >
                              {c.Nombre}
                            </Chip>
                          ))}
                        </div>
                      )}
                      {onStartTieBreaker && (
                        <Button
                          className="w-full bg-amber-400 font-semibold text-slate-950"
                          onPress={() => onStartTieBreaker(tieGroup ? tieGroup.map((c) => c.id) : [])}
                        >
                          Generar desempate
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                )}

                {showNextRoundButton && competidoresEvaluados.length > 0 && (
                  <Card className="rounded-[1.5rem] border border-sky-400/20 bg-[rgba(9,38,76,0.74)]">
                    <CardBody className="space-y-4 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-sky-300/80">
                          Siguiente ronda
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-white">{roundStructure.label}</h3>
                        <p className="mt-2 text-sm text-slate-300">
                          {selectedCompetitorIds.length} seleccionados
                        </p>
                      </div>
                      {selectedCompetitors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedCompetitors.map((competidor) => (
                            <Chip
                              key={competidor.id}
                              size="sm"
                              className="border border-emerald-400/20 bg-emerald-500/15 text-emerald-100"
                            >
                              {competidor.Nombre}
                            </Chip>
                          ))}
                        </div>
                      )}
                      {onNextRound && (
                        <Button
                          className="app-button-primary w-full"
                          onPress={() => onNextRound(selectedCompetitorIds)}
                          isDisabled={selectedCompetitorIds.length === 0}
                        >
                          Confirmar
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                )}

                <Card className="rounded-[1.5rem] border border-white/8 bg-[rgba(12,24,43,0.42)]">
                  <CardBody className="space-y-4 p-5">
                    <h3 className="text-lg font-black text-slate-100">Exportar resultados</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {onExportExcel && (
                        <Button
                          className="app-button-secondary"
                          variant="bordered"
                          onPress={onExportExcel}
                          isDisabled={competidores.length === 0}
                        >
                          Exportar Excel
                        </Button>
                      )}
                      {onExportPDF && (
                        <Button
                          className="app-button-secondary"
                          variant="bordered"
                          onPress={onExportPDF}
                          isDisabled={competidores.length === 0}
                        >
                          Exportar PDF
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </aside>

            <section className="min-h-0 px-7 py-6">
              <div className="space-y-7">
                {topThree.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-2xl font-black text-slate-50">
                        {useAccumulatedResults ? 'Podio final' : 'Podio'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                      {(useAccumulatedResults ? [1, 0, 2] : [1, 0, 2])
                        .filter((idx) => topThree[idx])
                        .map((podiumIndex, visualIndex) => {
                          const position = podiumIndex + 1;
                          const elevated = visualIndex === 1;

                          if (useAccumulatedResults) {
                            const competidor = finalResults[podiumIndex];
                            return (
                              <Card
                                key={competidor.competitorUid}
                                className={`rounded-[1.5rem] ${getPodiumCardClass(position)} ${
                                  elevated ? 'xl:-translate-y-2' : ''
                                }`}
                              >
                                <CardBody className="py-6 text-center">
                                  <div className="mb-3 text-6xl">{getMedalEmoji(position)}</div>
                                  <p className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
                                    {position}°
                                  </p>
                                  <p className="mt-2 text-2xl font-black text-white">{competidor.nombre}</p>
                                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/80">
                                    <span>{competidor.round1Score?.toFixed(2)}</span>
                                    <span>+</span>
                                    <span>{competidor.round2Score?.toFixed(2)}</span>
                                  </div>
                                  <p className="mt-2 text-4xl font-black text-white">
                                    {competidor.total.toFixed(2)}
                                  </p>
                                </CardBody>
                              </Card>
                            );
                          }

                          const competidor = competidoresEvaluados[podiumIndex];
                          return (
                            <Card
                              key={competidor.id}
                              className={`rounded-[1.5rem] ${getPodiumCardClass(position)} ${
                                elevated ? 'xl:-translate-y-2' : ''
                              }`}
                            >
                              <CardBody className="py-6 text-center">
                                <div className="mb-3 text-6xl">{getMedalEmoji(position)}</div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
                                  {position}°
                                </p>
                                <p className="mt-2 text-2xl font-black text-white">{competidor.Nombre}</p>
                                <p className="mt-2 text-4xl font-black text-white">
                                  {competidor.PuntajeFinal?.toFixed(2)}
                                </p>
                              </CardBody>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}

                {useAccumulatedResults && finalResults.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-50">Ranking final</h3>
                        <p className="mt-1 text-sm text-slate-400">Suma de Sentei/Tokui + Tokui</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {finalResults.map((competidor, index) => (
                        <Card key={competidor.competitorUid} className="app-list-row rounded-[1.5rem]">
                          <CardBody className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl font-black text-white">
                                  {getFinalPositionBadge(index + 1)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xl font-bold text-slate-50">
                                    {competidor.nombre}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Chip
                                      size="sm"
                                      className="border border-sky-400/14 bg-sky-500/10 text-sky-100"
                                    >
                                      Sentei/Tokui: {competidor.round1Score?.toFixed(2)}
                                    </Chip>
                                    <Chip
                                      size="sm"
                                      className="border border-fuchsia-400/14 bg-fuchsia-500/10 text-fuchsia-100"
                                    >
                                      Tokui: {competidor.round2Score?.toFixed(2)}
                                    </Chip>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
                                <p className="text-3xl font-black text-emerald-400">
                                  {competidor.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {!useAccumulatedResults && competidoresEvaluados.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-50">Ranking completo</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Total &gt; Min incluido &gt; Max incluido
                        </p>
                      </div>
                      {showNextRoundButton && (
                        <p className="text-sm font-semibold text-sky-100">
                          {selectedCompetitorIds.length} seleccionados
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {competidoresEvaluados.map((competidor, index) => {
                        const metrics = competidoresConMetricas.find(
                          (c) => c.competidor.id === competidor.id,
                        )?.metrics;

                        return (
                          <Card
                            key={competidor.id}
                            className={`rounded-[1.5rem] ${
                              selectedCompetitorIds.includes(competidor.id)
                                ? 'border border-emerald-400/40 bg-emerald-500/10'
                                : 'app-list-row'
                            }`}
                          >
                            <CardBody className="py-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-4">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl font-black text-white">
                                    {getMedalEmoji(index + 1) || index + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-xl font-bold text-slate-50">
                                      {competidor.Nombre}
                                    </p>
                                    <p className="text-sm text-slate-400">Edad: {competidor.Edad}</p>
                                    {competidor.PuntajesJueces && competidor.PuntajesJueces.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {competidor.PuntajesJueces.map(
                                          (puntaje, idx) =>
                                            puntaje && (
                                              <Chip
                                                key={idx}
                                                size="sm"
                                                className="border border-sky-400/14 bg-sky-500/10 text-sky-100"
                                              >
                                                J{idx + 1}: {puntaje}
                                              </Chip>
                                            ),
                                        )}
                                        {metrics && (
                                          <>
                                            <Chip
                                              size="sm"
                                              className="border border-slate-300/10 bg-slate-200/10 text-slate-300"
                                            >
                                              Min: {metrics.minTotal?.toFixed(1) || '-'}
                                            </Chip>
                                            <Chip
                                              size="sm"
                                              className="border border-slate-300/10 bg-slate-200/10 text-slate-300"
                                            >
                                              Max: {metrics.maxTotal?.toFixed(1) || '-'}
                                            </Chip>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                  {showNextRoundButton && (
                                    <Button
                                      size="sm"
                                      variant={
                                        selectedCompetitorIds.includes(competidor.id) ? 'solid' : 'bordered'
                                      }
                                      className={
                                        selectedCompetitorIds.includes(competidor.id)
                                          ? 'bg-emerald-400 font-semibold text-slate-950'
                                          : 'border border-emerald-400/30 text-emerald-200'
                                      }
                                      onPress={() => handleToggleCompetitor(competidor.id)}
                                    >
                                      {selectedCompetitorIds.includes(competidor.id)
                                        ? 'Seleccionado'
                                        : 'Seleccionar'}
                                    </Button>
                                  )}
                                  <div className="text-right">
                                    <p className="text-3xl font-black text-emerald-400">
                                      {competidor.PuntajeFinal?.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {competidoresNoEvaluados.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-black text-slate-50">No evaluados</h3>
                    <div className="space-y-3">
                      {competidoresNoEvaluados.map((competidor) => (
                        <Card key={competidor.id} className="app-list-row rounded-[1.5rem]">
                          <CardBody className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-lg font-bold text-slate-100">{competidor.Nombre}</p>
                                <p className="text-sm text-slate-400">Edad: {competidor.Edad}</p>
                              </div>
                              <Chip
                                size="sm"
                                className="border border-slate-300/10 bg-slate-200/10 text-slate-200"
                              >
                                Sin evaluar
                              </Chip>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {competidoresDescalificados.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-black text-slate-50">Descalificados</h3>
                    <div className="space-y-3">
                      {competidoresDescalificados.map((competidor) => (
                        <Card
                          key={competidor.id}
                          className="rounded-[1.5rem] border border-rose-400/18 bg-rose-500/10"
                        >
                          <CardBody className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-lg font-bold text-slate-100">{competidor.Nombre}</p>
                                <p className="text-sm text-slate-300/80">Edad: {competidor.Edad}</p>
                              </div>
                              <Chip
                                size="sm"
                                className="border border-rose-300/20 bg-rose-500/15 text-rose-100"
                              >
                                Kiken
                              </Chip>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {competidoresEvaluados.length === 0 &&
                  competidoresNoEvaluados.length === 0 &&
                  competidoresDescalificados.length === 0 && (
                    <div className="app-empty-state min-h-0 py-16">
                      <div className="mb-4 text-6xl">🥋</div>
                      <p className="text-xl font-black text-slate-200">No hay resultados para mostrar</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Agrega competidores y evalúalos para ver los resultados.
                      </p>
                    </div>
                  )}
              </div>
            </section>
          </div>
        </ModalBody>

        <ModalFooter className="justify-end border-t border-[rgba(80,125,196,0.16)] px-7 py-5">
          <Button className="app-button-primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
