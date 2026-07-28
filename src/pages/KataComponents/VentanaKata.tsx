import { useEffect, useMemo, useState } from "react";
import { useCrossPlatformChannel } from "@/hooks/useCrossPlatformChannel";
import { KataStateSync, KATA_EVENTS } from "@/types/events";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "@/styles/projection.css";

const ROTATION_INTERVAL_MS = 3500;
const FINAL_LOCK_MS = 10000;
const ROTATION_WINDOW_SIZE = 6;

function getVisibleCompetitors<T extends { id: number }>(
  competitors: T[],
  activeId?: number,
  page = 0,
  pageSize = ROTATION_WINDOW_SIZE,
) {
  if (competitors.length <= pageSize) {
    return competitors;
  }

  const totalPages = Math.ceil(competitors.length / pageSize);
  const safePage = page % totalPages;
  const start = safePage * pageSize;
  let visible = competitors.slice(start, start + pageSize);

  if (activeId === undefined) {
    return visible;
  }

  const activeIndex = competitors.findIndex((competitor) => competitor.id === activeId);

  if (activeIndex === -1) {
    return visible;
  }

  const activeCompetitor = competitors[activeIndex];
  const alreadyVisible = visible.some((competitor) => competitor.id === activeId);

  if (alreadyVisible) {
    return visible;
  }

  visible = [...visible.slice(0, pageSize - 1), activeCompetitor];

  return visible;
}

