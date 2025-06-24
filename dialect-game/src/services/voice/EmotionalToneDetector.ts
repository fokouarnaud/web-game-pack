/**
 * EmotionalToneDetector - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class EmotionalToneDetector {
  private readonly emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised'];

  async detect(audioInput: Float32Array): Promise<{ emotion: string; confidence: number }> {
    if (!audioInput || !(audioInput instanceof Float32Array)) {
      throw new Error('Invalid audio input');
    }

    // Analyse basique des caractéristiques audio pour détecter l'émotion
    const features = this.extractFeatures(audioInput);
    const emotion = this.classifyEmotion(features);
    const confidence = this.calculateConfidence(features);

    return { emotion, confidence };
  }

  private extractFeatures(audioInput: Float32Array) {
    const energy = this.calculateEnergy(audioInput);
    const spectralCentroid = this.calculateSpectralCentroid(audioInput);
    const zeroCrossingRate = this.calculateZeroCrossingRate(audioInput);
    
    return { energy, spectralCentroid, zeroCrossingRate };
  }

  private calculateEnergy(audioInput: Float32Array): number {
    return audioInput.reduce((sum, sample) => sum + sample * sample, 0) / audioInput.length;
  }

  private calculateSpectralCentroid(audioInput: Float32Array): number {
    // Approximation simple du centroïde spectral
    let weightedSum = 0;
    let magnitude = 0;
    
    for (let i = 0; i < audioInput.length; i++) {
      const freq = (i / audioInput.length) * 22050; // Nyquist approximation
      const mag = Math.abs(audioInput[i]);
      weightedSum += freq * mag;
      magnitude += mag;
    }
    
    return magnitude > 0 ? weightedSum / magnitude : 0;
  }

  private calculateZeroCrossingRate(audioInput: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < audioInput.length; i++) {
      if ((audioInput[i] >= 0) !== (audioInput[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / audioInput.length;
  }

  private classifyEmotion(features: any): string {
    const { energy, spectralCentroid, zeroCrossingRate } = features;

    // Classification simple basée sur les seuils
    if (energy > 0.5 && spectralCentroid > 3000) {
      return zeroCrossingRate > 0.1 ? 'angry' : 'happy';
    } else if (energy < 0.1) {
      return 'sad';
    } else if (zeroCrossingRate > 0.15) {
      return 'surprised';
    } else {
      return 'neutral';
    }
  }

  private calculateConfidence(features: any): number {
    const { energy, spectralCentroid, zeroCrossingRate } = features;
    
    // Confiance basée sur la cohérence des caractéristiques
    const energyConfidence = Math.min(1.0, energy * 2);
    const spectralConfidence = Math.min(1.0, spectralCentroid / 5000);
    const rateConfidence = Math.min(1.0, zeroCrossingRate * 10);
    
    const averageConfidence = (energyConfidence + spectralConfidence + rateConfidence) / 3;
    return Math.max(0.1, Math.min(0.99, averageConfidence));
  }
}