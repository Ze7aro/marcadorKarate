import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCrossPlatformChannel } from "@/hooks/useCrossPlatformChannel";
import {
  KumiteStateSync,
  KUMITE_EVENTS,
  PenaltyType,
  WarningType,
} from "@/types/events";
import { Card, CardBody } from "@heroui/react";
import WinnerModal from "./WinnerModal";
import "@/styles/projection.css";

function MarkerSymbols({
  count,
  total = 3,
  activeClass,
  inactiveClass,
}: {
  count: number;
  total?: number;
  activeClass: string;
  inactiveClass: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const active = index < count;
        return (
          active ? (
            <span
              key={index}
              aria-hidden="true"
              className={`projection-marker-symbol ${activeClass}`}
            >
              <span className="projection-marker-symbol__slash" />
            </span>
          ) : (
            <span
              key={index}
              aria-hidden="true"
              className={`h-5 w-5 rounded-full border-2 ${inactiveClass}`}
            />
          )
        );
      })}
    </div>
  );
}

function StatusChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 font-black uppercase tracking-[0.22em] projection-text-xs ${
        active
          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
          : "border-amber-400/40 bg-amber-500/10 text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

function CompetitorPanel({
  accentClass,
  bodyClass,
  chipClass,
  isLight,
  label,
  name,
  score,
  atenaiCount,
  warnings,
}: {
  accentClass: string;
  bodyClass: string;
  chipClass: string;
  isLight: boolean;
  label: string;
  name: string;
  score: number;
  penalties: PenaltyType[];
  atenaiCount: number;
  warnings: WarningType[];
  penaltyTitle: string;
  warningTitle: string;
  t: (key: string) => string;
}) {
  return (
    <Card
      className={`projection-panel relative h-full min-h-0 overflow-visible border-4 ${accentClass}`}
    >
      <CardBody
        className={`flex h-full min-h-0 flex-col gap-3 overflow-visible pt-12 ${bodyClass}`}
      >
        <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <span
            className={`inline-flex rounded-full rounded-t-none px-4 py-1.5 projection-text-md font-black tracking-[0.18em] ${chipClass}`}
          >
            {label}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center text-center">
          <h2
            className={`projection-text-xl w-full break-words leading-tight font-black ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            {name || "BYE"}
          </h2>
          <div
            className={`projection-text-score leading-none font-black ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            {score}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3">
          <div>
            <p
              className={`mb-2 text-center projection-text-md font-black uppercase tracking-[0.22em] ${
                isLight ? "text-gray-700/80" : "text-white/70"
              }`}
            >
              Kinshi
            </p>
            <MarkerSymbols
              count={Math.min(4, warnings.length)}
              total={4}
              activeClass={
                isLight
                  ? "border-red-700 bg-black/35"
                  : "border-red-700 bg-black/35"
              }
              inactiveClass={
                isLight
                  ? "border-red-400/35 bg-red-100/35"
                  : "border-red-200/25 bg-red-100/10"
              }
            />
          </div>
          <div>
            <p
              className={`mb-2 text-center projection-text-md font-black uppercase tracking-[0.22em] ${
                isLight ? "text-amber-800/80" : "text-amber-200/80"
              }`}
            >
              Atenai
            </p>
            <MarkerSymbols
              count={atenaiCount}
              activeClass={
                isLight
                  ? "border-red-700 bg-black/35"
                  : "border-red-700 bg-black/35"
              }
              inactiveClass={
                isLight
                  ? "border-red-700/20 bg-red-100/40"
                  : "border-red-200/25 bg-red-100/10"
              }
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function VentanaKumite() {
  const { t } = useTranslation(["kumite", "common"]);
  const [kumiteData, setKumiteData] = useState<KumiteStateSync | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useCrossPlatformChannel<KumiteStateSync>(KUMITE_EVENTS.SYNC_STATE, (data) => {
    setKumiteData(data);
    setIsConnected(true);
  });

  useEffect(() => {
    document.body.classList.add("projection-body", "projection-kumite");

    return () => {
      document.body.classList.remove("projection-body", "projection-kumite");
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isAtoshiBaraku =
    !!kumiteData &&
    kumiteData.timeRemaining > 0 &&
    kumiteData.timeRemaining <= 15;

  if (!kumiteData || !kumiteData.currentMatch) {
    return (
      <div className="projection-root bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="projection-shell flex items-center justify-center">
          <div className="projection-frame flex items-center justify-center">
            <div className="flex max-w-4xl flex-col items-center text-center">
              <div className="projection-text-hero mb-6 leading-none">
                KUMITE
              </div>
              <h1 className="projection-text-xl mb-3 font-black">
                {t("kumite:projection.title")}
              </h1>
              <p className="projection-text-md mb-6 text-gray-400">
                {t("kumite:projection.noMatch")}
              </p>
              <StatusChip
                active={isConnected}
                label={
                  isConnected
                    ? t("kumite:projection.connected")
                    : t("kumite:projection.connecting")
                }
              />
              <p className="projection-text-xs mt-5 text-gray-500">
                {t("kumite:projection.shortcuts")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projection-root bg-gradient-to-br from-red-950 via-slate-950 to-blue-950 text-white">
      <div className="projection-shell">
        <div className="projection-frame grid min-h-0 grid-rows-[auto_minmax(0,0.95fr)_minmax(0,1.25fr)_auto_auto] gap-3">
          <header className="projection-panel grid min-h-0 grid-cols-[1fr_auto] items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
            <div className="min-w-0">
              <h1 className="projection-text-lg truncate font-black uppercase tracking-[0.12em] text-white">
                {kumiteData.categoria || t("kumite:projection.currentMatch")}
              </h1>
              <p className="projection-text-sm truncate text-white/65">
                {kumiteData.area
                  ? `${t("kumite:config.area")} ${kumiteData.area}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected
                    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    : "bg-rose-400"
                }`}
              />
            </div>
          </header>

          <section className="projection-panel min-h-0 rounded-[2rem] border border-white/15 bg-black/35 shadow-2xl backdrop-blur-md">
            <Card className="h-full bg-transparent shadow-none">
              <CardBody className="flex h-full min-h-0 items-center justify-center px-4 py-3">
                <div className="flex w-full items-center justify-between gap-3 px-4">
                  <div className="w-xs"></div>
                  <div className="text-center">
                    <div
                      className={`projection-text-timer font-black leading-none tracking-[0.08em] ${
                        isAtoshiBaraku
                          ? "animate-pulse text-amber-300"
                          : kumiteData.timeRemaining === 0
                            ? "text-red-600"
                            : "text-white"
                      }`}
                    >
                      {formatTime(kumiteData.timeRemaining)}
                    </div>
                    {isAtoshiBaraku ? (
                      <div className="mt-3 projection-text-md font-black uppercase tracking-[0.24em] text-amber-300 text-center">
                        Atoshi Baraku
                      </div>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`rounded-full border px-5 py-2 projection-text-lg font-black uppercase tracking-[0.2em] shadow-lg ${
                        kumiteData.isRunning && kumiteData.timeRemaining > 0
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                          : !kumiteData.isRunning &&
                              kumiteData.timeRemaining > 0
                            ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                            : !kumiteData.isRunning &&
                                kumiteData.timeRemaining === 0
                              ? "border-rose-400/40 bg-rose-500/10 text-rose-300"
                              : ""
                      }`}
                    >
                      {kumiteData.isRunning && kumiteData.timeRemaining > 0
                        ? "EN CURSO"
                        : !kumiteData.isRunning && kumiteData.timeRemaining > 0
                          ? "PAUSADO"
                          : !kumiteData.isRunning &&
                              kumiteData.timeRemaining === 0
                            ? "FINALIZADO"
                            : ""}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          <section className="projection-panel grid min-h-0 grid-cols-2 gap-3">
            <CompetitorPanel
              accentClass="border-gray-300 bg-gray-100 text-gray-900"
              bodyClass="px-4 pb-4"
              chipClass="bg-gray-300 text-gray-800"
              isLight
              label={t("kumite:competitor.shiro").toUpperCase()}
              name={kumiteData.competidorShiro}
              score={kumiteData.scoreShiro}
              penalties={kumiteData.penaltiesShiro || []}
              atenaiCount={kumiteData.atenaiCountShiro || 0}
              warnings={kumiteData.warningsShiro || []}
              penaltyTitle={t("kumite:penalties.title")}
              warningTitle={t("kumite:warnings.title")}
              t={t}
            />
            <CompetitorPanel
              accentClass="border-red-400 bg-gradient-to-br from-red-700/85 to-red-950/85"
              bodyClass="px-4 pb-4"
              chipClass="bg-red-400 text-red-100"
              isLight={false}
              label={t("kumite:competitor.aka").toUpperCase()}
              name={kumiteData.competidorAka}
              score={kumiteData.scoreAka}
              penalties={kumiteData.penaltiesAka || []}
              atenaiCount={kumiteData.atenaiCountAka || 0}
              warnings={kumiteData.warningsAka || []}
              penaltyTitle={t("kumite:penalties.title")}
              warningTitle={t("kumite:warnings.title")}
              t={t}
            />
          </section>
        </div>
      </div>

      {kumiteData.winner && (
        <WinnerModal
          isOpen={!!kumiteData.winner}
          onClose={() => {}}
          winnerName={kumiteData.winner.name}
          scoreAka={kumiteData.scoreAka}
          scoreShiro={kumiteData.scoreShiro}
          side={kumiteData.winner.side}
          reason={kumiteData.winner.reason}
        />
      )}
    </div>
  );
}
