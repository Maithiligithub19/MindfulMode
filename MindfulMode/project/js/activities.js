// Shared activity functionality for MindfulMode

class ActivityManager {
  constructor() {
    this.activeTimers = new Map();
    this.breathingState = null;
    this.musicTimer = null;
  }

  // Breathing exercise
  startBreathing() {
    if (this.breathingState) {
      this.stopBreathing();
      return;
    }

    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathText');
    const startBtn = document.getElementById('startBreathBtn');
    const stopBtn = document.getElementById('stopBreathBtn');

    if (!circle || !text) return;

    // Update UI
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';

    // 4-7-8 breathing pattern
    const phases = [
      { name: 'inhale', duration: 4000, text: 'Breathe In' },
      { name: 'hold', duration: 7000, text: 'Hold' },
      { name: 'exhale', duration: 8000, text: 'Breathe Out' },
      { name: 'pause', duration: 1000, text: 'Relax' }
    ];

    let currentPhase = 0;
    let cycleCount = 0;

    const runCycle = () => {
      if (!this.breathingState) return;

      const phase = phases[currentPhase];
      
      // Update visual and text
      circle.className = `breathing-circle ${phase.name}`;
      text.textContent = phase.text;

      // Play breathing cue sound
      if (phase.name !== 'pause') {
        audioManager.playBreathingCue(phase.name, phase.duration / 1000);
      }

      // Schedule next phase
      this.breathingState = setTimeout(() => {
        currentPhase = (currentPhase + 1) % phases.length;
        
        if (currentPhase === 0) {
          cycleCount++;
          if (cycleCount >= 5) { // 5 cycles = ~2.5 minutes
            this.stopBreathing();
            this.completeBreathingSession();
            return;
          }
        }
        
        runCycle();
      }, phase.duration);
    };

    this.breathingState = true;
    runCycle();
    playSound('success');
  }

  stopBreathing() {
    if (this.breathingState) {
      clearTimeout(this.breathingState);
      this.breathingState = null;
    }

    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathText');
    const startBtn = document.getElementById('startBreathBtn');
    const stopBtn = document.getElementById('stopBreathBtn');

    if (circle) {
      circle.className = 'breathing-circle';
    }
    if (text) {
      text.textContent = 'Click to Start';
    }
    if (startBtn) {
      startBtn.style.display = 'inline-block';
    }
    if (stopBtn) {
      stopBtn.style.display = 'none';
    }
  }

  completeBreathingSession() {
    // Add activity drop
    storage.addDrop('activity', 'Completed breathing exercise', {
      type: 'breathing',
      duration: '2.5 minutes',
      technique: '4-7-8'
    });

    // Update stats
    storage.updateUserStats('activitiesCompleted', 1);

    // Show completion message
    showToast('Breathing session complete! 🫁✨', 'success');
    createConfetti(document.getElementById('breathingCircle'));
    playSound('bell'); // Use bell sound for completion
    hapticFeedback('heavy');
  }

  // Gratitude functionality
  saveGratitude() {
    const textArea = document.getElementById('gratitudeText');
    if (!textArea || !textArea.value.trim()) {
      showToast('Please write something you\'re grateful for! 🙏', 'warning');
      return;
    }

    const gratitudeText = textArea.value.trim();
    
    // Save as drop
    storage.addDrop('gratitude', gratitudeText, {
      type: 'gratitude',
      prompt: quoteManager.getGratitudePrompt()
    });

    // Clear input
    textArea.value = '';
    
    // Show success
    showToast('Gratitude drop added to your cloud! ☁️✨', 'success');
    createFloatingElement('🙏', textArea.parentElement);
    playSound('success');
    hapticFeedback('medium');

    // Show new prompt
    setTimeout(() => {
      textArea.placeholder = quoteManager.getGratitudePrompt() + ' ✨';
    }, 1000);
  }

  // Music player
  playZenMusic() {
    const playBtn = document.getElementById('playMusicBtn');
    const stopBtn = document.getElementById('stopMusicBtn');
    const visual = document.getElementById('musicVisual');
    const timer = document.getElementById('musicTimer');

    if (!playBtn || !stopBtn || !visual || !timer) return;

    // Update UI
    playBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    visual.classList.add('playing');

    // Get current mood from page context
    const currentMood = this.getCurrentMood();
    
    // Start music with mood-specific sound
    const musicType = this.getMusicTypeForMood(currentMood);
    audioManager.playZenMusic(musicType, 600, currentMood); // 10 minutes

    // Start timer countdown
    let timeLeft = 600; // 10 minutes in seconds
    timer.textContent = formatTime(timeLeft);

    this.musicTimer = setInterval(() => {
      timeLeft--;
      timer.textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        this.stopZenMusic();
        this.completeMusicSession();
      }
    }, 1000);

