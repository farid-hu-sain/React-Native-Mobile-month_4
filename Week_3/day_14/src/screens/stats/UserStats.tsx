import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, Button, TouchableOpacity } from "react-native";
import { useUserStats } from "../../context/UserStatsContext";
import AuthGuard from "../../components/AuthGuard";
import { useNavigation } from "@react-navigation/native";
import NetworkStatus from "../../components/common/NetworkStatus";

export default function UserStats() {
  const { getStats, clearStats } = useUserStats();
  const navigation = useNavigation<any>();
  const stats = getStats();

  const handleLoginRedirect = () => {
    Alert.alert(
      "Login Diperlukan",
      "Silakan login untuk melihat statistik aktivitas Anda",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Login", 
          onPress: () => navigation.navigate('Profile')
        }
      ]
    );
  };

  const handleClearStats = () => {
    Alert.alert(
      "Hapus Riwayat",
      "Apakah Anda yakin ingin menghapus semua riwayat aktivitas?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => {
            clearStats();
            Alert.alert("Berhasil", "Riwayat aktivitas telah dihapus");
          }
        }
      ]
    );
  };

  // Group activities by date (simulasi)
  const getActivityHistory = () => {
    return stats.screens.map((screen, index) => ({
      id: index,
      screen,
      timestamp: new Date(),
      type: 'visit'
    })).reverse(); // Show latest first
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getScreenIcon = (screenName: string) => {
    const icons: { [key: string]: string } = {
      'Home': '🏠',
      'Popular Tab': '🔥',
      'New Tab': '🆕',
      'Discount Tab': '💸',
      'Electronics Tab': '📱',
      'Clothing Tab': '👕',
      'Food Tab': '🍔',
      'Automotive Tab': '🚗',
      'Entertainment Tab': '🎮',
      'Baby Tab': '👶',
      'Profile': '👤',
      'Product Detail': '📦',
      'Cart': '🛒',
      'Settings': '⚙️',
      'AddressForm': '📫',
      'Payment': '💳'
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (screenName.includes(key)) {
        return icon;
      }
    }
    return '📄';
  };

  const activities = getActivityHistory();

  // Count visits per screen type
  const getScreenStats = () => {
    const screenCount: { [key: string]: number } = {};
    
    stats.screens.forEach(screen => {
      const screenType = screen.split(' - ')[0]; // Ambil bagian sebelum timestamp
      screenCount[screenType] = (screenCount[screenType] || 0) + 1;
    });

    return screenCount;
  };

  const screenStats = getScreenStats();

  return (
    <AuthGuard 
      fallback={
        <View style={styles.loginRequired}>
          <Text style={styles.loginTitle}>📊 Statistik Pengguna</Text>
          <Text style={styles.loginMessage}>
            Login diperlukan untuk melihat riwayat aktivitas Anda
          </Text>
          <View style={styles.loginButton}>
            <Button 
              title="Login Sekarang" 
              onPress={handleLoginRedirect}
              color="#007AFF"
            />
          </View>
        </View>
      }
    >
      <NetworkStatus />
      <View style={styles.container}>
        <Text style={styles.title}>📊 Riwayat Aktivitas Anda</Text>
        
        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalScreens}</Text>
            <Text style={styles.statLabel}>Total Kunjungan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Object.keys(screenStats).length}
            </Text>
            <Text style={styles.statLabel}>Halaman Berbeda</Text>
          </View>
        </View>

        {/* Screen Type Statistics */}
        <View style={styles.screenStats}>
          <Text style={styles.subtitle}>Statistik per Halaman:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            <View style={styles.statsRow}>
              {Object.entries(screenStats).map(([screen, count], index) => (
                <View key={index} style={styles.screenStatItem}>
                  <Text style={styles.screenStatIcon}>{getScreenIcon(screen)}</Text>
                  <Text style={styles.screenStatCount}>{count}</Text>
                  <Text style={styles.screenStatName} numberOfLines={1}>
                    {screen.replace(' Tab', '')}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Riwayat Terbaru:</Text>
          {activities.length > 0 && (
            <TouchableOpacity onPress={handleClearStats} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Hapus</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {activities.length === 0 ? (
          <View style={styles.emptyStats}>
            <Text style={styles.emptyText}>Belum ada aktivitas yang tercatat</Text>
            <Text style={styles.emptySubtext}>
              Kunjungi berbagai halaman untuk mulai mencatat aktivitas
            </Text>
            <View style={styles.suggestedActions}>
              <Text style={styles.suggestedTitle}>Halaman yang bisa dikunjungi:</Text>
              <Text style={styles.suggestedItem}>• Home - Jelajahi semua produk</Text>
              <Text style={styles.suggestedItem}>• Kategori - Filter berdasarkan kategori</Text>
              <Text style={styles.suggestedItem}>• Profile - Kelola akun Anda</Text>
              <Text style={styles.suggestedItem}>• Settings - Pengaturan aplikasi</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>
                  {getScreenIcon(item.screen)}
                </Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    {item.screen.split(' - ')[0]}
                  </Text>
                  <Text style={styles.activityTime}>
                    {item.screen.split(' - ')[1] || formatTime(item.timestamp)}
                  </Text>
                </View>
                <View style={styles.activityType}>
                  <Text style={styles.activityTypeText}>Kunjungan</Text>
                </View>
              </View>
            )}
            style={styles.activityList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Halaman yang Tercatat:</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoItem}>🏠 Home</Text>
            <Text style={styles.infoItem}>🔥 Popular</Text>
            <Text style={styles.infoItem}>🆕 New</Text>
            <Text style={styles.infoItem}>💸 Discount</Text>
            <Text style={styles.infoItem}>📱 Electronics</Text>
            <Text style={styles.infoItem}>👕 Clothing</Text>
            <Text style={styles.infoItem}>🍔 Food</Text>
            <Text style={styles.infoItem}>🚗 Automotive</Text>
            <Text style={styles.infoItem}>🎮 Entertainment</Text>
            <Text style={styles.infoItem}>👶 Baby</Text>
            <Text style={styles.infoItem}>👤 Profile</Text>
            <Text style={styles.infoItem}>📦 Product Detail</Text>
            <Text style={styles.infoItem}>🛒 Cart</Text>
            <Text style={styles.infoItem}>⚙️ Settings</Text>
          </View>
        </View>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loginRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
    lineHeight: 22,
  },
  loginButton: {
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  screenStats: {
    marginBottom: 20,
  },
  statsScroll: {
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  screenStatItem: {
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 70,
  },
  screenStatIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  screenStatCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  screenStatName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityList: {
    flex: 1,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityType: {
    backgroundColor: '#e7f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTypeText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyStats: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  suggestedActions: {
    width: '100%',
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  suggestedItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 10,
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    fontSize: 12,
    marginBottom: 4,
    color: '#333',
    width: '48%',
  },
});