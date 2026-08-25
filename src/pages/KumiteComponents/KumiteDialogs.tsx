import AgregarCompetidor from "./AgregarCompetidor";
import BracketView from "./BracketView";
import ResultadosFinales from "./ResultadosFinales";
import WinnerModal from "./WinnerModal";
import EnchoSenModal from "./EnchoSenModal";

type Props = {
  showAdd: boolean;
  showBracket: boolean;
  showResults: boolean;
  showWinner: boolean;
  showEnchoSen: boolean;
  bracket: any;
  winnerInfo: { name: string; scoreAka: number; scoreShiro: number; side: "aka" | "shiro" | null; reason?: "disqualification" | "hantei" | null };
  categoria: string;
  area: string;
  onAdd: (name: string, age: number) => void;
  onCloseAdd: () => void;
  onCloseBracket: () => void;
  onSelectMatch: (id: number) => void;
  onEditMatchResult: (matchId: number, scoreAka: number, scoreShiro: number, winnerId: number) => void;
  onCloseResults: () => void;
  onCloseWinner: () => void;
  onNextMatch: () => void;
  onCloseEnchoSen: () => void;
  onConfirmEnchoSen: (time: number) => void;
};

export default function KumiteDialogs({ showAdd, showBracket, showResults, showWinner, showEnchoSen, bracket, winnerInfo, categoria, area, onAdd, onCloseAdd, onCloseBracket, onSelectMatch, onEditMatchResult, onCloseResults, onCloseWinner, onNextMatch, onCloseEnchoSen, onConfirmEnchoSen }: Props) {
  return <>
    <AgregarCompetidor isOpen={showAdd} onClose={onCloseAdd} onAdd={onAdd} />
    {bracket && <>
      <BracketView isOpen={showBracket} onClose={onCloseBracket} bracket={bracket} onSelectMatch={onSelectMatch} onEditMatchResult={onEditMatchResult} />
      <ResultadosFinales isOpen={showResults} onClose={onCloseResults} bracket={bracket} categoria={categoria} area={area} />
      <WinnerModal isOpen={showWinner} onClose={onCloseWinner} winnerName={winnerInfo.name} scoreAka={winnerInfo.scoreAka} scoreShiro={winnerInfo.scoreShiro} side={winnerInfo.side} reason={winnerInfo.reason} hasNextMatch={bracket.matches.some((match: any) => match.status === "pending" && match.competidorAka && match.competidorShiro)} onNextMatch={onNextMatch} />
      <EnchoSenModal isOpen={showEnchoSen} onClose={onCloseEnchoSen} onConfirm={onConfirmEnchoSen} />
    </>}
  </>;
}
