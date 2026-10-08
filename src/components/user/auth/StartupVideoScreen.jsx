import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const QUOTES = [
  {
    text: "“Your city, your journey, seamlessly connected.”",
    author: "Fast & Safe City Mobility",
  },
  {
    text: "“Every turn brings you closer to where you want to be.”",
    author: "Zero Detour, Direct Navigation",
  },
  {
    text: "“Connecting your day with quick, effortless rides.”",
    author: "Verified Drivers • Best Rates",
  },
];

export default function StartupVideoScreen({ onFinish }) {
  // Animation controllers
  const scooterBobAnim = useRef(new Animated.Value(0)).current;
  const scooterDriveInAnim = useRef(new Animated.Value(-80)).current;
  const phoneFloatAnim = useRef(new Animated.Value(0)).current;
  const cloudDriftAnim = useRef(new Animated.Value(0)).current;
  const roadDashAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const overallFadeAnim = useRef(new Animated.Value(1)).current;

  const [quoteIndex, setQuoteIndex] = useState(0);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // Pick quote
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

    // 1. Scooter smooth entry
    Animated.spring(scooterDriveInAnim, {
      toValue: 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Scooter vertical suspension engine vibration
    Animated.loop(
      Animated.sequence([
        Animated.timing(scooterBobAnim, {
          toValue: -5,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scooterBobAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Floating smartphone gentle levitation
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneFloatAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(phoneFloatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Soft background cloud drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDriftAnim, {
          toValue: 12,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cloudDriftAnim, {
          toValue: -12,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Ground speed dash lines loop
    Animated.loop(
      Animated.timing(roadDashAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 6. Content entrance (fade & slide up from below)
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start();

    // 7. Overall timeline (~2.6s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2600,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !hasFinishedRef.current) {
        completeStartup();
      }
    });
  }, []);

  const completeStartup = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    Animated.timing(overallFadeAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  const roadTranslateX = roadDashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const activeQuote = QUOTES[quoteIndex] || QUOTES[0];

  return (
    <Animated.View style={[styles.container, { opacity: overallFadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Soft Pastel Background Ambient Glows */}
      <View style={styles.softPastelBlobTop} />
      <View style={styles.softPastelBlobRight} />

      {/* Entire screen touch skips startup animation immediately */}
      <TouchableOpacity
        style={styles.touchStage}
        activeOpacity={1}
        onPress={completeStartup}
      >
        {/* TOP: HERO ILLUSTRATION STAGE (FOCUSED & BEAUTIFULLY PROPORTIONED) */}
        <View style={styles.illustrationHeroSection}>
          {/* Drifting Pastel Lavender Cloud Backdrop */}
          <Animated.View
            style={[
              styles.backdropCloudContainer,
              { transform: [{ translateX: cloudDriftAnim }] },
            ]}
          >
            <Svg width="310" height="200" viewBox="0 0 310 200" fill="none">
              <Defs>
                <LinearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="200">
                  <Stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.85" />
                  <Stop offset="60%" stopColor="#ede9fe" stopOpacity="0.65" />
                  <Stop offset="100%" stopColor="#f5f3ff" stopOpacity="0.3" />
                </LinearGradient>
              </Defs>
              <Path
                d="M55 150 C30 150 10 130 15 102 C20 74 48 70 65 74 C75 42 120 38 155 54 C185 28 240 38 255 78 C282 82 298 104 292 132 C286 158 260 162 238 156 C210 168 132 168 55 150 Z"
                fill="url(#cloudGrad)"
              />
              <Circle cx="95" cy="72" r="30" fill="#e0e7ff" opacity="0.6" />
              <Circle cx="215" cy="66" r="34" fill="#c7d2fe" opacity="0.5" />
            </Svg>
          </Animated.View>

          {/* MAIN ART: Scooter Rider + Floating Route Phone */}
          <View style={styles.artComposite}>
            {/* FLOATING SMARTPHONE WITH LIVE NAVIGATION ROUTE */}
            <Animated.View
              style={[
                styles.phoneWrapper,
                { transform: [{ translateY: phoneFloatAnim }] },
              ]}
            >
              <Svg width="125" height="205" viewBox="0 0 125 205" fill="none">
                <Defs>
                  <LinearGradient id="phoneShadow" x1="0" y1="0" x2="125" y2="205">
                    <Stop offset="0%" stopColor="#ffffff" />
                    <Stop offset="100%" stopColor="#f8fafc" />
                  </LinearGradient>
                  <LinearGradient id="routeGrad" x1="0" y1="0" x2="125" y2="205">
                    <Stop offset="0%" stopColor="#ef4444" />
                    <Stop offset="100%" stopColor="#f97316" />
                  </LinearGradient>
                </Defs>

                {/* Outer Phone Bezel */}
                <Rect
                  x="4"
                  y="4"
                  width="117"
                  height="197"
                  rx="20"
                  fill="#0f172a"
                />
                {/* Phone Screen Glass */}
                <Rect
                  x="7"
                  y="7"
                  width="111"
                  height="191"
                  rx="17"
                  fill="url(#phoneShadow)"
                />

                {/* Speaker Notch */}
                <Rect x="46" y="11" width="33" height="5" rx="2.5" fill="#1e293b" />

                {/* Map Grid / Streets Background */}
                <Path
                  d="M16 48 L108 48 M16 92 L108 92 M16 136 L108 136 M42 28 L42 175 M82 28 L82 175"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* LIVE RED NAVIGATION ROUTE LINE */}
                <Path
                  d="M34 38 L34 82 L82 114 L82 148 L98 158"
                  stroke="url(#routeGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Start Marker Pin */}
                <Circle cx="34" cy="38" r="5" fill="#ef4444" />
                <Circle cx="34" cy="38" r="2.2" fill="#ffffff" />

                {/* Destination Dropoff Marker */}
                <Circle cx="98" cy="158" r="5.5" fill="#22c55e" />
                <Circle cx="98" cy="158" r="2.2" fill="#ffffff" />

                {/* Bottom App Navigation Bar in Phone */}
                <Rect x="16" y="172" width="93" height="18" rx="6" fill="#f1f5f9" />
                <Circle cx="30" cy="181" r="3.5" fill="#ff5c47" />
                <Rect x="40" y="179" width="28" height="4" rx="2" fill="#94a3b8" />
                <Circle cx="94" cy="181" r="3.5" fill="#3b82f6" />
              </Svg>
            </Animated.View>

            {/* ANIMATED SCOOTER & RIDER */}
            <Animated.View
              style={[
                styles.scooterWrapper,
                {
                  transform: [
                    { translateX: scooterDriveInAnim },
                    { translateY: scooterBobAnim },
                  ],
                },
              ]}
            >
              <Svg width="205" height="162" viewBox="0 0 205 162" fill="none">
                <Defs>
                  <LinearGradient id="scooterBody" x1="0" y1="0" x2="205" y2="0">
                    <Stop offset="0%" stopColor="#db2777" />
                    <Stop offset="50%" stopColor="#ec4899" />
                    <Stop offset="100%" stopColor="#f43f5e" />
                  </LinearGradient>
                  <LinearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="162">
                    <Stop offset="0%" stopColor="#f97316" />
                    <Stop offset="100%" stopColor="#ea580c" />
                  </LinearGradient>
                  <LinearGradient id="riderPants" x1="0" y1="0" x2="0" y2="162">
                    <Stop offset="0%" stopColor="#581c87" />
                    <Stop offset="100%" stopColor="#6b21a8" />
                  </LinearGradient>
                </Defs>

                {/* DELIVERY CARRIER BOX */}
                <Rect x="8" y="52" width="42" height="34" rx="6" fill="url(#boxGrad)" />
                <Rect x="14" y="46" width="28" height="8" rx="3" fill="#fbbf24" />
                <Path d="M12 68 L46 68" stroke="#c2410c" strokeWidth="1.5" />

                {/* RIDER PERSON */}
                {/* Backpack Strap / Back */}
                <Path d="M46 56 Q38 75 56 88 Z" fill="#b45309" />
                {/* Torso (Yellow Shirt) */}
                <Path
                  d="M52 48 L78 48 L76 88 L50 86 Z"
                  fill="#eab308"
                />
                {/* Head & Yellow Helmet with Visor */}
                <Circle cx="74" cy="30" r="15" fill="#facc15" />
                <Path d="M74 20 Q88 20 90 30 L74 30 Z" fill="#eab308" />
                {/* Face & Blue Mask */}
                <Circle cx="82" cy="32" r="5.5" fill="#fed7aa" />
                <Rect x="79" y="31" width="8.5" height="6.5" rx="2" fill="#38bdf8" />

                {/* Arms Reaching Handlebars */}
                <Path
                  d="M68 56 L102 67"
                  stroke="#fcd34d"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />

                {/* Legs (Purple Pants) */}
                <Path
                  d="M56 86 L95 90 L104 116 L91 118 L81 101 L52 94 Z"
                  fill="url(#riderPants)"
                />
                {/* Shoes */}
                <Rect x="95" y="114" width="18" height="6.5" rx="2.5" fill="#1e293b" />

                {/* SCOOTER BODY (Vibrant Pink / Coral) */}
                {/* Rear Fender & Engine Cover */}
                <Path
                  d="M20 108 Q44 84 74 94 L81 118 L27 118 Z"
                  fill="url(#scooterBody)"
                />
                {/* Floorboard */}
                <Rect x="70" y="116" width="48" height="7.5" rx="3.5" fill="#be185d" />

                {/* Front Apron Shield & Steering Column */}
                <Path
                  d="M110 116 L123 66 L138 66 L129 116 Z"
                  fill="url(#scooterBody)"
                />
                {/* Handlebars */}
                <Path
                  d="M114 64 L134 62 L132 56"
                  stroke="#475569"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                {/* Front Headlight */}
                <Circle cx="136" cy="66" r="5.5" fill="#fef08a" />
                <Path d="M140 64 L158 60 L158 72 L140 68 Z" fill="#fef08a" opacity="0.45" />

                {/* REAR WHEEL */}
                <Circle cx="37" cy="126" r="20" fill="#0f172a" />
                <Circle cx="37" cy="126" r="13" fill="#e2e8f0" />
                <Circle cx="37" cy="126" r="7.5" fill="#7c3aed" />
                <Circle cx="37" cy="126" r="3" fill="#ffffff" />

                {/* FRONT WHEEL */}
                <Circle cx="138" cy="126" r="20" fill="#0f172a" />
                <Circle cx="138" cy="126" r="13" fill="#e2e8f0" />
                <Circle cx="138" cy="126" r="7.5" fill="#7c3aed" />
                <Circle cx="138" cy="126" r="3" fill="#ffffff" />
              </Svg>
            </Animated.View>
          </View>

          {/* GROUND MOTION DASH LINES */}
          <View style={styles.groundLineContainer}>
            <View style={styles.baseGroundLine} />
            <Animated.View
              style={[
                styles.movingSpeedDashes,
                { transform: [{ translateX: roadTranslateX }] },
              ]}
            >
              {[...Array(9)].map((_, i) => (
                <View key={i} style={styles.speedDash} />
              ))}
            </Animated.View>
          </View>
        </View>

        {/* BOTTOM: ALL CONTENT GROUPED EXCLUSIVELY BELOW THE ILLUSTRATION */}
        <Animated.View
          style={[
            styles.bottomContentSection,
            {
              opacity: contentFadeAnim,
              transform: [{ translateY: contentSlideAnim }],
            },
          ]}
        >
          {/* 1. App Title in Cursive Font (No borders, pure text) */}
          <View style={styles.brandCursiveContainer}>
            <Text style={styles.appCursiveTitle}>RapidRide</Text>
            <Text style={styles.appCursiveTagline}>city mobility in motion</Text>
          </View>

          {/* 2. Inspirational Journey Quote (Borderless pure text) */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteBodyText}>{activeQuote.text}</Text>
            <Text style={styles.quoteAuthorText}>— {activeQuote.author}</Text>
          </View>

          {/* 3. Progress Bar & Loading Status */}
          <View style={styles.progressContainer}>
            <View style={styles.statusRow}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.statusText}>Connecting your ride experience...</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: progressWidth },
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  softPastelBlobTop: {
    position: 'absolute',
    top: -50,
    left: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(237, 233, 254, 0.65)',
  },
  softPastelBlobRight: {
    position: 'absolute',
    top: '25%',
    right: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(254, 226, 226, 0.5)',
  },
  touchStage: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 22,
  },
  illustrationHeroSection: {
    flex: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 15,
  },
  backdropCloudContainer: {
    position: 'absolute',
    top: 5,
    alignItems: 'center',
  },
  artComposite: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    height: 210,
  },
  scooterWrapper: {
    zIndex: 10,
    marginRight: -25,
  },
  phoneWrapper: {
    zIndex: 5,
    marginLeft: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  groundLineContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  baseGroundLine: {
    width: '88%',
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  movingSpeedDashes: {
    flexDirection: 'row',
    gap: 26,
    marginTop: 4,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
  },
  speedDash: {
    width: 24,
    height: 2.2,
    backgroundColor: '#94a3b8',
    borderRadius: 1,
  },
  bottomContentSection: {
    flex: 0.95,
    justifyContent: 'flex-end',
    gap: 16,
    paddingBottom: 16,
  },
  brandCursiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  appCursiveTitle: {
    fontFamily: Platform.select({ ios: 'Snell Roundhand', android: 'cursive' }),
    fontStyle: 'italic',
    fontSize: 44,
    fontWeight: '700',
    color: '#ff5c47',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  appCursiveTagline: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 2,
  },
  quoteBodyText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteAuthorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff5c47',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  progressBarTrack: {
    width: '100%',
    height: 4.5,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff5c47',
    borderRadius: 3,
  },
});
