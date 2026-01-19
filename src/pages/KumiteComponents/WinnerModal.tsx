import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Chip,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface WinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    winnerName: string;
    scoreAka: number;
    scoreShiro: number;
    side: 'aka' | 'shiro' | null;
    reason?: 'disqualification' | 'hantei' | null;
}

export default function WinnerModal({
    isOpen,
    onClose,
    winnerName,
    scoreAka,
    scoreShiro,
    side,
    reason,
}: WinnerModalProps) {
    const { t } = useTranslation(['kumite', 'common']);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            size="2xl"
            backdrop="blur"
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        y: -20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                }
            }}
        >
            <ModalContent className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <ModalHeader className="flex flex-col gap-1 items-center text-3xl font-bold pt-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="text-6xl mb-4"
                    >
                        🏆
                    </motion.div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
                        {t('kumite:results.winner').toUpperCase()}
                    </span>
                </ModalHeader>
                <ModalBody className="py-10">
                    <div className="flex flex-col items-center gap-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-extrabold text-center"
                        >
                            {winnerName}
                        </motion.h2>

                        <Chip
                            size="lg"
                            color={side === 'aka' ? 'danger' : 'default'}
                            variant="shadow"
                            className={side === 'shiro' ? 'bg-white text-black border-2 border-gray-300' : ''}
                        >
                            {side === 'aka' ? t('kumite:competitor.aka') : t('kumite:competitor.shiro')}
                        </Chip>

                        {reason && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Chip color="danger" variant="dot" size="sm">
                                    {t(`kumite:results.${reason}`)}
                                </Chip>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-8 mt-4"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-sm uppercase text-gray-500 font-semibold">{t('kumite:competitor.aka')}</span>
                                <span className={`text-5xl font-black ${side === 'aka' ? 'text-red-600' : 'text-gray-400'}`}>
                                    {scoreAka}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-400">VS</div>
                            <div className="flex flex-col items-center">
                                <span className="text-sm uppercase text-gray-500 font-semibold">{t('kumite:competitor.shiro')}</span>
                                <span className={`text-5xl font-black ${side === 'shiro' ? 'text-blue-900 dark:text-blue-400 font-bold' : 'text-gray-400'}`}>
                                    {scoreShiro}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </ModalBody>
                <ModalFooter className="pb-8 justify-center">
                    <Button
                        color="primary"
                        size="lg"
                        variant="shadow"
                        className="px-12 font-bold text-lg"
                        onPress={onClose}
                    >
                        {t('common:buttons.close')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
