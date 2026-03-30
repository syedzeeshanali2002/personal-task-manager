import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoadingSpinner from './src/components/LoadingSpinner';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading, logout } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#3498db' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{
                title: 'My Tasks',
                headerRight: () => (
                  <TouchableOpacity onPress={logout} accessibilityLabel="Log out">
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="CreateTask"
              component={CreateTaskScreen}
              options={{ title: 'New Task' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
