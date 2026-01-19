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

  // Escuchar actualizaciones desde la ventana principal
  useCrossPlatformChannel<KataStateSync>(KATA_EVENTS.SYNC_STATE, (newData) => {
    setData(newData);
    setConnected(true);
    setLastUpdate(Date.now());
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8">
      {/* Indicador de conexión */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-sm">
          {connected ? 'Conectado' : 'Esperando conexión...'}
        </span>
      </div>

      {/* Indicador de fullscreen */}
      <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-xs bg-white/10 backdrop-blur px-3 py-1 rounded-full">
          {isFullscreen ? 'ESC para salir de pantalla completa' : 'F11 para pantalla completa'}
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">KATA</h1>
        {data.area && (
          <p className="text-3xl">Área {data.area}</p>
        )}
        {data.categoria && (
          <p className="text-2xl mt-2 text-blue-200">{data.categoria}</p>
        )}
      </div>

      {/* Competidor Actual */}
      {data.competidor && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 mb-8">
          <div className="text-center">
            <p className="text-2xl mb-4 text-blue-200">Competidor</p>
            <h2 className="text-6xl font-bold mb-8">{data.competidor}</h2>

            {/* Puntajes de Jueces */}
            {data.puntajes && data.puntajes.length > 0 && (
              <div className="grid grid-cols-5 gap-6 mb-8">
                {data.puntajes.map((puntaje, index) => (
                  <div
                    key={index}
                    className="bg-white/20 rounded-2xl p-6 backdrop-blur"
                  >
                    <p className="text-lg mb-2">Juez {index + 1}</p>
                    <p className="text-5xl font-bold">
                      {puntaje || '-'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Puntaje Final */}
            {data.puntajeFinal && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 mt-8">
                <p className="text-3xl mb-4">Puntaje Final</p>
                <p className="text-8xl font-bold">{data.puntajeFinal}</p>

                {/* Puntajes Mayor/Menor (para 5 jueces) */}
                {data.puntajeMenor && data.puntajeMayor && (
                  <div className="flex justify-center gap-12 mt-8">
                    <div>
                      <p className="text-lg text-white/70">Menor</p>
                      <p className="text-3xl font-bold">{data.puntajeMenor}</p>
                    </div>
                    <div>
                      <p className="text-lg text-white/70">Mayor</p>
                      <p className="text-3xl font-bold">{data.puntajeMayor}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Competidores */}
      {data.competidores && data.competidores.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <h3 className="text-3xl font-bold mb-6 text-center">Resultados</h3>
          <div className="space-y-3">
            {data.competidores
              .filter((c) => c.PuntajeFinal)
              .sort((a, b) => (b.PuntajeFinal || 0) - (a.PuntajeFinal || 0))
              .slice(0, 10)
              .map((competidor, index) => (
                <div
                  key={competidor.id}
                  className="flex justify-between items-center bg-white/20 rounded-xl p-6 backdrop-blur"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-600'
                          : 'bg-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{competidor.Nombre}</p>
                      <p className="text-lg text-blue-200">Edad: {competidor.Edad}</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold">
                    {competidor.PuntajeFinal?.toFixed(2)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mensaje si no hay datos */}
      {!data.competidor && data.competidores.length === 0 && (
        <div className="text-center py-24">
          <div className="text-8xl mb-8">🥋</div>
          <p className="text-4xl text-white/70">
            Esperando datos de la competencia...
          </p>
        </div>
      )}
    </div>
  );
}
