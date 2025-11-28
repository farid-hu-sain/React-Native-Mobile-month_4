// src/components/navigation/DrawerNavigator.tsx - FIXED VERSION
import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text } from "react-native";
import BottomTabsNavigator from "./BottomTabsNavigator";
import Settings from "../../screens/main/Settings";
import Logout from "../../screens/main/Logout";
import CustomDrawerContent from "../CustomDrawerContent";
import { DrawerLockContext } from "../../utils/drawerLock";
import { DrawerParamList } from "../../types/navigation";

const Drawer = createDrawerNavigator<DrawerParamList>();

// Fallback component untuk error handling
const ErrorFallback = ({ message }: { message: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>
      {message}
    </Text>
  </View>
);

export default function DrawerNavigator({ route }: any) {
  const [locked, setLocked] = useState(false);
  const userID = route.params?.userID;

  // Error boundary untuk handle drawer errors
  try {
    return (
      <DrawerLockContext.Provider value={{ locked, setLocked }}>
        <Drawer.Navigator
          screenOptions={{ 
            headerShown: true,
            swipeEnabled: !locked,
            drawerPosition: 'left',
            drawerStyle: {
              width: 280,
            },
          }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen 
            name="MainTabs" 
            component={BottomTabsNavigator}
            options={{ 
              title: "🏠 Home", 
              headerShown: false,
              swipeEnabled: !locked,
            }}
            initialParams={{ userID }}
          />
          <Drawer.Screen 
            name="Settings" 
            component={Settings}
            options={{ 
              title: "⚙️ Settings",
              swipeEnabled: !locked,
            }}
          />
          <Drawer.Screen 
            name="Logout" 
            component={Logout}
            options={{ 
              title: "🚪 Logout",
              swipeEnabled: !locked,
            }}
          />
        </Drawer.Navigator>
      </DrawerLockContext.Provider>
    );
  } catch (error) {
    console.error('❌ DrawerNavigator Error:', error);
    return <ErrorFallback message="Navigation Error - Please restart the app" />;
  }
}