import { useMemo } from "react";
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
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { BracketState, Match } from "@/types/events";
import { getRoundName } from "@/utils/bracketUtils";

interface BracketViewProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: BracketState;
  onSelectMatch: (matchId: number) => void;
}

export default function BracketView({
  isOpen,
  onClose,
  bracket,
  onSelectMatch,
}: BracketViewProps) {
  const { t } = useTranslation(["kumite", "common"]);

  const matchesByRound = useMemo(() => {
    const rounds: Map<number, Match[]> = new Map();
    bracket.matches.forEach((match) => {
      const roundMatches = rounds.get(match.round) || [];
      roundMatches.push(match);
      rounds.set(match.round, roundMatches);
    });
    return rounds;
  }, [bracket.matches]);

  const getStatusLabel = (status: Match["status"]) => {
    if (status === "pending") return t("kumite:bracket.pending");
    if (status === "in_progress") return t("kumite:bracket.inProgress");
    return t("kumite:bracket.completed");
  };

  const getStatusClass = (status: Match["status"]) => {
    if (status === "completed") {
      return "border border-emerald-400/18 bg-emerald-500/10 text-emerald-100";
    }
    if (status === "in_progress") {
      return "border border-amber-300/18 bg-amber-500/10 text-amber-100";
    }
    return "border border-slate-300/10 bg-slate-200/10 text-slate-200";
  };

  const getWinnerName = (match: Match): string | null => {
    if (!match.winnerId) return null;
    if (match.competidorAka?.id === match.winnerId)
      return match.competidorAka.Nombre;
    if (match.competidorShiro?.id === match.winnerId)
      return match.competidorShiro.Nombre;
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        backdrop: "bg-slate-950/70",
      }}
    >
      <ModalContent className="app-panel max-h-[92vh] overflow-hidden rounded-[1.75rem] text-slate-100">
        <ModalHeader className="flex flex-col gap-3 border-b border-[rgba(80,125,196,0.16)] px-7 py-6">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {t("kumite:bracket.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {bracket.totalCompetitors}{" "}
              {t("kumite:competitor.total").toLowerCase()} · {bracket.rounds}{" "}
              {t("kumite:bracket.round").toLowerCase()}s
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="px-7 py-6">
          <div className="space-y-7">
            {Array.from(matchesByRound.entries())
              .sort(([a], [b]) => a - b)
              .map(([roundNum, matches]) => (
                <section key={roundNum} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-50">
                      {getRoundName(roundNum, bracket.rounds)}
                    </h3>
                    <Chip
                      size="sm"
                      className="border border-slate-300/10 bg-slate-200/10 text-slate-200"
                    >
                      {matches.length}{" "}
                      {matches.length === 1 ? "match" : "matches"}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {matches
                      .sort((a, b) => a.position - b.position)
                      .map((match) => {
                        const winnerName = getWinnerName(match);
                        const isCurrentMatch =
                          bracket.currentMatchId === match.id;
                        const akaIsWinner =
                          match.competidorAka?.id === match.winnerId;
                        const shiroIsWinner =
                          match.competidorShiro?.id === match.winnerId;

                        return (
                          <Card
                            key={match.id}
                            isPressable
                            onPress={() => onSelectMatch(match.id)}
                            className={`rounded-[1.5rem] border transition-transform duration-150 ${
                              isCurrentMatch
                                ? "border-sky-400/60 bg-sky-500/8 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
                                : "border-[rgba(80,125,196,0.14)] bg-[rgba(12,24,43,0.72)]"
                            } hover:-translate-y-0.5`}
                          >
                            <CardBody className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                      Match {match.position + 1}
                                    </p>
                                  </div>
                                  <Chip
                                    size="sm"
                                    className={getStatusClass(match.status)}
                                  >
                                    {getStatusLabel(match.status)}
                                  </Chip>
                                </div>

                                <div
                                  className={`flex items-center justify-between rounded-[1rem] border px-3 py-3 ${
                                    akaIsWinner
                                      ? "border-rose-400/25 bg-rose-500/14"
                                      : "border-white/6 bg-white/4"
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                                    <span
                                      className={`truncate text-sm ${
                                        akaIsWinner
                                          ? "font-bold text-white"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {match.competidorAka?.Nombre || "TBD"}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-100">
                                    {match.scoreAka}
                                  </span>
                                </div>

                                <div
                                  className={`flex items-center justify-between rounded-[1rem] border px-3 py-3 ${
                                    shiroIsWinner
                                      ? "border-slate-300/20 bg-slate-300/12"
                                      : "border-white/6 bg-white/4"
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-white" />
                                    <span
                                      className={`truncate text-sm ${
                                        shiroIsWinner
                                          ? "font-bold text-white"
                                          : "text-slate-200"
                                      }`}
                                    >
                                      {match.competidorShiro?.Nombre || "TBD"}
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-100">
                                    {match.scoreShiro}
                                  </span>
                                </div>

                                {winnerName && (
                                  <div className="rounded-[0.9rem] border border-emerald-400/16 bg-emerald-500/10 px-3 py-2">
                                    <p className="text-xs uppercase tracking-[0.14em] text-emerald-200/75">
                                      {t("kumite:results.winner")}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-emerald-100">
                                      {winnerName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                  </div>
                </section>
              ))}
          </div>
        </ModalBody>

        <ModalFooter className="justify-end border-t border-[rgba(80,125,196,0.16)] px-7 py-5">
          <Button className="app-button-primary" onPress={onClose}>
            {t("common:buttons.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
