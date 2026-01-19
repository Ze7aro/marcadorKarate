import { listen, emit, UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useCallback, useRef } from 'react';

interface TauriEventPayload<T> {
  data: T;
  timestamp: number;
}

/**
 * Hook personalizado para gestionar eventos de Tauri
 * Proporciona comunicación entre ventanas usando el sistema de eventos de Tauri
 *
 * @param eventName - Nombre del evento a escuchar/emitir
 * @param onMessage - Callback que se ejecuta cuando se recibe un mensaje
 * @returns Función para emitir mensajes
 */
export function useTauriEvent<T = any>(
  eventName: string,
  onMessage?: (data: T) => void
) {
  const onMessageRef = useRef(onMessage);

  // Actualizar ref cuando cambia el callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Configurar listener
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<TauriEventPayload<T>>(eventName, (event) => {
          if (onMessageRef.current) {
            onMessageRef.current(event.payload.data);
          }
        });
      } catch (error) {
        console.error(`Error setting up listener for "${eventName}":`, error);
      }
    };

    setupListener();

    // Cleanup
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [eventName]);

  // Función para emitir eventos
  const postMessage = useCallback(
    async (data: T) => {
      try {
        await emit(eventName, {
          data,
          timestamp: Date.now(),
        } as TauriEventPayload<T>);
      } catch (error) {
        console.error(`Error emitting event "${eventName}":`, error);
      }
    },
    [eventName]
  );

  return postMessage;
}
