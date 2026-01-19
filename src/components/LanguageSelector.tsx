import { Select, SelectItem } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useConfig } from "@/context/ConfigContext";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export default function LanguageSelector() {
  const { t } = useTranslation("common");
  const { language, setLanguage } = useConfig();

  const handleLanguageChange = (value: string) => {
    if (value) {
      setLanguage(value);
    }
  };

  return (
    <Select
      label={t("languages.selectLanguage")}
      selectedKeys={[language]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string;
        handleLanguageChange(selected);
      }}
      className="max-w-xs"
      size="sm"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <SelectItem key={lang.code}>
          <span className="flex items-center gap-2">
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}
