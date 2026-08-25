import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { BracketState, CompetidorKumite } from "@/types/events";

export function useKumitePersistence(state: any, dispatch: React.Dispatch<any>, normalizeBracket: (bracket: BracketState | null) => BracketState | null) {
  const [storedCompetidores, setStoredCompetidores] = useLocalStorage<CompetidorKumite[]>("kumiteCompetidores", []);
  const [storedBracket, setStoredBracket] = useLocalStorage<BracketState | null>("kumiteBracket", null);
  const [storedDuration, setStoredDuration] = useLocalStorage<number>("kumiteDuration", 120);
  const [storedCategoria, setStoredCategoria] = useLocalStorage<string>("kumiteCategoria", "");
  const [storedArea, setStoredArea] = useLocalStorage<string>("kumiteArea", "");

  useEffect(() => {
    dispatch({ type: "LOAD_STATE", payload: { competidores: storedCompetidores, bracket: normalizeBracket(storedBracket), matchDuration: storedDuration, categoria: storedCategoria, area: storedArea } });
  }, []);
  useEffect(() => setStoredCompetidores(state.competidores), [state.competidores, setStoredCompetidores]);
  useEffect(() => setStoredBracket(state.bracket), [state.bracket, setStoredBracket]);
  useEffect(() => setStoredDuration(state.matchDuration), [state.matchDuration, setStoredDuration]);
  useEffect(() => setStoredCategoria(state.categoria), [state.categoria, setStoredCategoria]);
  useEffect(() => setStoredArea(state.area), [state.area, setStoredArea]);
}
