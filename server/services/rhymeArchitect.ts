/**
 * RHYME ARCHITECT SERVICE
 * Specialized agent for perfect syllable placement and timing optimization
 * Ensures maximum audience impact through precise rhyme positioning
 */

export interface RhymePlacement {
  position: number;
  syllable: string;
  impact: 'knockout' | 'devastating' | 'powerful' | 'moderate';
  timing: 'beat-perfect' | 'off-beat-emphasis' | 'syncopated';
  audienceReaction: 'crowd-roar' | 'stunned-silence' | 'head-nod' | 'rewind-worthy';
}

export interface SyllablePattern {
  pattern: string;
  stressPattern: number[]; // 1 = stressed, 0 = unstressed
  idealTempo: number; // BPM for optimal delivery
  breathPlacement: number[]; // Positions for natural breath breaks
}

export interface ImpactMoment {
  line: number;
  position: number;
  syllables: string[];
  impactType: 'punchline' | 'multisyllable-bomb' | 'internal-explosion' | 'cross-line-devastation';
  audienceEffect: string;
}

export class RhymeArchitectService {
  private impactSyllableLibrary = {
    // Maximum impact consonant clusters for devastating delivery
    knockout: [
      'devastation', 'annihilation', 'obliteration', 'domination', 
      'assassination', 'evisceration', 'desecration', 'termination'
    ],
    devastating: [
      'execution', 'precision', 'collision', 'explosion',
      'destruction', 'eruption', 'corruption', 'disruption'
    ],
    powerful: [
      'attack', 'impact', 'contact', 'extract',
      'detract', 'compact', 'intact', 'abstract'
    ],
    moderate: [
      'flow', 'show', 'know', 'grow',
      'glow', 'blow', 'throw', 'slow'
    ]
  };

  private beatPatterns = {
    // BPM-optimized syllable patterns for perfect timing
    speed: {
      slow: { bpm: 70, pattern: [1, 0, 1, 0, 1, 0, 1, 0] },
      medium: { bpm: 90, pattern: [1, 0, 1, 1, 0, 1, 0, 1] },
      fast: { bpm: 110, pattern: [1, 1, 0, 1, 1, 0, 1, 1] },
      double: { bpm: 130, pattern: [1, 1, 1, 0, 1, 1, 1, 0] }
    }
  };

  /**
   * MASTER FUNCTION: Optimize rhyme placement for maximum audience impact
   */
  async optimizeRhymePlacement(
    lyrics: string,
    targetImpact: 'maximum' | 'devastating' | 'controlled' = 'maximum',
    audienceType: 'battle-crowd' | 'freestyle-cipher' | 'competition' = 'battle-crowd'
  ): Promise<{
    optimizedLyrics: string;
    placementMap: RhymePlacement[];
    impactMoments: ImpactMoment[];
    timingInstructions: string;
  }> {
    console.log(`🎯 RHYME ARCHITECT: Optimizing for ${targetImpact} impact...`);
    
    const lines = lyrics.split('\n').filter(line => line.trim());
    const optimizedLines: string[] = [];
    const placementMap: RhymePlacement[] = [];
    const impactMoments: ImpactMoment[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineOptimization = await this.optimizeLineForImpact(
        lines[i], 
        i, 
        targetImpact,
        audienceType,
        lines // Context for cross-line patterns
      );
      
      optimizedLines.push(lineOptimization.optimizedLine);
      placementMap.push(...lineOptimization.placements);
      if (lineOptimization.impactMoment) {
        impactMoments.push(lineOptimization.impactMoment);
      }
    }

    // Cross-line optimization for devastating combos
    const crossLineOptimization = this.optimizeCrossLineImpact(optimizedLines, impactMoments);
    
    return {
      optimizedLyrics: crossLineOptimization.lyrics.join('\n'),
      placementMap,
      impactMoments: crossLineOptimization.impactMoments,
      timingInstructions: this.generateTimingInstructions(crossLineOptimization.impactMoments, targetImpact)
    };
  }

