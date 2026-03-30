import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

/**
 * Reusable form input component with label and error display.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {Function} props.onChangeText
 * @param {string} [props.placeholder]
 * @param {boolean} [props.secureTextEntry]
 * @param {string} [props.error]
 * @param {boolean} [props.multiline]
 * @param {string} [props.autoCapitalize]
 * @param {string} [props.keyboardType]
 */
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  multiline = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
}) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputField;
