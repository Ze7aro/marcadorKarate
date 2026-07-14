import { useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { BracketState, CompetidorKumite } from '@/types/events';
import { getTournamentWinner, getRoundName } from '@/utils/bracketUtils';

interface ResultadosFinalesProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: BracketState;
  categoria: string;
  area: string;
}

export default function ResultadosFinales({
  isOpen,
  onClose,
  bracket,
  categoria,
  area,
}: ResultadosFinalesProps) {
  const { t } = useTranslation(['kumite', 'common']);

  const winner = useMemo(() => getTournamentWinner(bracket), [bracket]);

  const runnerUp = useMemo(() => {
    const finalMatch = bracket.matches.find(
      (m) => m.round === bracket.rounds && m.status === 'completed'
    );
    if (!finalMatch || !finalMatch.winnerId) return null;

    return finalMatch.competidorAka?.id === finalMatch.winnerId
      ? finalMatch.competidorShiro
      : finalMatch.competidorAka;
  }, [bracket]);

  const thirdPlace = useMemo(() => {
    if (bracket.rounds < 2) return [];

    const semiMatches = bracket.matches.filter(
      (m) => m.round === bracket.rounds - 1 && m.status === 'completed' && m.winnerId
    );

    const thirds: CompetidorKumite[] = [];
    semiMatches.forEach((match) => {
      const loser =
        match.competidorAka?.id === match.winnerId ? match.competidorShiro : match.competidorAka;
      if (loser) thirds.push(loser);
    });

    return thirds;
  }, [bracket]);

  const completedMatches = useMemo(() => {
    return bracket.matches
      .filter((m) => m.status === 'completed')
      .sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return a.position - b.position;
      });
  }, [bracket.matches]);

  const getWinnerName = (match: typeof completedMatches[0]): string => {
    if (!match.winnerId) return '-';
    if (match.competidorAka?.id === match.winnerId) return match.competidorAka.Nombre;
    if (match.competidorShiro?.id === match.winnerId) return match.competidorShiro?.Nombre || '-';
    return '-';
  };

  const getPodiumCardClass = (position: 1 | 2 | 3) => {
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
      classNames={{ backdrop: 'bg-slate-950/70' }}
    >
      <ModalContent className="app-panel max-h-[92vh] overflow-hidden rounded-[1.75rem] text-slate-100">
        <ModalHeader className="flex flex-col gap-4 border-b border-[rgba(80,125,196,0.16)] px-7 py-6">
          <div>
            <h2 className="text-3xl font-bold text-white">{t('kumite:results.finalResults')}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Resumen del podio y del historial completo de combates.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoria && (
              <Chip size="sm" className="border border-fuchsia-400/20 bg-fuchsia-500/15 text-fuchsia-100">
                {categoria}
              </Chip>
            )}
            {area && (
              <Chip size="sm" className="border border-sky-400/20 bg-sky-500/15 text-sky-100">
                {t('kumite:config.area')} {area}
              </Chip>
            )}
            <Chip size="sm" className="border border-slate-300/10 bg-slate-200/10 text-slate-200">
              {completedMatches.length} Matches
            </Chip>
          </div>
        </ModalHeader>

        <ModalBody className="px-7 py-6">
          <div className="space-y-8">
            <div>
              <h3 className="mb-5 text-xl font-black text-slate-50">{t('kumite:results.title')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {winner && (
                  <Card className={`rounded-[1.5rem] ${getPodiumCardClass(1)}`}>
                    <CardBody className="py-7 text-center">
                      <div className="mb-3 text-6xl">🥇</div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                        {t('kumite:results.winner')}
                      </h4>
                      <p className="mt-2 text-2xl font-black text-white">{winner.Nombre}</p>
                      <p className="mt-1 text-sm text-white/75">
                        {winner.Edad} {t('kumite:competitor.age').toLowerCase()}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {runnerUp && (
                  <Card className={`rounded-[1.5rem] ${getPodiumCardClass(2)}`}>
                    <CardBody className="py-7 text-center">
                      <div className="mb-3 text-6xl">🥈</div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                        {t('kumite:results.runnerUp')}
                      </h4>
                      <p className="mt-2 text-2xl font-black text-white">{runnerUp.Nombre}</p>
                      <p className="mt-1 text-sm text-white/75">
                        {runnerUp.Edad} {t('kumite:competitor.age').toLowerCase()}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {thirdPlace.length > 0 && (
                  <Card className={`rounded-[1.5rem] ${getPodiumCardClass(3)}`}>
                    <CardBody className="py-7 text-center">
                      <div className="mb-3 text-6xl">🥉</div>
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                        {t('kumite:results.thirdPlace')}
                      </h4>
                      {thirdPlace.map((competitor, idx) => (
                        <div key={competitor.id}>
                          <p className="mt-2 text-xl font-black text-white">{competitor.Nombre}</p>
                          <p className="mt-1 text-sm text-white/75">
                            {competitor.Edad} {t('kumite:competitor.age').toLowerCase()}
                          </p>
                          {idx < thirdPlace.length - 1 && (
                            <Divider className="app-subtle-divider my-3" />
                          )}
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>

            <Divider className="app-subtle-divider" />

            <div>
              <h3 className="mb-4 text-xl font-black text-slate-50">
                {t('kumite:results.matchHistory')}
              </h3>
              <div className="overflow-hidden rounded-[1.5rem] border border-[rgba(80,125,196,0.18)] bg-[rgba(12,24,43,0.72)]">
                <Table
                  aria-label="Match history table"
                  removeWrapper
                  classNames={{
                    th: 'bg-[rgba(20,37,63,0.9)] text-slate-300 uppercase text-[11px] tracking-[0.14em]',
                    td: 'text-slate-100',
                    tr: 'border-b border-[rgba(80,125,196,0.12)]',
                  }}
                >
                  <TableHeader>
                    <TableColumn>{t('kumite:bracket.round')}</TableColumn>
                    <TableColumn>Match</TableColumn>
                    <TableColumn>{t('kumite:competitor.aka')}</TableColumn>
                    <TableColumn>{t('kumite:match.score')}</TableColumn>
                    <TableColumn>{t('kumite:competitor.shiro')}</TableColumn>
                    <TableColumn>{t('kumite:results.winner')}</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="Sin combates finalizados">
                    {completedMatches.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>{getRoundName(match.round, bracket.rounds)}</TableCell>
                        <TableCell>{match.position + 1}</TableCell>
                        <TableCell>
                          <span className={match.competidorAka?.id === match.winnerId ? 'font-bold text-rose-300' : ''}>
                            {match.competidorAka?.Nombre || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-slate-200">
                            {match.scoreAka} - {match.scoreShiro}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={match.competidorShiro?.id === match.winnerId ? 'font-bold text-slate-50' : ''}>
                            {match.competidorShiro?.Nombre || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-emerald-400">{getWinnerName(match)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between gap-4 border-t border-[rgba(80,125,196,0.16)] px-7 py-5">
          <div className="flex gap-3">
            <Button className="app-button-secondary" variant="bordered" isDisabled>
              {t('kumite:actions.exportPDF')}
            </Button>
            <Button className="app-button-secondary" variant="bordered" isDisabled>
              {t('kumite:actions.exportExcel')}
            </Button>
          </div>
          <Button className="app-button-primary" onPress={onClose}>
            {t('common:buttons.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
