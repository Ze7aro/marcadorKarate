import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { ScoreControl } from "./KumiteScoreControls";
import type { PenaltyType, WarningType } from "@/types/events";

const ATENAI_ORDER: PenaltyType[] = [
  "atenai",
  "atenai_chui",
  "atenai_hansoku",
];

const KINSHI_ORDER: WarningType[] = [
  "kinshi",
  "kinshi_ni",
  "kinshi_chui",
  "kinshi_hansoku",
];

type Props = {
  currentMatch: any;
  isMatchCompleted: boolean | undefined;
  isTimeExpired: boolean;
  isAtoshiBaraku: boolean;
  formattedTime: string;
  isRunning: boolean;
  handleStartPauseTimer: () => void;
  handleResetTimer: () => void;
  swapSides: () => void;
  addScore: (side: "aka" | "shiro", points: number) => void;
  removeScore: (side: "aka" | "shiro", points: number) => void;
  addPenalty: (side: "aka" | "shiro", penalty: any) => void;
  addWarning: (side: "aka" | "shiro", warning: any) => void;
  removePenalty: (side: "aka" | "shiro", index: number) => void;
  removeWarning: (side: "aka" | "shiro", index: number) => void;
  declareWinner: (id: number, reason?: "disqualification" | "hantei" | null) => void;
  resolveMatch: () => void;
  infractionButtonClass: string;
  winnerButtonClass: string;
};

