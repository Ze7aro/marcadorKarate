import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCrossPlatformChannel } from '@/hooks/useCrossPlatformChannel';
import { Competidor, KataStateSync, KATA_EVENTS } from '@/types/events';
import { invoke } from '@tauri-apps/api/core';

interface KataState {
  competidores: Competidor[];
  judges: string[];
  numJudges: number;
  lowScore: string;
  highScore: string;
  score: string;
  base: number;
  categoria: string;
  tituloCategoria: string;
  area: string;
  showResults: boolean;
  showAgregarDialog: boolean;
  submitted: boolean;
  displayWindowOpen: boolean;
  lastSyncTimestamp: number;
}

type KataAction =
  | { type: 'SET_COMPETIDORES'; payload: Competidor[] }
  | { type: 'ADD_COMPETIDOR'; payload: Competidor }
  | { type: 'UPDATE_COMPETIDOR'; payload: { id: number; data: Partial<Competidor> } }
  | { type: 'SET_JUDGES'; payload: string[] }
  | { type: 'UPDATE_JUDGE'; payload: { index: number; value: string } }
  | { type: 'CLEAR_JUDGE'; payload: number }
  | { type: 'SET_NUM_JUDGES'; payload: number }
  | { type: 'SET_SCORES'; payload: { low: string; high: string; score: string } }
  | { type: 'CLEAR_SCORES' }
  | { type: 'SET_BASE'; payload: number }
  | { type: 'SET_CATEGORIA'; payload: { categoria: string; titulo: string } }
  | { type: 'SET_AREA'; payload: string }
  | { type: 'SET_SHOW_RESULTS'; payload: boolean }
  | { type: 'SET_SHOW_AGREGAR_DIALOG'; payload: boolean }
  | { type: 'SET_SUBMITTED'; payload: boolean }
  | { type: 'SET_DISPLAY_WINDOW'; payload: boolean }
  | { type: 'SYNC_COMPLETE'; payload: number }
  | { type: 'RESET_ALL' };

const initialState: KataState = {
  competidores: [],
  judges: [],
  numJudges: 5,
  lowScore: '',
  highScore: '',
  score: '',
  base: 7,
  categoria: '',
  tituloCategoria: '',
  area: '',
  showResults: false,
  showAgregarDialog: false,
  submitted: false,
  displayWindowOpen: false,
  lastSyncTimestamp: 0,
};

