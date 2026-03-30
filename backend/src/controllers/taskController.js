const firestoreService = require('../services/firestore');

/**
 * POST /tasks
 * Creates a new task for the authenticated user.
 */
async function createTask(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }

    const docRef = await firestoreService.createTask(req.user.uid, {
      title: title.trim(),
      description: description ? String(description).trim() : '',
    });

    return res.status(201).json({ id: docRef.id, message: 'Task created' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /tasks
 * Returns all tasks for the authenticated user.
 */
async function getTasks(req, res, next) {
  try {
    const tasks = await firestoreService.getTasksByUser(req.user.uid);
    return res.json(tasks);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /tasks/:id
 * Updates title, description, and/or status for a task owned by the user.
 */
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const validStatuses = ['Pending', 'Completed'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await firestoreService.updateTask(req.user.uid, id, {
      title,
      description,
      status,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /tasks/:id
 * Deletes a task owned by the authenticated user.
 */
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await firestoreService.deleteTask(req.user.uid, id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };
