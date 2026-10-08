import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg';
import Icon from './Icon';

// ==========================================
// 1. REALISTIC BIKE (MOTORCYCLE / SCOOTER)
// ==========================================
export function BikeGraphic({ width = 68, height = 40, color = '#0052e0' }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id="bikeTireGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="100%" stopColor="#0f172a" />
          </LinearGradient>
          <LinearGradient id="bikeBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={color || '#0052e0'} />
            <Stop offset="100%" stopColor="#2563eb" />
          </LinearGradient>
        </Defs>

        {/* REAR WHEEL */}
        <Circle cx="20" cy="37" r="11" fill="url(#bikeTireGrad)" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="20" cy="37" r="7.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="20" cy="37" r="3.5" fill="#94a3b8" />
        <Circle cx="20" cy="37" r="5" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />

        {/* FRONT WHEEL */}
        <Circle cx="76" cy="37" r="11" fill="url(#bikeTireGrad)" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="76" cy="37" r="7.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="76" cy="37" r="3.5" fill="#94a3b8" />
        <Circle cx="76" cy="37" r="5.5" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />

        {/* FRONT SUSPENSION FORK & MUDGUARD */}
        <Line x1="76" y1="37" x2="65" y2="15" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <Line x1="74" y1="35" x2="66" y2="19" stroke="#475569" strokeWidth="1.5" />
        <Path d="M68 28C71 27 77 27 82 31" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        {/* ENGINE BLOCK & CRANKCASE */}
        <Rect x="40" y="30" width="16" height="12" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        <Circle cx="45" cy="36" r="3.5" fill="#475569" stroke="#64748b" strokeWidth="1" />
        <Line x1="42" y1="32" x2="54" y2="32" stroke="#64748b" strokeWidth="1" />
        <Line x1="42" y1="34" x2="54" y2="34" stroke="#64748b" strokeWidth="1" />

        {/* EXHAUST PIPE & SILENCER */}
        <Path d="M47 38C50 41 42 43 32 43L19 40" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <Rect x="16" y="38" width="16" height="4" rx="1.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />

        {/* SWINGARM & REAR SHOCK */}
        <Line x1="20" y1="37" x2="42" y2="34" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <Line x1="30" y1="35" x2="36" y2="24" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />

        {/* MAIN CHASSIS FRAME */}
        <Path d="M42 34L65 18L44 24Z" fill="#1e293b" />

        {/* FUEL TANK */}
        <Path d="M64 17C64 17 59 13 50 14C45 14.5 44 19 43 23L62 21Z" fill="url(#bikeBodyGrad)" />
        <Path d="M60 17C56 15 52 15 48 16" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />

        {/* SEAT (TWO-TIER DRIVER + PILLION) */}
        <Path d="M44 23C40 21 34 22 28 20C24 18.5 21 21 21 21L24 24L44 24Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <Line x1="33" y1="21" x2="33" y2="24" stroke="#475569" strokeWidth="1" />

        {/* REAR TAIL COWL & TAILLIGHT */}
        <Path d="M28 20L18 19C17 19 16 20.5 17 22L24 24Z" fill="url(#bikeBodyGrad)" />
        <Path d="M16 20.5L14 21L16 22Z" fill="#ef4444" />
        <Line x1="17" y1="23" x2="13" y2="28" stroke="#1e293b" strokeWidth="1.5" />

        {/* HANDLEBARS & CONTROLS */}
        <Path d="M64 16L62 9L58 9" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <Rect x="56" y="8" width="4" height="2.5" rx="1" fill="#475569" />
        <Line x1="62" y1="10" x2="60" y2="5" stroke="#64748b" strokeWidth="1.2" />
        <Circle cx="59.5" cy="4.5" r="2" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />

        {/* FRONT HEADLIGHT FAIRING */}
        <Path d="M65 16L72 20C73 21 72 23 70 24L65 22Z" fill="url(#bikeBodyGrad)" />
        <Polygon points="72,20 76,21 75,23 70,23" fill="#fef08a" />
        <Line x1="72" y1="20" x2="70" y2="24" stroke="#f59e0b" strokeWidth="0.8" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="two_wheeler" size={28} color="#0f172a" />
      </View>
    );
  }
}

// ==========================================
// 2. REALISTIC AUTO-RICKSHAW
// ==========================================
export function AutoGraphic({ width = 68, height = 40 }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id="autoRoofGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fde047" />
            <Stop offset="100%" stopColor="#eab308" />
          </LinearGradient>
          <LinearGradient id="autoBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#15803d" />
            <Stop offset="100%" stopColor="#166534" />
          </LinearGradient>
        </Defs>

        {/* REAR WHEEL */}
        <Circle cx="24" cy="38" r="9.5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="24" cy="38" r="6" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="24" cy="38" r="2.5" fill="#94a3b8" />

        {/* FRONT WHEEL */}
        <Circle cx="76" cy="38" r="8.5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="76" cy="38" r="5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="76" cy="38" r="2" fill="#94a3b8" />

        {/* CHASSIS & FLOOR PAN */}
        <Rect x="20" y="36" width="56" height="4" rx="1.5" fill="#0f172a" />

        {/* PASSENGER CABIN INTERIOR BACKDROP */}
        <Path d="M18 16L34 16L48 16L54 28L18 28Z" fill="#334155" />
        <Rect x="20" y="24" width="10" height="7" rx="1.5" fill="#78350f" />
        <Rect x="18" y="18" width="3" height="12" rx="1" fill="#92400e" />
        <Rect x="44" y="25" width="8" height="6" rx="1.5" fill="#1e293b" />
        <Line x1="68" y1="28" x2="62" y2="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <Line x1="60" y1="20" x2="64" y2="19" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

        {/* ICONIC CURVED CANVAS/FRP ROOF */}
        <Path
          d="M14 20C14 13 18 8 28 8H62C68 8 72 10 74 15L75 16C72 17 68 17 62 17H18C15 17 14 18.5 14 20Z"
          fill="url(#autoRoofGrad)"
          stroke="#ca8a04"
          strokeWidth="1"
        />
        <Path d="M26 8C26 12 28 17 28 17" stroke="#ca8a04" strokeWidth="1" />
        <Path d="M44 8C44 12 46 17 46 17" stroke="#ca8a04" strokeWidth="1" />

        {/* WINDSHIELD FRAME & GLASS */}
        <Path d="M74 15L79 28H66L63 17L74 15Z" fill="#38bdf8" fillOpacity="0.75" stroke="#0f172a" strokeWidth="1.2" />
        <Line x1="72" y1="27" x2="75" y2="20" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />

        {/* LOWER GREEN BODYWORK */}
        <Path
          d="M14 22H32C33 22 34 23 34 24V28C34 29 35 30 36 30H52C53 30 54 29 54 28V26C54 25 55 24 56 24H66L72 29L79 30C81 30 82 32 80 34L76 36H16C14 36 13 34 13 32L14 22Z"
          fill="url(#autoBodyGrad)"
          stroke="#14532d"
          strokeWidth="1.2"
        />

        {/* YELLOW MID-STRIPE */}
        <Path d="M13 28H34" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M54 28H68" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />

        {/* OPEN DOOR APERTURE OUTLINE */}
        <Path d="M34 17V28H54V17" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />

        {/* FRONT MUDGUARD & FORK */}
        <Path d="M72 32C72 29 78 29 82 34" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="76" y1="38" x2="74" y2="29" stroke="#94a3b8" strokeWidth="2" />

        {/* REAR WHEEL ARCH */}
        <Path d="M14 36C14 30 34 30 34 36" stroke="#0f172a" strokeWidth="2" fill="none" />
        <Rect x="12" y="34" width="3" height="5" fill="#0f172a" />

        {/* FRONT CHROME HEADLAMP WITH AMBER LIGHT */}
        <Circle cx="81" cy="30" r="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
        <Circle cx="81.5" cy="30" r="2" fill="#fef08a" />

        {/* REAR RED TAILLIGHT */}
        <Rect x="12" y="24" width="2" height="4" rx="0.5" fill="#ef4444" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="local_taxi" size={28} color="#15803d" />
      </View>
    );
  }
}

