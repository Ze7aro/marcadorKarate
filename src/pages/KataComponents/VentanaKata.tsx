import { useState, useEffect } from 'react';
import { useCrossPlatformChannel } from '@/hooks/useCrossPlatformChannel';
import { KataStateSync, KATA_EVENTS } from '@/types/events';
import { getCurrentWindow } from '@tauri-apps/api/window';

export default function VentanaKata() {
  const [data, setData] = useState<KataStateSync>({
    competidor: '',
    categoria: '',
    puntajes: [],
    puntajeFinal: '',
    puntajeMenor: '',
    puntajeMayor: '',
    competidores: [],
    area: '',
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pendingData, setPendingData] = useState<KataStateSync | null>(null);

  // Escuchar actualizaciones desde la ventana principal
  useCrossPlatformChannel<KataStateSync>(KATA_EVENTS.SYNC_STATE, (newData) => {
    setConnected(true);
    setLastUpdate(Date.now());

    // Si recibimos una señal de que es un resultado final
    if (newData.isFinal && !isLocked) {
      console.log("LOCKING: Showing final result for 10s");
      setData(newData);
      setIsLocked(true);

      setTimeout(() => {
        setIsLocked(false);
      }, 10000);
      return;
    }

    // Si estamos bloqueados, guardamos los datos para aplicarlos después
    if (isLocked) {
      setPendingData(newData);
      return;
    }

    // Si no hay bloqueo, aplicamos directamente
    setData(newData);
  });

  // Efecto para aplicar datos pendientes cuando se libera el bloqueo
  useEffect(() => {
    if (!isLocked && pendingData) {
      setData(pendingData);
      setPendingData(null);
    }
  }, [isLocked, pendingData]);

  // Detectar desconexión si no hay datos por 5 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Date.now() - lastUpdate > 5000) {
        setConnected(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lastUpdate]);

  // Keyboard shortcuts para fullscreen (F11)
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        try {
          const currentWindow = getCurrentWindow();
          const newFullscreenState = !isFullscreen;
          await currentWindow.setFullscreen(newFullscreenState);
          setIsFullscreen(newFullscreenState);
        } catch (error) {
          console.error('Error toggling fullscreen:', error);
        }
      } else if (event.key === 'Escape' && isFullscreen) {
        try {
          const currentWindow = getCurrentWindow();
          await currentWindow.setFullscreen(false);
          setIsFullscreen(false);
        } catch (error) {
          console.error('Error exiting fullscreen:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-6 font-sans">
      {/* Indicador de conexión */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
        <div
          className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'
            }`}
        />
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          {connected ? 'Sync Live' : 'Offline'}
        </span>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 h-[calc(100vh-3rem)]">

        {/* PANEL IZQUIERDO: LISTA DE COMPETIDORES (LEADERBOARD) */}
        <div className="col-span-4 flex flex-col h-full">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-col h-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 bg-slate-800/60">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="text-blue-500 font-black italic">KATA</span>
                <span className="text-slate-400 font-medium text-lg">LEADERBOARD</span>
              </h1>
              {data.categoria && (
                <p className="text-sm text-blue-400 mt-1 font-semibold uppercase tracking-widest">{data.categoria}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {data.competidores && data.competidores.length > 0 ? (
                // Ordenar: primero los que tienen puntaje (por ranking), luego los que no (por orden original)
                [...data.competidores]
                  .sort((a, b) => {
                    if (a.PuntajeFinal && b.PuntajeFinal) return b.PuntajeFinal - a.PuntajeFinal;
                    if (a.PuntajeFinal) return -1;
                    if (b.PuntajeFinal) return 1;
                    return 0;
                  })
                  .map((competidor, index) => {
                    const isActive = data.id === competidor.id;
                    const isEvaluated = competidor.PuntajeFinal !== null && competidor.PuntajeFinal !== undefined;

                    return (
                      <div
                        key={competidor.id}
                        className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 ${isActive
                          ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/30 scale-[1.02] z-10'
                          : isEvaluated
                            ? 'bg-slate-800/60 border border-slate-700/30'
                            : 'bg-slate-900/40 border border-slate-800/50 opacity-60'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isEvaluated
                            ? index === 0 ? 'bg-amber-400 text-amber-950' :
                              index === 1 ? 'bg-slate-300 text-slate-900' :
                                index === 2 ? 'bg-amber-700 text-amber-50' :
                                  'bg-slate-700 text-slate-300'
                            : 'bg-slate-800 text-slate-500'
                            }`}>
                            {isEvaluated ? index + 1 : '-'}
                          </div>
                          <div>
                            <p className={`font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {competidor.Nombre}
                            </p>
                            <p className={`text-[10px] uppercase tracking-tighter ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                              {competidor.Kiken ? 'DESCALIFICADO' : `EDAD: ${competidor.Edad}`}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xl font-mono font-black ${isActive ? 'text-white' : 'text-blue-400'}`}>
                          {competidor.Kiken ? '—' : (competidor.PuntajeFinal?.toFixed(2) || '—')}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 py-20">
                  <div className="text-4xl mb-4 opacity-20">🥋</div>
                  <p className="text-sm font-medium">Buscando competidores...</p>
                </div>
              )}
            </div>

            {data.area && (
              <div className="p-4 bg-slate-900/60 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tatami</span>
                <span className="text-xl font-black text-blue-500">ÁREA {data.area}</span>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: COMPETIDOR ACTUAL Y PUNTAJES EN VIVO */}
        <div className="col-span-8 flex flex-col gap-8">

          {/* Header del Competidor Actual */}
          <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 p-10 shadow-2xl overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] rounded-full">
                  Competidor en Tatami
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
              </div>

              {data.competidor ? (
                <>
                  <h2 className="text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                    {data.competidor}
                  </h2>
                  <p className="text-2xl text-slate-400 font-medium">Representante de la Categoría</p>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-4xl font-black text-slate-700 animate-pulse">ESPERANDO SIGUIENTE COMPETIDOR</p>
                </div>
              )}
            </div>
          </div>

          {/* Puntajes de Jueces y Puntaje Final */}
          <div className="flex-1 grid grid-cols-1 gap-8">
            {/* Grid de Jueces */}
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => {
                const score = data.puntajes?.[i];
                // const isFinal = !!data.puntajeFinal;

                return (
                  <div
                    key={i}
                    className={`bg-slate-800/40 backdrop-blur-md rounded-2xl border p-6 flex flex-col items-center justify-center transition-all duration-500 ${score
                      ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'border-slate-700/50'
                      }`}
                  >
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Juez {i + 1}</span>
                    <span className={`text-6xl font-black font-mono transition-all duration-300 ${score ? 'text-white scale-110' : 'text-slate-800'
                      }`}>
                      {score || '0.0'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Resultado Final Gigante */}
            <div className={`rounded-[2rem] p-1 border-4 transition-all duration-700 ${data.puntajeFinal
              ? 'bg-gradient-to-br from-emerald-500/20 via-blue-600/20 to-indigo-600/20 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800/20 border-slate-800 shadow-inner'
              }`}>
              <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-[1.75rem] h-full flex flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* Visual Decorations */}
                {data.puntajeFinal && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                  </>
                )}

                <span className={`text-xs font-black uppercase tracking-[0.4em] mb-4 transition-colors duration-500 ${data.puntajeFinal ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                  Puntaje Total de Desempeño
                </span>

                <div className="relative">
                  {data.puntajeFinal ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                      <span className="text-[12rem] leading-none font-black text-white font-mono drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {data.puntajeFinal}
                      </span>

                      <div className="flex gap-12 mt-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mínimo desc.</span>
                          <span className="text-2xl font-black text-rose-500/80 font-mono">{data.puntajeMenor || '—'}</span>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-700" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Máximo desc.</span>
                          <span className="text-2xl font-black text-emerald-500/80 font-mono">{data.puntajeMayor || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <span className="text-[10rem] font-black text-slate-600 font-mono italic">0.00</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 0.8);
        }
      `}</style>
    </div>
  );
}
