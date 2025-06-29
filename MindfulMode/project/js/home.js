// Home page functionality for MindfulMode

let selectedMood = null;

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
  initializeHomePage();
  loadDailyQuote();
  updateStartButton();
});

function initializeHomePage() {
  // Add click sound to mood cards
  const moodCards = document.querySelectorAll('.mood-card');
  moodCards.forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Add hover effects
  moodCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('selected')) {
        card.style.transform = '';
      }
    });
  });

  // Add floating elements animation
  animateFloatingElements();
  
  // Load user stats if available
  loadUserStats();
}

function selectMood(mood) {
  selectedMood = mood;
  
  // Update UI
  const moodCards = document.querySelectorAll('.mood-card');
  moodCards.forEach(card => {
    card.classList.remove('selected');
    if (card.dataset.mood === mood) {
      card.classList.add('selected');
      
      // Add selection animation
      const emoji = card.querySelector('.mood-emoji');
      emoji.style.animation = 'bounceHover 0.6s ease-in-out';
      setTimeout(() => {
        emoji.style.animation = 'bounce 2s ease-in-out infinite';
      }, 600);
    }
  });
  
  updateStartButton();
  playSound('success');
  hapticFeedback('light');
  
  // Show mood-specific quote
  showMoodQuote(mood);
}

function updateStartButton() {
  const startBtn = document.getElementById('startMindfulBtn');
  
  if (selectedMood) {
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
    
    // Update button text based on mood
    const moodTexts = {
      'anxious': '✨ Find Your Calm',
      'low-energy': '✨ Recharge Your Energy',
      'confident': '✨ Channel Your Power',
      'unfocused': '✨ Sharpen Your Focus',
      'excited': '✨ Direct Your Energy'
    };
    
    const buttonText = startBtn.querySelector('span');
    buttonText.textContent = moodTexts[selectedMood] || '✨ Start Mindful Mode';
  } else {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    startBtn.style.cursor = 'not-allowed';
    
    const buttonText = startBtn.querySelector('span');
    buttonText.textContent = '✨ Start Mindful Mode';
  }
}

function startMindfulMode() {
  if (!selectedMood) {
    showToast('Please select your mood first! 😊', 'warning');
    return;
  }
  
  playSound('success');
  hapticFeedback('medium');
  
  // Add loading animation
  const startBtn = document.getElementById('startMindfulBtn');
  const originalText = startBtn.querySelector('span').textContent;
  startBtn.querySelector('span').textContent = 'Loading...';
  startBtn.disabled = true;
  
  // Create floating celebration
  createFloatingElement('✨', document.body);
  createFloatingElement('🌟', document.body);
  
  // Navigate to mood-specific page
  setTimeout(() => {
    const moodPages = {
      'anxious': 'anxious.html',
      'low-energy': 'low-energy.html',
      'confident': 'confident.html',
      'unfocused': 'unfocused.html',
      'excited': 'excited.html'
    };
    
    const targetPage = moodPages[selectedMood] || 'anxious.html';
    navigateTo(targetPage);
  }, 1000);
}

function loadDailyQuote() {
  const quoteElement = document.getElementById('dailyQuote');
  const authorElement = document.getElementById('quoteAuthor');
  
  if (quoteElement) {
    // Start with loading text
    quoteElement.textContent = 'Loading your daily motivation...';
    quoteElement.style.opacity = '0.5';
    
    // Load quote after a short delay for better UX
    setTimeout(async () => {
      try {
        const quote = await quoteManager.fetchExternalQuote();
        
        // Animate quote change
        quoteElement.style.transition = 'opacity 0.3s ease';
        quoteElement.style.opacity = '0';
        
        setTimeout(() => {
          quoteElement.textContent = `"${quote.text}"`;
          if (authorElement) {
            authorElement.textContent = `— ${quote.author}`;
          }
          
          quoteElement.style.opacity = '1';
        }, 300);
        
      } catch (error) {
        // Fallback to local quote
        const quote = quoteManager.getDailyQuote();
        quoteElement.textContent = `"${quote.text}"`;
        if (authorElement) {
          authorElement.textContent = `— ${quote.author}`;
        }
        quoteElement.style.opacity = '1';
      }
    }, 500);
  }
}

function showMoodQuote(mood) {
  const quote = quoteManager.getQuoteByMood(mood);
  const quoteElement = document.getElementById('dailyQuote');
  const authorElement = document.getElementById('quoteAuthor');
  
  if (quoteElement) {
    // Animate quote change
    quoteElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    quoteElement.style.opacity = '0';
    quoteElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      quoteElement.textContent = `"${quote.text}"`;
      if (authorElement) {
        authorElement.textContent = `— ${quote.author}`;
      }
      
      quoteElement.style.opacity = '1';
      quoteElement.style.transform = 'translateY(0)';
    }, 300);
  }
}

function animateFloatingElements() {
  const floatingElements = document.querySelectorAll('.float-element');
  
  floatingElements.forEach((element, index) => {
    // Add random movement
    setInterval(() => {
      const randomX = Math.random() * 20 - 10;
      const randomY = Math.random() * 20 - 10;
      
      element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 10 - 5}deg)`;
    }, 3000 + index * 500);
  });
}

function loadUserStats() {
  const userData = storage.getUserStats();
  
  if (userData && userData.totalDrops > 0) {
    // Show welcome back message
    setTimeout(() => {
      const greeting = getTimeGreeting();
      showToast(`${greeting}! You have ${userData.totalDrops} drops in your cloud ☁️`, 'info', 4000);
    }, 1000);
  }
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '5') {
    const moodIndex = parseInt(e.key) - 1;
    const moodCards = document.querySelectorAll('.mood-card');
    if (moodCards[moodIndex]) {
      const mood = moodCards[moodIndex].dataset.mood;
      selectMood(mood);
    }
  } else if (e.key === 'Enter' && selectedMood) {
    startMindfulMode();
  }
});

// Add touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartY - touchEndY;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe up - scroll to mood selector
      const moodSelector = document.querySelector('.mood-selector');
      if (moodSelector) {
        scrollToElement(moodSelector, 100);
      }
    } else {
      // Swipe down - scroll to quote
      const quote = document.querySelector('.daily-quote');
      if (quote) {
        scrollToElement(quote);
      }
    }
  }
}

// Auto-save selected mood
window.addEventListener('beforeunload', () => {
  if (selectedMood) {
    sessionStorage.setItem('selectedMood', selectedMood);
  }
});

// Restore selected mood on page load
window.addEventListener('load', () => {
  const savedMood = sessionStorage.getItem('selectedMood');
  if (savedMood) {
    selectMood(savedMood);
    sessionStorage.removeItem('selectedMood');
  }
});