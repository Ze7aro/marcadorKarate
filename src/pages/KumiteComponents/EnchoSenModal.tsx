import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useTranslation } from "react-i18next";

interface EnchoSenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: number) => void;
}

export default function EnchoSenModal({
  isOpen,
  onClose,
  onConfirm,
}: EnchoSenModalProps) {
  const { t } = useTranslation(["kumite", "common"]);
  const [time, setTime] = useState("60");

  const handleConfirm = () => {
    const timeValue = parseInt(time, 10);
    if (!isNaN(timeValue) && timeValue > 0) {
      onConfirm(timeValue);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent className="app-panel overflow-hidden rounded-[1.75rem] border border-[rgba(80,125,196,0.22)] text-slate-100">
        <ModalHeader className="flex flex-col gap-1 border-b border-[rgba(80,125,196,0.18)] pb-4">
          <span className="text-xl font-semibold text-white">
            {t("kumite:actions.enchoSen")}
          </span>
        </ModalHeader>
        <ModalBody className="pt-5 text-slate-200">
          <p className="mb-4 leading-relaxed text-slate-300">
            {t("kumite:messages.enchoSenPrompt")}
          </p>
          <Input
            className="app-dark-input"
            labelPlacement="outside-top"
            type="number"
            label={t("kumite:config.matchDuration")}
            placeholder="60"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-small text-slate-400">
                  {t("kumite:config.seconds")}
                </span>
              </div>
            }
          />
        </ModalBody>
        <ModalFooter className="border-t border-[rgba(80,125,196,0.18)] pt-4">
          <Button
            className="app-button-secondary"
            variant="light"
            onPress={onClose}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button className="app-button-primary" onPress={handleConfirm}>
            {t("kumite:actions.startEnchoSen")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
