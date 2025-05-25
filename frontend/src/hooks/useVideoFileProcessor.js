import { useState, useCallback, useRef } from 'react';

const useVideoFileProcessor = (frameRate = 5) => {
  const [videoFile, setVideoFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const videoRef = useRef(null);

  const loadVideo = useCallback((file) => {
    if (!file) return;
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      videoRef.current = video; // Đặt trước
      setDuration(video.duration);
      setVideoFile(file); // Sau cùng để tránh render khi chưa sẵn sàng
    };
  }, []);

  const captureFrame = useCallback((time) => {
    if (!videoRef.current) return null;
    return new Promise((resolve) => {
      const video = videoRef.current;

      const handler = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg');
        canvas.remove();
        video.removeEventListener('seeked', handler);
        resolve(frameData);
      };

      video.addEventListener('seeked', handler);
      video.currentTime = time;
    });
  }, []);

  // Gửi 1 frame lên backend
  const sendFrameToBackend = useCallback(async (frameData) => {
    if (!frameData) return;
    try {
      const response = await fetch('http://localhost:8000/classify/api/process_frame', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: frameData }),
      });
      if (!response.ok) {
        console.error('Failed to send frame:', response.statusText);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error sending frame to backend:', error);
      return null;
    }
  }, []);

  // Lấy video đã xử lý về frontend
  const fetchProcessedVideo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/classify/api/get_processed_video');
      if (!response.ok) {
        console.error('Failed to fetch processed video');
        return null;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedVideoUrl(url);
    } catch (error) {
      console.error('Error fetching processed video:', error);
    }
  }, []);

  // Bắt đầu xử lý video từng frame
  const startProcessing = useCallback(async () => {
    if (!videoRef.current || isPlaying) return;
    if (duration === 0) {
      console.warn('Video chưa load xong, duration = 0');
      return;
    }

    setIsPlaying(true);

    try {
      const totalFrames = Math.min(20, Math.floor(duration * frameRate));
      let time = 0;

      for (let i = 0; i < totalFrames; i++) {
        const frame = await captureFrame(time);
        if (frame) {
          const res = await sendFrameToBackend(frame);
          if (res?.msg === "Video created") {
            break;
          }
        }
        time += 1 / frameRate;
        if (time > duration) break;
      }

      await fetchProcessedVideo();
    } catch (error) {
      console.error('Lỗi trong quá trình xử lý video:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [captureFrame, duration, frameRate, isPlaying, sendFrameToBackend, fetchProcessedVideo]);

  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current = null;
    }
    setVideoFile(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setProcessedVideoUrl(null);
  }, []);

  return {
    videoFile,
    currentTime,
    duration,
    isPlaying,
    processedVideoUrl,
    loadVideo,
    startProcessing,
    cleanup,
  };
};

export default useVideoFileProcessor;
