import { useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { showToast } from '@/utils/toast';
import { readExcelFile } from '@/utils/excelUtils';
import { Competidor } from '@/types';

interface ExcelUploaderProps {
  onCompetidoresLoaded: (competidores: Competidor[], categoria: string) => void;
  page: string;
}

export default function ExcelUploader({ onCompetidoresLoaded, page }: ExcelUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async () => {
    setLoading(true);
    try {
      // Abrir diálogo de archivos
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Excel',
            extensions: ['xlsx', 'xls'],
          },
        ],
      });

      if (!selected) {
        setLoading(false);
        return;
      }

      // Leer el archivo
      const fileContent = await readFile(selected as string);

      // Parsear Excel
      const { competidores, categoria } = await readExcelFile(fileContent.buffer);

      // Validar que haya competidores
      if (competidores.length === 0) {
        showToast.error('El archivo no contiene competidores válidos');
        setLoading(false);
        return;
      }

      // Callback con los datos
      onCompetidoresLoaded(competidores, categoria);
      showToast.success(`${competidores.length} competidores cargados`);
    } catch (error) {
      console.error('Error loading Excel file:', error);
      showToast.error(
        error instanceof Error ? error.message : 'Error al cargar el archivo'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardBody>
          <div className={`flex flex-col ${page === 'kata' ? 'md:flex-row' : 'flex-col'}  items-center justify-between gap-4`}>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Importar desde Excel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Carga una lista de competidores desde un archivo Excel
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                color="primary"
                size="sm"
                onPress={handleFileSelect}
                isLoading={loading}
              >
                Seleccionar Archivo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
