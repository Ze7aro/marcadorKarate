use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

/// Abre la ventana de proyección de Kata
#[tauri::command]
pub async fn open_kata_display(app: AppHandle) -> Result<(), String> {
    // Verificar si la ventana ya existe
    if app.get_webview_window("kata-display").is_some() {
        // Si ya existe, solo traerla al frente
        if let Some(window) = app.get_webview_window("kata-display") {
            window.set_focus().map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    // Crear nueva ventana de proyección
    let _window = WebviewWindowBuilder::new(
        &app,
        "kata-display",
        WebviewUrl::App("/kata-display".into()),
    )
    .title("Kata - Proyección")
    .inner_size(1280.0, 800.0)
    .resizable(true)
    .fullscreen(false)
    .decorations(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Cierra la ventana de proyección de Kata
#[tauri::command]
pub async fn close_kata_display(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("kata-display") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Abre la ventana de proyección de Kumite
#[tauri::command]
pub async fn open_kumite_display(app: AppHandle) -> Result<(), String> {
    // Verificar si la ventana ya existe
    if app.get_webview_window("kumite-display").is_some() {
        // Si ya existe, solo traerla al frente
        if let Some(window) = app.get_webview_window("kumite-display") {
            window.set_focus().map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    // Crear nueva ventana de proyección
    let _window = WebviewWindowBuilder::new(
        &app,
        "kumite-display",
        WebviewUrl::App("/kumite-display".into()),
    )
    .title("Kumite - Proyección")
    .inner_size(1280.0, 800.0)
    .resizable(true)
    .fullscreen(false)
    .decorations(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Cierra la ventana de proyección de Kumite
#[tauri::command]
pub async fn close_kumite_display(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("kumite-display") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Alterna el modo pantalla completa de una ventana
#[tauri::command]
pub async fn toggle_fullscreen(app: AppHandle, label: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&label) {
        let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
        window
            .set_fullscreen(!is_fullscreen)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Verifica si una ventana está abierta
#[tauri::command]
pub async fn is_window_open(app: AppHandle, label: String) -> Result<bool, String> {
    Ok(app.get_webview_window(&label).is_some())
}
