// Excited mood page specific functionality

let energyChannelTimer = null;
let energyChannelIndex = 0;
let pumpMusicTimer = null;

const energyChannelPhrases = [
  "Feel that energy flowing",
  "Channel it into something amazing",
  "You've got incredible power",
  "Direct that excitement",
  "Transform energy into action",
  "Harness your enthusiasm",
  "Focus that beautiful energy",
  "You're unstoppable right now",
  "Use this momentum wisely",
  "Your energy is contagious"
];

document.addEventListener('DOMContentLoaded', () => {
  initializeExcitedPage();
  setupExcitedActivities();
});

function initializeExcitedPage() {
  // Show energetic welcome message
  setTimeout(() => {
    showToast('Your energy is amazing! Let\'s channel it into something great 🚀', 'info', 4000);
  }, 2000);

  // Set up energetic prompts
  const excitementInput = document.getElementById('excitementText');
  if (excitementInput) {
    excitementInput.placeholder = 'What are you excited about right now? Share the energy! ⚡';
  }

  const journalInput = document.getElementById('hypeJournalText');
  if (journalInput) {
    const hypePrompts = [
      "What's making you feel so excited?",
      "How can you use this energy productively?",
      "What amazing thing could you create right now?",
      "What goal feels totally achievable today?",
      "How can you share this positive energy?"
    ];
    
    journalInput.placeholder = randomChoice(hypePrompts) + ' 🚀';
  }
}

function setupExcitedActivities() {
  // Set initial energy channel text
  const energyChannelText = document.getElementById('energyChannelText');
  if (energyChannelText) {
    energyChannelText.textContent = 'Click to Start';
  }
}

// Energy Channel
function startEnergyChannel() {
  if (energyChannelTimer) return;
  
  const startBtn = document.getElementById('startEnergyChannelBtn');
  const stopBtn = document.getElementById('stopEnergyChannelBtn');
  const circle = document.getElementById('energyChannelCircle');
  const text = document.getElementById('energyChannelText');
  
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  
  energyChannelIndex = 0;
  
  const showNextPhrase = () => {
    if (!energyChannelTimer) return;
    
    const phrase = energyChannelPhrases[energyChannelIndex];
    if (text) text.textContent = phrase;
    if (circle) {
      circle.classList.add('inhale');
      setTimeout(() => {
        circle.classList.remove('inhale');
      }, 2000);
    }
    
    energyChannelIndex = (energyChannelIndex + 1) % energyChannelPhrases.length;
    
    // Complete after showing all phrases
    if (energyChannelIndex === 0) {
      setTimeout(() => {
        stopEnergyChannel();
        completeEnergyChannelSession();
      }, 3000);
    }
  };
  
  // Start immediately and then every 4 seconds
  showNextPhrase();
  energyChannelTimer = setInterval(showNextPhrase, 4000);
  
  showToast('Energy channeling started! Feel the flow ⚡', 'success');
  playSound('success');
}

function stopEnergyChannel() {
  if (energyChannelTimer) {
    clearInterval(energyChannelTimer);
    energyChannelTimer = null;
  }
  
  const startBtn = document.getElementById('startEnergyChannelBtn');
  const stopBtn = document.getElementById('stopEnergyChannelBtn');
  const circle = document.getElementById('energyChannelCircle');
  const text = document.getElementById('energyChannelText');
  
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (circle) circle.classList.remove('inhale');
  if (text) text.textContent = 'Click to Start';
}

function completeEnergyChannelSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed energy channeling session', {
    type: 'energy-channel',
    duration: '2 minutes',
    mood: 'excited'
  });
  
  showToast('Energy channeling complete! Ready to take on the world! 🌟', 'success');
  createConfetti(document.getElementById('energyChannelCircle'));
  playSound('complete');
  hapticFeedback('heavy');
}

// Excitement Drop
function saveExcitement() {
  const textArea = document.getElementById('excitementText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please share what\'s got you hyped! ⚡', 'warning');
    return;
  }

  const excitementText = textArea.value.trim();
  
  // Save as drop
  storage.addDrop('gratitude', excitementText, {
    type: 'excitement',
    mood: 'excited'
  });

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Excitement added to your hype cloud! Keep that energy! 🎉✨', 'success');
  createFloatingElement('⚡', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Pump Up Music
function playPumpMusic() {
  const playBtn = document.getElementById('playPumpBtn');
  const stopBtn = document.getElementById('stopPumpBtn');
  const visual = document.getElementById('pumpMusicVisual');
  const timer = document.getElementById('pumpTimer');

  if (!playBtn || !stopBtn || !visual || !timer) return;

  // Update UI
  playBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  visual.classList.add('playing');

  // Start pump up sounds (energetic rain)
  audioManager.playZenMusic('rain', 600); // 10 minutes

  // Start timer countdown
  let timeLeft = 600; // 10 minutes in seconds
  timer.textContent = formatTime(timeLeft);

  pumpMusicTimer = setInterval(() => {
    timeLeft--;
    timer.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      stopPumpMusic();
      completePumpMusicSession();
    }
  }, 1000);

  showToast('Pump up sounds starting! Let\'s go! 🔥', 'info');
  playSound('success');
}

function stopPumpMusic() {
  const playBtn = document.getElementById('playPumpBtn');
  const stopBtn = document.getElementById('stopPumpBtn');
  const visual = document.getElementById('pumpMusicVisual');
  const timer = document.getElementById('pumpTimer');

  // Update UI
  if (playBtn) playBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (visual) visual.classList.remove('playing');
  if (timer) timer.textContent = '10:00';

  // Stop music and timer
  audioManager.stopCurrentAudio();
  if (pumpMusicTimer) {
    clearInterval(pumpMusicTimer);
    pumpMusicTimer = null;
  }
}

function completePumpMusicSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed pump up session', {
    type: 'music',
    duration: '10 minutes',
    soundType: 'pump',
    mood: 'excited'
  });

  showToast('Pump up session complete! You\'re on fire! 🔥✨', 'success');
  playSound('complete');
  hapticFeedback('heavy');
}

// Hype Journal
function saveHypeJournal() {
  const textArea = document.getElementById('hypeJournalText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please write something in your hype journal! 📖', 'warning');
    return;
  }

  const journalText = textArea.value.trim();
  
  // Save journal entry
  storage.addJournalEntry(journalText, 'excited');

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Hype journal entry saved! 📖✨', 'success');
  createFloatingElement('🚀', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (energyChannelTimer) {
    clearInterval(energyChannelTimer);
  }
  if (pumpMusicTimer) {
    clearInterval(pumpMusicTimer);
  }
});