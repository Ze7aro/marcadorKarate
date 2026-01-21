import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// Helper to generate competitors
function generateCompetitors(count, startId) {
  const competitors = [];
  for (let i = 0; i < count; i++) {
    competitors.push({
      Nombre: `Competidor Test ${startId + i}`,
      Edad: 18 + i,
      "Kyu/Dan": "1er Dan",
    });
  }
  return competitors;
}

// Function to create an Excel file
function createExcelFile(filename, categoryName, competitors) {
  const workbook = XLSX.utils.book_new();

  // Data structure matching excelUtils.ts expectations
  // Row 1: Category Info (B1)
  // Row 2: Headers
  // Row 3+: Data

  // We construct the data array manually to ensure exact placement
  const wsData = [
    ["Categoría:", categoryName], // Row 1
    [], // Empty row to separate category ?? No, excelUtils says headers are row 2 (index 1), so B1 is row 0.
    // Wait, excelUtils.ts says:
    // const categoriaCell = worksheet['B1'];
    // const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 1 }); // range 1 means skip 1 row (row 0), start header at row 1 (index 1 => Row 2)

    // So:
    // Row 1 (Index 0): Metadata. B1 has Category.
    // Row 2 (Index 1): Headers (Nombre, Edad, etc.)
    // Row 3 (Index 2): Data
  ];

  // However, sheet_to_json with range:1 expects headers at index 1.
  // Let's verify `excelUtils.ts` logic again from memory/view.
  // "range: 1" in sheet_to_json means "start parsing from the second row (0-indexed 1)".
  // Usually this means the header is at index 1.

  // Let's build exactly that.

  const headers = ["Nombre", "Edad", "Kyu/Dan"];

  // Construct the sheet manually
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Categoría:", categoryName], // Row 1 (Index 0)
    headers, // Row 2 (Index 1) - HEADERS
    ...competitors.map((c) => [c.Nombre, c.Edad, c["Kyu/Dan"]]), // Data
  ]);

  // Set column widths for better readability
  worksheet["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Competidores");

  XLSX.writeFile(workbook, filename);
  console.log(`Created ${filename}`);
}

// Generate File 1
const competitors1 = generateCompetitors(8, 1);
createExcelFile(
  "competidores_grupo_1.xlsx",
  "Kata Masculino Senior - Grupo 1",
  competitors1,
);

// Generate File 2
const competitors2 = generateCompetitors(8, 9);
createExcelFile(
  "competidores_grupo_2.xlsx",
  "Kata Masculino Senior - Grupo 2",
  competitors2,
);

// Generate File 3 (22 Competitors)
const competitors22 = generateCompetitors(22, 100);
createExcelFile(
  "competidores_test_22.xlsx",
  "Kata Test Large - 22 Competidores",
  competitors22,
);

// Generate File 4 (37 Competitors)
const competitors37 = generateCompetitors(37, 200);
createExcelFile(
  "competidores_test_37.xlsx",
  "Kata Test XL - 37 Competidores",
  competitors37,
);
