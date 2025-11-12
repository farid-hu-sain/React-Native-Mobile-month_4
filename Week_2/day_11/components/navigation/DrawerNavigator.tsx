import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabsNavigator from "./BottomTabsNavigator";
import Settings from "../../screens/main/Settings";
import Logout from "../../screens/main/Logout";
import CustomDrawerContent from "../CustomDrawerContent";
import { DrawerLockContext } from "../../utils/drawerLock";
import { DrawerParamList } from "../../types/navigation";

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  const [locked, setLocked] = useState(false); // Default unlocked

  return (
    <DrawerLockContext.Provider value={{ locked, setLocked }}>
      <Drawer.Navigator
        screenOptions={{ 
          headerShown: true,
          swipeEnabled: true, // Always enabled
          swipeEdgeWidth: 1000, // Full screen swipe area
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen 
          name="MainTabs" 
          component={BottomTabsNavigator}
          options={{ title: "🏠 Home", headerShown: false}}
        />
        <Drawer.Screen 
          name="Settings" 
          component={Settings}
          options={{ title: "⚙️ Settings" }}
        />
        <Drawer.Screen 
          name="Logout" 
          component={Logout}
          options={{ title: "🚪 Logout" }}
        />
      </Drawer.Navigator>
    </DrawerLockContext.Provider>
  );
}