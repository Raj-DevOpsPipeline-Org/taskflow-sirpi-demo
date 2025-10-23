let authToken = localStorage.getItem('authToken');
let currentFilter = 'all';
let allTasks = [];

// Check if user is logged in
if (authToken) {
  showApp();
  loadTasks();
} else {
  showAuth();
}

function showAuth() {
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('app-section').style.display = 'none';
}

function showApp() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'block';
  loadUserInfo();
  loadStats();
}

function showLogin() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
}

async function register() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      showApp();
      loadTasks();
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (error) {
    alert('Registration error: ' + error.message);
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      showApp();
      loadTasks();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    alert('Login error: ' + error.message);
  }
}

function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  showAuth();
}

async function loadUserInfo() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById('user-name').textContent = data.user.name;
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

async function loadStats() {
  try {
    const response = await fetch('/api/tasks/stats/summary', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById('stat-total').textContent = data.stats.total;
      document.getElementById('stat-pending').textContent = data.stats.pending;
      document.getElementById('stat-progress').textContent = data.stats.in_progress;
      document.getElementById('stat-completed').textContent = data.stats.completed;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadTasks() {
  try {
    let url = '/api/tasks';
    if (currentFilter !== 'all') {
      url += `?status=${currentFilter}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    if (response.ok) {
      allTasks = data.tasks;
      renderTasks(data.tasks);
      loadStats();
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

function renderTasks(tasks) {
  const tasksList = document.getElementById('tasks-list');
  
  if (tasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📝</div>
        <p>No tasks found. Create your first task!</p>
      </div>
    `;
    return;
  }

  tasksList.innerHTML = tasks.map(task => `
    <div class="task-card">
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="badge ${task.status}">${formatStatus(task.status)}</span>
          <span class="badge ${task.priority}">${task.priority}</span>
        </div>
      </div>
      <div class="task-actions">
        ${task.status !== 'completed' ? `
          <button class="btn-next" onclick="moveTaskForward(${task.id}, '${task.status}')">
            ${getNextStatusLabel(task.status)}
          </button>
        ` : ''}
        <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function formatStatus(status) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getNextStatusLabel(currentStatus) {
  if (currentStatus === 'pending') return 'Start';
  if (currentStatus === 'in_progress') return 'Complete';
  return '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function createTask() {
  const title = document.getElementById('new-task-title').value.trim();
  const priority = document.getElementById('new-task-priority').value;

  if (!title) {
    alert('Please enter a task title');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ title, priority })
    });

    if (response.ok) {
      document.getElementById('new-task-title').value = '';
      document.getElementById('new-task-priority').value = 'medium';
      loadTasks();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to create task');
    }
  } catch (error) {
    alert('Error creating task: ' + error.message);
  }
}

async function moveTaskForward(taskId, currentStatus) {
  const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (response.ok) {
      loadTasks();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to update task');
    }
  } catch (error) {
    alert('Error updating task: ' + error.message);
  }
}

async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.ok) {
      loadTasks();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete task');
    }
  } catch (error) {
    alert('Error deleting task: ' + error.message);
  }
}

function filterTasks(filter) {
  currentFilter = filter;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  loadTasks();
}

// Allow Enter key to submit forms
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
  document.getElementById('register-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') register();
  });
  document.getElementById('new-task-title')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createTask();
  });
});
