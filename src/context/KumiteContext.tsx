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
} from '@/types/events';
import { advanceWinner } from '@/utils/bracketUtils';

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
  | { type: 'ADD_PENALTY'; payload: { matchId: number; side: 'aka' | 'shiro'; penalty: PenaltyType } }
  | { type: 'REMOVE_PENALTY'; payload: { matchId: number; side: 'aka' | 'shiro'; index: number } }
  | { type: 'ADD_WARNING'; payload: { matchId: number; side: 'aka' | 'shiro'; warning: WarningType } }
  | { type: 'REMOVE_WARNING'; payload: { matchId: number; side: 'aka' | 'shiro'; index: number } }
  | { type: 'SET_SHOW_BRACKET_DIALOG'; payload: boolean }
  | { type: 'SET_SHOW_RESULTS_DIALOG'; payload: boolean }
  | { type: 'SET_DISPLAY_WINDOW'; payload: boolean }
  | { type: 'SYNC_COMPLETE'; payload: number }
  | { type: 'START_ENCHO_SEN'; payload: { matchId: number; time: number } }
  | { type: 'DECLARE_WINNER'; payload: { matchId: number; winnerId: number; reason?: string } }
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

function kumiteReducer(state: KumiteState, action: KumiteAction): KumiteState {
  switch (action.type) {
    case 'SET_COMPETIDORES':
      return { ...state, competidores: action.payload };
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
      return { ...state, bracket: action.payload };
    case 'UPDATE_MATCH':
      if (!state.bracket) return state;
      return {
        ...state,
        bracket: {
          ...state.bracket,
          matches: state.bracket.matches.map((m) =>
            m.id === action.payload.id ? { ...m, ...action.payload.data } : m
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
      return { ...state, ...action.payload };
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
              ? {
                ...m,
                [action.payload.side === 'aka' ? 'scoreAka' : 'scoreShiro']:
                  m[action.payload.side === 'aka' ? 'scoreAka' : 'scoreShiro'] +
                  action.payload.points,
              }
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
              ? {
                ...m,
                [action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro']: [
                  ...(m[action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro'] || []),
                  action.payload.penalty,
                ],
              }
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
              ? {
                ...m,
                [action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro']: (m[
                  action.payload.side === 'aka' ? 'penaltiesAka' : 'penaltiesShiro'
                ] || []).filter((_, i) => i !== action.payload.index),
              }
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
            ? { ...m, status: 'completed' as const, winnerId: action.payload.winnerId }
            : m
        ),
      };
      const finalBracket = advanceWinner(bracketWithWinner, action.payload.matchId, action.payload.winnerId);
      return {
        ...state,
        bracket: finalBracket,
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
        bracket: storedBracket,
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
        timeRemaining: currentMatch?.timeRemaining || 0,
        isRunning: state.isTimerRunning,
        categoria: state.categoria,
        area: state.area,
        penaltiesAka: currentMatch?.penaltiesAka || [],
        penaltiesShiro: currentMatch?.penaltiesShiro || [],
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
