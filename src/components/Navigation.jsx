import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Icon from './Icon';

export default function Navigation({
  activeTab = 'home',
  setActiveTab,
  onNavigate,
  hideMobileNav = false,
}) {
  if (hideMobileNav) return null;

  const handleTabPress = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  const tabs = [
    { id: 'home', label: 'Rides', icon: 'home' },
    { id: 'explore', label: 'Services', icon: 'grid_view' },
    { id: 'activity', label: 'Activity', icon: 'schedule' },
    { id: 'profile', label: 'Account', icon: 'account_circle' },
  ];

  return (
    <View style={styles.navContainer} pointerEvents="box-none">
      <View style={styles.floatingDock}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => handleTabPress(tab.id)}
              style={styles.tabBtn}
              android_ripple={null}
            >
              <View style={styles.tabContentBox}>
                <View style={styles.iconHalo}>
                  <Icon
                    name={tab.icon}
                    size={24}
                    color={isActive ? '#000000' : '#475569'}
                    strokeWidth={isActive ? 1.0 : 0.6}
                  />
                </View>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeDot} />}
              </View>
            </Pressable>

          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 300,
    elevation: 30,
  },
  floatingDock: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 12,
    borderTopWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 46,
    backgroundColor: 'transparent',
  },
  tabContentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  iconHalo: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 13.5,
  },
  activeDot: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#000000',
    marginTop: 2,
  },
});


