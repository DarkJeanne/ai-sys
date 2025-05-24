// hooks/usePolling.js
import { useRef, useState, useCallback } from 'react';

const usePolling = (intervalSec = 5) => {
  const intervalIdRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback((callback) => {
    if (intervalIdRef.current || typeof callback !== 'function') return;

    console.log('⏱️ Bắt đầu polling...');

    intervalIdRef.current = setInterval(() => {
      console.log('🔁 Tick polling frame...');
      callback();
    }, intervalSec * 1000)  ;

    setIsPolling(true);
  }, [intervalSec]);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      console.log('🛑 Dừng polling...');
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return {
    startPolling,
    stopPolling,
    isPolling,
  };
};

export default usePolling;
