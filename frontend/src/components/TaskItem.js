import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

/**
 * Displays a single task with complete and delete actions.
 *
 * @param {object} props
 * @param {object} props.task  – { id, title, description, status, createdAt }
 * @param {Function} props.onToggleComplete
 * @param {Function} props.onDelete
 */
function TaskItem({ task, onToggleComplete, onDelete }) {
  const isCompleted = task.status === 'Completed';

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
    ]);
  };

  return (
    <View style={[styles.container, isCompleted && styles.completed]}>
      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.description}>{task.description}</Text>
        ) : null}
        <Text style={styles.meta}>
          {isCompleted ? '✅ Completed' : '🕐 Pending'} ·{' '}
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, isCompleted ? styles.undoBtn : styles.completeBtn]}
          onPress={() => onToggleComplete(task)}
          accessibilityLabel={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          <Text style={styles.actionBtnText}>{isCompleted ? 'Undo' : 'Done'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDelete}
          accessibilityLabel="Delete task"
        >
          <Text style={styles.actionBtnText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  completed: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeBtn: {
    backgroundColor: '#27ae60',
  },
  undoBtn: {
    backgroundColor: '#f39c12',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default TaskItem;
