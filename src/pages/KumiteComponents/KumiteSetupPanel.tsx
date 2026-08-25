import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem } from "@heroui/react";
import { useKumite } from "@/context/KumiteContext";
import { useTranslation } from "react-i18next";

type Props = {
  categories: Array<{ id: string; categoria: string }>;
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  onDurationChange: (duration: number) => void;
  onAddCompetitor: () => void;
  onRemoveCompetitor: (id: number) => void;
  onGenerateBracket: () => void;
};

export default function KumiteSetupPanel({ categories, selectedCategoryId, onCategoryChange, onDurationChange, onAddCompetitor, onRemoveCompetitor, onGenerateBracket }: Props) {
  const { state, dispatch } = useKumite();
  const { t } = useTranslation(["kumite"]);
  return <div className="min-h-0 lg:h-full">
    <Card className="app-panel h-full rounded-[1rem]">
      <CardHeader className="pb-0"><h2 className="text-xl font-semibold text-white">{t("kumite:config.title")}</h2></CardHeader>
      <Divider className="app-subtle-divider" />
      <CardBody className="flex min-h-0 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <Select className="app-dark-select" labelPlacement="outside-top" label="Categoría importada" placeholder="Selecciona una categoría" disallowEmptySelection selectedKeys={selectedCategoryId ? [selectedCategoryId] : []} onSelectionChange={(keys) => { const selected = Array.from(keys)[0] as string; if (selected) onCategoryChange(selected); }}>
            {categories.map((category) => <SelectItem key={category.id} className="text-black">{category.categoria}</SelectItem>)}
          </Select>
          <Select className="app-dark-select" labelPlacement="outside-top" label={t("kumite:config.area")} placeholder={t("kumite:config.area")} disallowEmptySelection selectedKeys={state.area ? [String(state.area)] : []} renderValue={() => state.area ? `Área ${state.area}` : ""} onSelectionChange={(keys) => { const selected = Array.from(keys)[0] as string; if (selected) dispatch({ type: "SET_AREA", payload: selected }); }}>
            {["1", "2", "3", "4"].map((area) => <SelectItem key={area} className="text-black">Área {area}</SelectItem>)}
          </Select>
          <Input className="app-dark-input" labelPlacement="outside-top" label={t("kumite:config.category")} placeholder={t("kumite:config.categoryPlaceholder")} value={state.categoria} onValueChange={(value) => dispatch({ type: "SET_CATEGORIA", payload: { categoria: value, titulo: value } })} />
          <Select className="app-dark-select" labelPlacement="outside-top" label={t("kumite:config.matchDuration")} disallowEmptySelection selectedKeys={[state.matchDuration.toString()]} renderValue={() => state.matchDuration === 30 ? `30 ${t("kumite:config.seconds")}` : state.matchDuration === 60 ? "1:00" : state.matchDuration === 90 ? "1:30" : state.matchDuration === 120 ? "2:00" : "3:00"} onSelectionChange={(keys) => onDurationChange(parseInt(Array.from(keys)[0] as string))}>
            <SelectItem key="30" className="text-black">30 {t("kumite:config.seconds")}</SelectItem><SelectItem key="60" className="text-black">1:00</SelectItem><SelectItem key="90" className="text-black">1:30</SelectItem><SelectItem key="120" className="text-black">2:00</SelectItem><SelectItem key="180" className="text-black">3:00</SelectItem>
          </Select>
          <Divider className="app-subtle-divider" />
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-100">{t("kumite:competitor.list")}</h3>
            <Button className="app-button-primary" fullWidth onPress={onAddCompetitor}>{t("kumite:competitor.add")}</Button>
            <p className="text-sm text-slate-400">{t("kumite:competitor.total")}: {state.competidores.length}</p>
            {state.competidores.map((competitor) => <div key={competitor.id} className="app-competitor-row flex justify-between items-center p-3 rounded-xl"><span className="text-sm text-slate-100 font-medium">{competitor.Nombre} ({competitor.Edad})</span><Button size="sm" className="app-button-danger min-w-12" onPress={() => onRemoveCompetitor(competitor.id)}>×</Button></div>)}
          </div>
        </div>
        {!state.bracket && <div className="shrink-0 border-t border-[rgba(80,125,196,0.18)] pt-4"><Button className="app-button-primary" fullWidth onPress={onGenerateBracket} isDisabled={state.competidores.length < 2}>{t("kumite:bracket.generate")}</Button></div>}
      </CardBody>
    </Card>
  </div>;
}