  /**
   * Optimize individual line for perfect syllable placement
   */
  private async optimizeLineForImpact(
    line: string,
    lineNumber: number,
    targetImpact: string,
    audienceType: string,
    allLines: string[]
  ): Promise<{
    optimizedLine: string;
    placements: RhymePlacement[];
    impactMoment?: ImpactMoment;
  }> {
    const words = line.trim().split(' ');
    const syllableAnalysis = this.analyzeSyllableStructure(words);
    
    // Find optimal placement positions for maximum impact
    const impactPositions = this.calculateImpactPositions(syllableAnalysis, targetImpact);
    
    // Enhance end rhymes for devastating delivery
    const endOptimization = this.optimizeEndRhyme(words, targetImpact, audienceType);
    
    // Add internal rhyme bombs for crowd reaction
    const internalOptimization = this.optimizeInternalRhymes(
      endOptimization.words, 
      impactPositions,
      lineNumber
    );

    const placements: RhymePlacement[] = [];
    let syllablePosition = 0;

    for (const word of internalOptimization.words) {
      const syllables = this.getSyllables(word);
      for (const syllable of syllables) {
        const impact = this.calculateSyllableImpact(syllable, syllablePosition, impactPositions);
        const timing = this.calculateOptimalTiming(syllablePosition, syllables.length);
        
        placements.push({
          position: syllablePosition,
          syllable,
          impact,
          timing,
          audienceReaction: this.predictAudienceReaction(impact, timing, audienceType)
        });
        
        syllablePosition++;
      }
    }

    // Create impact moment if this line has a devastating finish
    let impactMoment: ImpactMoment | undefined;
    if (endOptimization.isDevastating || internalOptimization.hasExplosion) {
      impactMoment = {
        line: lineNumber,
        position: syllablePosition - 1,
        syllables: endOptimization.impactSyllables,
        impactType: endOptimization.isDevastating ? 'punchline' : 'internal-explosion',
        audienceEffect: this.generateAudienceEffect(targetImpact, audienceType)
      };
    }

    return {
      optimizedLine: internalOptimization.words.join(' '),
      placements,
      impactMoment
    };
  }

  /**
   * Calculate perfect impact positions for syllable placement
   */
  private calculateImpactPositions(syllableAnalysis: any, targetImpact: string): number[] {
    const positions: number[] = [];
    
    // Strategic positioning for maximum crowd reaction
    if (targetImpact === 'maximum') {
      // Place devastating hits at quarter beats for perfect timing
      positions.push(
        Math.floor(syllableAnalysis.totalSyllables * 0.25), // First quarter bomb
        Math.floor(syllableAnalysis.totalSyllables * 0.75), // Third quarter devastation
        syllableAnalysis.totalSyllables - 1 // End line knockout
      );
    } else if (targetImpact === 'devastating') {
      // Mid-line explosion and end devastation
      positions.push(
        Math.floor(syllableAnalysis.totalSyllables * 0.5),
        syllableAnalysis.totalSyllables - 1
      );
    } else {
      // Controlled impact at end
      positions.push(syllableAnalysis.totalSyllables - 1);
    }
    
    return positions.filter(pos => pos >= 0 && pos < syllableAnalysis.totalSyllables);
  }

  /**
   * Optimize end rhyme for devastating audience impact
   */
  private optimizeEndRhyme(
    words: string[], 
    targetImpact: string, 
    audienceType: string
  ): {
    words: string[];
    isDevastating: boolean;
    impactSyllables: string[];
  } {
    if (words.length === 0) return { words, isDevastating: false, impactSyllables: [] };
    
    const lastWord = words[words.length - 1];
    const syllables = this.getSyllables(lastWord);
    
    // Check if current end word has maximum impact potential
    const currentImpact = this.assessWordImpact(lastWord);
    
    if (currentImpact < this.getTargetImpactScore(targetImpact)) {
      // Replace with more devastating end rhyme
      const optimizedEndWord = this.selectDevastatingEndRhyme(lastWord, targetImpact, audienceType);
      if (optimizedEndWord !== lastWord) {
        words[words.length - 1] = optimizedEndWord;
        return {
          words,
          isDevastating: true,
          impactSyllables: this.getSyllables(optimizedEndWord)
        };
      }
    }
    
    return {
      words,
      isDevastating: currentImpact >= this.getTargetImpactScore('devastating'),
      impactSyllables: syllables
    };
  }

  /**
   * Optimize internal rhymes for explosive crowd reactions
   */
  private optimizeInternalRhymes(
    words: string[],
    impactPositions: number[],
    lineNumber: number
  ): {
    words: string[];
    hasExplosion: boolean;
  } {
    let syllablePos = 0;
    let hasExplosion = false;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const syllables = this.getSyllables(word);
      
      // Check if this word intersects with impact positions
      const wordEnd = syllablePos + syllables.length - 1;
      const hasImpactPosition = impactPositions.some(pos => pos >= syllablePos && pos <= wordEnd);
      
      if (hasImpactPosition && i < words.length - 1) { // Don't modify end word
        // Enhance this word for internal rhyme explosion
        const enhancedWord = this.enhanceForInternalImpact(word, syllablePos, impactPositions);
        if (enhancedWord !== word) {
          words[i] = enhancedWord;
          hasExplosion = true;
        }
      }
      
      syllablePos += syllables.length;
    }
    
