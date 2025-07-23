const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { saveSubscription } = require('../utils/notificationHelper');

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id/complete', taskController.markTaskComplete);

router.post('/subscribe', (req, res) => {
  saveSubscription(req.body);
  res.status(201).json({ message: 'Subscribed to push notifications' });
});

module.exports = router;

