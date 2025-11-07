// App.tsx
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* StatusBar adaptif terhadap mode gelap */}
      <StatusBar barStyle="default" />
      <HomeScreen />
    </SafeAreaView>
  );
};

export default App;
