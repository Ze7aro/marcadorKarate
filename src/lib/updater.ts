import { confirm } from "@tauri-apps/plugin-dialog";
import { check } from "@tauri-apps/plugin-updater";
import { showToast } from "@/utils/toast";

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriApp() {
  return typeof window !== "undefined" && !!(window.__TAURI__ || window.__TAURI_INTERNALS__);
}

export async function checkForAppUpdates(options?: { silent?: boolean }) {
  if (!isTauriApp()) {
    return;
  }

  try {
    const update = await check();

    if (!update) {
      if (!options?.silent) {
        showToast.success("No hay actualizaciones disponibles.");
      }
      return;
    }

    const accepted = await confirm(
      `Hay una nueva version disponible (${update.version}).${update.body ? `\n\n${update.body}` : ""}\n\n¿Querés descargarla e instalarla ahora?`,
      {
        title: "Actualizacion disponible",
        kind: "info",
        okLabel: "Actualizar",
        cancelLabel: "Mas tarde",
      }
    );

    if (!accepted) {
      return;
    }

    const toastId = showToast.loading("Descargando actualizacion...");

    try {
      await update.downloadAndInstall();
      showToast.dismiss(toastId);
      showToast.success("Actualizacion instalada. Reiniciá la app si no se cierra sola.");
    } catch (error) {
      showToast.dismiss(toastId);
      throw error;
    }
  } catch (error) {
    console.error("Error buscando actualizaciones", error);
    if (!options?.silent) {
      showToast.error("No se pudo buscar actualizaciones.");
    }
  }
}
