import React, { useState, useRef, useContext } from "react";
import { View, Text, StyleSheet, Switch, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { DrawerLockContext } from "../../utils/drawerLock";
import NetworkStatus from "../../components/common/NetworkStatus";

export default function Settings({ navigation }: any) {
  const { locked, setLocked } = useContext(DrawerLockContext);
  const [isDrawerEnabled, setIsDrawerEnabled] = useState(!locked);
  const previousDrawerState = useRef(!locked);

  useFocusEffect(
    React.useCallback(() => {
      // Simpan state sebelumnya
      previousDrawerState.current = isDrawerEnabled;
      
      // Pastikan drawer enabled ketika masuk settings (biarkan user bisa keluar)
      navigation.getParent()?.setOptions({
        swipeEnabled: true,
        drawerLockMode: 'unlocked'
      });

      return () => {
        // Kembalikan ke state sebelumnya ketika keluar
        const shouldEnable = previousDrawerState.current;
        navigation.getParent()?.setOptions({
          swipeEnabled: shouldEnable,
          drawerLockMode: shouldEnable ? 'unlocked' : 'locked-closed'
        });
      };
    }, [navigation, isDrawerEnabled])
  );

  const toggleDrawer = (value: boolean) => {
    setIsDrawerEnabled(value);
    setLocked(!value); // 🔥 Update context
    
    // Update navigation options immediately
    navigation.getParent()?.setOptions({
      swipeEnabled: value,
      drawerLockMode: value ? 'unlocked' : 'locked-closed'
    });
    
    Alert.alert(
      value ? "Drawer Diaktifkan" : "Drawer Dinonaktifkan",
      value 
        ? "Swipe gesture drawer telah diaktifkan. Anda dapat membuka drawer dengan swipe dari kiri." 
        : "Swipe gesture drawer telah dinonaktifkan. Drawer hanya dapat dibuka melalui tombol menu.",
      [{ text: "Mengerti" }]
    );
  };

  // Test function untuk memeriksa status drawer
  const checkDrawerStatus = () => {
    const parent = navigation.getParent();
    Alert.alert(
      "Status Drawer",
      `Swipe Enabled: ${parent?.getOptions()?.swipeEnabled}\nDrawer Lock Mode: ${parent?.getOptions()?.drawerLockMode}\nContext Locked: ${locked}`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <NetworkStatus />
      <Text style={styles.title}>⚙️ Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingText}>Aktifkan Drawer Gesture</Text>
          <Text style={styles.settingDescription}>
            {isDrawerEnabled 
              ? "Drawer dapat dibuka dengan swipe dari tepi kiri layar" 
              : "Drawer hanya dapat dibuka melalui tombol menu"
            }
          </Text>
        </View>
        <Switch
          value={isDrawerEnabled}
          onValueChange={toggleDrawer}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDrawerEnabled ? "#007AFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
        />
      </View>

      <View style={styles.statusIndicator}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isDrawerEnabled ? '#4CAF50' : '#FF5722' }
        ]} />
        <Text style={styles.statusText}>
          Status: {isDrawerEnabled ? 'AKTIF' : 'NONAKTIF'}
        </Text>
      </View>

      {/* Tombol test untuk memeriksa status */}
      <View style={styles.testButton}>
        <Text 
          style={styles.testButtonText}
          onPress={checkDrawerStatus}
        >
          🔍 Periksa Status Drawer
        </Text>
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Cara Testing:</Text>
        <Text style={styles.noteText}>
          1. Nonaktifkan drawer gesture dengan toggle di atas
        </Text>
        <Text style={styles.noteText}>
          2. Coba swipe dari kiri layar - seharusnya TIDAK BISA membuka drawer
        </Text>
        <Text style={styles.noteText}>
          3. Buka drawer hanya bisa melalui tombol menu ☰ di header
        </Text>
        <Text style={styles.noteText}>
          4. Aktifkan kembali untuk mengembalikan fungsi swipe
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Info Teknis:</Text>
        <Text style={styles.infoText}>
          • Drawer Lock Mode: {isDrawerEnabled ? 'unlocked' : 'locked-closed'}
        </Text>
        <Text style={styles.infoText}>
          • Swipe Enabled: {isDrawerEnabled ? 'true' : 'false'}
        </Text>
        <Text style={styles.infoText}>
          • Context Locked: {locked ? 'true' : 'false'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 30,
    textAlign: 'center',
    color: '#333'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  testButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 15,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});