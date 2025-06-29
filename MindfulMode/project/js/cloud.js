// Cloud page functionality for MindfulMode

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initializeCloudPage();
  loadCloudStats();
  loadDrops();
});

function initializeCloudPage() {
  // Add click sounds to filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Add floating cloud animation
  addCloudAnimations();
  
  // Load user greeting
  showCloudGreeting();
}

function loadCloudStats() {
  const userData = storage.getUserStats();
  const weeklyStats = storage.getWeeklyStats();
  
  // Update stat displays
  const totalDropsEl = document.getElementById('totalDrops');
  const currentStreakEl = document.getElementById('currentStreak');
  const thisWeekEl = document.getElementById('thisWeek');
  
  if (totalDropsEl) {
    animateValue(0, userData.totalDrops || 0, 1000, (value) => {
      totalDropsEl.textContent = value;
    });
  }
  
  if (currentStreakEl) {
    animateValue(0, userData.currentStreak || 0, 1200, (value) => {
      currentStreakEl.textContent = value;
    });
  }
  
  if (thisWeekEl) {
    animateValue(0, weeklyStats.total || 0, 800, (value) => {
      thisWeekEl.textContent = value;
    });
  }
}

function loadDrops(filter = 'all') {
  const drops = storage.getDrops(filter);
  const dropsGrid = document.getElementById('dropsGrid');
  const emptyCloud = document.getElementById('emptyCloud');
  
  if (!dropsGrid) return;
  
  // Clear existing drops
  dropsGrid.innerHTML = '';
  
  if (drops.length === 0) {
    dropsGrid.style.display = 'none';
    if (emptyCloud) emptyCloud.style.display = 'block';
    return;
  }
  
  dropsGrid.style.display = 'grid';
  if (emptyCloud) emptyCloud.style.display = 'none';
  
  // Create drop cards
  drops.forEach((drop, index) => {
    const dropCard = createDropCard(drop);
    dropCard.style.animationDelay = `${index * 0.1}s`;
    dropsGrid.appendChild(dropCard);
  });
}

function createDropCard(drop) {
  const card = document.createElement('div');
  card.className = 'drop-card animate-fade-in';
  card.dataset.dropId = drop.id;
  
  const typeIcons = {
    gratitude: '🙏',
    journal: '📖',
    task: '✅',
    activity: '🧘'
  };
  
  const typeNames = {
    gratitude: 'Gratitude',
    journal: 'Journal',
    task: 'Task',
    activity: 'Activity'
  };
  
  const icon = typeIcons[drop.type] || '💎';
  const typeName = typeNames[drop.type] || 'Drop';
  const date = formatDate(new Date(drop.timestamp));
  
  card.innerHTML = `
    <div class="drop-header">
      <div class="drop-type">
        <span class="drop-type-icon">${icon}</span>
        <span>${typeName}</span>
      </div>
      <div class="drop-date">${date}</div>
    </div>
    <div class="drop-content">
      <p>${drop.content}</p>
    </div>
    <div class="drop-actions">
      <button class="drop-action-btn" onclick="shareDrop('${drop.id}')" title="Share">
        📤
      </button>
      <button class="drop-action-btn" onclick="copyDrop('${drop.id}')" title="Copy">
        📋
      </button>
      <button class="drop-action-btn" onclick="deleteDrop('${drop.id}')" title="Delete">
        🗑️
      </button>
    </div>
  `;
  
  // Add click handler for expansion
  card.addEventListener('click', (e) => {
    if (!e.target.classList.contains('drop-action-btn')) {
      expandDrop(card, drop);
    }
  });
  
  return card;
}

function filterDrops(filter) {
  currentFilter = filter;
  
  // Update filter button states
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  // Load filtered drops
  loadDrops(filter);
  
  // Show filter feedback
  const filterNames = {
    all: 'All Drops',
    gratitude: 'Gratitude Drops',
    journal: 'Journal Entries',
    task: 'Completed Tasks',
    activity: 'Mindful Activities'
  };
  
  showToast(`Showing: ${filterNames[filter]}`, 'info', 2000);
}

function expandDrop(card, drop) {
  // Toggle expanded state
  const isExpanded = card.classList.contains('expanded');
  
  // Close all other expanded cards
  document.querySelectorAll('.drop-card.expanded').forEach(c => {
    if (c !== card) {
      c.classList.remove('expanded');
    }
  });
  
  if (isExpanded) {
    card.classList.remove('expanded');
    return;
  }
  
  card.classList.add('expanded');
  
  // Add expanded content if not exists
  if (!card.querySelector('.drop-expanded')) {
    const expandedContent = document.createElement('div');
    expandedContent.className = 'drop-expanded';
    
    let extraInfo = '';
    if (drop.metadata) {
      if (drop.metadata.mood) {
        extraInfo += `<p><strong>Mood:</strong> ${drop.metadata.mood}</p>`;
      }
      if (drop.metadata.duration) {
        extraInfo += `<p><strong>Duration:</strong> ${drop.metadata.duration}</p>`;
      }
      if (drop.metadata.technique) {
        extraInfo += `<p><strong>Technique:</strong> ${drop.metadata.technique}</p>`;
      }
    }
    
    expandedContent.innerHTML = `
      <div class="drop-details">
        <p><strong>Created:</strong> ${new Date(drop.timestamp).toLocaleString()}</p>
        ${extraInfo}
      </div>
    `;
    
    card.appendChild(expandedContent);
  }
  
  playSound('click');
}