// ==========================================
// 3. REALISTIC SHARED AUTO / E-RICKSHAW
// ==========================================
export function SharedAutoGraphic({ width = 68, height = 40 }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id="sharedCanopyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0f766e" />
            <Stop offset="100%" stopColor="#115e59" />
          </LinearGradient>
        </Defs>

        {/* REAR WHEEL */}
        <Circle cx="22" cy="38" r="9" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="22" cy="38" r="5.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="22" cy="38" r="2" fill="#94a3b8" />

        {/* FRONT WHEEL */}
        <Circle cx="78" cy="38" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="78" cy="38" r="5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
        <Circle cx="78" cy="38" r="2" fill="#94a3b8" />

        {/* CHASSIS & BATTERY PACK ENCLOSURE */}
        <Rect x="16" y="36" width="62" height="4" rx="1" fill="#0f172a" />
        <Rect x="30" y="37" width="28" height="2" rx="0.5" fill="#10b981" />

        {/* HIGH ROOF PASSENGER CANOPY */}
        <Rect x="12" y="8" width="58" height="5" rx="2.5" fill="url(#sharedCanopyGrad)" stroke="#134e4a" strokeWidth="1" />
        <Line x1="16" y1="6.5" x2="66" y2="6.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="22" y1="6.5" x2="22" y2="8" stroke="#94a3b8" strokeWidth="1.2" />
        <Line x1="40" y1="6.5" x2="40" y2="8" stroke="#94a3b8" strokeWidth="1.2" />
        <Line x1="58" y1="6.5" x2="58" y2="8" stroke="#94a3b8" strokeWidth="1.2" />

        {/* 4 STRUCTURAL TUBULAR PILLARS */}
        <Line x1="15" y1="13" x2="15" y2="36" stroke="#0f766e" strokeWidth="2.5" />
        <Line x1="33" y1="13" x2="33" y2="36" stroke="#0f766e" strokeWidth="2" />
        <Line x1="51" y1="13" x2="51" y2="36" stroke="#0f766e" strokeWidth="2" />
        <Line x1="68" y1="13" x2="71" y2="28" stroke="#0f766e" strokeWidth="2.5" />

        {/* DUAL PASSENGER BENCH SEATING */}
        <Rect x="18" y="24" width="10" height="6" rx="1.5" fill="#0d9488" />
        <Rect x="17" y="17" width="3" height="9" rx="1" fill="#115e59" />
        <Rect x="36" y="24" width="10" height="6" rx="1.5" fill="#0d9488" />
        <Rect x="44" y="17" width="3" height="9" rx="1" fill="#115e59" />

        {/* DRIVER CONSOLE & STEERING */}
        <Rect x="54" y="25" width="8" height="6" rx="1.5" fill="#1e293b" />
        <Line x1="70" y1="28" x2="65" y2="20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

        {/* FRONT GLASS WINDSHIELD & NOSE */}
        <Path d="M68 13L78 26H69L67 15L68 13Z" fill="#38bdf8" fillOpacity="0.75" />
        <Path d="M69 26L80 27C82 28 83 31 81 33L77 36H68L69 26Z" fill="#0f766e" stroke="#134e4a" strokeWidth="1" />

        {/* FRONT HEADLIGHT */}
        <Circle cx="82" cy="30" r="2.5" fill="#fef08a" stroke="#cbd5e1" strokeWidth="0.8" />
        <Rect x="13" y="26" width="2" height="4" fill="#ef4444" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="electric_rickshaw" size={28} color="#0d9488" />
      </View>
    );
  }
}

// ==========================================
// 4. REALISTIC CAB / COMPACT CAR
// ==========================================
export function CabGraphic({
  width = 68,
  height = 40,
  gradId = 'cabBodyGrad',
  bodyGradient = null,
  strokeColor = null,
  showTaxiSign = true,
}) {
  const stops = bodyGradient || ['#fef08a', '#facc15', '#eab308'];
  const stroke = strokeColor || (bodyGradient ? '#475569' : '#ca8a04');

  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={stops[0]} />
            <Stop offset="50%" stopColor={stops[1]} />
            <Stop offset="100%" stopColor={stops[2]} />
          </LinearGradient>
          <LinearGradient id={`${gradId}Window`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7dd3fc" />
            <Stop offset="100%" stopColor="#0284c7" />
          </LinearGradient>
        </Defs>

        {/* REAR WHEEL */}
        <Circle cx="25" cy="38" r="9.5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="25" cy="38" r="6.5" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
        <Circle cx="25" cy="38" r="2.5" fill="#cbd5e1" />
        <Line x1="25" y1="31.5" x2="25" y2="34.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="25" y1="41.5" x2="25" y2="44.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="18.5" y1="38" x2="21.5" y2="38" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="28.5" y1="38" x2="31.5" y2="38" stroke="#e2e8f0" strokeWidth="1.2" />

        {/* FRONT WHEEL */}
        <Circle cx="71" cy="38" r="9.5" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <Circle cx="71" cy="38" r="6.5" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
        <Circle cx="71" cy="38" r="2.5" fill="#cbd5e1" />
        <Line x1="71" y1="31.5" x2="71" y2="34.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="71" y1="41.5" x2="71" y2="44.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="64.5" y1="38" x2="67.5" y2="38" stroke="#e2e8f0" strokeWidth="1.2" />
        <Line x1="74.5" y1="38" x2="77.5" y2="38" stroke="#e2e8f0" strokeWidth="1.2" />

        {/* UNDERBODY & WHEEL ARCHES */}
        <Path
          d="M12 38H15C15 31 35 31 35 38H61C61 31 81 31 81 38H85"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* CAR LOWER & UPPER BODY SILHOUETTE */}
        <Path
          d="M12 37L10 33C9.5 30 11 27 14 26L21 24L31 15C34 12 39 11 44 11H60C64 11 67 13 70 16L78 24L83 25C86 26 88 28 87 31L86 37H79C78 33 75 30 71 30C67 30 64 33 63 37H33C32 33 29 30 25 30C21 30 18 33 17 37H12Z"
          fill={`url(#${gradId})`}
          stroke={stroke}
          strokeWidth={1.5}
        />

        {/* CAB / TAXI ROOF SIGN */}
        {showTaxiSign && (
          <>
            <Path d="M46 11L48 7H56L58 11Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <Line x1="50" y1="9" x2="54" y2="9" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
          </>
        )}

        {/* TINTED WINDOWS */}
        <Path
          d="M32 16L24 23H44V15H42C38 15 34 15 32 16Z"
          fill={`url(#${gradId}Window)`}
          fillOpacity={0.85}
        />
        <Path
          d="M48 15V23H73L67 16C65 14 62 13.5 59 14L48 15Z"
          fill={`url(#${gradId}Window)`}
          fillOpacity={0.85}
        />
        <Line x1="46" y1="13" x2="46" y2="24" stroke="#1e293b" strokeWidth="3" />

        {/* SIDE VIEW MIRROR */}
        <Path d="M68 22L73 22C74 22 75 23.5 74 24.5L71 25L68 24Z" fill="#1e293b" />

        {/* DOOR LINES & HANDLES */}
        <Line x1="46" y1="24" x2="46" y2="35" stroke="#94a3b8" strokeWidth="1" />
        <Line x1="28" y1="24" x2="28" y2="35" stroke="#94a3b8" strokeWidth="1" />
        <Rect x="38" y="25.5" width="4" height="1.2" rx="0.6" fill="#475569" />
        <Rect x="54" y="25.5" width="4" height="1.2" rx="0.6" fill="#475569" />

        {/* FRONT LED HEADLIGHT */}
        <Path d="M78 25L86 28C86 29 85 31 82 31L78 30Z" fill="#fef08a" stroke="#f59e0b" strokeWidth="0.8" />
        <Path d="M11 28L15 27V32L11 31Z" fill="#ef4444" />

        {/* BUMPER ACCENTS */}
        <Line x1="82" y1="34" x2="86" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
        <Line x1="10" y1="34" x2="14" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="local_taxi" size={28} color="#eab308" />
      </View>
    );
  }
}

export function CarGraphic({ width = 68, height = 40, color = '#ef4444' }) {
  return (
    <CabGraphic
      width={width}
      height={height}
      gradId="carRedGrad"
      bodyGradient={['#f87171', color || '#dc2626', '#991b1b']}
      strokeColor="#991b1b"
      showTaxiSign={false}
    />
  );
}

