import { useState, useCallback, useRef } from 'react';
import usePolling from './usePolling';

const useVideoFileProcessor = (frameRate = 5, onFrame) => {
  const [videoFile, setVideoFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const { startPolling, stopPolling, isPolling } = usePolling(frameRate);

  const loadVideo = useCallback((file) => {
    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setVideoFile(file);
      videoRef.current = video;
      setCurrentTime(0);
    };

    video.onerror = (error) => {
      console.error('Error loading video:', error);
      setVideoFile(null);
      setDuration(0);
    };
  }, []);

  const captureFrame = useCallback((time) => {
    if (!videoRef.current) return Promise.resolve(null);

    return new Promise((resolve) => {
      const video = videoRef.current;

      const handleSeeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg', 0.7); // giảm chất lượng nếu cần
        canvas.remove();

        video.removeEventListener('seeked', handleSeeked);
        resolve(frameData);
      };

      video.addEventListener('seeked', handleSeeked);
      video.currentTime = time;
    });
  }, []);

  const startProcessing = useCallback(() => {
    if (!videoRef.current || isPlaying) return;

    setIsPlaying(true);

    startPolling(async () => {
      if (currentTime >= duration) {
        setIsPlaying(false);
        stopPolling();
        return null;
      }

      const frame = await captureFrame(currentTime);

      if (frame && typeof onFrame === 'function') {
        onFrame(frame);
      }

      setCurrentTime((prev) => {
        const next = prev + 1 / frameRate;
        return next >= duration ? duration : next;
      });

      return frame;
    });
  }, [captureFrame, currentTime, duration, frameRate, isPlaying, startPolling, stopPolling, onFrame]);

  const stopProcessing = useCallback(() => {
    setIsPlaying(false);
    stopPolling();
  }, [stopPolling]);

  const seekTo = useCallback((time) => {
    if (!videoRef.current) return;
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current = null;
    }
    stopProcessing();
  }, [stopProcessing]);

  return {
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
  };
};

export default useVideoFileProcessor;
