import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Button, StyleSheet, Text, View } from "react-native";

type Onboarding1NavProp = StackNavigationProp<RootStackParamList, "Onboarding1">;

type Props = {
  navigation: Onboarding1NavProp;
};

export default function Onboarding1({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My Store</Text>
      <Text style={styles.text}>Find your best products easily.</Text>
      <Button title="Next" onPress={() => navigation.navigate("Onboarding2")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  text: { textAlign: "center", marginBottom: 20 },
});
