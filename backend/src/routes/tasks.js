const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use(verifyToken);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
