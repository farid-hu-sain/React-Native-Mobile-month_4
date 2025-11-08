
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/components(day9)/navigation/StackNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

