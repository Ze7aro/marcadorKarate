import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTranslation } from 'react-i18next';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

interface AppConfig {
  kata: {
    defaultJudges: number;
    scoreBase: number;
  };
  kumite: {
    winThreshold: number;
    matchDuration: number;
    autoWinnerOnPenalty: boolean;
  };
  language: string;
}

const defaultConfig: AppConfig = {
  kata: {
    defaultJudges: 5,
    scoreBase: 7,
  },
  kumite: {
    winThreshold: 8,
    matchDuration: 120,
    autoWinnerOnPenalty: false,
  },
  language: 'es',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useLocalStorage<AppConfig>('kenshukanConfig', defaultConfig);
  const { i18n } = useTranslation();

  // Sincronizar idioma con i18next al montar
  useEffect(() => {
    if (config.language && i18n.language !== config.language) {
      i18n.changeLanguage(config.language);
      document.documentElement.lang = config.language;
    }
  }, [config.language, i18n]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      kata: { ...prev.kata, ...(newConfig.kata || {}) },
      kumite: { ...prev.kumite, ...(newConfig.kumite || {}) },
    }));
  };

  const setLanguage = (lang: string) => {
    setConfig((prev) => ({ ...prev, language: lang }));
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, language: config.language, setLanguage }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
