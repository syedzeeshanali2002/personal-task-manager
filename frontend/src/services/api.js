import axios from 'axios';
import { getIdToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * Creates an Axios instance that automatically attaches a fresh
 * Firebase ID token to every request.
 */
const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Creates a new task.
 * @param {{ title: string, description?: string }} taskData
 */
export async function createTask(taskData) {
  const { data } = await apiClient.post('/tasks', taskData);
  return data;
}

/**
 * Fetches all tasks for the current user.
 * @returns {Promise<Array>}
 */
export async function getTasks() {
  const { data } = await apiClient.get('/tasks');
  return data;
}

/**
 * Updates a task (title, description, status).
 * @param {string} taskId
 * @param {Object} updates
 */
export async function updateTask(taskId, updates) {
  const { data } = await apiClient.patch(`/tasks/${taskId}`, updates);
  return data;
}

/**
 * Deletes a task by id.
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
  await apiClient.delete(`/tasks/${taskId}`);
}
