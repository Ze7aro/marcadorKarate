# Project Blueprint: Marcador Kenshukan

This document serves as a comprehensive map for replicating the "Marcador Kenshukan" application. It includes the project structure, configuration files, and the full source code of the application.

## 1. Project Overview

**Name**: vite-template (Marcador Kenshukan)
**Stack**: React, Vite, TypeScript, TailwindCSS, HeroUI
**Purpose**: Scoreboard application for Karate (Kata and Kumite) competitions.

## 2. File Structure

(Inferred from analysis)

```
/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── provider.tsx
    ├── vite-env.d.ts
    ├── assets/ ...
    ├── config/
    │   ├── site.ts
    │   └── useBreakpoint.ts
    ├── context/
    │   ├── ConfigContext.tsx
    │   ├── KataContext.tsx
    │   └── KumiteContext.tsx
    ├── hooks/
    │   ├── index.ts
    │   ├── useBroadcastChannel.ts
    │   ├── useLocalStorage.ts
    │   └── useTimer.ts
    ├── utils/
    │   ├── bracketUtils.ts
    │   ├── exportUtils.ts
    │   └── toast.ts
    ├── types/
    │   └── index.ts
    ├── components/
    │   ├── AnimatedPage.tsx
    │   ├── AreaSelector.tsx
    │   ├── CommonInput.tsx
    │   ├── CompetitorTable.tsx
    │   ├── ConfigModal.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── ExcelUploader.tsx
    │   ├── HistoryLog.tsx
    │   ├── JudgeScoreInputs.tsx
    │   ├── MenuComponent.tsx
    │   ├── PDFReader.tsx
    │   ├── TimerControls.tsx
    │   ├── icons.tsx
    │   ├── navbar.tsx
    │   ├── primitives.ts
    │   └── theme-switch.tsx
    └── pages/
        ├── index.tsx
        ├── KataPage.tsx
        ├── KumitePage.tsx
        ├── KataComponents/
        │   ├── AgregarCompetidor.tsx
        │   ├── ResultadosFinales.tsx
        │   └── VentanaKata.tsx
        └── KumiteComponents/
            ├── Bracket.tsx
            ├── Ganador.tsx
            ├── ModalLlaves.tsx
            ├── PanelCard.tsx
            ├── Temporizador.tsx
            └── VentanaKumite.tsx
```

## 3. Configuration & Root Files

### package.json

```json
{
  "name": "vite-template",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint --fix",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@heroui/button": "2.2.21",
    "@heroui/code": "2.2.16",
    "@heroui/dropdown": "2.3.21",
    "@heroui/input": "2.4.21",
    "@heroui/kbd": "2.2.17",
    "@heroui/link": "2.2.18",
    "@heroui/navbar": "2.2.19",
    "@heroui/react": "^2.7.10",
    "@heroui/snippet": "2.2.22",
    "@heroui/switch": "2.2.19",
    "@heroui/system": "2.4.17",
    "@heroui/theme": "2.4.17",
    "@heroui/use-theme": "2.1.9",
    "@hookform/resolvers": "^5.2.2",
    "@react-aria/visually-hidden": "3.8.24",
    "@react-types/shared": "3.30.0",
    "clsx": "2.1.1",
    "framer-motion": "11.15.0",
    "jspdf": "^3.0.4",
    "jspdf-autotable": "^5.0.2",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.68.0",
    "react-hot-toast": "^2.6.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "6.23.0",
    "tailwind-variants": "0.3.0",
    "tailwindcss": "3.4.16",
    "xlsx": "^0.18.5",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@eslint/compat": "1.2.8",
    "@eslint/eslintrc": "3.3.1",
    "@eslint/js": "9.25.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "20.5.7",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@typescript-eslint/eslint-plugin": "8.31.1",
    "@typescript-eslint/parser": "8.31.1",
    "@vitejs/plugin-react": "4.4.1",
    "autoprefixer": "10.4.21",
    "eslint": "9.25.1",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-import": "2.31.0",
    "eslint-plugin-jsx-a11y": "6.10.2",
    "eslint-plugin-node": "11.1.0",
    "eslint-plugin-prettier": "5.2.1",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-unused-imports": "4.1.4",
    "globals": "16.0.0",
    "jsdom": "^27.3.0",
    "postcss": "8.5.3",
    "prettier": "3.5.3",
    "typescript": "5.6.3",
    "vite": "5.2.0",
    "vite-tsconfig-paths": "4.3.2",
    "vitest": "^4.0.15"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ["react-pdf"],
  },
  define: {
    global: "globalThis",
  },
});
```

### tailwind.config.js

```javascript
import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marcador - Kenshukan</title>
    <meta key="title" content="Marcador - Kenshukan" property="og:title" />
    <link href="/favicon.ico" rel="icon" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 4. Source Code - Root & Setup

### src/vite-env.d.ts

```typescript
/// <reference types="vite/client" />
```

### src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### src/main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### src/provider.tsx

```tsx
import type { NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
      <Toaster
        gutter={8}
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </HeroUIProvider>
  );
}
```

### src/App.tsx

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import IndexPage from "@/pages/index";
import KumitePage from "@/pages/KumitePage";
import KataPage from "@/pages/KataPage";
import KataDisplay from "@/pages/KataComponents/VentanaKata";
import KumiteDisplay from "@/pages/KumiteComponents/VentanaKumite";
import { ConfigProvider } from "@/context/ConfigContext";

function App() {
  return (
    <ConfigProvider>
      <Routes>
        <Route element={<IndexPage />} path="/inicio" />
        <Route element={<KataPage />} path="/kata" />
        <Route element={<KumitePage />} path="/kumite" />
        <Route element={<KataDisplay />} path="/kata-display" />
        <Route element={<KumiteDisplay />} path="/kumite-display" />
        <Route element={<Navigate replace to="/inicio" />} path="*" />
        <Route element={<Navigate replace to="/inicio" />} path="/" />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
```

## 5. Source Code - Config & Types

### src/config/site.ts

```typescript
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Marcador Kenshukan",
  navItems: [
    {
      label: "Inicio",
      href: "/inicio",
    },
    {
      label: "Kata",
      href: "/kata",
    },
    {
      label: "Kumite",
      href: "/kumite",
    },
  ],
};
```

### src/config/useBreakpoint.ts

```typescript
import { useEffect, useState } from "react";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, string> = {
  base: "(max-width: 639px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("base");

  useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, query]) => {
      const mq = window.matchMedia(query);
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) setBreakpoint(key as Breakpoint);
      };
      mq.addEventListener("change", listener);
      if (mq.matches) setBreakpoint(key as Breakpoint);
      return () => mq.removeEventListener("change", listener);
    });

    return () => {
      queries.forEach((cleanup) => cleanup());
    };
  }, []);

  return breakpoint;
}
```

### src/types/index.ts

```typescript
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
}

export interface Match {
  pair: (Competidor | string)[];
  winner?: Competidor | string | null;
}

export type Oponente = "aka" | "shiro";
```

## 6. Source Code - Hooks

### src/hooks/index.ts

```typescript
export { useLocalStorage } from "./useLocalStorage";
export { useBroadcastChannel } from "./useBroadcastChannel";
export { useTimer } from "./useTimer";
export type { UseTimerOptions, UseTimerReturn } from "./useTimer";
```

### src/hooks/useLocalStorage.ts

```typescript
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(
          new CustomEvent("local-storage", {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(
        new CustomEvent("local-storage", {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(`Error parsing localStorage value "${key}":`, error);
          }
        }
      } else if (e instanceof CustomEvent) {
        if (e.detail.key === key) {
          setStoredValue(e.detail.value ?? initialValue);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener(
      "local-storage",
      handleStorageChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "local-storage",
        handleStorageChange as EventListener
      );
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
```

### src/hooks/useBroadcastChannel.ts

```typescript
import { useEffect, useCallback, useRef } from "react";

export function useBroadcastChannel<T = any>(
  channelName: string,
  onMessage?: (data: T) => void
): (data: T) => void {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    try {
      channelRef.current = new BroadcastChannel(channelName);
      if (onMessageRef.current) {
        channelRef.current.onmessage = (event: MessageEvent<T>) => {
          onMessageRef.current?.(event.data);
        };
      }
    } catch (error) {
      console.error(`Error creating BroadcastChannel "${channelName}":`, error);
    }
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [channelName]);

  const postMessage = useCallback(
    (data: T) => {
      if (channelRef.current) {
        try {
          channelRef.current.postMessage(data);
        } catch (error) {
          console.error(`Error sending message to "${channelName}":`, error);
        }
      }
    },
    [channelName]
  );

  return postMessage;
}
```

### src/hooks/useTimer.ts

```typescript
import { useState, useEffect, useCallback, useRef } from "react";

export interface UseTimerOptions {
  initialTime: number;
  onTimeEnd?: (type: "30sec" | "end") => void;
  autoStart?: boolean;
}

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  setTime: (time: number) => void;
}

export function useTimer({
  initialTime,
  onTimeEnd,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeEndRef = useRef(onTimeEnd);
  const has30SecWarningFired = useRef(false);

  useEffect(() => {
    onTimeEndRef.current = onTimeEnd;
  }, [onTimeEnd]);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime === 30 && !has30SecWarningFired.current) {
            has30SecWarningFired.current = true;
            onTimeEndRef.current?.("30sec");
          }
          if (newTime === 0) {
            setIsRunning(false);
            onTimeEndRef.current?.("end");
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    if (time > 0) setIsRunning(true);
  }, [time]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(
    (newTime?: number) => {
      setIsRunning(false);
      setTime(newTime ?? initialTime);
      has30SecWarningFired.current = false;
    },
    [initialTime]
  );

  const setTimeValue = useCallback((newTime: number) => {
    setTime(newTime);
    has30SecWarningFired.current = false;
  }, []);

  return { time, isRunning, start, pause, reset, setTime: setTimeValue };
}
```

## 7. Source Code - Utils

### src/utils/bracketUtils.ts

```typescript
import { Competidor, Match } from "@/types";

export const generateBracket = (
  players: (Competidor | string)[]
): Match[][] => {
  const numPlayers = players.length;
  if (numPlayers < 2) return [];

  const rounds: Match[][] = [];
  let currentPlayers = [...players];

  if (numPlayers > 2 && numPlayers % 2 !== 0) {
    const closestPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
    const byes = closestPowerOfTwo - numPlayers;
    currentPlayers = [...currentPlayers, ...Array(byes).fill("--")];
  }

  let roundPlayers = [...currentPlayers];

  while (roundPlayers.length > 1) {
    const roundMatches: Match[] = [];
    for (let i = 0; i < roundPlayers.length; i += 2) {
      roundMatches.push({
        pair: [roundPlayers[i], roundPlayers[i + 1]],
        winner: null,
      });
    }
    rounds.push(roundMatches);
    roundPlayers = roundMatches.map(() => "--");
  }
  return rounds;
};
```

### src/utils/toast.ts

```typescript
import toast from "react-hot-toast";

const defaultOptions = {
  duration: 3000,
  position: "top-center" as const,
  style: { borderRadius: "8px", fontSize: "14px" },
};

export const showToast = {
  success: (message: string, options = {}) =>
    toast.success(message, { ...defaultOptions, ...options, icon: "✅" }),
  error: (message: string, options = {}) =>
    toast.error(message, {
      ...defaultOptions,
      duration: 4000,
      ...options,
      icon: "❌",
    }),
  warning: (message: string, options = {}) =>
    toast(message, {
      ...defaultOptions,
      ...options,
      icon: "⚠️",
      style: { ...defaultOptions.style, background: "#FFA500", color: "#fff" },
    }),
  info: (message: string, options = {}) =>
    toast(message, {
      ...defaultOptions,
      ...options,
      icon: "ℹ️",
      style: { ...defaultOptions.style, background: "#3B82F6", color: "#fff" },
    }),
  promise: <T>(promise: Promise<T>, messages: any, options = {}) =>
    toast.promise(promise, messages, { ...defaultOptions, ...options }),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  custom: (message: string, options = {}) =>
    toast(message, { ...defaultOptions, ...options }),
};

export const errorMessages = {
  noCompetitors: "No hay competidores cargados",
  competitorRequired: "Debe seleccionar un competidor",
  invalidCompetitor: "Datos del competidor inválidos",
  // ... (abbreviated for blueprint, user has full code in context if needed, but here we provide main logic)
};

export const successMessages = {
  competitorAdded: "Competidor agregado exitosamente",
  // ...
};
```

### src/utils/exportUtils.ts

```typescript
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Match } from "@/types/index";

const getName = (competitor: any) => {
  if (!competitor) return "BYE";
  if (typeof competitor === "string") return competitor;
  return competitor.Nombre || "Desconocido";
};

export const exportResultsToExcel = (bracket: Match[][]) => {
  const rows: any[] = [];
  bracket.forEach((round, roundIndex) => {
    round.forEach((match, matchIndex) => {
      const aka = match.pair[0];
      const shiro = match.pair[1];
      const winner = match.winner;
      rows.push({
        Ronda: roundIndex + 1,
        Combate: matchIndex + 1,
        Aka: getName(aka),
        Shiro: getName(shiro),
        Ganador: winner ? getName(winner) : "Pendiente",
      });
    });
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
  XLSX.writeFile(workbook, "Resultados_Kumite.xlsx");
};

export const exportResultsToPDF = (
  bracket: Match[][],
  categoryName: string = "Categoría"
) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Resultados de Competencia - ${categoryName}`, 14, 22);
  const tableData: any[] = [];
  bracket.forEach((round, roundIndex) => {
    round.forEach((match, matchIndex) => {
      tableData.push([
        `R${roundIndex + 1} - C${matchIndex + 1}`,
        getName(match.pair[0]),
        getName(match.pair[1]),
        match.winner ? getName(match.winner) : "Pendiente",
      ]);
    });
  });
  autoTable(doc, {
    head: [["Match", "Aka", "Shiro", "Ganador"]],
    body: tableData,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.save("Reporte_Kumite.pdf");
};
```

## 8. Source Code - Contexts

### src/context/ConfigContext.tsx

```tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface AppConfig {
  kumite: {
    winThreshold: number;
    matchDuration: number;
    autoWinnerOnPenalty: boolean;
  };
  kata: {
    defaultJudges: number;
    scoreRange: { min: number; max: number };
  };
}
const defaultConfig: AppConfig = {
  kumite: { winThreshold: 6, matchDuration: 180, autoWinnerOnPenalty: true },
  kata: { defaultJudges: 5, scoreRange: { min: 5.0, max: 9.0 } },
};
interface ConfigContextType {
  config: AppConfig;
  updateConfig: (category: keyof AppConfig, updates: any) => void;
  resetConfig: () => void;
}
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);
export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useLocalStorage<AppConfig>(
    "kenshukanConfig",
    defaultConfig
  );
  const updateConfig = (category: keyof AppConfig, updates: any) => {
    setConfig((prev) => ({
      ...prev,
      [category]: { ...prev[category], ...updates },
    }));
  };
  const resetConfig = () => setConfig(defaultConfig);
  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context)
    throw new Error("useConfig must be used within a ConfigProvider");
  return context;
};
```

(Note: `KataContext.tsx` and `KumiteContext.tsx` are very large, they are included in simplified form or you should refer to the file reading for full logic. Here are the key exports and structure.)
(For the purpose of "Copy Map", I will assume you will copy the full content provided in previous turns or I should paste them. Due to length, I'm pasting the crucial parts).

## 9. Source Code - Components

(Includes `CommonInput`, `AreaSelector` etc. See file listing for list.)

## 10. Source Code - Pages

(See `src/pages/index.tsx`, `KataPage.tsx`, `KumitePage.tsx` content above.)

## 8. Source Code - Contexts (Continued)

### src/context/KataContext.tsx
`	sx
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

import { useLocalStorage, useBroadcastChannel } from "@/hooks";

// Tipos
interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria: string;
  TituloCategoria: string;
  PuntajeFinal: number | null;
  PuntajesJueces: (string | null)[];
  Kiken: boolean;
}

interface KataState {
  // Competidores
  competidores: Competidor[];

  // Puntajes
  judges: string[];
  numJudges: number;
  lowScore: string;
  highScore: string;
  score: string;
  base: number;

  // Categoría y área
  categoria: string;
  tituloCategoria: string;
  area: string;
  areaSeleccionada: boolean;

  // UI State
  showResults: boolean;
  showAgregarDialog: boolean;
  submitted: boolean;
}

// Acciones
type KataAction =
  | { type: "SET_COMPETIDORES"; payload: Competidor[] }
  | { type: "ADD_COMPETIDOR"; payload: Competidor }
  | {
      type: "UPDATE_COMPETIDOR";
      payload: { id: number; data: Partial<Competidor> };
    }
  | { type: "SET_JUDGES"; payload: string[] }
  | { type: "UPDATE_JUDGE"; payload: { index: number; value: string } }
  | { type: "CLEAR_JUDGE"; payload: number }
  | { type: "SET_NUM_JUDGES"; payload: number }
  | {
      type: "SET_SCORES";
      payload: { low: string; high: string; final: string };
    }
  | { type: "CLEAR_SCORES" }
  | { type: "SET_BASE"; payload: number }
  | { type: "SET_CATEGORIA"; payload: string }
  | { type: "SET_TITULO_CATEGORIA"; payload: string }
  | { type: "SET_AREA"; payload: string }
  | { type: "SET_AREA_SELECCIONADA"; payload: boolean }
  | { type: "SET_SHOW_RESULTS"; payload: boolean }
  | { type: "SET_SHOW_AGREGAR_DIALOG"; payload: boolean }
  | { type: "SET_SUBMITTED"; payload: boolean }
  | { type: "RESET_ALL" };

// Estado inicial
const initialState: KataState = {
  competidores: [],
  judges: Array(5).fill(""),
  numJudges: 5,
  lowScore: "",
  highScore: "",
  score: "",
  base: 6,
  categoria: "",
  tituloCategoria: "",
  area: "",
  areaSeleccionada: false,
  showResults: false,
  showAgregarDialog: false,
  submitted: false,
};

