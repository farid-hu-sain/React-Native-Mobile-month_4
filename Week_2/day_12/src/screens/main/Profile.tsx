import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Button, 
  TextInput, 
  Alert, 
  TouchableOpacity,
  ScrollView,
  Modal 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AuthGuard from "../../components/AuthGuard";
import { authUtils } from "../../utils/auth";
import { useUserStats } from "../../context/UserStatsContext";
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Profile({ route, userID }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(!authUtils.isAuthenticated());
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [phone, setPhone] = useState("+6767676767676767");
  const [bio, setBio] = useState("Ingfokan lahan kosong, kebelet nambang niwh wok");
  const { addVisitedScreen } = useUserStats();
  
  const displayUserID = userID || route.params?.userID;

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Profile");
      return () => {};
    }, [addVisitedScreen])
  );

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan password harus diisi!");
      return;
    }
    
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

  const handleSaveProfile = () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Nomor telepon harus diisi!");
      return;
    }

    Alert.alert("Berhasil", "Profile berhasil diperbarui!");
    setIsEditModalVisible(false);
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
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSqseAXAdIqz4ozmLCY7mGBB6q9Nkdv68UA&s",
            }}
            style={styles.image}
          />

          <Text style={styles.title}>{user?.username || 'Lil Bahlil el Goblin'}</Text>
          <Text style={styles.userID}>User ID: {displayUserID || 'U123'}</Text>
          <Text style={styles.phone}>{phone}</Text>
          <Text>{user?.email || 'energyhijau@gmail.com'}</Text>
          <Text style={styles.bio}>"{bio}"</Text>
          
          {/* Edit Profile Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.modalInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
            />
            
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Masukkan bio Anda"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 30,
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
    textAlign: 'center',
  },
  userID: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 8,
    fontWeight: "bold",
  },
  phone: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  bio: {
    fontStyle: "italic",
    color: "green",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});