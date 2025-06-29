// Utility functions for MindfulMode

// Navigation function
function navigateTo(page) {
  // Add page transition effect
  document.body.style.opacity = '0.8';
  document.body.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    window.location.href = page;
  }, 150);
}

// Date formatting
function formatDate(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Time formatting
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Animation helpers
function animateValue(start, end, duration, callback) {
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeOutCubic(progress);
    const currentValue = start + (end - start) * easeProgress;
    
    callback(Math.round(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Easing function
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Create floating animation
function createFloatingElement(emoji, container) {
  const element = document.createElement('div');
  element.className = 'floating-celebration';
  element.textContent = emoji;
  element.style.cssText = `
    position: absolute;
    font-size: 1.5rem;
    pointer-events: none;
    z-index: 1000;
    left: ${Math.random() * 100}%;
    top: 100%;
    animation: floatUp 2s ease-out forwards;
  `;
  
  // Add floating animation keyframes if not exists
  if (!document.querySelector('#floating-animations')) {
    const style = document.createElement('style');
    style.id = 'floating-animations';
    style.textContent = `
      @keyframes floatUp {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(element);
  
  setTimeout(() => {
    element.remove();
  }, 2000);
}

// Create confetti effect
function createConfetti(element) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  const rect = element.getBoundingClientRect();
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 8px;
        height: 8px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 1000;
        border-radius: 2px;
      `;
      
      document.body.appendChild(confetti);
      
      // Animate confetti
      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 100;
      const gravity = 300;
      
      let x = 0;
      let y = 0;
      let vx = Math.cos(angle) * velocity;
      let vy = Math.sin(angle) * velocity;
      
      const startTime = performance.now();
      
      function updateConfetti(currentTime) {
        const elapsed = (currentTime - startTime) / 1000;
        
        x = vx * elapsed;
        y = vy * elapsed + 0.5 * gravity * elapsed * elapsed;
        
        confetti.style.transform = `translate(${x}px, ${y}px) rotate(${elapsed * 360}deg)`;
        confetti.style.opacity = Math.max(0, 1 - elapsed / 2);
        
        if (elapsed < 2) {
          requestAnimationFrame(updateConfetti);
        } else {
          confetti.remove();
        }
      }
      
      requestAnimationFrame(updateConfetti);
    }, i * 50);
  }
}

// Haptic feedback (if supported)
function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([30, 10, 30]);
        break;
    }
  }
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    color: var(--text-primary);
    font-weight: 500;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // Add type-specific styling
  if (type === 'success') {
    toast.style.borderColor = 'var(--success-color)';
    toast.style.background = 'rgba(78, 205, 196, 0.1)';
  } else if (type === 'error') {
    toast.style.borderColor = 'var(--error-color)';
    toast.style.background = 'rgba(255, 107, 107, 0.1)';
  } else if (type === 'warning') {
    toast.style.borderColor = 'var(--warning-color)';
    toast.style.background = 'rgba(254, 202, 87, 0.1)';
  }
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });
  
  // Remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Random array element
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!', 'success');
      return true;
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// Export data as file
function downloadAsFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get time of day greeting
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Calculate streak
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (date.getTime() < currentDate.getTime()) {
      break;
    }
  }
  
  return streak;
}

// Initialize page with theme
function initializePage() {
  // Apply saved theme
  const savedTheme = localStorage.getItem('mindful-theme') || 'neon';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Add page transition
  document.body.style.opacity = '0';
  document.body.style.transform = 'scale(0.98)';
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      document.body.style.opacity = '1';
      document.body.style.transform = 'scale(1)';
    }, 50);
  });
}

// Initialize page
initializePage();