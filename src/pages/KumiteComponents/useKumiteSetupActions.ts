import { useKumite } from "@/context/KumiteContext";
import { generateBracket } from "@/utils/bracketUtils";
import type { CompetidorKumite } from "@/types/events";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type Category = { id: string; categoria: string; competidores: CompetidorKumite[] };

export function useKumiteSetupActions(categories: Category[], resetTimer: (time?: number) => void) {
  const { state, dispatch } = useKumite();
  const { t } = useTranslation(["kumite"]);
  const selectedCategoryId = categories.find((item) => item.categoria === state.categoria)?.id || "";

  const addCompetitor = (name: string, age: number) => {
    dispatch({ type: "ADD_COMPETIDOR", payload: { id: Date.now(), Nombre: name, Edad: age, Categoria: state.categoria } });
    toast.success(`${name} agregado`);
  };

  const removeCompetitor = (id: number) => {
    dispatch({ type: "REMOVE_COMPETIDOR", payload: id });
    toast.success(t("kumite:competitor.remove"));
  };

  const selectCategory = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;
    dispatch({ type: "LOAD_CATEGORY", payload: { categoria: category.categoria, competidores: category.competidores.map((competitor, index) => ({ ...competitor, id: index + 1, Categoria: category.categoria })) } });
    resetTimer(state.matchDuration);
    toast.success(`Categoría ${category.categoria} cargada`);
  };

  const generateTournamentBracket = () => {
    if (state.competidores.length < 2) {
      toast.error(t("kumite:messages.minCompetitors"));
      return;
    }
    try {
      const bracket = generateBracket(state.competidores, state.matchDuration);
      dispatch({ type: "GENERATE_BRACKET", payload: bracket });
      dispatch({ type: "SET_CURRENT_MATCH", payload: bracket.currentMatchId });
      toast.success(t("kumite:messages.bracketGenerated", { matches: bracket.matches.length }));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return { selectedCategoryId, addCompetitor, removeCompetitor, selectCategory, generateTournamentBracket };
}