export default function VentanaKata() {
  const [data, setData] = useState<KataStateSync>({
    competidor: "",
    categoria: "",
    numJudges: 5,
    puntajes: [],
    puntajeFinal: "",
    puntajeMenor: "",
    puntajeMayor: "",
    competidores: [],
    area: "",
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pendingData, setPendingData] = useState<KataStateSync | null>(null);
  const [rotationPage, setRotationPage] = useState(0);
  const notifyDisplayReady = useCrossPlatformChannel(KATA_EVENTS.DISPLAY_READY);

  const judgeCount = data.numJudges || 5;
  const judgeGridClass =
    judgeCount === 3 ? "grid-cols-3" : "grid-cols-5";

  const sortedCompetitors = useMemo(() => {
    return [...(data.competidores || [])].sort((a, b) => {
      if (a.PuntajeFinal && b.PuntajeFinal) {
        return b.PuntajeFinal - a.PuntajeFinal;
      }
      if (a.PuntajeFinal) return -1;
      if (b.PuntajeFinal) return 1;
      return 0;
    });
  }, [data.competidores]);

  const visibleCompetitors = useMemo(
    () => getVisibleCompetitors(sortedCompetitors, data.id, rotationPage),
    [sortedCompetitors, data.id, rotationPage],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedCompetitors.length / ROTATION_WINDOW_SIZE)),
    [sortedCompetitors.length],
  );

  useCrossPlatformChannel<KataStateSync>(KATA_EVENTS.SYNC_STATE, (newData) => {
    setConnected(true);
    setLastUpdate(Date.now());

    if (newData.isFinal && !isLocked) {
      setData(newData);
      setIsLocked(true);

      setTimeout(() => {
        setIsLocked(false);
      }, FINAL_LOCK_MS);
      return;
    }

    if (isLocked) {
      setPendingData(newData);
      return;
    }

    setData(newData);
  });

  useEffect(() => {
    if (!isLocked && pendingData) {
      setData(pendingData);
      setPendingData(null);
    }
  }, [isLocked, pendingData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Date.now() - lastUpdate > 5000) {
        setConnected(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lastUpdate]);

  useEffect(() => {
    document.body.classList.add("projection-body", "projection-kata");
    notifyDisplayReady(undefined);

    return () => {
      document.body.classList.remove("projection-body", "projection-kata");
    };
  }, [notifyDisplayReady]);

  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key === "F11") {
        event.preventDefault();
        try {
          const currentWindow = getCurrentWindow();
          const newFullscreenState = !isFullscreen;
          await currentWindow.setFullscreen(newFullscreenState);
          setIsFullscreen(newFullscreenState);
        } catch (error) {
          console.error("Error toggling fullscreen:", error);
        }
      } else if (event.key === "Escape" && isFullscreen) {
        try {
          const currentWindow = getCurrentWindow();
          await currentWindow.setFullscreen(false);
          setIsFullscreen(false);
        } catch (error) {
          console.error("Error exiting fullscreen:", error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  useEffect(() => {
    if (isLocked || totalPages <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setRotationPage((current) => (current + 1) % totalPages);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isLocked, totalPages]);

  useEffect(() => {
    setRotationPage((current) => (totalPages === 0 ? 0 : current % totalPages));
  }, [totalPages]);

  return (
    <div className="projection-root bg-[#0f172a] text-slate-100">
      <div className="projection-shell">
        <div className="projection-frame grid min-h-0 grid-cols-[minmax(280px,0.95fr)_minmax(0,1.45fr)] gap-3">
          <aside className="projection-panel min-h-0 rounded-[1.75rem] border border-slate-700/60 bg-slate-900/75 shadow-2xl backdrop-blur-md">
            <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
              <div className="border-b border-slate-700/50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="projection-text-lg font-black tracking-[0.18em] text-blue-400">
                      KATA
                    </h1>
                    {data.categoria ? (
                      <p className="projection-text-sm truncate font-bold uppercase tracking-[0.18em] text-blue-200/85">
                        {data.categoria}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        connected
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                          : "bg-rose-400"
                      }`}
                    />
                    <span className="projection-text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                      {connected ? "Sync" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="projection-panel min-h-0 px-3 py-3">
                {visibleCompetitors.length > 0 ? (
                  <div className="grid h-full min-h-0 auto-rows-fr gap-2">
                    {visibleCompetitors.map((competidor, index) => {
                      const isActive = data.id === competidor.id;
                      const isEvaluated =
                        competidor.PuntajeFinal !== null &&
                        competidor.PuntajeFinal !== undefined;

                      return (
                        <div
                          key={competidor.id}
                          className={`grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-3 py-2 transition-all duration-300 ${
                            isActive
                              ? "border-blue-400/40 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                              : isEvaluated
                                ? "border-slate-700/30 bg-slate-800/65"
                                : "border-slate-800/70 bg-slate-900/40 opacity-70"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl projection-text-sm font-black ${
                              isEvaluated
                                ? index === 0
                                  ? "bg-amber-400 text-amber-950"
                                  : index === 1
                                    ? "bg-slate-300 text-slate-900"
                                    : index === 2
                                      ? "bg-amber-700 text-amber-50"
                                      : "bg-slate-700 text-slate-300"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {isEvaluated ? index + 1 + rotationPage * ROTATION_WINDOW_SIZE : "-"}
                          </div>
                          <div className="min-w-0">
                            <p className={`truncate projection-text-md font-black ${isActive ? "text-white" : "text-slate-100"}`}>
                              {competidor.Nombre}
                            </p>
                            <p className={`truncate projection-text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? "text-blue-100/90" : "text-slate-500"}`}>
                              {competidor.Kiken ? "Descalificado" : `Edad ${competidor.Edad}`}
                            </p>
                          </div>
                          <div className={`projection-text-lg font-black tabular-nums ${isActive ? "text-white" : "text-blue-300"}`}>
                            {competidor.Kiken ? "--" : competidor.PuntajeFinal?.toFixed(2) || "--"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-slate-500">
                    <p className="projection-text-sm font-semibold uppercase tracking-[0.2em]">
                      Buscando competidores
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-700/50 px-4 py-3">
                <span className="projection-text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {totalPages > 1 ? `Rotacion ${rotationPage + 1}/${totalPages}` : "Ranking"}
                </span>
                {data.area ? (
                  <span className="projection-text-sm font-black uppercase tracking-[0.22em] text-blue-400">
                    Area {data.area}
                  </span>
                ) : null}
              </div>
            </div>
          </aside>

          <main className="projection-panel grid min-h-0 grid-rows-[auto_minmax(0,0.78fr)_minmax(0,0.68fr)] gap-3">
            <section className="projection-panel rounded-[2rem] border border-slate-700/50 bg-slate-800/45 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 projection-text-xs font-black uppercase tracking-[0.24em] text-blue-400">
                  Competidor en Tatami
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
              </div>

              {data.competidor ? (
                <h2 className="projection-text-hero mt-4 truncate font-black tracking-tight text-white">
                  {data.competidor}
                </h2>
              ) : (
                <div className="flex min-h-[7rem] items-center justify-center">
                  <p className="projection-text-xl text-center font-black text-slate-600">
                    Esperando siguiente competidor
                  </p>
                </div>
              )}
            </section>

            <section className={`projection-panel grid min-h-0 ${judgeGridClass} gap-3`}>
              {Array.from({ length: judgeCount }).map((_, i) => {
                const score = data.puntajes?.[i];

                return (
                  <div
                    key={i}
                    className={`projection-panel flex min-h-0 flex-col items-center justify-center rounded-[1.5rem] border px-3 py-4 transition-all duration-500 ${
                      score
                        ? "border-blue-500/50 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        : "border-slate-700/50 bg-slate-800/35"
                    }`}
                  >
                    <span className="projection-text-xs mb-2 font-black uppercase tracking-[0.24em] text-slate-500">
                      Juez {i + 1}
                    </span>
                    <span
                      className={`projection-text-xl font-black tabular-nums transition-all duration-300 ${
                        score ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {score || "0.0"}
                    </span>
                  </div>
                );
              })}
            </section>

            <section
              className={`projection-panel rounded-[2rem] border-4 p-1 transition-all duration-700 ${
                data.puntajeFinal
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 via-blue-600/20 to-indigo-600/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                  : "border-slate-800 bg-slate-800/20 shadow-inner"
              }`}
            >
              <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-[1.6rem] bg-[#0f172a]/80 px-4 py-5 backdrop-blur-2xl">
                {data.puntajeFinal ? (
                  <>
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                  </>
                ) : null}

                <span
                  className={`projection-text-xs mb-3 font-black uppercase tracking-[0.38em] ${
                    data.puntajeFinal ? "text-emerald-400" : "text-slate-600"
                  }`}
                >
                  Puntaje Total
                </span>

                {data.puntajeFinal ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="projection-text-score leading-none font-black tabular-nums text-white">
                      {data.puntajeFinal}
                    </span>

                    <div className="mt-3 flex items-center gap-6">
                      {judgeCount === 5 ? (
                        <>
                          <div className="flex flex-col items-center">
                            <span className="projection-text-xs mb-1 font-bold uppercase tracking-[0.18em] text-slate-500">
                              Min. desc.
                            </span>
                            <span className="projection-text-md font-black tabular-nums text-rose-400/90">
                              {data.puntajeMenor || "--"}
                            </span>
                          </div>
                          <div className="h-10 w-px bg-slate-700" />
                        </>
                      ) : null}
                      <div className="flex flex-col items-center">
                        <span className="projection-text-xs mb-1 font-bold uppercase tracking-[0.18em] text-slate-500">
                          Max. desc.
                        </span>
                        <span className="projection-text-md font-black tabular-nums text-emerald-400/90">
                          {data.puntajeMayor || "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="projection-text-score font-black italic text-slate-700/35">
                    0.00
                  </span>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
