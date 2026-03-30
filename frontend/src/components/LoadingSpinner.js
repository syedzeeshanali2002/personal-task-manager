import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

/**
 * Full-screen centered loading spinner.
 * @param {object} props
 * @param {string} [props.color]
 */
function LoadingSpinner({ color = '#3498db' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
});

export default LoadingSpinner;
