// Audio management for MindfulMode

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.backgroundMusic = null;
    this.soundEffects = {};
    this.masterVolume = 0.9; // Increased default volume
    this.musicVolume = 0.8; // Increased music volume
    this.effectsVolume = 1.0; // Maximum effects volume
    this.isInitialized = false;
    
    this.loadSettings();
    this.initializeAudio();
  }

  async initializeAudio() {
    try {
      // Create audio context on user interaction
      document.addEventListener('click', this.createAudioContext.bind(this), { once: true });
      document.addEventListener('touchstart', this.createAudioContext.bind(this), { once: true });
      
      // Preload sound effects
      this.preloadSounds();
      
      this.isInitialized = true;
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }

  createAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context created successfully');
      } catch (error) {
        console.log('Failed to create audio context:', error);
      }
    }
  }

  loadSettings() {
    const settings = storage ? storage.getSettings() : {};
    this.masterVolume = (settings.masterVolume || 90) / 100; // Increased default
    this.musicEnabled = settings.backgroundMusic !== false; // Default to true
    this.effectsEnabled = settings.soundEffects !== false;
  }

  preloadSounds() {
    // Create enhanced sound effects with higher volume
    this.soundEffects = {
      click: this.createTone(800, 0.15, 'sine'),
      success: this.createTone(600, 0.3, 'sine'),
      complete: this.createChord([523.25, 659.25, 783.99], 0.5), // C major chord - longer
      notification: this.createTone(440, 0.2, 'sine'),
      error: this.createTone(200, 0.3, 'sawtooth'),
      timer: this.createTimerSound(), // New timer completion sound
      bell: this.createBellSound() // New bell sound for sessions
    };
  }

  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (!this.audioContext || !this.effectsEnabled) return;
      
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * this.effectsVolume * 0.6, this.audioContext.currentTime + 0.01); // Increased volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      } catch (error) {
        console.log('Error playing tone:', error);
      }
    };
  }

  createChord(frequencies, duration) {
    return () => {
      if (!this.audioContext || !this.effectsEnabled) return;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * this.effectsVolume * 0.4, this.audioContext.currentTime + 0.01); // Increased volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
          } catch (error) {
            console.log('Error playing chord note:', error);
          }
        }, index * 100); // Slightly longer delay for better chord effect
      });
    };
  }

  createTimerSound() {
    return () => {
      if (!this.audioContext || !this.effectsEnabled) return;
      
      try {
        // Create a pleasant timer completion sound
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C major scale
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * this.effectsVolume * 0.5, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
          }, index * 150);
        });
      } catch (error) {
        console.log('Error playing timer sound:', error);
      }
    };
  }

  createBellSound() {
    return () => {
      if (!this.audioContext || !this.effectsEnabled) return;
      
      try {
        // Create a meditation bell sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * this.effectsVolume * 0.7, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);
      } catch (error) {
        console.log('Error playing bell sound:', error);
      }
    };
  }

  // Play sound effect
  playSound(soundName) {
    if (this.soundEffects[soundName] && this.effectsEnabled) {
      this.soundEffects[soundName]();
    }
  }

  // Create mood-specific ambient sounds
  createAmbientSound(type = 'rain', mood = null) {
    if (!this.audioContext) {
      console.log('Audio context not available');
      return null;
    }

    try {
      const bufferSize = this.audioContext.sampleRate * 4; // Longer buffer for better quality
      const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
      
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        
        for (let i = 0; i < bufferSize; i++) {
          switch (type) {
            case 'rain':
              // Different rain intensity based on mood
              const intensity = mood === 'excited' ? 0.15 : mood === 'anxious' ? 0.08 : 0.12;
              channelData[i] = (Math.random() * 2 - 1) * intensity;
              break;
            case 'ocean':
              // Gentle ocean waves for low energy
              channelData[i] = Math.sin(i * 0.008) * 0.12 + (Math.random() * 2 - 1) * 0.06;
              break;
            case 'forest':
              // Forest sounds for focus
              channelData[i] = (Math.random() * 2 - 1) * 0.08 + Math.sin(i * 0.002) * 0.04;
              break;
            case 'wind':
              // Wind sounds for confidence
              channelData[i] = (Math.random() * 2 - 1) * 0.1 + Math.sin(i * 0.005) * 0.05;
              break;
            default:
              channelData[i] = (Math.random() * 2 - 1) * 0.1;
          }
        }
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      source.buffer = buffer;
      source.loop = true;
      
      // Adjust filter based on mood
      filter.type = 'lowpass';
      const filterFreq = mood === 'excited' ? 1200 : mood === 'anxious' ? 600 : 800;
      filter.frequency.setValueAtTime(filterFreq, this.audioContext.currentTime);
      
      // Increased volume
      gainNode.gain.setValueAtTime(this.masterVolume * this.musicVolume * 0.6, this.audioContext.currentTime);
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      return { source, gainNode, filter };
    } catch (error) {
      console.log('Error creating ambient sound:', error);
      return null;
    }
  }

  // Play zen music with mood-specific sounds
  playZenMusic(type = 'rain', duration = 600, mood = null) {
    this.stopCurrentAudio();
    
    // Ensure audio context is created
    this.createAudioContext();
    
    if (!this.audioContext) {
      console.log('Audio context not available for zen music');
      return null;
    }
    
    // Select sound type based on mood if not specified
    if (!type && mood) {
      const moodSounds = {
        'anxious': 'rain',
        'low-energy': 'ocean',
        'confident': 'wind',
        'unfocused': 'forest',
        'excited': 'rain'
      };
      type = moodSounds[mood] || 'rain';
    }
    
    const ambient = this.createAmbientSound(type, mood);
    if (!ambient) return null;
    
    try {
      ambient.source.start();
      this.currentAudio = ambient;
      
      console.log(`Playing ${type} sounds for ${duration} seconds (mood: ${mood})`);
      
      // Auto-stop after duration
      setTimeout(() => {
        this.stopCurrentAudio();
      }, duration * 1000);
      
      return ambient;
    } catch (error) {
      console.log('Error starting zen music:', error);
      return null;
    }
  }

  // Stop current audio
  stopCurrentAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.source.stop();
        this.currentAudio = null;
        console.log('Stopped current audio');
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
  }

  // Background music control
  startBackgroundMusic() {
    if (this.backgroundMusic || !this.musicEnabled) return;
    
    this.backgroundMusic = this.createAmbientSound('forest');
    if (this.backgroundMusic) {
      this.backgroundMusic.gainNode.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
      this.backgroundMusic.source.start();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.source.stop();
        this.backgroundMusic = null;
      } catch (error) {
        console.log('Error stopping background music:', error);
      }
    }
  }

  // Volume controls
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume / 100));
    
    if (this.currentAudio) {
      this.currentAudio.gainNode.gain.setValueAtTime(
        this.masterVolume * this.musicVolume * 0.6,
        this.audioContext.currentTime
      );
    }
    
    if (this.backgroundMusic) {
      this.backgroundMusic.gainNode.gain.setValueAtTime(
        this.masterVolume * 0.2,
        this.audioContext.currentTime
      );
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume / 100));
    
    if (this.currentAudio) {
      this.currentAudio.gainNode.gain.setValueAtTime(
        this.masterVolume * this.musicVolume * 0.6,
        this.audioContext.currentTime
      );
    }
  }

  setEffectsVolume(volume) {
    this.effectsVolume = Math.max(0, Math.min(1, volume / 100));
  }

  // Settings
  toggleBackgroundMusic(enabled) {
    this.musicEnabled = enabled;
    
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  toggleSoundEffects(enabled) {
    this.effectsEnabled = enabled;
  }

  // Breathing sound guidance
  createBreathingGuide() {
    if (!this.audioContext) return null;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      
      return { oscillator, gainNode };
    } catch (error) {
      console.log('Error creating breathing guide:', error);
      return null;
    }
  }

  playBreathingCue(phase, duration) {
    if (!this.effectsEnabled) return;
    
    const guide = this.createBreathingGuide();
    if (!guide) return;
    
    const { oscillator, gainNode } = guide;
    const volume = this.masterVolume * this.effectsVolume * 0.2; // Increased volume
    
    try {
      switch (phase) {
        case 'inhale':
          oscillator.frequency.linearRampToValueAtTime(440, this.audioContext.currentTime + duration);
          gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + duration);
          break;
        case 'hold':
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
          break;
        case 'exhale':
          oscillator.frequency.linearRampToValueAtTime(220, this.audioContext.currentTime + duration);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
          break;
      }
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.log('Error playing breathing cue:', error);
    }
  }

  // Cleanup
  destroy() {
    this.stopCurrentAudio();
    this.stopBackgroundMusic();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create global audio manager
const audioManager = new AudioManager();

// Global audio functions
function playSound(soundName) {
  audioManager.playSound(soundName);
}

function playZenMusic(type = 'rain', duration = 600, mood = null) {
  return audioManager.playZenMusic(type, duration, mood);
}

function stopZenMusic() {
  audioManager.stopCurrentAudio();
}

function toggleBackgroundMusic() {
  const settings = storage ? storage.getSettings() : {};
  const enabled = !settings.backgroundMusic;
  if (storage) {
    storage.updateSettings({ backgroundMusic: enabled });
  }
  audioManager.toggleBackgroundMusic(enabled);
  return enabled;
}

function toggleSoundEffects() {
  const settings = storage ? storage.getSettings() : {};
  const enabled = !settings.soundEffects;
  if (storage) {
    storage.updateSettings({ soundEffects: enabled });
  }
  audioManager.toggleSoundEffects(enabled);
  return enabled;
}

function changeMasterVolume(volume) {
  audioManager.setMasterVolume(volume);
  if (storage) {
    storage.updateSettings({ masterVolume: volume });
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  audioManager.destroy();
});