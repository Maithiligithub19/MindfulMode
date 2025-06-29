// Settings page functionality for MindfulMode

document.addEventListener('DOMContentLoaded', () => {
  initializeSettingsPage();
  loadCurrentSettings();
  loadDataStats();
});

function initializeSettingsPage() {
  // Add click sounds to all interactive elements
  const interactiveElements = document.querySelectorAll('button, input, select, .theme-option');
  interactiveElements.forEach(element => {
    element.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Add theme option hover effects
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.addEventListener('mouseenter', () => {
      option.style.transform = 'scale(1.05)';
    });
    
    option.addEventListener('mouseleave', () => {
      if (!option.classList.contains('active')) {
        option.style.transform = 'scale(1)';
      }
    });
  });

  // Show settings welcome message
  setTimeout(() => {
    showToast('Customize your mindful experience! ⚙️✨', 'info', 3000);
  }, 1000);
}

function loadCurrentSettings() {
  const settings = storage.getSettings();
  
  // Theme selection
  const currentTheme = themeManager.getCurrentTheme();
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.theme === currentTheme);
  });
  
  // Audio settings
  const backgroundMusicToggle = document.getElementById('backgroundMusicToggle');
  const soundEffectsToggle = document.getElementById('soundEffectsToggle');
  const masterVolumeSlider = document.getElementById('masterVolume');
  
  if (backgroundMusicToggle) {
    backgroundMusicToggle.checked = settings.backgroundMusic || false;
  }
  
  if (soundEffectsToggle) {
    soundEffectsToggle.checked = settings.soundEffects !== false;
  }
  
  if (masterVolumeSlider) {
    masterVolumeSlider.value = settings.masterVolume || 70;
  }
  
  // Notification settings
  const moodRemindersToggle = document.getElementById('moodRemindersToggle');
  const reminderFrequencySelect = document.getElementById('reminderFrequency');
  
  if (moodRemindersToggle) {
    moodRemindersToggle.checked = settings.moodReminders || false;
  }
  
  if (reminderFrequencySelect) {
    reminderFrequencySelect.value = settings.reminderFrequency || 2;
  }
}

function loadDataStats() {
  const userData = storage.getUserStats();
  const drops = storage.get('drops') || [];
  const journalEntries = storage.get('journal-entries') || [];
  const tasks = storage.getTasks();
  
  // Update data stats
  const totalDropsCount = document.getElementById('totalDropsCount');
  const journalEntriesCount = document.getElementById('journalEntriesCount');
  const tasksCompletedCount = document.getElementById('tasksCompletedCount');
  
  if (totalDropsCount) {
    animateValue(0, drops.length, 800, (value) => {
      totalDropsCount.textContent = value;
    });
  }
  
  if (journalEntriesCount) {
    animateValue(0, journalEntries.length, 1000, (value) => {
      journalEntriesCount.textContent = value;
    });
  }
  
  if (tasksCompletedCount) {
    const completedTasks = tasks.filter(task => task.completed).length;
    animateValue(0, completedTasks, 1200, (value) => {
      tasksCompletedCount.textContent = value;
    });
  }
}

// Theme Functions
function changeTheme(themeName) {
  themeManager.transitionToTheme(themeName);
  
  // Update active theme indicator
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    const isActive = option.dataset.theme === themeName;
    option.classList.toggle('active', isActive);
    
    if (isActive) {
      option.style.transform = 'scale(1.05)';
    } else {
      option.style.transform = 'scale(1)';
    }
  });
  
  showToast(`Switched to ${themeManager.getTheme(themeName).name} theme! 🎨`, 'success');
  hapticFeedback('medium');
}

// Audio Functions
function toggleBackgroundMusic() {
  const toggle = document.getElementById('backgroundMusicToggle');
  const enabled = toggle ? toggle.checked : false;
  
  storage.updateSettings({ backgroundMusic: enabled });
  audioManager.toggleBackgroundMusic(enabled);
  
  const message = enabled ? 'Background music enabled 🎵' : 'Background music disabled 🔇';
  showToast(message, 'info');
  
  return enabled;
}

function toggleSoundEffects() {
  const toggle = document.getElementById('soundEffectsToggle');
  const enabled = toggle ? toggle.checked : true;
  
  storage.updateSettings({ soundEffects: enabled });
  audioManager.toggleSoundEffects(enabled);
  
  const message = enabled ? 'Sound effects enabled 🔊' : 'Sound effects disabled 🔇';
  showToast(message, 'info');
  
  return enabled;
}

