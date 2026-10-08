# 🚖 RapidRide — User Application

A high-performance, real-time ride hailing mobile application built with **React Native (0.87)**, modern vector UI, interactive **Leaflet/Google Maps**, multi-profile shortest path routing, and live driver tracking.

---

## ✨ Features

- 🗺️ **High-Fidelity Interactive Map**:
  - Google Maps raster tiles with standard and satellite layer toggling.
  - Smooth GPS auto-detection and custom pulsing location pins.
  - Interactive map-click dropoff selection and full route viewport fitting.

- 🛣️ **Smart Shortest Path Road Routing**:
  - Multi-profile routing supporting **Bike**, **Foot**, **Car**, and **Alley/Gali Pathways** (including residential and private corridors).
  - Automatically queries multiple endpoints and selects the true shortest distance path.
  - Multi-route preview with interactive touch selection for alternative routes.

- 🛵 **Dynamic Vehicle Selection & Visibility**:
  - Live availability for **Bike**, **Auto**, and **Cab**.
  - Strict step-based map visibility: zero vehicles shown on the initial location screen; filtered vehicle markers shown on the vehicle selection screen.
  - Distance and dynamic fare calculation based on the shortest road path.

- 📍 **Live Ride Tracking & Status Lifecycle**:
  - **Phase 1 (`ACCEPTED`)**: Displays captain vector marker and dynamic route to User Pickup (Point A).
  - **Phase 2 (`IN_PROGRESS`)**: Switches to destination tracking (Point B) upon OTP verification.
  - Driver chat modal, SOS safety modal, and fare breakdown.

- ⚡ **Resilient Backend & Offline Caching**:
  - Cloud server fallback (`https://rapidrideserver.onrender.com/api`) with auto-reconnection.
  - Persistent user session & last known location caching via `@react-native-async-storage/async-storage`.

---

## 🛠️ Tech Stack

| Technology | Version / Tool |
|---|---|
| **Framework** | [React Native](https://reactnative.dev) `0.87.1` |
| **Language** | JavaScript (ESNext) + JSX |
| **Engine** | Hermes Engine & New Architecture |
| **Map & GIS** | `react-native-webview` + Leaflet 1.9.4 + OSRM & OpenStreetMap.de |
| **Vector Icons & Graphics** | `react-native-svg` |
| **Storage** | `@react-native-async-storage/async-storage` |
| **Backend API** | Node.js + Express + MongoDB (Hosted on Render) |

---

## 📁 Project Structure

```
UserApp/
├── android/                   # Native Android project files
│   ├── app/
│   │   ├── src/main/assets/   # Bundled JS & vector assets
│   │   └── build.gradle       # App-level build config
│   └── build.gradle           # Top-level Gradle config
├── ios/                       # Native iOS project files
├── src/
│   ├── components/
│   │   ├── user/
│   │   │   ├── auth/          # Login, Register, StartupVideoScreen
│   │   │   ├── booking/       # LocationStep, VehicleStep, ActiveRideCard, Modals
│   │   │   ├── home/          # UserHome (Main container & state management)
│   │   │   └── map/           # MapView (Leaflet GIS WebView engine)
│   │   ├── Icon.jsx           # Material vector icon wrapper
│   │   └── Navigation.jsx     # Navigation tabs & transitions
│   ├── hooks/                 # Custom React hooks (useNavigation)
│   ├── services/
│   │   └── api.js             # Centralized API service & candidate URLs
│   └── utils/
│       ├── distance.js        # Haversine distance calculator
│       └── storage.js         # Async storage helper
├── App.jsx                    # Root application component
├── index.js                   # Application entry point
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 22.11.0`
- **JDK**: Java 17 (Amazon Corretto or OpenJDK)
- **Android SDK & Platform Tools**: Android Studio with SDK build-tools 35+

---

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

---

### 2. Running in Development Mode

#### **Start Metro Bundler:**
```bash
npm start
```

#### **Run on Android Device / Emulator:**
```bash
npm run android
```

---

### 3. Building a Production Release APK

To create an optimized, standalone Android release APK:

#### **Step 1: Bundle React Native JS Assets**
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

#### **Step 2: Compile with Gradle**
```bash
cd android
./gradlew assembleRelease
```
*(On Windows Command Prompt: `gradlew.bat assembleRelease`)*

#### **Output Location:**
The generated APK will be available at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🌐 API Configuration

API endpoints are configured in [`src/services/api.js`](file:///c:/Users/Abhinav%20Pandey/Desktop/User%20App/UserApp/src/services/api.js):
- **Primary Production Server**: `https://rapidrideserver.onrender.com/api`
- **Automatic Fallback**: Local IP and loopback URLs

---

## 📄 License
Private & Confidential — Built for RapidRide.
