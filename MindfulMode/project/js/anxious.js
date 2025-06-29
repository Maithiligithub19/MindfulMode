// Anxious mood page specific functionality

document.addEventListener('DOMContentLoaded', () => {
  initializeAnxiousPage();
  loadAnxiousQuote();
  setupAnxiousActivities();
});

function initializeAnxiousPage() {
  // Add calming background animation
  addCalmingEffects();
  
  // Set up breathing circle click handler
  const breathingCircle = document.getElementById('breathingCircle');
  if (breathingCircle) {
    breathingCircle.addEventListener('click', () => {
      if (!activityManager.breathingState) {
        startBreathing();
      }
    });
  }

  // Auto-focus gratitude input with calming prompt
  const gratitudeInput = document.getElementById('gratitudeText');
  if (gratitudeInput) {
    gratitudeInput.placeholder = quoteManager.getGratitudePrompt() + ' 🌸';
  }

  // Set up journal with anxiety-specific prompts
  const journalInput = document.getElementById('journalText');
  if (journalInput) {
    const anxietyPrompts = [
      "What's making you feel anxious right now?",
      "What would you tell a friend feeling this way?",
      "What are three things you can see, hear, and feel right now?",
      "What's one small thing you can control in this moment?",
      "How can you be kind to yourself today?"
    ];
    
    journalInput.placeholder = randomChoice(anxietyPrompts) + ' 💙';
  }

  // Show calming affirmation
  setTimeout(() => {
    const affirmation = quoteManager.getAffirmation();
    showToast(affirmation, 'info', 4000);
  }, 2000);
}

function loadAnxiousQuote() {
  const quote = quoteManager.getQuoteByMood('anxious');
  
  // Display in a floating quote bubble if exists
  const quoteElement = document.querySelector('.mood-quote');
  if (quoteElement) {
    quoteManager.displayQuote(quoteElement, quote);
  }
}

function setupAnxiousActivities() {
  // Add specific tracking for anxiety activities
  const originalSaveGratitude = window.saveGratitude;
  window.saveGratitude = function() {
    originalSaveGratitude();
    
    // Add anxiety-specific drop metadata
    const drops = storage.get('drops') || [];
    if (drops.length > 0) {
      const lastDrop = drops[0];
      if (lastDrop.type === 'gratitude') {
        lastDrop.metadata.mood = 'anxious';
        lastDrop.metadata.activityType = 'anxiety-relief';
        storage.set('drops', drops);
      }
    }
  };

  // Enhanced breathing for anxiety
  const originalStartBreathing = window.startBreathing;
  window.startBreathing = function() {
    // Show anxiety-specific breathing instructions
    const breathText = document.getElementById('breathText');
    if (breathText) {
      breathText.textContent = 'Let\'s calm your mind together';
    }
    
    originalStartBreathing();
    
    // Add anxiety-specific completion
    setTimeout(() => {
      if (activityManager.breathingState) {
        showToast('You\'re doing great. Keep breathing. 🫁💙', 'info', 3000);
      }
    }, 30000); // After 30 seconds
  };

  // Anxiety-specific music selection
  const originalPlayZenMusic = window.playZenMusic;
  window.playZenMusic = function() {
    // Use calming rain sounds for anxiety with mood context
    audioManager.playZenMusic('rain', 600, 'anxious');
    
    const playBtn = document.getElementById('playMusicBtn');
    const stopBtn = document.getElementById('stopMusicBtn');
    const visual = document.getElementById('musicVisual');
    const timer = document.getElementById('musicTimer');

    if (playBtn) playBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    if (visual) visual.classList.add('playing');

    // Start timer countdown
    let timeLeft = 600;
    if (timer) timer.textContent = formatTime(timeLeft);

    activityManager.musicTimer = setInterval(() => {
      timeLeft--;
      if (timer) timer.textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        stopZenMusic();
        activityManager.completeMusicSession();
      }
    }, 1000);

    playSound('success');
    showToast('Calming sounds starting... 🌧️', 'info');
  };
}

function addCalmingEffects() {
  // Add subtle calming animations
  const activityCards = document.querySelectorAll('.activity-card');
  
  activityCards.forEach((card, index) => {
    // Gentle floating animation
    card.style.animation = `gentleFloat 4s ease-in-out infinite`;
    card.style.animationDelay = `${index * 0.5}s`;
  });

  // Add calming animation keyframes
  if (!document.querySelector('#calming-animations')) {
    const style = document.createElement('style');
    style.id = 'calming-animations';
    style.textContent = `
      @keyframes gentleFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      
      @keyframes calmPulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      
      .breathing-circle {
        transition: all 0.3s ease;
      }
      
      .breathing-circle:hover {
        box-shadow: 0 0 30px rgba(78, 205, 196, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // Add calming background gradient animation
  const pageContainer = document.querySelector('.page-container');
  if (pageContainer) {
    pageContainer.style.background = `
      linear-gradient(135deg, 
        rgba(78, 205, 196, 0.1) 0%, 
        rgba(69, 183, 209, 0.1) 50%, 
        rgba(150, 206, 180, 0.1) 100%
      )
    `;
  }
}

// Anxiety-specific keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'b' || e.key === 'B') {
    // Quick breathing exercise
    if (!activityManager.breathingState) {
      startBreathing();
      showToast('Quick breathing exercise started! 🫁', 'info');
    }
  } else if (e.key === 'm' || e.key === 'M') {
    // Quick music
    const musicVisual = document.getElementById('musicVisual');
    if (musicVisual && !musicVisual.classList.contains('playing')) {
      playZenMusic();
    }
  }
});

// Anxiety relief tips
const anxietyTips = [
  "Try the 5-4-3-2-1 grounding technique: 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste 🌟",
  "Remember: This feeling is temporary. You've gotten through difficult times before 💪",
  "Take slow, deep breaths. Your nervous system will thank you 🫁",
  "It's okay to feel anxious. You're human, and this is normal 💙",
  "Focus on what you can control right now, not what might happen 🎯"
];

// Show random anxiety tip every few minutes
setInterval(() => {
  if (Math.random() < 0.3) { // 30% chance every interval
    const tip = randomChoice(anxietyTips);
    showToast(tip, 'info', 6000);
  }
}, 180000); // Every 3 minutes

// Emergency calm button (hidden feature)
let calmClickCount = 0;
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('mood-emoji-large')) {
    calmClickCount++;
    if (calmClickCount >= 5) {
      // Emergency calm mode
      showToast('Emergency calm mode activated 🆘💙', 'info', 5000);
      startBreathing();
      playZenMusic();
      calmClickCount = 0;
    }
  }
});