const { db } = require('../firebase');

const TASKS_COLLECTION = 'tasks';

/**
 * Returns the Firestore collection reference for tasks.
 */
function tasksRef() {
  return db.collection(TASKS_COLLECTION);
}

/**
 * Creates a new task document for the given userId.
 * @param {string} userId
 * @param {{ title: string, description?: string }} data
 * @returns {Promise<FirebaseFirestore.DocumentReference>}
 */
async function createTask(userId, { title, description = '' }) {
  const docRef = await tasksRef().add({
    userId,
    title,
    description,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  });
  return docRef;
}

/**
 * Retrieves all tasks belonging to userId.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function getTasksByUser(userId) {
  const snapshot = await tasksRef()
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Fetches a single task by id, ensuring it belongs to userId.
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<Object|null>}
 */
async function getTaskByIdForUser(userId, taskId) {
  const doc = await tasksRef().doc(taskId).get();
  if (!doc.exists || doc.data().userId !== userId) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}

/**
 * Updates allowed fields on a task that belongs to userId.
 * @param {string} userId
 * @param {string} taskId
 * @param {Object} updates  – only 'title', 'description', 'status' are accepted
 * @returns {Promise<Object|null>}
 */
async function updateTask(userId, taskId, updates) {
  const task = await getTaskByIdForUser(userId, taskId);
  if (!task) return null;

  const allowed = {};
  if (updates.title !== undefined) allowed.title = updates.title;
  if (updates.description !== undefined) allowed.description = updates.description;
  if (updates.status !== undefined) allowed.status = updates.status;

  await tasksRef().doc(taskId).update(allowed);
  return { ...task, ...allowed };
}

/**
 * Deletes a task that belongs to userId.
 * @param {string} userId
 * @param {string} taskId
 * @returns {Promise<boolean>}
 */
async function deleteTask(userId, taskId) {
  const task = await getTaskByIdForUser(userId, taskId);
  if (!task) return false;

  await tasksRef().doc(taskId).delete();
  return true;
}

module.exports = {
  createTask,
  getTasksByUser,
  getTaskByIdForUser,
  updateTask,
  deleteTask,
};
