import { useEffect, useRef, useState } from "react";

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      setIsReady(true);
    }
    return audioContextRef.current;
  };

  return {
    audioContext: audioContextRef.current,
    isReady,
    initializeAudioContext,
  };
}
