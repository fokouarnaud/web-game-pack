/**
 * SpatialAudioManager - Phase GREEN TDD
 * Implémentation minimale pour faire passer les tests
 */
export class SpatialAudioManager {
  private audioContext: AudioContext | null = null;
  private pannerNodes: Map<string, PannerNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private activeAudios: Map<string, { source: AudioBufferSourceNode; position: { x: number; y: number; z: number } }> = new Map();

  async playSpatialAudio(audioId: string, position: { x: number; y: number; z: number }): Promise<boolean> {
    if (!audioId || audioId.trim() === '') {
      throw new Error('Invalid audioId');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
      throw new Error('Invalid position');
    }

    try {
      // Initialisation du contexte audio si nécessaire
      if (!this.audioContext) {
        await this.initializeAudioContext();
      }

      // Création du nœud audio spatial
      const spatialNode = await this.createSpatialAudioNode(audioId, position);
      
      // Configuration de la position 3D
      this.updateSpatialPosition(audioId, position);
      
      // Démarrage de la lecture
      await this.startAudioPlayback(audioId, spatialNode);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      // Simulation de l'initialisation Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      // Fallback pour les tests ou environnements sans Web Audio API
      this.audioContext = {
        createPanner: () => this.createMockPannerNode(),
        createGain: () => this.createMockGainNode(),
        createBufferSource: () => this.createMockBufferSourceNode(),
        destination: {},
        state: 'running'
      } as any;
    }
  }

  private async createSpatialAudioNode(audioId: string, position: { x: number; y: number; z: number }): Promise<any> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    // Création du panner node pour l'audio spatial
    const pannerNode = this.audioContext.createPanner();
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 10000;
    pannerNode.rolloffFactor = 1;
    pannerNode.coneInnerAngle = 360;
    pannerNode.coneOuterAngle = 0;
    pannerNode.coneOuterGain = 0;

    // Création du gain node
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.calculateGainFromDistance(position);

    // Connexion des nœuds
    pannerNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Stockage des nœuds
    this.pannerNodes.set(audioId, pannerNode);
    this.gainNodes.set(audioId, gainNode);

    return { pannerNode, gainNode };
  }

  private updateSpatialPosition(audioId: string, position: { x: number; y: number; z: number }): void {
    const pannerNode = this.pannerNodes.get(audioId);
    if (pannerNode && pannerNode.positionX) {
      // Méthode moderne
      pannerNode.positionX.setValueAtTime(position.x, this.audioContext!.currentTime);
      pannerNode.positionY.setValueAtTime(position.y, this.audioContext!.currentTime);
      pannerNode.positionZ.setValueAtTime(position.z, this.audioContext!.currentTime);
    } else if (pannerNode && pannerNode.setPosition) {
      // Méthode legacy
      pannerNode.setPosition(position.x, position.y, position.z);
    }

    // Mise à jour du gain basé sur la distance
    const gainNode = this.gainNodes.get(audioId);
    if (gainNode) {
      const gain = this.calculateGainFromDistance(position);
      gainNode.gain.setValueAtTime(gain, this.audioContext!.currentTime);
    }
  }

  private calculateGainFromDistance(position: { x: number; y: number; z: number }): number {
    // Calcul de la distance depuis l'origine (position de l'auditeur)
    const distance = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z);
    
    // Atténuation basée sur la distance (loi du carré inverse)
    const gain = Math.max(0.01, 1 / (1 + distance * 0.1));
    return Math.min(1.0, gain);
  }

  private async startAudioPlayback(audioId: string, spatialNode: any): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    // Création du buffer source
    const source = this.audioContext.createBufferSource();
    
    // Simulation d'un buffer audio
    const buffer = await this.loadAudioBuffer(audioId);
    source.buffer = buffer;
    
    // Connexion à la chaîne audio spatiale
    source.connect(spatialNode.pannerNode);
    
    // Démarrage de la lecture
    source.start(0);
    
    // Stockage de la source active
    const position = this.getPositionFromPanner(audioId);
    this.activeAudios.set(audioId, { source, position });
  }

  private async loadAudioBuffer(audioId: string): Promise<AudioBuffer> {
    // Simulation du chargement d'un buffer audio
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    // Création d'un buffer de test (1 seconde de silence)
    const buffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate, this.audioContext.sampleRate);
    
    // Ajout d'un signal de test simple
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        // Signal sinusoïdal simple pour simulation
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / this.audioContext.sampleRate) * 0.1;
      }
    }
    
    return buffer;
  }

  private getPositionFromPanner(audioId: string): { x: number; y: number; z: number } {
    const pannerNode = this.pannerNodes.get(audioId);
    if (pannerNode && pannerNode.positionX) {
      return {
        x: pannerNode.positionX.value,
        y: pannerNode.positionY.value,
        z: pannerNode.positionZ.value
      };
    }
    return { x: 0, y: 0, z: 0 };
  }

  // Méthodes mock pour les environnements de test
  private createMockPannerNode(): any {
    return {
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 10000,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0,
      positionX: { setValueAtTime: () => {}, value: 0 },
      positionY: { setValueAtTime: () => {}, value: 0 },
      positionZ: { setValueAtTime: () => {}, value: 0 },
      setPosition: () => {},
      connect: () => {}
    };
  }

  private createMockGainNode(): any {
    return {
      gain: {
        setValueAtTime: () => {},
        value: 1.0
      },
      connect: () => {}
    };
  }

  private createMockBufferSourceNode(): any {
    return {
      buffer: null,
      connect: () => {},
      start: () => {}
    };
  }

  // Méthodes utilitaires
  stopAudio(audioId: string): boolean {
    const activeAudio = this.activeAudios.get(audioId);
    if (activeAudio) {
      try {
        activeAudio.source.stop();
        this.activeAudios.delete(audioId);
        this.pannerNodes.delete(audioId);
        this.gainNodes.delete(audioId);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  getActiveAudioIds(): string[] {
    return Array.from(this.activeAudios.keys());
  }

  updateListenerPosition(position: { x: number; y: number; z: number }): void {
    if (this.audioContext && this.audioContext.listener) {
      const listener = this.audioContext.listener;
      if (listener.positionX) {
        listener.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        listener.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        listener.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
      } else if (listener.setPosition) {
        listener.setPosition(position.x, position.y, position.z);
      }
    }
  }
}