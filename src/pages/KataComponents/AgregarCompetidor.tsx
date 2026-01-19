import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@heroui/react';
import { showToast } from '@/utils/toast';

interface AgregarCompetidorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nombre: string, edad: number) => void;
}

export default function AgregarCompetidor({
  isOpen,
  onClose,
  onAdd,
}: AgregarCompetidorProps) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [errors, setErrors] = useState<{ nombre?: string; edad?: string }>({});

  const handleClose = () => {
    setNombre('');
    setEdad('');
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { nombre?: string; edad?: string } = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    const edadNum = parseInt(edad);
    if (!edad) {
      newErrors.edad = 'La edad es requerida';
    } else if (isNaN(edadNum) || edadNum < 5 || edadNum > 100) {
      newErrors.edad = 'Ingresa una edad válida (5-100)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    onAdd(nombre.trim(), parseInt(edad));
    showToast.success('Competidor agregado');
    handleClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader>Agregar Competidor</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              placeholder="Ej: Juan Pérez García"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) {
                  setErrors({ ...errors, nombre: undefined });
                }
              }}
              onKeyPress={handleKeyPress}
              isInvalid={!!errors.nombre}
              errorMessage={errors.nombre}
              autoFocus
            />

            <Input
              label="Edad"
              type="number"
              placeholder="Ej: 25"
              value={edad}
              onChange={(e) => {
                setEdad(e.target.value);
                if (errors.edad) {
                  setErrors({ ...errors, edad: undefined });
                }
              }}
              onKeyPress={handleKeyPress}
              isInvalid={!!errors.edad}
              errorMessage={errors.edad}
              min={5}
              max={100}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> También puedes importar múltiples competidores
                desde un archivo Excel usando el botón "Importar desde Excel".
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={handleClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Agregar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
