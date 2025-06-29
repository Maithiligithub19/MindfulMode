// Leaderboard page functionality for MindfulMode

let currentTab = 'weekly';
let mockLeaderboardData = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeLeaderboardPage();
  generateMockData();
  loadUserRank();
  loadLeaderboard();
  loadUserBadges();
});

function initializeLeaderboardPage() {
  // Add click sounds to interactive elements
  const interactiveElements = document.querySelectorAll('button, .tab-btn, .badge-card');
  interactiveElements.forEach(element => {
    element.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Add hover effects to badge cards
  const badgeCards = document.querySelectorAll('.badge-card');
  badgeCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Show welcome message
  setTimeout(() => {
    showToast('See how you stack up with the mindful community! 🏆', 'info', 3000);
  }, 1000);
}

function generateMockData() {
  // Generate realistic mock leaderboard data
  const names = [
    'ZenMaster2024', 'MindfulSoul', 'CalmVibes', 'FocusNinja', 'PeacefulHeart',
    'SereneSpirit', 'QuietMind', 'BalancedLife', 'InnerPeace', 'MindfulJourney',
    'TranquilSoul', 'CenteredBeing', 'HarmonySeeker', 'StillWaters', 'ClearMind',
    'GentleBreeze', 'SilentStrength', 'PurePeace', 'DeepBreath', 'CalmOcean'
  ];
  
  const emojis = ['😌', '🧘', '🌸', '🌿', '💙', '✨', '🌙', '🦋', '🌊', '🍃'];
  
  mockLeaderboardData = names.map((name, index) => {
    const baseStreak = Math.max(1, 50 - index * 2 + Math.floor(Math.random() * 10));
    return {
      id: `user_${index}`,
      name,
      emoji: randomChoice(emojis),
      weeklyStreak: Math.max(1, baseStreak + Math.floor(Math.random() * 7)),
      monthlyStreak: Math.max(1, baseStreak + Math.floor(Math.random() * 15)),
      allTimeStreak: Math.max(1, baseStreak + Math.floor(Math.random() * 30)),
      totalDrops: Math.floor(Math.random() * 500) + 50,
      badges: generateRandomBadges()
    };
  });
  
  // Add user to leaderboard
  const userData = storage.getUserStats();
  const userEntry = {
    id: 'current_user',
    name: 'You',
    emoji: '😎',
    weeklyStreak: Math.min(7, userData.currentStreak || 0),
    monthlyStreak: Math.min(30, userData.currentStreak || 0),
    allTimeStreak: userData.longestStreak || 0,
    totalDrops: userData.totalDrops || 0,
    badges: storage.checkBadges()
  };
  
  mockLeaderboardData.push(userEntry);
  
  // Sort by current tab metric
  sortLeaderboard();
}

function generateRandomBadges() {
  const allBadges = ['focus-ninja', 'gratitude-guru', 'task-master', 'streak-star', 'zen-master', 'sharp-shooter'];
  const numBadges = Math.floor(Math.random() * 4); // 0-3 badges
  const badges = [];
  
  for (let i = 0; i < numBadges; i++) {
    const badge = randomChoice(allBadges);
    if (!badges.includes(badge)) {
      badges.push(badge);
    }
  }
  
  return badges;
}

function sortLeaderboard() {
  const sortKey = currentTab === 'weekly' ? 'weeklyStreak' : 
                  currentTab === 'monthly' ? 'monthlyStreak' : 'allTimeStreak';
  
  mockLeaderboardData.sort((a, b) => b[sortKey] - a[sortKey]);
}

function loadUserRank() {
  const userData = storage.getUserStats();
  const userNameEl = document.getElementById('userName');
  const userRankEl = document.getElementById('userRank');
  const userStreakEl = document.getElementById('userStreak');
  
  if (userNameEl) userNameEl.textContent = 'You';
  
  // Find user rank
  const userIndex = mockLeaderboardData.findIndex(user => user.id === 'current_user');
  const rank = userIndex >= 0 ? userIndex + 1 : mockLeaderboardData.length;
  
  if (userRankEl) {
    animateValue(0, rank, 1000, (value) => {
      userRankEl.textContent = value;
    });
  }
  
  if (userStreakEl) {
    animateValue(0, userData.currentStreak || 0, 800, (value) => {
      userStreakEl.textContent = value;
    });
  }
}

function loadUserBadges() {
  const userBadges = storage.checkBadges();
  const userBadgesContainer = document.getElementById('userBadges');
  
  if (!userBadgesContainer) return;
  
  userBadgesContainer.innerHTML = '';
  
  if (userBadges.length === 0) {
    userBadgesContainer.innerHTML = '<span style="color: var(--text-muted); font-size: var(--font-size-sm);">No badges yet</span>';
    return;
  }
  
  const badgeNames = {
    'focus-ninja': '🧠 Focus Ninja',
    'gratitude-guru': '🙏 Gratitude Guru',
    'task-master': '✅ Task Master',
    'streak-star': '⭐ Streak Star',
    'zen-master': '🧘 Zen Master',
    'sharp-shooter': '🎯 Sharp Shooter'
  };
  
  userBadges.forEach(badgeId => {
    const badge = document.createElement('div');
    badge.className = 'user-badge';
    badge.textContent = badgeNames[badgeId] || badgeId;
    userBadgesContainer.appendChild(badge);
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Resort and reload leaderboard
  sortLeaderboard();
  loadLeaderboard();
  loadUserRank();
  
  const tabNames = {
    weekly: 'This Week',
    monthly: 'This Month',
    alltime: 'All Time'
  };
  
  showToast(`Showing ${tabNames[tab]} leaderboard 📊`, 'info', 2000);
}

function loadLeaderboard() {
  const leaderboardList = document.getElementById('leaderboardList');
  if (!leaderboardList) return;
  
  leaderboardList.innerHTML = '';
  
  // Show top 20 users
  const topUsers = mockLeaderboardData.slice(0, 20);
  
  topUsers.forEach((user, index) => {
    const rank = index + 1;
    const leaderboardItem = createLeaderboardItem(user, rank);
    leaderboardItem.style.animationDelay = `${index * 0.05}s`;
    leaderboardList.appendChild(leaderboardItem);
  });
}

function createLeaderboardItem(user, rank) {
  const item = document.createElement('div');
  item.className = `leaderboard-item rank-${rank <= 3 ? rank : 'other'}`;
  
  const sortKey = currentTab === 'weekly' ? 'weeklyStreak' : 
                  currentTab === 'monthly' ? 'monthlyStreak' : 'allTimeStreak';
  const streakValue = user[sortKey];
  const progressPercentage = Math.min(100, (streakValue / Math.max(...mockLeaderboardData.map(u => u[sortKey]))) * 100);
  
  const isCurrentUser = user.id === 'current_user';
  
  item.innerHTML = `
    <div class="rank-number rank-${rank <= 3 ? rank : 'other'}">${rank}</div>
    <div class="user-avatar">${user.emoji}</div>
    <div class="user-info">
      <div class="user-name">${user.name}${isCurrentUser ? ' (You)' : ''}</div>
      <div class="user-stats">${user.totalDrops} total drops • ${user.badges.length} badges</div>
    </div>
    <div class="user-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="streak-count">${streakValue}</div>
    </div>
  `;
  
  // Highlight current user
  if (isCurrentUser) {
    item.style.border = '2px solid var(--accent-gradient)';
    item.style.background = 'rgba(255, 255, 255, 0.05)';
  }
  
  // Add click handler to show user details
  item.addEventListener('click', () => {
    showUserDetails(user, rank);
  });
  
  return item;
}

function showUserDetails(user, rank) {
  const badgeNames = {
    'focus-ninja': '🧠 Focus Ninja',
    'gratitude-guru': '🙏 Gratitude Guru',
    'task-master': '✅ Task Master',
    'streak-star': '⭐ Streak Star',
    'zen-master': '🧘 Zen Master',
    'sharp-shooter': '🎯 Sharp Shooter'
  };
  
  const badgesList = user.badges.length > 0 
    ? user.badges.map(badge => badgeNames[badge] || badge).join(', ')
    : 'No badges yet';
  
  const details = `
    Rank: #${rank}
    Weekly Streak: ${user.weeklyStreak} days
    Monthly Streak: ${user.monthlyStreak} days
    All-Time Streak: ${user.allTimeStreak} days
    Total Drops: ${user.totalDrops}
    Badges: ${badgesList}
  `;
  
  showToast(`${user.name}\n${details}`, 'info', 5000);
  playSound('success');
}

// Badge interaction
document.addEventListener('click', (e) => {
  if (e.target.closest('.badge-card')) {
    const badgeCard = e.target.closest('.badge-card');
    const badgeId = badgeCard.dataset.badge;
    
    if (badgeCard.classList.contains('earned')) {
      showToast('You\'ve earned this badge! 🏆', 'success');
      createConfetti(badgeCard);
    } else {
      showBadgeRequirements(badgeId);
    }
  }
});

function showBadgeRequirements(badgeId) {
  const requirements = {
    'focus-ninja': 'Complete 10 focus sessions to earn this badge',
    'gratitude-guru': 'Write 25 gratitude drops to earn this badge',
    'task-master': 'Complete 50 tasks to earn this badge',
    'streak-star': 'Maintain a 7-day streak to earn this badge',
    'zen-master': 'Complete 100 mindful activities to earn this badge',
    'sharp-shooter': 'Hit daily goals 14 days straight to earn this badge'
  };
  
  const requirement = requirements[badgeId] || 'Keep being mindful to earn this badge!';
  showToast(requirement, 'info', 4000);
}

// Update earned badges
function updateEarnedBadges() {
  const userBadges = storage.checkBadges();
  const badgeCards = document.querySelectorAll('.badge-card');
  
  badgeCards.forEach(card => {
    const badgeId = card.dataset.badge;
    const isEarned = userBadges.includes(badgeId);
    
    card.classList.toggle('earned', isEarned);
    
    if (isEarned && !card.querySelector('.earned-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'earned-indicator';
      indicator.textContent = '✓';
      indicator.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--success-color);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
      `;
      card.style.position = 'relative';
      card.appendChild(indicator);
    }
  });
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
  setInterval(() => {
    // Randomly update some users' streaks
    mockLeaderboardData.forEach(user => {
      if (user.id !== 'current_user' && Math.random() < 0.1) { // 10% chance
        const sortKey = currentTab === 'weekly' ? 'weeklyStreak' : 
                        currentTab === 'monthly' ? 'monthlyStreak' : 'allTimeStreak';
        user[sortKey] += Math.random() < 0.7 ? 1 : -1; // 70% chance to increase
        user[sortKey] = Math.max(0, user[sortKey]); // Don't go below 0
      }
    });
    
    // Resort and update if significant changes
    if (Math.random() < 0.3) { // 30% chance to update
      sortLeaderboard();
      loadLeaderboard();
    }
  }, 30000); // Every 30 seconds
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '3') {
    const tabs = ['weekly', 'monthly', 'alltime'];
    const tabIndex = parseInt(e.key) - 1;
    if (tabs[tabIndex]) {
      switchTab(tabs[tabIndex]);
    }
  }
});

// Initialize real-time updates
setTimeout(() => {
  simulateRealTimeUpdates();
}, 5000);

// Update badges on page load
window.addEventListener('load', () => {
  updateEarnedBadges();
});

// Refresh leaderboard periodically
setInterval(() => {
  loadUserRank();
  updateEarnedBadges();
}, 60000); // Every minute