// ==========================================
// 5. REALISTIC EXECUTIVE SEDAN
// ==========================================
export function SedanGraphic({ width = 72, height = 40 }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id="sedanBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#334155" />
            <Stop offset="50%" stopColor="#1e293b" />
            <Stop offset="100%" stopColor="#0f172a" />
          </LinearGradient>
          <LinearGradient id="sedanGlassGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#bae6fd" />
            <Stop offset="100%" stopColor="#0284c7" />
          </LinearGradient>
        </Defs>

        {/* REAR WHEEL */}
        <Circle cx="23" cy="38" r="9.5" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <Circle cx="23" cy="38" r="6.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
        <Circle cx="23" cy="38" r="2.5" fill="#cbd5e1" />
        <Line x1="23" y1="32" x2="23" y2="35" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="23" y1="41" x2="23" y2="44" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="17" y1="38" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="26" y1="38" x2="29" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* FRONT WHEEL */}
        <Circle cx="73" cy="38" r="9.5" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <Circle cx="73" cy="38" r="6.5" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
        <Circle cx="73" cy="38" r="2.5" fill="#cbd5e1" />
        <Line x1="73" y1="32" x2="73" y2="35" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="73" y1="41" x2="73" y2="44" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="67" y1="38" x2="70" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />
        <Line x1="76" y1="38" x2="79" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* UNDERBODY */}
        <Path
          d="M8 38H13C13 31 33 31 33 38H63C63 31 83 31 83 38H88"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ELONGATED 3-BOX EXECUTIVE SEDAN PROFILE */}
        <Path
          d="M8 37L7 32C6.5 29 8 27 11 26L18 26L28 16C31 13 36 12 41 12H58C62 12 66 14 69 17L77 25L84 26C87 27 89 29 89 32L88 37H81C80 33 77 30 73 30C69 30 66 33 65 37H31C30 33 27 30 23 30C19 30 16 33 15 37H8Z"
          fill="url(#sedanBodyGrad)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* CHROME ACCENT WINDOW OUTLINE */}
        <Path
          d="M27 17C29 14.5 33 13.5 37 13.5H59C62 13.5 65 14.5 68 17.5L74 24H21L27 17Z"
          stroke="#cbd5e1"
          strokeWidth="0.8"
          fill="none"
        />

        {/* 3-PANE TINTED WINDOWS */}
        <Path d="M28 17L21 24H45V14H40C35 14 31 15 28 17Z" fill="url(#sedanGlassGrad)" fillOpacity="0.8" />
        <Path d="M49 14V24H73L67 17C65 15 62 14.5 59 14.5L49 14Z" fill="url(#sedanGlassGrad)" fillOpacity="0.8" />
        <Line x1="47" y1="13.5" x2="47" y2="24" stroke="#0f172a" strokeWidth="3" />

        {/* SLEEK AERODYNAMIC MIRROR */}
        <Path d="M68 23L73 23C74 23 75 24 74 25L70 25.5L68 24.5Z" fill="#334155" stroke="#64748b" strokeWidth="0.5" />

        {/* CRISP HORIZONTAL SHOULDER CREASE */}
        <Path d="M12 26.5H84" stroke="#475569" strokeWidth="0.8" strokeLinecap="round" />

        {/* FLUSH DOOR HANDLES */}
        <Rect x="39" y="27.5" width="4" height="1" rx="0.5" fill="#cbd5e1" />
        <Rect x="56" y="27.5" width="4" height="1" rx="0.5" fill="#cbd5e1" />

        {/* MATRIX LED HEADLIGHT */}
        <Polygon points="78,25 87,27 85,29 78,29" fill="#fef08a" stroke="#eab308" strokeWidth="0.6" />

        {/* WRAP-AROUND RED LED TAIL LIGHT */}
        <Polygon points="9,27 14,27 14,30 9,30" fill="#ef4444" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="directions_car" size={28} color="#1e293b" />
      </View>
    );
  }
}

// ==========================================
// 6. REALISTIC SUV
// ==========================================
export function SuvGraphic({ width = 72, height = 42 }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 96 52" fill="none">
        <Defs>
          <LinearGradient id="suvBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1e293b" />
            <Stop offset="50%" stopColor="#0f172a" />
            <Stop offset="100%" stopColor="#020617" />
          </LinearGradient>
          <LinearGradient id="suvGlassGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#38bdf8" />
            <Stop offset="100%" stopColor="#0369a1" />
          </LinearGradient>
        </Defs>

        {/* RUGGED REAR WHEEL */}
        <Circle cx="24" cy="38" r="10.5" fill="#020617" stroke="#334155" strokeWidth="2.5" />
        <Circle cx="24" cy="38" r="6.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <Circle cx="24" cy="38" r="2.5" fill="#94a3b8" />
        <Circle cx="24" cy="34" r="1" fill="#cbd5e1" />
        <Circle cx="24" cy="42" r="1" fill="#cbd5e1" />
        <Circle cx="20" cy="38" r="1" fill="#cbd5e1" />
        <Circle cx="28" cy="38" r="1" fill="#cbd5e1" />

        {/* RUGGED FRONT WHEEL */}
        <Circle cx="72" cy="38" r="10.5" fill="#020617" stroke="#334155" strokeWidth="2.5" />
        <Circle cx="72" cy="38" r="6.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <Circle cx="72" cy="38" r="2.5" fill="#94a3b8" />
        <Circle cx="72" cy="34" r="1" fill="#cbd5e1" />
        <Circle cx="72" cy="42" r="1" fill="#cbd5e1" />
        <Circle cx="68" cy="38" r="1" fill="#cbd5e1" />
        <Circle cx="76" cy="38" r="1" fill="#cbd5e1" />

        {/* ROOF RAILS (RUGGED SUV ROOF BARS) */}
        <Line x1="28" y1="7.5" x2="62" y2="7.5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <Line x1="32" y1="7.5" x2="32" y2="9.5" stroke="#94a3b8" strokeWidth="1.5" />
        <Line x1="46" y1="7.5" x2="46" y2="9.5" stroke="#94a3b8" strokeWidth="1.5" />
        <Line x1="58" y1="7.5" x2="58" y2="9.5" stroke="#94a3b8" strokeWidth="1.5" />

        {/* UNDERBODY & HIGH-CLEARANCE ROCK RAILS */}
        <Path
          d="M10 38H13C13 30 35 30 35 38H61C61 30 83 30 83 38H86"
          stroke="#020617"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Rect x="37" y="37" width="22" height="2" rx="1" fill="#64748b" />

        {/* BOLD TALL SUV BODY */}
        <Path
          d="M10 37L9 26C8.5 24 10 21 13 21L20 20L25 10C26.5 9 29 8.5 32 8.5H62C65 8.5 68 10 70 13L76 21L82 22C85 23 87 25 87 28L86 37H81C80 32 76 29 72 29C68 29 64 32 63 37H33C32 32 28 29 24 29C20 29 16 32 15 37H10Z"
          fill="url(#suvBodyGrad)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* LARGE PRIVACY TINTED SUV WINDOWS */}
        <Path d="M21 20L25 11H34V20H21Z" fill="url(#suvGlassGrad)" fillOpacity="0.85" />
        <Rect x="37" y="11" width="13" height="9" fill="url(#suvGlassGrad)" fillOpacity="0.85" />
        <Path d="M53 11H61C63 11 65 12 67 14L71 20H53V11Z" fill="url(#suvGlassGrad)" fillOpacity="0.85" />

        {/* PILLARS */}
        <Line x1="35.5" y1="10" x2="35.5" y2="20" stroke="#0f172a" strokeWidth="2.5" />
        <Line x1="51.5" y1="10" x2="51.5" y2="20" stroke="#0f172a" strokeWidth="2.5" />

        {/* BOLD CHUNKY SIDE MIRROR */}
        <Rect x="67" y="19" width="6" height="4" rx="1.5" fill="#334155" stroke="#475569" strokeWidth="0.8" />

        {/* DOOR HANDLES */}
        <Rect x="42" y="23" width="4.5" height="1.5" rx="0.7" fill="#64748b" />
        <Rect x="58" y="23" width="4.5" height="1.5" rx="0.7" fill="#64748b" />

        {/* AGGRESSIVE LED PROJECTOR HEADLIGHTS */}
        <Polygon points="76,21 85,23 85,27 77,26" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
        <Rect x="82" y="34" width="4" height="2" rx="0.5" fill="#cbd5e1" />

        {/* REAR LED LIGHT & SPOILER */}
        <Path d="M19 10H23" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <Polygon points="9,23 13,23 13,28 9,28" fill="#ef4444" />
      </Svg>
    );
  } catch (e) {
    return (
      <View style={[styles.fallbackGraphic, { width, height }]}>
        <Icon name="directions_car" size={28} color="#020617" />
      </View>
    );
  }
}

// ==========================================
// 7. GENERIC DISPATCHER COMPONENT
// ==========================================
export function VehicleIcon({ type = 'Bike', width = 68, height = 40, color }) {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('bike') || normalized.includes('moto') || normalized.includes('two_wheeler')) {
    return <BikeGraphic width={width} height={height} color={color} />;
  }
  if (normalized.includes('shared')) {
    return <SharedAutoGraphic width={width} height={height} />;
  }
  if (normalized.includes('auto') || normalized.includes('rickshaw')) {
    return <AutoGraphic width={width} height={height} />;
  }
  if (normalized.includes('sedan') || normalized.includes('prime') || normalized.includes('comfort')) {
    return <SedanGraphic width={width} height={height} />;
  }
  if (normalized.includes('suv') || normalized.includes('xl') || normalized.includes('max')) {
    return <SuvGraphic width={width} height={height} />;
  }
  return <CabGraphic width={width} height={height} />;
}

