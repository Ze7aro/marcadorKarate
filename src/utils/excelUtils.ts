import * as XLSX from 'xlsx';
import { Competidor } from '@/types';

/**
 * Lee un archivo Excel y extrae los competidores
 * Formato esperado:
 * - Celda B1: Categoría
 * - Columnas: Nombre | Edad | Kyu/Dan (opcional para Kata)
 */
export async function readExcelFile(fileContent: ArrayBuffer): Promise<{
  competidores: Competidor[];
  categoria: string;
}> {
  try {
    // Leer el workbook
    const workbook = XLSX.read(fileContent, { type: 'array' });

    // Obtener la primera hoja
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Extraer categoría de la celda B1
    const categoriaCell = worksheet['B1'];
    const categoria = categoriaCell ? XLSX.utils.format_cell(categoriaCell) : '';

    // Convertir hoja a JSON (asumiendo que la data empieza en la fila 2)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: 1, // Empezar desde la fila 2 (índice 1)
      defval: ''
    });

    // Mapear a competidores
    const competidores: Competidor[] = jsonData.map((row: any, index: number) => ({
      id: index + 1,
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

/**
 * Genera un archivo Excel con los resultados de una competencia
 */
export function generateExcelFile(competidores: Competidor[], categoria: string, area: string): ArrayBuffer {
  try {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new();

    // Preparar datos para la hoja
    const data: (string | number)[][] = [
      // Fila de categoría
      ['Categoría:', categoria, '', '', '', 'Área:', area],
      [], // Fila vacía
      // Encabezados
      ['Posición', 'Nombre', 'Edad', 'Puntaje Final', 'Puntajes de Jueces', 'Estado'],
    ];

    // Agregar competidores ordenados por puntaje
    const competidoresOrdenados = [...competidores]
      .filter(c => c.PuntajeFinal !== null)
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

    // Agregar competidores no evaluados
    const noEvaluados = competidores.filter(c => c.PuntajeFinal === null);
    if (noEvaluados.length > 0) {
      data.push([]);
      data.push(['Competidores no evaluados:']);
      noEvaluados.forEach((comp) => {
        data.push(['', comp.Nombre, comp.Edad, 'Sin evaluar', '', '']);
      });
    }

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Aplicar estilos/anchos de columna
    worksheet['!cols'] = [
      { wch: 10 }, // Posición
      { wch: 25 }, // Nombre
      { wch: 8 },  // Edad
      { wch: 15 }, // Puntaje Final
      { wch: 30 }, // Puntajes de Jueces
      { wch: 15 }, // Estado
    ];

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
      cellStyles: true,
    });

    return excelBuffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Error al generar el archivo Excel');
  }
}

/**
 * Genera un template de Excel para importar competidores
 */
export function generateExcelTemplate(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  const data = [
    ['Categoría:', 'INGRESA_LA_CATEGORIA_AQUI'],
    [],
    ['Nombre', 'Edad', 'Kyu/Dan (opcional)'],
    ['Juan Pérez', 25, '1er Dan'],
    ['María García', 22, '2do Kyu'],
    ['Carlos López', 28, '3er Dan'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 10 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Competidores');

  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}
