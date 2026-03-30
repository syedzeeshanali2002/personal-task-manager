/**
 * Unit tests for the task controller using mocked services.
 *
 * Firebase Admin and the Firestore service are fully mocked so
 * these tests run without any network or credentials.
 */

// Mock Firebase Admin before requiring app modules
jest.mock('firebase-admin', () => {
  const mockVerifyIdToken = jest.fn();
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken })),
    firestore: jest.fn(() => ({})),
    _mockVerifyIdToken: mockVerifyIdToken,
  };
});

// Mock the Firestore service
jest.mock('../src/services/firestore');

const request = require('supertest');
const admin = require('firebase-admin');
const firestoreService = require('../src/services/firestore');
const app = require('../src/app');

const VALID_TOKEN = 'valid-token';
const USER_ID = 'user-123';

beforeEach(() => {
  jest.clearAllMocks();
  admin._mockVerifyIdToken.mockResolvedValue({ uid: USER_ID });
});

const authHeader = { Authorization: `Bearer ${VALID_TOKEN}` };

// ---------------------------------------------------------------------------
// POST /tasks
// ---------------------------------------------------------------------------
describe('POST /tasks', () => {
  it('creates a task and returns 201', async () => {
    firestoreService.createTask.mockResolvedValue({ id: 'task-1' });

    const res = await request(app)
      .post('/tasks')
      .set(authHeader)
      .send({ title: 'Buy groceries', description: 'Milk and eggs' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'task-1', message: 'Task created' });
    expect(firestoreService.createTask).toHaveBeenCalledWith(USER_ID, {
      title: 'Buy groceries',
      description: 'Milk and eggs',
    });
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .set(authHeader)
      .send({ description: 'No title' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /tasks
// ---------------------------------------------------------------------------
describe('GET /tasks', () => {
  it('returns tasks for the authenticated user', async () => {
    const tasks = [
      { id: 'task-1', title: 'Task 1', status: 'Pending' },
      { id: 'task-2', title: 'Task 2', status: 'Completed' },
    ];
    firestoreService.getTasksByUser.mockResolvedValue(tasks);

    const res = await request(app).get('/tasks').set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tasks);
    expect(firestoreService.getTasksByUser).toHaveBeenCalledWith(USER_ID);
  });

  it('returns 401 when token is invalid', async () => {
    admin._mockVerifyIdToken.mockRejectedValue(new Error('invalid token'));

    const res = await request(app)
      .get('/tasks')
      .set({ Authorization: 'Bearer bad-token' });

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PATCH /tasks/:id
// ---------------------------------------------------------------------------
describe('PATCH /tasks/:id', () => {
  it('marks a task as completed', async () => {
    const updated = { id: 'task-1', title: 'Task 1', status: 'Completed' };
    firestoreService.updateTask.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/tasks/task-1')
      .set(authHeader)
      .send({ status: 'Completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Completed');
    expect(firestoreService.updateTask).toHaveBeenCalledWith(USER_ID, 'task-1', {
      title: undefined,
      description: undefined,
      status: 'Completed',
    });
  });

  it('returns 404 when task not found', async () => {
    firestoreService.updateTask.mockResolvedValue(null);

    const res = await request(app)
      .patch('/tasks/missing')
      .set(authHeader)
      .send({ status: 'Completed' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status value', async () => {
    const res = await request(app)
      .patch('/tasks/task-1')
      .set(authHeader)
      .send({ status: 'InvalidStatus' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/i);
  });
});

// ---------------------------------------------------------------------------
// DELETE /tasks/:id
// ---------------------------------------------------------------------------
describe('DELETE /tasks/:id', () => {
  it('deletes a task and returns 204', async () => {
    firestoreService.deleteTask.mockResolvedValue(true);

    const res = await request(app).delete('/tasks/task-1').set(authHeader);

    expect(res.status).toBe(204);
    expect(firestoreService.deleteTask).toHaveBeenCalledWith(USER_ID, 'task-1');
  });

  it('returns 404 when task not found or not owned by user', async () => {
    firestoreService.deleteTask.mockResolvedValue(false);

    const res = await request(app).delete('/tasks/other-user-task').set(authHeader);

    expect(res.status).toBe(404);
  });
});
