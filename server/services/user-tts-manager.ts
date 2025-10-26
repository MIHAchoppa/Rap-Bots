import { createOpenAITTS, OpenAITTSService } from './openai-tts';
import { createGroqTTS, GroqTTSService } from './groq-tts';
import { createElevenLabsTTS, ElevenLabsTTSService } from './elevenlabs-tts';
import { createMyShellTTS, MyShellTTSService } from './myshell-tts';
import { storage } from '../storage';

export interface TTSGenerationOptions {
  characterId: string;
  characterName?: string;
  gender?: string;
  voiceStyle?: 'aggressive' | 'confident' | 'smooth' | 'intense' | 'playful';
  speedMultiplier?: number;
}

export class UserTTSManager {
  private openaiInstances = new Map<string, OpenAITTSService>();
  private groqInstances = new Map<string, GroqTTSService>();
  private elevenlabsInstances = new Map<string, ElevenLabsTTSService>();
  private myshellInstances = new Map<string, MyShellTTSService>();

  private getOpenAIInstance(apiKey: string): OpenAITTSService {
    if (!this.openaiInstances.has(apiKey)) {
      this.openaiInstances.set(apiKey, createOpenAITTS(apiKey));
    }
    return this.openaiInstances.get(apiKey)!;
  }

  private getGroqInstance(apiKey: string): GroqTTSService {
    if (!this.groqInstances.has(apiKey)) {
      this.groqInstances.set(apiKey, createGroqTTS(apiKey));
    }
    return this.groqInstances.get(apiKey)!;
  }

  private getElevenLabsInstance(apiKey: string): ElevenLabsTTSService {
    if (!this.elevenlabsInstances.has(apiKey)) {
      this.elevenlabsInstances.set(apiKey, createElevenLabsTTS(apiKey));
    }
    return this.elevenlabsInstances.get(apiKey)!;
  }

  private getMyShellInstance(apiKey: string, voiceCloning: boolean = false): MyShellTTSService {
    const key = `${apiKey}_${voiceCloning}`;
    if (!this.myshellInstances.has(key)) {
      this.myshellInstances.set(key, createMyShellTTS(apiKey, voiceCloning));
    }
    return this.myshellInstances.get(key)!;
  }

  async generateTTS(
    text: string,
    userId: string,
    options: TTSGenerationOptions
  ): Promise<{ audioUrl: string; duration: number }> {
    
    try {
      // Get user's TTS preferences and API keys
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const preferredService = user.preferredTtsService || 'myshell';

      // FORCE CYPHER-9000 to use Groq for robotic voice
      if (options.characterId === 'cypher') {
        try {
          const apiKey = user.groqApiKey || process.env.GROQ_API_KEY;
          if (apiKey) {
            const groqInstance = this.getGroqInstance(apiKey);
            return await groqInstance.generateTTS(text, options.characterId, {
              voiceStyle: options.voiceStyle,
              characterName: options.characterName,
              gender: options.gender,
              speedMultiplier: options.speedMultiplier
            });
          } else {
          }
        } catch (error: any) {
        }
      }

      // Try user's preferred service first
      if (preferredService === 'myshell') {
        try {
          // Try system MyShell API key
          const apiKey = process.env.MYSHELL_API_KEY;
          if (apiKey) {
            const myshellInstance = this.getMyShellInstance(apiKey, true);
            return await myshellInstance.generateTTS(text, options.characterId, {
              voiceStyle: options.voiceStyle,
              characterName: options.characterName,
              gender: options.gender,
              speedMultiplier: options.speedMultiplier
            });
          } else {
          }
        } catch (error: any) {
        }
      }

      if (preferredService === 'openai' && user.openaiApiKey) {
        try {
          const openaiInstance = this.getOpenAIInstance(user.openaiApiKey);
          return await openaiInstance.generateTTS(text, options.characterId, {
            voiceStyle: options.voiceStyle,
            characterName: options.characterName,
            gender: options.gender,
            speedMultiplier: options.speedMultiplier
          });
        } catch (error: any) {
        }
      }

      if (preferredService === 'groq') {
        try {
          // Try user's Groq API key first, then fallback to system key
          const apiKey = user.groqApiKey || process.env.GROQ_API_KEY;
          if (apiKey) {
            const groqInstance = this.getGroqInstance(apiKey);
            return await groqInstance.generateTTS(text, options.characterId, {
              voiceStyle: options.voiceStyle,
              characterName: options.characterName,
              gender: options.gender,
              speedMultiplier: options.speedMultiplier
            });
          } else {
          }
        } catch (error: any) {
        }
      }

      // ElevenLabs premium TTS option
      if (preferredService === 'elevenlabs') {
        try {
          // Try user's ElevenLabs API key first, then fallback to system key
          const apiKey = user.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY;
          if (apiKey) {
            const elevenlabsInstance = this.getElevenLabsInstance(apiKey);
            return await elevenlabsInstance.generateTTS(text, options.characterId, {
              voiceStyle: options.voiceStyle,
              characterName: options.characterName,
              gender: options.gender,
              speedMultiplier: options.speedMultiplier
            });
          } else {
          }
        } catch (error: any) {
        }
      }

      // Fallback to system TTS services
      return await this.useSystemTTS(text, options);

    } catch (error) {
      console.error(`❌ All TTS services failed for user ${userId}:`, error);
      
      // Ultimate fallback - return empty audio with success status
      return {
        audioUrl: "", // Empty audio - frontend handles gracefully
        duration: Math.floor(text.length / 15)
      };
    }
  }

