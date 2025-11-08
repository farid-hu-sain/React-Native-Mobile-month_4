import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      {/* Gambar Profil */}
      <Image
        source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSqseAXAdIqz4ozmLCY7mGBB6q9Nkdv68UA&s" }} 
        style={styles.image}
      />

      <Text style={styles.title}>Lil Bahlil el Goblin</Text>
      <Text style={styles.quote}>+6767676767676767</Text>
      <Text>energyhijau@gmail.com</Text>
      <Text style={styles.quote}>"ingfokan lahan kosong, kebelet nambang niwh wok"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff" 
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60, 
    marginBottom: 15,
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  quote:{
    fontStyle: 'italic',
    color: 'green'
  }
});