export function SunburstGraphic({ size = 100, color = "#f97316" }) {
  if (!Svg || !Circle || !Path) return null;
  try {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Circle cx="50" cy="50" r="16" fill={color} />
        <Path d="M50 0L54 22H46L50 0Z" fill={color} />
        <Path d="M50 100L46 78H54L50 100Z" fill={color} />
        <Path d="M0 50L22 46V54L0 50Z" fill={color} />
        <Path d="M100 50L78 54V46L100 50Z" fill={color} />
        <Path d="M14.64 14.64L32.22 26.36L26.36 32.22L14.64 14.64Z" fill={color} />
        <Path d="M85.36 85.36L67.78 73.64L73.64 67.78L85.36 85.36Z" fill={color} />
        <Path d="M14.64 85.36L26.36 67.78L32.22 73.64L14.64 85.36Z" fill={color} />
        <Path d="M85.36 14.64L73.64 32.22L67.78 26.36L85.36 14.64Z" fill={color} />
      </Svg>
    );
  } catch {
    return null;
  }
}

export function GoogleLogo({ size = 20 }) {
  if (Svg && Path) {
    try {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </Svg>
      );
    } catch {}
  }
  return <Text style={{ fontSize: size * 0.8, fontWeight: '900', color: '#4285F4' }}>G</Text>;
}

export function FacebookLogo({ size = 20 }) {
  if (Svg && Path) {
    try {
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
          <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </Svg>
      );
    } catch {}
  }
  return <Text style={{ fontSize: size * 0.8, fontWeight: '900', color: '#1877F2' }}>f</Text>;
}

export function WaveBottom({ width = 360, height = 64, color = "#ffffff" }) {
  if (Svg && Path) {
    try {
      return (
        <Svg width={width} height={height} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <Path d="M0,48 C300,105 720,8 1180,16 C1320,19 1400,32 1440,42 L1440,120 L0,120 Z" fill={color} />
        </Svg>
      );
    } catch (e) {}
  }

  // Exact S-curve wave matching reference image:
  // 1. Left dip (under car door / lady)
  // 2. Center-right wide upward sweeping crest (over car roof)
  return (
    <View style={{ width, height, overflow: 'hidden', position: 'relative' }}>
      {/* Left dip curve: dips down on the left */}
      <View
        style={{
          position: 'absolute',
          bottom: -height * 1.5,
          left: -width * 0.18,
          width: width * 0.72,
          height: height * 2.8,
          borderRadius: width * 0.36,
          backgroundColor: color,
          transform: [{ rotate: '-10deg' }],
        }}
      />
      {/* Right high sweeping crest: climbs up high on the right */}
      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.65,
          left: width * 0.2,
          width: width * 0.98,
          height: height * 2.0,
          borderRadius: width * 0.49,
          backgroundColor: color,
          transform: [{ rotate: '5deg' }],
        }}
      />
      {/* Solid bottom base */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.3,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// ==========================================
// 8. COLORFUL LOCAL SVG PLACE ICONS
// ==========================================
export function LandmarkVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="landmarkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#fbbf24" />
          <Stop offset="100%" stopColor="#d97706" />
        </LinearGradient>
      </Defs>
      <Path d="M16 3L4 9V11H28V9L16 3Z" fill="url(#landmarkGrad)" />
      <Rect x="6" y="12" width="3.5" height="12" rx="1" fill="#f59e0b" />
      <Rect x="12" y="12" width="3.5" height="12" rx="1" fill="#f59e0b" />
      <Rect x="17.5" y="12" width="3.5" height="12" rx="1" fill="#f59e0b" />
      <Rect x="23" y="12" width="3.5" height="12" rx="1" fill="#f59e0b" />
      <Rect x="3" y="24.5" width="26.5" height="4.5" rx="1.5" fill="#b45309" />
      <Circle cx="16" cy="7" r="1.5" fill="#fef3c7" />
    </Svg>
  );
}

export function StationVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#3b82f6" />
          <Stop offset="100%" stopColor="#1d4ed8" />
        </LinearGradient>
      </Defs>
      <Rect x="6" y="4" width="20" height="21" rx="4" fill="url(#trainGrad)" />
      <Rect x="9" y="7" width="14" height="7" rx="2" fill="#bae6fd" />
      <Circle cx="10.5" cy="19.5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
      <Circle cx="21.5" cy="19.5" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
      <Rect x="13" y="18" width="6" height="3" rx="1" fill="#0f172a" />
      <Line x1="7" y1="27" x2="11" y2="30" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="25" y1="27" x2="21" y2="30" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="4" y1="30" x2="28" y2="30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function AirportVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="100%" stopColor="#0284c7" />
        </LinearGradient>
      </Defs>
      <Path
        d="M16 2L13 12H3L7 17H13V24L10 27V29L16 27.5L22 29V27L19 24V17H25L29 12H19L16 2Z"
        fill="url(#planeGrad)"
        stroke="#0369a1"
        strokeWidth="0.8"
      />
      <Circle cx="16" cy="6" r="1.2" fill="#e0f2fe" />
    </Svg>
  );
}

export function ParkVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#34d399" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
      </Defs>
      <Rect x="14" y="20" width="4" height="9" rx="1" fill="#78350f" />
      <Path
        d="M16 3C10.5 3 7 7.5 7 12C7 16 10 18.5 13 20H19C22 18.5 25 16 25 12C25 7.5 21.5 3 16 3Z"
        fill="url(#treeGrad)"
      />
      <Circle cx="12" cy="10" r="3.5" fill="#6ee7b7" fillOpacity="0.4" />
      <Circle cx="19" cy="11" r="4" fill="#6ee7b7" fillOpacity="0.3" />
      <Path d="M5 29C11 27 21 27 27 29" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function RestaurantVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="restGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#fb923c" />
          <Stop offset="100%" stopColor="#ea580c" />
        </LinearGradient>
      </Defs>
      <Circle cx="16" cy="16" r="13" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1.5" />
      <Path d="M7 17C7 10 12 7 16 7C20 7 25 10 25 17H7Z" fill="url(#restGrad)" />
      <Circle cx="16" cy="5" r="2" fill="#ea580c" />
      <Rect x="5" y="18" width="22" height="3" rx="1.5" fill="#c2410c" />
      <Path d="M10 23C13 25 19 25 22 23" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function MallVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="mallGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c084fc" />
          <Stop offset="100%" stopColor="#7e22ce" />
        </LinearGradient>
      </Defs>
      <Path d="M7 10L5 27H27L25 10H7Z" fill="url(#mallGrad)" rx="2" />
      <Path d="M11 11V7C11 4.5 13 3 16 3C19 3 21 4.5 21 7V11" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M16 15V22" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" />
      <Path d="M12.5 18.5H19.5" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function HospitalVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="hospGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#f87171" />
          <Stop offset="100%" stopColor="#dc2626" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="24" height="24" rx="6" fill="url(#hospGrad)" stroke="#b91c1c" strokeWidth="1.2" />
      <Rect x="13.5" y="8" width="5" height="16" rx="1.5" fill="#ffffff" />
      <Rect x="8" y="13.5" width="16" height="5" rx="1.5" fill="#ffffff" />
    </Svg>
  );
}

export function CollegeVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="collegeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#60a5fa" />
          <Stop offset="100%" stopColor="#1d4ed8" />
        </LinearGradient>
      </Defs>
      <Path d="M16 4L2 11L16 18L30 11L16 4Z" fill="url(#collegeGrad)" />
      <Path d="M7 14.5V22C7 25 11 27 16 27C21 27 25 25 25 22V14.5" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="28" y1="12" x2="28" y2="22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="28" cy="22" r="1.5" fill="#f59e0b" />
    </Svg>
  );
}

export function PlaceVectorIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Defs>
        <LinearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#06b6d4" />
          <Stop offset="100%" stopColor="#0e7490" />
        </LinearGradient>
      </Defs>
      <Path
        d="M16 2C10.5 2 6 6.5 6 12C6 19.5 16 30 16 30C16 30 26 19.5 26 12C26 6.5 21.5 2 16 2Z"
        fill="url(#pinGrad)"
      />
      <Circle cx="16" cy="12" r="4.5" fill="#ffffff" />
    </Svg>
  );
}

// Master Category to Vector Icon Mapper
export function CategoryPlaceVectorIcon({ category = 'place', size = 26 }) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('rail') || cat.includes('train') || cat.includes('station') || cat.includes('metro') || cat.includes('bus')) {
    return <StationVectorIcon size={size} />;
  }
  if (cat.includes('air') || cat.includes('flight') || cat.includes('plane') || cat.includes('terminal')) {
    return <AirportVectorIcon size={size} />;
  }
  if (cat.includes('hosp') || cat.includes('medic') || cat.includes('clinic') || cat.includes('health') || cat.includes('doctor')) {
    return <HospitalVectorIcon size={size} />;
  }
  if (cat.includes('college') || cat.includes('univ') || cat.includes('school') || cat.includes('educat') || cat.includes('campus') || cat.includes('institute')) {
    return <CollegeVectorIcon size={size} />;
  }
  if (cat.includes('mall') || cat.includes('shop') || cat.includes('market') || cat.includes('store') || cat.includes('bazaar')) {
    return <MallVectorIcon size={size} />;
  }
  if (cat.includes('park') || cat.includes('garden') || cat.includes('nature') || cat.includes('lake') || cat.includes('forest') || cat.includes('recreation')) {
    return <ParkVectorIcon size={size} />;
  }
  if (cat.includes('rest') || cat.includes('food') || cat.includes('cafe') || cat.includes('dine') || cat.includes('hotel') || cat.includes('dhaba') || cat.includes('bakery')) {
    return <RestaurantVectorIcon size={size} />;
  }
  if (cat.includes('land') || cat.includes('monu') || cat.includes('temple') || cat.includes('herit') || cat.includes('fort') || cat.includes('palace') || cat.includes('tour') || cat.includes('museum') || cat.includes('masjid') || cat.includes('church') || cat.includes('gurudwara')) {
    return <LandmarkVectorIcon size={size} />;
  }
  return <PlaceVectorIcon size={size} />;
}

