import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gestionar estado persistente en localStorage
 * Sincroniza automáticamente entre tabs/ventanas usando eventos personalizados
 *
 * @param key - Clave de localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permitir que value sea una función para tener la misma API que useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Guardar estado
        setStoredValue(valueToStore);

        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          // Emitir evento personalizado para sincronizar entre ventanas
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        // Emitir evento de eliminación
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios en storage (desde otras tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        // Evento nativo de storage (otras tabs)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      } else if ('detail' in e) {
        // Evento personalizado (misma ventana, otras instancias)
        const detail = e.detail as { key: string; value: any };
        if (detail.key === key) {
          setStoredValue(detail.value !== undefined ? detail.value : initialValue);
        }
      }
    };

    // Escuchar ambos tipos de eventos
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
