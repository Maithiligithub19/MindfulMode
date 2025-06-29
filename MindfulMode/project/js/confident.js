// Confident mood page specific functionality

let affirmationTimer = null;
let affirmationIndex = 0;
let energyMusicTimer = null;

const powerAffirmations = [
  "I am capable of amazing things",
  "I trust my abilities completely",
  "I radiate confidence and strength",
  "I am worthy of all my dreams",
  "I choose courage over comfort",
  "I am unstoppable when I focus",
  "I believe in my unique power",
  "I am exactly where I need to be",
  "I create my own opportunities",
  "I am confident in my decisions"
];

document.addEventListener('DOMContentLoaded', () => {
  initializeConfidentPage();
  setupConfidentActivities();
});

function initializeConfidentPage() {
  // Show empowering welcome message
  setTimeout(() => {
    showToast('You\'re radiating confidence today! Keep shining ⭐', 'info', 4000);
  }, 2000);

  // Set up empowering prompts
  const winsInput = document.getElementById('winsText');
  if (winsInput) {
    winsInput.placeholder = 'What did you accomplish today? Big or small! 🎉';
  }

  const journalInput = document.getElementById('confidenceJournalText');
  if (journalInput) {
    const confidencePrompts = [
      "What makes you feel most confident?",
      "What are you most proud of right now?",
      "What strength did you show today?",
      "How have you grown recently?",
      "What would you tell your past self?"
    ];
    
    journalInput.placeholder = randomChoice(confidencePrompts) + ' 👑';
  }
}

function setupConfidentActivities() {
  // Set initial affirmation
  const affirmationText = document.getElementById('affirmationText');
  if (affirmationText) {
    affirmationText.textContent = 'Click to Start';
  }
}

// Power Affirmations
function startAffirmations() {
  if (affirmationTimer) return;
  
  const startBtn = document.getElementById('startAffirmationBtn');
  const stopBtn = document.getElementById('stopAffirmationBtn');
  const circle = document.getElementById('affirmationCircle');
  const text = document.getElementById('affirmationText');
  
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn) stopBtn.style.display = 'inline-block';
  
  affirmationIndex = 0;
  
  const showNextAffirmation = () => {
    if (!affirmationTimer) return;
    
    const affirmation = powerAffirmations[affirmationIndex];
    if (text) text.textContent = affirmation;
    if (circle) circle.classList.add('inhale');
    
    // Hold the affirmation
    setTimeout(() => {
      if (circle) circle.classList.remove('inhale');
    }, 3000);
    
    affirmationIndex = (affirmationIndex + 1) % powerAffirmations.length;
    
    // Complete after showing all affirmations
    if (affirmationIndex === 0) {
      setTimeout(() => {
        stopAffirmations();
        completeAffirmationSession();
      }, 4000);
    }
  };
  
  // Start immediately and then every 5 seconds
  showNextAffirmation();
  affirmationTimer = setInterval(showNextAffirmation, 5000);
  
  showToast('Power affirmations started! Believe in yourself 💪', 'success');
  playSound('success');
}

function stopAffirmations() {
  if (affirmationTimer) {
    clearInterval(affirmationTimer);
    affirmationTimer = null;
  }
  
  const startBtn = document.getElementById('startAffirmationBtn');
  const stopBtn = document.getElementById('stopAffirmationBtn');
  const circle = document.getElementById('affirmationCircle');
  const text = document.getElementById('affirmationText');
  
  if (startBtn) startBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (circle) circle.classList.remove('inhale');
  if (text) text.textContent = 'Click to Start';
}

function completeAffirmationSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed power affirmations', {
    type: 'affirmations',
    duration: '2 minutes',
    mood: 'confident'
  });
  
  showToast('Affirmation session complete! You\'re unstoppable! 🚀', 'success');
  createConfetti(document.getElementById('affirmationCircle'));
  playSound('complete');
  hapticFeedback('heavy');
}

// Wins Journal
function saveWins() {
  const textArea = document.getElementById('winsText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please share your wins! Every achievement counts 🏆', 'warning');
    return;
  }

  const winsText = textArea.value.trim();
  
  // Save as drop
  storage.addDrop('gratitude', winsText, {
    type: 'wins',
    mood: 'confident'
  });

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Victory added to your cloud! Keep winning! 🏆✨', 'success');
  createFloatingElement('🏆', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Energy Music
function playEnergyMusic() {
  const playBtn = document.getElementById('playEnergyBtn');
  const stopBtn = document.getElementById('stopEnergyBtn');
  const visual = document.getElementById('energyMusicVisual');
  const timer = document.getElementById('energyTimer');

  if (!playBtn || !stopBtn || !visual || !timer) return;

  // Update UI
  playBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  visual.classList.add('playing');

  // Start energizing sounds (faster rain for energy)
  audioManager.playZenMusic('rain', 600); // 10 minutes

  // Start timer countdown
  let timeLeft = 600; // 10 minutes in seconds
  timer.textContent = formatTime(timeLeft);

  energyMusicTimer = setInterval(() => {
    timeLeft--;
    timer.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      stopEnergyMusic();
      completeEnergyMusicSession();
    }
  }, 1000);

  showToast('Energy boost sounds starting! 🔥', 'info');
  playSound('success');
}

function stopEnergyMusic() {
  const playBtn = document.getElementById('playEnergyBtn');
  const stopBtn = document.getElementById('stopEnergyBtn');
  const visual = document.getElementById('energyMusicVisual');
  const timer = document.getElementById('energyTimer');

  // Update UI
  if (playBtn) playBtn.style.display = 'inline-block';
  if (stopBtn) stopBtn.style.display = 'none';
  if (visual) visual.classList.remove('playing');
  if (timer) timer.textContent = '10:00';

  // Stop music and timer
  audioManager.stopCurrentAudio();
  if (energyMusicTimer) {
    clearInterval(energyMusicTimer);
    energyMusicTimer = null;
  }
}

function completeEnergyMusicSession() {
  // Add activity drop
  storage.addDrop('activity', 'Completed energy boost session', {
    type: 'music',
    duration: '10 minutes',
    soundType: 'energy',
    mood: 'confident'
  });

  showToast('Energy boost complete! You\'re on fire! 🔥✨', 'success');
  playSound('complete');
  hapticFeedback('heavy');
}

// Confidence Journal
function saveConfidenceJournal() {
  const textArea = document.getElementById('confidenceJournalText');
  if (!textArea || !textArea.value.trim()) {
    showToast('Please write something in your confidence journal! 📖', 'warning');
    return;
  }

  const journalText = textArea.value.trim();
  
  // Save journal entry
  storage.addJournalEntry(journalText, 'confident');

  // Clear input
  textArea.value = '';
  
  // Show success
  showToast('Confidence journal entry saved! 📖✨', 'success');
  createFloatingElement('👑', textArea.parentElement);
  playSound('success');
  hapticFeedback('medium');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (affirmationTimer) {
    clearInterval(affirmationTimer);
  }
  if (energyMusicTimer) {
    clearInterval(energyMusicTimer);
  }
});