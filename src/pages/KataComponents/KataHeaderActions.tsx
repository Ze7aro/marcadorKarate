import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

type Props = {
  displayWindowOpen: boolean;
  competitorCount: number;
  canAdvance: boolean;
  onBack: () => void;
  onOpenDisplay: () => void;
  onCloseDisplay: () => void;
  onExport: (format: "excel" | "pdf") => void;
  onReset: () => void;
  onShowResults: () => void;
  onAdvanceRound: () => void;
};

export default function KataHeaderActions({ displayWindowOpen, competitorCount, canAdvance, onBack, onOpenDisplay, onCloseDisplay, onExport, onReset, onShowResults, onAdvanceRound }: Props) {
  return (
    <div className="app-header">
      <div className="flex gap-2">
        <h1 className="app-title mb-2">Kata</h1>
        <p className="app-subtitle self-end">Gestor de evaluaciones de formas</p>
      </div>
      <div className="app-toolbar">
        <Button className="app-button-secondary" onPress={onBack}>← Volver</Button>
        <Button className="app-button-primary" onPress={onOpenDisplay} isDisabled={displayWindowOpen}>{displayWindowOpen ? "Proyección Abierta" : "Abrir Proyección"}</Button>
        {displayWindowOpen && <Button className="app-button-danger" onPress={onCloseDisplay}>Cerrar Proyección</Button>}
        <Dropdown>
          <DropdownTrigger><Button className="app-button-secondary">Exportar</Button></DropdownTrigger>
          <DropdownMenu aria-label="Exportar resultados" disabledKeys={competitorCount === 0 ? ["excel", "pdf"] : []}>
            <DropdownItem key="excel" onPress={() => onExport("excel")} className="text-success">Excel</DropdownItem>
            <DropdownItem key="pdf" onPress={() => onExport("pdf")} className="text-danger">PDF</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button className="app-button-secondary" onPress={onReset}>Resetear</Button>
        {canAdvance && <Button className="app-button-primary" onPress={onAdvanceRound} isDisabled={competitorCount === 0}>Siguiente ronda</Button>}
        <Button className="app-button-primary" onPress={onShowResults} isDisabled={competitorCount === 0}>Ver Resultados</Button>
      </div>
    </div>
  );
}
