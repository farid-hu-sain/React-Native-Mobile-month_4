import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function Logout({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚪 Logout</Text>
      <Text>Kamu yakin ingin keluar?</Text>
      <Button title="Kembali ke Onboarding" onPress={() => navigation.replace("Onboarding1")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});