import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook para usar BroadcastChannel API (comunicación entre ventanas web)
 * Este es el fallback cuando no se está ejecutando en Tauri
 *
 * @param channelName - Nombre del canal de broadcast
 * @param onMessage - Callback que se ejecuta cuando se recibe un mensaje
 * @returns Función para enviar mensajes
 */
export function useBroadcastChannel<T = any>(
  channelName: string,
  onMessage?: (data: T) => void
) {
  const onMessageRef = useRef(onMessage);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Actualizar ref cuando cambia el callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Configurar BroadcastChannel
  useEffect(() => {
    // Verificar si BroadcastChannel está disponible
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not available in this environment');
      return;
    }

    try {
      // Crear canal
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;

      // Configurar listener
      channel.onmessage = (event) => {
        if (onMessageRef.current) {
          onMessageRef.current(event.data);
        }
      };

      // Cleanup
      return () => {
        channel.close();
        channelRef.current = null;
      };
    } catch (error) {
      console.error(`Error creating BroadcastChannel "${channelName}":`, error);
    }
  }, [channelName]);

  // Función para enviar mensajes
  const postMessage = useCallback(
    (data: T) => {
      try {
        if (channelRef.current) {
          channelRef.current.postMessage(data);
        } else {
          console.warn(`BroadcastChannel "${channelName}" not initialized`);
        }
      } catch (error) {
        console.error(`Error posting message to "${channelName}":`, error);
      }
    },
    [channelName]
  );

  return postMessage;
}
