// Local storage management for MindfulMode

class MindfulStorage {
  constructor() {
    this.prefix = 'mindful-';
    this.initializeStorage();
  }

  initializeStorage() {
    // Initialize default data if not exists
    if (!this.get('user-data')) {
      this.set('user-data', {
        name: 'You',
        joinDate: new Date().toISOString(),
        totalDrops: 0,
        currentStreak: 0,
        longestStreak: 0,
        completedTasks: 0,
        journalEntries: 0,
        activitiesCompleted: 0
      });
    }

    if (!this.get('drops')) {
      this.set('drops', []);
    }

    if (!this.get('tasks')) {
      this.set('tasks', []);
    }

    if (!this.get('journal-entries')) {
      this.set('journal-entries', []);
    }

    if (!this.get('settings')) {
      this.set('settings', {
        theme: 'neon',
        backgroundMusic: false,
        soundEffects: true,
        masterVolume: 70,
        moodReminders: false,
        reminderFrequency: 2
      });
    }

    if (!this.get('activity-dates')) {
      this.set('activity-dates', []);
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting to storage:', error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
      this.initializeStorage();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Drop management
  addDrop(type, content, metadata = {}) {
    const drops = this.get('drops') || [];
    const drop = {
      id: generateId(),
      type,
      content,
      metadata,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    drops.unshift(drop);
    this.set('drops', drops);

    // Update user stats
    this.updateUserStats('totalDrops', 1);
    this.addActivityDate();

    return drop;
  }

  getDrops(filter = 'all') {
    const drops = this.get('drops') || [];
    if (filter === 'all') return drops;
    return drops.filter(drop => drop.type === filter);
  }

  removeDrop(id) {
    const drops = this.get('drops') || [];
    const filteredDrops = drops.filter(drop => drop.id !== id);
    this.set('drops', filteredDrops);
    this.updateUserStats('totalDrops', -1);
  }

  // Task management
  addTask(text) {
    const tasks = this.get('tasks') || [];
    const task = {
      id: generateId(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    tasks.unshift(task);
    this.set('tasks', tasks);
    return task;
  }

  getTasks() {
    return this.get('tasks') || [];
  }

  updateTask(id, updates) {
    const tasks = this.get('tasks') || [];
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      
      // If task is being completed
      if (updates.completed && !tasks[taskIndex].completedAt) {
        tasks[taskIndex].completedAt = new Date().toISOString();
        this.updateUserStats('completedTasks', 1);
        this.addActivityDate();
        
        // Add completion drop
        this.addDrop('task', `Completed: ${tasks[taskIndex].text}`, {
          taskId: id,
          completedAt: tasks[taskIndex].completedAt
        });
      }
      
      this.set('tasks', tasks);
      return tasks[taskIndex];
    }
    return null;
  }

  removeTask(id) {
    const tasks = this.get('tasks') || [];
    const filteredTasks = tasks.filter(task => task.id !== id);
    this.set('tasks', filteredTasks);
  }

  getTasksCompletedToday() {
    const tasks = this.get('tasks') || [];
    const today = new Date().toDateString();
    return tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt).toDateString() === today
    ).length;
  }

  // Journal management
  addJournalEntry(content, mood = null) {
    const entries = this.get('journal-entries') || [];
    const entry = {
      id: generateId(),
      content,
      mood,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    entries.unshift(entry);
    this.set('journal-entries', entries);
    this.updateUserStats('journalEntries', 1);
    this.addActivityDate();

    // Add journal drop
    this.addDrop('journal', content.substring(0, 100) + (content.length > 100 ? '...' : ''), {
      entryId: entry.id,
      mood
    });

    return entry;
  }

  getJournalEntries() {
    return this.get('journal-entries') || [];
  }

  exportJournalEntries() {
    const entries = this.getJournalEntries();
    let content = 'MindfulMode Journal Export\n';
    content += '========================\n\n';
    
    entries.reverse().forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      const time = new Date(entry.timestamp).toLocaleTimeString();
      content += `${date} at ${time}\n`;
      if (entry.mood) content += `Mood: ${entry.mood}\n`;
      content += `${entry.content}\n\n---\n\n`;
    });

    return content;
  }

  // Activity tracking
  addActivityDate() {
    const dates = this.get('activity-dates') || [];
    const today = new Date().toDateString();
    
    if (!dates.includes(today)) {
      dates.push(today);
      this.set('activity-dates', dates);
      this.updateStreak();
    }
  }

  updateStreak() {
    const dates = this.get('activity-dates') || [];
    const currentStreak = calculateStreak(dates);
    const userData = this.get('user-data');
    
    userData.currentStreak = currentStreak;
    if (currentStreak > userData.longestStreak) {
      userData.longestStreak = currentStreak;
    }
    
    this.set('user-data', userData);
  }

  // User stats
  updateUserStats(stat, increment) {
    const userData = this.get('user-data');
    userData[stat] = (userData[stat] || 0) + increment;
    this.set('user-data', userData);
  }

  getUserStats() {
    return this.get('user-data');
  }

  // Settings
  updateSettings(newSettings) {
    const currentSettings = this.get('settings');
    const updatedSettings = { ...currentSettings, ...newSettings };
    this.set('settings', updatedSettings);
    return updatedSettings;
  }

  getSettings() {
    return this.get('settings');
  }

  // Data export
  exportAllData() {
    const data = {
      userData: this.get('user-data'),
      drops: this.get('drops'),
      tasks: this.get('tasks'),
      journalEntries: this.get('journal-entries'),
      settings: this.get('settings'),
      activityDates: this.get('activity-dates'),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Statistics
  getWeeklyStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const drops = this.get('drops') || [];
    const tasks = this.get('tasks') || [];

    const weeklyDrops = drops.filter(drop => 
      new Date(drop.timestamp) >= oneWeekAgo
    ).length;

    const weeklyTasks = tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt) >= oneWeekAgo
    ).length;

    return {
      drops: weeklyDrops,
      tasks: weeklyTasks,
      total: weeklyDrops + weeklyTasks
    };
  }

  getMonthlyStats() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const drops = this.get('drops') || [];
    const tasks = this.get('tasks') || [];

    const monthlyDrops = drops.filter(drop => 
      new Date(drop.timestamp) >= oneMonthAgo
    ).length;

    const monthlyTasks = tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt) >= oneMonthAgo
    ).length;

    return {
      drops: monthlyDrops,
      tasks: monthlyTasks,
      total: monthlyDrops + monthlyTasks
    };
  }

  // Badge checking
  checkBadges() {
    const userData = this.getUserStats();
    const badges = [];

    // Focus Ninja - Complete 10 focus sessions
    if (userData.activitiesCompleted >= 10) {
      badges.push('focus-ninja');
    }

    // Gratitude Guru - Write 25 gratitude drops
    const gratitudeDrops = this.getDrops('gratitude').length;
    if (gratitudeDrops >= 25) {
      badges.push('gratitude-guru');
    }

    // Task Master - Complete 50 tasks
    if (userData.completedTasks >= 50) {
      badges.push('task-master');
    }

    // Streak Star - Maintain 7-day streak
    if (userData.currentStreak >= 7) {
      badges.push('streak-star');
    }

    // Zen Master - Complete 100 mindful activities
    if (userData.totalDrops >= 100) {
      badges.push('zen-master');
    }

    // Sharp Shooter - Hit daily goals 14 days straight
    if (userData.currentStreak >= 14) {
      badges.push('sharp-shooter');
    }

    return badges;
  }
}

// Create global storage instance
const storage = new MindfulStorage();