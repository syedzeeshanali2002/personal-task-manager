# Personal Task Manager

A full-stack mobile task manager built with **React Native**, **Node.js + Express**, and **Firebase** (Auth + Firestore).

---

## Features

- **Firebase Authentication** – Email/password signup & login, session persistence, secure logout
- **Personal Tasks** – Create, view, mark complete/pending, and delete tasks
- **Backend Token Verification** – Every API request is validated with Firebase Admin SDK
- **React Native UI** – Clean screens with loading states, error handling, pull-to-refresh

---

## Architecture

```
task-manager/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── firebase.js        # Firebase Admin SDK initialization
│   │   ├── app.js             # Express app (middleware, routes, error handler)
│   │   ├── server.js          # HTTP server entry point
│   │   ├── middleware/
│   │   │   └── auth.js        # Bearer token verification middleware
│   │   ├── routes/
│   │   │   └── tasks.js       # POST/GET/PATCH/DELETE /tasks
│   │   ├── controllers/
│   │   │   └── taskController.js  # Request handling & validation
│   │   └── services/
│   │       └── firestore.js   # Firestore CRUD helpers
│   └── __tests__/
│       └── tasks.test.js      # Unit tests (all routes mocked)
│
└── frontend/                  # React Native app
    ├── App.js                 # NavigationContainer + AuthProvider
    ├── index.js               # AppRegistry entry
    └── src/
        ├── context/
        │   └── AuthContext.js # Auth state (user, loading, logout)
        ├── services/
        │   ├── auth.js        # Firebase Auth helpers (signIn/signUp/signOut/getIdToken)
        │   └── api.js         # Axios-based API layer (auto-attaches ID token)
        ├── components/
        │   ├── InputField.js  # Reusable labeled input with error display
        │   ├── TaskItem.js    # Task card with complete/delete actions
        │   └── LoadingSpinner.js
        └── screens/
            ├── LoginScreen.js
            ├── SignupScreen.js
            ├── TaskListScreen.js   # Pull-to-refresh, empty state
            └── CreateTaskScreen.js
```

### Auth Flow

1. User signs in / signs up via Firebase Auth (React Native).
2. Firebase returns a short-lived **ID token**.
3. React Native attaches the token as `Authorization: Bearer <token>` on every API call.
4. Express middleware calls `admin.auth().verifyIdToken(token)` – if invalid, returns `401`.
5. Verified `uid` is stored in `req.user` and used to scope all Firestore queries.

### Data Model (Firestore `tasks` collection)

| Field        | Type     | Notes                  |
|-------------|----------|------------------------|
| `userId`    | string   | Firebase UID (indexed) |
| `title`     | string   | Required               |
| `description` | string | Optional               |
| `status`    | string   | `Pending` \| `Completed` |
| `createdAt` | string   | ISO 8601 timestamp     |

---

## Setup

### Prerequisites

- Node.js ≥ 18
- A [Firebase project](https://console.firebase.google.com/) with:
  - **Authentication** → Email/Password provider enabled
  - **Firestore Database** created
- React Native environment ([setup guide](https://reactnative.dev/docs/environment-setup))

---

### Backend

#### 1. Install dependencies
```bash
cd backend
npm install
```

#### 2. Create a Firebase service account
1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download JSON

#### 3. Configure environment
```bash
cp .env.example .env
```
Fill in `.env` with your service account values:
```
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=...
```

#### 4. Create a Firestore composite index
Firestore requires a composite index for the task query:
- Collection: `tasks`
- Fields: `userId` (Ascending) + `createdAt` (Descending)

You can create it via the Firebase Console or by running the app once (a link will appear in the server logs).

#### 5. Run the server
```bash
npm run dev      # development (nodemon)
npm start        # production
```

#### 6. Run backend tests
```bash
npm test
```

---

### Frontend

#### 1. Install dependencies
```bash
cd frontend
npm install
```

#### 2. Install React Native Firebase

The project uses [`@react-native-firebase`](https://rnfirebase.io/) for a native Firebase integration:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

Follow the **iOS** and **Android** setup steps at https://rnfirebase.io/ (add `google-services.json` / `GoogleService-Info.plist`).

#### 3. Configure environment
```bash
cp .env.example .env
```
Fill in your Firebase Web SDK credentials (used only for reference – actual auth is handled natively via `@react-native-firebase`).

Update `frontend/src/services/api.js` to point `API_BASE_URL` to your backend URL (or set `REACT_APP_API_BASE_URL` in `.env`).

#### 4. Run the app
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## API Reference

All routes require `Authorization: Bearer <firebase-id-token>`.

| Method | Path          | Body                              | Description           |
|--------|---------------|-----------------------------------|-----------------------|
| `POST` | `/tasks`      | `{ title, description? }`         | Create a task         |
| `GET`  | `/tasks`      | –                                 | List user's tasks     |
| `PATCH`| `/tasks/:id`  | `{ title?, description?, status?}`| Update a task         |
| `DELETE`| `/tasks/:id` | –                                 | Delete a task         |

---

## Trade-offs

| Decision | Reason |
|---|---|
| `@react-native-firebase` instead of the JS SDK | Native SDKs handle token refresh, offline persistence, and background sync automatically — much more reliable in production mobile apps. |
| ISO 8601 string for `createdAt` | Simple to serialize/deserialize without needing Firestore `Timestamp` conversion on the client. |
| Status limited to `Pending` / `Completed` | Keeps the model simple as per requirements. Can be extended to `In Progress`, etc. |
| No refresh-token rotation on backend | Firebase Admin SDK validates tokens directly with Google's public keys; token expiry is enforced natively. |
| Firestore security rules not configured | Access control is enforced exclusively by the backend middleware. For direct Firestore access from the client, security rules should be added. |
| No pagination on `GET /tasks` | Acceptable for a personal task list. For large collections, cursor-based pagination should be added. |
