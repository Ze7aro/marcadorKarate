import { Card, CardBody, Select, SelectItem, Switch } from "@heroui/react";
import { useKata } from "@/context/KataContext";

type Props = {
  categories: Array<{ id: string; categoria: string }>;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
};

const ROUND_FORMATS = [
  { key: "tokui_only", label: "Tokui" },
  { key: "shitei_only", label: "Shitei (solamente)" },
  { key: "sentei_plus_tokui", label: "Sentei + Tokui" },
  { key: "sentei_tokui", label: "Sentei/Tokui + Tokui" },
  { key: "full_three_rounds", label: "Shitei/Sentei + Sentei/Tokui + Tokui" },
] as const;

const JUDGES = [{ key: 3, label: "3 Jueces" }, { key: 5, label: "5 Jueces" }];
const BASES = [{ key: 6, label: "Media 6" }, { key: 7, label: "Media 7" }, { key: 8, label: "Media 8" }];
const AREAS = [1, 2, 3, 4].map((key) => ({ key, label: `Area ${key}` }));

export default function KataConfigurationPanel({ categories, selectedCategoryId, onCategoryChange }: Props) {
  const { state, dispatch } = useKata();

  return (
    <Card className="app-panel rounded-[1.75rem] mb-6">
      <CardBody className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Configuración</h2>
        <div className="rounded-[1.5rem] border border-[rgba(80,125,196,0.16)] bg-[rgba(7,19,35,0.45)] p-5">
          <div className="space-y-4 rounded-[1.25rem] border border-[rgba(80,125,196,0.12)] bg-[rgba(8,20,36,0.78)] p-4">
            <h3 className="text-sm font-bold text-white border-b border-[rgba(80,125,196,0.14)] pb-3">Datos de la Categoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select className="app-dark-select" labelPlacement="outside-top" label="Categoría importada" placeholder="Selecciona una categoría" selectedKeys={selectedCategoryId ? [selectedCategoryId] : []} onSelectionChange={(keys) => { const selected = Array.from(keys)[0] as string; if (selected) onCategoryChange(selected); }}>
                {categories.map((category) => <SelectItem key={category.id} className="text-black">{category.categoria}</SelectItem>)}
              </Select>
              <Select className="app-dark-select" labelPlacement="outside-top" label="Área" placeholder="Selecciona un área" selectedKeys={state.area ? [state.area] : []} onSelectionChange={(keys) => dispatch({ type: "SET_AREA", payload: Array.from(keys)[0] as string })}>
                {AREAS.map((area) => <SelectItem key={area.key} className="text-black">{area.label}</SelectItem>)}
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-4 rounded-[1.25rem] border border-[rgba(80,125,196,0.12)] bg-[rgba(8,20,36,0.78)] p-4">
            <h3 className="text-sm font-bold text-white border-b border-[rgba(80,125,196,0.14)] pb-3">Parámetros de Evaluación</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select className="app-dark-select" labelPlacement="outside-top" label="Formato de rondas" placeholder="Selecciona el formato" selectedKeys={[state.roundFormat]} onSelectionChange={(keys) => { const selected = Array.from(keys)[0] as typeof ROUND_FORMATS[number]["key"]; if (selected) dispatch({ type: "SET_ROUND_FORMAT", payload: selected }); }}>
                {ROUND_FORMATS.map((format) => <SelectItem key={format.key} className="text-black">{format.label}</SelectItem>)}
              </Select>
              <Select className="app-dark-select" labelPlacement="outside-top" label="Número de Jueces" placeholder="Selecciona número de jueces" selectedKeys={[state.numJudges.toString()]} onSelectionChange={(keys) => dispatch({ type: "SET_NUM_JUDGES", payload: parseInt(Array.from(keys)[0] as string) })}>
                {JUDGES.map((judge) => <SelectItem key={judge.key} className="text-black">{judge.label}</SelectItem>)}
              </Select>
              <Select className="app-dark-select" labelPlacement="outside-top" label="Puntuación Media" placeholder="Selecciona base" selectedKeys={state.base ? [state.base.toString()] : []} onSelectionChange={(keys) => dispatch({ type: "SET_BASE", payload: parseInt(Array.from(keys)[0] as string) })}>
                {BASES.map((base) => <SelectItem key={base.key} className="text-black">{base.label}</SelectItem>)}
              </Select>
            </div>
            <Switch isSelected={state.sumRounds} classNames={{ base: "inline-flex items-center gap-3", wrapper: "bg-[rgba(8,17,32,0.72)] border border-[rgba(80,125,196,0.18)] group-data-[selected=true]:bg-[rgba(40,144,255,0.28)] group-data-[selected=true]:border-[rgba(77,195,255,0.4)]", thumb: "bg-white group-data-[selected=true]:bg-sky-200 shadow-sm", label: "text-sm font-semibold text-slate-200" }} onValueChange={(value) => dispatch({ type: "SET_SUM_ROUNDS", payload: value })}>Suma rondas</Switch>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