// Export VEHICLE_CATEGORIES alias for total backward compatibility
export const VEHICLE_CATEGORIES = [
  { id: 'bike', name: 'Bike', renderGraphic: (w, h) => <BikeGraphic width={w} height={h} /> },
  { id: 'auto', name: 'Auto', renderGraphic: (w, h) => <AutoGraphic width={w} height={h} /> },
  { id: 'car', name: 'Car', renderGraphic: (w, h) => <CarGraphic width={w} height={h} color="#ef4444" /> },
  { id: 'cab', name: 'Cab', renderGraphic: (w, h) => <CabGraphic width={w} height={h} /> },
  { id: 'suv', name: 'SUV', renderGraphic: (w, h) => <SuvGraphic width={w} height={h} /> },
];

// ==========================================
// 12. ENHANCED INDIAN HERITAGE DOODLE GRAPHIC (#goRapidRide)
// ==========================================
export function IndiaHeritageDoodleGraphic({ width = 390, height = 320 }) {
  try {
    return (
      <Svg width={width} height={height} viewBox="0 0 420 340" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* WINDING ROAD / NAVIGATION ROUTE */}
        <Path
          d="M-20 130 C80 90 140 170 240 120 C340 80 370 160 440 130"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
        <Path
          d="M-20 160 C70 130 160 210 260 160 C330 130 380 200 440 180"
          stroke="#f1f5f9"
          strokeWidth="2"
        />

        {/* --- 1. LOTUS TEMPLE SILHOUETTE (Top-Left) --- */}
        <G opacity={0.45}>
          <Path d="M40 70 C55 35 75 35 90 70" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M55 70 C65 46 80 46 90 70" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Path d="M35 70 C48 48 60 48 70 70" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Path d="M72 70 C82 48 95 48 108 70" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Top-Left Car Silhouette */}
          <Path d="M110 70 L118 52 H148 L158 70 H110Z" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Rect x="105" y="70" width="60" height="14" rx="3" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Circle cx="118" cy="84" r="5.5" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Circle cx="152" cy="84" r="5.5" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
        </G>

        {/* --- 2. TRAFFIC LIGHT (Top-Center) --- */}
        <G opacity={0.4}>
          <Rect x="240" y="32" width="16" height="38" rx="4" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Line x1="248" y1="70" x2="248" y2="105" stroke="#94a3b8" strokeWidth="1.3" />
          <Circle cx="248" cy="42" r="3.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Circle cx="248" cy="51" r="3.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Circle cx="248" cy="60" r="3.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
        </G>

        {/* --- 3. AUTO RICKSHAW (Top-Right) --- */}
        <G opacity={0.45}>
          <Path d="M275 42 H315 L328 68 H268 L275 42 Z" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Rect x="264" y="68" width="68" height="24" rx="3" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Circle cx="276" cy="92" r="7" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Circle cx="318" cy="92" r="7" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M304 48 L320 68" stroke="#94a3b8" strokeWidth="1.2" />
          <Rect x="282" y="72" width="18" height="14" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
        </G>

        {/* --- 4. CAPTAIN WITH SMARTPHONE & GPS (Far Top-Right) --- */}
        <G opacity={0.4}>
          {/* Captain Standing */}
          <Circle cx="376" cy="40" r="5" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M371 45 H381 V65 H371 Z" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Line x1="373" y1="65" x2="373" y2="88" stroke="#94a3b8" strokeWidth="1.3" />
          <Line x1="379" y1="65" x2="379" y2="88" stroke="#94a3b8" strokeWidth="1.3" />
          <Line x1="371" y1="50" x2="363" y2="58" stroke="#94a3b8" strokeWidth="1.3" />
          <Rect x="360" y="54" width="6" height="10" rx="1" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Top GPS Pin */}
          <Path d="M360 22 C355 17 355 10 360 5 C365 10 365 17 360 22 Z" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Circle cx="360" cy="11" r="2.5" stroke="#94a3b8" strokeWidth="1" fill="none" />
        </G>

        {/* --- 5. TAJ MAHAL SILHOUETTE (Left-Center) --- */}
        <G opacity={0.38}>
          <Path d="M125 120 C125 90 155 90 155 120 Z" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Line x1="140" y1="90" x2="140" y2="82" stroke="#94a3b8" strokeWidth="1.3" />
          <Circle cx="140" cy="81" r="2" fill="#94a3b8" />
          <Rect x="115" y="120" width="50" height="34" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M132 154 V134 C132 128 148 128 148 134 V154" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Minarets */}
          <Line x1="105" y1="154" x2="105" y2="98" stroke="#94a3b8" strokeWidth="1.4" />
          <Path d="M102 98 H108 L105 92 Z" fill="#94a3b8" />
          <Line x1="175" y1="154" x2="175" y2="98" stroke="#94a3b8" strokeWidth="1.4" />
          <Path d="M172 98 H178 L175 92 Z" fill="#94a3b8" />
        </G>

        {/* --- 6. MOTORCYCLE & RIDER (Left) --- */}
        <G opacity={0.48}>
          <Circle cx="35" cy="185" r="14" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
          <Circle cx="35" cy="185" r="5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Circle cx="88" cy="185" r="14" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
          <Circle cx="88" cy="185" r="5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Chassis */}
          <Path d="M35 185 L50 162 H72 L88 185" stroke="#94a3b8" strokeWidth="1.8" fill="none" />
          <Path d="M50 162 L55 142 H76 L82 162" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
          <Line x1="88" y1="185" x2="74" y2="135" stroke="#94a3b8" strokeWidth="1.8" />
          <Line x1="74" y1="135" x2="68" y2="135" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* Rider with Helmet */}
          <Circle cx="50" cy="115" r="8" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
          <Path d="M44 116 C44 110 56 110 56 116" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M50 123 L48 144 L60 146" stroke="#94a3b8" strokeWidth="1.6" fill="none" />
          <Line x1="50" y1="130" x2="70" y2="137" stroke="#94a3b8" strokeWidth="1.6" />
          <Line x1="48" y1="144" x2="42" y2="168" stroke="#94a3b8" strokeWidth="1.6" />
        </G>

        {/* --- 7. HAND HOLDING SMARTPHONE WITH ROUTE (Center) --- */}
        <G opacity={0.42}>
          <Rect x="202" y="105" width="28" height="50" rx="5" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Line x1="210" y1="112" x2="222" y2="112" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Route path on phone screen */}
          <Path d="M210 142 L216 130 L224 124" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <Circle cx="224" cy="124" r="2" fill="#94a3b8" />
          {/* Hand fingers grasping phone */}
          <Path d="M198 122 C194 122 194 128 198 128 H202" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M198 130 C194 130 194 136 198 136 H202" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M198 138 C194 138 194 144 198 144 H202" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Path d="M228 140 C234 140 234 150 228 152" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
        </G>

        {/* --- 8. SMART BIKER HELMET (Center-Right) --- */}
        <G opacity={0.38}>
          <Circle cx="225" cy="205" r="18" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Path d="M210 205 C210 192 235 192 240 205 H210Z" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M215 210 H235" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        </G>

        {/* --- 9. QUTUB MINAR & MONUMENTS (Right) --- */}
        <G opacity={0.38}>
          {/* Qutub Minar */}
          <Path d="M280 235 L285 160 H291 L296 235 Z" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Line x1="281" y1="215" x2="295" y2="215" stroke="#94a3b8" strokeWidth="1.2" />
          <Line x1="283" y1="195" x2="293" y2="195" stroke="#94a3b8" strokeWidth="1.2" />
          <Line x1="284" y1="175" x2="292" y2="175" stroke="#94a3b8" strokeWidth="1.2" />
          {/* India Gate / Gateway Arch */}
          <Rect x="315" y="145" width="56" height="58" rx="3" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Path d="M331 203 V175 C331 166 355 166 355 175 V203" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Rect x="310" y="140" width="66" height="7" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Line x1="324" y1="154" x2="324" y2="201" stroke="#cbd5e1" strokeWidth="1" />
          <Line x1="362" y1="154" x2="362" y2="201" stroke="#cbd5e1" strokeWidth="1" />
        </G>

        {/* --- 10. FOLDED MAP WITH GPS PIN & SCOOTER (Right-Middle) --- */}
        <G opacity={0.42}>
          {/* Folded Map */}
          <Path d="M285 240 L305 230 L325 242 L345 232 V262 L325 272 L305 260 L285 270 Z" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Line x1="305" y1="230" x2="305" y2="260" stroke="#94a3b8" strokeWidth="1" />
          <Line x1="325" y1="242" x2="325" y2="272" stroke="#94a3b8" strokeWidth="1" />
          {/* GPS Location Pin on map */}
          <Path d="M315 235 C310 228 305 224 305 218 C305 211 312 206 319 206 C326 206 333 211 333 218 C333 224 328 228 323 235 L319 240 Z" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <Circle cx="319" cy="218" r="3.5" fill="#94a3b8" />
          {/* Scooter Silhouette */}
          <Circle cx="365" cy="250" r="7" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Circle cx="390" cy="250" r="7" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M365 250 H378 L384 235 H390" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Line x1="384" y1="235" x2="380" y2="225" stroke="#94a3b8" strokeWidth="1.4" />
        </G>

        {/* --- 11. CHARMINAR / TEMPLE GATES (Center-Bottom) --- */}
        <G opacity={0.35}>
          <Rect x="235" y="275" width="45" height="45" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M248 320 V298 C248 290 266 290 266 298 V320" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Line x1="230" y1="320" x2="230" y2="265" stroke="#94a3b8" strokeWidth="1.5" />
          <Line x1="285" y1="320" x2="285" y2="265" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Parcel Delivery Box */}
          <Rect x="165" y="285" width="28" height="26" rx="2" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M165 292 H193" stroke="#94a3b8" strokeWidth="1" />
          <Line x1="179" y1="285" x2="179" y2="311" stroke="#94a3b8" strokeWidth="1" />
        </G>

        {/* --- 12. MODERN SEDAN CAR & SAFETY LADY (Bottom-Right) --- */}
        <G opacity={0.42}>
          {/* Modern Sedan Car */}
          <Path
            d="M240 325 L270 300 H355 L388 325"
            stroke="#94a3b8"
            strokeWidth="1.6"
            fill="none"
          />
          <Path
            d="M235 325 C230 325 228 332 232 338 H395 C398 332 396 325 390 325 Z"
            stroke="#94a3b8"
            strokeWidth="1.5"
            fill="none"
          />
          <Circle cx="268" cy="336" r="8" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Circle cx="365" cy="336" r="8" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <Path d="M280 305 L262 324 H315 V305 Z" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <Path d="M320 305 V324 H368 L350 305 Z" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Lady with Safety Shield Badge */}
          <Circle cx="376" cy="272" r="6.5" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M370 278 C370 285 365 292 376 295 C387 292 382 285 382 278" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          {/* Shield Badge */}
          <Path d="M344 282 V292 C344 298 352 302 352 302 C352 302 360 298 360 292 V282 L352 278 Z" stroke="#94a3b8" strokeWidth="1.3" fill="none" />
          <Path d="M348 290 L351 293 L356 288" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </G>
      </Svg>
    );
  } catch (e) {
    return null;
  }
}

