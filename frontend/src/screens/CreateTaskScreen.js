import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import { createTask } from '../services/api';

function CreateTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 200) errs.title = 'Title must be 200 characters or fewer';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await createTask({ title: title.trim(), description: description.trim() });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>New Task</Text>

        <InputField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          autoCapitalize="sentences"
          error={errors.title}
        />
        <InputField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add any details…"
          multiline
          autoCapitalize="sentences"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Creating…' : 'Create Task'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f0f4f8' },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    color: '#888',
    fontSize: 15,
  },
});

export default CreateTaskScreen;
