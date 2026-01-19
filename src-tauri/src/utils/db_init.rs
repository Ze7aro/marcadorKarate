use rusqlite::{Connection, Result};

/// Inicializa el esquema de base de datos SQLite
/// Crea todas las tablas necesarias para el historial de competencias Kata
pub fn init_database(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "
        -- Tabla de competencias
        CREATE TABLE IF NOT EXISTS competencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            fecha DATE NOT NULL,
            tipo TEXT CHECK(tipo IN ('kata', 'kumite')) NOT NULL,
            area TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla de categorías por competencia
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competencia_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            titulo TEXT,
            FOREIGN KEY (competencia_id) REFERENCES competencias(id) ON DELETE CASCADE
        );

        -- Tabla de competidores en Kata
        CREATE TABLE IF NOT EXISTS competidores_kata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            edad INTEGER NOT NULL,
            puntaje_final REAL,
            descalificado BOOLEAN DEFAULT 0,
            posicion INTEGER,
            FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
        );

        -- Tabla de puntajes de jueces
        CREATE TABLE IF NOT EXISTS puntajes_jueces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competidor_id INTEGER NOT NULL,
            juez_numero INTEGER NOT NULL,
            puntaje REAL NOT NULL,
            FOREIGN KEY (competidor_id) REFERENCES competidores_kata(id) ON DELETE CASCADE
        );

        -- Índices para búsquedas rápidas
        CREATE INDEX IF NOT EXISTS idx_competencias_fecha ON competencias(fecha);
        CREATE INDEX IF NOT EXISTS idx_competidores_categoria ON competidores_kata(categoria_id);
        CREATE INDEX IF NOT EXISTS idx_puntajes_competidor ON puntajes_jueces(competidor_id);
        "
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_database() {
        let conn = Connection::open_in_memory().unwrap();
        assert!(init_database(&conn).is_ok());

        // Verificar que las tablas existen
        let table_count: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name IN ('competencias', 'categorias', 'competidores_kata', 'puntajes_jueces')",
                [],
                |row| row.get(0)
            )
            .unwrap();

        assert_eq!(table_count, 4);
    }
}
