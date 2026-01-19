import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Competidor } from '@/types';

/**
 * Genera un PDF con los resultados de una competencia de Kata
 */
export function generateKataPDF(
  competidores: Competidor[],
  categoria: string,
  area: string,
  fecha: string
): ArrayBuffer {
  try {
    // Crear documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Resultados de Competencia Kata', 105, 15, { align: 'center' });

    // Información de la competencia
    doc.setFontSize(12);
    doc.text(`Categoría: ${categoria}`, 20, 30);
    doc.text(`Área: ${area}`, 20, 38);
    doc.text(`Fecha: ${fecha}`, 20, 46);

    // Ordenar competidores por puntaje
    const competidoresEvaluados = [...competidores]
      .filter((c) => c.PuntajeFinal !== null)
      .sort((a, b) => (b.PuntajeFinal || 0) - (a.PuntajeFinal || 0));

    // Preparar datos para la tabla
    const tableData = competidoresEvaluados.map((comp, index) => {
      const puntajesJueces = comp.PuntajesJueces?.filter((p) => p).join(', ') || '-';
      const medalla = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

      return [
        medalla + ' ' + (index + 1),
        comp.Nombre,
        comp.Edad,
        comp.PuntajeFinal?.toFixed(2) || '-',
        puntajesJueces,
        comp.Kiken ? 'Descalificado' : 'OK',
      ];
    });

    // Agregar tabla con autoTable
    autoTable(doc, {
      startY: 55,
      head: [['Pos.', 'Nombre', 'Edad', 'Puntaje Final', 'Puntajes de Jueces', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 50, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      styles: {
        fontSize: 10,
      },
    });

    // Competidores no evaluados
    const noEvaluados = competidores.filter((c) => c.PuntajeFinal === null);
    if (noEvaluados.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 55;

      doc.setFontSize(12);
      doc.text('Competidores no evaluados:', 20, finalY + 15);

      const noEvaluadosData = noEvaluados.map((comp) => [
        comp.Nombre,
        comp.Edad,
        'Sin evaluar',
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Nombre', 'Edad', 'Estado']],
        body: noEvaluadosData,
        theme: 'plain',
        headStyles: {
          fillColor: [200, 200, 200],
        },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Generado por Marcador Kenshukan',
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    // Retornar como ArrayBuffer
    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
}

/**
 * Genera un PDF con estadísticas resumidas
 */
export function generateStatsPDF(
  totalCompetencias: number,
  totalCompetidores: number,
  competenciasPorArea: Record<string, number>
): ArrayBuffer {
  try {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text('Estadísticas de Competencias Kata', 105, 15, { align: 'center' });

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(
      `Generado el: ${new Date().toLocaleDateString('es-ES')}`,
      105,
      25,
      { align: 'center' }
    );

    // Resumen general
    doc.setFontSize(14);
    doc.text('Resumen General', 20, 40);

    doc.setFontSize(12);
    doc.text(`Total de Competencias: ${totalCompetencias}`, 30, 50);
    doc.text(`Total de Competidores: ${totalCompetidores}`, 30, 58);
    doc.text(
      `Promedio de Competidores por Competencia: ${
        totalCompetencias > 0
          ? (totalCompetidores / totalCompetencias).toFixed(1)
          : '0'
      }`,
      30,
      66
    );

    // Distribución por área
    if (Object.keys(competenciasPorArea).length > 0) {
      doc.setFontSize(14);
      doc.text('Distribución por Área', 20, 80);

      const areaData = Object.entries(competenciasPorArea)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([area, count]) => [`Área ${area}`, count, `${((count / totalCompetencias) * 100).toFixed(1)}%`]);

      autoTable(doc, {
        startY: 85,
        head: [['Área', 'Competencias', 'Porcentaje']],
        body: areaData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60, halign: 'center' },
          2: { cellWidth: 60, halign: 'center' },
        },
      });
    }

    // Footer
    doc.setFontSize(10);
    doc.text(
      'Marcador Kenshukan',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    return doc.output('arraybuffer');
  } catch (error) {
    console.error('Error generating stats PDF:', error);
    throw new Error('Error al generar el archivo PDF de estadísticas');
  }
}
