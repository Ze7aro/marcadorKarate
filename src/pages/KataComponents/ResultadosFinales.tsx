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
  numJudges: number;
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
  numJudges,
  categoria,
  area,
  currentRound,
  initialCompetitorCount,
  onExportExcel,
  onExportPDF,
  onStartTieBreaker,
  onNextRound,
}: ResultadosFinalesProps) {
  const competidoresConMetricas = competidores
    .filter((c) => c.PuntajeFinal !== null && !c.Kiken)
    .map((c) => ({
      competidor: c,
      metrics: calculateKataMetrics((c.PuntajesJueces || []).map((p) => p || '0'), numJudges),
    }));

  const competidoresEvaluados = competidoresConMetricas
    .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
    .map((wrapper) => wrapper.competidor);

  const competidoresDescalificados = competidores.filter((c) => c.Kiken);
  const competidoresNoEvaluados = competidores.filter(
    (c) => c.PuntajeFinal === null && !c.Kiken
  );

  const roundStructure = getRoundStructure(initialCompetitorCount, currentRound);
  const showNextRoundButton = roundStructure.nextRoundCutoff !== null;

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
      (c) => c.competidor.id === competidoresEvaluados[lastInIndex].id
    )!.metrics;
    const metricsOut = competidoresConMetricas.find(
      (c) => c.competidor.id === competidoresEvaluados[firstOutIndex].id
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
        (c) => c.competidor.id === currentGroup[0].id
      )!.metrics;
      const curr = competidoresConMetricas.find(
        (c) => c.competidor.id === competidoresEvaluados[i].id
      )!.metrics;

      if (
        compareCompetitors(
          { ...prev, total: prev.total },
          { ...curr, total: curr.total }
        ) === 0
      ) {
        currentGroup.push(competidoresEvaluados[i]);
      } else {
        if (currentGroup.length > 1) {
          tiedGroups.push([...currentGroup]);
        }
        currentGroup = [competidoresEvaluados[i]];
      }
    }

    if (currentGroup.length > 1) {
      tiedGroups.push([...currentGroup]);
    }

    return tiedGroups.length > 0 ? tiedGroups[0] : null;
  };

  const tieGroup = checkForTies();
  const blockingTie = isCutoffTied
    ? {
        type: 'cutoff',
        message: `Empate en el puesto ${roundStructure.nextRoundCutoff} (Corte). Se requiere desempate.`,
      }
    : tieGroup
      ? { type: 'medal', message: 'Empate en medallas detectado.' }
      : null;

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  const getPodiumCardClass = (position: number) => {
    if (position === 1) {
      return 'bg-[linear-gradient(180deg,rgba(255,210,76,0.3)_0%,rgba(92,61,8,0.72)_100%)] border border-amber-300/30';
    }
    if (position === 2) {
      return 'bg-[linear-gradient(180deg,rgba(203,213,225,0.22)_0%,rgba(51,65,85,0.72)_100%)] border border-slate-300/20';
    }
    return 'bg-[linear-gradient(180deg,rgba(251,146,60,0.24)_0%,rgba(95,45,12,0.72)_100%)] border border-orange-300/20';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        backdrop: 'bg-slate-950/70',
      }}
    >
      <ModalContent className="app-panel max-h-[92vh] overflow-hidden rounded-[1.75rem] text-slate-100">
        <ModalHeader className="flex flex-col gap-4 border-b border-[rgba(80,125,196,0.16)] px-7 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Resultados Finales
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Resumen de ranking, podio y estado general de la ronda actual.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {area && (
              <Chip size="sm" className="border border-sky-400/20 bg-sky-500/15 text-sky-100">
                Área {area}
              </Chip>
            )}
            {categoria && (
              <Chip size="sm" className="border border-fuchsia-400/20 bg-fuchsia-500/15 text-fuchsia-100">
                {categoria}
              </Chip>
            )}
            <Chip size="sm" className="border border-slate-300/10 bg-slate-200/10 text-slate-200">
              {competidores.length} Competidores
            </Chip>
          </div>

          {blockingTie && (
            <div
              className={`rounded-[1.1rem] border px-5 py-4 ${
                isCutoffTied
                  ? 'border-rose-400/25 bg-rose-500/12'
                  : 'border-amber-300/25 bg-amber-500/12'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3
                    className={`text-lg font-black ${
                      isCutoffTied ? 'text-rose-200' : 'text-amber-100'
                    }`}
                  >
                    {isCutoffTied ? 'Empate Crítico en Corte' : 'Empate Detectado'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">{blockingTie.message}</p>
                  {tieGroup && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
                {onStartTieBreaker && (
                  <Button
                    className="bg-amber-400 text-slate-950 font-semibold"
                    onPress={() => onStartTieBreaker(tieGroup ? tieGroup.map((c) => c.id) : [])}
                  >
                    Generar Desempate
                  </Button>
                )}
              </div>
            </div>
          )}

          {showNextRoundButton &&
            !isCutoffTied &&
            competidoresEvaluados.length >= (roundStructure.nextRoundCutoff || 0) && (
              <div className="rounded-[1.1rem] border border-sky-400/20 bg-sky-500/10 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-sky-100">
                      Siguiente Ronda: {roundStructure.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Clasifican los mejores {roundStructure.nextRoundCutoff} competidores.
                    </p>
                  </div>
                  {onNextRound && (
                    <Button
                      className="app-button-primary"
                      onPress={() =>
                        roundStructure.nextRoundCutoff &&
                        onNextRound(roundStructure.nextRoundCutoff)
                      }
                    >
                      Pasar de Ronda
                    </Button>
                  )}
                </div>
              </div>
            )}
        </ModalHeader>

        <ModalBody className="px-7 py-6">
          <div className="space-y-8">
            {competidoresEvaluados.length >= 3 && (
              <div>
                <h3 className="mb-5 text-xl font-black text-slate-50">Podio</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[1, 0, 2].map((podiumIndex, visualIndex) => {
                    const competidor = competidoresEvaluados[podiumIndex];
                    const position = podiumIndex + 1;
                    const elevated = visualIndex === 1;

                    return (
                      <Card
                        key={competidor.id}
                        className={`rounded-[1.5rem] ${getPodiumCardClass(position)} ${
                          elevated ? 'md:-translate-y-4' : ''
                        }`}
                      >
                        <CardBody className="py-7 text-center">
                          <div className="mb-3 text-6xl">{getMedalEmoji(position)}</div>
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                            {position}°
                          </p>
                          <p className="mt-2 text-2xl font-black text-white">
                            {competidor.Nombre}
                          </p>
                          <p className="mt-3 text-4xl font-black text-white">
                            {competidor.PuntajeFinal?.toFixed(2)}
                          </p>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
                <Divider className="app-subtle-divider my-8" />
              </div>
            )}

            {competidoresEvaluados.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-black text-slate-50">Ranking Completo</h3>
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    Total &gt; Min incluido &gt; Max incluido
                  </div>
                </div>

                <div className="space-y-3">
                  {competidoresEvaluados.map((competidor, index) => {
                    const metrics = competidoresConMetricas.find(
                      (c) => c.competidor.id === competidor.id
                    )?.metrics;

                    return (
                      <Card
                        key={competidor.id}
                        className="app-list-row rounded-[1.5rem]"
                      >
                        <CardBody className="py-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${
                                  index === 0
                                    ? 'bg-amber-400 text-slate-950'
                                    : index === 1
                                      ? 'bg-slate-300 text-slate-950'
                                      : index === 2
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-sky-500 text-white'
                                }`}
                              >
                                {getMedalEmoji(index + 1) || index + 1}
                              </div>
                              <div>
                                <p className="text-xl font-bold text-slate-50">
                                  {competidor.Nombre}
                                </p>
                                <p className="text-sm text-slate-400">Edad: {competidor.Edad}</p>
                                {competidor.PuntajesJueces && competidor.PuntajesJueces.length > 0 && (
                                  <div className="mt-2 flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-2">
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
                                          )
                                      )}
                                    </div>
                                    {metrics && (
                                      <div className="flex gap-3 text-xs uppercase tracking-[0.14em] text-slate-500">
                                        <span>Min: {metrics.minTotal?.toFixed(1) || '-'}</span>
                                        <span>Max: {metrics.maxTotal?.toFixed(1) || '-'}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-4xl font-black text-emerald-400">
                                {competidor.PuntajeFinal?.toFixed(2)}
                              </p>
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
                <Divider className="app-subtle-divider my-6" />
                <h3 className="mb-4 text-xl font-black text-slate-50">No Evaluados</h3>
                <div className="space-y-3">
                  {competidoresNoEvaluados.map((competidor) => (
                    <Card
                      key={competidor.id}
                      className="app-list-row rounded-[1.5rem]"
                    >
                      <CardBody className="py-5">
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
                <Divider className="app-subtle-divider my-6" />
                <h3 className="mb-4 text-xl font-black text-slate-50">Descalificados</h3>
                <div className="space-y-3">
                  {competidoresDescalificados.map((competidor) => (
                    <Card
                      key={competidor.id}
                      className="rounded-[1.5rem] border border-rose-400/18 bg-rose-500/10"
                    >
                      <CardBody className="py-5">
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
                  <p className="text-xl font-black text-slate-200">
                    No hay resultados para mostrar
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Agrega competidores y evalúalos para ver los resultados.
                  </p>
                </div>
              )}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between gap-4 border-t border-[rgba(80,125,196,0.16)] px-7 py-5">
          <div className="flex flex-wrap gap-3">
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
          <Button className="app-button-primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
