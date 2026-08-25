import { useKumite } from "@/context/KumiteContext";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export function useKumiteProjection() {
  const { dispatch } = useKumite();
  const { t } = useTranslation(["kumite"]);

  const openProjection = async () => {
    try {
      const existingWindow = await WebviewWindow.getByLabel("kumite-display");
      if (existingWindow) {
        await existingWindow.setFocus();
        toast.success(t("kumite:messages.projectionOpened"));
        return;
      }
      await invoke("open_kumite_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: true });
      toast.success(t("kumite:messages.projectionOpened"));
    } catch (error) {
      console.error("Error opening display window:", error);
      toast.error("Error al abrir ventana de proyección");
    }
  };

  const closeProjection = async () => {
    try {
      await invoke("close_kumite_display");
      dispatch({ type: "SET_DISPLAY_WINDOW", payload: false });
      toast.success("Ventana de proyección cerrada");
    } catch (error) {
      console.error("Error closing display window:", error);
      toast.error("Error al cerrar ventana de proyección");
    }
  };

  return { openProjection, closeProjection };
}
