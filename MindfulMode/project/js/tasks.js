// Tasks page functionality for MindfulMode

let pomodoroTimer = null;
let pomodoroState = 'stopped'; // stopped, work, break
let pomodoroTimeLeft = 25 * 60; // 25 minutes in seconds

document.addEventListener('DOMContentLoaded', () => {
  initializeTasksPage();
  loadTasks();
  loadTaskStats();
  initializePomodoro();
});

function initializeTasksPage() {
  // Add enter key handler for task input
  const taskInput = document.getElementById('newTaskInput');
  if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addNewTask();
      }
    });
    
    taskInput.addEventListener('focus', () => {
      playSound('click');
    });
  }

  // Add click sounds to buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Show motivational quote
  setTimeout(() => {
    const taskQuote = quoteManager.getTaskQuote();
    showToast(taskQuote.text, 'info', 4000);
  }, 1500);
}

function loadTasks() {
  const tasks = storage.getTasks();
  const tasksList = document.getElementById('tasksList');
  const emptyTasks = document.getElementById('emptyTasks');
  
  if (!tasksList) return;
  
  tasksList.innerHTML = '';
  
  if (tasks.length === 0) {
    tasksList.style.display = 'none';
    if (emptyTasks) emptyTasks.style.display = 'block';
    return;
  }
  
  tasksList.style.display = 'flex';
  if (emptyTasks) emptyTasks.style.display = 'none';
  
  tasks.forEach((task, index) => {
    const taskElement = createTaskElement(task);
    taskElement.style.animationDelay = `${index * 0.1}s`;
    tasksList.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const taskItem = document.createElement('div');
  taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
  taskItem.dataset.taskId = task.id;
  
  const createdDate = formatDate(new Date(task.createdAt));
  const completedDate = task.completedAt ? formatDate(new Date(task.completedAt)) : null;
  
  taskItem.innerHTML = `
    <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
      ${task.completed ? '✓' : ''}
    </div>
    <div class="task-content">
      <div class="task-text">${task.text}</div>
      <div class="task-meta">
        <span>Created ${createdDate}</span>
        ${completedDate ? `<span>Completed ${completedDate}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn" onclick="editTask('${task.id}')" title="Edit">
        ✏️
      </button>
      <button class="task-action-btn" onclick="deleteTask('${task.id}')" title="Delete">
        🗑️
      </button>
    </div>
  `;
  
  return taskItem;
}

function addNewTask() {
  const taskInput = document.getElementById('newTaskInput');
  if (!taskInput || !taskInput.value.trim()) {
    showToast('Please enter a task! 📝', 'warning');
    return;
  }
  
  const taskText = taskInput.value.trim();
  const task = storage.addTask(taskText);
  
  // Clear input
  taskInput.value = '';
  
  // Add to UI with animation
  const tasksList = document.getElementById('tasksList');
  const emptyTasks = document.getElementById('emptyTasks');
  
  if (tasksList) {
    if (emptyTasks) emptyTasks.style.display = 'none';
    tasksList.style.display = 'flex';
    
    const taskElement = createTaskElement(task);
    taskElement.classList.add('new');
    tasksList.insertBefore(taskElement, tasksList.firstChild);
    
    // Animate in
    setTimeout(() => {
      taskElement.classList.remove('new');
    }, 100);
  }
  
  // Update stats
  loadTaskStats();
  
  // Show success
  showToast('Task added! 📝✨', 'success');
  createFloatingElement('📝', taskInput.parentElement);
  playSound('success');
  hapticFeedback('light');
}

function toggleTask(taskId) {
  const tasks = storage.getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return;
  
  const wasCompleted = task.completed;
  const updatedTask = storage.updateTask(taskId, { 
    completed: !wasCompleted,
    completedAt: !wasCompleted ? new Date().toISOString() : null
  });
  
  if (!updatedTask) return;
  
  // Update UI
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (taskElement) {
    const checkbox = taskElement.querySelector('.task-checkbox');
    
    if (updatedTask.completed) {
      // Task completed
      taskElement.classList.add('completing');
      checkbox.classList.add('checked');
      checkbox.textContent = '✓';
      
      setTimeout(() => {
        taskElement.classList.remove('completing');
        taskElement.classList.add('completed');
        
        // Add completion effects
        createConfetti(checkbox);
        createFloatingElement('🎉', taskElement);
        playSound('complete');
        hapticFeedback('heavy');
        
        // Update task meta
        const taskMeta = taskElement.querySelector('.task-meta');
        const completedDate = formatDate(new Date(updatedTask.completedAt));
        taskMeta.innerHTML += `<span>Completed ${completedDate}</span>`;
        
        showToast('Task completed! Great job! 🎉', 'success');
      }, 500);
      
    } else {
      // Task uncompleted
      taskElement.classList.remove('completed');
      checkbox.classList.remove('checked');
      checkbox.textContent = '';
      
      // Remove completion date from meta
      const taskMeta = taskElement.querySelector('.task-meta');
      const spans = taskMeta.querySelectorAll('span');
      spans.forEach(span => {
        if (span.textContent.includes('Completed')) {
          span.remove();
        }
      });
      
      playSound('click');
    }
  }
  
  // Update stats
  loadTaskStats();
}

function editTask(taskId) {
  const tasks = storage.getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return;
  
  const newText = prompt('Edit task:', task.text);
  if (newText && newText.trim() && newText.trim() !== task.text) {
    storage.updateTask(taskId, { text: newText.trim() });
    
    // Update UI
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      const taskTextEl = taskElement.querySelector('.task-text');
      taskTextEl.textContent = newText.trim();
    }
    
    showToast('Task updated! ✏️', 'success');
    playSound('success');
  }
}

function deleteTask(taskId) {
  const confirmed = confirm('Are you sure you want to delete this task?');
  
  if (confirmed) {
    storage.removeTask(taskId);
    
    // Remove from UI with animation
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        taskElement.remove();
        
        // Check if list is empty
        const remainingTasks = document.querySelectorAll('.task-item');
        if (remainingTasks.length === 0) {
          loadTasks();
        }
      }, 300);
    }
    
    // Update stats
    loadTaskStats();
    
    showToast('Task deleted', 'info');
    playSound('click');
  }
}

function loadTaskStats() {
  const userData = storage.getUserStats();
  const completedToday = storage.getTasksCompletedToday();
  const taskStreak = calculateTaskStreak();
  
  // Update stat displays
  const completedTodayEl = document.getElementById('completedToday');
  const taskStreakEl = document.getElementById('taskStreak');
  
  if (completedTodayEl) {
    animateValue(parseInt(completedTodayEl.textContent) || 0, completedToday, 500, (value) => {
      completedTodayEl.textContent = value;
    });
  }
  
  if (taskStreakEl) {
    animateValue(parseInt(taskStreakEl.textContent) || 0, taskStreak, 800, (value) => {
      taskStreakEl.textContent = value;
    });
  }
}

function calculateTaskStreak() {
  const tasks = storage.getTasks();
  const completedTasks = tasks.filter(task => task.completed && task.completedAt);
  
  if (completedTasks.length === 0) return 0;
  
  // Group by date
  const dateGroups = {};
  completedTasks.forEach(task => {
    const date = new Date(task.completedAt).toDateString();
    if (!dateGroups[date]) {
      dateGroups[date] = 0;
    }
    dateGroups[date]++;
  });
  
  const dates = Object.keys(dateGroups).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (const dateStr of dates) {
    const checkDate = currentDate.toDateString();
    
    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Pomodoro Timer Functions
function initializePomodoro() {
  updateTimerDisplay();
  
  // Load saved settings
  const workMinutes = localStorage.getItem('pomodoro-work') || 25;
  const breakMinutes = localStorage.getItem('pomodoro-break') || 5;
  
  const workInput = document.getElementById('workMinutes');
  const breakInput = document.getElementById('breakMinutes');
  
  if (workInput) workInput.value = workMinutes;
  if (breakInput) breakInput.value = breakMinutes;
  
  pomodoroTimeLeft = workMinutes * 60;
  updateTimerDisplay();
}

function startPomodoro() {
  if (pomodoroTimer) return;
  
  const startBtn = document.getElementById('startTimerBtn');
  const pauseBtn = document.getElementById('pauseTimerBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';
  if (timerDisplay) timerDisplay.classList.add('active');
  
  pomodoroState = 'work';
  
  pomodoroTimer = setInterval(() => {
    pomodoroTimeLeft--;
    updateTimerDisplay();
    
    if (pomodoroTimeLeft <= 0) {
      completePomodoroSession();
    }
  }, 1000);
  
  showToast('Focus session started! 🍅', 'success');
  playSound('success');
}

function pausePomodoro() {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
  }
  
  const startBtn = document.getElementById('startTimerBtn');
  const pauseBtn = document.getElementById('pauseTimerBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  
  if (startBtn) {
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Resume';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (timerDisplay) timerDisplay.classList.remove('active');
  
  showToast('Timer paused', 'info');
  playSound('click');
}

function resetPomodoro() {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
  }
  
  const workMinutes = document.getElementById('workMinutes')?.value || 25;
  pomodoroTimeLeft = workMinutes * 60;
  pomodoroState = 'stopped';
  
  const startBtn = document.getElementById('startTimerBtn');
  const pauseBtn = document.getElementById('pauseTimerBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  
  if (startBtn) {
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Start';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (timerDisplay) timerDisplay.classList.remove('active');
  
  updateTimerDisplay();
  showToast('Timer reset', 'info');
  playSound('click');
}

function completePomodoroSession() {
  clearInterval(pomodoroTimer);
  pomodoroTimer = null;
  
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) timerDisplay.classList.remove('active');
  
  if (pomodoroState === 'work') {
    // Work session completed
    const breakMinutes = document.getElementById('breakMinutes')?.value || 5;
    pomodoroTimeLeft = breakMinutes * 60;
    pomodoroState = 'break';
    
    // Add activity drop
    storage.addDrop('activity', 'Completed Pomodoro focus session', {
      type: 'pomodoro',
      duration: '25 minutes',
      sessionType: 'work'
    });
    
    // Play timer completion sound
    playSound('timer');
    
    showToast('Focus session complete! Time for a break! 🎉', 'success');
    createConfetti(document.getElementById('timerDisplay'));
    hapticFeedback('heavy');
    
    // Auto-start break timer
    setTimeout(() => {
      if (confirm('Start break timer?')) {
        startPomodoro();
      }
    }, 2000);
    
  } else {
    // Break completed
    const workMinutes = document.getElementById('workMinutes')?.value || 25;
    pomodoroTimeLeft = workMinutes * 60;
    pomodoroState = 'stopped';
    
    // Play bell sound for break completion
    playSound('bell');
    
    showToast('Break complete! Ready for another focus session? 💪', 'info');
  }
  
  updateTimerDisplay();
  resetPomodoroButtons();
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) {
    timerDisplay.textContent = formatTime(pomodoroTimeLeft);
    
    // Change color based on state
    if (pomodoroState === 'work') {
      timerDisplay.style.background = 'var(--primary-gradient)';
      timerDisplay.style.webkitBackgroundClip = 'text';
      timerDisplay.style.webkitTextFillColor = 'transparent';
    } else if (pomodoroState === 'break') {
      timerDisplay.style.background = 'var(--success-color)';
      timerDisplay.style.webkitBackgroundClip = 'text';
      timerDisplay.style.webkitTextFillColor = 'transparent';
    } else {
      timerDisplay.style.background = 'var(--primary-gradient)';
      timerDisplay.style.webkitBackgroundClip = 'text';
      timerDisplay.style.webkitTextFillColor = 'transparent';
    }
  }
}

function resetPomodoroButtons() {
  const startBtn = document.getElementById('startTimerBtn');
  const pauseBtn = document.getElementById('pauseTimerBtn');
  
  if (startBtn) {
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Start';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';
}

// Save timer settings
document.addEventListener('change', (e) => {
  if (e.target.id === 'workMinutes') {
    localStorage.setItem('pomodoro-work', e.target.value);
    if (pomodoroState === 'stopped') {
      pomodoroTimeLeft = e.target.value * 60;
      updateTimerDisplay();
    }
  } else if (e.target.id === 'breakMinutes') {
    localStorage.setItem('pomodoro-break', e.target.value);
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    if (pomodoroTimer) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      resetPomodoro();
    }
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
  }
});