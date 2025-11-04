import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Pressable,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';

const AdvancedTouches = () => {
  const [lastPressed, setLastPressed] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  const handlePress = (type: string) => {
    setLastPressed(type);
    Alert.alert(`${type} ditekan!`);
  };

  const handleLongPress = () => {
    setLastPressed('Long Press');
    Alert.alert('Long Press!');
  };

  const rippleColors = ['#2196F3', '#E91E63', '#4CAF50', '#FF9800'];
  const randomRipple = rippleColors[Math.floor(Math.random() * rippleColors.length)];

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => handlePress('TouchableWithoutFeedback')}
        onLongPress={handleLongPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        delayLongPress={1000}
      >
        <View
          style={[
            styles.noFeedback,
            { backgroundColor: pressed ? '#555' : '#888' },
          ]}
        >
          <Text style={styles.text}>Manual Visual Feedback</Text>
        </View>
      </TouchableWithoutFeedback>
      {Platform.OS === 'android' ? (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple(randomRipple, false)}
          onPress={() => handlePress('TouchableNativeFeedback')}
          useForeground={TouchableNativeFeedback.canUseNativeForeground()}
        >
          <View style={styles.nativeBtn}>
            <Text style={[styles.text, { color: '#000' }]}>Android Native Ripple</Text>
          </View>
        </TouchableNativeFeedback>
      ) : (
        <Pressable
          onPress={() => handlePress('Pressable (iOS Fallback)')}
          style={({ pressed }) => [
            styles.nativeBtn,
            { backgroundColor: pressed ? '#DDD' : '#FFF' },
          ]}
        >
          <Text style={[styles.text, { color: '#000' }]}>iOS Pressable Fallback</Text>
        </Pressable>
      )}

      <Text style={styles.status}>
        {lastPressed ? `Terakhir ditekan: ${lastPressed}` : 'Belum ada interaksi'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 },
  noFeedback: {
    backgroundColor: '#888',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  nativeBtn: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    overflow: 'hidden', 
  },
  text: { fontSize: 16, fontWeight: '500', color: 'white' },
  status: { marginTop: 20, color: '#333', fontSize: 15 },
});

export default AdvancedTouches;
