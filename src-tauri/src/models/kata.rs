use serde::{Deserialize, Serialize};

/// Estructura para representar un competidor de Kata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompetidorKata {
    pub nombre: String,
    pub edad: i32,
    pub puntaje_final: Option<f64>,
    pub puntajes_jueces: Vec<f64>,
    pub descalificado: bool,
}

/// Estructura para una competencia de Kata guardada
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompetenciaKata {
    pub id: Option<i64>,
    pub nombre: String,
    pub fecha: String,
    pub area: String,
    pub categoria: String,
    pub competidores: Vec<CompetidorKata>,
}

/// Estructura para guardar una nueva competencia
#[derive(Debug, Clone, Deserialize)]
pub struct GuardarCompetenciaRequest {
    pub nombre: String,
    pub fecha: String,
    pub area: String,
    pub categoria: String,
    pub competidores: Vec<CompetidorKata>,
}

/*#[derive(Debug, Clone, Serialize)]
pub struct GuardarCompetenciaResponse {
    pub id: i64,
    pub mensaje: String,
} */
