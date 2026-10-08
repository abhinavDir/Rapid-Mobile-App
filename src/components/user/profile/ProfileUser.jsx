import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { fetchUserApi, updateUserApi } from '../../../services/api';
import storage from '../../../utils/storage';
import Icon from '../../Icon';
import { WaveBottom } from '../../SvgIcons';
import { getAvatarById } from './avatarCatalog';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Top 37% image height for Avatar Hero, remaining 63% for content
const HERO_BG_HEIGHT = Math.round(SCREEN_HEIGHT * 0.37);

export default function ProfileUser({
  user,
  onUserUpdated,
  onLogout,
  onNavigate,
}) {
  // Instant profile initialization
  const [profile, setProfile] = useState(() => {
    if (user && (user._id || user.id || user.name)) return user;
    try {
      const cached = storage.getItem('@rapidride_user_profile') || storage.getItem('userData');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return user || null;
  });

  // Digital 3D Avatar Gender State ('male' | 'female')
  const [avatarGender, setAvatarGender] = useState(() => {
    try {
      const saved = storage.getItem('@rapidride_user_avatar_gender');
      if (saved === 'male' || saved === 'female') return saved;
    } catch (e) { }
    return user?.gender === 'female' ? 'female' : 'male';
  });

  // Selected Avatar ID from the unique catalog
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => {
    try {
      const savedId = storage.getItem('@rapidride_user_avatar_id');
      if (savedId) return savedId;
    } catch (e) { }
    return user?.gender === 'female' ? 'female_1' : 'male_1';
  });

  useEffect(() => {
    try {
      const saved = storage.getItem('@rapidride_user_avatar_gender');
      if (saved === 'male' || saved === 'female') {
        setAvatarGender(saved);
      }
      const savedId = storage.getItem('@rapidride_user_avatar_id');
      if (savedId) {
        setSelectedAvatarId(savedId);
      }
    } catch (e) { }
  }, []);

  // Real user statistics loaded dynamically from server
  const [stats, setStats] = useState(() => {
    try {
      const cachedStats = storage.getItem('@rapidride_user_stats');
      if (cachedStats) return JSON.parse(cachedStats);
    } catch (e) { }
    return {
      rides: 0,
      distanceKm: 0,
      co2SavedKg: 0,
      rapidCoins: user?.walletBalance || 0,
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Active modal: null | 'editProfile' | 'redeemCoins' | 'supportHelp' | 'logoutConfirm'
  const [activeModal, setActiveModal] = useState(null);
  const [formError, setFormError] = useState('');

  // User Interactive Preferences
  const [preferences, setPreferences] = useState({
    quietRide: true,
    pinSecurity: true,
    nightShare: true,
    maskedCalling: true,
  });

  // Profile Form States (Strictly real user values)
  const [editForm, setEditForm] = useState({
    name: user?.name || profile?.name || '',
    phone: user?.phone || profile?.phone || '',
    email: user?.email || profile?.email || '',
    address: user?.address || profile?.address || '',
    workAddress: user?.workAddress || profile?.workAddress || '',
    emergencyContact: user?.emergencyContact || profile?.emergencyContact || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?._id && !user?.id) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const userId = user._id || user.id;
        const res = await fetchUserApi(userId);
        if (res.success && res.user) {
          setProfile(res.user);
          if (res.stats) {
            const realStats = {
              rides: res.stats.rides ?? 0,
              distanceKm: res.stats.distanceKm ?? 0,
              co2SavedKg: res.stats.co2SavedKg ?? parseFloat(((res.stats.distanceKm || 0) * 0.14).toFixed(1)),
              rapidCoins: res.stats.rapidCoins ?? (res.stats.rides ? res.stats.rides * 25 : 1250),
            };
            setStats(realStats);
            try {
              storage.setItem('@rapidride_user_stats', JSON.stringify(realStats));
            } catch (e) { }
          }
          try {
            storage.setItem('@rapidride_user_profile', JSON.stringify(res.user));
          } catch (e) { }
          setEditForm({
            name: res.user.name || '',
            phone: res.user.phone || '',
            email: res.user.email || '',
            address: res.user.address || '',
            workAddress: res.user.workAddress || '',
            emergencyContact: res.user.emergencyContact || '',
          });
        }
      } catch (err) {
        console.warn('Error loading user profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const activeUser = profile || user || {};
  const currentAvatarObj = getAvatarById(selectedAvatarId, avatarGender);

  const handleSaveProfile = async () => {
    const trimmedPhone = (editForm.phone || '').trim();
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setFormError('⚠️ Mobile number is compulsory (at least 8 digits)');
      return;
    }

    setFormError('');
    setIsSaving(true);
    try {
      const userId = activeUser._id || activeUser.id;
      const updatedData = {
        ...activeUser,
        ...editForm,
        phone: trimmedPhone,
      };

      let remoteSaved = false;
      if (userId) {
        try {
          const res = await updateUserApi({
            userId,
            ...editForm,
            phone: trimmedPhone,
          });
          if (res?.success && res?.user) {
            setProfile(res.user);
            if (onUserUpdated) onUserUpdated(res.user);
            await storage.setItem('userData', JSON.stringify(res.user));
            await storage.setItem('@rapidride_user_profile', JSON.stringify(res.user));
            remoteSaved = true;
          }
        } catch (apiErr) {
          console.log('Remote profile update handled locally:', apiErr);
        }
      }

      if (!remoteSaved) {
        setProfile(updatedData);
        if (onUserUpdated) onUserUpdated(updatedData);
        await storage.setItem('userData', JSON.stringify(updatedData));
        await storage.setItem('@rapidride_user_profile', JSON.stringify(updatedData));
      }

      setActiveModal(null);
    } catch (err) {
      setFormError('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRedeemCoins = (rewardName, cost) => {
    if (stats.rapidCoins < cost) return;
    setStats((prev) => ({ ...prev, rapidCoins: prev.rapidCoins - cost }));
    setActiveModal(null);
  };

  const handleQuickBookTo = (destinationName, dropoffAddress) => {
    if (onNavigate) {
      onNavigate('home', {
        presetDropoff: `${destinationName}, ${dropoffAddress}`,
      });
    }
  };

  const handleCallSOS = () => {
    const phone = editForm.emergencyContact || profile?.emergencyContact || '112';
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => { });
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openEditModal = () => {
    setFormError('');
    setEditForm({
      name: activeUser.name || '',
      phone: activeUser.phone || '',
      email: activeUser.email || '',
      address: activeUser.address || '',
      workAddress: activeUser.workAddress || '',
      emergencyContact: activeUser.emergencyContact || '',
    });
    setActiveModal('editProfile');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Floating Top Header Bar (Fixed at top, accessible during scroll) */}
      <SafeAreaView style={styles.floatingHeaderBar} pointerEvents="box-none">
        <Pressable
          onPress={() => onNavigate && onNavigate('home')}
          style={styles.heroGlassBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
        >
          <Icon name="arrow_back" size={20} color="#0f172a" />
        </Pressable>

        <Text style={styles.heroHeaderTitle}>Profile</Text>

        <TouchableOpacity
          onPress={() => onNavigate && onNavigate('digital-avatar')}
          style={styles.heroGlassBtn}
          activeOpacity={0.8}
          hitSlop={10}
        >
          <Icon name="auto_awesome" size={20} color="#0052e0" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Full Page Unified ScrollView: Image + S-Curve + Content scroll together */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. TOP 37% HERO AVATAR STAGE */}
        <View style={styles.heroBackgroundStage}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => onNavigate && onNavigate('digital-avatar')}
            style={styles.heroAvatarTapContainer}
          >
            <Image
              source={currentAvatarObj.image}
              style={styles.hero3DAvatarImg}
              resizeMode="contain"
            />
            {/* Tap to Customize floating pill */}
            <View style={styles.heroChangePill}>
              <Icon name="auto_awesome" size={12} color="#ffffff" />
              <Text style={styles.heroChangePillText}>3D Avatar Studio</Text>
            </View>
          </TouchableOpacity>

          {/* S-CURVE WAVE PINNED AT BOTTOM OF HERO WITH EDGE BLEED (NO GAP) */}
          {/* <View style={styles.waveWrapper}>
            <WaveBottom width={SCREEN_WIDTH + 4} height={50} color="#f8fafc" />
          </View> */}
        </View>

        {/* 2. FULL-WIDTH MERGED CONTENT BODY */}
        <View style={styles.contentBodySection}>

          {/* 🌟 1. ELEVATED VIP PASSENGER IDENTITY CARD */}
          <View style={styles.passengerCard}>
            <View style={styles.passengerCardHeader}>
              <View style={styles.passengerAvatarCircle}>
                <Text style={styles.passengerAvatarText}>
                  {(activeUser.name || 'U').slice(0, 1).toUpperCase()}
                </Text>
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.passengerMetaCol}>
                <View style={styles.passengerNameRow}>
                  <Text style={styles.passengerName} numberOfLines={1}>
                    {activeUser.name || 'RapidRide Passenger'}
                  </Text>
                  <Icon name="verified" size={17} color="#0052e0" />
                </View>

                {/* Verified Mobile Number Chip */}
                {activeUser.phone ? (
                  <TouchableOpacity
                    style={styles.phoneChip}
                    onPress={openEditModal}
                    activeOpacity={0.75}
                  >
                    <Icon name="phone" size={12} color="#059669" />
                    <Text style={styles.phoneChipVal}>{activeUser.phone}</Text>
                    <View style={styles.greenTickCircle}>
                      <Icon name="check" size={9} color="#ffffff" strokeWidth={1.5} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addPhoneAlert}
                    onPress={openEditModal}
                    activeOpacity={0.8}
                  >
                    <Icon name="warning" size={12} color="#dc2626" />
                    <Text style={styles.addPhoneAlertText}>
                      + Add Phone (Compulsory)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.editCardBtn}
                onPress={openEditModal}
                activeOpacity={0.8}
              >
                <Icon name="edit" size={13} color="#0052e0" />
                <Text style={styles.editCardBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Rides Badge */}
            {/* <View style={styles.passengerBadgesBar}>
              <View style={styles.badgePillRides}>
                <Icon name="directions_car" size={13} color="#0052e0" />
                <Text style={styles.badgeRidesText}>{stats.rides} Completed Rides</Text>
              </View>
            </View> */}
          </View>

          {/* 🌟 3. QUICK COMMUTE SHORTCUTS (SIDE-BY-SIDE 2 CARDS) */}
          <View style={styles.placesContainer}>
            <View style={styles.sectionHeaderLine}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="bookmark" size={16} color="#0052e0" />
                <Text style={styles.sectionMainTitle}>Saved Destinations</Text>
              </View>
              <TouchableOpacity onPress={openEditModal} hitSlop={8}>
                <Text style={styles.sectionActionText}>Manage</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.placesGrid}>
              {/* Home Card */}
              <TouchableOpacity
                style={styles.placeCard}
                onPress={() => editForm.address ? handleQuickBookTo('Home', editForm.address) : openEditModal()}
                activeOpacity={0.85}
              >
                <View style={styles.placeCardTop}>
                  <View style={[styles.placeIconCircle, { backgroundColor: '#eff6ff' }]}>
                    <Icon name="home" size={18} color="#0052e0" />
                  </View>
                  <View style={styles.placeRideTag}>
                    <Text style={styles.placeRideTagText}>{editForm.address ? 'Ride Now' : 'Set'}</Text>
                    <Icon name="arrow_forward" size={10} color="#0052e0" />
                  </View>
                </View>
                <Text style={styles.placeCardTitle}>Home</Text>
                <Text style={styles.placeCardAddress} numberOfLines={1}>
                  {editForm.address || 'Tap to configure location'}
                </Text>
              </TouchableOpacity>

              {/* Work Card */}
              <TouchableOpacity
                style={styles.placeCard}
                onPress={() => editForm.workAddress ? handleQuickBookTo('Work', editForm.workAddress) : openEditModal()}
                activeOpacity={0.85}
              >
                <View style={styles.placeCardTop}>
                  <View style={[styles.placeIconCircle, { backgroundColor: '#ecfdf5' }]}>
                    <Icon name="apartment" size={18} color="#059669" />
                  </View>
                  <View style={[styles.placeRideTag, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                    <Text style={[styles.placeRideTagText, { color: '#059669' }]}>
                      {editForm.workAddress ? 'Ride Now' : 'Set'}
                    </Text>
                    <Icon name="arrow_forward" size={10} color="#059669" />
                  </View>
                </View>
                <Text style={styles.placeCardTitle}>Work / Office</Text>
                <Text style={styles.placeCardAddress} numberOfLines={1}>
                  {editForm.workAddress || 'Tap to configure location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 🌟 4. 24x7 SAFETY & SECURITY SUITE */}
          <View style={styles.featureBlock}>
            <View style={styles.sectionHeaderLine}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="shield" size={16} color="#dc2626" />
                <Text style={styles.sectionMainTitle}>Safety & Security Shield</Text>
              </View>
              <View style={styles.liveShieldPill}>
                <View style={styles.pulseGreenDot} />
                <Text style={styles.liveShieldText}>24x7 Protected</Text>
              </View>
            </View>

            {/* Emergency SOS Banner */}
            <View style={styles.sosCard}>
              <View style={styles.sosIconCircle}>
                <Icon name="emergency" size={20} color="#dc2626" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.sosHeading}>Emergency SOS Contact</Text>
                <Text style={styles.sosSub} numberOfLines={1}>
                  {editForm.emergencyContact || 'Not configured'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sosCallBtn}
                onPress={handleCallSOS}
                activeOpacity={0.85}
              >
                <Icon name="call" size={12} color="#ffffff" />
                <Text style={styles.sosCallBtnText}>Call SOS</Text>
              </TouchableOpacity>
            </View>

            {/* Toggle: Ride Start PIN */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => togglePreference('pinSecurity')}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#eff6ff' }]}>
                <Icon name="pin" size={16} color="#0052e0" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.settingName}>4-Digit Ride Start PIN</Text>
                <Text style={styles.settingDesc}>Captain verifies PIN before starting ride</Text>
              </View>
              <View style={preferences.pinSecurity ? styles.toggleOn : styles.toggleOff}>
                <Text style={preferences.pinSecurity ? styles.toggleOnText : styles.toggleOffText}>
                  {preferences.pinSecurity ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Toggle: Night GPS Auto-Share */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => togglePreference('nightShare')}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="share_location" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.settingName}>Night Safety Auto-Share</Text>
                <Text style={styles.settingDesc}>Auto-share live GPS tracking after 9:00 PM</Text>
              </View>
              <View style={preferences.nightShare ? styles.toggleOn : styles.toggleOff}>
                <Text style={preferences.nightShare ? styles.toggleOnText : styles.toggleOffText}>
                  {preferences.nightShare ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 🌟 5. RIDE COMFORT & PRIVACY SUITE */}
          <View style={styles.featureBlock}>
            <View style={styles.sectionHeaderLine}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="tune" size={16} color="#7c3aed" />
                <Text style={styles.sectionMainTitle}>Ride Comfort & Privacy</Text>
              </View>
            </View>

            {/* Quiet Ride */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => togglePreference('quietRide')}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#f8fafc' }]}>
                <Icon name="volume_off" size={16} color="#475569" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.settingName}>Quiet Ride Mode</Text>
                <Text style={styles.settingDesc}>Minimal conversation during your journey</Text>
              </View>
              <View style={preferences.quietRide ? styles.toggleOn : styles.toggleOff}>
                <Text style={preferences.quietRide ? styles.toggleOnText : styles.toggleOffText}>
                  {preferences.quietRide ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Masked Calling */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => togglePreference('maskedCalling')}
              activeOpacity={0.75}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#f5f3ff' }]}>
                <Icon name="phone_locked" size={16} color="#7c3aed" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.settingName}>Private Number Shield</Text>
                <Text style={styles.settingDesc}>Calls routed without revealing real number</Text>
              </View>
              <View style={preferences.maskedCalling ? styles.toggleOn : styles.toggleOff}>
                <Text style={preferences.maskedCalling ? styles.toggleOnText : styles.toggleOffText}>
                  {preferences.maskedCalling ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 🌟 6. HELP, SUPPORT & TERMS */}
          <View style={styles.featureBlock}>
            <View style={styles.sectionHeaderLine}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="support_agent" size={16} color="#0052e0" />
                <Text style={styles.sectionMainTitle}>Help & Support</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.navRowItem}
              onPress={() => setActiveModal('supportHelp')}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#eff6ff' }]}>
                <Icon name="help_outline" size={17} color="#0052e0" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.navRowTitle}>24x7 Priority Support Center</Text>
                <Text style={styles.navRowDesc}>Lost items, ride issues & fare refund</Text>
              </View>
              <Icon name="chevron_right" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRowItem}
              onPress={() => { }}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#f8fafc' }]}>
                <Icon name="gavel" size={17} color="#64748b" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.navRowTitle}>Legal & Privacy Policy</Text>
                <Text style={styles.navRowDesc}>Terms of Service & Ride Guarantee</Text>
              </View>
              <Icon name="chevron_right" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* 🌟 7. FOOTER & LOGOUT */}
          <View style={styles.footerWrap}>
            <View style={styles.appVersionRow}>
              <Icon name="check_circle" size={13} color="#059669" />
              <Text style={styles.appVersionText}>RapidRide App v2.5.0 • Up to date</Text>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setActiveModal('logoutConfirm')}
              activeOpacity={0.85}
            >
              <Icon name="logout" size={16} color="#dc2626" />
              <Text style={styles.logoutBtnText}>Logout Account</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* ===================================================
          MODALS
         =================================================== */}

      {/* 1. EDIT PROFILE MODAL */}
      <Modal visible={activeModal === 'editProfile'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="account_circle" size={22} color="#0052e0" />
                <Text style={styles.modalHeaderTitle}>Edit Profile & Details</Text>
              </View>
              <Pressable
                onPress={() => {
                  setFormError('');
                  setActiveModal(null);
                }}
                style={styles.modalCloseBtn}
                hitSlop={8}
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            {formError ? (
              <View style={styles.formInlineErrorBox}>
                <Icon name="error" size={14} color="#dc2626" />
                <Text style={styles.formInlineErrorText}>{formError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
              <View>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.name}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, name: t }));
                  }}
                  placeholder="Your Full Name"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>
                  Mobile Number <Text style={{ color: '#dc2626', fontWeight: '900' }}>* (Compulsory for Rides)</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, phone: t }));
                  }}
                  placeholder="+91 Mobile Number"
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, email: t }));
                  }}
                  placeholder="name@domain.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Home Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.address}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, address: t }));
                  }}
                  placeholder="Set your home address"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Work Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.workAddress}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, workAddress: t }));
                  }}
                  placeholder="Set your work address"
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Emergency SOS Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.emergencyContact}
                  onChangeText={(t) => {
                    if (formError) setFormError('');
                    setEditForm((prev) => ({ ...prev, emergencyContact: t }));
                  }}
                  placeholder="Emergency phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.88}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. REDEEM COINS MODAL */}
      <Modal visible={activeModal === 'redeemCoins'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="toll" size={22} color="#d97706" />
                <Text style={styles.modalHeaderTitle}>Redeem RapidCoins</Text>
              </View>
              <Pressable
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
                hitSlop={8}
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <View style={styles.coinBanner}>
              <Text style={styles.coinBannerLabel}>Your RapidCoins</Text>
              <Text style={styles.coinBannerVal}>{stats.rapidCoins} Coins</Text>
              <Text style={styles.coinBannerSub}>Earn 25 coins on every completed ride!</Text>
            </View>

            <View style={{ gap: 10, marginVertical: 12 }}>
              <TouchableOpacity
                style={styles.couponCard}
                onPress={() => handleRedeemCoins('₹50 Flat Off Ride Coupon', 200)}
                activeOpacity={0.82}
              >
                <View style={[styles.couponIconBox, { backgroundColor: '#eff6ff' }]}>
                  <Icon name="confirmation_number" size={20} color="#0052e0" />
                </View>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.couponTitle}>₹50 Flat OFF Coupon</Text>
                  <Text style={styles.couponSub}>Valid on Bike, Auto & Cabs</Text>
                </View>
                <View style={styles.couponCostPill}>
                  <Text style={styles.couponCostText}>200 Coins</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.couponCard}
                onPress={() => handleRedeemCoins('₹100 Intercity Cab Voucher', 400)}
                activeOpacity={0.82}
              >
                <View style={[styles.couponIconBox, { backgroundColor: '#f5f3ff' }]}>
                  <Icon name="local_taxi" size={20} color="#7c3aed" />
                </View>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.couponTitle}>₹100 Outstation Voucher</Text>
                  <Text style={styles.couponSub}>Valid on Rentals & Highway Cabs</Text>
                </View>
                <View style={styles.couponCostPill}>
                  <Text style={styles.couponCostText}>400 Coins</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. SUPPORT MODAL */}
      <Modal visible={activeModal === 'supportHelp'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="support_agent" size={22} color="#0052e0" />
                <Text style={styles.modalHeaderTitle}>24x7 Priority Support</Text>
              </View>
              <Pressable
                onPress={() => setActiveModal(null)}
                style={styles.modalCloseBtn}
                hitSlop={8}
              >
                <Icon name="close" size={18} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
              {[
                {
                  title: 'I lost an item in the ride',
                  sub: 'We will connect you directly with the Captain or dispatch a ticket.',
                  icon: 'find_in_page',
                },
                {
                  title: 'Fare breakdown or overcharge inquiry',
                  sub: 'Review toll charges, waiting fees, or request automatic refund.',
                  icon: 'receipt_long',
                },
                {
                  title: 'Report driver conduct or vehicle condition',
                  sub: 'Our safety team reviews all feedbacks with zero tolerance policy.',
                  icon: 'report_problem',
                },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.faqCard}
                  onPress={() => setActiveModal(null)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqIconCircle}>
                    <Icon name={item.icon} size={18} color="#0052e0" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.faqTitle}>{item.title}</Text>
                    <Text style={styles.faqSub}>{item.sub}</Text>
                  </View>
                  <Icon name="chevron_right" size={16} color="#94a3b8" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#059669', marginTop: 10 }]}
                onPress={() => {
                  Linking.openURL('tel:1800123456').catch(() => { });
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.saveBtnText}>Call 24x7 Toll-Free Helpline</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. LOGOUT CONFIRM MODAL */}
      <Modal visible={activeModal === 'logoutConfirm'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { borderRadius: 24, paddingBottom: 24 }]}>
            <View style={styles.logoutIconBox}>
              <Icon name="logout" size={26} color="#dc2626" />
            </View>

            <Text style={[styles.modalHeaderTitle, { textAlign: 'center', marginTop: 12 }]}>
              Confirm Logout
            </Text>
            <Text style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginVertical: 8, lineHeight: 18 }}>
              Are you sure you want to log out of your RapidRide account?
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, backgroundColor: '#f1f5f9' }]}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.saveBtnText, { color: '#0f172a' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, backgroundColor: '#dc2626' }]}
                onPress={() => {
                  setActiveModal(null);
                  if (onLogout) onLogout();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Floating Header Bar over Hero (Always accessible, transparent overlay)
  floatingHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 10,
    paddingBottom: 6,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  heroGlassBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  heroHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },

  // Main Unified ScrollView (Scrolls Hero Avatar + Wave Curve + Full-Width Content)
  mainScrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainScrollContent: {
    paddingBottom: 40,
  },

  // 1. Hero Avatar Stage (Pure White Backdrop, Top 37%)
  heroBackgroundStage: {
    height: HERO_BG_HEIGHT,
    width: '100%',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 30 : 44,
  },
  heroAvatarTapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hero3DAvatarImg: {
    width: SCREEN_WIDTH * 0.85,
    height: HERO_BG_HEIGHT - (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 34),
    backgroundColor: '#ffffff',
  },
  heroChangePill: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroChangePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // 2. Full-Width S-Curve Wave (Pinned to Hero Bottom with Bleed, Absolutely Zero Gap)
  waveWrapper: {
    position: 'absolute',
    bottom: -1,
    left: -2,
    right: -2,
    width: SCREEN_WIDTH + 4,
    height: 50,
    zIndex: 10,
  },

  // 3. Full-Width Content Body (Edge-to-Edge Merged Continuation)
  contentBodySection: {
    width: '100%',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

  // 🌟 1. ELEVATED VIP PASSENGER CARD
  passengerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  passengerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  passengerAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0052e0',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  passengerMetaCol: {
    flex: 1,
    marginRight: 8,
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  phoneChipVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  greenTickCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  addPhoneAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  addPhoneAlertText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#dc2626',
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 4,
  },
  editCardBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0052e0',
  },
  passengerBadgesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  badgePillGold: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  badgeGoldText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
  },
  badgePillRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  badgeRatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d97706',
  },
  badgePillSecure: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  badgeSecureText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  // 🌟 2. 4-PILL BENTO METRIC TILES
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricTile: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },

  // 🌟 3. PLACES GRID
  placesContainer: {
    marginBottom: 14,
  },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionMainTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052e0',
  },
  placesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  placeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  placeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  placeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeRideTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  placeRideTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0052e0',
  },
  placeCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  placeCardAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },

  // 🌟 4 & 5. FEATURE BLOCK
  featureBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  liveShieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveShieldText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    marginBottom: 8,
  },
  sosIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: '#991b1b',
  },
  sosSub: {
    fontSize: 11,
    color: '#b91c1c',
    marginTop: 1,
    fontWeight: '700',
  },
  sosCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  sosCallBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  toggleOn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleOnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
  },
  toggleOff: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleOffText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
  },

  // Nav row item
  navRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  navIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  navRowDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },

  // Footer & Logout
  footerWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  appVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  appVersionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#dc2626',
  },

  // Modals General
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formInlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    gap: 6,
  },
  formInlineErrorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#0052e0',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  coinBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 12,
  },
  coinBannerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
  },
  coinBannerVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#d97706',
    marginVertical: 2,
  },
  coinBannerSub: {
    fontSize: 11,
    color: '#78350f',
    fontWeight: '600',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  couponIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  couponSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  couponCostPill: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  couponCostText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#b45309',
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  faqTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  faqSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  logoutIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
