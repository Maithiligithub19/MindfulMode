// Theme management for MindfulMode

class ThemeManager {
  constructor() {
    this.themes = {
      neon: {
        name: 'Neon',
        colors: {
          primary: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
          secondary: 'linear-gradient(135deg, #667eea, #764ba2)',
          accent: 'linear-gradient(135deg, #f093fb, #f5576c)',
          success: '#4ecdc4',
          warning: '#feca57',
          error: '#ff6b6b',
          bgPrimary: '#0a0a0f',
          bgSecondary: '#1a1a2e',
          bgTertiary: '#16213e',
          textPrimary: '#ffffff',
          textSecondary: '#b8b8d1',
          textMuted: '#8b8ba7'
        }
      },
      soft: {
        name: 'Soft',
        colors: {
          primary: 'linear-gradient(135deg, #ffecd2, #fcb69f, #a8e6cf, #dcedc1)',
          secondary: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
          accent: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
          success: '#a8e6cf',
          warning: '#fdcb6e',
          error: '#fd79a8',
          bgPrimary: '#f8f9fa',
          bgSecondary: '#ffffff',
          bgTertiary: '#f1f3f4',
          textPrimary: '#2d3436',
          textSecondary: '#636e72',
          textMuted: '#b2bec3'
        }
      },
      sepia: {
        name: 'Sepia',
        colors: {
          primary: 'linear-gradient(135deg, #d4a574, #c8956d, #b68d40, #ddbf73)',
          secondary: 'linear-gradient(135deg, #d4a574, #8b7355)',
          accent: 'linear-gradient(135deg, #d4a574, #f4a261)',
          success: '#ddbf73',
          warning: '#f4a261',
          error: '#d4a574',
          bgPrimary: '#2c1810',
          bgSecondary: '#3d2817',
          bgTertiary: '#4a3224',
          textPrimary: '#f4f3ee',
          textSecondary: '#d4c5b0',
          textMuted: '#a08a73'
        }
      },
      dark: {
        name: 'Dark',
        colors: {
          primary: 'linear-gradient(135deg, #667eea, #764ba2, #6a11cb, #2575fc)',
          secondary: 'linear-gradient(135deg, #434343, #000000)',
          accent: 'linear-gradient(135deg, #8360c3, #2ebf91)',
          success: '#2ebf91',
          warning: '#f39c12',
          error: '#e74c3c',
          bgPrimary: '#000000',
          bgSecondary: '#1a1a1a',
          bgTertiary: '#2d2d2d',
          textPrimary: '#ffffff',
          textSecondary: '#cccccc',
          textMuted: '#888888'
        }
      }
    };
    
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    const saved = storage.getSettings().theme;
    return saved && this.themes[saved] ? saved : 'neon';
  }

  applyTheme(themeName) {
    if (!this.themes[themeName]) return;
    
    const theme = this.themes[themeName];
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar.replace('_', '-')}`, value);
    });
    
    // Set data attribute for theme-specific styles
    root.setAttribute('data-theme', themeName);
    
    this.currentTheme = themeName;
    
    // Save to storage
    storage.updateSettings({ theme: themeName });
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeName, colors: theme.colors } 
    }));
  }

  getTheme(themeName) {
    return this.themes[themeName] || this.themes[this.currentTheme];
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getAllThemes() {
    return Object.keys(this.themes);
  }

  getThemeColors(themeName = this.currentTheme) {
    return this.themes[themeName]?.colors || {};
  }

  // Create dynamic gradient based on current theme
  createGradient(type = 'primary', direction = '135deg') {
    const colors = this.getThemeColors();
    return `linear-gradient(${direction}, ${colors[type] || colors.primary})`;
  }

  // Get contrasting text color for background
  getContrastColor(backgroundColor) {
    // Simple contrast calculation
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return this.getThemeColors().textPrimary;
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Theme transition effect
  transitionToTheme(themeName, duration = 500) {
    if (!this.themes[themeName] || themeName === this.currentTheme) return;
    
    // Add transition class
    document.body.classList.add('theme-transitioning');
    document.body.style.transition = `all ${duration}ms ease`;
    
    // Apply new theme
    this.applyTheme(themeName);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
      document.body.style.transition = '';
    }, duration);
  }

  // Auto theme based on time of day
  autoTheme() {
    const hour = new Date().getHours();
    let autoTheme;
    
    if (hour >= 6 && hour < 12) {
      autoTheme = 'soft'; // Morning
    } else if (hour >= 12 && hour < 18) {
      autoTheme = 'neon'; // Afternoon
    } else if (hour >= 18 && hour < 22) {
      autoTheme = 'sepia'; // Evening
    } else {
      autoTheme = 'dark'; // Night
    }
    
    this.transitionToTheme(autoTheme);
  }

  // System theme detection
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else {
      return 'soft';
    }
  }

  // Listen for system theme changes
  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const systemTheme = e.matches ? 'dark' : 'soft';
        this.transitionToTheme(systemTheme);
      });
    }
  }
}

// Create global theme manager
const themeManager = new ThemeManager();

// Global theme change function
function changeTheme(themeName) {
  themeManager.transitionToTheme(themeName);
  
  // Update active theme indicator if on settings page
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.toggle('active', option.dataset.theme === themeName);
  });
  
  showToast(`Switched to ${themeManager.getTheme(themeName).name} theme`, 'success');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  // Mark current theme as active if on settings page
  const currentTheme = themeManager.getCurrentTheme();
  const activeThemeOption = document.querySelector(`[data-theme="${currentTheme}"]`);
  if (activeThemeOption) {
    activeThemeOption.classList.add('active');
  }
});