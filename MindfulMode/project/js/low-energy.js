// Low Energy mood page specific functionality

let napTimer = null;
let napTimeLeft = 20 * 60; // 20 minutes in seconds
let gentleMusicTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeLowEnergyPage();
  setupLowEnergyActivities();
});

function initializeLowEnergyPage() {
  // Show gentle welcome message
  setTimeout(() => {
    showToast('Take it easy. Rest is productive too 💤', 'info', 4000);
  }, 2000);

  // Set up gentle prompts
  const energyInput = document.getElementById('energyText');
  if (energyInput) {
    energyInput.placeholder = 'What\'s draining your energy today? 🔋';
  }

  const journalInput = document.getElementById('restJournalText');
  if (journalInput) {
    const restPrompts = [
      "What would help you feel more energized?",
      "What's one small thing you can do to recharge?",
      "How can you be gentler with yourself today?",
      "What does rest look like for you right now?",
      "What's your body telling you it needs?"
    ];
    
    journalInput.placeholder = randomChoice(restPrompts) + ' 🌱';
  }
}

function setupLowEnergyActivities() {
  // Initialize nap timer display
  updateNapTimerDisplay();
}

// Nap Timer Functions
function startNapTimer() {
  if (napTimer) return;
  
  const startBtn = document.getElementById('startNapBtn');
  const stopBtn = document.getElementById('stopNapBtn');
  
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  
  napTimer = setInterval(() => {
    napTimeLeft--;
    updateNapTimerDisplay();
    
    if (napTimeLeft <= 0) {
      completeNapSession();
    }
  }, 1000);
  
  showToast('Nap timer started. Sweet dreams! 💤', 'success');
  playSound('success');
}

function stopNapTimer() {
  if (napTimer) {
    clearInterval(napTimer);
    napTimer = null;
  }
  
  const startBtn = document.getElementById('startNapBtn');
  const stopBtn = document.getElementById('stopNapBtn');
  
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  
  showToast('Nap timer stopped', 'info');
  playSound('click');
}

function completeNapSession() {
  clearInterval(napTimer);
  napTimer = null;
  napTimeLeft = 20 * 60; // Reset to 20 minutes
  
  // Reset UI
  const startBtn = document.getElementById('startNapBtn');
  const stopBtn = document.getElementById('stopNapBtn');
  
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  
  updateNapTimerDisplay();
  
  // Add activity drop
  storage.addDrop('activity', 'Completed power nap session', {
    type: 'nap',
    duration: '20 minutes',
    mood: 'low-energy'
  });
  
  showToast('Power nap complete! Feeling refreshed? 🌟', 'success');
  createConfetti(document.getElementById('napTimer'));
  playSound('complete');
  hapticFeedback('heavy');
}

function updateNapTimerDisplay() {
  const timerDisplay = document.getElementById('napText');
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(napTimeLeft);
  }
}

// Energy Check
function saveEnergyCheck() {
  const textArea = document.getElementById('energyText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please share what\'s affecting your energy 🔋', 'warning');
    return;
  }

  const energyText = textArea.value.trim();
  
  // Save as drop
  storage.addDrop('journal', energyText, {
    type: 'energy-check',
    mood: 'low-energy'
  });

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Energy check saved! Take care of yourself 💙', 'success');
  createFloatingElement('🔋', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Gentle Music
function playGentleMusic() {
  const playBtn = document.getElementById('playGentleBtn');
  const stopBtn = document.getElementById('stopGentleBtn');
  const visual = document.getElementById('gentleMusicVisual');
  const timer = document.getElementById('gentleTimer');

  if (!playBtn || !stopBtn || !visual || !timer) return;

  // Update UI
  playBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  visual.classList.add('playing');

  // Start gentle ocean sounds
  audioManager.playZenMusic('ocean', 600); // 10 minutes

  // Start timer countdown
  let timeLeft = 600; // 10 minutes in seconds
  timer.textContent = formatTime(timeLeft);

  gentleMusicTimer = setInterval(() => {
    timeLeft--;
    timer.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      stopGentleMusic();
      completeGentleMusicSession();
    }
  }, 1000);

  showToast('Gentle ocean sounds starting... 🌊', 'info');
  playSound('success');
}

function stopGentleMusic() {
  const playBtn = document.getElementById('playGentleBtn');
  const stopBtn = document.getElementById('stopGentleBtn');
  const visual = document.getElementById('gentleMusicVisual');
  const timer = document.getElementById('gentleTimer');

  // Update UI
  if (playBtn) playBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (visual) visual.classList.remove('playing');
  if (timer) timer.textContent = '10:00';

  // Stop music and timer
  audioManager.stopCurrentAudio();
  if (gentleMusicTimer) {
    clearInterval(gentleMusicTimer);
    gentleMusicTimer = null;
  }
}

function completeGentleMusicSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed gentle sounds session', {
    type: 'music',
    duration: '10 minutes',
    soundType: 'ocean',
    mood: 'low-energy'
  });

  showToast('Gentle sounds session complete! 🌊✨', 'success');
  playSound('complete');
  hapticFeedback('heavy');
}

// Rest Journal
function saveRestJournal() {
  const textArea = document.getElementById('restJournalText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please write something in your rest journal! 📖', 'warning');
    return;
  }

  const journalText = textArea.value.trim();
  
  // Save journal entry
  storage.addJournalEntry(journalText, 'low-energy');

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Rest journal entry saved! 📖✨', 'success');
  createFloatingElement('📝', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (napTimer) {
    clearInterval(napTimer);
  }
  if (gentleMusicTimer) {
    clearInterval(gentleMusicTimer);
  }
});