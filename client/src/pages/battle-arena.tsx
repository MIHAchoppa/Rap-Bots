import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, Trophy, Clock, Flame, Wifi, History, Share, Dumbbell, User, BarChart3 } from "lucide-react";
import { CharacterSelector } from "@/components/character-selector";
import type { BattleCharacter } from "@shared/characters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useBattleState } from "@/hooks/use-battle-state";
import { useSFXManager } from "@/hooks/useSFXManager";
import { RecordingPanel } from "@/components/recording-panel";
import { BattleAvatar } from "@/components/battle-avatar";
import { BattleTextDisplay } from "@/components/battle-text-display";
import { AudioControls } from "@/components/audio-controls";
import { LyricBreakdown } from "@/components/lyric-breakdown";
import { formatDuration } from "@/lib/audio-utils";
import { motion, AnimatePresence } from "framer-motion";
const battleArenaImage = "/images/Epic_rap_battle_arena_5a01b4d4.png";

export default function BattleArena() {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [profanityFilter, setProfanityFilter] = useState(false); // Default to uncensored for authentic battle rap
  const [lyricComplexity, setLyricComplexity] = useState(75); // Default to high quality
  const [styleIntensity, setStyleIntensity] = useState(85); // Intense style for authenticity
  const [advancedSettings, setAdvancedSettings] = useState({
    aiAggressiveness: 90, // High aggression for competitive battles
    responseTime: 2000, // Faster response for better UX
    analysisDepth: "enhanced" as const,
    voiceSpeed: 1.1, // Slightly faster for energy
    battleLength: 5
  });

  const handleAdvancedSettingsChange = (newSettings: typeof advancedSettings) => {
    setAdvancedSettings(newSettings);
  };
  const [battleTimer, setBattleTimer] = useState(105); // 1:45
  const [liveTranscription, setLiveTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [currentAiAudio, setCurrentAiAudio] = useState<string>();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<BattleCharacter | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showLyricBreakdown, setShowLyricBreakdown] = useState(false);
  const [currentAnalysisText, setCurrentAnalysisText] = useState("");

  const { toast } = useToast();
  const {
    battleState,
    battle,
    rounds,
    currentBattleId,
    isLoading,
    isProcessing,
    startNewBattle,
    updateBattleState,
    submitRound,
  } = useBattleState();

  // SFX Manager for crowd reactions, bells, and air horns
  const {
    playRoundStartBell,
    playCrowdReaction,
    playIntelligentCrowdReaction,
    playEndingEffect,
    stopAllSFX,
    enableRealtimeCrowdReactions,
    triggerCrowdOnSpeech,
    isPlaying: isSFXPlaying,
    currentlyPlaying: currentSFX
  } = useSFXManager();

  // Fetch battle history
  const { data: battleHistory = [] } = useQuery({
    queryKey: ["/api/battles"],
  });

  // Battle timer countdown
  useEffect(() => {
    if (battleState?.timeRemaining && battleState.timeRemaining > 0) {
      const timer = setInterval(async () => {
        const newTime = battleState.timeRemaining - 1;
        setBattleTimer(newTime);
        if (newTime <= 0) {
          // 🏁 BATTLE ENDING - Play ending air horn effects
          console.log('🏁 Battle ended - playing ending effects');
          const userWon = (battleState?.userScore || 0) > (battleState?.aiScore || 0);
          playEndingEffect(userWon ? 'victory' : 'defeat');
          
          // Disable real-time crowd reactions
          enableRealtimeCrowdReactions(false);
          
          // End battle
          updateBattleState({ timeRemaining: 0 });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battleState?.timeRemaining, updateBattleState]);

  // Initialize new battle on component mount
  useEffect(() => {
    if (!currentBattleId && !showCharacterSelector && !selectedCharacter) {
      setShowCharacterSelector(true);
    }
  }, [currentBattleId, showCharacterSelector, selectedCharacter]);

  const handleRecordingComplete = async (recording: { blob: Blob; duration: number; url: string }) => {
    try {
      setIsTranscribing(true);
      
      // 🤫 NO AUTO-CROWD REACTIONS - Only intelligent analysis will trigger reactions
      
      // INSTANT TRANSCRIPTION: Get transcription immediately when recording stops
      console.log('🔥 Starting instant transcription...');
      
      if (currentBattleId) {
        try {
          const formData = new FormData();
          formData.append('audio', recording.blob);
          
          const transcriptionResponse = await fetch(`/api/battles/${currentBattleId}/transcribe`, {
            method: 'POST',
            body: formData,
          });
          
          if (transcriptionResponse.ok) {
            const transcriptionData = await transcriptionResponse.json();
            console.log(`✅ Instant transcription received (${transcriptionData.processingTime}ms): "${transcriptionData.userText}"`);
            
            // Show transcription immediately
            setLiveTranscription(transcriptionData.userText || "Voice input processed");
            
            // 🧠 INTELLIGENT CROWD REACTION - Analyze transcribed lyrics for appropriate reaction
            if (transcriptionData.userText) {
              console.log('🧠 Triggering intelligent crowd reaction for:', transcriptionData.userText.substring(0, 50) + '...');
              playIntelligentCrowdReaction(transcriptionData.userText, {
                battlePhase: battleState?.currentRound === 1 ? 'opening' : 
                           battleState?.currentRound === battleState?.maxRounds ? 'closing' : 'middle',
                userPerformanceScore: battleState?.userScore
              });
            }
            
            toast({
              title: "Transcription Complete!",
              description: "Processing AI response...",
            });
          }
        } catch (transcriptionError) {
          console.log('⚠️ Instant transcription failed, falling back to full processing');
        }
      }
      
      // Now start full battle processing (AI response, scoring, etc.)
      setIsTranscribing(false);
      updateBattleState({ isAIResponding: true });

      const result = await submitRound({ audio: recording.blob });
      
      if (result) {
        console.log('🎉 Full battle result received:', {
          userText: result.userText?.substring(0, 50) + '...',
          aiResponse: result.aiResponse?.substring(0, 50) + '...',
          audioUrl: result.audioUrl?.substring(0, 50) + '...',
          userScore: result.userScore,
          aiScore: result.aiScore
        });
        
        // Update transcription if we got a better one from full processing
        if (result.userText && result.userText !== liveTranscription) {
          console.log('🔄 Updating transcription:', result.userText);
          setLiveTranscription(result.userText);
        }
        
        if (result.aiResponse) {
          console.log('🤖 Setting AI response:', result.aiResponse.substring(0, 100) + '...');
          console.log('🤖 AI response length:', result.aiResponse.length);
          console.log('🤖 Current aiResponse state before setting:', aiResponse?.substring(0, 50) + '...');
          
          // Clear AI responding state FIRST
          updateBattleState({ isAIResponding: false });
          
          // Then set the AI response
          setAiResponse(result.aiResponse);
          
          console.log('🤖 AI response state should be updated now');
          
          // 🎆 Trigger crowd reaction for AI response if it's clever/impressive
          if (result.aiResponse && result.aiResponse.length > 20) {
            console.log('🤖 Triggering AI crowd reaction for:', result.aiResponse.substring(0, 50) + '...');
            playIntelligentCrowdReaction(result.aiResponse, {
              battlePhase: (battleState?.currentRound || 1) === (battleState?.maxRounds || 3) ? 'closing' : 'middle',
              userPerformanceScore: result.aiScore || 0
            });
          }
        } else {
          console.log('⚠️ No AI response in result');
          updateBattleState({ isAIResponding: false });
        }
        
        console.log('🎵 Setting current AI audio URL:', result.audioUrl?.substring(0, 100) + '...');
        console.log('🎵 Audio URL length:', result.audioUrl?.length || 0);
        console.log('🎵 Audio available:', !!result.audioUrl);
        setCurrentAiAudio(result.audioUrl);
        
        // FORCE AUTO-PLAY TTS - All AI responses must play automatically
        if (result.audioUrl && result.audioUrl.length > 100) {
          console.log('🔥 FORCING AUTOPLAY - AI must speak now!');
          console.log('🔥 Audio URL ready for FORCED playback:', result.audioUrl.substring(0, 100) + '...');
          
          // Immediately trigger FORCED audio playback state
          updateBattleState({ isPlayingAudio: true });
          
          // Enhanced audio playback trigger with multiple attempts
          setTimeout(() => {
            console.log('🔥 Enhanced autoplay trigger - attempt 1');
            updateBattleState({ isPlayingAudio: true });
            
            // Additional trigger after ensuring audio component is ready
            setTimeout(() => {
              console.log('🔥 Enhanced autoplay trigger - attempt 2');
              updateBattleState({ isPlayingAudio: true });
            }, 200);
          }, 50);
        } else {
          console.log('⚠️ No valid audio URL received:', result.audioUrl?.substring(0, 50));
        }
        
        toast({
          title: "Round Complete!",
          description: `Score: You ${result.userScore || 0} - AI ${result.aiScore || 0}`,
        });
      }
    } catch (error) {
      toast({
        title: "Battle Error",
        description: error instanceof Error ? error.message : "Failed to process battle round",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      updateBattleState({ isAIResponding: false });
    }
  };

  const handleNewBattle = () => {
    setLiveTranscription("");
    setAiResponse("");
    setCurrentAiAudio(undefined);
    setBattleTimer(120);
    setSelectedCharacter(null);
    setShowCharacterSelector(true);
  };

  const handleCharacterSelect = (character: BattleCharacter) => {
    console.log('🎯 Character selected:', character.displayName);
    setSelectedCharacter(character);
    setShowCharacterSelector(false);
    
    // 🔔 ROUND START BELL - Play boxing bell when battle begins
    console.log('🔔 Playing round start bell for new battle');
    playRoundStartBell();
    
    // Enable real-time crowd reactions for this battle
    enableRealtimeCrowdReactions(true);
    
    // Start battle with selected character and complexity settings
    startNewBattle(difficulty, profanityFilter, character.id, lyricComplexity, styleIntensity, advancedSettings.voiceSpeed);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as "easy" | "normal" | "hard");
    if (currentBattleId) {
      updateBattleState({ difficulty: value as "easy" | "normal" | "hard" });
    }
  };

  const getProgressPercentage = () => {
    if (!battleState) return 50;
    const total = battleState.userScore + battleState.aiScore;
    return total > 0 ? (battleState.userScore / total) * 100 : 50;
  };

  const getConnectionStatus = () => {
    return "Connected"; // Could implement real connection monitoring
  };

  const handleAnalyzeLyrics = (text: string, source: string) => {
    setCurrentAnalysisText(text);
    setShowLyricBreakdown(true);
  };

  const handleCloseLyricBreakdown = () => {
    setShowLyricBreakdown(false);
    setCurrentAnalysisText("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-orbitron font-bold text-accent-gold mb-4">
            Initializing Battle Arena...
          </div>
          <div className="animate-spin w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-secondary-dark border-b border-battle-gray px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Mic className="text-accent-gold text-2xl" />
            <h1 className="font-orbitron font-bold text-2xl bg-gradient-to-r from-accent-gold to-accent-red bg-clip-text text-transparent">
              RapBots
            </h1>
            <Badge variant="secondary" className="bg-accent-blue text-white">
              ARENA
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <span>Streak: </span>
              <span className="text-accent-gold font-semibold">3</span>
            </div>
            <div className="text-sm text-gray-400">
              <span>Score: </span>
              <span className="text-accent-blue font-semibold">
                {battleState?.userScore || 0}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/fine-tuning'}
              className="bg-battle-gray hover:bg-gray-600 border-gray-600 mr-2"
              data-testid="button-fine-tuning"
              title="Fine-tune Custom Models"
            >
              🧠
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-battle-gray hover:bg-gray-600 border-gray-600"
              data-testid="button-settings"
            >
              ⚙️
            </Button>
          </div>
        </div>
      </header>

      <main className="min-h-screen relative">
        {/* Battle Arena Background */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-15 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${battleArenaImage})` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
          {/* Character Selection Modal */}
          <AnimatePresence>
            {showCharacterSelector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-battle-gray rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-orbitron font-bold text-center text-white mb-2">
                      Select Your Opponent
                    </h2>
                    <p className="text-gray-400 text-center">
                      Each character has unique voice, style, and difficulty level
                    </p>
                  </div>
                  
                  <CharacterSelector
                    onCharacterSelect={handleCharacterSelect}
                    selectedCharacter={selectedCharacter || undefined}
                  />
                  
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowCharacterSelector(false)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      data-testid="button-cancel-character-select"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Battle Status Bar */}
          <Card className="mb-6 bg-battle-gray border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-accent-red text-white px-3 py-1">
                    <Flame className="mr-1" size={16} />
                    BATTLE MODE
                  </Badge>
                  <div className="text-accent-gold font-semibold" data-testid="text-current-round">
                    Round {battleState?.currentRound || 1}/{battleState?.maxRounds || 3}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Battle Timer */}
                  <div className="flex items-center space-x-2 bg-secondary-dark px-4 py-2 rounded-lg">
                    <Clock className="text-accent-blue" size={16} />
                    <span className="font-orbitron font-bold text-lg" data-testid="text-battle-timer">
                      {formatDuration(battleTimer)}
                    </span>
                  </div>
                  {/* Difficulty */}
                  <Select value={difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-32 bg-secondary-dark border-gray-600" data-testid="select-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-dark border-gray-600">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Enhanced Battle Score Display */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-center bg-secondary-dark/50 rounded-lg px-6 py-4 border border-accent-blue/30">
                    <div className="text-accent-blue font-semibold text-sm">YOU</div>
                    <div className="text-3xl font-orbitron font-bold text-white" data-testid="text-user-score">
                      {battleState?.userScore || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Round {battleState?.currentRound || 1} Score
                    </div>
                  </div>
                  
                  <div className="flex-1 mx-8 text-center">
                    <Progress 
                      value={getProgressPercentage()} 
                      className="h-3 bg-battle-gray"
                      data-testid="progress-battle-score"
                    />
                    <div className="text-center text-sm font-bold mt-2 text-accent-gold">
                      BATTLE SCORE
                    </div>
                    <div className="text-xs text-gray-400">
                      {(battleState?.userScore || 0) > (battleState?.aiScore || 0) ? "YOU LEAD" : 
                       (battleState?.aiScore || 0) > (battleState?.userScore || 0) ? "AI LEADS" : "TIED"}
                    </div>
                  </div>
                  
                  <div className="text-center bg-secondary-dark/50 rounded-lg px-6 py-4 border border-accent-red/30">
                    <div className="text-accent-red font-semibold text-sm">AI BOT</div>
                    <div className="text-3xl font-orbitron font-bold text-white" data-testid="text-ai-score">
                      {battleState?.aiScore || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Round {battleState?.currentRound || 1} Score
                    </div>
                  </div>
                </div>
                
                {/* Round History */}
                {rounds && rounds.length > 0 && (
                  <div className="flex justify-center space-x-2">
                    <div className="text-xs text-gray-400">Round History:</div>
                    {rounds.map((round, index) => (
                      <div key={round.id} className="flex items-center space-x-1 text-xs">
                        <span className="text-accent-blue">{round.scores?.userScore || 0}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-accent-red">{round.scores?.aiScore || 0}</span>
                        {index < rounds.length - 1 && <span className="text-gray-600">•</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Controls Panel */}
            <div className="space-y-6">
              {/* Recording Panel */}
              <RecordingPanel
                onRecordingComplete={handleRecordingComplete}
                onRecordingStart={() => {
                  console.log('🎤 User started recording - triggering crowd on speech');
                  triggerCrowdOnSpeech();
                }}
                profanityFilter={profanityFilter}
                onProfanityFilterChange={setProfanityFilter}
                lyricComplexity={lyricComplexity}
                onLyricComplexityChange={setLyricComplexity}
                styleIntensity={styleIntensity}
                onStyleIntensityChange={setStyleIntensity}
                disabled={isProcessing || battleState?.isAIResponding}
              />

              {/* User Score Panel */}
              <Card className="bg-battle-gray border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-accent-blue">
                    <Trophy className="inline mr-2" size={20} />
                    Your Stats
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rhyme Density</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-sm font-semibold" data-testid="text-rhyme-density">75%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flow Quality</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={80} className="w-16 h-2" />
                        <span className="text-sm font-semibold" data-testid="text-flow-quality">80%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creativity</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={60} className="w-16 h-2" />
                        <span className="text-sm font-semibold" data-testid="text-creativity">60%</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-600">
                      <div className="text-center">
                        <div className="text-2xl font-orbitron font-bold text-accent-gold" data-testid="text-total-score">
                          {battleState?.userScore || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Central Battle Arena */}
            <div className="space-y-6">
              {/* Avatar Section */}
              <BattleAvatar
                isAISpeaking={battleState?.isPlayingAudio || false}
                battleState={battleState?.isAIResponding ? "battle" : "idle"}
                audioUrl={currentAiAudio}
                character={selectedCharacter || undefined}
              />

              {/* Battle Text Display */}
              <BattleTextDisplay
                liveTranscription={liveTranscription}
                aiResponse={aiResponse}
                isTranscribing={isTranscribing}
                isAIGenerating={battleState?.isAIResponding}
                onClear={() => {
                  setLiveTranscription("");
                  setAiResponse("");
                }}
              />

              {/* Lyric Analysis Buttons */}
              {(liveTranscription || aiResponse) && (
                <Card className="bg-battle-gray border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="font-orbitron font-bold text-sm mb-3 text-accent-gold">
                      Interactive Lyric Analysis
                    </h3>
                    <div className="flex gap-2">
                      {liveTranscription && (
                        <Button
                          onClick={() => handleAnalyzeLyrics(liveTranscription, "user")}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          data-testid="button-analyze-user-lyrics"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analyze Your Verse
                        </Button>
                      )}
                      {aiResponse && (
                        <Button
                          onClick={() => handleAnalyzeLyrics(aiResponse, "ai")}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                          data-testid="button-analyze-ai-lyrics"
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Analyze AI Response
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* AI & Audio Controls Panel */}
            <div className="space-y-6">
              {/* Audio Playback Controls */}
              <AudioControls
                audioUrl={currentAiAudio}
                onPlaybackChange={(isPlaying) => 
                  updateBattleState({ isPlayingAudio: isPlaying })
                }
              />

              {/* Battle History */}
              <Card className="bg-battle-gray border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-accent-gold">
                    <History className="inline mr-2" size={20} />
                    Battle History
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {Array.isArray(battleHistory) && battleHistory.slice(0, 3).map((historyBattle: any, index: number) => (
                        <motion.div
                          key={historyBattle.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-secondary-dark rounded-lg p-3 border border-gray-600"
                          data-testid={`card-battle-history-${index}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-sm">Battle #{index + 47}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(historyBattle.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-accent-gold font-bold">
                                {historyBattle.userScore} - {historyBattle.aiScore}
                              </div>
                              <div className={`text-xs ${
                                historyBattle.userScore > historyBattle.aiScore 
                                  ? "text-accent-blue" 
                                  : "text-accent-red"
                              }`}>
                                {historyBattle.userScore > historyBattle.aiScore ? "VICTORY" : "DEFEAT"}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-accent-blue hover:bg-blue-600" 
                    variant="default"
                    data-testid="button-view-all-battles"
                  >
                    View All Battles
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-battle-gray border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-accent-gold">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleNewBattle}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-accent-red to-red-600 hover:from-red-500 hover:to-red-700"
                      data-testid="button-new-battle"
                    >
                      <Flame className="mr-2" size={16} />
                      New Battle
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-accent-blue hover:bg-blue-600 border-accent-blue text-white"
                      data-testid="button-practice-mode"
                    >
                      <Dumbbell className="mr-2" size={16} />
                      Practice Mode
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full bg-battle-gray hover:bg-gray-600 border-gray-600"
                      data-testid="button-share-results"
                    >
                      <Share className="mr-2" size={16} />
                      Share Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Audio Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-secondary-dark border-t border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="destructive"
              size="sm"
              className="bg-accent-red hover:bg-red-600 w-12 h-12 rounded-full"
              data-testid="button-emergency-stop"
            >
              ⏹️
            </Button>
            <div className="text-sm">
              <div className="font-semibold">Battle in Progress</div>
              <div className="text-gray-400" data-testid="text-battle-status">
                Round {battleState?.currentRound || 1} of {battleState?.maxRounds || 3}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Wifi className="text-accent-blue" size={16} />
              <span className="text-sm text-gray-400" data-testid="text-connection-status">
                {getConnectionStatus()}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              API Status: <span className="text-accent-gold" data-testid="text-api-status">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lyric Breakdown Modal */}
      <LyricBreakdown
        text={currentAnalysisText}
        isVisible={showLyricBreakdown}
        onClose={handleCloseLyricBreakdown}
      />
    </>
  );
}
