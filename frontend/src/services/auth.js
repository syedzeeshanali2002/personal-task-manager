import auth from '@react-native-firebase/auth';

/**
 * Signs up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@firebase/auth').UserCredential>}
 */
export async function signUp(email, password) {
  return auth().createUserWithEmailAndPassword(email, password);
}

/**
 * Signs in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@firebase/auth').UserCredential>}
 */
export async function signIn(email, password) {
  return auth().signInWithEmailAndPassword(email, password);
}

/**
 * Signs out the currently authenticated user.
 * @returns {Promise<void>}
 */
export async function signOut() {
  return auth().signOut();
}

/**
 * Returns the current Firebase user, or null.
 * @returns {import('@firebase/auth').User | null}
 */
export function getCurrentUser() {
  return auth().currentUser;
}

/**
 * Retrieves the Firebase ID token for the current user.
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<string>}
 */
export async function getIdToken(forceRefresh = false) {
  const user = auth().currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.getIdToken(forceRefresh);
}

/**
 * Subscribes to auth state changes.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function onAuthStateChanged(callback) {
  return auth().onAuthStateChanged(callback);
}
