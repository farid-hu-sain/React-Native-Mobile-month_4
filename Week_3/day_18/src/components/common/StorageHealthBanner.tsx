// src/components/common/StorageHealthBanner.tsx - NEW FILE
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StorageHealthBannerProps {
  status: 'healthy' | 'corrupted' | 'unknown';
  onRepair: () => void;
  lastCheck: string | null;
  corruptionCount?: number;
  showDetails?: boolean;
}

export default function StorageHealthBanner({ 
  status, 
  onRepair, 
  lastCheck,
  corruptionCount = 0,
  showDetails = false
}: StorageHealthBannerProps) {
  if (status === 'healthy') {
    return null;
  }

  const getBannerConfig = () => {
    switch (status) {
      case 'corrupted':
        return {
          icon: 'exclamation-triangle',
          color: '#FF6B6B',
          backgroundColor: '#FFF5F5',
          borderColor: '#FF6B6B',
          title: 'Data Corruption Detected',
          message: 'Some app data may be corrupted and require repair.',
          actionText: 'Repair Now',
          showAction: true
        };
      case 'unknown':
        return {
          icon: 'question-circle',
          color: '#FFA500',
          backgroundColor: '#FFFBF0',
          borderColor: '#FFA500',
          title: 'Storage Status Unknown',
          message: 'Unable to verify data integrity.',
          actionText: 'Check Again',
          showAction: true
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const handleRepair = () => {
    if (status === 'corrupted') {
      Alert.alert(
        'Repair Storage Data',
        'This will attempt to repair corrupted data. Some data may be reset to default values. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Repair', onPress: onRepair }
        ]
      );
    } else {
      onRepair();
    }
  };

  const formatLastCheck = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={[styles.banner, { 
      backgroundColor: config.backgroundColor,
      borderLeftColor: config.borderColor 
    }]}>
      <Icon name={config.icon} size={20} color={config.color} />
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.color }]}>
          {config.title}
        </Text>
        <Text style={styles.message}>
          {config.message}
        </Text>
        
        {showDetails && (
          <View style={styles.details}>
            {corruptionCount > 0 && (
              <Text style={styles.detailText}>
                Corrupted items: {corruptionCount}
              </Text>
            )}
            <Text style={styles.timestamp}>
              Last check: {formatLastCheck(lastCheck)}
            </Text>
          </View>
        )}
      </View>
      
      {config.showAction && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: config.color }]}
          onPress={handleRepair}
        >
          <Text style={styles.buttonText}>{config.actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  details: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#888',
    marginBottom: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});