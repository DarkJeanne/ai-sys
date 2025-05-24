import { useRef, useEffect, useState, useCallback } from 'react';

export default function useVideoStreamer({ endpoint = 'ws://localhost:8000/ws/video_stream', onResult }) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return; // Đã kết nối hoặc đang kết nối
    }

    wsRef.current = new WebSocket(endpoint);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      if (onResult) onResult(data);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Nếu muốn tự động reconnect có thể thêm logic ở đây
    };

    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [endpoint, onResult]);

  // Gửi frame dạng Base64 (string) chuyển sang Blob rồi gửi WS
  const sendFrame = useCallback((base64Frame) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Convert base64 to Blob
      const byteString = atob(base64Frame.split(',')[1]);
      const mimeString = base64Frame.split(',')[0].split(':')[1].split(';')[0];
      const buffer = new ArrayBuffer(byteString.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < byteString.length; i++) {
        view[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([buffer], { type: mimeString });

      wsRef.current.send(blob);
    }
  }, []);

  // Gửi thông báo kết thúc video và đóng kết nối
  const sendEOFAndClose = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'EOF' }));
      wsRef.current.close();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connectWebSocket, sendFrame, sendEOFAndClose, disconnect, isConnected };
}