function shareDrop(dropId) {
  const drops = storage.get('drops') || [];
  const drop = drops.find(d => d.id === dropId);
  
  if (!drop) return;
  
  const shareText = `${drop.content}\n\n— From my MindfulMode journey 🌈`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My Mindful Drop',
      text: shareText
    }).catch(console.error);
  } else {
    copyToClipboard(shareText);
    showToast('Drop copied to clipboard for sharing! 📤', 'success');
  }
  
  playSound('success');
}

function copyDrop(dropId) {
  const drops = storage.get('drops') || [];
  const drop = drops.find(d => d.id === dropId);
  
  if (!drop) return;
  
  copyToClipboard(drop.content);
  playSound('success');
}

function deleteDrop(dropId) {
  // Show confirmation
  const confirmed = confirm('Are you sure you want to delete this drop? This action cannot be undone.');
  
  if (confirmed) {
    storage.removeDrop(dropId);
    
    // Remove from UI with animation
    const dropCard = document.querySelector(`[data-drop-id="${dropId}"]`);
    if (dropCard) {
      dropCard.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        dropCard.remove();
        
        // Check if grid is empty
        const remainingCards = document.querySelectorAll('.drop-card');
        if (remainingCards.length === 0) {
          loadDrops(currentFilter);
        }
      }, 300);
    }
    
    // Update stats
    loadCloudStats();
    
    showToast('Drop deleted', 'info');
    playSound('click');
  }
}

function addCloudAnimations() {
  // Add floating cloud animation to stats
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    card.style.animation = `cloudFloat 6s ease-in-out infinite`;
    card.style.animationDelay = `${index * 0.5}s`;
  });

  // Add cloud animation keyframes
  if (!document.querySelector('#cloud-animations')) {
    const style = document.createElement('style');
    style.id = 'cloud-animations';
    style.textContent = `
      @keyframes cloudFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }
      
      .drop-card.expanded {
        transform: scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        z-index: 10;
      }
      
      .drop-expanded {
        margin-top: var(--space-md);
        padding-top: var(--space-md);
        border-top: 1px solid var(--glass-border);
        animation: slideDown 0.3s ease-out;
      }
      
      @keyframes slideDown {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
}

function showCloudGreeting() {
  const userData = storage.getUserStats();
  const greeting = getTimeGreeting();
  
  setTimeout(() => {
    if (userData.totalDrops === 0) {
      showToast(`${greeting}! Start your mindful journey to collect drops ✨`, 'info', 4000);
    } else if (userData.totalDrops < 10) {
      showToast(`${greeting}! You're building a beautiful cloud ☁️`, 'info', 3000);
    } else if (userData.totalDrops < 50) {
      showToast(`${greeting}! Your mindfulness practice is growing strong 🌱`, 'info', 3000);
    } else {
      showToast(`${greeting}! Your cloud is absolutely amazing! 🌟`, 'info', 3000);
    }
  }, 1000);
}

// Search functionality
function searchDrops(query) {
  const allDrops = storage.get('drops') || [];
  const filteredDrops = allDrops.filter(drop => 
    drop.content.toLowerCase().includes(query.toLowerCase()) ||
    drop.type.toLowerCase().includes(query.toLowerCase())
  );
  
  const dropsGrid = document.getElementById('dropsGrid');
  const emptyCloud = document.getElementById('emptyCloud');
  
  if (!dropsGrid) return;
  
  dropsGrid.innerHTML = '';
  
  if (filteredDrops.length === 0) {
    dropsGrid.style.display = 'none';
    if (emptyCloud) {
      emptyCloud.style.display = 'block';
      emptyCloud.querySelector('h3').textContent = 'No drops found';
      emptyCloud.querySelector('p').textContent = `No drops match "${query}"`;
    }
    return;
  }
  
  dropsGrid.style.display = 'grid';
  if (emptyCloud) emptyCloud.style.display = 'none';
  
  filteredDrops.forEach((drop, index) => {
    const dropCard = createDropCard(drop);
    dropCard.style.animationDelay = `${index * 0.1}s`;
    dropsGrid.appendChild(dropCard);
  });
}

// Export cloud data
function exportCloudData() {
  const allData = storage.exportAllData();
  const filename = `mindful-cloud-${new Date().toISOString().split('T')[0]}.json`;
  downloadAsFile(allData, filename, 'application/json');
  
  showToast('Cloud data exported! 📤', 'success');
  playSound('success');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '5') {
    const filters = ['all', 'gratitude', 'journal', 'task', 'activity'];
    const filterIndex = parseInt(e.key) - 1;
    if (filters[filterIndex]) {
      filterDrops(filters[filterIndex]);
    }
  } else if (e.key === 'e' || e.key === 'E') {
    if (e.ctrlKey || e.metaKey) {
      exportCloudData();
    }
  }
});

// Auto-refresh stats periodically
setInterval(() => {
  loadCloudStats();
}, 30000); // Every 30 seconds