    return { words, hasExplosion };
  }

  /**
   * Cross-line optimization for devastating combo effects
   */
  private optimizeCrossLineImpact(
    lines: string[],
    impactMoments: ImpactMoment[]
  ): {
    lyrics: string[];
    impactMoments: ImpactMoment[];
  } {
    const optimizedLines = [...lines];
    const enhancedImpactMoments = [...impactMoments];
    
    // Look for opportunities to create cross-line devastation
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];
      
      // Check for potential cross-line rhyme bombs
      const crossLineOpportunity = this.identifyCrossLineOpportunity(currentLine, nextLine);
      
      if (crossLineOpportunity.hasPotential) {
        const optimization = this.createCrossLineDevastation(
          currentLine,
          nextLine,
          crossLineOpportunity
        );
        
        optimizedLines[i] = optimization.line1;
        optimizedLines[i + 1] = optimization.line2;
        
        if (optimization.impactMoment) {
          enhancedImpactMoments.push(optimization.impactMoment);
        }
      }
    }
    
    return {
      lyrics: optimizedLines,
      impactMoments: enhancedImpactMoments
    };
  }

  /**
   * Generate precise timing instructions for performers
   */
  private generateTimingInstructions(impactMoments: ImpactMoment[], targetImpact: string): string {
    let instructions = "🎯 OPTIMAL DELIVERY TIMING:\n\n";
    
    impactMoments.forEach((moment, index) => {
      instructions += `📍 IMPACT ${index + 1} (Line ${moment.line + 1}):\n`;
      instructions += `   • Syllables: ${moment.syllables.join('-')}\n`;
      instructions += `   • Type: ${moment.impactType}\n`;
      instructions += `   • Timing: Hit the "${moment.syllables[moment.syllables.length - 1]}" with 85% emphasis\n`;
      instructions += `   • Audience Effect: ${moment.audienceEffect}\n`;
      instructions += `   • Breath: Pause 0.2 seconds after for crowd reaction\n\n`;
    });
    
    if (targetImpact === 'maximum') {
      instructions += "🔥 MAXIMUM IMPACT MODE:\n";
      instructions += "   • Deliver each impact syllable with increasing intensity\n";
      instructions += "   • Use hand gestures to emphasize devastating moments\n";
      instructions += "   • Allow crowd reaction time between major hits\n";
      instructions += "   • Final impact should be delivered at 100% intensity\n";
    }
    
    return instructions;
  }

  // Helper methods for syllable analysis and impact calculation
  private analyzeSyllableStructure(words: string[]): any {
    let totalSyllables = 0;
    const syllableStructure: string[][] = [];
    
    for (const word of words) {
      const syllables = this.getSyllables(word);
      syllableStructure.push(syllables);
      totalSyllables += syllables.length;
    }
    
    return { totalSyllables, syllableStructure };
  }

  private getSyllables(word: string): string[] {
    // Advanced syllable detection for precise timing
    const vowelPattern = /[aeiouyAEIOUY]/g;
    const vowelGroups = word.match(vowelPattern) || [];
    
    // Handle special cases and consonant clusters
    if (vowelGroups.length === 0) return [word];
    if (vowelGroups.length === 1) return [word];
    
    // Split word into syllables based on vowel patterns
    const syllables: string[] = [];
    let currentSyllable = '';
    let vowelCount = 0;
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      currentSyllable += char;
      
      if (/[aeiouyAEIOUY]/.test(char)) {
        vowelCount++;
        
        // Look ahead for syllable break
        if (vowelCount > 1 && i < word.length - 1) {
          syllables.push(currentSyllable.slice(0, -1));
          currentSyllable = char;
          vowelCount = 1;
        }
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    return syllables.length > 0 ? syllables : [word];
  }

  private calculateSyllableImpact(
    syllable: string, 
    position: number, 
    impactPositions: number[]
  ): 'knockout' | 'devastating' | 'powerful' | 'moderate' {
    if (impactPositions.includes(position)) {
      // Check consonant strength for impact classification
      const consonantStrength = this.assessConsonantStrength(syllable);
      if (consonantStrength >= 0.8) return 'knockout';
      if (consonantStrength >= 0.6) return 'devastating';
      return 'powerful';
    }
    return 'moderate';
  }

  private calculateOptimalTiming(
    position: number, 
    totalSyllables: number
  ): 'beat-perfect' | 'off-beat-emphasis' | 'syncopated' {
    const ratio = position / totalSyllables;
    
    if (ratio <= 0.25 || ratio >= 0.75) return 'beat-perfect';
    if (ratio >= 0.4 && ratio <= 0.6) return 'syncopated';
    return 'off-beat-emphasis';
  }

  private predictAudienceReaction(
    impact: string, 
    timing: string, 
    audienceType: string
  ): 'crowd-roar' | 'stunned-silence' | 'head-nod' | 'rewind-worthy' {
    if (impact === 'knockout' && timing === 'beat-perfect') {
      return audienceType === 'battle-crowd' ? 'crowd-roar' : 'rewind-worthy';
    }
    if (impact === 'devastating') return 'stunned-silence';
    if (timing === 'syncopated') return 'head-nod';
    return 'head-nod';
  }

  private assessWordImpact(word: string): number {
    // Assess word's impact potential based on phonetic properties
    const consonantClusters = (word.match(/[bcdfghjklmnpqrstvwxz]{2,}/gi) || []).length;
    const hardConsonants = (word.match(/[kgtpbdx]/gi) || []).length;
    const length = word.length;
    
    return (consonantClusters * 0.4 + hardConsonants * 0.4 + Math.min(length / 10, 0.2));
  }

  private getTargetImpactScore(targetImpact: string): number {
    switch (targetImpact) {
      case 'maximum': return 0.8;
      case 'devastating': return 0.6;
      case 'controlled': return 0.4;
      default: return 0.5;
    }
  }

  private selectDevastatingEndRhyme(
    originalWord: string, 
    targetImpact: string, 
    audienceType: string
  ): string {
    const lastSyllable = this.getLastSyllable(originalWord);
    const rhymeFamily = this.findRhymeFamily(lastSyllable);
    
    // Select most devastating word from rhyme family
    const devastatingOptions = this.impactSyllableLibrary.knockout
      .concat(this.impactSyllableLibrary.devastating)
      .filter(word => this.rhymesWith(word, lastSyllable));
    
    if (devastatingOptions.length > 0) {
      // Choose based on audience type and target impact
      return this.selectOptimalRhyme(devastatingOptions, targetImpact, audienceType);
    }
    
    return originalWord;
  }

  private enhanceForInternalImpact(
    word: string, 
    position: number, 
    impactPositions: number[]
  ): string {
    // Logic to enhance word for internal rhyme explosion
    // This would involve complex phonetic analysis
    return word; // Simplified for now
  }

  private identifyCrossLineOpportunity(line1: string, line2: string): any {
    // Analyze potential for cross-line devastation patterns
    return { hasPotential: false }; // Simplified for now
  }

  private createCrossLineDevastation(
    line1: string, 
    line2: string, 
    opportunity: any
  ): any {
    // Create devastating cross-line patterns
    return { 
      line1, 
      line2, 
      impactMoment: null 
    }; // Simplified for now
  }

  private assessConsonantStrength(syllable: string): number {
    const hardConsonants = ['k', 'g', 't', 'p', 'b', 'd', 'x'];
    const consonantClusters = syllable.match(/[bcdfghjklmnpqrstvwxz]{2,}/gi) || [];
    
    let strength = 0;
    for (const char of syllable.toLowerCase()) {
      if (hardConsonants.includes(char)) strength += 0.2;
    }
    strength += consonantClusters.length * 0.3;
    
    return Math.min(strength, 1);
  }

  private generateAudienceEffect(targetImpact: string, audienceType: string): string {
    const effects = {
      'battle-crowd': {
        maximum: "Crowd erupts, people jumping out their seats, instant replay demanded",
        devastating: "Stunned silence followed by explosive reaction, heads shaking in disbelief",
        controlled: "Collective head nod, murmurs of approval, respect earned"
      },
      'freestyle-cipher': {
        maximum: "Circle breaks formation, everyone loses their minds, legendary moment",
        devastating: "Faces twisted in shock, instant classic verse, everyone rewinding",
        controlled: "Smooth appreciation, knowing nods, skillful recognition"
      },
      'competition': {
        maximum: "Judges lean forward, perfect scores incoming, competition over",
        devastating: "Technical mastery displayed, opponents rethinking strategy",
        controlled: "Professional execution, points definitely scored"
      }
    };
    
    return effects[audienceType as keyof typeof effects]?.[targetImpact as keyof typeof effects['battle-crowd']] || 
           "Strong audience response achieved";
  }

  private getLastSyllable(word: string): string {
    const syllables = this.getSyllables(word);
    return syllables[syllables.length - 1];
  }

  private findRhymeFamily(syllable: string): string[] {
    // Find words that rhyme with the given syllable
    return []; // Would implement phonetic rhyme matching
  }

  private rhymesWith(word1: string, syllable: string): boolean {
    // Check if word rhymes with syllable
    return false; // Would implement phonetic matching
  }

  private selectOptimalRhyme(
    options: string[], 
    targetImpact: string, 
    audienceType: string
  ): string {
    // Select the most optimal rhyme based on impact and audience
    return options[0] || '';
  }
}