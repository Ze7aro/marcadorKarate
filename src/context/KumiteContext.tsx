import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCrossPlatformChannel } from '@/hooks/useCrossPlatformChannel';
import {
  CompetidorKumite,
  Match,
  BracketState,
  KumiteStateSync,
  KUMITE_EVENTS,
  PenaltyType,
  WarningType,
  TechniqueType,
} from '@/types/events';
import {
  advanceWinner,
  calculateScoreFromTechniques,
  createTechniqueCounts,
  penaltiesFromAtenaiCount,
  recalculateBracket,
} from '@/utils/bracketUtils';

interface KumiteState {
  competidores: CompetidorKumite[];
  bracket: BracketState | null;
  currentMatchId: number | null;
  categoria: string;
  tituloCategoria: string;
  area: string;
  matchDuration: number; // En segundos (default: 120)
  winThreshold: number; // Puntos para ganar (default: 8)
  isTimerRunning: boolean;
  showBracketDialog: boolean;
  showResultsDialog: boolean;
  displayWindowOpen: boolean;
  lastSyncTimestamp: number;
}

type KumiteAction =
  | { type: 'SET_COMPETIDORES'; payload: CompetidorKumite[] }
  | { type: 'LOAD_CATEGORY'; payload: { competidores: CompetidorKumite[]; categoria: string } }
  | { type: 'ADD_COMPETIDOR'; payload: CompetidorKumite }
  | { type: 'REMOVE_COMPETIDOR'; payload: number }
  | { type: 'SET_CATEGORIA'; payload: { categoria: string; titulo: string } }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'SET_MATCH_DURATION'; payload: number }
  | { type: 'SET_WIN_THRESHOLD'; payload: number }
  | { type: 'GENERATE_BRACKET'; payload: BracketState }
  | { type: 'UPDATE_MATCH'; payload: { id: number; data: Partial<Match> } }
  | { type: 'SET_CURRENT_MATCH'; payload: number | null }
  | { type: 'UPDATE_TIMER'; payload: { matchId: number; timeRemaining: number } }
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'ADD_SCORE'; payload: { matchId: number; side: 'aka' | 'shiro'; points: number } }
  | { type: 'REMOVE_SCORE'; payload: { matchId: number; side: 'aka' | 'shiro'; points: number } }
  | { type: 'ADD_PENALTY'; payload: { matchId: number; side: 'aka' | 'shiro'; penalty: PenaltyType } }
  | { type: 'REMOVE_PENALTY'; payload: { matchId: number; side: 'aka' | 'shiro'; index: number } }
  | { type: 'ADD_WARNING'; payload: { matchId: number; side: 'aka' | 'shiro'; warning: WarningType } }
  | { type: 'REMOVE_WARNING'; payload: { matchId: number; side: 'aka' | 'shiro'; index: number } }
  | { type: 'SET_ATENAI_COUNT'; payload: { matchId: number; side: 'aka' | 'shiro'; count: number } }
  | { type: 'SWAP_MATCH_COMPETITORS'; payload: { matchId: number } }
  | { type: 'SET_SHOW_BRACKET_DIALOG'; payload: boolean }
  | { type: 'SET_SHOW_RESULTS_DIALOG'; payload: boolean }
  | { type: 'SET_DISPLAY_WINDOW'; payload: boolean }
  | { type: 'SYNC_COMPLETE'; payload: number }
  | { type: 'START_ENCHO_SEN'; payload: { matchId: number; time: number } }
  | { type: 'DECLARE_WINNER'; payload: { matchId: number; winnerId: number; reason?: string } }
  | {
      type: 'EDIT_MATCH_RESULT';
      payload: {
        matchId: number;
        scoreAka: number;
        scoreShiro: number;
        winnerId: number;
      };
    }
  | { type: 'LOAD_STATE'; payload: Partial<KumiteState> }
  | { type: 'RESET_ALL' };

