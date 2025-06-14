import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function WebcamRealtimeClassification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null); // Lưu stream để dừng khi cần

  const [wsConnected, setWsConnected] = useState(false);
  const [detection, setDetection] = useState({
    classification: '',
    confidence: 0,
    bounding_box: [] // [x1, y1, x2, y2]
  });

  const { user } = useAuth();
  const token = user?.token || localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    console.log("Detection bbox:", detection.bounding_box);
    // Mở webcam
    async function startCamera() {
      if (navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing webcam:", error);
        }
      }
    }
    startCamera();

    if (!token) {
      console.error("❌ Access token not found");
      return;
    }

    const wsUrl =
      (window.location.protocol === 'https:' ? 'wss' : 'ws') +
      '://localhost:8000/classify/ws/camera?token=' +
      encodeURIComponent(token);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
    };
    ws.onerror = (e) => {
      console.error('WebSocket error', e);
      setWsConnected(false);
    };
    ws.onclose = () => {
      console.log('WebSocket closed');
      setWsConnected(false);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setDetection({
        classification: data.classification,
        confidence: data.confidence,
        bounding_box: data.bounding_box || []
      });
    };
    wsRef.current = ws;

    return () => {
      // Dừng webcam khi unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Đóng websocket khi unmount
      const ws = wsRef.current;
      if (!ws) return;

      const state = ws.readyState;
      console.log('🧹 Cleanup: websocket state =', state);

      if (state === WebSocket.CONNECTING) {
        ws.addEventListener('open', () => {
          console.log('🧹 Delayed close after CONNECTING...');
          ws.close();
        });
      } else if (state === WebSocket.OPEN) {
        console.log('🧹 Closing OPEN WebSocket...');
        ws.close();
      } else {
        console.log('🧹 No need to close: WebSocket already closing/closed');
      }
      wsRef.current = null;
    };
  }, [token]);

  // Phần vẽ bounding box lên canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection.bounding_box.length === 4) {
      const [x1, y1, x2, y2] = detection.bounding_box;

      const scaleX = videoWidth / 640;
      const scaleY = videoHeight / 480;

      const boxX = x1 * scaleX;
      const boxY = y1 * scaleY;
      const boxWidth = (x2 - x1) * scaleX;
      const boxHeight = (y2 - y1) * scaleY;

      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.font = '20px Arial';
      ctx.fillStyle = 'lime';
      const label = `${detection.classification} (${detection.confidence.toFixed(2)}%)`;
      ctx.fillText(label, boxX, boxY > 20 ? boxY - 5 : boxY + 20);
    }
  }, [detection]);

  // Gửi frame webcam lên server qua websocket mỗi 100ms
  useEffect(() => {
    if (!wsConnected) return;
    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Data = dataUrl.split(',')[1];

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(base64Data);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [wsConnected]);

  return (
    <div style={{ position: 'relative', width: '550px', height: '500px' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '640px', height: '480px' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '640px', height: '480px' }}
      />
    </div>
  );
}