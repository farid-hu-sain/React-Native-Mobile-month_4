// src/components/common/ErrorBoundary.tsx - FIXED
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // FIX: Safe error logging
    console.log('🚨 Error Boundary Caught an Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // FIX: Safe component stack logging
    if (errorInfo && errorInfo.componentStack) {
      console.log('📋 Component Stack:', errorInfo.componentStack);
    } else {
      console.log('📋 No component stack available');
    }

    // Update state dengan error details
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });

    // Anda juga bisa mengirim error ke service monitoring di sini
    // Contoh: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    // Reset state error
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Panggil callback reset dari parent jika ada
    if (this.props.onReset) {
      this.props.onReset();
    }

    console.log('🔄 Application reset by Error Boundary');
  };

  handleReload = () => {
    // Simple reload mechanism
    this.handleReset();
    
    Alert.alert(
      'Aplikasi Direset',
      'Aplikasi akan dimulai ulang. State akan direset ke kondisi awal.',
      [{ text: 'OK' }]
    );
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI ketika error terjadi
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😵</Text>
            <Text style={styles.title}>Aplikasi mengalami masalah tak terduga.</Text>
            
            <Text style={styles.message}>
              Maaf, terjadi kesalahan yang tidak terduga. Silakan mulai ulang aplikasi.
            </Text>

            {/* Error Details (bisa dihide di production) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Detail Error (Development):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text style={styles.stackText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.resetButton}
              onPress={this.handleReload}
            >
              <Text style={styles.resetButtonText}>Mulai Ulang Aplikasi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => {
                Alert.alert(
                  'Lapor Error',
                  'Terima kasih atas laporannya. Tim developer akan meninjau error ini.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.reportButtonText}>Lapor Masalah</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Render children normally jika tidak ada error
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2D3436',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#636E72',
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#C53030',
  },
  errorText: {
    fontSize: 12,
    color: '#742A2A',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  stackText: {
    fontSize: 10,
    color: '#974B4B',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorBoundary;