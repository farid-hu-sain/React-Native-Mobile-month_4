// src/components/navigation/DrawerNavigator.tsx
import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabsNavigator from "./BottomTabsNavigator";
import Settings from "../../screens/main/Settings";
import Logout from "../../screens/main/Logout";
import CustomDrawerContent from "../CustomDrawerContent";
import { DrawerLockContext } from "../../utils/drawerLock";
import { DrawerParamList } from "../../types/navigation";

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator({ route }: any) {
  const [locked, setLocked] = useState(false);
  const userID = route.params?.userID;

  return (
    <DrawerLockContext.Provider value={{ locked, setLocked }}>
      <Drawer.Navigator
        screenOptions={{ 
          headerShown: true,
          swipeEnabled: !locked,
          swipeEdgeWidth: locked ? 0 : 1000,
          drawerPosition: 'left',
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen 
          name="MainTabs" 
          component={BottomTabsNavigator}
          options={{ 
            title: "🏠 Home", 
            headerShown: false,
            drawerType: 'front',
            swipeEnabled: !locked,
          }}
          initialParams={{ userID }}
        />
        <Drawer.Screen 
          name="Settings" 
          component={Settings}
          options={{ 
            title: "⚙️ Settings",
            drawerType: 'front',
            swipeEnabled: !locked,
          }}
        />
        <Drawer.Screen 
          name="Logout" 
          component={Logout}
          options={{ 
            title: "🚪 Logout",
            drawerType: 'front',
            swipeEnabled: !locked,
          }}
        />
      </Drawer.Navigator>
    </DrawerLockContext.Provider>
  );
}