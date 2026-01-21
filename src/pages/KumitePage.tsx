import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Chip,
  Divider,
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKumite } from '@/context/KumiteContext';
import { generateBracket, getCurrentMatch } from '@/utils/bracketUtils';
import { useTimer } from '@/hooks/useTimer';
import AgregarCompetidor from './KumiteComponents/AgregarCompetidor';
import BracketView from './KumiteComponents/BracketView';
import ResultadosFinales from './KumiteComponents/ResultadosFinales';
import WinnerModal from './KumiteComponents/WinnerModal';
import EnchoSenModal from './KumiteComponents/EnchoSenModal';
import toast from 'react-hot-toast';
import type { CompetidorKumite, Competidor, PenaltyType, WarningType } from '@/types/events';
import ExcelUploader from '@/components/ExcelUploader';

import { invoke } from '@tauri-apps/api/core';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export default function KumitePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['kumite', 'common']);
  const { state, dispatch } = useKumite();

  const [showAgregarDialog, setShowAgregarDialog] = useState(false);
  const [showBracketDialog, setShowBracketDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showEnchoSenModal, setShowEnchoSenModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    name: string;
    scoreAka: number;
    scoreShiro: number;
    side: 'aka' | 'shiro' | null;
    reason?: 'disqualification' | 'hantei' | null;
  }>({
    name: '',
    scoreAka: 0,
    scoreShiro: 0,
    side: null,
    reason: null,
  });

  // Timer para el match actual
  const currentMatch = state.bracket ? getCurrentMatch(state.bracket) : null;

  // Verificar si el torneo está completado
  const isTournamentCompleted =
    state.bracket &&
    state.bracket.matches.every(
      (m) => m.status === 'completed' || (!m.competidorAka && !m.competidorShiro)
    );
  const { formattedTime, isRunning, start, pause, reset } = useTimer({
    initialTime: currentMatch?.timeRemaining || state.matchDuration,
    onTick: (timeRemaining) => {
      if (currentMatch) {
        dispatch({
          type: 'UPDATE_TIMER',
          payload: { matchId: currentMatch.id, timeRemaining },
        });
      }
    },
    onComplete: () => {
      toast.success(t('kumite:messages.timeUp'));
      dispatch({ type: 'STOP_TIMER' });

      if (currentMatch) {
        if (currentMatch.isEnchoSen && (currentMatch.scoreAka === currentMatch.scoreShiro)) {
          // Si termina el tiempo en Encho-sen y siguen empate -> Hantei (o decisión manual)
          // Por ahora lo dejamos completado para que decidan
          dispatch({
            type: 'UPDATE_MATCH',
            payload: { id: currentMatch.id, data: { status: 'completed' } },
          });
        }
        else if (currentMatch.scoreAka === currentMatch.scoreShiro) {
          // Empate Normal: Solo marcar como completado, el botón para Encho-sen aparecerá
          dispatch({
            type: 'UPDATE_MATCH',
            payload: { id: currentMatch.id, data: { status: 'completed' } },
          });
        } else if (currentMatch.scoreAka > currentMatch.scoreShiro) {
          // Ganador Aka por puntos
          handleDeclareWinner(currentMatch.competidorAka!.id);
        } else {
          // Ganador Shiro por puntos
          handleDeclareWinner(currentMatch.competidorShiro!.id);
        }
      }
    },
  });

  const handleAddCompetidor = (nombre: string, edad: number) => {
    const nuevoCompetidor: CompetidorKumite = {
      id: Date.now(),
      Nombre: nombre,
      Edad: edad,
      Categoria: state.categoria,
    };

    dispatch({ type: 'ADD_COMPETIDOR', payload: nuevoCompetidor });
    toast.success(`${nombre} agregado`);
  };

  const handleRemoveCompetidor = (id: number) => {
    dispatch({ type: 'REMOVE_COMPETIDOR', payload: id });
    toast.success(t('kumite:competitor.remove'));
  };

  const handleCompetidoresLoaded = (competidores: Competidor[], categoria: string) => {
    // Convertir a CompetidorKumite (asegurando compatibilidad de tipos)
    const competidoresKumite: CompetidorKumite[] = competidores.map(c => ({
      ...c,
      id: c.id || Date.now() + Math.random(), // Asegurar ID
    }));

    dispatch({ type: 'SET_COMPETIDORES', payload: competidoresKumite });
    dispatch({ type: 'SET_CATEGORIA', payload: { categoria, titulo: categoria } });
    toast.success(`${competidores.length} competidores importados`);
  };

  const handleGenerarBracket = () => {
    if (state.competidores.length < 2) {
      toast.error(t('kumite:messages.minCompetitors'));
      return;
    }

    try {
      const bracket = generateBracket(state.competidores, state.matchDuration);
      dispatch({ type: 'GENERATE_BRACKET', payload: bracket });
      dispatch({ type: 'SET_CURRENT_MATCH', payload: bracket.currentMatchId });
      toast.success(t('kumite:messages.bracketGenerated', { matches: bracket.matches.length }));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleStartPauseTimer = () => {
    if (isRunning) {
      pause();
      dispatch({ type: 'STOP_TIMER' });
    } else {
      start();
      dispatch({ type: 'START_TIMER' });
    }
  };

  // Función para abrir la ventana de proyección
  const handleOpenProjection = async () => {
    try {
      // Verificar si la ventana ya existe
      const existingWindow = await WebviewWindow.getByLabel('kumite-display');

      if (existingWindow) {
        await existingWindow.setFocus();
        toast.success(t('kumite:messages.projectionOpened'));
        return;
      }

      // Crear nueva ventana usando el comando Rust
      await invoke('open_kumite_display');

      // Actualizar estado
      dispatch({ type: 'SET_DISPLAY_WINDOW', payload: true });
      toast.success(t('kumite:messages.projectionOpened'));
    } catch (error) {
      console.error('Error opening display window:', error);
      toast.error('Error al abrir ventana de proyección');
    }
  };

  // Función para cerrar la ventana de proyección
  const handleCloseProjection = async () => {
    try {
      await invoke('close_kumite_display');
      dispatch({ type: 'SET_DISPLAY_WINDOW', payload: false });
      toast.success('Ventana de proyección cerrada');
    } catch (error) {
      console.error('Error closing display window:', error);
      toast.error('Error al cerrar ventana de proyección');
    }
  };

  const handleResetTimer = () => {
    reset(state.matchDuration);
    if (currentMatch) {
      dispatch({
        type: 'UPDATE_MATCH',
        payload: { id: currentMatch.id, data: { timeRemaining: state.matchDuration } },
      });
    }
  };

  const handleAddScore = (side: 'aka' | 'shiro', points: number) => {
    if (currentMatch) {
      dispatch({
        type: 'ADD_SCORE',
        payload: { matchId: currentMatch.id, side, points },
      });
    }
  };

  const handleSelectMatch = (matchId: number) => {
    dispatch({ type: 'SET_CURRENT_MATCH', payload: matchId });
    const selectedMatch = state.bracket?.matches.find((m) => m.id === matchId);
    if (selectedMatch) {
      reset(selectedMatch.timeRemaining);
    }
    setShowBracketDialog(false);
    toast.success(t('kumite:messages.matchSelected'));
  };

  const handleAddPenalty = (side: 'aka' | 'shiro', penalty: PenaltyType) => {
    if (currentMatch) {
      const currentPenalties = side === 'aka'
        ? currentMatch.penaltiesAka
        : currentMatch.penaltiesShiro;

      if (currentPenalties?.includes(penalty)) {
        toast.error(t('kumite:messages.penaltyAlreadyExists'));
        return;
      }

      dispatch({
        type: 'ADD_PENALTY',
        payload: { matchId: currentMatch.id, side, penalty },
      });
      toast.success(`${t('kumite:penalties.title')}: ${t(`kumite:penalties.${penalty}`)}`);
    }
  };

  const handleAddWarning = (side: 'aka' | 'shiro', warning: WarningType) => {
    if (currentMatch) {
      const currentWarnings = side === 'aka'
        ? currentMatch.warningsAka
        : currentMatch.warningsShiro;

      if (currentWarnings?.includes(warning)) {
        toast.error(t('kumite:messages.warningAlreadyExists'));
        return;
      }

      dispatch({
        type: 'ADD_WARNING',
        payload: { matchId: currentMatch.id, side, warning },
      });
      toast.success(`${t('kumite:warnings.title')}: ${t(`kumite:warnings.${warning}`)}`);
    }
  };

  const handleRemovePenalty = (side: 'aka' | 'shiro', index: number) => {
    if (currentMatch) {
      dispatch({
        type: 'REMOVE_PENALTY',
        payload: { matchId: currentMatch.id, side, index },
      });
      toast.success(t('common:states.success'));
    }
  };

  const handleRemoveWarning = (side: 'aka' | 'shiro', index: number) => {
    if (currentMatch) {
      dispatch({
        type: 'REMOVE_WARNING',
        payload: { matchId: currentMatch.id, side, index },
      });
      toast.success(t('common:states.success'));
    }
  };

  const handleDeclareWinner = (winnerId: number, reason?: 'disqualification' | 'hantei' | null) => {
    if (currentMatch && state.bracket) {
      // Obtener nombre del ganador
      const winner =
        currentMatch.competidorAka?.id === winnerId
          ? currentMatch.competidorAka
          : currentMatch.competidorShiro;

      // Un solo dispatch atómico para declarar ganador y avanzar bracket
      dispatch({
        type: 'DECLARE_WINNER',
        payload: {
          matchId: currentMatch.id,
          winnerId,
          reason: reason || undefined
        }
      });

      // Detener timer local
      pause();

      // Preparar y mostrar modal de ganador
      setWinnerInfo({
        name: winner?.Nombre || '',
        scoreAka: currentMatch.scoreAka,
        scoreShiro: currentMatch.scoreShiro,
        side: currentMatch.competidorAka?.id === winnerId ? 'aka' : 'shiro',
        reason: reason || null,
      });
      setShowWinnerModal(true);

      toast.success(
        t('kumite:messages.winnerDeclared', { winner: winner?.Nombre || '' })
      );
    }
  };

  const handleNextMatch = () => {
    if (!state.bracket) return;

    const nextMatch = state.bracket.matches.find(
      (m) => m.status === 'pending' && m.competidorAka && m.competidorShiro
    );

    if (nextMatch) {
      dispatch({ type: 'SET_CURRENT_MATCH', payload: nextMatch.id });
      reset(state.matchDuration);
      toast.success(t('kumite:messages.nextMatch'));
    }
  };


  // Efecto para verificar condición de victoria automática (3 puntos)
  useEffect(() => {
    if (
      currentMatch &&
      currentMatch.status !== 'completed' &&
      currentMatch.competidorAka &&
      currentMatch.competidorShiro
    ) {
      // Condición de victoria por puntos (3 puntos)
      if (!currentMatch.isEnchoSen && currentMatch.scoreAka >= 3) {
        handleDeclareWinner(currentMatch.competidorAka.id);
        return;
      } else if (!currentMatch.isEnchoSen && currentMatch.scoreShiro >= 3) {
        handleDeclareWinner(currentMatch.competidorShiro.id);
        return;
      }

      // Condición de Encho-sen (Primer punto gana)
      if (currentMatch.isEnchoSen) {
        if (currentMatch.scoreAka > 0 && currentMatch.scoreAka > currentMatch.scoreShiro) {
          handleDeclareWinner(currentMatch.competidorAka.id);
          return;
        } else if (currentMatch.scoreShiro > 0 && currentMatch.scoreShiro > currentMatch.scoreAka) {
          handleDeclareWinner(currentMatch.competidorShiro.id);
          return;
        }
      }

      // Condición de descalificación por penalizaciones (Atenai Hansoku)
      if (currentMatch.penaltiesAka?.includes('atenai_hansoku')) {
        handleDeclareWinner(currentMatch.competidorShiro.id, 'disqualification');
        return;
      } else if (currentMatch.penaltiesShiro?.includes('atenai_hansoku')) {
        handleDeclareWinner(currentMatch.competidorAka.id, 'disqualification');
        return;
      }

      // Condición de descalificación por avisos (Kinshi Hansoku)
      if (currentMatch.warningsAka?.includes('kinshi_hansoku')) {
        handleDeclareWinner(currentMatch.competidorShiro.id, 'disqualification');
        return;
      } else if (currentMatch.warningsShiro?.includes('kinshi_hansoku')) {
        handleDeclareWinner(currentMatch.competidorAka.id, 'disqualification');
        return;
      }
    }
  }, [
    currentMatch?.scoreAka,
    currentMatch?.scoreShiro,
    currentMatch?.penaltiesAka,
    currentMatch?.penaltiesShiro,
    currentMatch?.warningsAka,
    currentMatch?.warningsShiro,
    currentMatch?.status,
    currentMatch?.id,
    currentMatch?.isEnchoSen
  ]);

  const handleStartEnchoSen = (time: number) => {
    if (currentMatch) {
      dispatch({
        type: 'START_ENCHO_SEN',
        payload: { matchId: currentMatch.id, time }
      });
      reset(time);
      start();
      toast.success(t('kumite:messages.matchStarted'));
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              ⚔️ {t('kumite:module.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t('kumite:module.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="flat" onPress={() => navigate('/inicio')}>
              ← {t('common:buttons.back')}
            </Button>
            {state.bracket ? (
              <>
                <Button
                  color={state.displayWindowOpen ? 'danger' : 'secondary'}
                  variant="flat"
                  onPress={state.displayWindowOpen ? handleCloseProjection : handleOpenProjection}
                >
                  {state.displayWindowOpen ? 'Cerrar Proyección' : t('kumite:actions.openProjection')}
                </Button>
                <Button color="primary" variant="flat" onPress={() => setShowBracketDialog(true)}>
                  {t('kumite:bracket.view')}
                </Button>
                {isTournamentCompleted && (
                  <Button color="success" variant="flat" onPress={() => setShowResultsDialog(true)}>
                    {t('kumite:actions.viewResults')}
                  </Button>
                )}
              </>
            ) : (
              <Button
                color={state.displayWindowOpen ? 'danger' : 'secondary'}
                variant="flat"
                onPress={state.displayWindowOpen ? handleCloseProjection : handleOpenProjection}
              >
                {state.displayWindowOpen ? 'Cerrar Proyección' : t('kumite:actions.openProjection')}
              </Button>
            )}
            <Button
              color="danger"
              variant="flat"
              onPress={() => dispatch({ type: 'RESET_ALL' })}
            >
              {t('kumite:actions.reset')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración */}
          <div className="lg:col-span-1 space-y-6">
            <ExcelUploader onCompetidoresLoaded={handleCompetidoresLoaded} page="kumite" />

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{t('kumite:config.title')}</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Select
                  labelPlacement="outside-top"
                  label={t('kumite:config.area')}
                  placeholder={t('kumite:config.area')}
                  selectedKeys={state.area ? [state.area] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    dispatch({ type: 'SET_AREA', payload: selected });
                  }}
                >
                  {['1', '2', '3', '4'].map((area) => (
                    <SelectItem key={area}>{`Área ${area}`}</SelectItem>
                  ))}
                </Select>

                <Input
                  labelPlacement="outside-top"
                  label={t('kumite:config.category')}
                  placeholder={t('kumite:config.categoryPlaceholder')}
                  value={state.categoria}
                  onValueChange={(value) =>
                    dispatch({ type: 'SET_CATEGORIA', payload: { categoria: value, titulo: value } })
                  }
                />

                <Select
                  labelPlacement="outside-top"
                  label={t('kumite:config.matchDuration')}
                  selectedKeys={[state.matchDuration.toString()]}
                  onSelectionChange={(keys) => {
                    const selected = parseInt(Array.from(keys)[0] as string);
                    dispatch({ type: 'SET_MATCH_DURATION', payload: selected });
                    if (currentMatch) {
                      dispatch({
                        type: 'UPDATE_MATCH',
                        payload: { id: currentMatch.id, data: { timeRemaining: selected } }
                      });
                    }
                    reset(selected);
                  }}
                >
                  <SelectItem key="30">30 {t('kumite:config.seconds')}</SelectItem>
                  <SelectItem key="60">1:00</SelectItem>
                  <SelectItem key="90">1:30</SelectItem>
                  <SelectItem key="120">2:00</SelectItem>
                  <SelectItem key="180">3:00</SelectItem>
                </Select>

                <Divider />

                <div className="space-y-2">
                  <h3 className="font-semibold">{t('kumite:competitor.list')}</h3>
                  <Button
                    color="primary"
                    fullWidth
                    onPress={() => setShowAgregarDialog(true)}
                  >
                    {t('kumite:competitor.add')}
                  </Button>
                  <p className="text-sm text-gray-500">
                    {t('kumite:competitor.total')}: {state.competidores.length}
                  </p>

                  {state.competidores.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm">
                        {comp.Nombre} ({comp.Edad})
                      </span>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleRemoveCompetidor(comp.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {!state.bracket && (
                  <Button
                    color="success"
                    fullWidth
                    onPress={handleGenerarBracket}
                    isDisabled={state.competidores.length < 2}
                  >
                    {t('kumite:bracket.generate')}
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Match Actual */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-semibold">{t('kumite:match.current')}</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              {!currentMatch ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">{t('kumite:messages.noCompetitors')}</p>
                  <p className="text-sm text-gray-400">
                    Agrega competidores y genera el bracket para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Timer */}
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4">{formattedTime}</div>
                    <div className="flex justify-center gap-2">
                      <Button
                        color={isRunning ? 'warning' : 'success'}
                        onPress={handleStartPauseTimer}
                        isDisabled={currentMatch.status === 'completed'}
                      >
                        {isRunning ? t('kumite:match.pause') : t('kumite:match.start')}
                      </Button>
                      <Button
                        variant="flat"
                        onPress={handleResetTimer}
                        isDisabled={currentMatch.status === 'completed'}
                      >
                        {t('kumite:match.reset')}
                      </Button>
                    </div>
                  </div>

                  <Divider />

                  {/* Competidores */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Aka (Rojo) */}
                    <div className="border-2 border-red-500 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <Chip color="danger" className="mb-2">
                          {t('kumite:competitor.aka')}
                        </Chip>
                        <h3 className="text-xl font-bold">
                          {currentMatch.competidorAka?.Nombre || 'BYE'}
                        </h3>
                        <div className="text-4xl font-bold my-4">{currentMatch.scoreAka}</div>
                      </div>

                      {currentMatch.competidorAka && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              color="primary"
                              fullWidth
                              onPress={() => handleAddScore('aka', 0.5)}
                              isDisabled={currentMatch.status === 'completed'}
                            >
                              +0.5 {t('kumite:actions.wazari')}
                            </Button>
                            <Button
                              size="sm"
                              color="secondary"
                              fullWidth
                              onPress={() => handleAddScore('aka', 1)}
                              isDisabled={currentMatch.status === 'completed'}
                            >
                              +1 {t('kumite:actions.ippon')}
                            </Button>
                          </div>

                          <Divider />

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              {t('kumite:penalties.title')}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesAka || []).map((p, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onClose={currentMatch.status === 'completed' ? undefined : () => handleRemovePenalty('aka', idx)}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Chip>
                              ))}
                            </div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mt-2">
                              {t('kumite:warnings.title')}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsAka || []).map((w, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onClose={currentMatch.status === 'completed' ? undefined : () => handleRemoveWarning('aka', idx)}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Chip>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {(['atenai', 'atenai_chui', 'atenai_hansoku'] as PenaltyType[]).map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  onPress={() => handleAddPenalty('aka', p)}
                                  isDisabled={currentMatch.status === 'completed' || currentMatch.penaltiesAka?.includes(p)}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {(['kinshi', 'kinshi_ni', 'kinshi_chui', 'kinshi_hansoku'] as WarningType[]).map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  onPress={() => handleAddWarning('aka', w)}
                                  isDisabled={currentMatch.status === 'completed' || currentMatch.warningsAka?.includes(w)}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Divider />

                          <Button
                            size="sm"
                            color="danger"
                            variant="bordered"
                            fullWidth
                            onPress={() => handleDeclareWinner(currentMatch.competidorAka!.id)}
                            isDisabled={currentMatch.status === 'completed'}
                          >
                            {t('kumite:actions.declareWinner')}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Shiro (Blanco) */}
                    <div className="border-2 border-gray-400 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <Chip className="mb-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white">
                          {t('kumite:competitor.shiro')}
                        </Chip>
                        <h3 className="text-xl font-bold">
                          {currentMatch.competidorShiro?.Nombre || 'BYE'}
                        </h3>
                        <div className="text-4xl font-bold my-4">{currentMatch.scoreShiro}</div>
                      </div>

                      {currentMatch.competidorShiro && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              color="primary"
                              fullWidth
                              onPress={() => handleAddScore('shiro', 0.5)}
                              isDisabled={currentMatch.status === 'completed'}
                            >
                              +0.5 {t('kumite:actions.wazari')}
                            </Button>
                            <Button
                              size="sm"
                              color="secondary"
                              fullWidth
                              onPress={() => handleAddScore('shiro', 1)}
                              isDisabled={currentMatch.status === 'completed'}
                            >
                              +1 {t('kumite:actions.ippon')}
                            </Button>
                          </div>

                          <Divider />

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase">
                              {t('kumite:penalties.title')}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.penaltiesShiro || []).map((p, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onClose={currentMatch.status === 'completed' ? undefined : () => handleRemovePenalty('shiro', idx)}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Chip>
                              ))}
                            </div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mt-2">
                              {t('kumite:warnings.title')}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2 min-h-6">
                              {(currentMatch.warningsShiro || []).map((w, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onClose={currentMatch.status === 'completed' ? undefined : () => handleRemoveWarning('shiro', idx)}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Chip>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {(['atenai', 'atenai_chui', 'atenai_hansoku'] as PenaltyType[]).map((p) => (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  onPress={() => handleAddPenalty('shiro', p)}
                                  isDisabled={currentMatch.status === 'completed' || currentMatch.penaltiesShiro?.includes(p)}
                                >
                                  {t(`kumite:penalties.${p}`)}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {(['kinshi', 'kinshi_ni', 'kinshi_chui', 'kinshi_hansoku'] as WarningType[]).map((w) => (
                                <Button
                                  key={w}
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                  onPress={() => handleAddWarning('shiro', w)}
                                  isDisabled={currentMatch.status === 'completed' || currentMatch.warningsShiro?.includes(w)}
                                >
                                  {t(`kumite:warnings.${w}`)}
                                </Button>
                              ))}
                            </div>
                          </div >

                          <Divider />

                          <Button
                            size="sm"
                            color="danger"
                            variant="bordered"
                            fullWidth
                            onPress={() => handleDeclareWinner(currentMatch.competidorShiro!.id)}
                            isDisabled={currentMatch.status === 'completed'}
                          >
                            {t('kumite:actions.declareWinner')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado del Match */}
                  <div className="text-center">
                    <Chip color={currentMatch.status === 'completed' ? 'success' : 'warning'}>
                      {currentMatch.status === 'pending' && t('kumite:bracket.pending')}
                      {currentMatch.status === 'in_progress' && t('kumite:bracket.inProgress')}
                      {currentMatch.status === 'completed' && t('kumite:bracket.completed')}
                    </Chip>

                    {currentMatch.status === 'completed' && currentMatch.scoreAka === currentMatch.scoreShiro && !currentMatch.winnerId && !currentMatch.isEnchoSen && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Button
                          color="warning"
                          className="w-full font-bold"
                          onPress={() => setShowEnchoSenModal(true)}
                        >
                          {t('kumite:actions.startEnchoSen')}
                        </Button>
                      </div>
                    )}

                    {currentMatch.status === 'completed' && currentMatch.isEnchoSen && currentMatch.scoreAka === currentMatch.scoreShiro && !currentMatch.winnerId && (
                      // Si Encho-sen termina empate, mostrar Hantei como fallback
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="font-bold mb-2">{t('kumite:actions.hantei')}</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            color="danger"
                            onPress={() => handleDeclareWinner(currentMatch.competidorAka!.id, 'hantei')}
                          >
                            {t('kumite:competitor.aka')}
                          </Button>
                          <Button
                            className="bg-gray-200 text-gray-800"
                            onPress={() => handleDeclareWinner(currentMatch.competidorShiro!.id, 'hantei')}
                          >
                            {t('kumite:competitor.shiro')}
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentMatch.status === 'completed' && (currentMatch.winnerId || currentMatch.scoreAka !== currentMatch.scoreShiro) && (
                      <div className="mt-4">
                        <Button
                          color="primary"
                          size="lg"
                          onPress={handleNextMatch}
                          className="px-8 font-bold"
                        >
                          {t('kumite:messages.nextMatch')} →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <AgregarCompetidor
        isOpen={showAgregarDialog}
        onClose={() => setShowAgregarDialog(false)}
        onAdd={handleAddCompetidor}
      />

      {state.bracket && (
        <>
          <BracketView
            isOpen={showBracketDialog}
            onClose={() => setShowBracketDialog(false)}
            bracket={state.bracket}
            onSelectMatch={handleSelectMatch}
          />
          <ResultadosFinales
            isOpen={showResultsDialog}
            onClose={() => setShowResultsDialog(false)}
            bracket={state.bracket}
            categoria={state.categoria}
            area={state.area}
          />
          {winnerInfo && (
            <WinnerModal
              isOpen={showWinnerModal}
              onClose={() => setShowWinnerModal(false)}
              winnerName={winnerInfo.name}
              scoreAka={winnerInfo.scoreAka}
              scoreShiro={winnerInfo.scoreShiro}
              side={winnerInfo.side}
              reason={winnerInfo.reason}
              hasNextMatch={state.bracket?.matches.some(
                (m) => m.status === 'pending' && m.competidorAka && m.competidorShiro
              )}
              onNextMatch={handleNextMatch}
            />
          )}
          <EnchoSenModal
            isOpen={showEnchoSenModal}
            onClose={() => setShowEnchoSenModal(false)}
            onConfirm={handleStartEnchoSen}
          />
        </>
      )}
    </div>
  );
}
