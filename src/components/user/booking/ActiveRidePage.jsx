import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../Icon';
import ActiveRideCard from './ActiveRideCard';
import MapView from '../map/MapView';

export default function ActiveRidePage({
  user,
  activeRide,
  onCancelRequest,
  onOpenChat,
  onOpenSafety,
  onOpenFare,
  onBack,
}) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Material Back Button */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow_back" size={20} color="#0f172a" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Live Ride Tracking</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <MapView
          pickupCoords={
            activeRide?.pickupLocation?.coordinates
              ? {
                  latitude: activeRide.pickupLocation.coordinates[1],
                  longitude: activeRide.pickupLocation.coordinates[0],
                }
              : null
          }
          dropoffCoords={
            activeRide?.dropoffLocation?.coordinates
              ? {
                  latitude: activeRide.dropoffLocation.coordinates[1],
                  longitude: activeRide.dropoffLocation.coordinates[0],
                }
              : null
          }
          pickupAddress={activeRide?.pickupAddress}
          dropoffAddress={activeRide?.dropoffAddress}
          activeRide={activeRide}
        />
      </View>

      {/* Scrollable Bottom Sheet */}
      <View style={styles.bottomCardWrapper}>
        <ActiveRideCard
          activeRide={activeRide}
          onCancelRequest={onCancelRequest}
          onOpenChat={onOpenChat}
          onOpenSafety={onOpenSafety}
          onOpenFare={onOpenFare}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 38,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  bottomCardWrapper: {
    maxHeight: '56%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
});
