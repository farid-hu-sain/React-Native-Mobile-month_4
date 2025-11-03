import { useState } from "react";
import { Alert, Button, Modal, StyleSheet, Switch, TextInput, Text, View } from "react-native";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRemember, setIsRemember] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = () => {
    if (email && password) {
      setModalVisible(true);
    } else {
      Alert.alert("Error", "Lengkapi form!!!");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={20}
      />

      <View style={styles.switchContainer}>
        <Text>Ingat saya</Text>
        <Switch
          value={isRemember}
          onValueChange={setIsRemember}
          trackColor={{ true: '#007AFF' }}
        />
      </View>

      <Button title="Login" onPress={handleLogin} />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Login berhasil</Text>
            <Button title="Tutup" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
});

export default LoginForm;
