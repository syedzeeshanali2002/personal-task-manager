/**
 * Frontend unit tests for services and validation logic.
 *
 * Heavy React Native rendering is skipped in CI (no native modules).
 * These tests focus on the pure-JS logic: service functions, validation
 * helpers extracted from screens, and the API layer.
 */

// ---------------------------------------------------------------------------
// Mock @react-native-firebase/auth
// ---------------------------------------------------------------------------
const mockUser = {
  uid: 'user-123',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
};
const mockAuth = {
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  currentUser: mockUser,
  onAuthStateChanged: jest.fn(),
};
jest.mock('@react-native-firebase/auth', () => () => mockAuth);

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    interceptors: {
      request: { use: jest.fn((fn) => fn) },
      response: { use: jest.fn() },
    },
  })),
}));

// ---------------------------------------------------------------------------
// Auth service tests
// ---------------------------------------------------------------------------
describe('auth service', () => {
  const { signUp, signIn, signOut, getIdToken, getCurrentUser } = require('../src/services/auth');

  beforeEach(() => jest.clearAllMocks());

  it('signUp calls createUserWithEmailAndPassword', async () => {
    mockAuth.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    await signUp('test@example.com', 'password123');
    expect(mockAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });

  it('signIn calls signInWithEmailAndPassword', async () => {
    mockAuth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    await signIn('test@example.com', 'password123');
    expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });

  it('signOut calls auth().signOut()', async () => {
    mockAuth.signOut.mockResolvedValue(undefined);
    await signOut();
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it('getIdToken returns token from current user', async () => {
    const token = await getIdToken();
    expect(token).toBe('mock-id-token');
    expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
  });

  it('getIdToken throws when no user is authenticated', async () => {
    const savedUser = mockAuth.currentUser;
    mockAuth.currentUser = null;
    // Re-require to pick up null currentUser
    jest.resetModules();
    jest.mock('@react-native-firebase/auth', () => () => ({ ...mockAuth, currentUser: null }));
    const { getIdToken: getIdTokenFresh } = require('../src/services/auth');
    await expect(getIdTokenFresh()).rejects.toThrow('No authenticated user');
    mockAuth.currentUser = savedUser;
  });

  it('getCurrentUser returns current Firebase user', () => {
    const user = getCurrentUser();
    expect(user).toBe(mockUser);
  });
});

// ---------------------------------------------------------------------------
// API service tests
// ---------------------------------------------------------------------------
describe('api service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createTask calls POST /tasks and returns data', async () => {
    const { createTask } = require('../src/services/api');
    mockPost.mockResolvedValue({ data: { id: 'task-1', message: 'Task created' } });

    const result = await createTask({ title: 'Buy milk' });
    expect(mockPost).toHaveBeenCalledWith('/tasks', { title: 'Buy milk' });
    expect(result).toEqual({ id: 'task-1', message: 'Task created' });
  });

  it('getTasks calls GET /tasks and returns array', async () => {
    const { getTasks } = require('../src/services/api');
    const tasks = [{ id: 'task-1', title: 'Buy milk', status: 'Pending' }];
    mockGet.mockResolvedValue({ data: tasks });

    const result = await getTasks();
    expect(mockGet).toHaveBeenCalledWith('/tasks');
    expect(result).toEqual(tasks);
  });

  it('updateTask calls PATCH /tasks/:id', async () => {
    const { updateTask } = require('../src/services/api');
    const updated = { id: 'task-1', status: 'Completed' };
    mockPatch.mockResolvedValue({ data: updated });

    const result = await updateTask('task-1', { status: 'Completed' });
    expect(mockPatch).toHaveBeenCalledWith('/tasks/task-1', { status: 'Completed' });
    expect(result).toEqual(updated);
  });

  it('deleteTask calls DELETE /tasks/:id', async () => {
    const { deleteTask } = require('../src/services/api');
    mockDelete.mockResolvedValue({});

    await deleteTask('task-1');
    expect(mockDelete).toHaveBeenCalledWith('/tasks/task-1');
  });
});

// ---------------------------------------------------------------------------
// Validation logic (extracted from screen logic)
// ---------------------------------------------------------------------------
describe('Login form validation logic', () => {
  function validateLogin(email, password) {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  }

  it('passes with valid credentials', () => {
    expect(validateLogin('user@example.com', 'secret1')).toEqual({});
  });
  it('fails when email is empty', () => {
    const errs = validateLogin('', 'secret1');
    expect(errs.email).toBe('Email is required');
  });
  it('fails with malformed email', () => {
    const errs = validateLogin('not-an-email', 'secret1');
    expect(errs.email).toBe('Enter a valid email');
  });
  it('fails when password is too short', () => {
    const errs = validateLogin('user@example.com', '123');
    expect(errs.password).toBe('Minimum 6 characters');
  });
});

describe('Create Task form validation logic', () => {
  function validateTask(title) {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 200) errs.title = 'Title must be 200 characters or fewer';
    return errs;
  }

  it('passes with a valid title', () => {
    expect(validateTask('Buy groceries')).toEqual({});
  });
  it('fails when title is empty', () => {
    expect(validateTask('').title).toBe('Title is required');
  });
  it('fails when title is whitespace only', () => {
    expect(validateTask('   ').title).toBe('Title is required');
  });
  it('fails when title exceeds 200 characters', () => {
    expect(validateTask('x'.repeat(201)).title).toBe('Title must be 200 characters or fewer');
  });
});
