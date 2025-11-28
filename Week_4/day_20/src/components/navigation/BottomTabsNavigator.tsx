// src/components/navigation/BottomTabsNavigator.tsx (UPDATED)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Profile from "../../screens/main/Profile";
import { BottomTabsParamList } from "../../types/navigation";
import MainStackNavigator from "./MainStackNavigator";
import TopTabsNavigator from "./TopTabsNavigator";
import UserStats from "../../screens/stats/UserStats";
import NearbyStores from "../../screens/main/NearbyStores"; // ✅ NEW
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AuthGuardTab from "../AuthGuardTab";

const Tab = createBottomTabNavigator<BottomTabsParamList>();

export default function BottomTabsNavigator({ route }: any) {
  const userID = route.params?.userID;

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={MainStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome6 
              name="house" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      
      {/* ✅ NEW: Nearby Stores Tab */}
      <Tab.Screen
        name="NearbyStores"
        options={{
          tabBarLabel: "Toko Dekat",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome6 
              name="location-dot" 
              size={size} 
              color={color}
            />
          ),
        }}
      >
        {() => (
          <AuthGuardTab>
            <NearbyStores />
          </AuthGuardTab>
        )}
      </Tab.Screen>
      
      <Tab.Screen
        name="ProductCategory"
        options={{
          tabBarLabel: "Kategori",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome6 
              name="tags" 
              size={size} 
              color={color}
            />
          ),
        }}
      >
        {() => (
          <AuthGuardTab>
            <TopTabsNavigator />
          </AuthGuardTab>
        )}
      </Tab.Screen>
      
      <Tab.Screen
        name="UserStats"
        options={{
          tabBarLabel: "Statistik",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome6 
              name="chart-simple" 
              size={size} 
              color={color}
            />
          ),
        }}
      >
        {() => (
          <AuthGuardTab>
            <UserStats />
          </AuthGuardTab>
        )}
      </Tab.Screen>
      
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome6 
              name="user" 
              size={size} 
              color={color}
            />
          ),
        }}
      >
        {() => <Profile userID={userID} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}