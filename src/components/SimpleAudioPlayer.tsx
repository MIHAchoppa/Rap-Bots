import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { attemptAutoplay } from '@/lib/audioAutoplay';

interface SimpleAudioPlayerProps {
  audioUrl?: string;
  autoPlay?: boolean;
  volume?: number;
  onPlay?: () => void;
  onEnded?: () => void;
  showFallbackButton?: boolean;
}

export function SimpleAudioPlayer({
  audioUrl,
  autoPlay = false,
  volume = 1.0,
  onPlay,
  onEnded,
  showFallbackButton = true,
}: SimpleAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    // Clean up previous audio and listeners
    const prev = audioRef.current;
    if (prev) {
      try {
        prev.pause();
        prev.src = '';
        prev.load();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    }

    // Create new audio element with optimal settings
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    audioRef.current = audio;

    // Event handlers (keep references so we can remove them)
    const handlePlay = () => {
      setShowPlayButton(false);
      onPlay?.();
    };
    const handleEnded = () => {
      onEnded?.();
    };
    const handleError = (ev: Event) => {
      const audioError = (ev.target as HTMLAudioElement | null)?.error;
      console.error('🔊 Audio error:', ev);
      console.error('🔊 Audio error details - src:', audio.src, 'readyState:', audio.readyState, 'networkState:', audio.networkState);
      console.error('🔊 Audio error event:', audioError);
      if (showFallbackButton) {
        setShowPlayButton(true);
        setAutoplayAttempted(true);
      }
    };
    const handleLoadStart = () => {};
    const handleLoadedData = () => {};
    const handleCanPlay = () => {};
    const handleCanPlayThrough = () => {};

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    // Attempt autoplay if requested
    if (autoPlay) {
      attemptAutoplay(audio, {
        volume,
        retryAttempts: 3,
        fallbackToMuted: true,
        onFallback: () => {
          if (showFallbackButton) {
            setShowPlayButton(true);
            setAutoplayAttempted(true);
          }
        },
      })
        .then((success) => {
          if (success) {
            setShowPlayButton(false);
            onPlay?.();
          }
        })
        .catch((error) => {
          console.error('🚨 Shared manager auto-play error:', error);
          if (showFallbackButton) {
            setShowPlayButton(true);
            setAutoplayAttempted(true);
          }
        });
    }

    // Cleanup: remove listeners and pause/destroy audio
    return () => {
      try {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      } catch {
        /* ignore */
      }

      try {
        audio.pause();
        audio.src = '';
        audio.load();
      } catch {
        /* ignore */
      }

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [audioUrl, autoPlay, volume, showFallbackButton, onPlay, onEnded]);

  // Handle manual play button click
  const handleManualPlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setShowPlayButton(false);
      onPlay?.();
    } catch (error) {
      console.error('🔊 Manual play failed:', error);
      // If manual play fails, keep the fallback visible so the user can try again
      setShowPlayButton(true);
    }
  };

  // Show play button fallback when autoplay fails
  if (showPlayButton && autoplayAttempted) {
    return (
      <div className="flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 shadow-lg">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Audio playback blocked by browser</p>
          <Button
            onClick={handleManualPlay}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            data-testid="button-manual-play"
          >
            <Play className="w-4 h-4" />
            Play Audio
          </Button>
        </div>
      </div>
    );
  }

  // Hidden by default - only handles audio playback
  return null;
}