const initialState: KumiteState = {
  competidores: [],
  bracket: null,
  currentMatchId: null,
  categoria: '',
  tituloCategoria: '',
  area: '',
  matchDuration: 120, // 2 minutos
  winThreshold: 8,
  isTimerRunning: false,
  showBracketDialog: false,
  showResultsDialog: false,
  displayWindowOpen: false,
  lastSyncTimestamp: 0,
};

function inferTechniqueCounts(
  score: number,
  counts?: Partial<Record<TechniqueType, number>>,
) {
  if (counts) {
    return createTechniqueCounts(counts);
  }

  const ippon = Math.floor(score);
  const remainder = Math.round((score - ippon) * 2) / 2;
  const wazari = remainder >= 0.5 ? 1 : 0;

  return createTechniqueCounts({ ippon, wazari });
}

function inferAtenaiCount(
  count: number | undefined,
  penalties: PenaltyType[] | undefined,
) {
  if (typeof count === 'number') {
    return Math.max(0, Math.min(3, count));
  }

  if (!penalties) {
    return 0;
  }

  if (penalties.includes('atenai_hansoku')) {
    return 3;
  }

  if (penalties.includes('atenai_chui')) {
    return 2;
  }

  if (penalties.includes('atenai')) {
    return 1;
  }

  return 0;
}

function normalizeMatch(match: Match): Match {
  const techniqueCountsAka = inferTechniqueCounts(
    match.scoreAka,
    match.techniqueCountsAka,
  );
  const techniqueCountsShiro = inferTechniqueCounts(
    match.scoreShiro,
    match.techniqueCountsShiro,
  );
  const atenaiCountAka = inferAtenaiCount(match.atenaiCountAka, match.penaltiesAka);
  const atenaiCountShiro = inferAtenaiCount(
    match.atenaiCountShiro,
    match.penaltiesShiro,
  );

  return {
    ...match,
    techniqueCountsAka,
    techniqueCountsShiro,
    scoreAka: calculateScoreFromTechniques(techniqueCountsAka),
    scoreShiro: calculateScoreFromTechniques(techniqueCountsShiro),
    atenaiCountAka,
    atenaiCountShiro,
    penaltiesAka: penaltiesFromAtenaiCount(atenaiCountAka).concat(
      (match.penaltiesAka || []).filter((item) => !item.startsWith('atenai')),
    ),
    penaltiesShiro: penaltiesFromAtenaiCount(atenaiCountShiro).concat(
      (match.penaltiesShiro || []).filter((item) => !item.startsWith('atenai')),
    ),
    warningsAka: match.warningsAka || [],
    warningsShiro: match.warningsShiro || [],
  };
}

function normalizeBracket(bracket: BracketState | null): BracketState | null {
  if (!bracket) {
    return null;
  }

  return {
    ...bracket,
    matches: bracket.matches.map(normalizeMatch),
  };
}

