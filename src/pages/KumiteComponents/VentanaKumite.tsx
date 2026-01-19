import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrossPlatformChannel } from '@/hooks/useCrossPlatformChannel';
import { KumiteStateSync, KUMITE_EVENTS } from '@/types/events';
import { Card, CardBody, Chip, Divider } from '@heroui/react';
import WinnerModal from './WinnerModal';

export default function VentanaKumite() {
  const { t } = useTranslation(['kumite', 'common']);
  const [kumiteData, setKumiteData] = useState<KumiteStateSync | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Escuchar actualizaciones del estado de Kumite
  useCrossPlatformChannel<KumiteStateSync>(KUMITE_EVENTS.SYNC_STATE, (data) => {
    setKumiteData(data);
    setIsConnected(true);
    console.log('Kumite display received update:', data);
  });

  useEffect(() => {
    // Marcar como conectado
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Si no hay datos, mostrar pantalla de espera
  if (!kumiteData || !kumiteData.currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-8xl mb-8">⚔️</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {t('kumite:projection.title')}
          </h1>
          <p className="text-2xl text-gray-400 mb-8">{t('kumite:projection.noMatch')}</p>
          <Chip
            color={isConnected ? 'success' : 'warning'}
            size="lg"
            variant="flat"
            className="text-lg"
          >
            {isConnected ? t('kumite:projection.connected') : t('kumite:projection.connecting')}
          </Chip>
          <p className="text-sm text-gray-500 mt-8">{t('kumite:projection.shortcuts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con categoría y área */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {kumiteData.categoria || t('kumite:projection.currentMatch')}
          </h1>
          {kumiteData.area && (
            <p className="text-xl text-gray-300">
              {t('kumite:config.area')} {kumiteData.area}
            </p>
          )}
        </div>

        {/* Timer Principal */}
        <Card className="bg-black/50 backdrop-blur-lg border-2 border-white/20 mb-8">
          <CardBody className="p-12">
            <div className="text-center">
              <div
                className={`text-9xl font-bold font-mono tracking-wider ${kumiteData.timeRemaining <= 10 && kumiteData.timeRemaining > 0
                  ? 'text-red-500 animate-pulse'
                  : kumiteData.timeRemaining === 0
                    ? 'text-red-600'
                    : 'text-white'
                  }`}
              >
                {formatTime(kumiteData.timeRemaining)}
              </div>
              <Chip
                color={kumiteData.isRunning ? 'success' : 'warning'}
                size="lg"
                variant="flat"
                className="mt-4 text-xl"
              >
                {kumiteData.isRunning ? '▶️ EN CURSO' : '⏸️ PAUSADO'}
              </Chip>
            </div>
          </CardBody>
        </Card>

        {/* Competidores */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Aka (Rojo) */}
          <Card className="bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400">
            <CardBody className="p-8">
              <div className="text-center">
                <Chip color="danger" size="lg" className="mb-4 text-lg font-bold">
                  {t('kumite:competitor.aka').toUpperCase()}
                </Chip>
                <h2 className="text-4xl font-bold text-white mb-6 truncate">
                  {kumiteData.competidorAka || 'BYE'}
                </h2>
                <div className="text-9xl font-bold text-white mb-6">{kumiteData.scoreAka}</div>

                {/* Penalizaciones Aka */}
                {(kumiteData.penaltiesAka?.length > 0 || kumiteData.warningsAka?.length > 0) && (
                  <>
                    <Divider className="my-4 bg-white/30" />
                    <div className="space-y-4">
                      {kumiteData.penaltiesAka?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-white/60 mb-2 uppercase">
                            {t('kumite:penalties.title')}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {(kumiteData.penaltiesAka || []).map((penalty, idx) => (
                              <Chip key={idx} color="warning" size="sm" variant="flat" className="text-white">
                                {t(`kumite:penalties.${penalty}`)}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      {kumiteData.warningsAka?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-white/60 mb-2 uppercase">
                            {t('kumite:warnings.title')}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {(kumiteData.warningsAka || []).map((warning, idx) => (
                              <Chip key={idx} color="danger" size="sm" variant="flat" className="text-white">
                                {t(`kumite:warnings.${warning}`)}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Shiro (Blanco) */}
          <Card className="bg-gradient-to-br from-gray-200 to-gray-400 border-4 border-gray-400 text-gray-800">
            <CardBody className="p-8">
              <div className="text-center">
                <Chip className="mb-4 text-lg font-bold bg-white text-gray-800">
                  {t('kumite:competitor.shiro').toUpperCase()}
                </Chip>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 truncate">
                  {kumiteData.competidorShiro || 'BYE'}
                </h2>
                <div className="text-9xl font-bold text-gray-900 mb-6">{kumiteData.scoreShiro}</div>

                {/* Penalizaciones Shiro */}
                {(kumiteData.penaltiesShiro?.length > 0 || kumiteData.warningsShiro?.length > 0) && (
                  <>
                    <Divider className="my-4 bg-gray-400/30" />
                    <div className="space-y-4">
                      {kumiteData.penaltiesShiro?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                            {t('kumite:penalties.title')}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {(kumiteData.penaltiesShiro || []).map((penalty, idx) => (
                              <Chip key={idx} color="warning" size="sm" variant="flat" className="text-gray-800">
                                {t(`kumite:penalties.${penalty}`)}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      {kumiteData.warningsShiro?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                            {t('kumite:warnings.title')}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {(kumiteData.warningsShiro || []).map((warning, idx) => (
                              <Chip key={idx} color="danger" size="sm" variant="flat" className="text-gray-800">
                                {t(`kumite:warnings.${warning}`)}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Estado del Match */}
        <div className="text-center">
          <Chip
            color={
              kumiteData.status === 'completed'
                ? 'success'
                : kumiteData.status === 'in_progress'
                  ? 'warning'
                  : 'default'
            }
            size="lg"
            variant="shadow"
            className="text-xl"
          >
            {kumiteData.status === 'pending' && t('kumite:bracket.pending').toUpperCase()}
            {kumiteData.status === 'in_progress' && t('kumite:bracket.inProgress').toUpperCase()}
            {kumiteData.status === 'completed' && t('kumite:bracket.completed').toUpperCase()}
          </Chip>
        </div>

        {/* Footer con shortcuts */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">{t('kumite:projection.shortcuts')}</p>
        </div>
      </div>

      {kumiteData.winner && (
        <WinnerModal
          isOpen={!!kumiteData.winner}
          onClose={() => { }} // Se cierra cuando el operador lo cierra
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
