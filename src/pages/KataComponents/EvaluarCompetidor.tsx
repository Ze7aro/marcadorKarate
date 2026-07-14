import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Chip,
} from '@heroui/react';
import { Competidor } from '@/types';
import { showToast } from '@/utils/toast';

interface EvaluarCompetidorProps {
  isOpen: boolean;
  onClose: () => void;
  competidor: Competidor | null;
  numJudges: number;
  base: number;
  onSave: (competidor: Competidor, puntajes: string[], puntajeFinal: number) => void;
}

export default function EvaluarCompetidor({
  isOpen,
  onClose,
  competidor,
  numJudges,
  base,
  onSave,
}: EvaluarCompetidorProps) {
  const [puntajes, setPuntajes] = useState<string[]>([]);
  const [puntajeFinal, setPuntajeFinal] = useState<number | null>(null);
  const [puntajeMenor, setPuntajeMenor] = useState<number | null>(null);
  const [puntajeMayor, setPuntajeMayor] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPuntajes(Array(numJudges).fill(''));
      setPuntajeFinal(null);
      setPuntajeMenor(null);
      setPuntajeMayor(null);
    }
  }, [isOpen, numJudges]);

  useEffect(() => {
    calcularPuntaje();
  }, [puntajes, numJudges]);

  const calcularPuntaje = () => {
    const puntajesValidos = puntajes.filter((p) => p && !isNaN(parseFloat(p)));

    if (puntajesValidos.length !== numJudges) {
      setPuntajeFinal(null);
      setPuntajeMenor(null);
      setPuntajeMayor(null);
      return;
    }

    const puntajesNumericos = puntajesValidos
      .map((p) => parseFloat(p))
      .sort((a, b) => a - b);

    if (numJudges === 5) {
      const menor = puntajesNumericos[0];
      const mayor = puntajesNumericos[4];
      const medios = puntajesNumericos.slice(1, 4);
      const total = medios.reduce((acc, p) => acc + p, 0);

      setPuntajeMenor(menor);
      setPuntajeMayor(mayor);
      setPuntajeFinal(total);
    } else if (numJudges === 3) {
      const mayor = puntajesNumericos[2];
      const total = puntajesNumericos.slice(0, 2).reduce((acc, p) => acc + p, 0);

      setPuntajeMenor(null);
      setPuntajeMayor(mayor);
      setPuntajeFinal(total);
    }
  };

  const handlePuntajeChange = (index: number, value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    const newPuntajes = [...puntajes];
    newPuntajes[index] = value;
    setPuntajes(newPuntajes);
  };

  const handleSave = () => {
    if (puntajeFinal === null) {
      showToast.error('Completa todos los puntajes');
      return;
    }

    if (!competidor) return;

    onSave(competidor, puntajes, puntajeFinal);
    showToast.success('Puntaje guardado');
    onClose();
  };

  const handleClose = () => {
    setPuntajes(Array(numJudges).fill(''));
    setPuntajeFinal(null);
    setPuntajeMenor(null);
    setPuntajeMayor(null);
    onClose();
  };

  const minScore = base - 1;
  const maxScore = base + 3;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="3xl" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl">Evaluar Competidor</h2>
          {competidor && (
            <div className="flex gap-2 mt-2">
              <Chip size="sm" color="primary">
                {competidor.Nombre}
              </Chip>
              <Chip size="sm" variant="flat">
                Edad: {competidor.Edad}
              </Chip>
            </div>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <CardBody className="py-3">
                <p className="text-sm text-center">
                  <strong>Rango de puntajes:</strong> {minScore.toFixed(1)} - {maxScore.toFixed(1)}
                  {' '}(Base {base})
                </p>
              </CardBody>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Puntajes de Jueces ({numJudges} jueces)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: numJudges }).map((_, index) => (
                  <Input
                    key={index}
                    label={`Juez ${index + 1}`}
                    type="number"
                    step="0.1"
                    min={minScore}
                    max={maxScore}
                    value={puntajes[index]}
                    onChange={(e) => handlePuntajeChange(index, e.target.value)}
                    placeholder={`${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {puntajeFinal !== null && (
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500">
                <CardBody>
                  <div className="text-white text-center">
                    <p className="text-lg mb-2">Puntaje Final</p>
                    <p className="text-6xl font-bold">{puntajeFinal.toFixed(2)}</p>

                    {puntajeMayor !== null && (
                      <div className="flex justify-center gap-8 mt-4">
                        {numJudges === 5 && puntajeMenor !== null && (
                          <div>
                            <p className="text-sm opacity-75">Menor (descartado)</p>
                            <p className="text-2xl font-bold">{puntajeMenor.toFixed(2)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm opacity-75">Mayor (descartado)</p>
                          <p className="text-2xl font-bold">{puntajeMayor.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Cómo evaluar:</strong>
              </p>
              <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                <li>Ingresa el puntaje de cada juez ({minScore.toFixed(1)} a {maxScore.toFixed(1)})</li>
                {numJudges === 5 && (
                  <li>Se descartará automáticamente el puntaje mayor y menor</li>
                )}
                {numJudges === 3 && (
                  <li>Se descartará automáticamente el puntaje mayor</li>
                )}
                <li>El puntaje final se calcula automáticamente</li>
                <li>Click en "Guardar" para registrar el puntaje</li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={puntajeFinal === null}
          >
            Guardar Puntaje
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