function kumiteReducer(state: KumiteState, action: KumiteAction): KumiteState {
  switch (action.type) {
    case 'SET_COMPETIDORES':
      return { ...state, competidores: action.payload };
    case 'LOAD_CATEGORY':
      return {
        ...state,
        competidores: action.payload.competidores,
        categoria: action.payload.categoria,
        tituloCategoria: action.payload.categoria,
        bracket: null,
        currentMatchId: null,
        isTimerRunning: false,
        showBracketDialog: false,
        showResultsDialog: false,
      };
    case 'ADD_COMPETIDOR':
      return { ...state, competidores: [...state.competidores, action.payload] };
    case 'REMOVE_COMPETIDOR':
      return {
        ...state,
        competidores: state.competidores.filter((c) => c.id !== action.payload),
      };
    case 'SET_CATEGORIA':
      return {
        ...state,
        categoria: action.payload.categoria,
        tituloCategoria: action.payload.titulo,
      };
    case 'SET_AREA':
      return { ...state, area: action.payload };
    case 'SET_MATCH_DURATION':
      return { ...state, matchDuration: action.payload };
    case 'SET_WIN_THRESHOLD':
      return { ...state, winThreshold: action.payload };
    case 'GENERATE_BRACKET':
      return { ...state, bracket: normalizeBracket(action.payload) };
    case 'UPDATE_MATCH':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.id ? normalizeMatch({ ...m, ...action.payload.data }) : m
          ),
        },
      };
    case 'SET_CURRENT_MATCH':
      return {
        ...state,
        currentMatchId: action.payload,
        bracket: state.bracket
          ? { ...state.bracket, currentMatchId: action.payload }
          : null
      };
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
        bracket: normalizeBracket(action.payload.bracket ?? state.bracket),
      };
    case 'UPDATE_TIMER':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? { ...m, timeRemaining: action.payload.timeRemaining }
              : m
          ),
        },
      };
    case 'START_TIMER':
      if (!state.bracket || !state.currentMatchId) return { ...state, isTimerRunning: true };
      return {
        ...state,
        isTimerRunning: true,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === state.currentMatchId && m.status === 'pending'
              ? { ...m, status: 'in_progress' }
              : m
          ),
        }
      };
    case 'STOP_TIMER':
      return { ...state, isTimerRunning: false };
    case 'ADD_SCORE':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? (() => {
                  const scoreKey =
                    action.payload.side === 'aka'
                      ? 'techniqueCountsAka'
                      : 'techniqueCountsShiro';
                  const technique: TechniqueType =
                    action.payload.points === 0.5 ? 'wazari' : 'ippon';
                  const updatedCounts = createTechniqueCounts({
                    ...m[scoreKey],
                    [technique]: (m[scoreKey]?.[technique] || 0) + 1,
                  });

                  return normalizeMatch({
                    ...m,
                    [scoreKey]: updatedCounts,
                  });
                })()
              : m
          ),
        },
      };
    case 'REMOVE_SCORE':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? (() => {
                  const scoreKey =
                    action.payload.side === 'aka'
                      ? 'techniqueCountsAka'
                      : 'techniqueCountsShiro';
                  const technique: TechniqueType =
                    action.payload.points === 0.5 ? 'wazari' : 'ippon';
                  const updatedCounts = createTechniqueCounts({
                    ...m[scoreKey],
                    [technique]: Math.max(0, (m[scoreKey]?.[technique] || 0) - 1),
                  });

                  return normalizeMatch({
                    ...m,
                    [scoreKey]: updatedCounts,
                  });
                })()
              : m
          ),
        },
      };
    case 'ADD_PENALTY':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? (() => {
                  const penaltiesKey =
                    action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro';

                  if (action.payload.penalty.startsWith('atenai')) {
                    const countKey =
                      action.payload.side === 'aka' ? 'atenaiCountAka' : 'atenaiCountShiro';
                    const currentCount = m[countKey] || 0;
                    return normalizeMatch({
                      ...m,
                      [countKey]: Math.min(3, currentCount + 1),
                    });
                  }

                  return normalizeMatch({
                    ...m,
                    [penaltiesKey]: [
                      ...(m[penaltiesKey] || []),
                      action.payload.penalty,
                    ],
                  });
                })()
              : m
          ),
        },
      };
    case 'REMOVE_PENALTY':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? (() => {
                  const penaltiesKey =
                    action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro';
                  const countKey =
                    action.payload.side === 'aka' ? 'atenaiCountAka' : 'atenaiCountShiro';
                  const penalties = m[penaltiesKey] || [];
                  const penaltyToRemove = penalties[action.payload.index];

                  if (penaltyToRemove?.startsWith('atenai')) {
                    return normalizeMatch({
                      ...m,
                      [countKey]: Math.max(0, (m[countKey] || 0) - 1),
                    });
                  }

                  return normalizeMatch({
                    ...m,
                    [penaltiesKey]: penalties.filter((_, i) => i !== action.payload.index),
                  });
                })()
              : m
          ),
        },
      };
    case 'ADD_WARNING':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? {
                ...m,
                [action.payload.side === 'aka' ? 'warningsAka' : 'warningsShiro']: [
                  ...(m[action.payload.side === 'aka' ? 'warningsAka' : 'warningsShiro'] || []),
                  action.payload.warning,
                ],
              }
              : m
          ),
        },
      };
    case 'REMOVE_WARNING':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? {
                ...m,
                [action.payload.side === 'aka' ? 'warningsAka' : 'warningsShiro']: (m[
                  action.payload.side === 'aka' ? 'warningsAka' : 'warningsShiro'
                ] || []).filter((_, i) => i !== action.payload.index),
              }
              : m
          ),
        },
      };
    case 'SET_ATENAI_COUNT':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? normalizeMatch({
                  ...m,
                  [action.payload.side === 'aka' ? 'atenaiCountAka' : 'atenaiCountShiro']:
                    Math.max(0, Math.min(3, action.payload.count)),
                })
              : m
          ),
        },
      };
    case 'SWAP_MATCH_COMPETITORS':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? normalizeMatch({
                  ...m,
                  competidorAka: m.competidorShiro,
                  competidorShiro: m.competidorAka,
                })
              : m
          ),
        },
      };
    case 'SET_SHOW_BRACKET_DIALOG':
      return { ...state, showBracketDialog: action.payload };
    case 'SET_SHOW_RESULTS_DIALOG':
      return { ...state, showResultsDialog: action.payload };
    case 'SET_DISPLAY_WINDOW':
      return { ...state, displayWindowOpen: action.payload };
    case 'SYNC_COMPLETE':
      return { ...state, lastSyncTimestamp: action.payload };
    case 'RESET_ALL':
      return initialState;
    case 'START_ENCHO_SEN':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? {
                ...m,
                timeRemaining: action.payload.time,
                status: 'in_progress',
                isEnchoSen: true,
                winnerId: undefined,
                result: undefined,
                finishReason: undefined,
              }
              : m
          ),
        },
        isTimerRunning: false, // Wait for manual start
      };
    case 'DECLARE_WINNER':
      if (!state.bracket) return state;
      const bracketWithWinner = {
        ...state.bracket,
        matches: state.bracket.matches.map((m) =>
          m.id === action.payload.matchId
            ? normalizeMatch({
                ...m,
                status: 'completed' as const,
                winnerId: action.payload.winnerId,
              })
            : m
        ),
      };
      const finalBracket = advanceWinner(bracketWithWinner, action.payload.matchId, action.payload.winnerId);
      return {
        ...state,
        bracket: finalBracket,
        isTimerRunning: false,
      };
    case 'EDIT_MATCH_RESULT':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: recalculateBracket({
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.matchId
              ? {
                  ...m,
                  status: 'completed' as const,
                  winnerId: action.payload.winnerId,
                  scoreAka: action.payload.scoreAka,
                  scoreShiro: action.payload.scoreShiro,
                  techniqueCountsAka: inferTechniqueCounts(action.payload.scoreAka),
                  techniqueCountsShiro: inferTechniqueCounts(action.payload.scoreShiro),
                  timeRemaining: m.duration,
                  penaltiesAka: [],
                  penaltiesShiro: [],
                  atenaiCountAka: 0,
                  atenaiCountShiro: 0,
                  warningsAka: [],
                  warningsShiro: [],
                  isEnchoSen: false,
                }
              : m
          ),
        }),
        isTimerRunning: false,
      };
    default:
      return state;
  }
}