// ==========================================
// 13. REALISTIC EXPLORE SERVICES SVG ICONS
// ==========================================

// Realistic Modern Cab / City Ride Icon
export function RealisticRideIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="rrRideCabGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="50%" stopColor="#0284c7" />
          <Stop offset="100%" stopColor="#0369a1" />
        </LinearGradient>
        <LinearGradient id="rrRideGlass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#e0f2fe" />
          <Stop offset="100%" stopColor="#7dd3fc" />
        </LinearGradient>
        <LinearGradient id="rrTireGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#334155" />
          <Stop offset="100%" stopColor="#0f172a" />
        </LinearGradient>
      </Defs>
      {/* Ground shadow */}
      <Path d="M6 46C12 43 52 43 58 46C52 48 12 48 6 46Z" fill="#0f172a" fillOpacity="0.12" />
      {/* Wheels */}
      <Circle cx="18" cy="41" r="8" fill="url(#rrTireGrad)" />
      <Circle cx="18" cy="41" r="4.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
      <Circle cx="18" cy="41" r="2" fill="#0f172a" />
      <Circle cx="46" cy="41" r="8" fill="url(#rrTireGrad)" />
      <Circle cx="46" cy="41" r="4.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
      <Circle cx="46" cy="41" r="2" fill="#0f172a" />
      {/* Underbody */}
      <Path d="M10 40H12C12 34 24 34 24 40H40C40 34 52 34 52 40H56V37H10V40Z" fill="#0f172a" />
      {/* Body Frame */}
      <Path
        d="M8 38L6 32C5 28 8 26 12 25L17 24L24 14C26 11 29 10 33 10H43C46 10 49 12 51 15L56 24L59 25C62 26 63 29 62 33L60 38H52C52 34 46 34 46 38H18C18 34 12 34 12 38H8Z"
        fill="url(#rrRideCabGrad)"
      />
      {/* Roof Taxi Light Indicator */}
      <Path d="M30 10L32 6H38L40 10Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      <Line x1="33" y1="8" x2="37" y2="8" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
      {/* Tinted Windows */}
      <Path d="M25 15L19 23H33V13H31C28 13 26 14 25 15Z" fill="url(#rrRideGlass)" fillOpacity="0.9" />
      <Path d="M36 13V23H52L48 15C46 13.5 44 13 42 13H36Z" fill="url(#rrRideGlass)" fillOpacity="0.9" />
      <Line x1="34.5" y1="13" x2="34.5" y2="23" stroke="#0f172a" strokeWidth="2" />
      {/* Side mirror */}
      <Path d="M49 22L53 22C54 22 55 23 54 24L51 24.5L49 23.5Z" fill="#1e293b" />
      {/* Headlight & Taillight */}
      <Polygon points="56,26 62,28 61,31 55,30" fill="#fef08a" stroke="#f59e0b" strokeWidth="0.8" />
      <Polygon points="7,27 10,27 10,31 7,30" fill="#ef4444" />
      {/* Door line and handle */}
      <Line x1="34.5" y1="24" x2="34.5" y2="36" stroke="#0284c7" strokeWidth="1.2" />
      <Rect x="28" y="25" width="4" height="1.2" rx="0.6" fill="#cbd5e1" />
      <Rect x="37" y="25" width="4" height="1.2" rx="0.6" fill="#cbd5e1" />
    </Svg>
  );
}

// Realistic Gourmet Hot Food / RapidEats Icon
export function RealisticFoodIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="bunTopGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#f59e0b" />
          <Stop offset="100%" stopColor="#d97706" />
        </LinearGradient>
        <LinearGradient id="pattyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#78350f" />
          <Stop offset="100%" stopColor="#451a03" />
        </LinearGradient>
        <LinearGradient id="cheeseGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#facc15" />
          <Stop offset="100%" stopColor="#eab308" />
        </LinearGradient>
      </Defs>
      {/* Ground shadow */}
      <Ellipse cx="32" cy="47" rx="22" ry="4" fill="#0f172a" fillOpacity="0.12" />
      {/* Steam lines */}
      <Path d="M24 8C23 5 26 3 24 1" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" opacity={0.7} />
      <Path d="M32 7C31 4 34 2 32 0" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" opacity={0.8} />
      <Path d="M40 8C39 5 42 3 40 1" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" opacity={0.7} />
      {/* Bottom Bun */}
      <Path d="M14 40C14 38 18 36 32 36C46 36 50 38 50 40C50 44 45 46 32 46C19 46 14 44 14 40Z" fill="#d97706" stroke="#b45309" strokeWidth="1.2" />
      {/* Grilled Patty */}
      <Rect x="13" y="32" width="38" height="6" rx="3" fill="url(#pattyGrad)" />
      {/* Melted Golden Cheese with Dripping Corner */}
      <Path d="M12 30H52L49 33L42 37L36 32L28 36L20 31L14 33Z" fill="url(#cheeseGrad)" />
      {/* Fresh Crispy Green Lettuce */}
      <Path d="M12 28C14 26 18 29 22 27C26 25 30 28 34 26C38 25 42 28 46 26C50 25 52 28 52 28L50 30H14Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
      {/* Red Juicy Tomato Slice */}
      <Rect x="15" y="24" width="34" height="4.5" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="0.8" />
      {/* Top Sesame Seed Bun Dome */}
      <Path d="M14 24C14 14 20 9 32 9C44 9 50 14 50 24Z" fill="url(#bunTopGrad)" stroke="#b45309" strokeWidth="1.2" />
      {/* Sesame Seeds */}
      <Ellipse cx="24" cy="15" rx="1.4" ry="0.8" fill="#fef3c7" transform="rotate(-15 24 15)" />
      <Ellipse cx="32" cy="13" rx="1.4" ry="0.8" fill="#fef3c7" />
      <Ellipse cx="40" cy="15" rx="1.4" ry="0.8" fill="#fef3c7" transform="rotate(20 40 15)" />
      <Ellipse cx="27" cy="19" rx="1.4" ry="0.8" fill="#fef3c7" transform="rotate(10 27 19)" />
      <Ellipse cx="37" cy="19" rx="1.4" ry="0.8" fill="#fef3c7" transform="rotate(-10 37 19)" />
    </Svg>
  );
}

