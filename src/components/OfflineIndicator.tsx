import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Componente que muestra un banner cuando no hay conexión a internet
 */
export default function OfflineIndicator() {
  const { t } = useTranslation("common");
  const isOnline = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Mostrar banner si está offline
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // Esperar un poco antes de ocultar para que el usuario vea el mensaje
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-3"
        >
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
              isOnline
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {isOnline ? "✅" : "📴"}
            </span>
            <div>
              <p className="font-semibold">
                {isOnline
                  ? t("states.online")
                  : t("states.offline")}
              </p>
              {!isOnline && (
                <p className="text-sm opacity-90">
                  {t("errors.network.connectionLost")}
                </p>
              )}
              {isOnline && (
                <p className="text-sm opacity-90">
                  {t("errors.network.connectionRestored")}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
