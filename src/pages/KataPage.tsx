import { useState } from "react";
import { Button, Card, CardBody, Input, Select, SelectItem, Accordion, AccordionItem } from "@heroui/react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useKata } from "@/context/KataContext";
import { calculateKataMetrics, compareCompetitors } from "@/utils/kataUtils";
import { showToast } from "@/utils/toast";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import HistorialCompetencias from "@/components/HistorialCompetencias";
import ExcelUploader from "@/components/ExcelUploader";
import AgregarCompetidor from "@/pages/KataComponents/AgregarCompetidor";
import ResultadosFinales from "@/pages/KataComponents/ResultadosFinales";
import { CompetenciaKata, Competidor } from "@/types";
import { generateExcelFile } from "@/utils/excelUtils";
import { generateKataPDF } from "@/utils/pdfUtils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PUNTUACIONES } from "@/utils/puntuaciones";

export default function KataPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['kumite', 'common']);

  const { state, dispatch } = useKata();
  const [showHistorial, setShowHistorial] = useState(false);
  const [showAgregarCompetidor, setShowAgregarCompetidor] = useState(false);
  const [showResultados, setShowResultados] = useState(false);

  const CANTIDADJUECES = [{ key: 3, label: '3 Jueces' }, { key: 5, label: '5 Jueces' }];
  const PUNTACIONMEDIA = [{ key: 6, label: 'Media 6' }, { key: 7, label: 'Media 7' }, { key: 8, label: 'Media 8' }]
  const AREAS = [{ key: 1, label: 'Area 1' }, { key: 2, label: 'Area 2' }, { key: 3, label: 'Area 3' }, { key: 4, label: 'Area 4' }];


  // Función para abrir la ventana de proyección
  const handleOpenKataDisplay = async () => {
    try {
      // Verificar si la ventana ya existe
      const existingWindow = await WebviewWindow.getByLabel('kata-display');

      if (existingWindow) {
        await existingWindow.setFocus();
        showToast.success('Ventana de proyección ya está abierta');
        return;
      }

      // Crear nueva ventana usando el comando Rust
      await invoke('open_kata_display');

      // Actualizar estado
      dispatch({ type: 'SET_DISPLAY_WINDOW', payload: true });
      showToast.success('Ventana de proyección abierta');
    } catch (error) {
      console.error('Error opening display window:', error);
      showToast.error('Error al abrir ventana de proyección');
    }
  };

  // Función para cerrar la ventana de proyección
  const handleCloseKataDisplay = async () => {
    try {
      await invoke('close_kata_display');
      dispatch({ type: 'SET_DISPLAY_WINDOW', payload: false });
      showToast.success('Ventana de proyección cerrada');
    } catch (error) {
      console.error('Error closing display window:', error);
      showToast.error('Error al cerrar ventana de proyección');
    }
  };

  // Función para guardar competencia
  /*   const handleGuardarCompetencia = async () => {
      try {
        if (state.competidores.length === 0) {
          showToast.error('No hay competidores para guardar');
          return;
        }
  
        const loadingToast = showToast.loading('Guardando competencia...');
        const competenciaId = await guardarCompetencia();
        showToast.dismiss(loadingToast);
        showToast.success(`Competencia guardada con ID: ${competenciaId}`);
      } catch (error) {
        console.error('Error saving competition:', error);
        showToast.error('Error al guardar competencia');
      }
    }; */

  // Función para resetear todo
  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos?')) {
      dispatch({ type: 'RESET_ALL' });
      showToast.success('Datos reseteados');
    }
  };

  // Función para cargar competencia desde historial
  const handleLoadCompetencia = (competencia: CompetenciaKata) => {
    // Convertir competidores de DB a formato de la app
    const competidores = competencia.competidores.map((comp, index) => ({
      id: index + 1,
      Nombre: comp.nombre,
      Edad: comp.edad,
      PuntajeFinal: comp.puntajeFinal,
      PuntajesJueces: comp.puntajesJueces.map((p) => p.toString()),
      Kiken: comp.descalificado,
    }));

    // Actualizar estado
    dispatch({ type: 'SET_COMPETIDORES', payload: competidores });
    dispatch({ type: 'SET_AREA', payload: competencia.area });
    dispatch({ type: 'SET_CATEGORIA', payload: { categoria: competencia.categoria, titulo: competencia.categoria } });

    showToast.success('Competencia cargada desde el historial');
  };

  // Función para cargar competidores desde Excel
  const handleCompetidoresLoaded = (competidores: Competidor[], categoria: string) => {
    dispatch({ type: 'SET_COMPETIDORES', payload: competidores });
    dispatch({ type: 'SET_CATEGORIA', payload: { categoria, titulo: categoria } });
  };

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    try {
      if (state.competidores.length === 0) {
        showToast.error('No hay competidores para exportar');
        return;
      }

      // Generar nombre de archivo
      const fileName = `kata_${state.area}_${state.categoria}_${Date.now()}.xlsx`;

      // Abrir diálogo para guardar
      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: 'Excel',
            extensions: ['xlsx'],
          },
        ],
      });

      if (!filePath) return;

      // Generar Excel
      const excelBuffer = generateExcelFile(
        state.competidores,
        state.categoria || 'Sin categoría',
        state.area || 'Sin área'
      );

      // Guardar archivo
      await writeFile(filePath, new Uint8Array(excelBuffer));

      showToast.success('Archivo Excel exportado exitosamente');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast.error('Error al exportar a Excel');
    }
  };

  // Función para exportar a PDF
  const handleExportPDF = async () => {
    try {
      if (state.competidores.length === 0) {
        showToast.error('No hay competidores para exportar');
        return;
      }

      // Generar nombre de archivo
      const fileName = `kata_${state.area}_${state.categoria}_${Date.now()}.pdf`;

      // Abrir diálogo para guardar
      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: 'PDF',
            extensions: ['pdf'],
          },
        ],
      });

      if (!filePath) return;

      // Generar PDF
      const pdfBuffer = generateKataPDF(
        state.competidores,
        state.categoria || 'Sin categoría',
        state.area || 'Sin área',
        new Date().toLocaleDateString('es-ES')
      );

      // Guardar archivo
      await writeFile(filePath, new Uint8Array(pdfBuffer));

      showToast.success('Archivo PDF exportado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast.error('Error al exportar a PDF');
    }
  };

  // Función para agregar competidor
  const handleAddCompetidor = (nombre: string, edad: number) => {
    const nuevoCompetidor: Competidor = {
      id: state.competidores.length + 1,
      Nombre: nombre,
      Edad: edad,
      Categoria: state.categoria,
      PuntajeFinal: null,
      PuntajesJueces: [],
      Kiken: false,
    };

    dispatch({ type: 'ADD_COMPETIDOR', payload: nuevoCompetidor });
  };



  // Función para descalificar (Kiken)
  const handleKiken = (competidor: Competidor) => {
    if (confirm(`¿Descalificar a ${competidor.Nombre}?`)) {
      dispatch({
        type: 'UPDATE_COMPETIDOR',
        payload: {
          id: competidor.id,
          data: {
            Kiken: true,
            PuntajeFinal: null,
            PuntajesJueces: [],
          },
        },
      });
      showToast.success('Competidor descalificado');
    }
  };

  // Función para eliminar competidor
  const handleEliminarCompetidor = (id: number) => {
    if (confirm('¿Eliminar este competidor?')) {
      const nuevosCompetidores = state.competidores.filter((c) => c.id !== id);
      dispatch({ type: 'SET_COMPETIDORES', payload: nuevosCompetidores });
      showToast.success('Competidor eliminado');
    }
  };

  // Función para iniciar desempate
  const handleStartTieBreaker = (tiedCompetitorIds: number[]) => {
    // 1. Archivar ronda actual
    const currentRoundNumber = state.previousRounds.length + 1;
    const roundToArchive = {
      id: currentRoundNumber,
      nombre: `Ronda ${currentRoundNumber}`,
      competidores: [...state.competidores], // Copia profunda de competidores actuales
      fecha: new Date().toISOString()
    };
    dispatch({ type: 'ARCHIVE_ROUND', payload: roundToArchive });

    // 2. Preparar nueva ronda con competidores empatados
    const tiedCompetitors = state.competidores
      .filter(c => tiedCompetitorIds.includes(c.id))
      .map(c => ({
        ...c,
        PuntajeFinal: null,
        PuntajesJueces: [],
        previousScore: c.PuntajeFinal // Opcional: guardar puntaje anterior si se desea mostrar
      }));

    dispatch({ type: 'SET_COMPETIDORES', payload: tiedCompetitors });
    setShowResultados(false);
    showToast.success(`Ronda ${currentRoundNumber} archivada. Iniciando desempate.`);
  };

  // Función para avanzar a la siguiente ronda (cut off)
  const handleAdvanceRound = (cutoff: number) => {
    // 1. Calcular métricas y ordenar
    const competidoresConMetricas = state.competidores
      .filter(c => c.PuntajeFinal !== null && !c.Kiken)
      .map(c => ({
        competidor: c,
        metrics: calculateKataMetrics((c.PuntajesJueces || []).map(p => p || '0'), 5)
      }));

    const sorted = competidoresConMetricas
      .sort((a, b) => compareCompetitors(a.metrics, b.metrics))
      .map(w => w.competidor);

    const winners = sorted.slice(0, cutoff);

    // 2. Archivar ronda actual
    const currentRoundNumber = state.previousRounds.length + 1;
    const roundToArchive = {
      id: currentRoundNumber,
      nombre: `Ronda ${currentRoundNumber}`,
      competidores: [...state.competidores],
      fecha: new Date().toISOString()
    };
    dispatch({ type: 'ARCHIVE_ROUND', payload: roundToArchive });

    // 3. Preparar nueva ronda con los ganadores
    const nextRoundCompetitors = winners.map(c => ({
      ...c,
      PuntajeFinal: null,
      PuntajesJueces: []
    }));

    dispatch({ type: 'SET_COMPETIDORES', payload: nextRoundCompetitors });
    setShowResultados(false);
    showToast.success(`Siguiente ronda iniciada con ${winners.length} competidores`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Módulo Kata
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestión de evaluaciones de formas
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="flat" onPress={() => navigate('/inicio')}>
              ← {t('common:buttons.back')}
            </Button>
            {/*             <Button
              color="secondary"
              variant="flat"
              onPress={() => setShowHistorial(true)}
            >
              Ver Historial
            </Button> */}

            <Button
              color="primary"
              onPress={handleOpenKataDisplay}
              isDisabled={state.displayWindowOpen}
            >
              {state.displayWindowOpen ? 'Proyección Abierta' : 'Abrir Proyección'}
            </Button>

            {state.displayWindowOpen && (
              <Button
                color="danger"
                variant="flat"
                onPress={handleCloseKataDisplay}
              >
                Cerrar Proyección
              </Button>
            )}

            {/*             <Button
              color="success"
              onPress={handleGuardarCompetencia}
              isDisabled={state.competidores.length === 0}
            >
              Guardar Competencia
            </Button> */}
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered">Exportar</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions" disabledKeys={state.competidores.length === 0 ? ['excel', 'pdf'] : []}>
                <DropdownItem key="excel" onPress={handleExportExcel} className="text-success" color="default">
                  Excel
                </DropdownItem>
                <DropdownItem key="pdf" onPress={handleExportPDF} className="text-danger" color="default">
                  PDF
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              color="warning"
              variant="flat"
              onPress={handleReset}
            >
              Resetear
            </Button>

            <Button
              color="secondary"
              onPress={() => setShowResultados(true)}
              isDisabled={state.competidores.length === 0}
            >
              Ver Resultados
            </Button>
          </div>
        </div>

        {/* Historial de Rondas Anteriores (Comprimido) */}
        {state.previousRounds && state.previousRounds.length > 0 && (
          <div className="mb-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Historial de Rondas</h2>
            {state.previousRounds.map((ronda) => (
              <Card key={ronda.id} className="bg-gray-100 dark:bg-gray-800">
                <CardBody className="p-0"> {/* Padding 0 para controlar mejor el layout interno */}
                  <div className="flex flex-col">
                    {/* Header de la Ronda (Siempre visible) */}
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="text-lg font-bold">{ronda.nombre}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(ronda.fecha).toLocaleTimeString()} - {ronda.competidores.length} Competidores
                        </p>
                      </div>
                      <Accordion>
                        <AccordionItem
                          key="1"
                          aria-label={`Ver detalles de ${ronda.nombre}`}
                          title={<span className="text-primary text-sm font-semibold">Ver Detalles / Descomprimir</span>}
                        >
                          {/* Tabla Detallada (Contenido del acordeón) */}
                          <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th scope="col" className="px-4 py-3">#</th>
                                  <th scope="col" className="px-4 py-3">Nombre</th>
                                  <th scope="col" className="px-4 py-3">Puntajes</th>
                                  <th scope="col" className="px-4 py-3 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ronda.competidores.map((comp, idx) => (
                                  <tr key={comp.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{comp.Nombre}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex gap-1">
                                        {comp.PuntajesJueces?.map((p, i) => (
                                          <span key={i} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">{p}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                                      {comp.PuntajeFinal?.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Configuración */}
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-2xl font-bold mb-4">Configuración</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Área */}
              <Select
                labelPlacement="outside-top"
                label="Área"
                placeholder="Selecciona un área"
                selectedKeys={state.area ? [state.area] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  dispatch({ type: 'SET_AREA', payload: selected });
                }}
              >
                {AREAS.map((area) => (
                  <SelectItem key={area.key}>
                    {area.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Número de Jueces */}
              <Select
                labelPlacement="outside-top"
                label="Número de Jueces"
                placeholder="Selecciona número de jueces"
                selectedKeys={[state.numJudges.toString()]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  dispatch({ type: 'SET_NUM_JUDGES', payload: parseInt(selected) });
                }}
              >
                {CANTIDADJUECES.map((juez) => (
                  <SelectItem key={juez.key}>
                    {juez.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Base de Puntuación */}
              <Select
                labelPlacement="outside-top"
                label="Puntuación Media"
                placeholder="Selecciona base"
                selectedKeys={state.base ? [state.base.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  dispatch({ type: 'SET_BASE', payload: parseInt(selected) });
                }}
              >
                {PUNTACIONMEDIA.map((base) => (
                  <SelectItem key={base.key}>
                    {base.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Categoría */}
            <div className="mt-4">
              <Input
                labelPlacement="outside-top"
                label="Categoría"
                placeholder="Ej: Cadete Masculino"
                value={state.categoria}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_CATEGORIA',
                    payload: { categoria: e.target.value, titulo: e.target.value },
                  })
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Importar desde Excel */}
        <div className="mb-6">
          <ExcelUploader onCompetidoresLoaded={handleCompetidoresLoaded} page="kata" />
        </div>

        {/* Competidores */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Ronda Actual: Competidores</h2>
              <Button
                color="primary"
                onPress={() => setShowAgregarCompetidor(true)}
              >
                + Agregar Competidor
              </Button>
            </div>

            {state.competidores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No hay competidores agregados</p>
                <p className="text-sm mt-2">
                  Agrega competidores manualmente o importa desde Excel
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.competidores.map((competidor, index) => {
                  const puntajesValidos = (competidor.PuntajesJueces || [])
                    .map(p => parseFloat(p || '0'))
                    .filter(p => !isNaN(p) && p > 0);

                  let min = 0;
                  let max = 0;
                  let total = 0;

                  if (puntajesValidos.length === state.numJudges) {
                    const sorted = [...puntajesValidos].sort((a, b) => a - b);
                    if (state.numJudges === 5) {
                      min = sorted[0];
                      max = sorted[4];
                      total = sorted.slice(1, 4).reduce((a, b) => a + b, 0);
                    } else {
                      total = sorted.reduce((a, b) => a + b, 0);
                    }
                  } else if (competidor.PuntajeFinal) {
                    total = competidor.PuntajeFinal;
                  }

                  const updatePuntaje = (juezIndex: number, valor: string) => {
                    const newPuntajes = [...(competidor.PuntajesJueces || Array(state.numJudges).fill(''))];
                    while (newPuntajes.length < state.numJudges) newPuntajes.push('');

                    newPuntajes[juezIndex] = valor;

                    const pValidos = newPuntajes
                      .map(p => parseFloat(p || '0'))
                      .filter(p => !isNaN(p) && p > 0);

                    let nuevoTotal = 0;

                    if (pValidos.length === state.numJudges) {
                      const sorted = [...pValidos].sort((a, b) => a - b);
                      if (state.numJudges === 5) {
                        nuevoTotal = sorted.slice(1, 4).reduce((a, b) => a + b, 0);
                      } else {
                        nuevoTotal = sorted.reduce((a, b) => a + b, 0);
                      }
                    }

                    dispatch({
                      type: 'UPDATE_COMPETIDOR',
                      payload: {
                        id: competidor.id,
                        data: {
                          PuntajesJueces: newPuntajes,
                          PuntajeFinal: nuevoTotal > 0 ? nuevoTotal : null
                        }
                      }
                    });
                  };

                  return (
                    <Card
                      key={competidor.id}
                      className={competidor.Kiken ? 'bg-red-50 dark:bg-red-900/20' : ''}
                    >
                      <CardBody>
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{competidor.Nombre}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Edad: {competidor.Edad}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!competidor.Kiken && (
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant="flat"
                                  onPress={() => handleKiken(competidor)}
                                >
                                  Kiken
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleEliminarCompetidor(competidor.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>

                          {!competidor.Kiken && (
                            <div className="flex flex-wrap items-end gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <div className="flex gap-2">
                                {Array.from({ length: state.numJudges }).map((_, jIndex) => (
                                  <div key={jIndex} className="w-20">
                                    <Select
                                      labelPlacement="outside-top"
                                      label={`Juez ${jIndex + 1}`}
                                      size="sm"
                                      variant="bordered"
                                      selectedKeys={competidor.PuntajesJueces?.[jIndex] ? [competidor.PuntajesJueces[jIndex]] : []}
                                      onChange={(e) => updatePuntaje(jIndex, e.target.value)}
                                      className="min-w-[80px]"
                                    >
                                      {(() => {
                                        const base = state.base || 7;
                                        let scores = PUNTUACIONES.media; // Default to media (7)
                                        if (base === 6) scores = PUNTUACIONES.baja;
                                        if (base === 8) scores = PUNTUACIONES.alta;

                                        return scores.map((score) => (
                                          <SelectItem key={score.key}>
                                            {score.label}
                                          </SelectItem>
                                        ));
                                      })()}
                                    </Select>
                                  </div>
                                ))}
                              </div>

                              <div className="w-[1px] h-10 bg-gray-300 dark:bg-gray-600 mx-2 hidden md:block"></div>

                              <div className="flex gap-2">
                                {state.numJudges === 5 && (
                                  <>
                                    <div className="w-20">
                                      <Input
                                        labelPlacement="outside-top"
                                        label="Min"
                                        size="sm"
                                        variant="flat"
                                        isReadOnly
                                        value={min > 0 ? min.toFixed(2) : '-'}
                                        className="opacity-75"
                                      />
                                    </div>
                                    <div className="w-20">
                                      <Input
                                        labelPlacement="outside-top"
                                        label="Max"
                                        size="sm"
                                        variant="flat"
                                        isReadOnly
                                        value={max > 0 ? max.toFixed(2) : '-'}
                                        className="opacity-75"
                                      />
                                    </div>
                                  </>
                                )}

                                <div className="w-24">
                                  <Input
                                    labelPlacement="outside-top"
                                    label="Total"
                                    size="sm"
                                    color="success"
                                    variant="faded"
                                    isReadOnly
                                    value={total > 0 ? total.toFixed(2) : '-'}
                                    classNames={{
                                      input: "font-bold text-lg text-green-700 dark:text-green-400"
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {competidor.Kiken && (
                            <p className="text-center text-red-600 font-bold py-2">
                              ⚠️ COMPETIDOR DESCALIFICADO (KIKEN)
                            </p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modal de Historial */}
        <HistorialCompetencias
          isOpen={showHistorial}
          onClose={() => setShowHistorial(false)}
          onLoadCompetencia={handleLoadCompetencia}
        />

        {/* Modal Agregar Competidor */}
        <AgregarCompetidor
          isOpen={showAgregarCompetidor}
          onClose={() => setShowAgregarCompetidor(false)}
          onAdd={handleAddCompetidor}
        />



        {/* Modal Resultados Finales */}
        <ResultadosFinales
          isOpen={showResultados}
          onClose={() => setShowResultados(false)}
          competidores={state.competidores}
          categoria={state.categoria}
          area={state.area}
          currentRound={state.previousRounds.length + 1}
          initialCompetitorCount={state.previousRounds.length > 0 ? state.previousRounds[0].competidores.length : state.competidores.length}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onStartTieBreaker={(tiedIds) => {
            if (confirm('¿Estás seguro de iniciar una nueva ronda de desempate? La ronda actual se archivará.')) {
              handleStartTieBreaker(tiedIds);
            }
          }}
          onNextRound={(cutoff) => {
            if (confirm(`¿Estás seguro de pasar a la siguiente ronda con los mejores ${cutoff} competidores?`)) {
              handleAdvanceRound(cutoff);
            }
          }}
        />
      </div>
    </div>
  );
}
