use crate::models::kata::{CompetenciaKata, CompetidorKata, GuardarCompetenciaRequest};
use rusqlite::{params, Connection};
use std::sync::Mutex;
use tauri::State;

/// Estado global de la conexión a la base de datos
pub struct DbConnection(pub Mutex<Connection>);

/// Guarda una competencia de Kata en la base de datos
#[tauri::command]
pub async fn guardar_competencia_kata(
    db: State<'_, DbConnection>,
    request: GuardarCompetenciaRequest,
) -> Result<i64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    // Iniciar transacción
    conn.execute("BEGIN TRANSACTION", [])
        .map_err(|e| format!("Error iniciando transacción: {}", e))?;

    // Insertar competencia
    conn.execute(
        "INSERT INTO competencias (nombre, fecha, tipo, area) VALUES (?, ?, 'kata', ?)",
        params![request.nombre, request.fecha, request.area],
    )
    .map_err(|e| format!("Error insertando competencia: {}", e))?;

    let competencia_id = conn.last_insert_rowid();

    // Insertar categoría
    conn.execute(
        "INSERT INTO categorias (competencia_id, nombre, titulo) VALUES (?, ?, ?)",
        params![competencia_id, request.categoria, request.categoria],
    )
    .map_err(|e| format!("Error insertando categoría: {}", e))?;

    let categoria_id = conn.last_insert_rowid();

    // Insertar competidores y sus puntajes
    for (posicion, comp) in request.competidores.iter().enumerate() {
        conn.execute(
            "INSERT INTO competidores_kata (categoria_id, nombre, edad, puntaje_final, descalificado, posicion)
             VALUES (?, ?, ?, ?, ?, ?)",
            params![
                categoria_id,
                comp.nombre,
                comp.edad,
                comp.puntaje_final,
                comp.descalificado,
                (posicion + 1) as i32
            ],
        )
        .map_err(|e| format!("Error insertando competidor: {}", e))?;

        let competidor_id = conn.last_insert_rowid();

        // Insertar puntajes de jueces
        for (juez_num, puntaje) in comp.puntajes_jueces.iter().enumerate() {
            conn.execute(
                "INSERT INTO puntajes_jueces (competidor_id, juez_numero, puntaje) VALUES (?, ?, ?)",
                params![competidor_id, (juez_num + 1) as i32, puntaje],
            )
            .map_err(|e| format!("Error insertando puntaje de juez: {}", e))?;
        }
    }

    // Confirmar transacción
    conn.execute("COMMIT", [])
        .map_err(|e| format!("Error confirmando transacción: {}", e))?;

    Ok(competencia_id)
}

/// Obtiene el historial de competencias de Kata
#[tauri::command]
pub async fn obtener_historial_competencias(
    db: State<'_, DbConnection>,
    limit: i32,
) -> Result<Vec<CompetenciaKata>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.nombre, c.fecha, c.area, cat.nombre as categoria
             FROM competencias c
             LEFT JOIN categorias cat ON cat.competencia_id = c.id
             WHERE c.tipo = 'kata'
             ORDER BY c.fecha DESC
             LIMIT ?",
        )
        .map_err(|e| format!("Error preparando consulta: {}", e))?;

    let competencias = stmt
        .query_map([limit], |row| {
            Ok(CompetenciaKata {
                id: Some(row.get(0)?),
                nombre: row.get(1)?,
                fecha: row.get(2)?,
                area: row.get(3)?,
                categoria: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                competidores: vec![], // Se cargan por separado si es necesario
            })
        })
        .map_err(|e| format!("Error ejecutando consulta: {}", e))?;

    let mut result = Vec::new();
    for competencia in competencias {
        result.push(competencia.map_err(|e| e.to_string())?);
    }

    Ok(result)
}

/// Obtiene los detalles completos de una competencia incluyendo competidores
#[tauri::command]
pub async fn obtener_detalles_competencia(
    db: State<'_, DbConnection>,
    competencia_id: i64,
) -> Result<CompetenciaKata, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    // Obtener datos básicos de la competencia
    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.nombre, c.fecha, c.area, cat.nombre as categoria, cat.id as categoria_id
             FROM competencias c
             LEFT JOIN categorias cat ON cat.competencia_id = c.id
             WHERE c.id = ?",
        )
        .map_err(|e| format!("Error preparando consulta de competencia: {}", e))?;

    let competencia = stmt
        .query_row([competencia_id], |row| {
            Ok((
                CompetenciaKata {
                    id: Some(row.get(0)?),
                    nombre: row.get(1)?,
                    fecha: row.get(2)?,
                    area: row.get(3)?,
                    categoria: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                    competidores: vec![],
                },
                row.get::<_, Option<i64>>(5)?,
            ))
        })
        .map_err(|e| format!("Error obteniendo competencia: {}", e))?;

    let (mut competencia, categoria_id) = competencia;

    // Si hay categoría, obtener competidores
    if let Some(cat_id) = categoria_id {
        let mut stmt_comp = conn
            .prepare(
                "SELECT id, nombre, edad, puntaje_final, descalificado, posicion
                 FROM competidores_kata
                 WHERE categoria_id = ?
                 ORDER BY posicion",
            )
            .map_err(|e| format!("Error preparando consulta de competidores: {}", e))?;

        let competidores = stmt_comp
            .query_map([cat_id], |row| {
                let competidor_id: i64 = row.get(0)?;
                Ok((
                    CompetidorKata {
                        nombre: row.get(1)?,
                        edad: row.get(2)?,
                        puntaje_final: row.get(3)?,
                        puntajes_jueces: vec![],
                        descalificado: row.get(4)?,
                    },
                    competidor_id,
                ))
            })
            .map_err(|e| format!("Error ejecutando consulta de competidores: {}", e))?;

        for competidor_result in competidores {
            let (mut competidor, comp_id) =
                competidor_result.map_err(|e| format!("Error procesando competidor: {}", e))?;

            // Obtener puntajes de jueces
            let mut stmt_puntajes = conn
                .prepare(
                    "SELECT puntaje FROM puntajes_jueces WHERE competidor_id = ? ORDER BY juez_numero",
                )
                .map_err(|e| format!("Error preparando consulta de puntajes: {}", e))?;

            let puntajes = stmt_puntajes
                .query_map([comp_id], |row| row.get(0))
                .map_err(|e| format!("Error ejecutando consulta de puntajes: {}", e))?;

            for puntaje in puntajes {
                competidor
                    .puntajes_jueces
                    .push(puntaje.map_err(|e| e.to_string())?);
            }

            competencia.competidores.push(competidor);
        }
    }

    Ok(competencia)
}

/// Elimina una competencia del historial
#[tauri::command]
pub async fn eliminar_competencia(
    db: State<'_, DbConnection>,
    competencia_id: i64,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM competencias WHERE id = ?", params![competencia_id])
        .map_err(|e| format!("Error eliminando competencia: {}", e))?;

    Ok(())
}
