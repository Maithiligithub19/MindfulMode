// Unfocused mood page specific functionality

let focusBreathingState = null;
let focusMusicTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeUnfocusedPage();
  setupUnfocusedActivities();
});

function initializeUnfocusedPage() {
  // Show focusing welcome message
  setTimeout(() => {
    showToast('Let\'s clear the mental fog and find your focus 🎯', 'info', 4000);
  }, 2000);

  // Set up focusing prompts
  const priorityInput = document.getElementById('priorityText');
  if (priorityInput) {
    priorityInput.placeholder = 'What\'s the ONE thing you need to focus on right now? 🎯';
  }

  const journalInput = document.getElementById('clarityJournalText');
  if (journalInput) {
    const clarityPrompts = [
      "What's clouding your focus right now?",
      "What would help you feel more clear?",
      "What's the most important thing today?",
      "What distractions can you eliminate?",
      "How can you simplify your current situation?"
    ];
    
    journalInput.placeholder = randomChoice(clarityPrompts) + ' 🌫️';
  }
}

function setupUnfocusedActivities() {
  // Set focus timer to 25 minutes (Pomodoro style)
  const focusTimer = document.getElementById('focusTimer');
  if (focusTimer) {
    focusTimer.textContent = '25:00';
  }
}

// Focus Breathing (Box Breathing)
function startFocusBreathing() {
  if (focusBreathingState) {
    stopFocusBreathing();
    return;
  }

  const circle = document.getElementById('focusBreathingCircle');
  const text = document.getElementById('focusBreathText');
  const startBtn = document.getElementById('startFocusBreathBtn');
  const stopBtn = document.getElementById('stopFocusBreathBtn');

  if (!circle || !text) return;

  // Update UI
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';

  // Box breathing pattern (4-4-4-4)
  const phases = [
    { name: 'inhale', duration: 4000, text: 'Breathe In' },
    { name: 'hold', duration: 4000, text: 'Hold' },
    { name: 'exhale', duration: 4000, text: 'Breathe Out' },
    { name: 'hold', duration: 4000, text: 'Hold' }
  ];

  let currentPhase = 0;
  let cycleCount = 0;

  const runCycle = () => {
    if (!focusBreathingState) return;

    const phase = phases[currentPhase];
    
    // Update visual and text
    circle.className = `breathing-circle ${phase.name}`;
    text.textContent = phase.text;

    // Play breathing cue sound
    if (phase.name !== 'pause') {
      audioManager.playBreathingCue(phase.name, phase.duration / 1000);
    }

    // Schedule next phase
    focusBreathingState = setTimeout(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      
      if (currentPhase === 0) {
        cycleCount++;
        if (cycleCount >= 6) { // 6 cycles = ~3 minutes
          stopFocusBreathing();
          completeFocusBreathingSession();
          return;
        }
      }
      
      runCycle();
    }, phase.duration);
  };

  focusBreathingState = true;
  runCycle();
  showToast('Box breathing started. Focus on the rhythm 🧠', 'success');
  playSound('success');
}

function stopFocusBreathing() {
  if (focusBreathingState) {
    clearTimeout(focusBreathingState);
    focusBreathingState = null;
  }

  const circle = document.getElementById('focusBreathingCircle');
  const text = document.getElementById('focusBreathText');
  const startBtn = document.getElementById('startFocusBreathBtn');
  const stopBtn = document.getElementById('stopFocusBreathBtn');

  if (circle) circle.className = 'breathing-circle';
  if (text) text.textContent = 'Click to Start';
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
}

function completeFocusBreathingSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed focus breathing session', {
    type: 'breathing',
    duration: '3 minutes',
    technique: 'box-breathing',
    mood: 'unfocused'
  });

  showToast('Focus breathing complete! Mind feeling clearer? 🧠✨', 'success');
  createConfetti(document.getElementById('focusBreathingCircle'));
  playSound('complete');
  hapticFeedback('heavy');
}

// Priority Drop
function savePriority() {
  const textArea = document.getElementById('priorityText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please identify your top priority! 🎯', 'warning');
    return;
  }

  const priorityText = textArea.value.trim();
  
  // Save as drop
  storage.addDrop('task', priorityText, {
    type: 'priority',
    mood: 'unfocused'
  });

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Priority locked in! Stay focused on what matters 🔒', 'success');
  createFloatingElement('🎯', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Focus Music (25 minutes for Pomodoro)
function playFocusMusic() {
  const playBtn = document.getElementById('playFocusBtn');
  const stopBtn = document.getElementById('stopFocusBtn');
  const visual = document.getElementById('focusMusicVisual');
  const timer = document.getElementById('focusTimer');

  if (!playBtn || !stopBtn || !visual || !timer) return;

  // Update UI
  playBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  visual.classList.add('playing');

  // Start focus sounds (white noise style)
  audioManager.playZenMusic('forest', 1500); // 25 minutes

  // Start timer countdown
  let timeLeft = 1500; // 25 minutes in seconds
  timer.textContent = formatTime(timeLeft);

  focusMusicTimer = setInterval(() => {
    timeLeft--;
    timer.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      stopFocusMusic();
      completeFocusMusicSession();
    }
  }, 1000);

  showToast('Focus sounds starting! Time to get in the zone 🎯', 'info');
  playSound('success');
}

function stopFocusMusic() {
  const playBtn = document.getElementById('playFocusBtn');
  const stopBtn = document.getElementById('stopFocusBtn');
  const visual = document.getElementById('focusMusicVisual');
  const timer = document.getElementById('focusTimer');

  // Update UI
  if (playBtn) playBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (visual) visual.classList.remove('playing');
  if (timer) timer.textContent = '25:00';

  // Stop music and timer
  audioManager.stopCurrentAudio();
  if (focusMusicTimer) {
    clearInterval(focusMusicTimer);
    focusMusicTimer = null;
  }
}

function completeFocusMusicSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed focus session', {
    type: 'music',
    duration: '25 minutes',
    soundType: 'focus',
    mood: 'unfocused'
  });

  showToast('Focus session complete! Great work staying concentrated! 🎯✨', 'success');
  playSound('complete');
  hapticFeedback('heavy');
}

// Clarity Journal
function saveClarityJournal() {
  const textArea = document.getElementById('clarityJournalText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please write something in your clarity journal! 📖', 'warning');
    return;
  }

  const journalText = textArea.value.trim();
  
  // Save journal entry
  storage.addJournalEntry(journalText, 'unfocused');

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Clarity journal entry saved! 📖✨', 'success');
  createFloatingElement('🧠', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (focusBreathingState) {
    clearTimeout(focusBreathingState);
  }
  if (focusMusicTimer) {
    clearInterval(focusMusicTimer);
  }
});