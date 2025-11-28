import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Onboarding1 from "../../screens/onboarding/Onboarding1";
import Onboarding2 from "../../screens/onboarding/Onboarding2";
import DrawerNavigator from "./DrawerNavigator";
import { RootStackParamList } from "../../types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}