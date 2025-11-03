import React, { useState } from 'react';
import { View, Text, ImageBackground, Switch, StatusBar, StyleSheet } from 'react-native';

const HeroSection = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80' }}
        style={styles.background}
        imageStyle={{ opacity: 0.5 }}
        resizeMode="cover"
      >
        <View
          style={[
            styles.overlay,
            { backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.3)' },
          ]}
        >
          <Text style={[styles.title, { color: darkMode ? 'white' : 'black' }]}>
            Selamat Datang!
          </Text>
          <View style={styles.switchContainer}>
            <Text style={{ color: darkMode ? 'white' : 'black' }}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, marginBottom: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
});

export default HeroSection;
