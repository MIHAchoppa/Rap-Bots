import { useState, useRef, useCallback, useEffect } from 'react';

interface SFXConfig {
  crowdReactions: {
    enabled: boolean;
    volume: number;
    reactionTypes: string[];
  };
  roundBell: {
    enabled: boolean;
    volume: number;
    bellType: 'boxing' | 'tournament' | 'classic';
  };
  endingEffects: {
    enabled: boolean;
    volume: number;
    effectTypes: string[];
  };
}

interface SFXManagerHook {
  playRoundStartBell: () => void;
  playCrowdReaction: (intensity?: 'mild' | 'medium' | 'wild') => void;
  playIntelligentCrowdReaction: (lyrics: string, context?: {
    previousLyrics?: string;
    battlePhase?: 'opening' | 'middle' | 'closing';
    userPerformanceScore?: number;
  }) => void;
  playEndingEffect: (type?: 'victory' | 'defeat' | 'draw') => void;
  stopAllSFX: () => void;
  config: SFXConfig;
  updateConfig: (newConfig: Partial<SFXConfig>) => void;
  isPlaying: boolean;
  currentlyPlaying: string | null;
  enableRealtimeCrowdReactions: (enabled: boolean) => void;
  triggerCrowdOnSpeech: () => void;
  analyzeWordsForTriggers: (words: string) => void;
}

