import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Button, TextInput, Alert } from "react-native";
import AuthGuard from "../../components/AuthGuard";
import { authUtils } from "../../utils/auth";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(!authUtils.isAuthenticated());

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan password harus diisi!");
      return;
    }
    
    // Simulasi login berhasil
    authUtils.setToken('user-token', username, `${username}@example.com`);
    setIsLoginForm(false);
    Alert.alert("Success", `Login berhasil sebagai ${username}`);
  };

  const handleLogout = () => {
    authUtils.clearToken();
    setIsLoginForm(true);
    setUsername("");
    setPassword("");
  };

  const user = authUtils.getCurrentUser();

  return (
    <AuthGuard fallback={
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Login Required</Text>
        
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button title="Login" onPress={handleLogin} />
        <Text style={styles.note}>Note: Gunakan username dan password apapun</Text>
      </View>
    }>
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSqseAXAdIqz4ozmLCY7mGBB6q9Nkdv68UA&s",
          }}
          style={styles.image}
        />

        <Text style={styles.title}>{user?.username || 'Lil Bahlil el Goblin'}</Text>
        <Text style={styles.quote}>+6767676767676767</Text>
        <Text>{user?.email || 'energyhijau@gmail.com'}</Text>
        <Text style={styles.quote}>"Ingfokan lahan kosong, kebelet nambang niwh wok"</Text>
        
        <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    marginBottom: 10,
  },
  quote: {
    fontStyle: "italic",
    color: "green",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});