function changeMasterVolume(volume) {
  storage.updateSettings({ masterVolume: volume });
  audioManager.setMasterVolume(volume);
  
  // Play test sound
  if (volume > 0) {
    setTimeout(() => {
      playSound('success');
    }, 100);
  }
}

// Notification Functions
function toggleMoodReminders() {
  const toggle = document.getElementById('moodRemindersToggle');
  const enabled = toggle ? toggle.checked : false;
  
  storage.updateSettings({ moodReminders: enabled });
  
  if (enabled) {
    setupMoodReminders();
    showToast('Mood reminders enabled! 🔔', 'success');
  } else {
    clearMoodReminders();
    showToast('Mood reminders disabled', 'info');
  }
  
  return enabled;
}

function changeReminderFrequency(frequency) {
  storage.updateSettings({ reminderFrequency: parseInt(frequency) });
  
  // Restart reminders with new frequency
  const settings = storage.getSettings();
  if (settings.moodReminders) {
    clearMoodReminders();
    setupMoodReminders();
  }
  
  const hours = frequency === '1' ? 'hour' : `${frequency} hours`;
  showToast(`Reminders set to every ${hours} ⏰`, 'info');
}

function setupMoodReminders() {
  // Clear existing reminders
  clearMoodReminders();
  
  const settings = storage.getSettings();
  const frequency = (settings.reminderFrequency || 2) * 60 * 60 * 1000; // Convert to milliseconds
  
  // Set up recurring reminder
  const reminderInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      showMoodReminder();
    }
  }, frequency);
  
  // Store interval ID
  localStorage.setItem('mood-reminder-interval', reminderInterval);
}

function clearMoodReminders() {
  const intervalId = localStorage.getItem('mood-reminder-interval');
  if (intervalId) {
    clearInterval(parseInt(intervalId));
    localStorage.removeItem('mood-reminder-interval');
  }
}

function showMoodReminder() {
  const reminders = [
    "How are you feeling right now? 😊",
    "Time for a mindful check-in! 🧘",
    "Take a moment to breathe and reflect 🌸",
    "What's your vibe today? 💫",
    "Remember to be kind to yourself 💙"
  ];
  
  const reminder = randomChoice(reminders);
  showToast(reminder, 'info', 5000);
  
  // Optional: Show notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('MindfulMode Reminder', {
      body: reminder,
      icon: '/vite.svg'
    });
  }
}

// Data Functions
function exportAllData() {
  const allData = storage.exportAllData();
  const filename = `mindful-mode-data-${new Date().toISOString().split('T')[0]}.json`;
  downloadAsFile(allData, filename, 'application/json');
  
  showToast('All data exported successfully! 📤', 'success');
  playSound('success');
  hapticFeedback('medium');
}

function confirmResetData() {
  const modal = document.getElementById('resetModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Add backdrop click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeResetModal();
      }
    });
  }
}

function closeResetModal() {
  const modal = document.getElementById('resetModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

function resetAllData() {
  // Final confirmation
  const confirmed = confirm('This will permanently delete ALL your data. Are you absolutely sure?');
  
  if (confirmed) {
    // Clear all storage
    storage.clear();
    
    // Clear any intervals
    clearMoodReminders();
    
    // Reset audio
    audioManager.destroy();
    
    // Show success and redirect
    showToast('All data has been reset. Redirecting to home...', 'info', 3000);
    
    setTimeout(() => {
      navigateTo('index.html');
    }, 3000);
  }
  
  closeResetModal();
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notifications enabled! 🔔', 'success');
      }
    });
  }
}

// Auto-save settings
document.addEventListener('change', (e) => {
  // Auto-save any setting changes
  if (e.target.type === 'checkbox' || e.target.type === 'range' || e.target.tagName === 'SELECT') {
    playSound('click');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '4') {
    const themes = ['neon', 'soft', 'sepia', 'dark'];
    const themeIndex = parseInt(e.key) - 1;
    if (themes[themeIndex]) {
      changeTheme(themes[themeIndex]);
    }
  } else if (e.key === 'Escape') {
    closeResetModal();
  } else if (e.key === 'e' || e.key === 'E') {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      exportAllData();
    }
  }
});

// Initialize mood reminders if enabled
window.addEventListener('load', () => {
  const settings = storage.getSettings();
  if (settings.moodReminders) {
    setupMoodReminders();
  }
  
  // Request notification permission if reminders are enabled
  if (settings.moodReminders && 'Notification' in window && Notification.permission === 'default') {
    setTimeout(() => {
      if (confirm('Enable browser notifications for mood reminders?')) {
        requestNotificationPermission();
      }
    }, 2000);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  clearMoodReminders();
});