export function useSFXManager(): SFXManagerHook {
  const [config, setConfig] = useState<SFXConfig>({
    crowdReactions: {
      enabled: true,
      volume: 0.08,  // 60% quieter - very subtle crowd reactions
      reactionTypes: ['cheer', 'wild', 'hype', 'reaction', 'crowd-going-wild']
    },
    roundBell: {
      enabled: true,
      volume: 0.8,
      bellType: 'boxing'
    },
    endingEffects: {
      enabled: true,
      volume: 0.9,
      effectTypes: ['airhorn-long', 'airhorn-triple', 'dj-airhorn', 'victory-horn']
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [realtimeCrowdEnabled, setRealtimeCrowdEnabled] = useState(true);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const crowdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechDetectionRef = useRef<boolean>(false);

  // Create Web Audio API context for programmatic sound generation
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize Web Audio API
  useEffect(() => {
    const initializeWebAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('⚠️ Web Audio API not supported, SFX disabled');
      }
    };
    
    initializeWebAudio();
  }, []);

  // Play audio files from object storage or fallback to Web Audio API
  const playAudioFile = useCallback(async (type: string, volume: number) => {
    setIsPlaying(true);
    setCurrentlyPlaying(type);

    // Try to load from object storage first
    let audioUrl = '';
    
    switch (type) {
      case 'round-bell':
        audioUrl = '/api/sfx/boxing-bell.mp3';
        break;
      case 'crowd-mild':
      case 'crowd-medium':
      case 'crowd-wild':
        audioUrl = '/api/sfx/crowd-reaction.mp3';
        break;
      case 'ending-victory':
      case 'ending-defeat':
      case 'ending-draw':
        audioUrl = '/api/sfx/air-horn.mp3';
        break;
    }

    try {
      // Try to play the uploaded audio file
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentlyPlaying(null);
      };
      
      audio.onerror = () => {
        generateFallbackSFX(type, volume);
      };
      
      await audio.play();
      
    } catch (error) {
      generateFallbackSFX(type, volume);
    }
  }, []);

  // Fallback Web Audio API generation
  const generateFallbackSFX = useCallback((type: string, volume: number) => {
    if (!audioContextRef.current) {
      console.warn('⚠️ Web Audio API not available');
      return;
    }

    const ctx = audioContextRef.current;
    const duration = type.includes('bell') ? 0.8 : type.includes('crowd') ? 0.3 : 2.0;  // Cut crowd duration in half

    if (type === 'round-bell') {
      // Boxing bell: metallic ring
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
      
    } else if (type.includes('crowd')) {
      // Crowd noise: filtered white noise
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
      
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      source.start(ctx.currentTime);
      
    } else if (type.includes('ending')) {
      // Air horn: harsh harmonic tone
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator1.frequency.value = 440;
      oscillator2.frequency.value = 880;
      oscillator1.type = 'sawtooth';
      oscillator2.type = 'square';
      
      gainNode.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator1.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator1.stop(ctx.currentTime + duration);
      oscillator2.stop(ctx.currentTime + duration);
    }

    // Reset playing state after duration
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    }, duration * 1000);
  }, []);

  const playRoundStartBell = useCallback(() => {
    if (!config.roundBell.enabled) return;
    playAudioFile('round-bell', config.roundBell.volume);
  }, [config.roundBell, playAudioFile]);

  const playCrowdReaction = useCallback((intensity: 'mild' | 'medium' | 'wild' = 'medium') => {
    if (!config.crowdReactions.enabled) return;
    
    playAudioFile(`crowd-${intensity}`, config.crowdReactions.volume);
  }, [config.crowdReactions, playAudioFile]);

  const playEndingEffect = useCallback((type: 'victory' | 'defeat' | 'draw' = 'victory') => {
    if (!config.endingEffects.enabled) return;
    
    playAudioFile(`ending-${type}`, config.endingEffects.volume);
  }, [config.endingEffects, playAudioFile]);

  const stopAllSFX = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
    setCurrentlyPlaying(null);
    
    if (crowdTimerRef.current) {
      clearInterval(crowdTimerRef.current);
      crowdTimerRef.current = null;
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<SFXConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  }, []);

  // 🎯 100% AI-POWERED Real-time crowd reaction system - NO RANDOM/FAKE REACTIONS
  const enableRealtimeCrowdReactions = useCallback((enabled: boolean) => {
    setRealtimeCrowdEnabled(enabled);
    
    if (enabled && config.crowdReactions.enabled) {
      // REMOVED: All random/fake crowd reactions during speech
      // Only intelligent AI analysis will trigger reactions
    } else {
      if (crowdTimerRef.current) {
        clearInterval(crowdTimerRef.current);
        crowdTimerRef.current = null;
      }
    }
  }, [config.crowdReactions.enabled]);

  const triggerCrowdOnSpeech = useCallback(() => {
    speechDetectionRef.current = true;
    
    // 🎯 WORD-TRIGGERED ONLY: No timed reactions - only triggered by specific words/phrases
    
    // REMOVED: All timing-based crowd reactions
    // Crowd will ONLY react to specific trigger words detected in real-time transcription
    
    // Reset speech detection after recording ends
    setTimeout(() => {
      speechDetectionRef.current = false;
    }, 8000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSFX();
    };
  }, [stopAllSFX]);

  // REAL-TIME word-triggered crowd reactions
  const analyzeWordsForTriggers = useCallback((words: string) => {
    if (!config.crowdReactions.enabled) return;
    
    const lowerWords = words.toLowerCase();
    
    // DESTRUCTION WORDS - Instant wild reaction
    const destructionWords = /\b(kill|murder|destroy|demolish|wreck|finish|slay|slaughter|massacre|eliminate|annihilate|obliterate|devastate|erase|delete)\b/i;
    if (destructionWords.test(lowerWords)) {
      playCrowdReaction('wild');
      return;
    }
    
    // VICTORY WORDS - Instant wild reaction
    const victoryWords = /\b(mic drop|game over|checkmate|done deal|case closed|lights out|victory|winner|champion|conquered|dominated|owned)\b/i;
    if (victoryWords.test(lowerWords)) {
      playCrowdReaction('wild');
      return;
    }
    
    // HEAT WORDS - Medium reaction
    const heatWords = /\b(fire|flames|burning|heat|blazing|inferno|torch|roast|hot|heated|steaming|smoking|sizzling|scorching)\b/i;
    if (heatWords.test(lowerWords)) {
      playCrowdReaction('medium');
      return;
    }
    
    // INTENSITY WORDS - Medium reaction
    const intensityWords = /\b(savage|brutal|ruthless|vicious|deadly|lethal|killer|beast|monster|demon|devil|nightmare|terror|horror)\b/i;
    if (intensityWords.test(lowerWords)) {
      playCrowdReaction('medium');
      return;
    }
    
    // BATTLE WORDS - Mild reaction
    const battleWords = /\b(step to me|come at me|try me|test me|bring it|face me|challenge|next level|different league|schooling|amateur)\b/i;
    if (battleWords.test(lowerWords)) {
      playCrowdReaction('mild');
      return;
    }
    
    // PERSONAL ATTACK WORDS - Shocked gasps
    const attackWords = /\b(your mama|your girl|your crew|your family|weak|trash|garbage|pathetic|terrible|awful|wack|basic|lame)\b/i;
    if (attackWords.test(lowerWords)) {
      playCrowdReaction('medium'); // Use medium for shocked gasps
      return;
    }
    
  }, [config.crowdReactions.enabled, playCrowdReaction]);

  // Intelligent crowd reaction based on lyrical content
  const playIntelligentCrowdReaction = useCallback(async (lyrics: string, context?: {
    previousLyrics?: string;
    battlePhase?: 'opening' | 'middle' | 'closing';
    userPerformanceScore?: number;
  }) => {
    if (!config.crowdReactions.enabled) return;

    try {
      
      const response = await fetch('/api/crowd-reaction/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, context })
      });
      
      if (!response.ok) {
        console.warn('Failed to get intelligent crowd reaction - NO fallback reaction triggered');
        return;
      }
      
      const analysis = await response.json();
      
      // STRICT: Only trigger reactions for genuinely impressive content
      const sfxIntensity = analysis.reactionType === 'silence' ? null :
                          analysis.reactionType === 'wild_cheering' ? 'wild' :
                          analysis.reactionType === 'hype' ? 'medium' : 
                          analysis.reactionType === 'mild_approval' ? 'mild' : null;
      
      // Double-check: Don't play reactions for low intensity scores
      if (sfxIntensity && analysis.intensity < 40) {
        return;
      }
      
      if (sfxIntensity) {
        // Apply intelligent timing
        const delay = analysis.timing === 'immediate' ? 100 :
                     analysis.timing === 'delayed' ? 800 : 400;
        
        setTimeout(() => {
          playCrowdReaction(sfxIntensity);
        }, delay);
      } else {
      }
      
    } catch (error) {
      console.error('Error with intelligent crowd reaction:', error);
      // NO FALLBACK - Only word-triggered reactions allowed
    }
  }, [config.crowdReactions, playCrowdReaction]);

  return {
    playRoundStartBell,
    playCrowdReaction,
    playIntelligentCrowdReaction,
    playEndingEffect,
    stopAllSFX,
    config,
    updateConfig,
    isPlaying,
    currentlyPlaying,
    enableRealtimeCrowdReactions,
    triggerCrowdOnSpeech,
    analyzeWordsForTriggers
  };
}