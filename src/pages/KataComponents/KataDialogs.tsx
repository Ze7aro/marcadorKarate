import HistorialCompetencias from "@/components/HistorialCompetencias";
import AgregarCompetidor from "./AgregarCompetidor";
import ResultadosFinales from "./ResultadosFinales";
import { CompetenciaKata, Competidor } from "@/types";
import { Round, KataRoundFormatKey } from "@/context/KataContext";

type Props = {
  showHistory: boolean;
  showAddCompetitor: boolean;
  showResults: boolean;
  competitors: Competidor[];
  previousRounds: Round[];
  numJudges: number;
  categoria: string;
  area: string;
  currentRound: number;
  roundFormat: KataRoundFormatKey;
  sumRounds: boolean;
  onCloseHistory: () => void;
  onLoadCompetition: (competition: CompetenciaKata) => void;
  onCloseAddCompetitor: () => void;
  onAddCompetitor: (name: string, age: number) => void;
  onCloseResults: () => void;
  onExport: (format: "excel" | "pdf") => void;
  onTieBreaker: (ids: number[]) => void;
  onNextRound: (ids: number[]) => void;
};

export default function KataDialogs({ showHistory, showAddCompetitor, showResults, competitors, previousRounds, numJudges, categoria, area, currentRound, roundFormat, sumRounds, onCloseHistory, onLoadCompetition, onCloseAddCompetitor, onAddCompetitor, onCloseResults, onExport, onTieBreaker, onNextRound }: Props) {
  return <>
    <HistorialCompetencias isOpen={showHistory} onClose={onCloseHistory} onLoadCompetencia={onLoadCompetition} />
    <AgregarCompetidor isOpen={showAddCompetitor} onClose={onCloseAddCompetitor} onAdd={onAddCompetitor} />
    <ResultadosFinales
      isOpen={showResults}
      onClose={onCloseResults}
      competidores={competitors}
      previousRounds={previousRounds}
      numJudges={numJudges}
      categoria={categoria}
      area={area}
      currentRound={currentRound}
      roundFormat={roundFormat}
      sumRounds={sumRounds}
      onExportExcel={() => onExport("excel")}
      onExportPDF={() => onExport("pdf")}
      onStartTieBreaker={(ids) => {
        if (confirm("¿Estás seguro de iniciar una nueva ronda de desempate? La ronda actual se archivará.")) onTieBreaker(ids);
      }}
      onNextRound={(ids) => {
        if (confirm(`¿Estás seguro de pasar a la siguiente ronda con los mejores ${ids.length} competidores?`)) onNextRound(ids);
      }}
    />
  </>;
}
