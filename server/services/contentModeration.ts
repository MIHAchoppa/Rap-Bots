export interface ModerationResult {
  isSafe: boolean;
  categories?: string[];
  confidence?: number;
}

export class ContentModerationService {
  constructor() {}

  private get apiKey(): string {
    const key = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ENV_VAR || "";
    if (!key) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    return key;
  }

  /**
   * Check if content is safe using Llama Guard 4
   * @param content - Text content to moderate
   * @param type - Whether this is a 'prompt' (user input) or 'response' (AI output)
   * @returns Promise<ModerationResult>
   */
  async moderateContent(content: string, type: 'prompt' | 'response' = 'response'): Promise<ModerationResult> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-Guard-4-12B',
          messages: [
            {
              role: type === 'prompt' ? 'user' : 'assistant',
              content: content
            }
          ],
          max_completion_tokens: 100,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        console.error('Llama Guard moderation failed:', response.statusText);
        // Default to safe if moderation service fails
        return { isSafe: true };
      }

      const result = await response.json();
      const moderationOutput = result.choices[0]?.message?.content?.trim() || '';
      
      console.log(`Content moderation result: "${moderationOutput}"`);

      if (moderationOutput.toLowerCase().startsWith('safe')) {
        return { isSafe: true };
      } else if (moderationOutput.toLowerCase().startsWith('unsafe')) {
        // Extract categories (format: "unsafe\nS2\nS10")
        const lines = moderationOutput.split('\n');
        const categories = lines.slice(1).filter((line: string) => line.trim().startsWith('S'));
        
        return { 
          isSafe: false, 
          categories,
          confidence: 0.9 // High confidence when explicitly marked unsafe
        };
      }

      // Default to safe for ambiguous responses
      return { isSafe: true };
      
    } catch (error) {
      console.error('Content moderation error:', error);
      // Fail open - default to safe if service unavailable
      return { isSafe: true };
    }
  }

  /**
   * Get human-readable explanation of violation categories
   */
  getCategoryExplanation(categories: string[]): string {
    const categoryMap: Record<string, string> = {
      'S1': 'Violent Crimes',
      'S2': 'Non-Violent Crimes', 
      'S3': 'Sex-Related Crimes',
      'S4': 'Child Sexual Exploitation',
      'S5': 'Defamation',
      'S6': 'Specialized Advice',
      'S7': 'Privacy',
      'S8': 'Intellectual Property',
      'S9': 'Indiscriminate Weapons',
      'S10': 'Hate',
      'S11': 'Suicide & Self-Harm',
      'S12': 'Sexual Content',
      'S13': 'Elections',
      'S14': 'Code Interpreter Abuse'
    };

    return categories
      .map(cat => categoryMap[cat] || cat)
      .join(', ');
  }

  /**
   * Apply content filtering with different safety levels
   * @param content - Content to filter
   * @param safetyLevel - 'strict' (family-friendly) or 'moderate' (battle rap appropriate)
   * @param type - 'prompt' or 'response'
   */
  async filterContent(
    content: string, 
    safetyLevel: 'strict' | 'moderate' = 'moderate',
    type: 'prompt' | 'response' = 'response'
  ): Promise<{ content: string; wasFlagged: boolean; reason?: string }> {
    
    // For strict mode (family-friendly), check all content
    if (safetyLevel === 'strict') {
      const moderation = await this.moderateContent(content, type);
      
      if (!moderation.isSafe) {
        const reason = moderation.categories ? 
          this.getCategoryExplanation(moderation.categories) : 
          'Content policy violation';
        
        return {
          content: this.generateFamilyFriendlyAlternative(content),
          wasFlagged: true,
          reason
        };
      }
    } else {
      // For moderate mode (battle rap), only filter truly harmful content
      // Allow aggressive language, competitive insults, profanity in rap context
      const moderation = await this.moderateContent(content, type);
      
      if (!moderation.isSafe && moderation.categories) {
        // Filter only serious violations (S1, S3, S4, S10, S11)
        const seriousViolations = moderation.categories.filter(cat => 
          ['S1', 'S3', 'S4', 'S10', 'S11'].includes(cat)
        );
        
        if (seriousViolations.length > 0) {
          return {
            content: this.generateModerateAlternative(content),
            wasFlagged: true,
            reason: this.getCategoryExplanation(seriousViolations)
          };
        }
      }
    }

    return { content, wasFlagged: false };
  }

  private generateFamilyFriendlyAlternative(originalContent: string): string {
    // Generate clean battle rap alternative
    return `Your rhymes are weak, I'm bringing the heat,
Step to my level, accept your defeat,
My flow's so clean, my bars are supreme,
I'm the champion of this lyrical scene.`;
  }

  private generateModerateAlternative(originalContent: string): string {
    // Generate battle-appropriate alternative without serious violations
    return `Your bars are trash, my flow's on fire,
I'm spitting flames while you just tire,
Step to the mic, I'll shut you down,
Best battle rapper in this whole town.`;
  }
}

export const contentModerationService = new ContentModerationService();