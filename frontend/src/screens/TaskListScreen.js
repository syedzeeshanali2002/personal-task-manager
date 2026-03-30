import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import TaskItem from '../components/TaskItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask, deleteTask } from '../services/api';

function TaskListScreen({ navigation }) {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    }
  }, []);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  // Refresh tasks when returning from CreateTaskScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation, fetchTasks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  const handleToggleComplete = useCallback(async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      Alert.alert('Error', 'Could not update task status');
    }
  }, []);

  const handleDelete = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      Alert.alert('Error', 'Could not delete task');
    }
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchTasks} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks yet.</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first task.</Text>
          </View>
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
        accessibilityLabel="Create new task"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fdecea',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#c0392b',
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
  },
});

export default TaskListScreen;
