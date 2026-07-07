import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gestionar estado persistente en localStorage
 * Sincroniza automaticamente entre tabs/ventanas usando eventos personalizados
 *
 * @param key - Clave de localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
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

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((currentValue) => {
          const valueToStore =
            value instanceof Function ? value(currentValue) : value;

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.dispatchEvent(
              new CustomEvent('local-storage', {
                detail: { key, value: valueToStore },
              })
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      } else if ('detail' in e) {
        const detail = e.detail as { key: string; value: T | undefined };
        if (detail.key === key) {
          setStoredValue(detail.value !== undefined ? detail.value : initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
