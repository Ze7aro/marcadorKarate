import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface EnchoSenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (time: number) => void;
}

export default function EnchoSenModal({ isOpen, onClose, onConfirm }: EnchoSenModalProps) {
    const { t } = useTranslation(['kumite', 'common', 'config']);
    const [time, setTime] = useState('60');

    const handleConfirm = () => {
        const timeValue = parseInt(time, 10);
        if (!isNaN(timeValue) && timeValue > 0) {
            onConfirm(timeValue);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} hideCloseButton>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t('kumite:actions.enchoSen')}
                </ModalHeader>
                <ModalBody>
                    <p className="mb-4">
                        {t('kumite:messages.enchoSenPrompt')}
                    </p>
                    <Input
                        labelPlacement='outside-top'
                        type="number"
                        label={t('config:matchDuration')}
                        placeholder="60"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        endContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">{t('config:seconds')}</span>
                            </div>
                        }
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        {t('common:actions.cancel')}
                    </Button>
                    <Button color="primary" onPress={handleConfirm}>
                        {t('kumite:actions.startEnchoSen')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
