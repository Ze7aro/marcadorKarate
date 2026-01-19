import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CompetenciaKata } from '@/types';

interface KataStats {
  totalCompetencias: number;
  totalCompetidores: number;
  ultimaCompetencia: string | null;
  competenciasPorArea: Record<string, number>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener estadísticas del historial de competencias Kata
 */
export function useKataStats() {
  const [stats, setStats] = useState<KataStats>({
    totalCompetencias: 0,
    totalCompetidores: 0,
    ultimaCompetencia: null,
    competenciasPorArea: {},
    loading: true,
    error: null,
  });

  const loadStats = async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Obtener todas las competencias (con límite alto)
      const competencias = await invoke<CompetenciaKata[]>(
        'obtener_historial_competencias',
        { limit: 1000 }
      );

      // Calcular estadísticas
      const totalCompetencias = competencias.length;
      let totalCompetidores = 0;
      const competenciasPorArea: Record<string, number> = {};

      competencias.forEach((comp) => {
        totalCompetidores += comp.competidores?.length || 0;

        if (comp.area) {
          competenciasPorArea[comp.area] = (competenciasPorArea[comp.area] || 0) + 1;
        }
      });

      // Obtener última competencia
      const ultimaCompetencia =
        competencias.length > 0 ? competencias[0].fecha : null;

      setStats({
        totalCompetencias,
        totalCompetidores,
        ultimaCompetencia,
        competenciasPorArea,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: 'Error al cargar estadísticas',
      }));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { ...stats, refresh: loadStats };
}
