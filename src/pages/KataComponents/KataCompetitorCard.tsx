import { Button, Card, CardBody, Input } from "@heroui/react";
import { useKata } from "@/context/KataContext";
import { Competidor } from "@/types";
import StableNativeSelect from "@/components/StableNativeSelect";
import { PUNTUACIONES } from "@/utils/puntuaciones";
import { calculateKataJudgeTotal, calculateKataScoreSummary } from "./kataScoring";

type Props = {
  competidor: Competidor;
  index: number;
  onKiken: (competidor: Competidor) => void;
  onDelete: (id: number) => void;
};

export default function KataCompetitorCard({ competidor, index, onKiken, onDelete }: Props) {
  const { state, dispatch } = useKata();
  const { min, max, total } = calculateKataScoreSummary(
    competidor.PuntajesJueces || [],
    state.numJudges,
    competidor.PuntajeFinal || 0,
  );

  const updateScore = (judgeIndex: number, value: string) => {
    const scores = [...(competidor.PuntajesJueces || Array(state.numJudges).fill(""))];
    while (scores.length < state.numJudges) scores.push("");
    scores[judgeIndex] = value;
    const nextTotal = calculateKataJudgeTotal(scores, state.numJudges);
    dispatch({
      type: "UPDATE_COMPETIDOR",
      payload: {
        id: competidor.id,
        data: { PuntajesJueces: scores, PuntajeFinal: nextTotal > 0 ? nextTotal : null },
      },
    });
  };

  return (
    <Card className={competidor.Kiken ? "rounded-[1.5rem] bg-red-950/30 border border-rose-500/20" : "app-list-row rounded-[1.5rem]"}>
      <CardBody>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">{index + 1}</div>
              <div>
                <p className="font-semibold text-lg">{competidor.Nombre}</p>
                <p className="text-sm text-slate-400">Edad: {competidor.Edad}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!competidor.Kiken && <Button size="sm" color="warning" variant="flat" onPress={() => onKiken(competidor)}>Kiken</Button>}
              <Button size="sm" color="danger" variant="light" onPress={() => onDelete(competidor.id)}>Eliminar</Button>
            </div>
          </div>

          {!competidor.Kiken && (
            <div className="flex flex-wrap items-end gap-4 bg-[rgba(12,24,43,0.72)] p-4 rounded-2xl border border-[rgba(80,125,196,0.14)]">
              <div className="flex gap-2">
                {Array.from({ length: state.numJudges }).map((_, judgeIndex) => {
                  const base = state.base || 7;
                  const scores = base === 6 ? PUNTUACIONES.baja : base === 8 ? PUNTUACIONES.alta : PUNTUACIONES.media;
                  return <StableNativeSelect key={judgeIndex} className="w-20" label={`Juez ${judgeIndex + 1}`} options={scores.map((score) => ({ value: score.key, label: score.label }))} value={competidor.PuntajesJueces?.[judgeIndex] || ""} onChange={(value) => updateScore(judgeIndex, value)} />;
                })}
              </div>
              <div className="w-[1px] h-10 bg-gray-300 dark:bg-gray-600 mx-2 hidden md:block" />
              <div className="flex gap-2">
                {state.numJudges === 5 && <>
                  <Input labelPlacement="outside-top" label="Min" size="sm" variant="flat" isReadOnly value={min > 0 ? min.toFixed(2) : "-"} className="w-20 opacity-75" />
                  <Input labelPlacement="outside-top" label="Max" size="sm" variant="flat" isReadOnly value={max > 0 ? max.toFixed(2) : "-"} className="w-20 opacity-75" />
                </>}
                <Input labelPlacement="outside-top" label="Total" size="sm" color="success" variant="faded" isReadOnly value={total > 0 ? total.toFixed(2) : "-"} className="w-24" classNames={{ input: "font-bold text-lg text-green-700 dark:text-green-400" }} />
              </div>
            </div>
          )}
          {competidor.Kiken && <p className="text-center text-red-600 font-bold py-2">⚠️ COMPETIDOR DESCALIFICADO (KIKEN)</p>}
        </div>
      </CardBody>
    </Card>
  );
}