export default function KumiteMatchPanel(props: Props) {
  const { t } = useTranslation(["kumite"]);
  const { currentMatch, isMatchCompleted, isTimeExpired, isAtoshiBaraku, formattedTime, isRunning, handleStartPauseTimer, handleResetTimer, swapSides, addScore, removeScore, addPenalty, addWarning, removePenalty, removeWarning, declareWinner, resolveMatch, infractionButtonClass, winnerButtonClass } = props;

  const getPenaltyDisabled = (
    penalties: PenaltyType[] | undefined,
    penalty: PenaltyType,
  ) => {
    const activeIndex = ATENAI_ORDER.reduce(
      (max, item, index) => (penalties?.includes(item) ? index : max),
      -1,
    );
    const penaltyIndex = ATENAI_ORDER.indexOf(penalty);

    return (
      currentMatch.status === "completed" ||
      penalties?.includes(penalty) ||
      (activeIndex >= 1 && penaltyIndex < activeIndex)
    );
  };

  const getWarningDisabled = (
    warnings: WarningType[] | undefined,
    warning: WarningType,
  ) => {
    const activeIndex = KINSHI_ORDER.reduce(
      (max, item, index) => (warnings?.includes(item) ? index : max),
      -1,
    );
    const warningIndex = KINSHI_ORDER.indexOf(warning);

    return (
      !!isMatchCompleted ||
      warnings?.includes(warning) ||
      (activeIndex >= 2 && warningIndex < activeIndex)
    );
  };

  return (
          <Card className="app-panel rounded-[1rem] lg:h-full">
            {
}
            <Divider className="app-subtle-divider" />
            <CardBody className="flex min-h-0 flex-col">
              {!currentMatch ? (
                <div className="app-empty-state my-8 flex-1">
                  <p className="text-slate-200 mb-2">
                    {t("kumite:messages.noCompetitors")}
                  </p>
                  <p className="text-sm text-slate-400">
                    Agrega competidores y genera el bracket para comenzar
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  {
}
                  <div className="mb-2 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-around">
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold ${
                          isTimeExpired
                            ? "text-rose-400"
                            : isAtoshiBaraku
                              ? "animate-pulse text-amber-300"
                              : "text-white"
                        }`}
                      >
                        {formattedTime}
                      </div>
                      {isAtoshiBaraku && (
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                          Atoshi Baraku
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 items-center">
                      <Button
                        color={isRunning ? "warning" : "success"}
                        onPress={handleStartPauseTimer}
                        isDisabled={isMatchCompleted || isTimeExpired}
                      >
                        {isRunning
                          ? t("kumite:match.pause")
                          : t("kumite:match.start")}
                      </Button>
                      <Button color="primary" onPress={resolveMatch}>
                        Dar resultado
                      </Button>
                      <Button variant="flat" onPress={handleResetTimer}>
                        {t("kumite:match.reset")}
                      </Button>
                      <Button
                        color={"danger"}
                        variant="bordered"
                        onPress={swapSides}
                        isDisabled={
                          !!isMatchCompleted ||
                          !currentMatch.competidorAka ||
                          !currentMatch.competidorShiro
                        }
                      >
                        Cambiar
                      </Button>
                    </div>
                    {isTimeExpired && !isMatchCompleted && (
                      <p className="mt-3 text-center text-sm text-amber-300">
                        Tiempo cumplido. Resolvé el combate manualmente.
                      </p>
                    )}
                  </div>

                  {
}

                  {
}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {
}
                    <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.5)] border border-slate-400/20">
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-3 text-center">
                          <Chip className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white">
                            {t("kumite:competitor.shiro")}
                          </Chip>
                          <h3 className="text-xl font-bold">
                            {currentMatch.competidorShiro?.Nombre || "BYE"}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center text-4xl font-bold my-4">
                          <p>{currentMatch.scoreShiro}</p>
                        </div>
                        {
}
                      </div>

                      {currentMatch.competidorShiro && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <ScoreControl
                              label={t("kumite:actions.wazari")}
                              points={0.5}
                              onAdd={() => addScore("shiro", 0.5)}
                              onRemove={() => removeScore("shiro", 0.5)}
                              disabled={!!isMatchCompleted}
                              currentMatch={currentMatch}
                              side="shiro"
                              markerType="wazari"
                            />
                            <ScoreControl
                              label={t("kumite:actions.ippon")}
                              points={1}
                              onAdd={() => addScore("shiro", 1)}
                              onRemove={() => removeScore("shiro", 1)}
                              disabled={!!isMatchCompleted}
                              currentMatch={currentMatch}
                              side="shiro"
                              markerType="ippon"
                            />
                          </div>

                          {
}

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-black uppercase">
                              {t("kumite:penalties.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesShiro || []).map(
                                (p: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    onClose={
                                      isMatchCompleted
                                        ? undefined
                                        : () =>
                                            removePenalty("shiro", idx)
                                    }
                                  >
                                    {t(`kumite:penalties.${p}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <p className="text-xs font-semibold text-black uppercase mt-2">
                              {t("kumite:warnings.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsShiro || []).map(
                                (w: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    onClose={
                                      isMatchCompleted
                                        ? undefined
                                        : () =>
                                            removeWarning("shiro", idx)
                                    }
                                  >
                                    {t(`kumite:warnings.${w}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {ATENAI_ORDER.map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => addPenalty("shiro", p)}
                                  isDisabled={getPenaltyDisabled(
                                    currentMatch.penaltiesShiro,
                                    p,
                                  )}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {KINSHI_ORDER.map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => addWarning("shiro", w)}
                                  isDisabled={getWarningDisabled(
                                    currentMatch.warningsShiro,
                                    w,
                                  )}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {
}

                          <Button
                            size="sm"
                            variant="bordered"
                            className={`border border-grey-400/55 ${winnerButtonClass}`}
                            fullWidth
                            onPress={() =>
                              declareWinner(
                                currentMatch.competidorShiro!.id,
                              )
                            }
                            isDisabled={!!isMatchCompleted}
                          >
                            {t("kumite:actions.declareWinner")}
                          </Button>
                        </div>
                      )}
                    </div>

                    {
}
                    <div className="rounded-2xl p-4 bg-[rgba(93,22,37,0.48)] border border-rose-500/25">
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-3 text-center">
                          <Chip color="danger" className="text-white">
                            {t("kumite:competitor.aka")}
                          </Chip>
                          <h3 className="text-xl font-bold text-white">
                            {currentMatch.competidorAka?.Nombre || "BYE"}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center text-4xl font-bold my-4 text-white">
                          <p>{currentMatch.scoreAka}</p>
                        </div>
                        {
}
                      </div>

                      {currentMatch.competidorAka && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <ScoreControl
                              label={t("kumite:actions.wazari")}
                              points={0.5}
                              onAdd={() => addScore("aka", 0.5)}
                              onRemove={() => removeScore("aka", 0.5)}
                              disabled={!!isMatchCompleted}
                              currentMatch={currentMatch}
                              side="aka"
                              markerType="wazari"
                            />
                            <ScoreControl
                              label={t("kumite:actions.ippon")}
                              points={1}
                              onAdd={() => addScore("aka", 1)}
                              onRemove={() => removeScore("aka", 1)}
                              disabled={!!isMatchCompleted}
                              currentMatch={currentMatch}
                              side="aka"
                              markerType="ippon"
                            />
                          </div>

                          {
}

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              {t("kumite:penalties.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesAka || []).map(
                                (p: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    onClose={
                                      isMatchCompleted
                                        ? undefined
                                        : () => removePenalty("aka", idx)
                                    }
                                  >
                                    {t(`kumite:penalties.${p}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mt-2">
                              {t("kumite:warnings.title")}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsAka || []).map(
                                (w: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    onClose={
                                      isMatchCompleted
                                        ? undefined
                                        : () => removeWarning("aka", idx)
                                    }
                                  >
                                    {t(`kumite:warnings.${w}`)}
                                  </Chip>
                                ),
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {ATENAI_ORDER.map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => addPenalty("aka", p)}
                                  isDisabled={getPenaltyDisabled(
                                    currentMatch.penaltiesAka,
                                    p,
                                  )}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {KINSHI_ORDER.map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="bordered"
                                  className={infractionButtonClass}
                                  onPress={() => addWarning("aka", w)}
                                  isDisabled={getWarningDisabled(
                                    currentMatch.warningsAka,
                                    w,
                                  )}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {
}

                          <Button
                            size="sm"
                            variant="bordered"
                            className={`border border-rose-400/55 ${winnerButtonClass}`}
                            fullWidth
                            onPress={() =>
                              declareWinner(
                                currentMatch.competidorAka!.id,
                              )
                            }
                            isDisabled={!!isMatchCompleted}
                          >
                            {t("kumite:actions.declareWinner")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {
}
                  {
}
                </div>
              )}
            </CardBody>
          </Card>

  );
}
