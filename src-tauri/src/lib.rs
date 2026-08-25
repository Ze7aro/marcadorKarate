mod commands;
mod models;
mod utils;

use commands::{database, window};
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Obtener el directorio de datos de la aplicación
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Crear el directorio si no existe
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");

            // Crear la conexión a la base de datos
            let db_path = app_dir.join("kata_history.db");
            let conn = Connection::open(&db_path).expect("Failed to open database connection");

            // Inicializar el esquema de la base de datos
            utils::db_init::init_database(&conn).expect("Failed to initialize database");

            // Agregar la conexión al estado de la aplicación
            app.manage(database::DbConnection(Mutex::new(conn)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Comandos de ventanas
            window::open_kata_display,
            window::close_kata_display,
            window::open_kumite_display,
            window::close_kumite_display,
            window::toggle_fullscreen,
            window::is_window_open,
            // Comandos de base de datos
            database::guardar_competencia_kata,
            database::obtener_historial_competencias,
            database::obtener_detalles_competencia,
            database::eliminar_competencia,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
