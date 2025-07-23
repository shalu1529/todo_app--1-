//controllers/taskController.js
const pool = require('../db');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a task
exports.createTask = async (req, res) => {
  const { title, description, due_date, priority } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, due_date, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, due_date, priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, is_completed } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, due_date=$3, priority=$4, is_completed=$5 WHERE id=$6 RETURNING *',
      [title, description, due_date, priority, is_completed, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark task as complete
exports.markTaskComplete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET is_completed = TRUE WHERE id=$1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
