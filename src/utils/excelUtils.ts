import * as XLSX from 'xlsx';
import { Competidor } from '@/types';
import { KataRoundResult } from './kataUtils';

const createCompetitorUid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `comp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export async function readExcelFile(fileContent: ArrayBuffer): Promise<{
  competidores: Competidor[];
  categoria: string;
}> {
  try {
    const workbook = XLSX.read(fileContent, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const categoriaCell = worksheet['B1'];
    const categoria = categoriaCell ? XLSX.utils.format_cell(categoriaCell) : '';

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: 1,
      defval: '',
    });

    const competidores: Competidor[] = jsonData.map((row: any, index: number) => ({
      id: index + 1,
      competitorUid: createCompetitorUid(),
      Nombre: row['Nombre'] || row['NOMBRE'] || '',
      Edad: parseInt(row['Edad'] || row['EDAD'] || '0'),
      Categoria: categoria,
      PuntajeFinal: null,
      PuntajesJueces: [],
      Kiken: false,
    }));

    return { competidores, categoria };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Error al leer el archivo Excel. Verifica el formato.');
  }
}

export function generateExcelFile(
  competidores: Competidor[],
  categoria: string,
  area: string,
  finalResults?: KataRoundResult[],
): ArrayBuffer {
  try {
    const workbook = XLSX.utils.book_new();
    const usingAccumulatedResults = !!finalResults && finalResults.length > 0;

    const data: (string | number)[][] = [
      ['Categoria:', categoria, '', '', '', 'Area:', area],
      [],
      usingAccumulatedResults
        ? ['Posicion', 'Nombre', 'Edad', 'Ronda Anterior', 'Ronda Actual', 'Total']
        : ['Posicion', 'Nombre', 'Edad', 'Puntaje Final', 'Puntajes de Jueces', 'Estado'],
    ];

    if (usingAccumulatedResults) {
      finalResults.forEach((comp, index) => {
        data.push([
          index + 1,
          comp.nombre,
          comp.edad,
          comp.round1Score?.toFixed(2) || '',
          comp.round2Score?.toFixed(2) || '',
          comp.total.toFixed(2),
        ]);
      });
    } else {
      const competidoresOrdenados = [...competidores]
        .filter((c) => c.PuntajeFinal !== null)
        .sort((a, b) => (b.PuntajeFinal || 0) - (a.PuntajeFinal || 0));

      competidoresOrdenados.forEach((comp, index) => {
        const puntajesJueces = comp.PuntajesJueces?.join(', ') || '';
        const estado = comp.Kiken ? 'Descalificado' : 'Evaluado';

        data.push([
          index + 1,
          comp.Nombre,
          comp.Edad,
          comp.PuntajeFinal?.toFixed(2) || '',
          puntajesJueces,
          estado,
        ]);
      });
    }

    const noEvaluados = competidores.filter((c) => c.PuntajeFinal === null);
    if (!usingAccumulatedResults && noEvaluados.length > 0) {
      data.push([]);
      data.push(['Competidores no evaluados:']);
      noEvaluados.forEach((comp) => {
        data.push(['', comp.Nombre, comp.Edad, 'Sin evaluar', '', '']);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 8 },
      { wch: 18 },
      { wch: 28 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

    return XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
      cellStyles: true,
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Error al generar el archivo Excel');
  }
}

export function generateExcelTemplate(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  const data = [
    ['Categoria:', 'INGRESA_LA_CATEGORIA_AQUI'],
    [],
    ['Nombre', 'Edad', 'Kyu/Dan (opcional)'],
    ['Juan Perez', 25, '1er Dan'],
    ['Maria Garcia', 22, '2do Kyu'],
    ['Carlos Lopez', 28, '3er Dan'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Competidores');

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}
