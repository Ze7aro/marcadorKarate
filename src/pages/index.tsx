import { Card, CardBody } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import CategoryUploadPanel from "@/components/CategoryUploadPanel";
import { useCategoryCatalog } from "@/hooks/useCategoryCatalog";
import kataLogo from "@/assets/Kata-logo.png";
import kumiteLogo from "@/assets/kumite - logo.png";

export default function IndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "kata", "kumite"]);
  const { getByDiscipline, removeCategory, upsertCategory } =
    useCategoryCatalog();

  const kataCategories = getByDiscipline("kata");
  const kumiteCategories = getByDiscipline("kumite");

  return (
    <div className="app-shell">
      <div className="app-container max-w-5xl">
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>

        <div className="text-center mb-14">
          <p className="app-label mb-4">Marcador Kenshukan</p>
          <h1 className="app-title mb-4">{t("common:app.title")}</h1>
          <p className="mx-auto max-w-3xl text-xl text-slate-300">
            {t("common:app.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            isPressable
            onPress={() => navigate("/kata")}
            className="app-hero-card app-kata-accent hover:scale-[1.02] transition-transform"
          >
            <CardBody className="p-8">
              <div className="text-center h-full flex flex-col items-center justify-center">
                <img
                  src={kataLogo}
                  alt="Kata"
                  className="h-24 w-24 object-contain mb-5 drop-shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
                />
                <h2 className="text-4xl font-black mb-3 text-slate-50 tracking-tight">
                  {t("kata:module.title")}
                </h2>
                <p className="text-slate-300 mb-6 max-w-sm text-lg">
                  {t("kata:module.description")}
                </p>
                <span className="app-accent-badge">Evaluacion y ranking</span>
              </div>
            </CardBody>
          </Card>

          <Card
            isPressable
            onPress={() => navigate("/kumite")}
            className="app-hero-card app-kumite-accent hover:scale-[1.02] transition-transform"
          >
            <CardBody className="p-8">
              <div className="text-center h-full flex flex-col items-center justify-center">
                <img
                  src={kumiteLogo}
                  alt="Kumite"
                  className="h-24 w-24 object-contain mb-5 drop-shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
                />
                <h2 className="text-4xl font-black mb-3 text-slate-50 tracking-tight">
                  {t("kumite:module.title")}
                </h2>
                <p className="text-slate-300 mb-6 max-w-sm text-lg">
                  {t("kumite:module.description")}
                </p>
                <span className="app-accent-badge">Combate y cronometro</span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
          <CategoryUploadPanel
            disciplina="kata"
            categories={kataCategories}
            onImport={upsertCategory}
            onRemove={removeCategory}
          />
          <CategoryUploadPanel
            disciplina="kumite"
            categories={kumiteCategories}
            onImport={upsertCategory}
            onRemove={removeCategory}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {t("common:app.version", { version: "0.1.0" })}
          </p>
        </div>
      </div>
    </div>
  );
}
