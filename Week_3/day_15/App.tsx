// import React, { useState } from 'react';
import SampleList from './src/components(day4)/ScrollView_RefreshControl';
import FlatListExample from './src/components(day4)/FlatList_ViewAbility';
import HeroSection from './src/components(day3)/HeroSection';
import ProfilCard from './src/components(day3)/CardProfile';
import LoginForm from './src/components(day3)/FromLogin';
import SectionListExample from './src/components(day4)/SectionList_StickyHeaders';
import InteractiveButtons from './src/components(day5)/Button_Pressable';
import FeedbackButtons from './src/components(day5)/TouchableOpacity_Highlight';
import AdvancedTouches from './src/components(day5)/LongPress_NativeFeedback';
import { FlexboxPlayground } from './src/components(day7)/Flexbox__Playground';
import RootNavigator from './src/routes/RootNavigator';





// export default function App() {
//   return(
//     <>
//     {/* <ProfilCard /> */}
//     {/* <LoginForm/> */}
//     {/* <HeroSection/> */}
//     {/* <SampleList/> */}
//     {/* <FlatListExample /> */}
//     {/* <SectionListExample /> */}
//     {/* < InteractiveButtons /> */}
//     {/* <FeedbackButtons /> */}
//     {/* < AdvancedTouches /> */}
//     {/* < FlexboxPlayground /> */}
//     {/* <RootNavigator /> */}
//     </>
//   ) 

// }

// export default App;
// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import MainStackNavigator from './src/components(day11)/src/components/navigation/MainStackNavigator';
// // import StackNavigator from "./src/components(day9)/navigation/StackNavigator";
// // import RootNavigator from "./src/routes/RootNavigator";

// export default function App() {
//   return (
//     <NavigationContainer>
//       <MainStackNavigator />
//     </NavigationContainer>
//   );
// }

// App.tsx (UPDATE)
// App.tsx (UPDATE - tambahkan loading state yang better)
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import ErrorBoundary from './src/components(day12)/src/components/common/ErrorBoundary';
import { NetworkProvider } from './src/components(day12)/src/context/NetworkContext';
import { AuthProvider } from './src/components(day12)/src/context/AuthContext';
import { UserStatsProvider } from './src/components(day12)/src/context/UserStatsContext';
import { CartProvider } from './src/components(day12)/src/context/CartContext';
import GlobalNetworkBanner from './src/components(day12)/src/components/common/GlobalNetworkBanner';
import StackNavigator from './src/components(day12)/src/components/navigation/StackNavigator';

// Splash Screen Component
const SplashScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 10, color: '#666' }}>
      Memuat data aplikasi...
    </Text>
  </View>
);

export default function App() {
  const [appKey, setAppKey] = useState(0);
  const [isAppReady, setIsAppReady] = useState(false);

  const handleAppReset = () => {
    setAppKey(prevKey => prevKey + 1);
    console.log('🔄 App reset triggered from Error Boundary');
  };

  // Simulate app loading (bisa diganti dengan real initialization)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary key={appKey} onReset={handleAppReset}>
      <NetworkProvider>
        <AuthProvider>
          <UserStatsProvider>
            <CartProvider>
              <NavigationContainer>
                <GlobalNetworkBanner />
                <StackNavigator />
              </NavigationContainer>
            </CartProvider>
          </UserStatsProvider>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}