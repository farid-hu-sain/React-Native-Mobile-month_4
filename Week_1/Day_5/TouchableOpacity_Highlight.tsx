import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

const FeedbackButtons = () => {
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  const handlePress = (type: string) => {
    if (disabled) return;
    setLastPressed(type);
    Alert.alert(`${type} ditekan!`);
  };

  const toggleDisable = () => setDisabled(prev => !prev);

  return (
    <View style={styles.container}>
      {/* TouchableOpacity */}
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        activeOpacity={0.6}
        onPress={() => handlePress('TouchableOpacity')}
        disabled={disabled}
      >
        <Text style={styles.text}>TouchableOpacity</Text>
      </TouchableOpacity>

      {/* TouchableHighlight */}
      <TouchableHighlight
        style={[styles.button, disabled && styles.disabled]}
        underlayColor="#005BBB"
        onPress={() => handlePress('TouchableHighlight')}
        disabled={disabled}
        onShowUnderlay={() => console.log('Underlay aktif')}
      >
        <Text style={styles.text}>TouchableHighlight</Text>
      </TouchableHighlight>

      {/* Pressable dengan efek skala */}
      <Pressable
        onPress={() => handlePress('Pressable')}
        style={({ pressed }) => [
          styles.button,
          pressed && { transform: [{ scale: 0.96 }], backgroundColor: '#005BBB' },
          disabled && styles.disabled,
        ]}
        disabled={disabled}
      >
        <Text style={styles.text}>Pressable</Text>
      </Pressable>

      {/* Status Tekan */}
      <Text style={styles.infoText}>
        {lastPressed ? `Terakhir ditekan: ${lastPressed}` : 'Belum ada interaksi'}
      </Text>

      {/* Tombol Toggle Disable */}
      <TouchableOpacity
        style={[styles.toggleBtn, { backgroundColor: disabled ? '#777' : '#28A745' }]}
        onPress={toggleDisable}
      >
        <Text style={styles.text}>{disabled ? 'Aktifkan Tombol' : 'Nonaktifkan Tombol'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 14 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#B0B0B0',
  },
  text: { color: 'white', fontSize: 16, fontWeight: '500' },
  infoText: { marginTop: 16, fontSize: 15, color: '#333' },
  toggleBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default FeedbackButtons;
