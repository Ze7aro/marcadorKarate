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
  Chip,
  Divider,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { BracketState, Match } from '@/types/events';
import { getRoundName } from '@/utils/bracketUtils';

interface BracketViewProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: BracketState;
  onSelectMatch: (matchId: number) => void;
}

export default function BracketView({ isOpen, onClose, bracket, onSelectMatch }: BracketViewProps) {
  const { t } = useTranslation(['kumite', 'common']);

  // Organizar matches por ronda
  const matchesByRound = useMemo(() => {
    const rounds: Map<number, Match[]> = new Map();
    bracket.matches.forEach((match) => {
      const roundMatches = rounds.get(match.round) || [];
      roundMatches.push(match);
      rounds.set(match.round, roundMatches);
    });
    return rounds;
  }, [bracket.matches]);

  const getMatchStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getWinnerName = (match: Match): string | null => {
    if (!match.winnerId) return null;
    if (match.competidorAka?.id === match.winnerId) return match.competidorAka.Nombre;
    if (match.competidorShiro?.id === match.winnerId) return match.competidorShiro.Nombre;
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{t('kumite:bracket.title')}</h2>
          <p className="text-sm text-gray-500">
            {bracket.totalCompetitors} {t('kumite:competitor.total').toLowerCase()} -{' '}
            {bracket.rounds} {t('kumite:bracket.round').toLowerCase()}s
          </p>
        </ModalHeader>
        <Divider />
        <ModalBody>
          <div className="space-y-6">
            {Array.from(matchesByRound.entries())
              .sort(([a], [b]) => a - b)
              .map(([roundNum, matches]) => (
                <div key={roundNum} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {getRoundName(roundNum, bracket.rounds)}
                    </h3>
                    <Chip size="sm" variant="flat">
                      {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matches
                      .sort((a, b) => a.position - b.position)
                      .map((match) => {
                        const winnerName = getWinnerName(match);
                        const isCurrentMatch = bracket.currentMatchId === match.id;

                        return (
                          <Card
                            key={match.id}
                            isPressable
                            onPress={() => onSelectMatch(match.id)}
                            className={`${isCurrentMatch ? 'ring-2 ring-primary' : ''
                              } hover:scale-105 transition-transform`}
                          >
                            <CardBody className="p-3">
                              <div className="space-y-2">
                                {/* Header con estado */}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    Match {match.position + 1}
                                  </span>
                                  <Chip
                                    size="sm"
                                    color={getMatchStatusColor(match.status)}
                                    variant="flat"
                                  >
                                    {match.status === 'pending' && t('kumite:bracket.pending')}
                                    {match.status === 'in_progress' &&
                                      t('kumite:bracket.inProgress')}
                                    {match.status === 'completed' && t('kumite:bracket.completed')}
                                  </Chip>
                                </div>

                                {/* Competidor Aka */}
                                <div
                                  className={`flex justify-between items-center p-2 rounded ${match.competidorAka?.id === match.winnerId
                                      ? 'bg-red-100 dark:bg-red-900/30 font-bold'
                                      : 'bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                    <span className="text-sm truncate max-w-[120px]">
                                      {match.competidorAka?.Nombre || 'TBD'}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold">{match.scoreAka}</span>
                                </div>

                                {/* Competidor Shiro */}
                                <div
                                  className={`flex justify-between items-center p-2 rounded ${match.competidorShiro?.id === match.winnerId
                                      ? 'bg-gray-200 dark:bg-gray-700 font-bold'
                                      : 'bg-gray-50 dark:bg-gray-800'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                                    <span className="text-sm truncate max-w-[120px]">
                                      {match.competidorShiro?.Nombre || 'TBD'}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold">{match.scoreShiro}</span>
                                </div>

                                {/* Ganador */}
                                {winnerName && (
                                  <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                                      {t('kumite:results.winner')}: <strong>{winnerName}</strong>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            {t('common:buttons.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
