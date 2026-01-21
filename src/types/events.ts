// Constantes de eventos para comunicación entre ventanas
export const KATA_EVENTS = {
  UPDATE_SCORES: "kata:update-scores",
  UPDATE_COMPETITOR: "kata:update-competitor",
  UPDATE_CATEGORY: "kata:update-category",
  SYNC_STATE: "kata:sync-state",
  DISPLAY_READY: "kata:display-ready",
} as const;

export interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria?: string;
  TituloCategoria?: string;
  PuntajeFinal?: number | null;
  PuntajesJueces?: (string | null)[];
  Kiken?: boolean;
}

export interface KataScoreUpdate {
  competidorNombre: string;
  categoria: string;
  judges: string[];
  lowScore: string;
  highScore: string;
  finalScore: string;
}

export interface KataStateSync {
  competidor: string;
  id?: number;
  categoria: string;
  puntajes: string[];
  puntajeFinal: string;
  puntajeMenor: string;
  puntajeMayor: string;
  competidores: Competidor[];
  area?: string;
  isFinal?: boolean;
}

export interface TauriEventPayload<T> {
  data: T;
  timestamp: number;
}

// ============================================================================
// KUMITE TYPES
// ============================================================================

// Constantes de eventos Kumite
export const KUMITE_EVENTS = {
  UPDATE_MATCH: "kumite:update-match",
  UPDATE_TIMER: "kumite:update-timer",
  START_MATCH: "kumite:start-match",
  END_MATCH: "kumite:end-match",
  SYNC_STATE: "kumite:sync-state",
  DISPLAY_READY: "kumite:display-ready",
} as const;

// Tipos de combate
export type MatchStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type MatchResult =
  | "winner_aka"
  | "winner_shiro"
  | "draw"
  | "double_disqualification";
export type PenaltyType = "atenai" | "atenai_chui" | "atenai_hansoku";
export type WarningType =
  | "kinshi"
  | "kinshi_ni"
  | "kinshi_chui"
  | "kinshi_hansoku";
export type FinishReason =
  | "points"
  | "time"
  | "hantei"
  | "kiken"
  | "shikaku"
  | "penalty";

// Competidor en Kumite (extiende Competidor base)
export interface CompetidorKumite extends Competidor {
  bracket?: number;
  round?: number;
  position?: number;
}

// Match individual
export interface Match {
  id: number;
  round: number; // Ronda del bracket (1, 2, 3, 4 para cuartos, semi, final)
  position: number; // Posición en la ronda
  competidorAka: CompetidorKumite | null; // Rojo
  competidorShiro: CompetidorKumite | null; // Blanco
  status: MatchStatus;
  winnerId?: number | null;
  result?: MatchResult;
  finishReason?: FinishReason;
  scoreAka: number; // Puntaje competidor Aka
  scoreShiro: number; // Puntaje competidor Shiro
  penaltiesAka: PenaltyType[]; // Penalizaciones Aka
  penaltiesShiro: PenaltyType[]; // Penalizaciones Shiro
  warningsAka: WarningType[]; // Avisos Aka
  warningsShiro: WarningType[]; // Avisos Shiro
  timeRemaining: number; // Tiempo restante en segundos
  duration: number; // Duración configurada del match
  isEnchoSen?: boolean;
}

// Estado del bracket
export interface BracketState {
  totalCompetitors: number;
  rounds: number; // Número de rondas (Math.ceil(log2(totalCompetitors)))
  matches: Match[];
  currentMatchId: number | null;
}

// Sincronización con ventana de proyección
export interface KumiteStateSync {
  currentMatch: Match | null;
  competidorAka: string;
  competidorShiro: string;
  scoreAka: number;
  scoreShiro: number;
  timeRemaining: number;
  isRunning: boolean;
  categoria: string;
  area: string;
  penaltiesAka: PenaltyType[];
  penaltiesShiro: PenaltyType[];
  warningsAka: WarningType[];
  warningsShiro: WarningType[];
  status: MatchStatus;
  winner?: {
    name: string;
    side: "aka" | "shiro";
    reason?: "disqualification" | null;
  } | null;
}

// Para la base de datos
export interface CompetenciaKumite {
  id?: number;
  nombre: string;
  fecha: string;
  area: string;
  categoria: string;
  duracion: number; // Duración de matches en segundos
  competidores: CompetidorKumiteDB[];
  matches: MatchDB[];
}

export interface CompetidorKumiteDB {
  nombre: string;
  edad: number;
  posicionBracket?: number;
}

export interface MatchDB {
  round: number;
  position: number;
  competidorAkaNombre: string | null;
  competidorShiroNombre: string | null;
  ganadorNombre: string | null;
  resultado: MatchResult | null;
  scoreAka: number;
  scoreShiro: number;
}
