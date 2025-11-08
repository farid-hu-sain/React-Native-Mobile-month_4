import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Button, StyleSheet, Text, View } from "react-native";

type Onboarding2NavProp = StackNavigationProp<RootStackParamList, "Onboarding2">;

type Props = {
  navigation: Onboarding2NavProp;
};

export default function Onboarding2({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Use This App</Text>
      <Text style={styles.text}>
        1. Browse product catalog{"\n"}
        2. Add items you like{"\n"}
        3. Enjoy your shopping!
      </Text>
      <Button title="Start Shopping" onPress={() => navigation.replace("MainTabs")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  text: { textAlign: "center", marginBottom: 20 },
});
