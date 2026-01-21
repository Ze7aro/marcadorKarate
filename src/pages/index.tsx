import { Card, CardBody } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

export default function IndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "kata", "kumite"]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-white">
            {t("common:app.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t("common:app.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Kata */}
          <Card
            isPressable
            onPress={() => navigate("/kata")}
            className="hover:scale-105 transition-transform"
          >
            <CardBody className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🥋</div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                  {t("kata:module.title")}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t("kata:module.description")}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Tarjeta Kumite */}
          <Card
            isPressable
            onPress={() => navigate("/kumite")}
            className="hover:scale-105 transition-transform"
          >
            <CardBody className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚔️</div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">
                  {t("kumite:module.title")}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t("kumite:module.description")}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("common:app.version", { version: "0.1.0" })}
          </p>
        </div>
      </div>
    </div>
  );
}