    playSound('success');
  }

  getMusicTypeForMood(mood) {
    const moodMusic = {
      'anxious': 'rain',
      'low-energy': 'ocean',
      'confident': 'wind',
      'unfocused': 'forest',
      'excited': 'rain'
    };
    return moodMusic[mood] || 'rain';
  }

  stopZenMusic() {
    const playBtn = document.getElementById('playMusicBtn');
    const stopBtn = document.getElementById('stopMusicBtn');
    const visual = document.getElementById('musicVisual');
    const timer = document.getElementById('musicTimer');

    // Update UI
    if (playBtn) playBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
    if (visual) visual.classList.remove('playing');
    if (timer) timer.textContent = '10:00';

    // Stop music and timer
    audioManager.stopCurrentAudio();
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  completeMusicSession() {
    const currentMood = this.getCurrentMood();
    const musicType = this.getMusicTypeForMood(currentMood);
    
    // Add activity drop
    storage.addDrop('activity', 'Completed zen music session', {
      type: 'music',
      duration: '10 minutes',
      soundType: musicType,
      mood: currentMood
    });

    // Update stats
    storage.updateUserStats('activitiesCompleted', 1);

    // Show completion message
    showToast('Zen music session complete! 🎵✨', 'success');
    playSound('timer'); // Use timer sound for completion
    hapticFeedback('heavy');
  }

  // Journal functionality
  saveJournal() {
    const textArea = document.getElementById('journalText');
    if (!textArea || !textArea.value.trim()) {
      showToast('Please write something in your journal! 📖', 'warning');
      return;
    }

    const journalText = textArea.value.trim();
    const currentMood = this.getCurrentMood();
    
    // Save journal entry
    storage.addJournalEntry(journalText, currentMood);

    // Clear input
    textArea.value = '';
    
    // Show success
    showToast('Journal entry saved! 📖✨', 'success');
    createFloatingElement('📝', textArea.parentElement);
    playSound('success');
    hapticFeedback('medium');

    // Update placeholder
    setTimeout(() => {
      textArea.placeholder = 'How are you feeling now? Let it all out... 💭';
    }, 1000);
  }

  exportJournal() {
    const journalContent = storage.exportJournalEntries();
    
    if (!journalContent || journalContent.length < 100) {
      showToast('No journal entries to export yet! 📖', 'warning');
      return;
    }

    const filename = `mindful-journal-${new Date().toISOString().split('T')[0]}.txt`;
    downloadAsFile(journalContent, filename, 'text/plain');
    
    showToast('Journal exported successfully! 📄', 'success');
    playSound('success');
  }

  getCurrentMood() {
    // Get mood from URL or page context
    const path = window.location.pathname;
    if (path.includes('anxious')) return 'anxious';
    if (path.includes('low-energy')) return 'low-energy';
    if (path.includes('confident')) return 'confident';
    if (path.includes('unfocused')) return 'unfocused';
    if (path.includes('excited')) return 'excited';
    return null;
  }

  // Activity completion tracking
  completeActivity(activityType, metadata = {}) {
    // Add activity drop
    storage.addDrop('activity', `Completed ${activityType}`, {
      type: activityType,
      ...metadata
    });

    // Update stats
    storage.updateUserStats('activitiesCompleted', 1);

    // Check for badges
    const badges = storage.checkBadges();
    this.checkNewBadges(badges);
  }

  checkNewBadges(currentBadges) {
    const previousBadges = JSON.parse(localStorage.getItem('mindful-badges') || '[]');
    const newBadges = currentBadges.filter(badge => !previousBadges.includes(badge));
    
    if (newBadges.length > 0) {
      localStorage.setItem('mindful-badges', JSON.stringify(currentBadges));
      
      newBadges.forEach(badge => {
        this.showBadgeEarned(badge);
      });
    }
  }

  showBadgeEarned(badgeId) {
    const badgeNames = {
      'focus-ninja': '🧠 Focus Ninja',
      'gratitude-guru': '🙏 Gratitude Guru',
      'task-master': '✅ Task Master',
      'streak-star': '⭐ Streak Star',
      'zen-master': '🧘 Zen Master',
      'sharp-shooter': '🎯 Sharp Shooter'
    };

    const badgeName = badgeNames[badgeId] || badgeId;
    showToast(`Badge Earned: ${badgeName}! 🏆`, 'success', 5000);
    
    // Create special celebration
    createConfetti(document.body);
    playSound('complete');
    hapticFeedback('heavy');
  }

  // Cleanup
  destroy() {
    this.stopBreathing();
    this.stopZenMusic();
    
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
  }
}

// Create global activity manager
const activityManager = new ActivityManager();

// Global activity functions
function startBreathing() {
  activityManager.startBreathing();
}

function stopBreathing() {
  activityManager.stopBreathing();
}

function saveGratitude() {
  activityManager.saveGratitude();
}

function playZenMusic() {
  activityManager.playZenMusic();
}

function stopZenMusic() {
  activityManager.stopZenMusic();
}

function saveJournal() {
  activityManager.saveJournal();
}

function exportJournal() {
  activityManager.exportJournal();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  activityManager.destroy();
});

// Initialize activity page
document.addEventListener('DOMContentLoaded', () => {
  // Add click sounds to activity buttons
  const activityBtns = document.querySelectorAll('.activity-btn');
  activityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Auto-focus text areas
  const textAreas = document.querySelectorAll('textarea');
  textAreas.forEach(textarea => {
    textarea.addEventListener('focus', () => {
      playSound('click');
    });
  });

  // Add enter key shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        // Ctrl/Cmd + Enter to save
        const activeElement = document.activeElement;
        if (activeElement.id === 'gratitudeText') {
          saveGratitude();
        } else if (activeElement.id === 'journalText') {
          saveJournal();
        }
      }
    }
  });
});