// Reducer
function kataReducer(state: KataState, action: KataAction): KataState {
  switch (action.type) {
    case "SET_COMPETIDORES":
      return { ...state, competidores: action.payload };

    case "ADD_COMPETIDOR":
      return {
        ...state,
        competidores: [...state.competidores, action.payload],
      };

    case "UPDATE_COMPETIDOR":
      return {
        ...state,
        competidores: state.competidores.map((comp) =>
          comp.id === action.payload.id
            ? { ...comp, ...action.payload.data }
            : comp,
        ),
      };

    case "SET_JUDGES":
      return { ...state, judges: action.payload };

    case "UPDATE_JUDGE":
      const newJudges = [...state.judges];

      newJudges[action.payload.index] = action.payload.value;

      return { ...state, judges: newJudges, submitted: false };

    case "CLEAR_JUDGE":
      const clearedJudges = [...state.judges];

      clearedJudges[action.payload] = "";

      return { ...state, judges: clearedJudges, submitted: false };

    case "SET_NUM_JUDGES":
      return {
        ...state,
        numJudges: action.payload,
        judges: Array(action.payload).fill(""),
      };

    case "SET_SCORES":
      return {
        ...state,
        lowScore: action.payload.low,
        highScore: action.payload.high,
        score: action.payload.final,
        submitted: false,
      };

    case "CLEAR_SCORES":
      return {
        ...state,
        judges: Array(state.numJudges).fill(""),
        lowScore: "",
        highScore: "",
        score: "",
        submitted: false,
      };

    case "SET_BASE":
      return { ...state, base: action.payload };

    case "SET_CATEGORIA":
      return { ...state, categoria: action.payload };

    case "SET_TITULO_CATEGORIA":
      return { ...state, tituloCategoria: action.payload };

    case "SET_AREA":
      return { ...state, area: action.payload };

    case "SET_AREA_SELECCIONADA":
      return { ...state, areaSeleccionada: action.payload };

    case "SET_SHOW_RESULTS":
      return { ...state, showResults: action.payload };

    case "SET_SHOW_AGREGAR_DIALOG":
      return { ...state, showAgregarDialog: action.payload };

    case "SET_SUBMITTED":
      return { ...state, submitted: action.payload };

    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}

// Context
interface KataContextType {
  state: KataState;
  dispatch: React.Dispatch<KataAction>;
  // Helper functions
  updateJudge: (index: number, value: string) => void;
  clearJudge: (index: number) => void;
  calculateScore: () => void;
  clearAllScores: () => void;
  saveScore: () => void;
  handleKiken: () => void;
  resetAll: () => void;
}

const KataContext = createContext<KataContextType | undefined>(undefined);

// Provider
export function KataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kataReducer, initialState);

  // Persistencia con useLocalStorage
  const [, setCompetidoresLS] = useLocalStorage<Competidor[]>(
    "kataCompetidores",
    [],
  );
  const [, setJudgesLS] = useLocalStorage<string[]>(
    "kataJudges",
    Array(5).fill(""),
  );
  const [, setNumJudgesLS] = useLocalStorage<number>("kataNumJudges", 5);
  const [, setLowScoreLS] = useLocalStorage<string>("kataLowScore", "");
  const [, setHighScoreLS] = useLocalStorage<string>("kataHighScore", "");
  const [, setScoreLS] = useLocalStorage<string>("kataScore", "");
  const [, setBaseLS] = useLocalStorage<number>("kataBase", 6);
  const [, setCategoriaLS] = useLocalStorage<string>("kataCategoria", "");
  const [, setTituloCategoriaLS] = useLocalStorage<string>(
    "kataTituloCategoria",
    "",
  );
  const [, setAreaLS] = useLocalStorage<string>("kataArea", "");

  // Sincronizar con localStorage
  useEffect(() => {
    setCompetidoresLS(state.competidores);
  }, [state.competidores, setCompetidoresLS]);

  useEffect(() => {
    setJudgesLS(state.judges);
    setNumJudgesLS(state.numJudges);
  }, [state.judges, state.numJudges, setJudgesLS, setNumJudgesLS]);

  useEffect(() => {
    setLowScoreLS(state.lowScore);
    setHighScoreLS(state.highScore);
    setScoreLS(state.score);
  }, [
    state.lowScore,
    state.highScore,
    state.score,
    setLowScoreLS,
    setHighScoreLS,
    setScoreLS,
  ]);

  useEffect(() => {
    setBaseLS(state.base);
    setCategoriaLS(state.categoria);
    setTituloCategoriaLS(state.tituloCategoria);
  }, [
    state.base,
    state.categoria,
    state.tituloCategoria,
    setBaseLS,
    setCategoriaLS,
    setTituloCategoriaLS,
  ]);

  useEffect(() => {
    setAreaLS(state.area);
  }, [state.area, setAreaLS]);

  // BroadcastChannel
  const postKataMessage = useBroadcastChannel("kata-channel");

  useEffect(() => {
    const competidorActual = state.competidores.find(
      (comp) => !comp.PuntajeFinal && !comp.Kiken,
    );

    const dataParaEnviar = {
      competidor: competidorActual?.Nombre || "",
      categoria: state.categoria || "",
      puntajes: state.judges.map((judge) => judge || ""),
      puntajeFinal: state.score || "",
      puntajeMenor: state.lowScore || "",
      puntajeMayor: state.highScore || "",
      competidores: state.competidores,
    };

    postKataMessage(dataParaEnviar);
  }, [
    state.competidores,
    state.categoria,
    state.judges,
    state.score,
    state.lowScore,
    state.highScore,
    postKataMessage,
  ]);

  // Helper functions
  const updateJudge = (index: number, value: string) => {
    dispatch({ type: "UPDATE_JUDGE", payload: { index, value } });
  };

  const clearJudge = (index: number) => {
    dispatch({ type: "CLEAR_JUDGE", payload: index });
  };

  const calculateScore = () => {
    dispatch({ type: "SET_SUBMITTED", payload: true });

    const updatedJudges = state.judges.map((judge: string) => {
      if (judge.endsWith(".")) {
        return judge + "0";
      }

      return judge;
    });

    dispatch({ type: "SET_JUDGES", payload: updatedJudges });

    const sortedJudges = updatedJudges
      .filter((judge: string) => judge !== "")
      .sort((a: string, b: string) => parseFloat(a) - parseFloat(b));

    if (sortedJudges.length !== state.numJudges) {
      return;
    }

    if (state.numJudges === 3) {
      const total = sortedJudges.reduce(
        (sum: number, judge: string) => sum + parseFloat(judge),
        0,
      );

      dispatch({
        type: "SET_SCORES",
        payload: {
          low: "",
          high: "",
          final: (Math.round(total * 10) / 10).toString(),
        },
      });
    } else if (state.numJudges === 5) {
      const total = sortedJudges
        .slice(1, -1)
        .reduce((sum: number, judge: string) => sum + parseFloat(judge), 0);
      const low = sortedJudges[0];
      const high = sortedJudges[sortedJudges.length - 1];

      dispatch({
        type: "SET_SCORES",
        payload: {
          low,
          high,
          final: (Math.round(total * 10) / 10).toString(),
        },
      });
    }

    dispatch({ type: "SET_SUBMITTED", payload: false });
  };

  const clearAllScores = () => {
    dispatch({ type: "CLEAR_SCORES" });
  };

  const saveScore = () => {
    const competidorSinPuntaje = state.competidores.find(
      (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
    );

    if (!competidorSinPuntaje) return;

    const puntajeFinal = state.score
      ? Math.round(parseFloat(state.score) * 10) / 10
      : null;

    const competidoresActualizados = state.competidores.map(
      (comp: Competidor) => {
        if (comp.id === competidorSinPuntaje.id) {
          return {
            ...comp,
            PuntajeFinal: puntajeFinal,
            PuntajesJueces: [...state.judges],
          };
        }

        return comp;
      },
    );

    const competidoresOrdenados = competidoresActualizados.sort(
      (a: Competidor, b: Competidor) => {
        if (a.Kiken && !b.Kiken) return 1;
        if (!a.Kiken && b.Kiken) return -1;
        if (a.Kiken && b.Kiken) return 0;
        if (!a.PuntajeFinal) return 1;
        if (!b.PuntajeFinal) return -1;

        return b.PuntajeFinal! - a.PuntajeFinal!;
      },
    );

    dispatch({ type: "SET_COMPETIDORES", payload: competidoresOrdenados });
    clearAllScores();

    const todosCompletados = competidoresOrdenados.every(
      (comp: Competidor) => comp.PuntajeFinal !== null || comp.Kiken,
    );

    if (todosCompletados) {
      dispatch({ type: "SET_SHOW_RESULTS", payload: true });
    } else {
      const siguienteCompetidor = competidoresOrdenados.find(
        (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
      );

      if (siguienteCompetidor) {
        dispatch({
          type: "SET_TITULO_CATEGORIA",
          payload: siguienteCompetidor.TituloCategoria || "CATEGORIA",
        });
      }
    }
  };

  const handleKiken = () => {
    const competidorSinPuntaje = state.competidores.find(
      (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
    );

    if (!competidorSinPuntaje) return;

    const competidoresActualizados = state.competidores.map(
      (comp: Competidor) => {
        if (comp.id === competidorSinPuntaje.id) {
          return {
            ...comp,
            Kiken: true,
            PuntajeFinal: 0.0,
            PuntajesJueces: [null, null, null, null, null],
          };
        }

        return comp;
      },
    );

    const competidoresOrdenados = competidoresActualizados.sort(
      (a: Competidor, b: Competidor) => {
        if (a.Kiken && !b.Kiken) return 1;
        if (!a.Kiken && b.Kiken) return -1;
        if (a.Kiken && b.Kiken) return 0;
        if (!a.PuntajeFinal) return 1;
        if (!b.PuntajeFinal) return -1;

        return b.PuntajeFinal! - a.PuntajeFinal!;
      },
    );

    dispatch({ type: "SET_COMPETIDORES", payload: competidoresOrdenados });
    clearAllScores();

    const todosCompletados = competidoresOrdenados.every(
      (comp: Competidor) => comp.PuntajeFinal !== null || comp.Kiken,
    );

    if (todosCompletados) {
      dispatch({ type: "SET_SHOW_RESULTS", payload: true });
    } else {
      const siguienteCompetidor = competidoresOrdenados.find(
        (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
      );

      if (siguienteCompetidor) {
        dispatch({
          type: "SET_TITULO_CATEGORIA",
          payload: siguienteCompetidor.TituloCategoria || "CATEGORIA",
        });
      }
    }
  };

  const resetAll = () => {
    dispatch({ type: "RESET_ALL" });
  };

  const value: KataContextType = {
    state,
    dispatch,
    updateJudge,
    clearJudge,
    calculateScore,
    clearAllScores,
    saveScore,
    handleKiken,
    resetAll,
  };

  return <KataContext.Provider value={value}>{children}</KataContext.Provider>;
}

// Hook personalizado
export function useKata() {
  const context = useContext(KataContext);

  if (context === undefined) {
    throw new Error("useKata must be used within a KataProvider");
  }

  return context;
}

export type { Competidor, KataState, KataAction };

### src/context/KataContext.tsx
`	sx
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

import { useLocalStorage, useBroadcastChannel } from "@/hooks";

// Tipos
interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria: string;
  TituloCategoria: string;
  PuntajeFinal: number | null;
  PuntajesJueces: (string | null)[];
  Kiken: boolean;
}

interface KataState {
  // Competidores
  competidores: Competidor[];

  // Puntajes
  judges: string[];
  numJudges: number;
  lowScore: string;
  highScore: string;
  score: string;
  base: number;

  // Categoría y área
  categoria: string;
  tituloCategoria: string;
  area: string;
  areaSeleccionada: boolean;

  // UI State
  showResults: boolean;
  showAgregarDialog: boolean;
  submitted: boolean;
}

// Acciones
type KataAction =
  | { type: "SET_COMPETIDORES"; payload: Competidor[] }
  | { type: "ADD_COMPETIDOR"; payload: Competidor }
  | {
      type: "UPDATE_COMPETIDOR";
      payload: { id: number; data: Partial<Competidor> };
    }
  | { type: "SET_JUDGES"; payload: string[] }
  | { type: "UPDATE_JUDGE"; payload: { index: number; value: string } }
  | { type: "CLEAR_JUDGE"; payload: number }
  | { type: "SET_NUM_JUDGES"; payload: number }
  | {
      type: "SET_SCORES";
      payload: { low: string; high: string; final: string };
    }
  | { type: "CLEAR_SCORES" }
  | { type: "SET_BASE"; payload: number }
  | { type: "SET_CATEGORIA"; payload: string }
  | { type: "SET_TITULO_CATEGORIA"; payload: string }
  | { type: "SET_AREA"; payload: string }
  | { type: "SET_AREA_SELECCIONADA"; payload: boolean }
  | { type: "SET_SHOW_RESULTS"; payload: boolean }
  | { type: "SET_SHOW_AGREGAR_DIALOG"; payload: boolean }
  | { type: "SET_SUBMITTED"; payload: boolean }
  | { type: "RESET_ALL" };

// Estado inicial
const initialState: KataState = {
  competidores: [],
  judges: Array(5).fill(""),
  numJudges: 5,
  lowScore: "",
  highScore: "",
  score: "",
  base: 6,
  categoria: "",
  tituloCategoria: "",
  area: "",
  areaSeleccionada: false,
  showResults: false,
  showAgregarDialog: false,
  submitted: false,
};

// Reducer
function kataReducer(state: KataState, action: KataAction): KataState {
  switch (action.type) {
    case "SET_COMPETIDORES":
      return { ...state, competidores: action.payload };

    case "ADD_COMPETIDOR":
      return {
        ...state,
        competidores: [...state.competidores, action.payload],
      };

    case "UPDATE_COMPETIDOR":
      return {
        ...state,
        competidores: state.competidores.map((comp) =>
          comp.id === action.payload.id
            ? { ...comp, ...action.payload.data }
            : comp,
        ),
      };

    case "SET_JUDGES":
      return { ...state, judges: action.payload };

    case "UPDATE_JUDGE":
      const newJudges = [...state.judges];

      newJudges[action.payload.index] = action.payload.value;

      return { ...state, judges: newJudges, submitted: false };

    case "CLEAR_JUDGE":
      const clearedJudges = [...state.judges];

      clearedJudges[action.payload] = "";

      return { ...state, judges: clearedJudges, submitted: false };

    case "SET_NUM_JUDGES":
      return {
        ...state,
        numJudges: action.payload,
        judges: Array(action.payload).fill(""),
      };

    case "SET_SCORES":
      return {
        ...state,
        lowScore: action.payload.low,
        highScore: action.payload.high,
        score: action.payload.final,
        submitted: false,
      };

    case "CLEAR_SCORES":
      return {
        ...state,
        judges: Array(state.numJudges).fill(""),
        lowScore: "",
        highScore: "",
        score: "",
        submitted: false,
      };

    case "SET_BASE":
      return { ...state, base: action.payload };

    case "SET_CATEGORIA":
      return { ...state, categoria: action.payload };

    case "SET_TITULO_CATEGORIA":
      return { ...state, tituloCategoria: action.payload };

    case "SET_AREA":
      return { ...state, area: action.payload };

    case "SET_AREA_SELECCIONADA":
      return { ...state, areaSeleccionada: action.payload };

    case "SET_SHOW_RESULTS":
      return { ...state, showResults: action.payload };

    case "SET_SHOW_AGREGAR_DIALOG":
      return { ...state, showAgregarDialog: action.payload };

    case "SET_SUBMITTED":
      return { ...state, submitted: action.payload };

    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}

// Context
interface KataContextType {
  state: KataState;
  dispatch: React.Dispatch<KataAction>;
  // Helper functions
  updateJudge: (index: number, value: string) => void;
  clearJudge: (index: number) => void;
  calculateScore: () => void;
  clearAllScores: () => void;
  saveScore: () => void;
  handleKiken: () => void;
  resetAll: () => void;
}

const KataContext = createContext<KataContextType | undefined>(undefined);

// Provider
export function KataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kataReducer, initialState);

  // Persistencia con useLocalStorage
  const [, setCompetidoresLS] = useLocalStorage<Competidor[]>(
    "kataCompetidores",
    [],
  );
  const [, setJudgesLS] = useLocalStorage<string[]>(
    "kataJudges",
    Array(5).fill(""),
  );
  const [, setNumJudgesLS] = useLocalStorage<number>("kataNumJudges", 5);
  const [, setLowScoreLS] = useLocalStorage<string>("kataLowScore", "");
  const [, setHighScoreLS] = useLocalStorage<string>("kataHighScore", "");
  const [, setScoreLS] = useLocalStorage<string>("kataScore", "");
  const [, setBaseLS] = useLocalStorage<number>("kataBase", 6);
  const [, setCategoriaLS] = useLocalStorage<string>("kataCategoria", "");
  const [, setTituloCategoriaLS] = useLocalStorage<string>(
    "kataTituloCategoria",
    "",
  );
  const [, setAreaLS] = useLocalStorage<string>("kataArea", "");

  // Sincronizar con localStorage
  useEffect(() => {
    setCompetidoresLS(state.competidores);
  }, [state.competidores, setCompetidoresLS]);

  useEffect(() => {
    setJudgesLS(state.judges);
    setNumJudgesLS(state.numJudges);
  }, [state.judges, state.numJudges, setJudgesLS, setNumJudgesLS]);

  useEffect(() => {
    setLowScoreLS(state.lowScore);
    setHighScoreLS(state.highScore);
    setScoreLS(state.score);
  }, [
    state.lowScore,
    state.highScore,
    state.score,
    setLowScoreLS,
    setHighScoreLS,
    setScoreLS,
  ]);

  useEffect(() => {
    setBaseLS(state.base);
    setCategoriaLS(state.categoria);
    setTituloCategoriaLS(state.tituloCategoria);
  }, [
    state.base,
    state.categoria,
    state.tituloCategoria,
    setBaseLS,
    setCategoriaLS,
    setTituloCategoriaLS,
  ]);

  useEffect(() => {
    setAreaLS(state.area);
  }, [state.area, setAreaLS]);

  // BroadcastChannel
  const postKataMessage = useBroadcastChannel("kata-channel");

  useEffect(() => {
    const competidorActual = state.competidores.find(
      (comp) => !comp.PuntajeFinal && !comp.Kiken,
    );

    const dataParaEnviar = {
      competidor: competidorActual?.Nombre || "",
      categoria: state.categoria || "",
      puntajes: state.judges.map((judge) => judge || ""),
      puntajeFinal: state.score || "",
      puntajeMenor: state.lowScore || "",
      puntajeMayor: state.highScore || "",
      competidores: state.competidores,
    };

    postKataMessage(dataParaEnviar);
  }, [
    state.competidores,
    state.categoria,
    state.judges,
    state.score,
    state.lowScore,
    state.highScore,
    postKataMessage,
  ]);

  // Helper functions
  const updateJudge = (index: number, value: string) => {
    dispatch({ type: "UPDATE_JUDGE", payload: { index, value } });
  };

  const clearJudge = (index: number) => {
    dispatch({ type: "CLEAR_JUDGE", payload: index });
  };

  const calculateScore = () => {
    dispatch({ type: "SET_SUBMITTED", payload: true });

    const updatedJudges = state.judges.map((judge: string) => {
      if (judge.endsWith(".")) {
        return judge + "0";
      }

      return judge;
    });

    dispatch({ type: "SET_JUDGES", payload: updatedJudges });

    const sortedJudges = updatedJudges
      .filter((judge: string) => judge !== "")
      .sort((a: string, b: string) => parseFloat(a) - parseFloat(b));

    if (sortedJudges.length !== state.numJudges) {
      return;
    }

    if (state.numJudges === 3) {
      const total = sortedJudges.reduce(
        (sum: number, judge: string) => sum + parseFloat(judge),
        0,
      );

      dispatch({
        type: "SET_SCORES",
        payload: {
          low: "",
          high: "",
          final: (Math.round(total * 10) / 10).toString(),
        },
      });
    } else if (state.numJudges === 5) {
      const total = sortedJudges
        .slice(1, -1)
        .reduce((sum: number, judge: string) => sum + parseFloat(judge), 0);
      const low = sortedJudges[0];
      const high = sortedJudges[sortedJudges.length - 1];

      dispatch({
        type: "SET_SCORES",
        payload: {
          low,
          high,
          final: (Math.round(total * 10) / 10).toString(),
        },
      });
    }

    dispatch({ type: "SET_SUBMITTED", payload: false });
  };

  const clearAllScores = () => {
    dispatch({ type: "CLEAR_SCORES" });
  };

  const saveScore = () => {
    const competidorSinPuntaje = state.competidores.find(
      (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
    );

    if (!competidorSinPuntaje) return;

    const puntajeFinal = state.score
      ? Math.round(parseFloat(state.score) * 10) / 10
      : null;

    const competidoresActualizados = state.competidores.map(
      (comp: Competidor) => {
        if (comp.id === competidorSinPuntaje.id) {
          return {
            ...comp,
            PuntajeFinal: puntajeFinal,
            PuntajesJueces: [...state.judges],
          };
        }

        return comp;
      },
    );

    const competidoresOrdenados = competidoresActualizados.sort(
      (a: Competidor, b: Competidor) => {
        if (a.Kiken && !b.Kiken) return 1;
        if (!a.Kiken && b.Kiken) return -1;
        if (a.Kiken && b.Kiken) return 0;
        if (!a.PuntajeFinal) return 1;
        if (!b.PuntajeFinal) return -1;

        return b.PuntajeFinal! - a.PuntajeFinal!;
      },
    );

    dispatch({ type: "SET_COMPETIDORES", payload: competidoresOrdenados });
    clearAllScores();

    const todosCompletados = competidoresOrdenados.every(
      (comp: Competidor) => comp.PuntajeFinal !== null || comp.Kiken,
    );

    if (todosCompletados) {
      dispatch({ type: "SET_SHOW_RESULTS", payload: true });
    } else {
      const siguienteCompetidor = competidoresOrdenados.find(
        (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
      );

      if (siguienteCompetidor) {
        dispatch({
          type: "SET_TITULO_CATEGORIA",
          payload: siguienteCompetidor.TituloCategoria || "CATEGORIA",
        });
      }
    }
  };

  const handleKiken = () => {
    const competidorSinPuntaje = state.competidores.find(
      (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
    );

    if (!competidorSinPuntaje) return;

    const competidoresActualizados = state.competidores.map(
      (comp: Competidor) => {
        if (comp.id === competidorSinPuntaje.id) {
          return {
            ...comp,
            Kiken: true,
            PuntajeFinal: 0.0,
            PuntajesJueces: [null, null, null, null, null],
          };
        }

        return comp;
      },
    );

    const competidoresOrdenados = competidoresActualizados.sort(
      (a: Competidor, b: Competidor) => {
        if (a.Kiken && !b.Kiken) return 1;
        if (!a.Kiken && b.Kiken) return -1;
        if (a.Kiken && b.Kiken) return 0;
        if (!a.PuntajeFinal) return 1;
        if (!b.PuntajeFinal) return -1;

        return b.PuntajeFinal! - a.PuntajeFinal!;
      },
    );

    dispatch({ type: "SET_COMPETIDORES", payload: competidoresOrdenados });
    clearAllScores();

    const todosCompletados = competidoresOrdenados.every(
      (comp: Competidor) => comp.PuntajeFinal !== null || comp.Kiken,
    );

    if (todosCompletados) {
      dispatch({ type: "SET_SHOW_RESULTS", payload: true });
    } else {
      const siguienteCompetidor = competidoresOrdenados.find(
        (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
      );

      if (siguienteCompetidor) {
        dispatch({
          type: "SET_TITULO_CATEGORIA",
          payload: siguienteCompetidor.TituloCategoria || "CATEGORIA",
        });
      }
    }
  };

  const resetAll = () => {
    dispatch({ type: "RESET_ALL" });
  };

  const value: KataContextType = {
    state,
    dispatch,
    updateJudge,
    clearJudge,
    calculateScore,
    clearAllScores,
    saveScore,
    handleKiken,
    resetAll,
  };

  return <KataContext.Provider value={value}>{children}</KataContext.Provider>;
}

// Hook personalizado
export function useKata() {
  const context = useContext(KataContext);

  if (context === undefined) {
    throw new Error("useKata must be used within a KataProvider");
  }

  return context;
}

export type { Competidor, KataState, KataAction };

### src/context/KumiteContext.tsx
`	sx
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import * as XLSX from "xlsx";

import { Competidor, Match } from "@/types";
import { generateBracket } from "@/utils/bracketUtils";
import { useBroadcastChannel } from "@/hooks/useBroadcastChannel";
import { useConfig } from "./ConfigContext";

// --- Types & Initial State ---

export interface HistoryLogItem {
  id: number;
  timestamp: number;
  competitor: "aka" | "shiro";
  actionType: string; // "ippon", "wazari", "atenai", etc.
  description: string;
  previousValue: any;
  newValue: any;
  // Snapshot of scores to be safe? For now, delta is enough for simple numeric/bool toggles
}

export const createDefaultBracket = () => {
  const defaultCompetitors: Competidor[] = [
    { id: 1, Nombre: "AKA", Edad: 0 },
    { id: 2, Nombre: "SHIRO", Edad: 0 },
  ];

  return generateBracket(defaultCompetitors);
};

export const initialState = {
  timer: {
    tiempoRestante: 180,
    tiempoInicial: 180,
    temporizadorIniciado: false,
    timerStarted: false,
    timerPaused: false,
    selectedTime: 180,
  },
  scores: {
    aka: {
      wazari: 0,
      ippon: 0,
      kinshi: false,
      kinshiNi: false,
      kinshiChui: false,
      kinshiHansoku: false,
      atenai: false,
      atenaiChui: false,
      atenaiHansoku: false,
      shikaku: false,
      kiken: false,
      nombre: "AKA",
    },
    shiro: {
      wazari: 0,
      ippon: 0,
      kinshi: false,
      kinshiNi: false,
      kinshiChui: false,
      kinshiHansoku: false,
      atenai: false,
      atenaiChui: false,
      atenaiHansoku: false,
      shikaku: false,
      kiken: false,
      nombre: "SHIRO",
    },
  },
  match: {
    ganador: null as "aka" | "shiro" | null,
    ganadorNombre: "",
    showGanador: false,
    categoria: "",
    area: "",
    areaSeleccionada: false,
  },
  history: [] as HistoryLogItem[],
  bracket: createDefaultBracket(),
  currentRoundIndex: 0,
  currentMatchIndex: 0,
};

export type KumiteState = typeof initialState;

type Action =
  | { type: "SET_TIMER"; payload: Partial<typeof initialState.timer> }
  | { type: "UPDATE_SCORE"; competitor: "aka" | "shiro"; payload: any }
  | { type: "UPDATE_MATCH"; payload: Partial<typeof initialState.match> }
  | { type: "SET_BRACKET"; payload: any }
  | { type: "INIT_DEFAULT_BRACKET" }
  | {
    type: "NEXT_MATCH";
    payload: { currentMatchIndex: number; currentRoundIndex: number };
  }
  | { type: "RESET_ALL" }
  | { type: "ADD_HISTORY"; payload: HistoryLogItem }
  | { type: "UNDO_LAST_ACTION" };

function reducer(state: KumiteState, action: Action): KumiteState {
  switch (action.type) {
    case "SET_TIMER":
      return { ...state, timer: { ...state.timer, ...action.payload } };
    case "UPDATE_SCORE":
      return {
        ...state,
        scores: {
          ...state.scores,
          [action.competitor]: {
            ...state.scores[action.competitor],
            ...action.payload,
          },
        },
      };
    case "UPDATE_MATCH":
      return { ...state, match: { ...state.match, ...action.payload } };
    case "SET_BRACKET":
      return { ...state, bracket: action.payload };
    case "INIT_DEFAULT_BRACKET":
      return {
        ...state,
        bracket: createDefaultBracket(),
        currentRoundIndex: 0,
        currentMatchIndex: 0,
        match: {
          ...state.match,
          ganador: null,
          showGanador: false,
          ganadorNombre: "",
        },
        scores: initialState.scores,
      };
    case "NEXT_MATCH":
      return {
        ...state,
        currentMatchIndex: action.payload.currentMatchIndex,
        currentRoundIndex: action.payload.currentRoundIndex,
        match: {
          ...state.match,
          ganador: null,
          showGanador: false,
          ganadorNombre: "",
        },
        scores: initialState.scores,
      };
    case "RESET_ALL":
      return initialState;
    case "ADD_HISTORY":
      return { ...state, history: [...state.history, action.payload] };
    case "UNDO_LAST_ACTION": {
      if (state.history.length === 0) return state;

      const lastAction = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);

      // Revert logic
      const { competitor, actionType, previousValue } = lastAction;

      // Special handling if reverting a point that caused a winner?
      // For now, just reverting the score.
      // If winner was set, we might need to unset it.
      // Ideally, specific winner-set actions should also be in history if we want to undo them directly.
      // But typically, reducing score below threshold should unset winner?
      // Or we manually unset winner if it exists?
      // Let's rely on manual "Winner" modal close or if logic allows.
      // Actually, if we undo a point, we just set the score back.
      // If there was a winner, we might want to clear it if it was auto-set?
      // Let's keep it simple: just revert the value.
      // If the user wants to "un-win", they can just continue match?
      // No, if winner is set, inputs are disabled. We need to clear winner if we undo.

      const newState = {
        ...state,
        scores: {
          ...state.scores,
          [competitor]: {
            ...state.scores[competitor],
            // Special handling for increments vs sets?
            // "wazari": previousValue (which is number)
            // "kinshi": previousValue (which is bool)
            [actionType]: previousValue,
          },
        },
        history: newHistory,
      };

      // If we undo, and there was a winner, we should probably clear the winner
      // to allow the match to continue, specifically if the undo changes the score.
      if (state.match.ganador) {
        newState.match = {
          ...newState.match,
          ganador: null,
          showGanador: false,
          ganadorNombre: ""
        }
      }

      return newState;
    }
    default:
      return state;
  }
}

// --- Context Definition ---

interface KumiteContextType {
  state: KumiteState;
  dispatch: React.Dispatch<Action>;
  // Actions
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  selectTime: (time: number) => void;
  handleFileUpload: (file: File) => void;
  updateScore: (competitor: "aka" | "shiro", type: string, value?: any) => void; // Generalized score update
  setWinner: (ganador: "aka" | "shiro", nombre?: string) => void;
  nextMatch: () => void;
  resetAll: () => void;
  setArea: (area: string) => void;
  closeWinnerModal: () => void;
  broadcastData: () => void; // Helper to force broadcast
  undoLastAction: () => void;
}

const KumiteContext = createContext<KumiteContextType | undefined>(undefined);

// --- Provider ---

export const KumiteProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { config } = useConfig();

  // Broadcast Channel
  const postMessage = useBroadcastChannel("kumite-channel");

  // --- Logic Helpers ---

  const startTimer = useCallback(() => {
    if (!state.timer.temporizadorIniciado && state.timer.selectedTime > 0) {
      dispatch({
        type: "SET_TIMER",
        payload: {
          temporizadorIniciado: true,
          tiempoRestante: state.timer.selectedTime,
        },
      });
    }
  }, [state.timer.temporizadorIniciado, state.timer.selectedTime]);

  const stopTimer = useCallback(() => {
    dispatch({ type: "SET_TIMER", payload: { temporizadorIniciado: false } });
  }, []);

  const resetTimer = useCallback(() => {
    if (state.timer.selectedTime > 0) {
      dispatch({
        type: "SET_TIMER",
        payload: {
          temporizadorIniciado: false,
          tiempoRestante: state.timer.selectedTime,
        },
      });
    }
  }, [state.timer.selectedTime]);

  const selectTime = useCallback((time: number) => {
    dispatch({
      type: "SET_TIMER",
      payload: {
        selectedTime: time,
        tiempoRestante: time,
        temporizadorIniciado: false,
      },
    });
  }, []);

  const setArea = useCallback((area: string) => {
    dispatch({
      type: "UPDATE_MATCH",
      payload: { area, areaSeleccionada: true },
    });
  }, []);

  const closeWinnerModal = useCallback(() => {
    dispatch({ type: "UPDATE_MATCH", payload: { showGanador: false } });
  }, []);

  // Bracket & Winner Logic
  const updateBracketWithWinner = useCallback(
    (ganador: any) => {
      const newBracket = [...state.bracket];

      if (
        !newBracket[state.currentRoundIndex] ||
        !newBracket[state.currentRoundIndex][state.currentMatchIndex]
      )
        return;

      const currentMatch =
        newBracket[state.currentRoundIndex][state.currentMatchIndex];

      currentMatch.winner = ganador;

      if (state.currentRoundIndex + 1 < newBracket.length) {
        const nextRoundIndex = state.currentRoundIndex + 1;
        const nextMatchIndex = Math.floor(state.currentMatchIndex / 2);
        const nextMatch = newBracket[nextRoundIndex][nextMatchIndex];
        const positionInPair = state.currentMatchIndex % 2;

        nextMatch.pair[positionInPair] = ganador;
      }
      dispatch({ type: "SET_BRACKET", payload: newBracket });
    },
    [state.bracket, state.currentRoundIndex, state.currentMatchIndex],
  );

  const setWinner = useCallback(
    (ganador: "aka" | "shiro", nombreCompetidor?: string) => {
      if (!state.bracket.length) return;

      const currentMatch =
        state.bracket[state.currentRoundIndex][state.currentMatchIndex];

      if (!currentMatch) return;

      const ganadorCompetidor =
        ganador === "aka" ? currentMatch.pair[0] : currentMatch.pair[1];
      const ganadorNombre =
        nombreCompetidor ||
        (typeof ganadorCompetidor === "object"
          ? ganadorCompetidor.Nombre
          : ganadorCompetidor);

      dispatch({
        type: "UPDATE_MATCH",
        payload: { ganador, showGanador: true, ganadorNombre },
      });
      stopTimer();
      updateBracketWithWinner(ganadorCompetidor);
    },
    [
      state.bracket,
      state.currentRoundIndex,
      state.currentMatchIndex,
      startTimer,
      stopTimer,
      updateBracketWithWinner,
    ],
  );

  // Automated Score Intepretation (Winner Check)
  useEffect(() => {
    if (!state.bracket.length || state.match.ganador) return;

    const puntajeAka = state.scores.aka.wazari * 0.5 + state.scores.aka.ippon;
    const puntajeShiro =
      state.scores.shiro.wazari * 0.5 + state.scores.shiro.ippon;

    const { winThreshold } = config.kumite;

    if (puntajeAka >= winThreshold) {
      // Helper for getting name
      const currentMatch =
        state.bracket[state.currentRoundIndex]?.[state.currentMatchIndex];

      if (!currentMatch) return;
      const akaCompetidor = currentMatch.pair[0];
      const akaNombre =
        typeof akaCompetidor === "object"
          ? akaCompetidor.Nombre
          : akaCompetidor;

      setWinner("aka", akaNombre);
    } else if (puntajeShiro >= winThreshold) {
      const currentMatch =
        state.bracket[state.currentRoundIndex]?.[state.currentMatchIndex];

      if (!currentMatch) return;
      const shiroCompetidor = currentMatch.pair[1];
      const shiroNombre =
        typeof shiroCompetidor === "object"
          ? shiroCompetidor.Nombre
          : shiroCompetidor;

      setWinner("shiro", shiroNombre);
    }
  }, [
    state.scores,
    state.bracket,
    state.match.ganador,
    state.currentRoundIndex,
    state.currentMatchIndex,
    setWinner,
    config.kumite,
  ]);

  const nextMatch = useCallback(() => {
    let newMatchIndex = state.currentMatchIndex + 1;
    let newRoundIndex = state.currentRoundIndex;

    if (
      state.bracket[state.currentRoundIndex] &&
      newMatchIndex >= state.bracket[state.currentRoundIndex].length
    ) {
      newRoundIndex += 1;
      newMatchIndex = 0;
    }

    if (newRoundIndex >= state.bracket.length) {
      console.log("Fin del torneo");

      return;
    }

    dispatch({
      type: "NEXT_MATCH",
      payload: {
        currentMatchIndex: newMatchIndex,
        currentRoundIndex: newRoundIndex,
      },
    });

    const nextMatchItem = state.bracket[newRoundIndex][newMatchIndex];
    const [aka, shiro] = nextMatchItem.pair;

    dispatch({
      type: "UPDATE_SCORE",
      competitor: "aka",
      payload: { nombre: typeof aka === "object" ? aka.Nombre : aka },
    });
    dispatch({
      type: "UPDATE_SCORE",
      competitor: "shiro",
      payload: { nombre: typeof shiro === "object" ? shiro.Nombre : shiro },
    });

    resetTimer();
  }, [
    state.currentMatchIndex,
    state.currentRoundIndex,
    state.bracket,
    resetTimer,
  ]);

  const updateScore = useCallback(
    (competitor: "aka" | "shiro", type: string, value?: any) => {
      if (state.match.ganador) return;

      // Handle specific logic like incrementing
      if (type === "wazari") {
        const newValue = state.scores[competitor].wazari + 1;

        dispatch({
          type: "ADD_HISTORY",
          payload: {
            id: Date.now(),
            timestamp: Date.now(),
            competitor,
            actionType: "wazari",
            description: "Waza-ari (+1)",
            previousValue: state.scores[competitor].wazari,
            newValue,
          }
        });

        dispatch({
          type: "UPDATE_SCORE",
          competitor,
          payload: { wazari: newValue },
        });
      } else if (type === "ippon") {
        const newValue = state.scores[competitor].ippon + 1;

        dispatch({
          type: "ADD_HISTORY",
          payload: {
            id: Date.now(),
            timestamp: Date.now(),
            competitor,
            actionType: "ippon",
            description: "Ippon (+1)",
            previousValue: state.scores[competitor].ippon,
            newValue,
          }
        });

        dispatch({
          type: "UPDATE_SCORE",
          competitor,
          payload: { ippon: newValue },
        });
      } else {
        // Bool flags or direct values
        const newValue = value !== undefined ? value : true;
        const prevValue = state.scores[competitor][type as keyof typeof state.scores.aka];

        dispatch({
          type: "ADD_HISTORY",
          payload: {
            id: Date.now(),
            timestamp: Date.now(),
            competitor,
            actionType: type,
            description: `${type} (${newValue})`,
            previousValue: prevValue,
            newValue: newValue,
          }
        });

        dispatch({
          type: "UPDATE_SCORE",
          competitor,
          payload: { [type]: newValue },
        });
      }

      // Logic side effects (Hansoku triggers winner)
      const opponent = competitor === "aka" ? "shiro" : "aka";

      if (
        (type === "kinshiHansoku" ||
          type === "atenaiHansoku" ||
          type === "shikaku" ||
          type === "kiken") &&
        config.kumite.autoWinnerOnPenalty
      ) {
        // If AKA gets Hansoku, SHIRO wins
        const currentMatch =
          state.bracket[state.currentRoundIndex]?.[state.currentMatchIndex];

        if (currentMatch) {
          const winnerCompetitor =
            currentMatch.pair[opponent === "aka" ? 0 : 1];
          const winnerName =
            typeof winnerCompetitor === "object"
              ? winnerCompetitor.Nombre
              : winnerCompetitor;

          setWinner(opponent, winnerName);
        }
      }
    },
    [
      state.match.ganador,
      state.scores,
      state.bracket,
      state.currentMatchIndex,
      state.currentRoundIndex,
      setWinner,
      config.kumite,
    ],
  );

  const undoLastAction = useCallback(() => {
    dispatch({ type: "UNDO_LAST_ACTION" });
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const categoriaCell = worksheet["B1"];

      const competidoresExtraidos: Competidor[] = [];
      let row = 3;
      let id = 1;

      while (true) {
        const nombreCell = worksheet[`A${row}`];
        const edadCell = worksheet[`B${row}`];

        if (!nombreCell || !nombreCell.v) break;
        competidoresExtraidos.push({
          id: id++,
          Nombre: nombreCell.v.toString(),
          Edad: edadCell ? parseInt(edadCell.v.toString()) || 0 : 0,
        });
        row++;
      }

      if (competidoresExtraidos.length > 0) {
        const bracketData = generateBracket(competidoresExtraidos);

        if (bracketData.length > 0 && bracketData[0].length > 0) {
          const primerCombate = bracketData[0][0];

          dispatch({
            type: "UPDATE_SCORE",
            competitor: "aka",
            payload: {
              nombre:
                typeof primerCombate.pair[0] === "object"
                  ? primerCombate.pair[0].Nombre
                  : primerCombate.pair[0],
            },
          });
          dispatch({
            type: "UPDATE_SCORE",
            competitor: "shiro",
            payload: {
              nombre:
                typeof primerCombate.pair[1] === "object"
                  ? primerCombate.pair[1].Nombre
                  : primerCombate.pair[1],
            },
          });
        }
        dispatch({ type: "SET_BRACKET", payload: bracketData });
        if (categoriaCell) {
          dispatch({
            type: "UPDATE_MATCH",
            payload: { categoria: categoriaCell.v },
          });
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
    // Reset timer local state if needed?
  }, []);

  // Broadcast logic
  const broadcastData = useCallback(() => {
    // Construct data object
    const currentMatch =
      state.bracket[state.currentRoundIndex]?.[state.currentMatchIndex];
    const nextMatch =
      state.bracket[state.currentRoundIndex]?.[state.currentMatchIndex + 1] ||
      state.bracket[state.currentRoundIndex + 1]?.[0];

    const data = {
      scores: state.scores,
      timer: {
        isRunning: state.timer.temporizadorIniciado,
        time: state.timer.tiempoRestante,
      },
      matchInfo: { current: currentMatch, next: nextMatch },
    };

    postMessage(data);
  }, [state, postMessage]);

  useEffect(() => {
    broadcastData();
  }, [
    state.scores,
    state.timer.tiempoRestante,
    state.timer.temporizadorIniciado,
    state.match,
    broadcastData,
  ]);

  return (
    <KumiteContext.Provider
      value={{
        state,
        dispatch,
        startTimer,
        stopTimer,
        resetTimer,
        selectTime,
        handleFileUpload,
        updateScore,
        setWinner,
        nextMatch,
        resetAll,
        setArea,
        closeWinnerModal,
        broadcastData,
        undoLastAction,
      }}
    >
      {children}
    </KumiteContext.Provider>
  );
};

export const useKumite = () => {
  const context = useContext(KumiteContext);

  if (!context) {
    throw new Error("useKumite must be used within a KumiteProvider");
  }

  return context;
};

## 10. Source Code - Pages

### src/pages/index.tsx
`	sx
import { useNavigate } from "react-router-dom";
import {
  Image,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  usePagination,
  PaginationItemType,
} from "@heroui/react";
import { RiInformationLine } from "react-icons/ri";

import Logo from "@/assets/images/kenshukan-logo.png";
import MY_LOGO from "@/assets/images/Logo-3.png";
import Kata from "@/assets/images/kata.png";
import Kumite from "@/assets/images/kumite.png";
import KataKanshi from "@/assets/images/kata-kanshi.png";
import KumiKanshi from "@/assets/images/kumi-kanshi.png";
import TeKanshi from "@/assets/images/te-kanshi.png";
import ExcelKata from "@/assets/images/Ejemplo excel kata.jpg";
import ExcelKumite from "@/assets/images/Ejemplo excel kumite.jpg";
import Reglamento from "@/assets/World Union of Karate TRADUCCION  Final (1).pdf";
import PDFReader from "@/components/PDFReader";

const styleButton =
  "w-[45%] sm:w-[35%] md:w-[30%] lg:w-[25%] xl:w-[20%] h-[80%] cursor-pointer font-bold text-center shadow-md hover:shadow-lg italic flex flex-col hover:text-white";

export const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M15.5 19l-7-7 7-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default function IndexPage() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { activePage, range, setPage, onNext, onPrevious } = usePagination({
    total: 6,
    showControls: true,
    siblings: 10,
    boundaries: 10,
  });

  const handleKataClick = async () => {
    navigate("/kata");
  };

  const handleKumiteClick = async () => {
    navigate("/kumite");
  };

  // Funciones para carrusel infinito
  const handleNext = () => {
    if (activePage === 6) {
      setPage(1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (activePage === 1) {
      setPage(6);
    } else {
      onPrevious();
    }
  };

  // Contenido del carrusel
  const carouselContent = [
    {
      title: "¿Qué es esta aplicación?",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-white">
            Esta es una aplicación de marcador para competencias de Karate Do,
            específicamente diseñada para eventos de Kata y Kumite. Permite
            gestionar competidores, crear llaves de competencia y llevar el
            control de puntuaciones en tiempo real.
          </p>
        </div>
      ),
    },
    {
      title: "Funcionalidades principales",
      content: (
        <div className="space-y-4">
          <ul className="list-disc list-inside space-y-1 text-gray-700  dark:text-white">
            <li>
              <strong>Kata:</strong> Gestión de competidores, creación de llaves
              y evaluación de katas
            </li>
            <li>
              <strong>Kumite:</strong> Control de combates con temporizador y
              sistema de puntuación
            </li>
            <li>
              <strong>Llaves:</strong> Generación automática de brackets de
              competencia
            </li>
            <li>
              <strong>Resultados:</strong> Visualización de resultados finales
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Excel para Kata",
      content: (
        <div className="w-full bg-gray-100 rounded-lg flex items-center justify-start text-gray-500">
          <div className="flex flex-col gap-2">
            <p>
              Para cargar los competidores, se debe usar el siguiente formato de
              Excel:
            </p>
            <Image alt="Excel Kata" src={ExcelKata} />
            <p>
              Con el excel en ese formato, la aplicacion puede cargar
              competidores sin problema. Sin embargo si falta algun competidor
              se puede agregar desde la interfaz de la aplicacion.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Excel para Kumite",
      content: (
        <div className="w-full bg-gray-100 rounded-lg flex items-center justify-start text-gray-500">
          <div className="flex flex-col gap-2">
            <p>
              Para cargar los competidores, se debe usar el siguiente formato de
              Excel:
            </p>
            <Image alt="Excel Kumite" src={ExcelKumite} />
            <p>
              Con el excel en ese formato, la aplicacion puede cargar
              competidores sin problema. NO SE PUEDEN AGREGAR COMPETIDORES DESDE
              LA INTERFAZ DE LA APLICACION, asique en caso de faltar se debe
              modificar el excel antes que empiece la competencia.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Reglamento",
      content: <PDFReader fileUrl={Reglamento} />,
    },
    {
      title: "",
      content: (
        <Image
          alt="Logo"
          className="w-full h-[40%] pt-10 object-contain"
          src={MY_LOGO}
        />
      ),
    },
  ];

  return (
    <div className="w-screen h-screen flex flex-col justify-between bg-gradient-to-b from-blue-500/30 to-blue-800/90 relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          isIconOnly
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          color="primary"
          variant="bordered"
          onPress={onOpen}
        >
          <RiInformationLine size={24} />
        </Button>
      </div>
      <div className="w-full h-full flex items-center relative justify-center">
        <Button
          className={`${styleButton} pl-4 sm:pl-8 md:pl-10 lg:pl-12 xl:pl-14 items-start rounded-l-full bg-gradient-to-r from-zinc-100 to-blue-600 hover:bg-gradient-to-r hover:from-zinc-200 hover:to-blue-700`}
          onPress={handleKataClick}
        >
          <Image
            isZoomed
            alt="Kata"
            className="w-20 sm:w-28 md:w-32 lg:w-36 xl:w-40"
            classNames={{ img: "rounded-lg fill-white stroke-white" }}
            src={Kata}
          />
          <div className="flex gap-1">
            <Image
              alt="Kata-Kanshi"
              className="size-5 sm:size-6 md:size-7"
              src={KataKanshi}
            />
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
              Kata
            </h2>
          </div>
        </Button>
        <div
          className={`pointer-events-none w-[15%] sm:w-[12%] md:w-[10%] absolute ${isOpen ? "z-0" : "z-[9999]"}`}
        >
          <Image alt="Logo" className="rounded-full" src={Logo} />
        </div>
        <Button
          className={`${styleButton} pr-4 sm:pr-8 md:pr-10 lg:pr-12 xl:pr-14 items-end rounded-r-full bg-gradient-to-r from-blue-600 to-zinc-300 hover:bg-gradient-to-r hover:from-blue-700 hover:to-zinc-200`}
          onPress={handleKumiteClick}
        >
          <Image
            isZoomed
            alt="Kumite"
            className="w-20 sm:w-28 md:w-32 lg:w-36 xl:w-40"
            classNames={{ img: "rounded-lg fill-white stroke-white" }}
            src={Kumite}
          />
          <div className="flex">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mr-1">
              Kumite
            </h2>
            <Image
              alt="Kumi-Kanshi"
              className="size-5 sm:size-6 md:size-7"
              src={KumiKanshi}
            />
            <Image
              alt="Te-Kanshi"
              className="size-5 sm:size-6 md:size-7"
              src={TeKanshi}
            />
          </div>
        </Button>
      </div>

      <Modal
        className="w-[95%] max-w-[500px] min-h-[400px] max-h-[90vh] mx-auto"
        isOpen={isOpen}
        scrollBehavior="inside"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Image
                    alt="Logo"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                    src={Logo}
                  />
                  <span className="text-sm sm:text-base font-medium">
                    Marcador Kata Kumite - Kenshukan
                  </span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="min-h-[200px] sm:min-h-[350px]">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-3 sm:mb-4">
                    {carouselContent[activePage - 1]?.title}
                  </h3>
                  <div className="text-sm sm:text-base">
                    {carouselContent[activePage - 1]?.content}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="flex gap-2 justify-between flex-wrap">
                <div className="flex gap-2" />
                <div className="flex flex-col gap-2 self-center">
                  <ul className="flex gap-1 sm:gap-2 items-center">
                    {range.map((page) => {
                      if (page === PaginationItemType.NEXT) {
                        return (
                          <li
                            key={page}
                            aria-label="next page"
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          >
                            <button
                              className="w-full h-full bg-default-200 rounded-full flex items-center justify-center"
                              onClick={handleNext}
                            >
                              <ChevronIcon className="rotate-180 w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                          </li>
                        );
                      }

                      if (page === PaginationItemType.PREV) {
                        return (
                          <li
                            key={page}
                            aria-label="previous page"
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          >
                            <button
                              className="w-full h-full bg-default-200 rounded-full flex items-center justify-center"
                              onClick={handlePrevious}
                            >
                              <ChevronIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                          </li>
                        );
                      }

                      if (page === PaginationItemType.DOTS) {
                        return (
                          <li
                            key={page}
                            className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center text-xs sm:text-sm"
                          >
                            ...
                          </li>
                        );
                      }

                      return (
                        <li
                          key={page}
                          aria-label={`page ${page}`}
                          className="w-3 h-3 sm:w-4 sm:h-4"
                        >
                          <button
                            className={`w-full h-full bg-default-300 rounded-full ${
                              activePage === page && "bg-primary"
                            }`}
                            onClick={() => setPage(page)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Button
                  className="text-xs sm:text-sm"
                  color="primary"
                  size="sm"
                  onPress={onClose}
                >
                  Entendido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

### src/pages/KataPage.tsx
`	sx
import { useEffect, useCallback, useState } from "react";
import { Button, Image, Input, Select, SelectItem } from "@heroui/react";
import { read } from "xlsx";

import { AgregarCompetidor } from "./KataComponents/AgregarCompetidor";
import ResultadosFinales from "./KataComponents/ResultadosFinales";

import Logo from "@/assets/images/kenshukan-logo.png";
import { CommonInput } from "@/components/CommonInput";
import { MenuComponent } from "@/components/MenuComponent";
import { showToast } from "@/utils/toast";
import { JudgeScoreInputs } from "@/components/JudgeScoreInputs";
import { CompetitorTable } from "@/components/CompetitorTable";
import { AreaSelector } from "@/components/AreaSelector";
import { AnimatedPage } from "@/components/AnimatedPage";
import { KataProvider, useKata, Competidor } from "@/context/KataContext";

// Interface for new competitor dialog
interface NuevoCompetidor {
  Nombre: string;
  Edad: number;
  Categoria: string;
}

function KataPageContent() {
  const {
    state,
    dispatch,
    updateJudge,
    clearJudge,
    calculateScore,
    clearAllScores,
    saveScore,
    handleKiken,
    resetAll,
  } = useKata();

  const {
    competidores,
    judges,
    numJudges,
    lowScore,
    highScore,
    score,
    base,
    categoria,
    tituloCategoria,
    area,
    areaSeleccionada,
    showResults,
    showAgregarDialog,
    submitted,
  } = state;

  // Local UI state (not persisted/shared)
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar los handlers
  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (submitted) {
        dispatch({ type: "SET_SUBMITTED", payload: false });
      }
      const value = e.target.value;

      // Validar formato: solo números, punto y máximo un punto
      const formatoValido = /^\d*\.?\d*$/.test(value);

      if (!formatoValido) {
        return;
      }

      // Agregar automáticamente el punto después del primer número
      let processedValue = value;

      if (value.length === 1 && /^\d$/.test(value)) {
        processedValue = value + ".";
      }

      // Si hay un valor, validar el rango según la media
      if (processedValue && processedValue !== ".") {
        const puntaje = parseFloat(processedValue);

        // Definir rangos según la media
        let minPuntaje: number;
        let maxPuntaje: number;

        switch (base) {
          case 6:
            minPuntaje = 5;
            maxPuntaje = 7;
            break;
          case 7:
            minPuntaje = 6;
            maxPuntaje = 8;
            break;
          case 8:
            minPuntaje = 7;
            maxPuntaje = 9;
            break;
          default:
            minPuntaje = 5;
            maxPuntaje = 7;
        }

        // Validar que el puntaje esté dentro del rango
        if (puntaje < minPuntaje || puntaje > maxPuntaje) {
          return;
        }
      }

      updateJudge(index, processedValue);
    },
    [judges, base, submitted, dispatch, updateJudge],
  );

  const handleClear = (index: number) => {
    if (submitted) {
      dispatch({ type: "SET_SUBMITTED", payload: false });
    }
    clearJudge(index);
  };

  const handleBlur = (index: number) => {
    const currentValue = judges[index];

    // Si el valor termina en punto, agregar "0"
    if (currentValue && currentValue.endsWith(".")) {
      updateJudge(index, currentValue + "0");
    }
  };

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        saveScore();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveScore]);

  const agregarCompetidor = () => {
    dispatch({ type: "SET_SHOW_AGREGAR_DIALOG", payload: true });
  };

  const handleAgregarSubmit = (nuevoCompetidor: NuevoCompetidor) => {
    if (
      !nuevoCompetidor.Nombre ||
      !nuevoCompetidor.Edad ||
      !nuevoCompetidor.Categoria
    ) {
      showToast.error("Por favor complete todos los campos");

      return;
    }

    const competidor: Competidor = {
      id: Date.now(),
      ...nuevoCompetidor,
      TituloCategoria: nuevoCompetidor.Categoria,
      PuntajeFinal: null,
      PuntajesJueces: [null, null, null, null, null],
      Kiken: false,
    };

    dispatch({ type: "ADD_COMPETIDOR", payload: competidor });
    dispatch({ type: "SET_SHOW_AGREGAR_DIALOG", payload: false });
  };

  const handleOpenKataDisplay = () => {
    const nuevaVentana = window.open(
      "/kata-display",
      "_blank",
      "width=1280,height=800",
    );

    const competidorActual = competidores.find(
      (comp: Competidor) => !comp.PuntajeFinal && !comp.Kiken,
    );

    const dataParaEnviar = {
      competidor: competidorActual?.Nombre || "",
      categoria: categoria || "",
      puntajes: judges.map((judge: string) => judge || ""),
      puntajeFinal: score || "",
      puntajeMenor: lowScore || "",
      puntajeMayor: highScore || "",
      competidores: competidores,
    };

    // Enviar datos inmediatamente cuando se abra la ventana
    const interval = setInterval(() => {
      if (nuevaVentana?.document?.readyState === "complete") {
        nuevaVentana.dispatchEvent(
          new CustomEvent("update-kata", { detail: dataParaEnviar }),
        );
        clearInterval(interval);
      }
    }, 100);

    // También enviar a la ventana actual por si acaso
    setTimeout(() => {
      nuevaVentana?.dispatchEvent(
        new CustomEvent("update-kata", { detail: dataParaEnviar }),
      );
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        // Simular carga para mostrar skeleton
        setTimeout(() => {
          const data = e.target?.result;

          if (data) {
            const workbook = read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const categoriaCell = worksheet["B1"];

            if (categoriaCell) {
              dispatch({ type: "SET_CATEGORIA", payload: categoriaCell.v });
              dispatch({
                type: "SET_TITULO_CATEGORIA",
                payload: categoriaCell.v,
              });
            }

            const competidoresData: Competidor[] = [];
            let row = 3;

            while (worksheet[`A${row}`]) {
              competidoresData.push({
                id: Date.now() + row,
                Nombre: worksheet[`A${row}`]?.v || "",
                Edad: worksheet[`B${row}`]?.v || "",
                Categoria: worksheet[`C${row}`]?.v || "",
                TituloCategoria: categoriaCell?.v || "",
                PuntajeFinal: null,
                PuntajesJueces: [null, null, null, null, null],
                Kiken: false,
              });
              row++;
            }

            if (competidoresData.length > 0) {
              dispatch({ type: "SET_COMPETIDORES", payload: competidoresData });
            }
          }
          setIsLoading(false);
        }, 500);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleAreaChange = (e: any) => {
    dispatch({ type: "SET_AREA", payload: e.target.value });
    dispatch({ type: "SET_AREA_SELECCIONADA", payload: true });
  };

  return (
    <AnimatedPage className="w-full min-h-screen justify-around flex flex-col px-2 sm:px-4 md:px-6 lg:px-10 py-2 bg-gradient-to-b from-blue-500/30 to-blue-800/90">
      <div className="w-full flex flex-col lg:flex-row justify-between gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-[10%] lg:h-[10%] self-center lg:self-start">
          <Image
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
            src={Logo}
          />
        </div>
        <div className="w-full flex flex-row lg:flex-row justify-center gap-4 lg:gap-16 self-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            <h3 className="font-semibold self-center text-lg sm:text-xl lg:text-2xl">
              Categoría:
            </h3>
            <CommonInput isReadOnly label="Categoria" value={categoria} />
            <input
              accept=".xlsx,.xls"
              className="hidden"
              id="excel-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <Button
              aria-label="Cargar archivo Excel con competidores"
              className="bg-green-700 text-white self-center text-sm sm:text-base"
              isDisabled={!areaSeleccionada || isLoading}
              isLoading={isLoading}
              onPress={() => document?.getElementById("excel-upload")?.click()}
            >
              {isLoading ? "Cargando..." : "Cargar Excel"}
            </Button>
          </div>
          <div className="w-1/6 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <h2 className="text-black dark:text-white font-semibold text-xl sm:text-2xl lg:text-3xl">
              Area:
            </h2>
            <AreaSelector
              disabled={areaSeleccionada}
              value={area}
              onChange={handleAreaChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 self-center">
            <MenuComponent handleOpenKataDisplay={handleOpenKataDisplay} />
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col lg:flex-row justify-center gap-4 lg:gap-6">
        <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-2 justify-center">
          <h3 className="font-semibold text-lg sm:text-xl pt-2 sm:pt-5 text-center sm:text-left">
            COMPETIDORES:
          </h3>
          <CompetitorTable competidores={competidores} isLoading={isLoading} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 pl-1 uppercase">
            PUNTUACION MEDIA:
          </span>
          <Select
            className="col-span-2 h-7"
            placeholder="Seleccione"
            selectedKeys={[base.toString()]}
            onChange={(e) => {
              dispatch({ type: "SET_BASE", payload: parseInt(e.target.value) });
            }}
          >
            <SelectItem key={6}>6</SelectItem>
            <SelectItem key={7}>7</SelectItem>
            <SelectItem key={8}>8</SelectItem>
          </Select>
          <div className="col-span-2 text-xs text-gray-600 dark:text-white text-center">
            {base === 6 && "Rango permitido: 5.0 - 7.0"}
            {base === 7 && "Rango permitido: 6.0 - 8.0"}
            {base === 8 && "Rango permitido: 7.0 - 9.0"}
          </div>
          <Button
            aria-label="Seleccionar 3 jueces"
            className="text-xs sm:text-sm"
            size="md"
            onPress={() => {
              dispatch({ type: "SET_NUM_JUDGES", payload: 3 });
            }}
          >
            3 Jueces
          </Button>
          <Button
            aria-label="Seleccionar 5 jueces"
            className="text-xs sm:text-sm"
            size="md"
            onPress={() => {
              dispatch({ type: "SET_NUM_JUDGES", payload: 5 });
            }}
          >
            5 Jueces
          </Button>
          <Button
            aria-label="Agregar nuevo competidor manualmente"
            className="bg-green-500 text-white font-semibold hover:bg-green-400 rounded-md col-span-2 text-xs sm:text-sm"
            size="sm"
            onPress={agregarCompetidor}
          >
            + Agregar competidor
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4 sm:pt-8">
        <JudgeScoreInputs
          judges={judges}
          numJudges={numJudges}
          submitted={submitted}
          onJudgeBlur={handleBlur}
          onJudgeChange={handleChange}
          onJudgeClear={handleClear}
        />
        <div className="flex flex-row lg:flex-col gap-2 lg:gap-4 justify-center">
          <Button
            aria-label="Calcular puntaje final"
            className="bg-gray-500 text-white font-semibold hover:bg-gray-400 rounded-md text-xs sm:text-sm"
            size="sm"
            tabIndex={judges.length + 1}
            onPress={calculateScore}
          >
            Calcular
          </Button>
          <Button
            aria-label="Marcar competidor como Kiken (Abandono)"
            className="bg-red-500 text-white font-semibold hover:bg-red-400 text-xs sm:text-sm"
            size="sm"
            tabIndex={judges.length + 2}
            onPress={handleKiken}
          >
            Kiken
          </Button>
        </div>
      </div>

      <div
        className={`flex flex-col lg:flex-row ${judges.length === 5 ? "justify-between" : "justify-end"} gap-4`}
      >
        {judges.length !== 3 && (
          <div className="w-3/4 lg:w-auto flex flex-col gap-1">
            <span className="text-lg font-semibold pl-1">Menor puntaje:</span>
            <Input
              className="w-3/4"
              classNames={{
                input: "text-4xl lg:text-6xl font-bold text-center",
                inputWrapper: "h-16 lg:h-24",
              }}
              labelPlacement="outside"
              placeholder="0.0"
              size="lg"
              value={lowScore}
            />
          </div>
        )}
        {judges.length !== 3 && (
          <div className="w-3/4 lg:w-auto flex flex-col gap-1">
            <span className="text-lg font-semibold pl-1">Mayor puntaje:</span>
            <Input
              className="w-3/4"
              classNames={{
                input: "text-4xl lg:text-6xl font-bold text-center",
                inputWrapper: "h-16 lg:h-24",
              }}
              labelPlacement="outside"
              placeholder="0.0"
              size="lg"
              value={highScore}
            />
          </div>
        )}
        <div className="w-3/4 lg:w-auto flex flex-col gap-1">
          <span className="text-lg font-semibold pl-1">Puntaje Final:</span>
          <Input
            className="w-3/4"
            classNames={{
              input: "text-4xl lg:text-6xl font-bold text-center",
              inputWrapper: "h-16 lg:h-24",
            }}
            labelPlacement="outside"
            placeholder="Total"
            size="lg"
            value={score}
          />
        </div>
        <div className="w-1/4 grid grid-cols-2 gap-3 lg:gap-4">
          <Button
            aria-label="Limpiar todos los campos"
            size="sm"
            onPress={clearAllScores}
          >
            Limpiar
          </Button>
          <Button
            aria-label="Guardar puntaje del competidor actual (Ctrl + Enter)"
            className="bg-blue-500 text-white font-semibold hover:bg-blue-400 text-xs sm:text-sm"
            isDisabled={isLoading}
            isLoading={isLoading}
            size="sm"
            title="Ctrl + Enter"
            onPress={saveScore}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            aria-label="Reiniciar toda la competencia"
            className="w-full col-span-2 text-xs sm:text-sm"
            size="sm"
            onPress={resetAll}
          >
            Reiniciar Todo
          </Button>
        </div>
      </div>
      <ResultadosFinales
        competidores={competidores}
        judges={judges}
        showDialog={showResults}
        tituloCategoria={tituloCategoria}
        onClose={() => dispatch({ type: "SET_SHOW_RESULTS", payload: false })}
      />
      <AgregarCompetidor
        showDialog={showAgregarDialog}
        onClose={() =>
          dispatch({ type: "SET_SHOW_AGREGAR_DIALOG", payload: false })
        }
        onSubmit={handleAgregarSubmit}
      />
    </AnimatedPage>
  );
}

export default function KataPage() {
  return (
    <KataProvider>
      <KataPageContent />
    </KataProvider>
  );
}

### src/pages/KumitePage.tsx
`	sx
import { useRef, useEffect, useState } from "react";
import { Button, Image } from "@heroui/react";
import { MdLockReset, MdUndo } from "react-icons/md";

import { PanelCard } from "./KumiteComponents/PanelCard";
import ModalLlaves from "./KumiteComponents/ModalLlaves";
import { Ganador } from "./KumiteComponents/Ganador";
import { Temporizador } from "./KumiteComponents/Temporizador";

import { MenuComponent } from "@/components/MenuComponent";
import { CommonInput } from "@/components/CommonInput";
import { AreaSelector } from "@/components/AreaSelector";
import { ExcelUploader } from "@/components/ExcelUploader";
import { TimerControls } from "@/components/TimerControls";
import { AnimatedPage } from "@/components/AnimatedPage";
import { ConfigModal } from "@/components/ConfigModal";
import { HistoryLog } from "@/components/HistoryLog";

import Logo from "@/assets/images/kenshukan-logo.png";
import Bell from "@/assets/bell.wav";
import Bell3 from "@/assets/bell3.wav";
import ShiroBelt from "@/assets/images/shiroStill.gif";
import AkaBelt from "@/assets/images/akaStill.gif";
import { useBreakpoint } from "@/config/useBreakpoint";
import { KumiteProvider, useKumite } from "@/context/KumiteContext";

function KumitePageContent() {
  const {
    state,
    dispatch,
    startTimer,
    stopTimer,
    resetTimer,
    selectTime,
    handleFileUpload,
    updateScore,
    setWinner,
    nextMatch,
    resetAll,
    setArea,
    closeWinnerModal,
    broadcastData,
    undoLastAction,
  } = useKumite();

  const { timer, scores, match, bracket } = state;

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFinalRef = useRef<HTMLAudioElement>(null);

  // Local UI state for resetKey if needed, but we try to rely on timer state
  const [resetKey, setResetKey] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const breakpoints = useBreakpoint();
  const isSm =
    breakpoints === "sm" || breakpoints === "md" || breakpoints === "lg";
  const isLgUp = ["xl", "2xl"].includes(breakpoints);

  // Sync resetKey when timer is reset (optional, but helps if Temporizador needs it)
  useEffect(() => {
    if (
      !timer.temporizadorIniciado &&
      timer.tiempoRestante === timer.selectedTime
    ) {
      setResetKey((prev) => prev + 1);
    }
  }, [timer.temporizadorIniciado, timer.tiempoRestante, timer.selectedTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !match.ganador) {
        if (timer.temporizadorIniciado) {
          stopTimer();
        } else if (timer.tiempoRestante > 0) {
          startTimer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    timer.temporizadorIniciado,
    timer.tiempoRestante,
    match.ganador,
    startTimer,
    stopTimer,
  ]);

  const sonarCampana = () => {
    audioRef.current?.play();
  };

  const sonarCampanaFinal = () => {
    audioFinalRef.current?.play();
  };

  const handleTimeEnd = (type: "30sec" | "end") => {
    if (type === "30sec") {
      sonarCampana();
    } else if (type === "end") {
      stopTimer();
      sonarCampanaFinal();
    }
  };

  const onTimeUpdate = (time: number) => {
    // Update context with current time so broadcast works
    dispatch({ type: "SET_TIMER", payload: { tiempoRestante: time } });
  };

  const handleOpenKumiteDisplay = () => {
    window.open("/kumite-display", "_blank", "width=1280,height=800");
    setTimeout(() => {
      broadcastData();
    }, 1000);
  };

  return (
    <AnimatedPage className="w-full min-h-screen flex flex-col px-2 sm:px-4 md:px-6 lg:px-10 py-2 bg-gradient-to-b from-blue-500/30 to-blue-800/90">
      {/* Header Section */}
      <div className="w-full flex flex-col lg:flex-row justify-between gap-4 mb-4">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-[10%] lg:h-[10%] ${isSm ? "mx-auto lg:mx-0" : ""}`}
        >
          <Image
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
            src={Logo}
          />
        </div>

        <div className="w-full flex flex-row lg:flex-row justify-center gap-4 lg:gap-16 self-center">
          <div className="flex flex-row sm:flex-row gap-2 sm:gap-4 justify-center items-center">
            <h3 className="font-semibold self-center text-lg sm:text-xl lg:text-2xl">
              Categoría:
            </h3>
            <CommonInput isReadOnly label="Categoria" value={match.categoria} />
            <ExcelUploader
              disabled={!match.areaSeleccionada}
              onUpload={(e) => {
                const file = e.target.files?.[0];

                if (file) handleFileUpload(file);
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
            <h2 className="text-black dark:text-white font-semibold text-xl sm:text-2xl lg:text-3xl">
              Area:
            </h2>
            <AreaSelector
              disabled={match.areaSeleccionada}
              value={match.area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 justify-center">
            <ModalLlaves bracket={bracket} />
          </div>
          <div className="grid grid-cols-2 gap-2 self-center">
            <MenuComponent
              handleOpenConfig={() => setIsConfigOpen(true)}
              handleOpenKumiteDisplay={handleOpenKumiteDisplay}
              onExportExcel={() =>
                import("@/utils/exportUtils").then((m) =>
                  m.exportResultsToExcel(bracket),
                )
              }
              onExportPDF={() =>
                import("@/utils/exportUtils").then(m =>
                  m.exportResultsToPDF(bracket, match.categoria)
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`w-full flex ${isSm ? "flex-col" : "py-20 flex flex-col xl:flex-row"} overflow-hidden justify-between items-start gap-4 flex-1`}
      >
        {/* ... (rest of content) ... */}
        {/* (Bottom of function) */}
        <Ganador
          ganador={match.ganador}
          isOpen={match.showGanador}
          nombreGanador={match.ganadorNombre}
          onClose={closeWinnerModal}
        />
        <ConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
        />
        <div className="w-full xl:flex-1 order-2 xl:order-1">
          <PanelCard
            atenai={scores.aka.atenai}
            atenaiChui={scores.aka.atenaiChui}
            atenaiHansoku={scores.aka.atenaiHansoku}
            cinto="aka"
            disabled={match.ganador !== null}
            imagen={AkaBelt}
            ippon={scores.aka.ippon}
            kiken={scores.aka.kiken}
            kinshi={scores.aka.kinshi}
            kinshiChui={scores.aka.kinshiChui}
            kinshiHansoku={scores.aka.kinshiHansoku}
            kinshiNi={scores.aka.kinshiNi}
            nombre={scores.aka.nombre}
            shikaku={scores.aka.shikaku}
            wazari={scores.aka.wazari}
            // Penalties
            // Handlers
            onAtenai={() => updateScore("aka", "atenai")}
            onAtenaiChui={() => updateScore("aka", "atenaiChui")}
            onAtenaiHansoku={() => updateScore("aka", "atenaiHansoku")} // Handled in context logic to trigger winner
            onHantei={() => setWinner("aka")} // Hantei = manual winner selection
            onIppon={() => updateScore("aka", "ippon")}
            onKiken={() => updateScore("aka", "kiken")}
            onKinshi={() => updateScore("aka", "kinshi")}
            onKinshiChui={() => updateScore("aka", "kinshiChui")}
            onKinshiHansoku={() => updateScore("aka", "kinshiHansoku")}
            onKinshiNi={() => updateScore("aka", "kinshiNi")}
            onShikaku={() => updateScore("aka", "shikaku")}
            onWazari={() => updateScore("aka", "wazari")}
          />
        </div>
        {/* Timer Section (Reordered based on breakpoint for visual consistency with original) */}
        <div
          className={`w-full ${isSm ? "flex flex-col order-1" : "xl:w-[20%] flex flex-col order-1 xl:order-2"} justify-center items-center gap-2 min-h-[200px] sm:min-h-[250px] xl:min-h-[400px]`}
        >
          {isLgUp && (
            <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
              {[180, 120, 60].map((t) => (
                <Button
                  key={t}
                  className="text-xs lg:text-sm"
                  isDisabled={
                    match.ganador !== null || timer.temporizadorIniciado
                  }
                  size="sm"
                  onPress={() => selectTime(t)}
                >
                  {t === 180 ? "3:00" : t === 120 ? "2:00" : "1:00"}
                </Button>
              ))}
            </div>
          )}
          {!isLgUp && (
            <TimerControls
              hasWinner={match.ganador !== null}
              isRunning={timer.temporizadorIniciado}
              selectedTime={timer.selectedTime}
              onReset={resetTimer}
              onSelectTime={selectTime}
              onStart={startTimer}
              onStop={stopTimer}
            />
          )}

          <Temporizador
            initialTime={timer.tiempoRestante}
            isRunning={timer.temporizadorIniciado}
            resetKey={resetKey}
            onTimeEnd={handleTimeEnd}
            onTimeUpdate={onTimeUpdate}
          />

          {isLgUp && (
            <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
              <Button
                className="text-xs lg:text-sm"
                isDisabled={
                  match.ganador !== null ||
                  timer.temporizadorIniciado ||
                  timer.selectedTime === 0
                }
                size="sm"
                onPress={startTimer}
              >
                {timer.temporizadorIniciado ? "Reanudar" : "Iniciar"}
              </Button>
              <Button
                className="text-xs lg:text-sm"
                isDisabled={
                  match.ganador !== null || !timer.temporizadorIniciado
                }
                size="sm"
                onPress={stopTimer}
              >
                Detener
              </Button>
              <Button
                className="text-xs lg:text-sm"
                isDisabled={
                  match.ganador !== null ||
                  timer.temporizadorIniciado ||
                  timer.selectedTime === 0
                }
                size="sm"
                onPress={resetTimer}
              >
                Reiniciar
              </Button>
            </div>
          )}

          {match.ganador && (
            <Button
              className="text-xs sm:text-sm"
              color="success"
              size="sm"
              onPress={nextMatch}
            >
              Siguiente Combate
            </Button>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
              <Button
                className="text-xs"
                isDisabled={match.ganador !== null}
                size="sm"
                variant="light"
                onPress={sonarCampana}
              >
                Campana 30 seg
              </Button>
              <Button
                aria-label="Reiniciar Todo"
                size="sm"
                variant="light"
                onPress={resetAll}
              >
                <MdLockReset className="text-lg sm:text-xl lg:text-2xl" />
              </Button>
              <Button
                className="text-xs"
                isDisabled={match.ganador !== null}
                size="sm"
                variant="light"
                onPress={sonarCampanaFinal}
              >
                Campana fin del tiempo
              </Button>
            </div>
            <div className="flex gap-2 justify-center w-full">
              <Button
                color="warning"
                isDisabled={state.history.length === 0}
                size="sm"
                startContent={<MdUndo className="text-xl" />}
                variant="flat"
                onPress={undoLastAction}
              >
                Deshacer
              </Button>
            </div>
            <div className="w-full mt-2 h-40">
              <HistoryLog />
            </div>
            <audio ref={audioRef}>
              <source src={Bell} type="audio/wav" />
              <track kind="captions" label="Español" src="" />
            </audio>
            <audio ref={audioFinalRef}>
              <source src={Bell3} type="audio/wav" />
              <track kind="captions" label="Español" src="" />
            </audio>
          </div>
        </div>
        <div className="w-full xl:flex-1 order-3 xl:order-3">
          <PanelCard
            atenai={scores.shiro.atenai}
            atenaiChui={scores.shiro.atenaiChui}
            atenaiHansoku={scores.shiro.atenaiHansoku}
            cinto="shiro"
            disabled={match.ganador !== null}
            imagen={ShiroBelt}
            ippon={scores.shiro.ippon}
            kiken={scores.shiro.kiken}
            kinshi={scores.shiro.kinshi}
            kinshiChui={scores.shiro.kinshiChui}
            kinshiHansoku={scores.shiro.kinshiHansoku}
            kinshiNi={scores.shiro.kinshiNi}
            nombre={scores.shiro.nombre}
            shikaku={scores.shiro.shikaku}
            wazari={scores.shiro.wazari}
            // Penalties
            // Handlers
            onAtenai={() => updateScore("shiro", "atenai")}
            onAtenaiChui={() => updateScore("shiro", "atenaiChui")}
            onAtenaiHansoku={() => updateScore("shiro", "atenaiHansoku")}
            onHantei={() => setWinner("shiro")}
            onIppon={() => updateScore("shiro", "ippon")}
            onKiken={() => updateScore("shiro", "kiken")}
            onKinshi={() => updateScore("shiro", "kinshi")}
            onKinshiChui={() => updateScore("shiro", "kinshiChui")}
            onKinshiHansoku={() => updateScore("shiro", "kinshiHansoku")}
            onKinshiNi={() => updateScore("shiro", "kinshiNi")}
            onShikaku={() => updateScore("shiro", "shikaku")}
            onWazari={() => updateScore("shiro", "wazari")}
          />
        </div>
      </div>

      <Ganador
        ganador={match.ganador}
        isOpen={match.showGanador}
        nombreGanador={match.ganadorNombre}
        onClose={closeWinnerModal}
      />
    </AnimatedPage>
  );
}

export default function KumitePage() {
  return (
    <KumiteProvider>
      <KumitePageContent />
    </KumiteProvider>
  );
}

## 11. Source Code - Components & Sub-pages

### src/pages/KataComponents/VentanaKata.tsx
```tsx
import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Image,
} from "@heroui/react";

import Logo from "@/assets/images/kenshukan-logo.png";

interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria: string;
  PuntajeFinal: number | null;
  Kiken?: boolean;
}

const KataDisplay = () => {
  const [data, setData] = useState<{
    competidor: string;
    categoria: string;
    puntajes: (string | number)[];
    puntajeFinal: string | number;
    puntajeMenor: string | number;
    puntajeMayor: string | number;
    competidores: Competidor[];
  }>({
    competidor: "",
    categoria: "",
    puntajes: Array(5).fill(""),
    puntajeFinal: "",
    puntajeMenor: "",
    puntajeMayor: "",
    competidores: [],
  });

  // Escuchar mensajes del canal usando BroadcastChannel API
  useEffect(() => {
    const kataChannel = new BroadcastChannel("kata-channel");

    kataChannel.onmessage = (event) => {
      if (event.data) {
        setData(event.data);
      }
    };

    return () => {
      kataChannel.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-500/40 to-blue-800/90 gap-4 p-4">
      <div className="w-[15%] h-[15%]">
        <Image
          alt="Logo"
          className="w-full h-full object-cover rounded-full"
          src={Logo}
        />
      </div>
      {!data?.competidor && !data?.categoria ? (
        <Card className="w-1/2 h-1/2 shadow-lg">
          <CardBody className="flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4 text-gray-600">
                Esperando datos...
              </h1>
              <p className="text-lg text-gray-500">
                La ventana se actualizará automáticamente cuando haya datos
                disponibles
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex w-full items-center justify-center h-screen gap-4">
          <Card className="w-1/2 h-1/2 shadow-lg">
            <CardBody className="flex flex-col justify-around text-2xl">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold mb-2">
                  Categoria: {data?.categoria || "Sin categoría"}
                </h1>
                <p className="text-2xl font-semibold">
                  {data?.competidor || "Sin competidor"}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {data?.puntajes?.map((puntaje, index) => (
                  <div key={index} className="text-center">
                    <p className="text-lg font-semibold">JUEZ {index + 1}</p>
                    <p className="text-3xl font-bold">{puntaje || "-"}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-around w-full">
                <div className="text-center">
                  <p className="text-lg font-semibold">MENOR</p>
                  <p className="text-3xl font-bold">
                    {data?.puntajeMenor || "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">MAYOR</p>
                  <p className="text-3xl font-bold">
                    {data?.puntajeMayor || "-"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">FINAL</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {data?.puntajeFinal || "-"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="w-1/3 min-h-1/2 shadow-lg">
            <CardBody>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableColumn>NOMBRE</TableColumn>
                    <TableColumn>EDAD</TableColumn>
                    <TableColumn>KYU/DAN</TableColumn>
                    <TableColumn>PUNTAJE FINAL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {data?.competidores?.map((competidor) => (
                      <TableRow
                        key={competidor.id}
                        className={
                          competidor.PuntajeFinal !== null ? "bg-blue-100" : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {competidor.Nombre}
                        </TableCell>
                        <TableCell>{competidor.Edad}</TableCell>
                        <TableCell>{competidor.Categoria}</TableCell>
                        <TableCell>
                          {competidor.Kiken ? (
                            <p className="text-red-600 font-bold">KIKEN</p>
                          ) : competidor.PuntajeFinal ? (
                            (
                              Math.round(competidor.PuntajeFinal * 10) / 10
                            ).toFixed(1)
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KataDisplay;
```

### src/pages/KataComponents/AgregarCompetidor.tsx
```tsx
import { useState, FC, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  NumberInput,
} from "@heroui/react";

interface ModalProps {
  showDialog: boolean;
  onClose: () => void;
  onSubmit: (competidor: {
    Nombre: string;
    Edad: number;
    Categoria: string;
  }) => void;
}

export const AgregarCompetidor: FC<ModalProps> = ({
  showDialog,
  onClose,
  onSubmit,
}) => {
  const [ordinal, setOrdinal] = useState("");
  const [categoriaTipo, setCategoriaTipo] = useState("");
  const [competidor, setCompetidor] = useState({
    Nombre: "",
    Edad: 0,
    Categoria: "",
  });

  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  useEffect(() => {
    setCompetidor((c) => ({ ...c, Categoria: `${ordinal} ${categoriaTipo}` }));
  }, [ordinal, categoriaTipo]);

  const handleSubmit = () => {
    if (
      competidor.Nombre === "" ||
      competidor.Edad === 0 ||
      competidor.Categoria === ""
    ) {
      return;
    }
    onSubmit(competidor);
    setCompetidor({ Nombre: "", Edad: 0, Categoria: "" });
    setOrdinal("");
    setCategoriaTipo("");
  };

  return (
    <Modal className="absolute z-[999]" isOpen={showDialog} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Agregar Nuevo Competidor</ModalHeader>
        <ModalBody>
          <Input
            isRequired
            errorMessage="Ingresa un nombre valido"
            label="Nombre:"
            labelPlacement="outside"
            name="nombre"
            placeholder="Nombre del competidor"
            validate={(value) => {
              if (!regex.test(value)) {
                return "Ingresa un nombre valido";
              }
            }}
            value={competidor.Nombre}
            onChange={(e) =>
              setCompetidor({ ...competidor, Nombre: e.target.value })
            }
          />
          <div className="w-full flex gap-2">
            <NumberInput
              isRequired
              label="Edad:"
              labelPlacement="outside"
              maxValue={100}
              minValue={0}
              placeholder="Edad"
              onChange={(e) => {
                setCompetidor({ ...competidor, Edad: Number(e) });
              }}
            />

            <Input
              isReadOnly
              isRequired
              className="w-48"
              endContent={
                <div className="flex items-center">
                  <label className="sr-only" htmlFor="currency">
                    Currency
                  </label>
                  <select
                    aria-label="Select currency"
                    className="outline-none border-0 bg-transparent text-zinc-700 text-small"
                    defaultValue="KYU"
                    id="currency"
                    name="currency"
                    onChange={(e) => {
                      setCategoriaTipo(e.target.value);
                    }}
                  >
                    <option aria-label="KYU" value="KYU">
                      KYU
                    </option>
                    <option aria-label="DAN" value="DAN">
                      DAN
                    </option>
                  </select>
                </div>
              }
              label="Categoria:"
              labelPlacement="outside"
              startContent={
                <div className="flex items-center">
                  <label className="sr-only" htmlFor="currency">
                    Currency
                  </label>
                  <select
                    aria-label="Select currency"
                    className="outline-none border-0 bg-transparent zinc-700 text-small"
                    defaultValue="KYU"
                    id="currency"
                    name="currency"
                    onChange={(e) => {
                      setOrdinal(e.target.value);
                    }}
                  >
                    <option aria-label="1er" value="1er">
                      1er
                    </option>
                    <option aria-label="2do" value="2do">
                      2do
                    </option>
                    <option aria-label="3er" value="3er">
                      3er
                    </option>
                    <option aria-label="4to" value="4to">
                      4to
                    </option>
                    <option aria-label="5to" value="5to">
                      5to
                    </option>
                    <option aria-label="6to" value="6to">
                      6to
                    </option>
                    <option aria-label="7mo" value="7mo">
                      7mo
                    </option>
                    <option aria-label="8vo" value="8vo">
                      8vo
                    </option>
                    <option aria-label="9no" value="9no">
                      9no
                    </option>
                    <option aria-label="10mo" value="10mo">
                      10mo
                    </option>
                  </select>
                </div>
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-red-500 text-white font-semibold hover:bg-red-400"
            onPress={() => {
              onClose();
              setCompetidor({ Nombre: "", Edad: 0, Categoria: "" });
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-white-500 text-zinc-800 font-semibold hover:bg-gray-400"
            type="submit"
            onPress={() => handleSubmit()}
          >
            Agregar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

### src/pages/KataComponents/ResultadosFinales.tsx
```tsx
import { FC } from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { MdCircle } from "react-icons/md";

interface ResultadosFinalesProps {
  showDialog: boolean;
  onClose: () => void;
  competidores: any[];
  tituloCategoria: string;
  judges: any[];
}

export const ResultadosFinales: FC<ResultadosFinalesProps> = ({
  showDialog,
  onClose,
  competidores,
  tituloCategoria,
  judges,
}) => {
  // Función para obtener los puntajes válidos (sin el mayor y menor)
  const getPuntajesValidos = (puntajes: (string | null)[]) => {
    if (!Array.isArray(puntajes)) return "No disponible";

    // Ordenar todos los puntajes
    const puntajesOrdenados = [...puntajes]
      .map((p) => parseFloat(p || "0"))
      .sort((a, b) => a - b);

    // Obtener solo los 3 puntajes del medio (eliminando el mayor y menor de los 5)
    let puntajesValidos;

    if (judges.length === 5) {
      puntajesValidos = puntajesOrdenados.slice(1, -1);
    } else {
      puntajesValidos = puntajesOrdenados;
    }

    return (
      <div className="flex gap-2">
        <p className="text-blue-600">{puntajesValidos[0]}</p>
        <p>{" - "}</p>
        <p>{puntajesValidos[1]}</p>
        <p>{" - "}</p>
        <p className="text-green-600">{puntajesValidos[2]}</p>
      </div>
    );
  };

  // Ordenar competidores: primero por Kiken (no Kiken primero) y luego por puntaje
  const competidoresOrdenados = [...competidores].sort((a, b) => {
    if (a.Kiken && !b.Kiken) return 1;
    if (!a.Kiken && b.Kiken) return -1;
    if (a.Kiken && b.Kiken) return 0;

    return (b.PuntajeFinal || 0) - (a.PuntajeFinal || 0);
  });

  return (
    <Modal isOpen={showDialog} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Resultados Finales - {tituloCategoria}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col  gap-4">
            {competidoresOrdenados.map((competidor, index) => {
              const medalla =
                !competidor.Kiken &&
                (index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : "👏");

              return (
                <div
                  key={competidor.id}
                  className="w-full flex justify-between gap-4 border-b-2 border-gray-200 pb-4"
                >
                  <div className="w-full flex justify-between gap-4">
                    <div className="flex font-semibold justify-between gap-4">
                      <p>{medalla || "❌"}</p>
                      <div className="flex gap-4">
                        <p>{competidor.Nombre}</p>
                        <p>{competidor.Categoria}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 font-bold">
                      {competidor.Kiken ? (
                        <p className="text-red-600">KIKEN</p>
                      ) : (
                        <div className="flex gap-16">
                          <p>
                            {typeof competidor.PuntajeFinal === "number"
                              ? competidor.PuntajeFinal.toFixed(1)
                              : "-"}
                          </p>
                          <p>
                            Puntajes:{" "}
                            {getPuntajesValidos(competidor.PuntajesJueces)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex justify-between">
            <div className="flex gap-4">
              <div className="flex gap-1 self-center">
                <MdCircle className="self-center" color="blue" />{" "}
                <p>Puntaje Menor</p>
              </div>
              <div className="flex gap-1 self-center">
                <MdCircle className="self-center" color="green" />{" "}
                <p>Puntaje Mayor</p>
              </div>
              <div className="flex gap-1 self-center">
                <MdCircle className="self-center" color="red" />{" "}
                <p>Eliminado</p>
              </div>
            </div>
            <Button
              className="font-semibold text-zinc-700"
              variant="light"
              onPress={onClose}
            >
              Cerrar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResultadosFinales;
```

### src/pages/KumiteComponents/VentanaKumite.tsx
```tsx
import { useState, useEffect } from "react";
import { Image } from "@heroui/react";

import { Match } from "@/types";
import AkaBelt from "@/assets/images/akaStill.gif";
import ShiroBelt from "@/assets/images/shiroStill.gif";

const kumiteChannel = new BroadcastChannel("kumite-channel");

const OptimizedImage = ({ src, alt, width, height }: any) => {
  return (
    <Image
      alt={alt}
      className="justify-start"
      height={height}
      src={src}
      width={width}
    />
  );
};

interface KumiteData {
  scores: {
    aka: {
      wazari: number;
      ippon: number;
      nombre: string;
      kinshi: boolean;
      kinshiNi: boolean;
      kinshiChui: boolean;
      kinshiHansoku: boolean;
      atenai: boolean;
      atenaiChui: boolean;
      atenaiHansoku: boolean;
      shikaku: boolean;
      kiken: boolean;
    };
    shiro: {
      wazari: number;
      ippon: number;
      nombre: string;
      kinshi: boolean;
      kinshiNi: boolean;
      kinshiChui: boolean;
      kinshiHansoku: boolean;
      atenai: boolean;
      atenaiChui: boolean;
      atenaiHansoku: boolean;
      shikaku: boolean;
      kiken: boolean;
    };
  };
  timer: {
    isRunning: boolean;
    time: number;
  };
  matchInfo: {
    current: Match | null;
    next: Match | null;
  };
}

const KumiteDisplay = () => {
  const [data, setData] = useState<KumiteData>({
    scores: {
      aka: {
        wazari: 0,
        ippon: 0,
        nombre: "",
        kinshi: false,
        kinshiNi: false,
        kinshiChui: false,
        kinshiHansoku: false,
        atenai: false,
        atenaiChui: false,
        atenaiHansoku: false,
        shikaku: false,
        kiken: false,
      },
      shiro: {
        wazari: 0,
        ippon: 0,
        nombre: "",
        kinshi: false,
        kinshiNi: false,
        kinshiChui: false,
        kinshiHansoku: false,
        atenai: false,
        atenaiChui: false,
        atenaiHansoku: false,
        shikaku: false,
        kiken: false,
      },
    },
    timer: {
      isRunning: false,
      time: 0,
    },
    matchInfo: {
      current: null,
      next: null,
    },
  });

  const updateData = (newData: any) => {
    setData((prevData) => {
      if (
        !newData.timer.isRunning &&
        newData.timer.time !== prevData.timer.time
      ) {
        return {
          ...newData,
          timer: {
            ...newData.timer,
            time: newData.timer.time,
          },
        };
      }

      if (newData.timer.isRunning) {
        return {
          ...newData,
          timer: {
            ...newData.timer,
            time: newData.timer.time,
          },
        };
      }

      return {
        ...newData,
        timer: {
          ...newData.timer,
          time: prevData.timer.time,
        },
      };
    });
  };

  useEffect(() => {
    kumiteChannel.onmessage = (event) => {
      if (event.data) {
        updateData(event.data);
      }
    };

    const handleCustomEvent = (event: any) => {
      if (event.detail) {
        updateData(event.detail);
      }
    };

    window.addEventListener("update-kumite", handleCustomEvent);

    const handleTauriEvent = (event: any) => {
      if (event.data) {
        updateData(event.data);
      }
    };

    window.addEventListener("tauri://update-kumite", handleTauriEvent);

    return () => {
      kumiteChannel.onmessage = null;
      window.removeEventListener("update-kumite", handleCustomEvent);
      window.removeEventListener("tauri://update-kumite", handleTauriEvent);
    };
  }, []);

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calcularKinshis = (scores: any) => {
    let kinshis = 0;

    if (scores.kinshi) kinshis++;
    if (scores.kinshiNi) kinshis++;
    if (scores.kinshiChui) kinshis++;
    if (scores.kinshiHansoku) kinshis++;

    return kinshis;
  };

  const calcularAtenai = (scores: any) => {
    let atenai = 0;

    if (scores.atenai) atenai++;
    if (scores.atenaiChui) atenai++;
    if (scores.atenaiHansoku) atenai++;

    return atenai;
  };

  const ScoreDisplay = ({ competitor, image, scores }: any) => (
    <div className="w-1/2 bg-white shadow-lg rounded-lg p-4">
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-full bg-black flex flex-row justify-between items-center gap-4">
          <OptimizedImage
            alt={`${competitor} belt`}
            height="100%"
            src={image}
            width="100%"
          />
          <h1 className="text-4xl text-white font-semibold px-4">
            {scores.nombre.toUpperCase() || `${competitor.toUpperCase()}`}
          </h1>
        </div>
        <div className="flex flex-row justify-between w-full gap-10">
          <div className="flex flex-col justify-start gap-5 self-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Advertencias</h2>
              <h2 className="text-xl font-bold">{calcularKinshis(scores)}/4</h2>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Advertencias <br />
                por contacto
              </h2>
              <h2 className="text-xl font-bold">{calcularAtenai(scores)}/3</h2>
            </div>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                {scores.shikaku ? "SHIKAKU" : scores.kiken ? "KIKEN" : ""}
              </h2>
            </div>
          </div>
          <div className="flex justify-center gap-10 px-10">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-3xl font-semibold">WAZARI</h2>
              <h2 className="text-4xl font-bold">{scores.wazari}</h2>
            </div>
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-3xl font-semibold">IPPON</h2>
              <h2 className="text-4xl font-bold">{scores.ippon}</h2>
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold self-end px-20">
          Total: {(scores.wazari * 0.5 + scores.ippon).toFixed(1)}
        </h2>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-around w-full h-screen bg-gradient-to-b from-blue-500/40 to-blue-800/90 gap-4 p-4">
      <div className="w-full flex items-start justify-end">
        <div className="rounded-lg p-2 shadow-lg">
          <h2 className="text-xl font-bold uppercase text-gray-800 flex items-center gap-2">
            <span>PRÓXIMO COMBATE:</span>
            {data.matchInfo?.next && data.matchInfo.next.pair[0] !== "--" ? (
              <>
                <span className="text-red-500">
                  {typeof data.matchInfo.next.pair[0] === "object"
                    ? data.matchInfo.next.pair[0].Nombre
                    : data.matchInfo.next.pair[0]}
                </span>
                <span>VS</span>
                <span className="text-white">
                  {typeof data.matchInfo.next.pair[1] === "object"
                    ? data.matchInfo.next.pair[1].Nombre
                    : data.matchInfo.next.pair[1]}
                </span>
              </>
            ) : (
              <span className="text-gray-500">No hay más combates</span>
            )}
          </h2>
        </div>
      </div>
      <div className="w-full flex justify-center pb-4">
        <div className="w-1/4 flex flex-col justify-center items-center gap-2 bg-white rounded-lg p-4">
          <div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-bold">TIEMPO</h2>
              <h2 className="text-4xl font-bold">
                {formatTime(data.timer.time)}
              </h2>
              <h2 className="text-lg">
                {data.timer.isRunning ? "En curso" : "Detenido"}
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className=" w-full flex items-center gap-4">
        <ScoreDisplay
          competitor="aka"
          image={AkaBelt}
          scores={data.scores.aka}
        />
        <ScoreDisplay
          competitor="shiro"
          image={ShiroBelt}
          scores={data.scores.shiro}
        />
      </div>
    </div>
  );
};

export default KumiteDisplay;
```

### src/pages/KumiteComponents/PanelCard.tsx
```tsx
import React, { memo } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Image,
} from "@heroui/react";
import { RiCloseCircleLine } from "react-icons/ri";
import { BsCircleFill, BsCircle } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

interface PanelCardProps {
  cinto: "aka" | "shiro";
  imagen: string;
  nombre: string;
  ippon: number;
  wazari: number;
  kiken: boolean;
  kinshi: boolean;
  kinshiChui: boolean;
  kinshiHansoku: boolean;
  kinshiNi: boolean;
  shikaku: boolean;
  atenai: boolean;
  atenaiChui: boolean;
  atenaiHansoku: boolean;
  disabled: boolean;
  onIppon: () => void;
  onWazari: () => void;
  onKiken: () => void;
  onKinshi: () => void;
  onKinshiNi: () => void;
  onKinshiChui: () => void;
  onKinshiHansoku: () => void;
  onShikaku: () => void;
  onAtenai: () => void;
  onAtenaiChui: () => void;
  onAtenaiHansoku: () => void;
  onHantei: () => void;
}

const ScoreButton = memo(
  ({
    isDisabled,
    label,
    onClick,
    ariaLabel,
  }: {
    label: string;
    onClick: () => void;
    isDisabled: boolean;
    ariaLabel?: string;
  }) => (
    <Button
      aria-label={ariaLabel || label}
      as={motion.button}
      className="text-xs sm:text-sm"
      isDisabled={isDisabled}
      size="sm"
      whileTap={{ scale: 0.95 }}
      onPress={onClick}
    >
      {label}
    </Button>
  ),
);

ScoreButton.displayName = "ScoreButton";

const PenaltyButton = memo(
  ({
    isActive,
    isDisabled,
    label,
    onClick,
    ariaLabel,
  }: {
    label: string;
    onClick: () => void;
    isDisabled: boolean;
    isActive: boolean;
    ariaLabel?: string;
  }) => (
    <Button
      aria-label={ariaLabel || label}
      as={motion.button}
      className="text-xs sm:text-sm"
      isDisabled={isDisabled}
      size="sm"
      whileTap={{ scale: 0.95 }}
      onPress={onClick}
    >
      {isActive ? <RiCloseCircleLine /> : label}
    </Button>
  ),
);

PenaltyButton.displayName = "PenaltyButton";

const ScoreIndicator = memo(
  ({ count, Icon }: { count: number; Icon: React.ElementType }) => (
    <div className="flex gap-1 sm:gap-2 w-full justify-center">
      <AnimatePresence>
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            initial={{ scale: 0 }}
          >
            <Icon className="text-lg sm:text-xl lg:text-2xl" color="white" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  ),
);

ScoreIndicator.displayName = "ScoreIndicator";

const PenaltySection = memo(
  ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center">
      <div className="font-bold whitespace-nowrap text-white text-xs sm:text-sm">
        {label}:
      </div>
      <div className="flex gap-1 flex-wrap">{children}</div>
    </div>
  ),
);

PenaltySection.displayName = "PenaltySection";

export const PanelCard = (props: PanelCardProps) => {
  return (
    <Card className="w-full h-full bg-transparent border-2 border-blue-800 rounded-lg overflow-hidden">
      <CardHeader>
        <div className="w-full bg-black p-2 gap-2 flex flex-col sm:flex-row justify-between items-center rounded-md">
          <Image
            alt="Belt"
            className="w-32 sm:w-40 h-8 sm:h-10"
            src={props.imagen}
          />
          <Input
            isReadOnly
            className="w-full bg-transparent text-black text-lg sm:text-xl font-bold rounded-md"
            placeholder="Nombre del competidor"
            type="text"
            value={props.nombre}
          />
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-2 sm:gap-3">
          <div>
            <div className="flex justify-center gap-2 sm:gap-4 mb-2 min-h-8 sm:min-h-12">
              <ScoreIndicator Icon={BsCircle} count={props.wazari} />
              <ScoreIndicator Icon={BsCircleFill} count={props.ippon} />
            </div>
            <div className="flex justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
              <ScoreButton
                ariaLabel={`Agregar Wazari a ${props.nombre}`}
                isDisabled={props.disabled}
                label="Wazari"
                onClick={props.onWazari}
              />
              <ScoreButton
                ariaLabel={`Agregar Ippon a ${props.nombre}`}
                isDisabled={props.disabled}
                label="Ippon"
                onClick={props.onIppon}
              />
              <ScoreButton
                ariaLabel={`Otorgar victoria por Hantei a ${props.nombre}`}
                isDisabled={props.disabled}
                label="Hantei"
                onClick={props.onHantei}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 items-stretch">
            <PenaltySection label="Kinshi">
              <PenaltyButton
                ariaLabel={`Marcar Kinshi para ${props.nombre}`}
                isActive={props.kinshi}
                isDisabled={props.disabled || !!props.kinshi}
                label="Kinshi"
                onClick={props.onKinshi}
              />

              <PenaltyButton
                ariaLabel={`Marcar Kinshi Ni para ${props.nombre}`}
                isActive={props.kinshiNi}
                isDisabled={props.disabled || !!props.kinshiNi || !props.kinshi}
                label="Ni"
                onClick={props.onKinshiNi}
              />

              <PenaltyButton
                ariaLabel={`Marcar Kinshi Chui para ${props.nombre}`}
                isActive={props.kinshiChui}
                isDisabled={
                  props.disabled || !!props.kinshiChui || !props.kinshiNi
                }
                label="Chui"
                onClick={props.onKinshiChui}
              />

              <PenaltyButton
                ariaLabel={`Marcar Kinshi Hansoku para ${props.nombre}`}
                isActive={props.kinshiHansoku}
                isDisabled={
                  props.disabled || !!props.kinshiHansoku || !props.kinshiChui
                }
                label="Hansoku"
                onClick={props.onKinshiHansoku}
              />
            </PenaltySection>
            <PenaltySection label="Atenai">
              <PenaltyButton
                isActive={props.atenai}
                isDisabled={props.disabled || !!props.atenai}
                label="Atenai"
                onClick={props.onAtenai}
              />
              <PenaltyButton
                isActive={props.atenaiChui}
                isDisabled={props.disabled || !!props.atenaiChui}
                label="Chui"
                onClick={props.onAtenaiChui}
              />
              <PenaltyButton
                isActive={props.atenaiHansoku}
                isDisabled={props.disabled || !!props.atenaiHansoku}
                label="Hansoku"
                onClick={props.onAtenaiHansoku}
              />
            </PenaltySection>
            <PenaltySection label="Descalificacion">
              <PenaltyButton
                isActive={props.shikaku}
                isDisabled={props.disabled || !!props.shikaku}
                label="Shikaku"
                onClick={props.onShikaku}
              />
            </PenaltySection>
            <PenaltySection label="Abandono / Renuncia">
              <PenaltyButton
                isActive={props.kiken}
                isDisabled={props.disabled || !!props.kiken}
                label="Kiken"
                onClick={props.onKiken}
              />
            </PenaltySection>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
```

### src/pages/KumiteComponents/Bracket.tsx
```tsx
import React from "react";
import { Card, CardBody } from "@heroui/react";

import { Match } from "@/types";

interface BracketProps {
  bracket: Match[][];
}

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <Card className="border p-2 rounded-lg shadow-sm bg-white min-w-[200px]">
      <CardBody className="p-0">
        {match.pair.map((competitor, competitorIndex) => {
          let displayName: string;
          let isWinner = false;

          if (
            typeof competitor === "object" &&
            competitor !== null &&
            "Nombre" in competitor
          ) {
            displayName = (competitor as any).Nombre;
            if (
              match.winner &&
              typeof match.winner === "object" &&
              match.winner !== null &&
              "id" in match.winner
            ) {
              isWinner = (match.winner as any).id === (competitor as any).id;
            }
          } else {
            displayName = competitor as string;
          }

          // Determinar si hay un ganador y si este competidor es el perdedor
          const hayGanador = !!match.winner;
          const esPerdedor = hayGanador && !isWinner && displayName !== "--";

          return (
            <div
              key={competitorIndex}
              className={`p-2 ${
                competitorIndex === 0
                  ? "rounded-t-lg border-b-2 bg-red-500 text-white border-gray-200"
                  : "rounded-b-lg bg-white text-black"
              } ${esPerdedor ? "line-through" : ""}`}
            >
              {displayName || "--"}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};

interface RoundColumnProps {
  round: Match[];
  roundIndex: number;
}

const roundNameMapping: { [key: number]: string } = {
  2: "Final",
  4: "Semifinal",
  8: "Cuartos de Final",
  16: "Octavos de Final",
  32: "16vos de Final",
};

const RoundColumn: React.FC<RoundColumnProps> = ({ round, roundIndex }) => {
  const numPlayersInRound = round.length * 2;
  const roundTitle =
    roundNameMapping[numPlayersInRound] || `Ronda de ${numPlayersInRound}`;

  const gaps = ["2rem", "10rem", "20rem", "42rem"];

  const roundStyle: React.CSSProperties = {};

  if (roundIndex > 0) {
    roundStyle.placeSelf = "center";
  }

  const matchesStyle: React.CSSProperties = {
    gap: gaps[roundIndex] || "2rem",
  };

  return (
    <div className="flex flex-col" style={roundStyle}>
      <h3 className="text-center font-bold mb-6">{roundTitle}</h3>
      <div className="flex flex-col" style={matchesStyle}>
        {round.map((match, matchIndex) => (
          <MatchCard key={matchIndex} match={match} />
        ))}
      </div>
    </div>
  );
};

const Bracket: React.FC<BracketProps> = ({ bracket }) => {
  if (bracket.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-gray-500">
        No hay suficientes competidores para generar las llaves.
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 justify-center">
      {/*       <div className="border rounded-lg shadow-sm text-white bg-zinc-700 min-w-[200px] h-20 flex flex-col justify-center items-center">
        <div className={"p-2 border-b w-full text-center text-red-500 italic"}>
          AKA
        </div>
        <div className={"p-2 w-full text-center text-white italic"}>SHIRO</div>
      </div> */}
      <div className="flex items-start space-x-8">
        {bracket.map((round, roundIndex) => (
          <RoundColumn key={roundIndex} round={round} roundIndex={roundIndex} />
        ))}
      </div>
    </div>
  );
};

export default Bracket;
```

### src/pages/KumiteComponents/Ganador.tsx
```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useEffect, useState } from "react";

import AkaBelt from "@/assets/images/akaStill.gif";
import ShiroBelt from "@/assets/images/shiroStill.gif";

interface GanadorProps {
  ganador: "shiro" | "aka" | null;
  nombreGanador?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Ganador = ({
  ganador,
  isOpen,
  onClose,
  nombreGanador,
}: GanadorProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  const getGanadorInfo = () => {
    if (ganador === "aka") {
      return {
        nombre: "(AKA)",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-500",
        image: AkaBelt,
      };
    } else if (ganador === "shiro") {
      return {
        nombre: "(SHIRO)",
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-500",
        image: ShiroBelt,
      };
    }

    return null;
  };

  const ganadorInfo = getGanadorInfo();

  if (!ganador || !ganadorInfo) return null;

  return (
    <Modal
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
      isOpen={isOpen}
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-center">Fin del combate</h2>
        </ModalHeader>
        <ModalBody>
          <div
            className={`flex flex-col items-center justify-center p-8 ${ganadorInfo.bgColor} rounded-lg border-4 ${ganadorInfo.borderColor} transition-all duration-500 ${showAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <h1 className={`text-4xl font-bold mb-4 ${ganadorInfo.color}`}>
              ¡GANADOR!
            </h1>
            <h1 className={`text-4xl font-semibold mb-4 ${ganadorInfo.color}`}>
              {nombreGanador} {ganadorInfo.nombre}
            </h1>
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                ¡Felicitaciones al ganador!
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="w-full" color="primary" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

### src/pages/KumiteComponents/ModalLlaves.tsx
```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip,
  Image,
} from "@heroui/react";

import Bracket from "./Bracket";

import Llaves from "@/assets/images/brackets-tree.svg";
import { Match } from "@/types";

export interface ModalLlavesProps {
  bracket: Match[][];
}

export default function ModalLlaves({ bracket }: ModalLlavesProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Tooltip color="success" content="Llaves">
        <Button isIconOnly className="px-1" variant="bordered" onPress={onOpen}>
          <Image alt="Llaves" className="rounded-none -mr-3" src={Llaves} />
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Llaves de Competencia
              </ModalHeader>
              <ModalBody>
                <Bracket bracket={bracket} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
```

### src/pages/KumiteComponents/Temporizador.tsx
```tsx
import { FC, useState, useEffect } from "react";

interface TemporizadorProps {
  initialTime: number;
  isRunning: boolean;
  onTimeEnd: (type: "30sec" | "end") => void;
  onTimeUpdate: (time: number) => void;
  resetKey?: number;
}

export const Temporizador: FC<TemporizadorProps> = ({
  initialTime,
  isRunning,
  onTimeEnd,
  onTimeUpdate,
  resetKey = 0,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime, resetKey]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;

          // Notificar el tiempo actual
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }

          // Notificar eventos especiales
          if (newTime === 30) {
            onTimeEnd("30sec");
          } else if (newTime === 0) {
            onTimeEnd("end");
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, onTimeEnd, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-background/70 dark:bg-default-100/50 p-2 sm:p-4 rounded-lg box-shadow-lg">
      <div className="text-center">
        <div className="text-sm sm:text-lg mb-1 sm:mb-2">TIEMPO</div>
        <div className="text-4xl sm:text-6xl lg:text-8xl font-bold">
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm sm:text-lg mt-1 sm:mt-2">
          {isRunning ? "En curso" : "Detenido"}
        </div>
      </div>
    </div>
  );
};
```

### src/components/AreaSelector.tsx
```tsx
import React from "react";
import { Select, SelectItem, Input } from "@heroui/react";

interface AreaSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const AREA_ITEMS = [
  { key: "1", label: "Area 1" },
  { key: "2", label: "Area 2" },
  { key: "3", label: "Area 3" },
  { key: "4", label: "Area 4" },
  { key: "5", label: "Area 5" },
];

/**
 * Componente reutilizable para seleccionar el área de competencia
 * Puede ser usado tanto en Kata como en Kumite
 */
export const AreaSelector = React.memo<AreaSelectorProps>(
  ({ value, onChange, disabled = false }) => {
    if (disabled) {
      return (
        <Input
          isReadOnly
          className="rounded-md text-center font-bold"
          value={value}
        />
      );
    }

    return (
      <Select
        className="rounded-md"
        placeholder="Seleccionar"
        value={value}
        onChange={onChange}
      >
        {AREA_ITEMS.map((item) => (
          <SelectItem key={item.key}>{item.label}</SelectItem>
        ))}
      </Select>
    );
  },
);

AreaSelector.displayName = "AreaSelector";
```

### src/components/CommonInput.tsx
```tsx
import { FC } from "react";
import { Input } from "@heroui/react";

interface CommonInputProps {
  value?: string;
  label: string;
  isReadOnly: boolean;
}

export const CommonInput: FC<CommonInputProps> = ({
  value,
  label,
  isReadOnly,
}) => {
  return (
    <Input
      className="w-36 md:w-28 xl:w-auto rounded-md px-2 py-1 text-center text-2xl"
      classNames={{
        input: "text-center text-2xl font-bold",
        inputWrapper: "h-24",
      }}
      isReadOnly={isReadOnly}
      placeholder={label}
      size="lg"
      type="text"
      value={value}
    />
  );
};
```

### src/components/CompetitorTable.tsx
```tsx
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  // ... imports
  Skeleton,
} from "@heroui/react";

interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria: string;
  PuntajeFinal: number | null;
  Kiken: boolean;
}

interface CompetitorTableProps {
  competidores: Competidor[];
  isLoading?: boolean;
}

/**
 * Componente para mostrar la tabla de competidores
 * Optimizado con React.memo para evitar re-renders cuando los competidores no cambian
 */
export const CompetitorTable = React.memo<CompetitorTableProps>(
  ({ competidores, isLoading = false }) => {
    return (
      <div className="w-full sm:min-w-[50%] overflow-auto">
        <Table
          fullWidth
          isCompact
          isHeaderSticky
          classNames={{
            base: "min-h-[200px] sm:min-h-[250px] max-h-[200px] sm:max-h-[250px] overflowY-scroll text-xs sm:text-sm",
          }}
        >
          <TableHeader className="text-center">
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn className="text-center">EDAD</TableColumn>
            <TableColumn className="text-center">KYU/DAN</TableColumn>
            <TableColumn className="text-center">PUNTAJE FINAL</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay competidores cargados.">
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={`skeleton-${idx}`}>
                    <TableCell>
                      <Skeleton className="rounded-lg">
                        <div className="h-6 w-3/4 rounded-lg bg-default-200" />
                      </Skeleton>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="rounded-lg">
                        <div className="h-6 w-1/2 rounded-lg bg-default-200" />
                      </Skeleton>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="rounded-lg">
                        <div className="h-6 w-1/2 rounded-lg bg-default-200" />
                      </Skeleton>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="rounded-lg">
                        <div className="h-6 w-1/2 rounded-lg bg-default-200" />
                      </Skeleton>
                    </TableCell>
                  </TableRow>
                ))
              : competidores.map((competidor) => (
                  <TableRow
                    key={competidor.id}
                    className={`${competidor.PuntajeFinal !== null ? "bg-blue-100" : ""} text-center`}
                  >
                    <TableCell>{competidor.Nombre}</TableCell>
                    <TableCell className="text-center">
                      {competidor.Edad}
                    </TableCell>
                    <TableCell className="text-center">
                      {competidor.Categoria}
                    </TableCell>
                    <TableCell className="text-center">
                      {competidor.Kiken
                        ? "KIKEN"
                        : competidor.PuntajeFinal
                          ? (
                              Math.round(competidor.PuntajeFinal * 10) / 10
                            ).toFixed(1)
                          : "-"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    );
  },
);

CompetitorTable.displayName = "CompetitorTable";

export type { Competidor };
```

### src/components/ConfigModal.tsx
```tsx
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Checkbox,
    Slider,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useConfig } from "@/context/ConfigContext";

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConfigModal = ({ isOpen, onClose }: ConfigModalProps) => {
    const { config, updateConfig, resetConfig } = useConfig();

    // Local state to manage inputs before saving?
    // Or direct update? Direct update is instant, maybe better for "Settings" feel.
    // But usually modals have "Save" or "Close".
    // Let's use direct update for simplicity as per requirements (Config Context updates immediately).

    // However, Slider sometimes needs intermediate state.

    return (
        <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Configuración
                        </ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col gap-6">
                                {/* Kumite Settings */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold">Kumite</h3>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm">
                                            Umbral de Victoria (Puntos)
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                className="w-20"
                                                label=""
                                                type="number"
                                                value={config.kumite.winThreshold.toString()}
                                                onChange={(e) =>
                                                    updateConfig("kumite", {
                                                        winThreshold: parseInt(e.target.value) || 0,
                                                    })
                                                }
                                            />
                                            <span className="text-xs text-gray-500">
                                                Puntos de diferencia o totales para ganar
                                                automáticamente (Ippon=1, Wazari=0.5). Default WKF: 8.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-2">
                                        <Checkbox
                                            isSelected={config.kumite.autoWinnerOnPenalty}
                                            onValueChange={(isSelected) =>
                                                updateConfig("kumite", {
                                                    autoWinnerOnPenalty: isSelected,
                                                })
                                            }
                                        >
                                            Auto-Ganador por Penalización (Hansoku/Kiken)
                                        </Checkbox>
                                        <p className="text-xs text-gray-500 ml-7">
                                            Si se marca Hansoku, Shikaku o Kiken, el oponente gana
                                            automáticamente.
                                        </p>
                                    </div>
                                </div>

                                {/* General Settings */}
                                {/* Add more later */}

                                <div className="border-t pt-4">
                                    <Button color="danger" variant="light" onPress={resetConfig}>
                                        Restaurar Valores por Defecto
                                    </Button>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose}>
                                Cerrar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
```

### src/components/ErrorBoundary.tsx
```tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@heroui/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Captura errores de React y muestra una UI de fallback
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // UI personalizada de fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Algo salió mal!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Lo sentimos, ocurrió un error inesperado. Por favor, intenta
                recargar la página.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Detalles del error (solo en desarrollo)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-red-600 dark:text-red-400">
                      Error:
                    </strong>
                    <pre className="mt-1 text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-red-600 dark:text-red-400">
                        Stack trace:
                      </strong>
                      <pre className="mt-1 text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                color="primary"
                onPress={this.handleReset}
              >
                Intentar de nuevo
              </Button>
              <Button
                className="flex-1"
                color="default"
                variant="bordered"
                onPress={() => window.location.reload()}
              >
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### src/components/ExcelUploader.tsx
```tsx
import React from "react";
import { Button } from "@heroui/react";

interface ExcelUploaderProps {
  disabled: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Componente reutilizable para cargar archivos Excel
 * Puede ser usado tanto en Kata como en Kumite
 * Optimizado con React.memo
 */
export const ExcelUploader = React.memo<ExcelUploaderProps>(
  ({ disabled, onUpload }) => {
    const handleButtonClick = () => {
      document?.getElementById("excel-upload")?.click();
    };

    return (
      <>
        <input
          accept=".xlsx,.xls"
          className="hidden"
          id="excel-upload"
          type="file"
          onChange={onUpload}
        />
        <Button
          className="bg-green-700 text-white self-center text-sm sm:text-base"
          isDisabled={disabled}
          onPress={handleButtonClick}
        >
          Cargar Excel
        </Button>
      </>
    );
  },
);

ExcelUploader.displayName = "ExcelUploader";
```

### src/components/HistoryLog.tsx
```tsx
import React, { useEffect, useRef } from "react";
import { ScrollShadow } from "@heroui/react";

import { useKumite } from "@/context/KumiteContext";

export const HistoryLog: React.FC = () => {
    const { state } = useKumite();
    const { history } = state;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic p-4 border-2 border-dashed border-gray-300 rounded-lg">
                No hay acciones registradas
            </div>
        );
    }

    return (
        <ScrollShadow
            ref={scrollRef}
            className="w-full h-full max-h-[300px] overflow-y-auto p-2 bg-white/50 dark:bg-black/50 rounded-lg backdrop-blur-sm"
        >
            <div className="flex flex-col gap-1">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className={`flex justify-between items-center text-xs sm:text-sm p-2 rounded ${item.competitor === "aka"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-l-4 border-red-500"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500"
                            }`}
                    >
                        <span className="font-bold uppercase opacity-70 text-[10px] w-12">
                            {item.competitor}
                        </span>
                        <span className="flex-1 font-medium">{item.description}</span>
                        <span className="text-[10px] opacity-50 tabular-nums">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                                hour12: false,
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </ScrollShadow>
    );
};
```

### src/components/JudgeScoreInputs.tsx
```tsx
// ... imports
import React from "react";
import { Input } from "@heroui/react";
import { MdCancel } from "react-icons/md";

interface JudgeScoreInputsProps {
  judges: string[];
  numJudges: number;
  submitted: boolean;
  onJudgeChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onJudgeClear: (index: number) => void;
  onJudgeBlur: (index: number) => void;
}

/**
 * Componente para los inputs de puntajes de jueces
 * Optimizado con React.memo para evitar re-renders innecesarios
 */
export const JudgeScoreInputs = React.memo<JudgeScoreInputsProps>(
  ({
    judges,
    numJudges,
    submitted,
    onJudgeChange,
    onJudgeClear,
    onJudgeBlur,
  }) => {
    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number,
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextTabIndex = index + 2; // index is 0-based, tabIndex is 1-based, so next is +2
        const nextElement = document.querySelector(
          `[tabindex="${nextTabIndex}"]`,
        ) as HTMLElement;

        if (nextElement) {
          nextElement.focus();
        }
      }
    };

    return (
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 justify-between lg:gap-4">
        {judges.slice(0, numJudges).map((judge, index) => (
          <div key={index} className="flex flex-col gap-1 w-full">
            <span className="text-md font-semibold pl-1 uppercase">
              {index === 0 ? "Juez 1 (Principal)" : `Juez ${index + 1}`}
            </span>
            <Input
              isClearable
              aria-label={`Puntaje del Juez ${index + 1}`}
              className="w-full"
              endContent={<MdCancel />}
              errorMessage={
                <p className="text-shadow-lg/30 font-semibold text-xs">
                  Puntaje requerido
                </p>
              }
              isInvalid={submitted && !judge}
              maxLength={3}
              placeholder="0.0"
              size="lg"
              tabIndex={index + 1}
              type="text"
              value={judge}
              variant="faded"
              onBlur={() => onJudgeBlur(index)}
              onChange={(e) => onJudgeChange(index, e)}
              onClear={() => onJudgeClear(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          </div>
        ))}
      </div>
    );
  },
);

JudgeScoreInputs.displayName = "JudgeScoreInputs";
```

### src/components/MenuComponent.tsx
```tsx
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { RiMenuUnfold4Fill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";

/* import { ThemeSwitch } from "./theme-switch"; */

interface MenuComponentProps {
  handleOpenKumiteDisplay?: () => void;
  handleOpenKataDisplay?: () => void;
  handleOpenConfig?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
}

export const MenuComponent = ({
  handleOpenKumiteDisplay,
  handleOpenKataDisplay,
  handleOpenConfig,
  onExportExcel,
  onExportPDF,
}: MenuComponentProps) => {
  const navigate = useNavigate();
  const { pathname: href } = useLocation();

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button isIconOnly>
          <RiMenuUnfold4Fill />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions" variant="flat">
        <DropdownSection showDivider aria-label="Actions">
          <DropdownItem
            key="kata"
            href={
              href === "/kata" ? "/kumite" : href === "/kumite" ? "/kata" : ""
            }
          >
            {href === "/kata" ? "Kumite" : href === "/kumite" ? "Kata" : ""}
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider aria-label="Export">
          <DropdownItem key="excel" onPress={onExportExcel}>
            Exportar Excel
          </DropdownItem>
          <DropdownItem key="pdf" onPress={onExportPDF}>
            Exportar PDF
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider aria-label="Config">
          <DropdownItem key="settings" onPress={handleOpenConfig}>
            Configuración
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider aria-label="Section Action">
          <DropdownItem
            key="kataWindow"
            className="bg-gray-500 text-white font-semibold hover:bg-gray-400 rounded-md"
            onPress={
              href === "/kumite"
                ? handleOpenKumiteDisplay
                : href === "/kata"
                  ? handleOpenKataDisplay
                  : () => { }
            }
          >
            Abrir Ventana
          </DropdownItem>
          <DropdownItem key="back" onPress={() => navigate("/inicio")}>
            Inicio
          </DropdownItem>
        </DropdownSection>
        {/*  <DropdownSection showDivider aria-label="Theme">
          <DropdownItem
            key="theme"
            isReadOnly
            className="hover:bg-transparent data-[hover=true]:bg-transparent cursor-default"
            onPress={() => {}}
          >
            <ThemeSwitch />
          </DropdownItem>
        </DropdownSection> */}
      </DropdownMenu>
    </Dropdown>
  );
};
```

### src/components/PDFReader.tsx
```tsx
import { useRef } from "react";
import { Button } from "@heroui/react";

export default function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div>
      <Button
        className="bg-gray-700 text-white rounded-md mb-2"
        size="sm"
        onPress={handleFullscreen}
      >
        Ver en pantalla completa
      </Button>

      <div ref={containerRef} className="w-full h-[450px] rounded-lg">
        <iframe
          className="w-full h-full border-none rounded-lg"
          src={fileUrl}
          title="Reglamento WUKF"
        />
      </div>
    </div>
  );
}
```

### src/components/TimerControls.tsx
```tsx
import React from "react";
import { Button } from "@heroui/react";

interface TimerControlsProps {
  selectedTime: number;
  isRunning: boolean;
  hasWinner: boolean;
  onSelectTime: (time: number) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

/**
 * Componente para controles del temporizador de Kumite
 * Incluye botones de selección de tiempo y controles de inicio/pausa/reset
 * Optimizado con React.memo
 */
export const TimerControls = React.memo<TimerControlsProps>(
  ({
    selectedTime,
    isRunning,
    hasWinner,
    onSelectTime,
    onStart,
    onStop,
    onReset,
  }) => {
    return (
      <div className="flex flex-col gap-2 lg:gap-4 w-full">
        {/* Time Selection Buttons */}
        <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
          <Button
            aria-label="Seleccionar tiempo 3 minutos"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning}
            size="sm"
            onPress={() => onSelectTime(180)}
          >
            3:00
          </Button>

          <Button
            aria-label="Seleccionar tiempo 2 minutos"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning}
            size="sm"
            onPress={() => onSelectTime(120)}
          >
            2:00
          </Button>

          <Button
            aria-label="Seleccionar tiempo 1 minuto"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning}
            size="sm"
            onPress={() => onSelectTime(60)}
          >
            1:00
          </Button>

          <Button
            aria-label="Seleccionar tiempo 1 minuto 30 segundos"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning}
            size="sm"
            onPress={() => onSelectTime(90)}
          >
            1:30
          </Button>

          <Button
            aria-label="Seleccionar tiempo 30 segundos"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning}
            size="sm"
            onPress={() => onSelectTime(30)}
          >
            0:30
          </Button>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 lg:gap-4 justify-center flex-wrap">
          <Button
            aria-label={
              isRunning ? "Pausar temporizador" : "Iniciar temporizador"
            }
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning || selectedTime === 0}
            size="sm"
            onPress={onStart}
          >
            {isRunning ? "Reanudar" : "Iniciar"}
          </Button>

          <Button
            aria-label="Detener temporizador"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || !isRunning}
            size="sm"
            onPress={onStop}
          >
            Detener
          </Button>

          <Button
            aria-label="Reiniciar temporizador"
            className="text-xs lg:text-sm"
            isDisabled={hasWinner || isRunning || selectedTime === 0}
            size="sm"
            onPress={onReset}
          >
            Reiniciar
          </Button>
        </div>
      </div>
    );
  },
);

TimerControls.displayName = "TimerControls";
```

### src/components/icons.tsx
```tsx
import * as React from "react";

import { IconSvgProps } from "@/types";

export const Logo: React.FC<IconSvgProps> = ({
  size = 36,
  height,
  ...props
}) => (
  <svg
    fill="none"
    height={size || height}
    viewBox="0 0 32 32"
    width={size || height}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const DiscordIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const HeartFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);
```

### src/components/primitives.ts
```tsx
import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      violet: "from-[#FF1CF7] to-[#b249f8]",
      yellow: "from-[#FF705B] to-[#FFB457]",
      blue: "from-[#5EA2EF] to-[#0072F5]",
      cyan: "from-[#00b7fa] to-[#01cfea]",
      green: "from-[#6FEE8D] to-[#17c964]",
      pink: "from-[#FF72E1] to-[#F54C7A]",
      foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]",
    },
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl leading-9",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      color: [
        "violet",
        "yellow",
        "blue",
        "cyan",
        "green",
        "pink",
        "foreground",
      ],
      class: "bg-clip-text text-transparent bg-gradient-to-b",
    },
  ],
});

export const subtitle = tv({
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full",
  variants: {
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});
```

### src/components/theme-switch.tsx
```tsx
import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import clsx from "clsx";
import { useTheme } from "@heroui/use-theme";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light",
    onChange: () => setTheme(theme === "light" ? "dark" : "light"),
  });

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  // Prevent Hydration Mismatch
  if (!isMounted) return <div className="w-6 h-6" />;

  return (
    <Component
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "w-auto h-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper,
          ),
        })}
      >
        {isSelected ? (
          <MoonFilledIcon size={22} />
        ) : (
          <SunFilledIcon size={22} />
        )}
      </div>
    </Component>
  );
};
```
