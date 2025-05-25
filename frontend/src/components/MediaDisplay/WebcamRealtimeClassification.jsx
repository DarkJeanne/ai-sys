import React, { useRef, useEffect, useState } from 'react';

export default function WebcamRealtimeClassification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [detection, setDetection] = useState({
    classification: '',
    confidence: 0,
    bounding_box: [] // [x1, y1, x2, y2]
  });

  useEffect(() => {
    console.log("Detection bbox:", detection.bounding_box);
    // Mở webcam
    async function startCamera() {
      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      }
    }
    startCamera();

    // Mở websocket
    const ws = new WebSocket('ws://localhost:8000/classify/ws/camera');
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
      // Nhận kết quả classification dạng JSON
      const data = JSON.parse(event.data);
      setDetection({
        classification: data.classification,
        confidence: data.confidence,
        bounding_box: data.bounding_box || []
      });
    };
    wsRef.current = ws;

  }, []);


  const inputWidth = 320;
  const inputHeight = 240;
  // Vẽ bounding box lên canvas mỗi khi detection hoặc video thay đổi
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');

    // Kích thước video thực tế
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      // Video chưa sẵn sàng
      return;
    }

    // Cập nhật kích thước canvas theo kích thước video thực tế
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection.bounding_box.length === 4) {
      const [x1, y1, x2, y2] = detection.bounding_box;

      // Backend trả bounding box theo ảnh 640x480, scale về video hiện tại
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

      // Vẽ label trên hoặc dưới bbox tuỳ vị trí bbox
      ctx.fillText(label, boxX, boxY > 20 ? boxY - 5 : boxY + 20);
    }
  }, [detection]);


  // Gửi frame webcam lên server qua websocket (mỗi 100ms hoặc tuỳ ý)
  useEffect(() => {
    if (!wsConnected) return;
    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Lấy data url dạng base64 (jpeg)
      const dataUrl = canvas.toDataURL('image/jpeg');
      // Bỏ phần "data:image/jpeg;base64,"
      const base64Data = dataUrl.split(',')[1];

      // Gửi lên websocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(base64Data);
      }
    }, 100); // 100ms = 10fps

    return () => clearInterval(interval);
  }, [wsConnected]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        onError && onError(err);
      }
    };

    startWebcam();

    return () => {
      // Tắt webcam khi unmount
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);


  return (
    <div style={{ position: 'relative', width: '550px', height: '480px' }}>
      <video
        id="webcam-video" // 👈 Thêm dòng này
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
