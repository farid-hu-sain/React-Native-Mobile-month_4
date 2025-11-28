import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Profile from "../../screens/main/Profile";
import { BottomTabsParamList } from "../../types/navigation";
import MainStackNavigator from "./MainStackNavigator";
import TopTabsNavigator from "./TopTabsNavigator";
import UserStats from "../../screens/stats/UserStats";
import Icon from '@react-native-vector-icons/fontawesome6';

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
        }
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={MainStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ size, color }) => (
            <Icon 
              iconStyle="solid"
              name="house" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProductCategory"
        component={TopTabsNavigator}
        options={{
          tabBarLabel: "Kategori",
          tabBarIcon: ({ size, color }) => (
            <Icon 
              iconStyle="solid"
              name="tags" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="UserStats"
        component={UserStats}
        options={{
          tabBarLabel: "Statistik",
          tabBarIcon: ({ size, color }) => (
            <Icon 
              iconStyle="solid"
              name="chart-simple" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ size, color }) => (
            <Icon 
              iconStyle="solid"
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