import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from '../../Icon';
import storage from '../../../utils/storage';
import { MEN_AVATARS, WOMEN_AVATARS, getAvatarById } from './avatarCatalog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DigitalAvatarScreen({
  user,
  onNavigate,
}) {
  // Category State: 'male' | 'female'
  const [selectedGender, setSelectedGender] = useState(() => {
    try {
      const saved = storage.getItem('@rapidride_user_avatar_gender');
      if (saved === 'female' || saved === 'male') return saved;
    } catch (e) { }
    return user?.gender === 'female' ? 'female' : 'male';
  });

  // Selected Avatar ID
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    try {
      const savedId = storage.getItem('@rapidride_user_avatar_id');
      if (savedId) return savedId;
    } catch (e) { }
    return user?.gender === 'female' ? 'female_1' : 'male_1';
  });

  useEffect(() => {
    try {
      const savedGender = storage.getItem('@rapidride_user_avatar_gender');
      if (savedGender === 'male' || savedGender === 'female') {
        setSelectedGender(savedGender);
      }
      const savedId = storage.getItem('@rapidride_user_avatar_id');
      if (savedId) {
        setSelectedAvatarId(savedId);
      }
    } catch (e) { }
  }, []);

  const currentAvatar = getAvatarById(selectedAvatarId, selectedGender);

  const handleSelectAvatar = async (avatarItem, gender) => {
    setSelectedAvatarId(avatarItem.id);
    setSelectedGender(gender);
    try {
      await storage.setItem('@rapidride_user_avatar_id', avatarItem.id);
      await storage.setItem('@rapidride_user_avatar_gender', gender);
    } catch (e) { }
  };

  const handleSwitchGender = (gender) => {
    setSelectedGender(gender);
    const defaultId = gender === 'female' ? 'female_1' : 'male_1';
    setSelectedAvatarId(defaultId);
    try {
      storage.setItem('@rapidride_user_avatar_gender', gender);
      storage.setItem('@rapidride_user_avatar_id', defaultId);
    } catch (e) { }
  };

  const activeAvatarList = selectedGender === 'male' ? MEN_AVATARS : WOMEN_AVATARS;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 1. TOP HEADER APP BAR */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => onNavigate && onNavigate('profile')}
          style={styles.headerBackBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Icon name="arrow_back" size={22} color="#0f172a" />
        </Pressable>

        <Text style={styles.topHeaderTitle}>Digital Avatar</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. HERO ACTIVE AVATAR IN LARGE CIRCULAR FORM */}
        <View style={styles.heroCircularStage}>
          <View style={styles.heroAvatarRingOuter}>
            <View style={styles.heroAvatarRingInner}>
              <Image
                source={currentAvatar.image}
                style={styles.heroCircularImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.activeCheckBadge}>
              <Icon name="check" size={14} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.currentAvatarName}>{currentAvatar.name}</Text>
          <View style={styles.currentAvatarStyleBadge}>
            <Text style={styles.currentAvatarStyleText}>{currentAvatar.style}</Text>
          </View>
        </View>

        {/* 3. GENDER SWITCHER TABS */}
        <View style={styles.genderSwitcherWrap}>
          <TouchableOpacity
            style={[
              styles.genderSwitcherBtn,
              selectedGender === 'male' && styles.genderSwitcherBtnActive,
            ]}
            onPress={() => handleSwitchGender('male')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.genderSwitcherText,
                selectedGender === 'male' && styles.genderSwitcherTextActive,
              ]}
            >
              👦 Boys & Men ({MEN_AVATARS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderSwitcherBtn,
              selectedGender === 'female' && styles.genderSwitcherBtnActive,
            ]}
            onPress={() => handleSwitchGender('female')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.genderSwitcherText,
                selectedGender === 'female' && styles.genderSwitcherTextActive,
              ]}
            >
              👧 Girls & Women ({WOMEN_AVATARS.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. CIRCULAR AVATARS SELECTION GRID */}
        <View style={styles.avatarSectionHeader}>
          <Text style={styles.avatarSectionTitle}>
            Choose Your Avatar ({selectedGender === 'male' ? 'Boys & Men Styles' : 'Girls & Women Styles'})
          </Text>
        </View>

        <View style={styles.circularAvatarGrid}>
          {activeAvatarList.map((av) => {
            const isSelected = selectedAvatarId === av.id;
            return (
              <TouchableOpacity
                key={av.id}
                style={styles.circularAvatarItem}
                onPress={() => handleSelectAvatar(av, selectedGender)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.circularAvatarRing,
                    isSelected && styles.circularAvatarRingActive,
                  ]}
                >
                  <Image
                    source={av.image}
                    style={styles.circularAvatarThumb}
                    resizeMode="cover"
                  />
                  {isSelected && (
                    <View style={styles.miniSelectedBadge}>
                      <Icon name="check" size={10} color="#ffffff" />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.circularAvatarItemName,
                    isSelected && styles.circularAvatarItemNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {av.name}
                </Text>
                <Text style={styles.circularAvatarItemTag} numberOfLines={1}>
                  {av.tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        {/* 5. APPLY & SAVE BUTTON */}
        <TouchableOpacity
          style={styles.applyAvatarBtn}
          onPress={() => onNavigate && onNavigate('profile')}
          activeOpacity={0.88}
        >
          <Text style={styles.applyAvatarBtnText}>Set as Profile Avatar</Text>
          <Icon name="arrow_forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Hero Circular Avatar
  heroCircularStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroAvatarRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroAvatarRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 66,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  heroCircularImg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  activeCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  currentAvatarName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 12,
    letterSpacing: -0.2,
  },
  currentAvatarStyleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  currentAvatarStyleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052e0',
  },

  // Gender Switcher
  genderSwitcherWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  genderSwitcherBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderSwitcherBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  genderSwitcherText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  genderSwitcherTextActive: {
    color: '#0052e0',
    fontWeight: '900',
  },

  // Circular Avatar Grid
  avatarSectionHeader: {
    marginBottom: 14,
  },
  avatarSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  circularAvatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  circularAvatarItem: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  circularAvatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 3,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularAvatarRingActive: {
    borderColor: '#0052e0',
    borderWidth: 3,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  circularAvatarThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    backgroundColor: '#ffffff',
  },
  miniSelectedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0052e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  circularAvatarItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginTop: 6,
    textAlign: 'center',
  },
  circularAvatarItemNameActive: {
    color: '#0052e0',
    fontWeight: '900',
  },
  circularAvatarItemTag: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
  },

  heroCreatureIconBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatureThumbIconBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Apply Button
  applyAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052e0',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#0052e0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  applyAvatarBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
});

