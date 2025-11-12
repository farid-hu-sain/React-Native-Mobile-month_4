import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

export default function Settings({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Kembali ke Home & Tutup Drawer"
          onPress={() => {
            navigation.navigate("Home");
            navigation.closeDrawer();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  buttonContainer: { marginTop: 20 },
});