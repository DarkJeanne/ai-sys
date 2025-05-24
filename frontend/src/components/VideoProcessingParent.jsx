// src/components/VideoProcessing/VideoProcessingParent.jsx
import React, { useEffect, useCallback, useRef } from 'react';
import useVideoFileProcessor from '../../hooks/useVideoFileProcessor';
import useVideoStreamer from '../../hooks/useVideoStreamer';


const VideoProcessingParent = () => {
  // Khai báo hook xử lý video file, lấy frame với tần số 5fps
  const [processedFrames, setProcessedFrames] = useState([]);
  const {
    videoFile,
    currentTime,
    duration,
    isPlaying,
    isPolling,
    loadVideo,
    startProcessing,
    stopProcessing,
    seekTo,
    cleanup,
  } = useVideoFileProcessor(5);

  // Hook WebSocket gửi frame và nhận kết quả
  const {
  connectWebSocket,
  sendFrame,
  disconnect,
  isConnected,
} = useVideoStreamer({
  endpoint: 'ws://localhost:8000/ws/video_stream',
  onResult: (result) => {
    if (result?.processed_frame) {
      setProcessedFrames(prev => [...prev, result.processed_frame]);
    }
  }
});


  // Kết nối WebSocket khi component mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnect();
      cleanup();
    };
  }, [connectWebSocket, disconnect, cleanup]);

  // Ref canvas để gửi frame
  const canvasRef = useRef(null);

  // Tạo canvas để vẽ frame từ video
  const createCanvasFromFrame = useCallback(async () => {
    if (!videoFile) return null;
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.currentTime = currentTime;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
    });
  }, [videoFile, currentTime]);

  // Khi đang polling (tức đang xử lý frame), lấy frame và gửi qua WS
  useEffect(() => {
    if (isPolling && isConnected) {
      (async () => {
        const canvas = await createCanvasFromFrame();
        if (canvas) sendFrame(canvas);
      })();
    }
  }, [isPolling, isConnected, createCanvasFromFrame, sendFrame]);

  // Xử lý khi chọn file video
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) loadVideo(file);
  };

  // Start / Stop video frame processing
  const handleStart = () => startProcessing();
  const handleStop = () => stopProcessing();

  return (
    <div>
      <h2>Video Processing & Streaming</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <div>
        <button onClick={handleStart} disabled={isPlaying || !videoFile || !isConnected}>
          Start Processing
        </button>
        <button onClick={handleStop} disabled={!isPlaying}>
          Stop Processing
        </button>
      </div>
      <div>
        <p>Video Duration: {duration.toFixed(2)} s</p>
        <p>Current Time: {currentTime.toFixed(2)} s</p>
        <p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <p>Processing: {isPolling ? 'Yes' : 'No'}</p>
      </div>
        {processedFrames.length > 0 && (
  <div>
    <h3>Processed Frames</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {processedFrames.map((frame, index) => (
        <img
          key={index}
          src={frame}
          alt={`Processed frame ${index}`}
          style={{ width: 160, borderRadius: 4, border: '1px solid #ccc' }}
        />
      ))}
    </div>
  </div>
)}

    </div>

  );
};

export default VideoProcessingParent;