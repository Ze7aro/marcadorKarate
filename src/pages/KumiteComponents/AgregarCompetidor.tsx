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
import { useTranslation } from 'react-i18next';

interface AgregarCompetidorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nombre: string, edad: number) => void;
}

export default function AgregarCompetidor({ isOpen, onClose, onAdd }: AgregarCompetidorProps) {
  const { t } = useTranslation(['kumite', 'common']);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [errors, setErrors] = useState({ nombre: '', edad: '' });

  const validateForm = () => {
    const newErrors = { nombre: '', edad: '' };
    let isValid = true;

    if (!nombre.trim() || nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    }

    const edadNum = parseInt(edad);
    if (!edad || isNaN(edadNum) || edadNum < 5 || edadNum > 100) {
      newErrors.edad = 'Edad debe estar entre 5 y 100';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(nombre.trim(), parseInt(edad));
      handleClose();
    }
  };

  const handleClose = () => {
    setNombre('');
    setEdad('');
    setErrors({ nombre: '', edad: '' });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t('kumite:competitor.add')}
        </ModalHeader>
        <ModalBody>
          <Input
            autoFocus
            labelPlacement='outside-top'
            label={t('kumite:competitor.name')}
            placeholder="Ej: Juan Pérez"
            variant="bordered"
            value={nombre}
            onValueChange={setNombre}
            onKeyPress={handleKeyPress}
            isInvalid={!!errors.nombre}
            errorMessage={errors.nombre}
          />
          <Input
            labelPlacement='outside-top'
            label={t('kumite:competitor.age')}
            placeholder="Ej: 25"
            type="number"
            variant="bordered"
            value={edad}
            onValueChange={setEdad}
            onKeyPress={handleKeyPress}
            isInvalid={!!errors.edad}
            errorMessage={errors.edad}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="flat" onPress={handleClose}>
            {t('common:buttons.cancel')}
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {t('common:buttons.add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
