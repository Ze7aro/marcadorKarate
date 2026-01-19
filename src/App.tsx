import { Navigate, Route, Routes } from "react-router-dom";
import IndexPage from "@/pages/index";
import KataPage from "@/pages/KataPage";
import KataDisplay from "@/pages/KataComponents/VentanaKata";
import KumitePage from "@/pages/KumitePage";
import KumiteDisplay from "@/pages/KumiteComponents/VentanaKumite";
import StatsPage from "@/pages/StatsPage";
import { ConfigProvider } from "@/context/ConfigContext";
import { KataProvider } from "@/context/KataContext";
import { KumiteProvider } from "@/context/KumiteContext";

function App() {
  return (
    <ConfigProvider>
      <KataProvider>
        <KumiteProvider>
          <Routes>
            <Route element={<IndexPage />} path="/inicio" />
            <Route element={<KataPage />} path="/kata" />
            <Route element={<KataDisplay />} path="/kata-display" />
            <Route element={<KumitePage />} path="/kumite" />
            <Route element={<KumiteDisplay />} path="/kumite-display" />
            <Route element={<StatsPage />} path="/estadisticas" />
            <Route element={<Navigate replace to="/inicio" />} path="*" />
            <Route element={<Navigate replace to="/inicio" />} path="/" />
          </Routes>
        </KumiteProvider>
      </KataProvider>
    </ConfigProvider>
  );
}

export default App;