// Realistic Fresh Grocery Bag / RapidMart Icon
export function RealisticGroceryIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="kraftBag" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#d97706" />
          <Stop offset="100%" stopColor="#b45309" />
        </LinearGradient>
        <LinearGradient id="bagFold" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#92400e" />
          <Stop offset="100%" stopColor="#78350f" />
        </LinearGradient>
      </Defs>
      {/* Shadow */}
      <Ellipse cx="32" cy="49" rx="20" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
      {/* Fresh Veggies & Items protruding from bag */}
      {/* Green Celery/Broccoli */}
      <Circle cx="22" cy="16" r="6" fill="#22c55e" />
      <Circle cx="17" cy="14" r="5" fill="#16a34a" />
      <Circle cx="26" cy="13" r="5.5" fill="#4ade80" />
      {/* Milk Bottle / Carton */}
      <Rect x="26" y="10" width="12" height="15" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
      <Rect x="29" y="7" width="6" height="3" rx="1" fill="#0284c7" />
      <Line x1="28" y1="16" x2="36" y2="16" stroke="#38bdf8" strokeWidth="1" />
      {/* Fresh Orange Carrot with green leaves */}
      <Path d="M42 9L43 5L45 8" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      <Polygon points="39,22 47,15 44,11" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />
      {/* Red Apple with shine & stem */}
      <Circle cx="44" cy="20" r="6.5" fill="#ef4444" stroke="#dc2626" strokeWidth="0.8" />
      <Path d="M44 14C45 12 47 12 48 11" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
      <Circle cx="42" cy="18" r="1.5" fill="#fca5a5" />
      {/* Kraft Paper Grocery Bag Body */}
      <Polygon points="15,22 49,22 46,47 18,47" fill="url(#kraftBag)" stroke="#92400e" strokeWidth="1.2" />
      {/* Bag Top Fold / Lip */}
      <Path d="M14 22L17 26H47L50 22Z" fill="url(#bagFold)" />
      {/* Creases and Brand Leaf Logo */}
      <Line x1="24" y1="26" x2="25" y2="47" stroke="#92400e" strokeWidth="1" strokeDasharray="3,3" />
      <Line x1="40" y1="26" x2="39" y2="47" stroke="#92400e" strokeWidth="1" strokeDasharray="3,3" />
      {/* Eco RapidMart Green Badge */}
      <Circle cx="32" cy="36" r="6" fill="#10b981" />
      <Path d="M29 36L31 38L35 34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Realistic Luxury Reservation / Schedule Calendar Icon
export function RealisticReserveIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="calBgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#8b5cf6" />
          <Stop offset="100%" stopColor="#6d28d9" />
        </LinearGradient>
        <LinearGradient id="clockFaceGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffffff" />
          <Stop offset="100%" stopColor="#f1f5f9" />
        </LinearGradient>
      </Defs>
      {/* Ground shadow */}
      <Ellipse cx="32" cy="48" rx="20" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
      {/* Calendar Base Card */}
      <Rect x="12" y="10" width="36" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Calendar Top Header Banner */}
      <Path d="M12 16C12 12.6863 14.6863 10 18 10H42C45.3137 10 48 12.6863 48 16V20H12V16Z" fill="url(#calBgGrad)" />
      {/* Binder Rings */}
      <Rect x="20" y="7" width="3.5" height="6" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      <Rect x="36" y="7" width="3.5" height="6" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
      {/* Calendar Grid dots */}
      <Circle cx="19" cy="26" r="1.8" fill="#94a3b8" />
      <Circle cx="26" cy="26" r="1.8" fill="#94a3b8" />
      <Circle cx="19" cy="32" r="1.8" fill="#94a3b8" />
      <Circle cx="26" cy="32" r="1.8" fill="#7c3aed" />
      <Circle cx="19" cy="38" r="1.8" fill="#94a3b8" />
      <Circle cx="26" cy="38" r="1.8" fill="#94a3b8" />
      {/* Overlapping Precision Gold/Purple Clock */}
      <Circle cx="44" cy="34" r="13" fill="url(#clockFaceGrad)" stroke="#7c3aed" strokeWidth="2.5" />
      <Circle cx="44" cy="34" r="11" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
      {/* Clock Hands indicating exact reserved time */}
      <Line x1="44" y1="34" x2="44" y2="26" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <Line x1="44" y1="34" x2="50" y2="34" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="44" cy="34" r="2" fill="#f59e0b" />
      {/* Bookmark Ribbon */}
      <Path d="M16 10V22L20 19L24 22V10H16Z" fill="#fbbf24" />
    </Svg>
  );
}

// Realistic Hourly Rentals Speedometer & Timer Icon
export function RealisticHourlyIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#0284c7" />
          <Stop offset="100%" stopColor="#0369a1" />
        </LinearGradient>
      </Defs>
      {/* Ground shadow */}
      <Ellipse cx="32" cy="48" rx="20" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
      {/* Outer Chrome Bezel */}
      <Circle cx="32" cy="27" r="21" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
      <Circle cx="32" cy="27" r="18" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      {/* Speedometer Arc Track */}
      <Path
        d="M19 36 C14 26 20 14 32 14 C44 14 50 26 45 36"
        stroke="#38bdf8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Path
        d="M32 14 C44 14 50 26 45 36"
        stroke="#f59e0b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Tick Marks */}
      <Line x1="19" y1="34" x2="22" y2="32" stroke="#ffffff" strokeWidth="1.5" />
      <Line x1="21" y1="23" x2="24" y2="24" stroke="#ffffff" strokeWidth="1.5" />
      <Line x1="32" y1="16" x2="32" y2="20" stroke="#ffffff" strokeWidth="1.5" />
      <Line x1="43" y1="23" x2="40" y2="24" stroke="#ffffff" strokeWidth="1.5" />
      <Line x1="45" y1="34" x2="42" y2="32" stroke="#ef4444" strokeWidth="1.8" />
      {/* Tachometer Needle */}
      <Line x1="32" y1="27" x2="41" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="32" cy="27" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
      <Circle cx="32" cy="27" r="2" fill="#0f172a" />
      {/* Hourly Badge */}
      <Rect x="23" y="36" width="18" height="7" rx="3.5" fill="#0284c7" />
      <Line x1="27" y1="39.5" x2="37" y2="39.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// Realistic Luxury Car Key / Self-Drive Rental Icon
export function RealisticRentIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="fobGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#334155" />
          <Stop offset="50%" stopColor="#1e293b" />
          <Stop offset="100%" stopColor="#0f172a" />
        </LinearGradient>
        <LinearGradient id="keyBladeGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#e2e8f0" />
          <Stop offset="50%" stopColor="#94a3b8" />
          <Stop offset="100%" stopColor="#64748b" />
        </LinearGradient>
      </Defs>
      {/* Shadow */}
      <Ellipse cx="32" cy="48" rx="20" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
      {/* Chrome Key Ring */}
      <Circle cx="17" cy="18" r="9" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
      <Circle cx="17" cy="18" r="7.5" stroke="#64748b" strokeWidth="1" fill="none" />
      {/* Modern Smart Key Fob */}
      <Rect x="22" y="11" width="28" height="34" rx="10" fill="url(#fobGrad)" stroke="#475569" strokeWidth="1.5" />
      {/* Chrome Accent Trim */}
      <Path d="M26 13C29 12 43 12 46 13" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lock Button */}
      <Circle cx="36" cy="20" r="4" fill="#334155" stroke="#64748b" strokeWidth="1" />
      <Rect x="34" y="19" width="4" height="3" rx="1" fill="#ffffff" />
      <Path d="M34.5 19V17.5C34.5 16.5 35 16 36 16C37 16 37.5 16.5 37.5 17.5V19" stroke="#ffffff" strokeWidth="0.8" fill="none" />
      {/* Unlock Button */}
      <Circle cx="36" cy="30" r="4" fill="#334155" stroke="#64748b" strokeWidth="1" />
      <Rect x="34" y="29" width="4" height="3" rx="1" fill="#f59e0b" />
      <Path d="M34.5 29V27.5C34.5 26.5 35 26 36 26C37 26 37.5 26.5 37.5 27.5" stroke="#f59e0b" strokeWidth="0.8" fill="none" />
      {/* Trunk / Horn Button */}
      <Circle cx="36" cy="38" r="2.5" fill="#ef4444" />
      {/* Extended Laser-Cut Key Blade */}
      <Path d="M50 24H59L61 27L59 30H50V24Z" fill="url(#keyBladeGrad)" stroke="#475569" strokeWidth="0.8" />
      <Path d="M52 26H57V28H52" stroke="#475569" strokeWidth="0.8" />
    </Svg>
  );
}