interface KumiteContextType {
  state: KumiteState;
  dispatch: React.Dispatch<KumiteAction>;
}

const KumiteContext = createContext<KumiteContextType | undefined>(undefined);

export const KumiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kumiteReducer, initialState);

  // Persistencia con localStorage
  const [storedCompetidores, setStoredCompetidores] = useLocalStorage<CompetidorKumite[]>(
    'kumiteCompetidores',
    []
  );
  const [storedBracket, setStoredBracket] = useLocalStorage<BracketState | null>(
    'kumiteBracket',
    null
  );
  const [storedDuration, setStoredDuration] = useLocalStorage<number>('kumiteDuration', 120);
  const [storedCategoria, setStoredCategoria] = useLocalStorage<string>('kumiteCategoria', '');
  const [storedArea, setStoredArea] = useLocalStorage<string>('kumiteArea', '');

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        competidores: storedCompetidores,
        bracket: normalizeBracket(storedBracket),
        matchDuration: storedDuration,
        categoria: storedCategoria,
        area: storedArea,
      },
    });
  }, []); // Solo al montar

  // Comunicación cross-platform
  const postKumiteMessage = useCrossPlatformChannel<KumiteStateSync>(
    KUMITE_EVENTS.SYNC_STATE,
    (data) => {
      console.log('Received kumite update:', data);
    }
  );

  // Sincronizar estado con localStorage
  useEffect(() => {
    setStoredCompetidores(state.competidores);
  }, [state.competidores, setStoredCompetidores]);

  useEffect(() => {
    setStoredBracket(state.bracket);
  }, [state.bracket, setStoredBracket]);

  useEffect(() => {
    setStoredDuration(state.matchDuration);
  }, [state.matchDuration, setStoredDuration]);

  useEffect(() => {
    setStoredCategoria(state.categoria);
  }, [state.categoria, setStoredCategoria]);

  useEffect(() => {
    setStoredArea(state.area);
  }, [state.area, setStoredArea]);

  // Sincronizar con ventana de proyección
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const currentMatch = state.bracket?.matches.find((m) => m.id === state.currentMatchId);

      const dataParaEnviar: KumiteStateSync = {
        currentMatch: currentMatch || null,
        competidorAka: currentMatch?.competidorAka?.Nombre || '',
        competidorShiro: currentMatch?.competidorShiro?.Nombre || '',
        scoreAka: currentMatch?.scoreAka || 0,
        scoreShiro: currentMatch?.scoreShiro || 0,
        techniqueCountsAka: currentMatch?.techniqueCountsAka || createTechniqueCounts(),
        techniqueCountsShiro: currentMatch?.techniqueCountsShiro || createTechniqueCounts(),
        timeRemaining: currentMatch?.timeRemaining || 0,
        isRunning: state.isTimerRunning,
        categoria: state.categoria,
        area: state.area,
        penaltiesAka: currentMatch?.penaltiesAka || [],
        penaltiesShiro: currentMatch?.penaltiesShiro || [],
        atenaiCountAka: currentMatch?.atenaiCountAka || 0,
        atenaiCountShiro: currentMatch?.atenaiCountShiro || 0,
        warningsAka: currentMatch?.warningsAka || [],
        warningsShiro: currentMatch?.warningsShiro || [],
        status: currentMatch?.status || 'pending',
        winner:
          currentMatch?.status === 'completed' && currentMatch.winnerId
            ? {
              name:
                currentMatch.winnerId === currentMatch.competidorAka?.id
                  ? currentMatch.competidorAka?.Nombre || ''
                  : currentMatch.competidorShiro?.Nombre || '',
              side: currentMatch.winnerId === currentMatch.competidorAka?.id ? 'aka' : 'shiro',
            }
            : null,
      };

      postKumiteMessage(dataParaEnviar);
      console.log('Kumite state synced at:', new Date().toISOString());
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    state.bracket,
    state.currentMatchId,
    state.isTimerRunning,
    state.categoria,
    state.area,
    postKumiteMessage,
  ]);

  return (
    <KumiteContext.Provider value={{ state, dispatch }}>
      {children}
    </KumiteContext.Provider>
  );
};

export const useKumite = () => {
  const context = useContext(KumiteContext);
  if (!context) {
    throw new Error('useKumite must be used within KumiteProvider');
  }
  return context;
};
