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

  // Obtener ganador del torneo (1er lugar)
  const winner = useMemo(() => getTournamentWinner(bracket), [bracket]);

  // Obtener subcampeón (perdedor de la final)
  const runnerUp = useMemo(() => {
    const finalMatch = bracket.matches.find(
      (m) => m.round === bracket.rounds && m.status === 'completed'
    );
    if (!finalMatch || !finalMatch.winnerId) return null;

    return finalMatch.competidorAka?.id === finalMatch.winnerId
      ? finalMatch.competidorShiro
      : finalMatch.competidorAka;
  }, [bracket]);

  // Obtener terceros lugares (perdedores de semifinales)
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

  // Matches completados para historial
  const completedMatches = useMemo(() => {
    return bracket.matches
      .filter((m) => m.status === 'completed')
      .sort((a, b) => {
        // Ordenar por ronda primero, luego por posición
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{t('kumite:results.finalResults')}</h2>
          <div className="text-sm text-gray-500">
            {categoria && <span>{categoria} - </span>}
            {area && <span>{t('kumite:config.area')} {area}</span>}
          </div>
        </ModalHeader>
        <Divider />
        <ModalBody>
          <div className="space-y-6">
            {/* Podio */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('kumite:results.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1er Lugar */}
                {winner && (
                  <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30">
                    <CardBody className="text-center p-6">
                      <div className="text-6xl mb-2">🥇</div>
                      <h4 className="text-lg font-bold mb-1">{t('kumite:results.winner')}</h4>
                      <p className="text-2xl font-bold">{winner.Nombre}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {winner.Edad} {t('kumite:competitor.age').toLowerCase()}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* 2do Lugar */}
                {runnerUp && (
                  <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50">
                    <CardBody className="text-center p-6">
                      <div className="text-6xl mb-2">🥈</div>
                      <h4 className="text-lg font-bold mb-1">{t('kumite:results.runnerUp')}</h4>
                      <p className="text-2xl font-bold">{runnerUp.Nombre}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {runnerUp.Edad} {t('kumite:competitor.age').toLowerCase()}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* 3er Lugar */}
                {thirdPlace.length > 0 && (
                  <Card className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30">
                    <CardBody className="text-center p-6">
                      <div className="text-6xl mb-2">🥉</div>
                      <h4 className="text-lg font-bold mb-1">{t('kumite:results.thirdPlace')}</h4>
                      {thirdPlace.map((competitor, idx) => (
                        <div key={competitor.id}>
                          <p className="text-xl font-bold">{competitor.Nombre}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {competitor.Edad} {t('kumite:competitor.age').toLowerCase()}
                          </p>
                          {idx < thirdPlace.length - 1 && <Divider className="my-2" />}
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>

            <Divider />

            {/* Historial de Matches */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('kumite:results.matchHistory')}</h3>
              <Table aria-label="Match history table">
                <TableHeader>
                  <TableColumn>{t('kumite:bracket.round')}</TableColumn>
                  <TableColumn>Match</TableColumn>
                  <TableColumn>{t('kumite:competitor.aka')}</TableColumn>
                  <TableColumn>{t('kumite:match.score')}</TableColumn>
                  <TableColumn>{t('kumite:competitor.shiro')}</TableColumn>
                  <TableColumn>{t('kumite:results.winner')}</TableColumn>
                </TableHeader>
                <TableBody>
                  {completedMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{getRoundName(match.round, bracket.rounds)}</TableCell>
                      <TableCell>{match.position + 1}</TableCell>
                      <TableCell>
                        <span
                          className={
                            match.competidorAka?.id === match.winnerId ? 'font-bold' : ''
                          }
                        >
                          {match.competidorAka?.Nombre || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {match.scoreAka} - {match.scoreShiro}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={match.competidorShiro?.id === match.winnerId ? 'font-bold' : ''}
                        >
                          {match.competidorShiro?.Nombre || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-success">{getWinnerName(match)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ModalBody>
        <Divider />
        <ModalFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button color="secondary" variant="flat" isDisabled>
              {t('kumite:actions.exportPDF')}
            </Button>
            <Button color="secondary" variant="flat" isDisabled>
              {t('kumite:actions.exportExcel')}
            </Button>
          </div>
          <Button color="primary" onPress={onClose}>
            {t('common:buttons.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
