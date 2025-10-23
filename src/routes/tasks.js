const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// Get all tasks for current user
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;

  const tasks = db.tasks.findAll(req.user.id, filters);
  res.json({ tasks, count: tasks.length });
});

// Get single task
router.get('/:id', (req, res) => {
  const task = db.tasks.findById(req.params.id, req.user.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ task });
});

// Create new task
router.post('/', (req, res) => {
  const { title, description, priority = 'medium' } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' });
  }

  const task = db.tasks.create({
    user_id: req.user.id,
    title,
    description: description || null,
    priority
  });
  
  res.status(201).json({ 
    message: 'Task created successfully',
    task 
  });
});

// Update task
router.put('/:id', (req, res) => {
  const { title, description, status, priority } = req.body;

  // Check if task exists and belongs to user
  const existingTask = db.tasks.findById(req.params.id, req.user.id);

  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Validate status
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be pending, in_progress, or completed' 
    });
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' });
  }

  // Build updates object
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const task = db.tasks.update(req.params.id, req.user.id, updates);

  res.json({ 
    message: 'Task updated successfully',
    task 
  });
});

// Delete task
router.delete('/:id', (req, res) => {
  const deleted = db.tasks.delete(req.params.id, req.user.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ message: 'Task deleted successfully' });
});

// Get task statistics
router.get('/stats/summary', (req, res) => {
  const stats = db.tasks.getStats(req.user.id);
  res.json({ stats });
});

module.exports = router;