// Realistic Express Courier / Package Icon
export function RealisticPackageIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="boxTopGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#f59e0b" />
          <Stop offset="100%" stopColor="#d97706" />
        </LinearGradient>
        <LinearGradient id="boxLeftGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#d97706" />
          <Stop offset="100%" stopColor="#b45309" />
        </LinearGradient>
        <LinearGradient id="boxRightGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#b45309" />
          <Stop offset="100%" stopColor="#92400e" />
        </LinearGradient>
      </Defs>
      {/* Shadow */}
      <Ellipse cx="32" cy="49" rx="22" ry="4" fill="#0f172a" fillOpacity="0.12" />
      {/* 3D Isometric Cardboard Box */}
      {/* Left Face */}
      <Polygon points="12,23 32,33 32,47 12,37" fill="url(#boxLeftGrad)" stroke="#78350f" strokeWidth="0.8" />
      {/* Right Face */}
      <Polygon points="32,33 52,23 52,37 32,47" fill="url(#boxRightGrad)" stroke="#78350f" strokeWidth="0.8" />
      {/* Top Face */}
      <Polygon points="32,9 52,23 32,33 12,23" fill="url(#boxTopGrad)" stroke="#92400e" strokeWidth="0.8" />
      {/* Sealing Tape across Top Flap */}
      <Polygon points="22,16 42,30 38,32 18,18" fill="#fde68a" stroke="#ca8a04" strokeWidth="0.5" fillOpacity="0.85" />
      {/* Vertical Sealing Tape on Front Corner */}
      <Polygon points="30,32 34,32 34,47 30,47" fill="#fde68a" stroke="#ca8a04" strokeWidth="0.5" fillOpacity="0.85" />
      {/* White Shipping Label with Barcode */}
      <Polygon points="16,28 26,33 26,40 16,35" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      <Line x1="18" y1="30" x2="24" y2="33" stroke="#0f172a" strokeWidth="1" />
      <Line x1="18" y1="32" x2="24" y2="35" stroke="#0f172a" strokeWidth="1" />
      <Line x1="18" y1="34" x2="23" y2="36.5" stroke="#0f172a" strokeWidth="0.8" />
      {/* Priority Fragile Wineglass / Rapid Arrow Badge on Right */}
      <Polygon points="40,29 48,25 48,31 40,35" fill="#ef4444" fillOpacity="0.2" />
      <Path d="M43 31L45 28L47 30" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Realistic 3D Navigation Compass / Intercity & More Icon
export function RealisticCompassIcon({ size = 48 }) {
  const w = size;
  const h = size * 0.85;
  return (
    <Svg width={w} height={h} viewBox="0 0 64 54" fill="none">
      <Defs>
        <LinearGradient id="compassRing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#f59e0b" />
          <Stop offset="50%" stopColor="#d97706" />
          <Stop offset="100%" stopColor="#b45309" />
        </LinearGradient>
        <LinearGradient id="dialGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0f172a" />
          <Stop offset="100%" stopColor="#1e293b" />
        </LinearGradient>
      </Defs>
      {/* Shadow */}
      <Ellipse cx="32" cy="48" rx="20" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
      {/* Top Brass Attachment Loop */}
      <Circle cx="32" cy="7" r="4.5" stroke="#d97706" strokeWidth="2" fill="none" />
      <Rect x="30" y="9" width="4" height="4" fill="#b45309" />
      {/* Heavy Brass Outer Ring */}
      <Circle cx="32" cy="28" r="20" fill="url(#compassRing)" stroke="#78350f" strokeWidth="1.2" />
      {/* Inner Stepped Bezel */}
      <Circle cx="32" cy="28" r="17" fill="url(#dialGrad)" stroke="#fde68a" strokeWidth="0.8" />
      {/* Degree Tick Marks */}
      <Circle cx="32" cy="28" r="15" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,3" />
      {/* Cardinal Direction Points (N, S, E, W) */}
      <Path d="M32 14L33.5 17H30.5L32 14Z" fill="#ef4444" />
      <Path d="M32 42L33.5 39H30.5L32 42Z" fill="#94a3b8" />
      <Path d="M46 28L43 26.5V29.5L46 28Z" fill="#94a3b8" />
      <Path d="M18 28L21 26.5V29.5L18 28Z" fill="#94a3b8" />
      {/* 4-Point Star Background Rose */}
      <Polygon points="32,21 34,26 39,28 34,30 32,35 30,30 25,28 30,26" fill="#334155" />
      {/* Precision Needle: North (Red) & South (Silver) */}
      <Polygon points="32,14 35,28 32,26 29,28" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.6" />
      <Polygon points="32,42 35,28 32,30 29,28" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
      {/* Center Pivot Jewel */}
      <Circle cx="32" cy="28" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
      <Circle cx="32" cy="28" r="1.5" fill="#78350f" />
    </Svg>
  );
}

// Realistic Electric EV Vehicle Graphic for Hero Banner
export function RealisticElectricCar({ width = 110, height = 58 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 64" fill="none">
      <Defs>
        <LinearGradient id="evBodyGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#10b981" />
          <Stop offset="50%" stopColor="#059669" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
        <LinearGradient id="evGlassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#a7f3d0" />
          <Stop offset="100%" stopColor="#34d399" />
        </LinearGradient>
        <LinearGradient id="evGlow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#34d399" />
          <Stop offset="100%" stopColor="#6ee7b7" />
        </LinearGradient>
      </Defs>
      {/* Soft floor shadow */}
      <Ellipse cx="60" cy="56" rx="46" ry="5" fill="#064e3b" fillOpacity="0.25" />
      {/* Rear Wheel */}
      <Circle cx="32" cy="48" r="12" fill="#0f172a" stroke="#047857" strokeWidth="2.5" />
      <Circle cx="32" cy="48" r="8" fill="#1e293b" stroke="#6ee7b7" strokeWidth="2" />
      <Circle cx="32" cy="48" r="3" fill="#34d399" />
      <Line x1="32" y1="41" x2="32" y2="44" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="32" y1="52" x2="32" y2="55" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="25" y1="48" x2="28" y2="48" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="36" y1="48" x2="39" y2="48" stroke="#6ee7b7" strokeWidth="1.5" />
      {/* Front Wheel */}
      <Circle cx="90" cy="48" r="12" fill="#0f172a" stroke="#047857" strokeWidth="2.5" />
      <Circle cx="90" cy="48" r="8" fill="#1e293b" stroke="#6ee7b7" strokeWidth="2" />
      <Circle cx="90" cy="48" r="3" fill="#34d399" />
      <Line x1="90" y1="41" x2="90" y2="44" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="90" y1="52" x2="90" y2="55" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="83" y1="48" x2="86" y2="48" stroke="#6ee7b7" strokeWidth="1.5" />
      <Line x1="94" y1="48" x2="97" y2="48" stroke="#6ee7b7" strokeWidth="1.5" />
      {/* Underbody aero diffuser */}
      <Path d="M16 48H22C22 38 42 38 42 48H80C80 38 100 38 100 48H106" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" />
      {/* Modern Sleek EV Body Silhouette */}
      <Path
        d="M14 46L12 38C11 34 14 30 18 29L28 27L42 16C46 13 52 12 58 12H80C85 12 89 14 93 18L103 27L109 29C113 30 115 33 114 37L112 46H102C101 40 96 36 90 36C84 36 79 40 78 46H44C43 40 38 36 32 36C26 36 21 40 20 46H14Z"
        fill="url(#evBodyGrad)"
        stroke="#065f46"
        strokeWidth="1.5"
      />
      {/* Aerodynamic Tinted Green Glass */}
      <Path d="M43 17L33 27H59V14H57C51 14 46 15 43 17Z" fill="url(#evGlassGrad)" fillOpacity="0.85" />
      <Path d="M63 14V27H98L91 18C88 15 84 14 80 14H63Z" fill="url(#evGlassGrad)" fillOpacity="0.85" />
      <Line x1="61" y1="13" x2="61" y2="28" stroke="#064e3b" strokeWidth="3" />
      {/* Futuristic LED Headlight */}
      <Polygon points="102,29 113,31 111,35 102,34" fill="#a7f3d0" stroke="#34d399" strokeWidth="1" />
      {/* Taillight LED Bar */}
      <Polygon points="13,32 18,31 18,36 13,35" fill="#ef4444" />
      {/* Electric Lightning Bolt on Side */}
      <Path d="M68 31L64 37H68L66 43L74 36H70L73 31Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
      {/* Door Line and Flush Handles */}
      <Line x1="61" y1="28" x2="61" y2="43" stroke="#047857" strokeWidth="1.2" />
      <Rect x="51" y="31" width="5" height="1.5" rx="0.7" fill="#a7f3d0" />
      <Rect x="78" y="31" width="5" height="1.5" rx="0.7" fill="#a7f3d0" />
    </Svg>
  );
}
