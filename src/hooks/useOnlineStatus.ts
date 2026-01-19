import { useState, useEffect } from 'react';

/**
 * Hook para detectar el estado de conexión online/offline
 * @returns {boolean} true si está online, false si está offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Sin conexión');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
