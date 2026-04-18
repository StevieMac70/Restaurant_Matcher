import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={64} color="#FF6B35" />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          Restaurant Matcher hit an unexpected error. Please try again.
        </Text>
        {__DEV__ && this.state.error && (
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
          </ScrollView>
        )}
        <TouchableOpacity style={styles.btn} onPress={this.handleReset}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    maxHeight: 160,
    width: '100%',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    fontSize: 12,
    color: '#c0392b',
    fontFamily: 'monospace',
  },
  btn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
