import { useTauriEvent } from './useTauriEvent';
import { useBroadcastChannel } from './useBroadcastChannel';

/**
 * Hook que detecta el entorno y usa el sistema de comunicación apropiado
 * - En Tauri: usa el sistema de eventos de Tauri
 * - En web: usa BroadcastChannel API
 *
 * @param channelName - Nombre del canal/evento
 * @param onMessage - Callback cuando se recibe un mensaje
 * @returns Función para enviar mensajes
 */
export function useCrossPlatformChannel<T = any>(
  channelName: string,
  onMessage?: (data: T) => void
) {
  // Detectar si estamos en Tauri
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  // Usar el hook apropiado según el entorno
  const tauriPostMessage = useTauriEvent<T>(channelName, isTauri ? onMessage : undefined);
  const broadcastPostMessage = useBroadcastChannel<T>(channelName, !isTauri ? onMessage : undefined);

  // Retornar la función apropiada
  return isTauri ? tauriPostMessage : broadcastPostMessage;
}
