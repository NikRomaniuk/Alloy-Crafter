import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NativeAudio } from '@capacitor-community/native-audio';

interface SoundConfig {
  id: string;
  path: string;
  volume?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sounds: SoundConfig[] = [
    { id: 'bang_01', path: 'assets/audio/sounds/hammer_01.mp3', volume: 0.8 },
    { id: 'bang_02', path: 'assets/audio/sounds/hammer_02.mp3', volume: 0.8 },
    { id: 'bang_03', path: 'assets/audio/sounds/hammer_03.mp3', volume: 0.6 },
    { id: 'craft-complete_01', path: 'assets/audio/sounds/bubble_01.mp3', volume: 0.5 },
  ];

  constructor() {}

  async preloadAll() {
    try {
      const isWeb = Capacitor.getPlatform() === 'web';

      for (const sound of this.sounds) {
        const assetPath = isWeb
          ? `${window.location.origin}/${sound.path.replace(/^\/+/, '')}`
          : sound.path.replace(/^\/+/, '');

        await NativeAudio.preload({
          assetId: sound.id,
          assetPath,
          audioChannelNum: 1,
          isUrl: isWeb,
          volume: sound.volume || 1.0,
        });
      }
      console.log('All sounds preloaded successfully');
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  }

  async play(id: string) {
    try {
      await NativeAudio.play({ assetId: id });
    } catch (error) {
      console.error(`Error playing sound ${id}:`, error);
    }
  }
}