  private async useSystemTTS(
    text: string, 
    options: TTSGenerationOptions
  ): Promise<{ audioUrl: string; duration: number }> {
    
    // Try system MyShell AI first (voice cloning if available)
    if (process.env.MYSHELL_API_KEY) {
      try {
        const myshellInstance = this.getMyShellInstance(process.env.MYSHELL_API_KEY, true);
        return await myshellInstance.generateTTS(text, options.characterId, {
          voiceStyle: options.voiceStyle,
          characterName: options.characterName,
          gender: options.gender,
          speedMultiplier: options.speedMultiplier
        });
      } catch (error: any) {
      }
    }
    
    // Try system ElevenLabs second (premium quality if available)
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const elevenlabsInstance = this.getElevenLabsInstance(process.env.ELEVENLABS_API_KEY);
        return await elevenlabsInstance.generateTTS(text, options.characterId, {
          voiceStyle: options.voiceStyle,
          characterName: options.characterName,
          gender: options.gender,
          speedMultiplier: options.speedMultiplier
        });
      } catch (error: any) {
      }
    }
    
    // Try system Groq second (good quality and fast)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqInstance = this.getGroqInstance(process.env.GROQ_API_KEY);
        return await groqInstance.generateTTS(text, options.characterId, {
          voiceStyle: options.voiceStyle,
          characterName: options.characterName,
          gender: options.gender,
          speedMultiplier: options.speedMultiplier
        });
      } catch (error: any) {
      }
    }
    
    // Try system OpenAI as final fallback
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiInstance = this.getOpenAIInstance(process.env.OPENAI_API_KEY);
        return await openaiInstance.generateTTS(text, options.characterId, {
          voiceStyle: options.voiceStyle,
          characterName: options.characterName,
          gender: options.gender,
          speedMultiplier: options.speedMultiplier
        });
      } catch (error: any) {
      }
    }
    
    // All services failed - return empty audio (battle continues without sound)
    return {
      audioUrl: "", // Empty audio - frontend handles gracefully
      duration: Math.floor(text.length / 15)
    };
  }

  // Test a user's API key
  async testUserAPIKey(userId: string, service: 'openai' | 'groq' | 'elevenlabs' | 'myshell'): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    try {
      if (service === 'openai' && user.openaiApiKey) {
        const instance = this.getOpenAIInstance(user.openaiApiKey);
        const result = await instance.generateTTS("Test", "test", {});
        return result.audioUrl.length > 0;
      }

      if (service === 'groq' && user.groqApiKey) {
        const instance = this.getGroqInstance(user.groqApiKey);
        return await instance.testConnection();
      }

      if (service === 'elevenlabs' && user.elevenlabsApiKey) {
        const instance = this.getElevenLabsInstance(user.elevenlabsApiKey);
        return await instance.testConnection();
      }

      if (service === 'myshell' && process.env.MYSHELL_API_KEY) {
        const instance = this.getMyShellInstance(process.env.MYSHELL_API_KEY, true);
        return await instance.testConnection();
      }

      return false;
    } catch (error) {
      console.error(`API key test failed for ${service}:`, error);
      return false;
    }
  }

  // Clear cached instances when keys change
  clearUserInstances(userId: string) {
    // In a production system, you'd track which instances belong to which users
    // For now, we'll clear all instances when any key changes
    this.openaiInstances.clear();
    this.groqInstances.clear();
    this.elevenlabsInstances.clear();
    this.myshellInstances.clear();
  }
}

export const userTTSManager = new UserTTSManager();