function kataReducer(state: KataState, action: KataAction): KataState {
  switch (action.type) {
    case 'SET_COMPETIDORES':
      return { ...state, competidores: action.payload };
    case 'ADD_COMPETIDOR':
      return { ...state, competidores: [...state.competidores, action.payload] };
    case 'UPDATE_COMPETIDOR':
      return {
        ...state,
        competidores: state.competidores.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        ),
      };
    case 'SET_JUDGES':
      return { ...state, judges: action.payload };
    case 'UPDATE_JUDGE':
      return {
        ...state,
        judges: state.judges.map((j, i) =>
          i === action.payload.index ? action.payload.value : j
        ),
      };
    case 'CLEAR_JUDGE':
      return {
        ...state,
        judges: state.judges.map((j, i) => (i === action.payload ? '' : j)),
      };
    case 'SET_NUM_JUDGES':
      return { ...state, numJudges: action.payload };
    case 'SET_SCORES':
      return {
        ...state,
        lowScore: action.payload.low,
        highScore: action.payload.high,
        score: action.payload.score,
      };
    case 'CLEAR_SCORES':
      return { ...state, lowScore: '', highScore: '', score: '', judges: [] };
    case 'SET_BASE':
      return { ...state, base: action.payload };
    case 'SET_CATEGORIA':
      return {
        ...state,
        categoria: action.payload.categoria,
        tituloCategoria: action.payload.titulo,
      };
    case 'SET_AREA':
      return { ...state, area: action.payload };
    case 'SET_SHOW_RESULTS':
      return { ...state, showResults: action.payload };
    case 'SET_SHOW_AGREGAR_DIALOG':
      return { ...state, showAgregarDialog: action.payload };
    case 'SET_SUBMITTED':
      return { ...state, submitted: action.payload };
    case 'SET_DISPLAY_WINDOW':
      return { ...state, displayWindowOpen: action.payload };
    case 'SYNC_COMPLETE':
      return { ...state, lastSyncTimestamp: action.payload };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

interface KataContextType {
  state: KataState;
  dispatch: React.Dispatch<KataAction>;
  guardarCompetencia: () => Promise<number>;
}

const KataContext = createContext<KataContextType | undefined>(undefined);

export const KataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kataReducer, initialState);

  // Persistencia con localStorage
  const [_storedCompetidores, setStoredCompetidores] = useLocalStorage<Competidor[]>(
    'kataCompetidores',
    []
  );
  const [_storedJudges, setStoredJudges] = useLocalStorage<string[]>('kataJudges', []);
  const [_storedNumJudges, setStoredNumJudges] = useLocalStorage<number>('kataNumJudges', 5);
  const [_storedBase, setStoredBase] = useLocalStorage<number>('kataBase', 7);
  const [_storedCategoria, setStoredCategoria] = useLocalStorage<string>('kataCategoria', '');
  const [_storedArea, setStoredArea] = useLocalStorage<string>('kataArea', '');

  // Comunicación cross-platform
  const postKataMessage = useCrossPlatformChannel<KataStateSync>(
    KATA_EVENTS.SYNC_STATE,
    (data) => {
      console.log('Received kata update:', data);
    }
  );

  // Sincronizar estado con localStorage
  useEffect(() => {
    setStoredCompetidores(state.competidores);
  }, [state.competidores, setStoredCompetidores]);

  useEffect(() => {
    setStoredJudges(state.judges);
  }, [state.judges, setStoredJudges]);

  useEffect(() => {
    setStoredNumJudges(state.numJudges);
  }, [state.numJudges, setStoredNumJudges]);

  useEffect(() => {
    setStoredBase(state.base);
  }, [state.base, setStoredBase]);

  useEffect(() => {
    setStoredCategoria(state.categoria);
  }, [state.categoria, setStoredCategoria]);

  useEffect(() => {
    setStoredArea(state.area);
  }, [state.area, setStoredArea]);

  // Sincronizar con ventana de proyección (con debounce para evitar spam)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const competidorActual = state.competidores.find((c) => !c.PuntajeFinal);

      const dataParaEnviar: KataStateSync = {
        competidor: competidorActual?.Nombre || '',
        categoria: state.categoria,
        puntajes: state.judges,
        puntajeFinal: state.score,
        puntajeMenor: state.lowScore,
        puntajeMayor: state.highScore,
        competidores: state.competidores,
        area: state.area,
      };

      postKataMessage(dataParaEnviar);
      console.log('Kata state synced at:', new Date().toISOString());
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
  }, [
    state.competidores,
    state.judges,
    state.score,
    state.lowScore,
    state.highScore,
    state.categoria,
    state.area,
    postKataMessage,
  ]);

  // Función para guardar competencia en DB
  const guardarCompetencia = async (): Promise<number> => {
    try {
      // Validación previa
      if (!state.area) {
        throw new Error('Debe seleccionar un área antes de guardar');
      }

      if (!state.categoria) {
        throw new Error('Debe ingresar una categoría antes de guardar');
      }

      if (state.competidores.length === 0) {
        throw new Error('No hay competidores para guardar');
      }

      console.log('Guardando competencia en base de datos...');

      const competenciaId = await invoke<number>('guardar_competencia_kata', {
        request: {
          nombre: `Kata ${state.area} - ${new Date().toLocaleDateString()}`,
          fecha: new Date().toISOString().split('T')[0],
          area: state.area,
          categoria: state.categoria,
          competidores: state.competidores.map((c) => ({
            nombre: c.Nombre,
            edad: c.Edad,
            puntajeFinal: c.PuntajeFinal || null,
            puntajesJueces: (c.PuntajesJueces || []).map((p) => parseFloat(p || '0')),
            descalificado: c.Kiken || false,
          })),
        },
      });

      console.log(`Competencia guardada exitosamente con ID: ${competenciaId}`);
      dispatch({ type: 'SYNC_COMPLETE', payload: Date.now() });
      return competenciaId;
    } catch (error) {
      console.error('Error guardando competencia:', error);
      // Re-throw con mensaje más descriptivo
      if (error instanceof Error) {
        throw new Error(`Error al guardar competencia: ${error.message}`);
      }
      throw new Error('Error desconocido al guardar competencia');
    }
  };

  return (
    <KataContext.Provider value={{ state, dispatch, guardarCompetencia }}>
      {children}
    </KataContext.Provider>
  );
};

export const useKata = () => {
  const context = useContext(KataContext);
  if (!context) {
    throw new Error('useKata must be used within KataProvider');
  }
  return context;
};
