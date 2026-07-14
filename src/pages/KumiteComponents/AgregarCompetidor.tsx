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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      classNames={{ backdrop: 'bg-slate-950/70' }}
    >
      <ModalContent className="app-panel overflow-hidden rounded-[1.75rem] text-slate-100">
        <ModalHeader className="flex flex-col gap-2 border-b border-[rgba(80,125,196,0.16)] px-8 py-6">
          <h2 className="text-2xl font-bold text-white">{t('kumite:competitor.add')}</h2>
          <p className="text-sm text-slate-400">
            Carga manual de competidor para el cuadro actual.
          </p>
        </ModalHeader>
        <ModalBody className="px-8 py-6">
          <div className="space-y-5">
            <Input
              autoFocus
              className="app-dark-input"
              classNames={{
                inputWrapper:
                  'min-h-14 rounded-[1.1rem] bg-[rgba(8,17,32,0.84)] border border-[rgba(80,125,196,0.18)] shadow-none',
                input: 'text-slate-100 placeholder:text-slate-500',
                label: 'text-slate-300',
                errorMessage: 'text-rose-300',
              }}
              labelPlacement="outside-top"
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
              className="app-dark-input"
              classNames={{
                inputWrapper:
                  'min-h-14 rounded-[1.1rem] bg-[rgba(8,17,32,0.84)] border border-[rgba(80,125,196,0.18)] shadow-none',
                input: 'text-slate-100 placeholder:text-slate-500',
                label: 'text-slate-300',
                errorMessage: 'text-rose-300',
              }}
              labelPlacement="outside-top"
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
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-3 border-t border-[rgba(80,125,196,0.16)] px-8 py-5">
          <Button className="app-button-secondary" variant="flat" onPress={handleClose}>
            {t('common:buttons.cancel')}
          </Button>
          <Button className="app-button-primary" onPress={handleSubmit}>
            {t('common:buttons.add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
