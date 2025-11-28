// src/screens/main/Profile.tsx - FIXED FULL VERSION
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  Alert, 
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AuthGuard from "../../components/AuthGuard";
import { useAuth } from "../../context/AuthContext";
import { useUserStats } from "../../context/UserStatsContext";
import Icon from 'react-native-vector-icons/FontAwesome';
import NetworkStatus from "../../components/common/NetworkStatus";
import { imagePickerUtils } from "../../utils/imagePicker";
import { uploadService } from "../../services/uploadService";
import { biometricService } from "../../services/biometricService";

export default function Profile({ userID }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [phone, setPhone] = useState("+6767676767676767");
  const [bio, setBio] = useState("Ingfokan lahan kosong, kebelet nambang niwh wok");
  const [profileImage, setProfileImage] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSqseAXAdIqz4ozmLCY7mGBB6q9Nkdv68UA&s");
  const [uploadingKTP, setUploadingKTP] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { addVisitedScreen } = useUserStats();
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    demoLogin, 
    // TAMBAH: Biometric features
    quickLogin,
    isBiometricAvailable,
    biometricType,
    saveTokenForBiometric 
  } = useAuth();
  
  // TAMBAH: State untuk biometric
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [checkingBiometric, setCheckingBiometric] = useState(false);

  const displayUserID = userID || 'U123';

  // Load offline profile preview saat component mount
  useEffect(() => {
    loadOfflineProfilePreview();
    checkBiometricStatus();
  }, []);

  // TAMBAH: Check biometric status
  const checkBiometricStatus = async () => {
    setCheckingBiometric(true);
    try {
      // Check if token exists in Keychain (user has enabled biometric)
      const credentials = await biometricService.getTokenFromKeychain();
      setIsBiometricEnabled(!!credentials);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    } finally {
      setCheckingBiometric(false);
    }
  };

  const loadOfflineProfilePreview = async () => {
    try {
      const base64Preview = await imagePickerUtils.getStoredProfilePreview();
      if (base64Preview) {
        setProfileImage(`data:image/jpeg;base64,${base64Preview}`);
        console.log('📱 Loaded offline profile preview');
      }
    } catch (error) {
      console.error('Error loading offline profile preview:', error);
    }
  };

  // Track screen visit
  useFocusEffect(
    React.useCallback(() => {
      addVisitedScreen("Profile");
      return () => {};
    }, [addVisitedScreen])
  );

  // FIXED: Handle manual login dengan biometric setup
  const handleLoginWithBiometricSetup = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Username dan password harus diisi!");
      return;
    }
    
    try {
      const userData = await login(username, password);
      
      // Tanya user apakah ingin enable biometric
      Alert.alert(
        "Enable Login Cepat?",
        "Apakah Anda ingin mengaktifkan login cepat dengan biometrik untuk login selanjutnya?",
        [
          { 
            text: "Nanti Saja", 
            style: "cancel",
            onPress: () => {
              setUsername("");
              setPassword("");
              Alert.alert("Success", `Login berhasil sebagai ${username}`);
            }
          },
          { 
            text: "Aktifkan", 
            onPress: async () => {
              try {
                const saved = await saveTokenForBiometric(userData.token);
                if (saved) {
                  setIsBiometricEnabled(true);
                  Alert.alert("Success", "Login cepat dengan biometrik telah diaktifkan!");
                }
              } catch (error) {
                Alert.alert("Info", "Login berhasil, tetapi fitur biometrik gagal diaktifkan");
              }
              setUsername("");
              setPassword("");
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message || "Terjadi kesalahan saat login");
    }
  };

  // FIXED: Handle quick login dengan biometrik dengan better error handling
  const handleQuickLogin = async () => {
    try {
      // Simple check dulu
      const { available } = await biometricService.safeBiometricCheck();
      
      if (!available) {
        Alert.alert(
          "Biometric Tidak Tersedia",
          "Perangkat Anda tidak mendukung biometric atau belum diatur.",
          [{ text: "OK" }]
        );
        return;
      }

      await quickLogin();
    } catch (error: any) {
      console.error('Quick login failed:', error);
      Alert.alert(
        "Login Gagal",
        "Tidak dapat melakukan login biometric. Silakan gunakan login manual."
      );
    }
  };

  // TAMBAH: Disable biometric
  const handleDisableBiometric = async () => {
    try {
      await biometricService.clearKeychain();
      setIsBiometricEnabled(false);
      Alert.alert("Success", "Login cepat dengan biometrik telah dinonaktifkan");
    } catch (error) {
      Alert.alert("Error", "Gagal menonaktifkan fitur biometrik");
    }
  };

  const handleDemoLogin = async () => {
    try {
      await demoLogin();
      Alert.alert("Success", "Login demo berhasil!");
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message || "Terjadi kesalahan saat login");
    }
  };

  const handleLogout = () => {
    logout();
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

  const handleTakeKTPPhoto = async () => {
    try {
      setUploadingKTP(true);
      setUploadProgress(0);

      const result = await imagePickerUtils.takeKTPPhoto();
      
      if (result.success && result.assets && result.assets[0]) {
        const ktpPhoto = result.assets[0];
        
        // Upload KTP photo
        await uploadService.uploadKTPPhoto(ktpPhoto, (progress) => {
          setUploadProgress(progress);
        });

        Alert.alert(
          "Berhasil", 
          "Foto KTP berhasil diambil dan diupload!",
          [
            { 
              text: "OK", 
              onPress: () => {
                // Optional: Navigate to verification screen or show success message
              }
            }
          ]
        );
      } else if (result.error) {
        Alert.alert("Error", `Gagal mengambil foto KTP: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat mengambil foto KTP");
    } finally {
      setUploadingKTP(false);
      setUploadProgress(0);
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      setUploadingProfile(true);

      const result = await imagePickerUtils.selectProfilePicture();
      
      if (result.success && result.assets && result.assets[0]) {
        const profilePhoto = result.assets[0];
        
        // Set preview immediately from base64
        if (profilePhoto.base64) {
          setProfileImage(`data:image/jpeg;base64,${profilePhoto.base64}`);
        } else if (profilePhoto.uri) {
          setProfileImage(profilePhoto.uri);
        }

        // Upload profile picture
        const uploadedUrl = await uploadService.uploadProfilePicture(profilePhoto);
        
        Alert.alert("Berhasil", "Foto profil berhasil diubah!");
      } else if (result.error) {
        Alert.alert("Error", `Gagal mengubah foto profil: ${result.error}`);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat mengubah foto profil");
    } finally {
      setUploadingProfile(false);
    }
  };

  return (
    <AuthGuard fallback={
      <View style={styles.container}>
        <NetworkStatus />
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
        
        {/* TOMBOL LOGIN MANUAL DENGAN BIOMETRIC SETUP */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLoginWithBiometricSetup}
        >
          <Text style={styles.loginButtonText}>Login & Setup Biometrik</Text>
        </TouchableOpacity>

        {/* TOMBOL QUICK LOGIN JIKA BIOMETRIC AVAILABLE */}
        {isBiometricAvailable && isBiometricEnabled && (
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={handleQuickLogin}
            disabled={checkingBiometric}
          >
            {checkingBiometric ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon 
                  name={biometricType === 'FaceID' ? 'user' : 'fingerprint'} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.biometricButtonText}>
                  Login Cepat dengan {biometricType}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.demoButton} onPress={demoLogin}>
          <Text style={styles.demoButtonText}>Login Demo</Text>
        </TouchableOpacity>
        
        {/* INFO BIOMETRIC STATUS */}
        {isBiometricAvailable && (
          <View style={styles.biometricInfo}>
            <Text style={styles.biometricInfoText}>
              🔐 {biometricType} {isBiometricEnabled ? 'Aktif' : 'Tersedia'}
            </Text>
          </View>
        )}
        
        <Text style={styles.note}>Note: Gunakan username dan password apapun untuk login biasa</Text>
        <Text style={styles.note}>Atau gunakan Login Demo untuk akses cepat</Text>
      </View>
    }>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <NetworkStatus />
          
          {/* Profile Image dengan Change Button */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.image}
            />
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={handleChangeProfilePicture}
              disabled={uploadingProfile}
            >
              {uploadingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{user?.username || 'Lil Bahlil el Goblin'}</Text>
          <Text style={styles.userID}>User ID: {displayUserID}</Text>
          <Text style={styles.phone}>{phone}</Text>
          <Text style={styles.email}>{user?.email || 'energyhijau@gmail.com'}</Text>
          <Text style={styles.bio}>"{bio}"</Text>
          
          {/* BIOMETRIC SETTINGS SECTION */}
          {isBiometricAvailable && (
            <View style={styles.biometricSection}>
              <Text style={styles.sectionTitle}>Keamanan & Login</Text>
              
              {isBiometricEnabled ? (
                <TouchableOpacity 
                  style={[styles.biometricButton, styles.disableBiometricButton]}
                  onPress={handleDisableBiometric}
                >
                  <Icon name="fingerprint" size={16} color="#fff" />
                  <Text style={styles.biometricButtonText}>
                    Nonaktifkan Login Cepat ({biometricType})
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.biometricButton, styles.enableBiometricButton]}
                  onPress={() => {
                    Alert.alert(
                      "Enable Biometric Login",
                      "Anda perlu login manual terlebih dahulu untuk mengaktifkan fitur ini.",
                      [{ text: "Mengerti" }]
                    );
                  }}
                >
                  <Icon name="fingerprint" size={16} color="#fff" />
                  <Text style={styles.biometricButtonText}>
                    Aktifkan Login Cepat ({biometricType})
                  </Text>
                </TouchableOpacity>
              )}
              
              <Text style={styles.biometricDescription}>
                Login cepat dengan {biometricType} untuk akses yang lebih aman dan praktis
              </Text>
            </View>
          )}

          {/* KTP Verification Button */}
          <TouchableOpacity 
            style={styles.ktpButton}
            onPress={handleTakeKTPPhoto}
            disabled={uploadingKTP}
          >
            {uploadingKTP ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.ktpButtonText}>
                  Uploading... {uploadProgress}%
                </Text>
              </View>
            ) : (
              <>
                <Icon name="id-card" size={16} color="#fff" />
                <Text style={styles.ktpButtonText}>Verifikasi KTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Edit Profile Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="sign-out" size={16} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
    minHeight: '100%',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
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
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontStyle: "italic",
    color: "green",
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  ktpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    gap: 8,
    elevation: 2,
    minWidth: 160,
    justifyContent: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ktpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    gap: 8,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    lineHeight: 16,
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
  // TAMBAH STYLES UNTUK BIOMETRIC
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    gap: 8,
    elevation: 2,
    justifyContent: 'center',
    minWidth: 200,
  },
  enableBiometricButton: {
    backgroundColor: '#28a745',
  },
  disableBiometricButton: {
    backgroundColor: '#FF3B30',
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  biometricInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  biometricInfoText: {
    fontSize: 12,
    color: '#1565C0',
    textAlign: 'center',
  },
  biometricSection: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  biometricDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
  },
});