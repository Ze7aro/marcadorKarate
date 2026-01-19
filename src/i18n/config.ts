import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import commonES from './locales/es/common.json';
import kataES from './locales/es/kata.json';
import kumiteES from './locales/es/kumite.json';
import statsES from './locales/es/stats.json';
import errorsES from './locales/es/errors.json';

import commonEN from './locales/en/common.json';
import kataEN from './locales/en/kata.json';
import kumiteEN from './locales/en/kumite.json';
import statsEN from './locales/en/stats.json';
import errorsEN from './locales/en/errors.json';

import commonJA from './locales/ja/common.json';
import kataJA from './locales/ja/kata.json';
import kumiteJA from './locales/ja/kumite.json';
import statsJA from './locales/ja/stats.json';
import errorsJA from './locales/ja/errors.json';

// Recursos de traducción
const resources = {
  es: {
    common: commonES,
    kata: kataES,
    kumite: kumiteES,
    stats: statsES,
    errors: errorsES,
  },
  en: {
    common: commonEN,
    kata: kataEN,
    kumite: kumiteEN,
    stats: statsEN,
    errors: errorsEN,
  },
  ja: {
    common: commonJA,
    kata: kataJA,
    kumite: kumiteJA,
    stats: statsJA,
    errors: errorsJA,
  },
};

i18n
  // Detectar idioma del navegador/localStorage
  .use(LanguageDetector)
  // Conectar con React
  .use(initReactI18next)
  // Inicializar con configuración
  .init({
    resources,

    // Idioma por defecto
    fallbackLng: 'es',

    // Namespace por defecto
    defaultNS: 'common',

    // Namespaces disponibles
    ns: ['common', 'kata', 'kumite', 'stats', 'errors'],

    // Detectar idioma del usuario
    detection: {
      // Orden de detección
      order: ['localStorage', 'navigator'],
      // Caches
      caches: ['localStorage'],
      // Key en localStorage
      lookupLocalStorage: 'kenshukanLanguage',
    },

    // Opciones de interpolación
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Opciones de React
    react: {
      useSuspense: false, // Evitar suspense para compatibilidad
    },

    // Debug en desarrollo
    debug: false,
  });

export default i18n;
