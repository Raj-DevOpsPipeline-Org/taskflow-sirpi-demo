const fs = require('fs');
const path = require('path');

// Simple JSON file-based database (for demo purposes)
// In production, you'd use PostgreSQL, MongoDB, etc.

const DB_FILE = path.join(__dirname, '..', 'data.json');

// Initialize database structure
let db = {
  users: [],
  tasks: [],
  nextUserId: 1,
  nextTaskId: 1
};

// Load existing data if file exists
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    console.warn('Could not load database file, starting fresh');
  }
}

// Save database to file
function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Database operations
const database = {
  // Users
  users: {
    findByEmail: (email) => {
      return db.users.find(u => u.email === email);
    },
    findById: (id) => {
      return db.users.find(u => u.id === id);
    },
    create: (user) => {
      const newUser = {
        id: db.nextUserId++,
        ...user,
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      saveDb();
      return newUser;
    }
  },

  // Tasks
  tasks: {
    findAll: (userId, filters = {}) => {
      let tasks = db.tasks.filter(t => t.user_id === userId);
      
      if (filters.status) {
        tasks = tasks.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        tasks = tasks.filter(t => t.priority === filters.priority);
      }
      
      return tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    
    findById: (id, userId) => {
      return db.tasks.find(t => t.id === parseInt(id) && t.user_id === userId);
    },
    
    create: (task) => {
      const newTask = {
        id: db.nextTaskId++,
        ...task,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.tasks.push(newTask);
      saveDb();
      return newTask;
    },
    
    update: (id, userId, updates) => {
      const taskIndex = db.tasks.findIndex(t => t.id === parseInt(id) && t.user_id === userId);
      if (taskIndex === -1) return null;
      
      db.tasks[taskIndex] = {
        ...db.tasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveDb();
      return db.tasks[taskIndex];
    },
    
    delete: (id, userId) => {
      const initialLength = db.tasks.length;
      db.tasks = db.tasks.filter(t => !(t.id === parseInt(id) && t.user_id === userId));
      const deleted = initialLength !== db.tasks.length;
      if (deleted) saveDb();
      return deleted;
    },
    
    getStats: (userId) => {
      const userTasks = db.tasks.filter(t => t.user_id === userId);
      return {
        total: userTasks.length,
        pending: userTasks.filter(t => t.status === 'pending').length,
        in_progress: userTasks.filter(t => t.status === 'in_progress').length,
        completed: userTasks.filter(t => t.status === 'completed').length,
        high_priority: userTasks.filter(t => t.priority === 'high').length
      };
    }
  }
};

console.log('✅ Database initialized (JSON file storage)');

module.exports = database;
