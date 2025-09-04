import { useState, useEffect, useRef } from "react";
import { Settings, Smile, Flame, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BattleCharacter } from "@shared/characters";
import { AdvancedLipSync } from "./advanced-lip-sync";
import { SimpleAudioPlayer } from "./simple-audio-player";

interface BattleAvatarProps {
  isAISpeaking: boolean;
  battleState?: "idle" | "battle" | "mad" | "victory" | "defeat";
  audioUrl?: string;
  className?: string;
  character?: BattleCharacter;
}

interface LipSyncData {
  mouthOpenness: number;
  jawRotation: number;
  lipCornerPull: number;
  tongueTip: number;
  intensity: number;
}

export function BattleAvatar({ 
  isAISpeaking, 
  battleState = "idle",
  audioUrl,
  className = "",
  character
}: BattleAvatarProps) {
  const [currentEmotion, setCurrentEmotion] = useState<"neutral" | "angry" | "happy">("neutral");
  const [lipSyncLevel, setLipSyncLevel] = useState(0);
  const [mouthShape, setMouthShape] = useState<"closed" | "small" | "medium" | "large">("closed");
  const [lipSyncData, setLipSyncData] = useState<LipSyncData>({
    mouthOpenness: 0,
    jawRotation: 0,
    lipCornerPull: 0,
    tongueTip: 0,
    intensity: 0
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Update avatar emotion based on battle state
    switch (battleState) {
      case "mad":
        setCurrentEmotion("angry");
        break;
      case "victory":
        setCurrentEmotion("happy");
        break;
      case "defeat":
        setCurrentEmotion("angry");
        break;
      default:
        setCurrentEmotion("neutral");
    }
  }, [battleState]);

  // Remove duplicate audio system - let AdvancedLipSync handle everything
  useEffect(() => {
    if (!isAISpeaking) {
      setMouthShape("closed");
      setLipSyncLevel(0);
      setCurrentEmotion("neutral");
    }
  }, [isAISpeaking]);

  const getAvatarStateColor = () => {
    switch (battleState) {
      case "battle":
        return "bg-accent-red";
      case "mad":
        return "bg-red-600";
      case "victory":
        return "bg-accent-gold";
      case "defeat":
        return "bg-gray-600";
      default:
        return "bg-accent-blue";
    }
  };

  const getAvatarStateIcon = () => {
    switch (battleState) {
      case "battle":
      case "mad":
        return <Flame className="text-white text-sm" size={12} />;
      case "victory":
        return "🏆";
      case "defeat":
        return "😤";
      default:
        return "🤖";
    }
  };

  return (
    <div className={`bg-battle-gray rounded-xl p-6 border border-gray-700 text-center ${className}`}>
      <div className="mb-4">
        <div className="text-lg font-orbitron font-bold text-accent-red" data-testid="text-ai-title">
          {character?.displayName || "AI CHALLENGER"}
        </div>
        <div className="text-sm text-gray-400" data-testid="text-ai-level">
          {character?.difficulty ? `${character.difficulty.toUpperCase()} MODE` : "HARDCORE MODE"} • {character?.style || "AI Voice"}
        </div>
      </div>

      {/* Avatar Container */}
      <div className="relative mx-auto w-48 h-48 mb-6">
        {/* Avatar Image/Representation */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-accent-gold overflow-hidden relative bg-gradient-to-br from-accent-blue to-accent-red"
          animate={isAISpeaking ? {
            scale: [1, 1.05, 1],
            borderColor: ["var(--accent-gold)", "var(--accent-red)", "var(--accent-gold)"]
          } : {}}
          transition={{
            duration: 0.8,
            repeat: isAISpeaking ? Infinity : 0,
            ease: "easeInOut"
          }}
          data-testid="avatar-ai-character"
        >
          {/* Character Avatar Image with Real Lip Sync Animation */}
          {character?.avatar ? (
            <motion.img
              src={`/attached_assets/generated_images/${character.avatar}`}
              alt={character.displayName}
              className="w-full h-full object-cover"
              animate={{
                // More pronounced avatar animation based on lip sync data
                scaleY: isAISpeaking ? (1 + (lipSyncData.mouthOpenness * 0.02)) : 1,
                scaleX: isAISpeaking ? (1 + (lipSyncData.lipCornerPull * 0.008)) : 1,
                transformOrigin: "center 70%", // Focus on mouth area
                filter: isAISpeaking ? 
                  `brightness(${1 + lipSyncData.intensity * 0.02}) contrast(${1 + lipSyncData.intensity * 0.015}) saturate(${1 + lipSyncData.intensity * 0.01})` : 
                  'brightness(1) contrast(1) saturate(1)'
              }}
              transition={{ duration: 0.08, ease: "easeOut" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-white">
              🤖
            </div>
          )}

          {/* Real Avatar Lip Sync Component - Provides data only, no audio playback */}
          {character?.avatar && audioUrl && (
            <AdvancedLipSync
              audioUrl={audioUrl}
              isPlaying={isAISpeaking}
              avatarImageUrl={`/attached_assets/generated_images/${character.avatar}`}
              onLipSyncData={(data) => {
                setLipSyncData(data);
                // Update legacy mouth shapes for fallback
                if (data.mouthOpenness > 0.7) setMouthShape("large");
                else if (data.mouthOpenness > 0.4) setMouthShape("medium");
                else if (data.mouthOpenness > 0.1) setMouthShape("small");
                else setMouthShape("closed");
                setLipSyncLevel(data.intensity / 100);
              }}
              disableAudioPlayback={true}
            />
          )}
          
          {/* Dedicated Audio Player for TTS - FORCED AUTOPLAY */}
          <SimpleAudioPlayer 
            audioUrl={audioUrl}
            autoPlay={true}  // FORCE auto-play ALL AI responses
            volume={1.0}
            onPlay={() => {
              console.log('🔥 FORCED TTS Audio started - AI is now speaking!');
              // setIsAISpeaking(true); // State managed by parent component
            }}
            onEnded={() => {
              console.log('🔇 TTS Audio ended - AI finished speaking');
            }}
          />
          
          {/* Subtle visual feedback when speaking */}
          {isAISpeaking && (
            <motion.div 
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  `0 0 0px rgba(${character?.id === 'razor' ? '239, 68, 68' : 
                                  character?.id === 'venom' ? '34, 197, 94' : '59, 130, 246'}, 0)`,
                  `0 0 30px rgba(${character?.id === 'razor' ? '239, 68, 68' : 
                                   character?.id === 'venom' ? '34, 197, 94' : '59, 130, 246'}, 0.2)`,
                  `0 0 0px rgba(${character?.id === 'razor' ? '239, 68, 68' : 
                                  character?.id === 'venom' ? '34, 197, 94' : '59, 130, 246'}, 0)`
                ]
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}

          {/* Fallback AI Character Face for non-character avatars */}
          {!character?.avatar && (
            <div className="text-white relative flex items-center justify-center h-full">
              {/* Eyes */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  currentEmotion === "angry" ? "bg-red-500" : 
                  currentEmotion === "happy" ? "bg-green-500" : "bg-blue-400"
                }`} />
                <div className={`w-4 h-4 rounded-full ${
                  currentEmotion === "angry" ? "bg-red-500" : 
                  currentEmotion === "happy" ? "bg-green-500" : "bg-blue-400"
                }`} />
              </div>
              
              {/* Animated Mouth for Lip Sync */}
              <motion.div 
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
                animate={{
                  scaleY: mouthShape === "large" ? 1.8 : 
                          mouthShape === "medium" ? 1.4 : 
                          mouthShape === "small" ? 1.1 : 1,
                  scaleX: mouthShape === "large" ? 1.3 : 
                          mouthShape === "medium" ? 1.2 : 
                          mouthShape === "small" ? 1.1 : 1,
                }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              >
                <div className={`rounded-full ${
                  mouthShape === "closed" ? "w-3 h-1 bg-gray-700" :
                  mouthShape === "small" ? "w-4 h-2 bg-gray-800" :
                  mouthShape === "medium" ? "w-5 h-3 bg-gray-900" :
                  "w-6 h-4 bg-black"
                } transition-all duration-100`} />
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Battle Status Indicator */}
      <div className="flex justify-center mb-4">
        <div className={`rounded-full px-3 py-1 text-xs font-bold flex items-center space-x-1 ${getAvatarStateColor()}`}>
          <span>{getAvatarStateIcon()}</span>
          <span className="text-white">
            {battleState === "idle" ? "READY" : 
             battleState === "battle" ? "BATTLING" :
             battleState === "mad" ? "ANGRY" :
             battleState === "victory" ? "VICTORY" : "DEFEATED"}
          </span>
        </div>
      </div>

      {/* Audio Controls */}
      {audioUrl && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-battle-dark hover:bg-battle-gray border border-gray-600"
            data-testid="button-audio-controls"
          >
            <Volume2 size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}