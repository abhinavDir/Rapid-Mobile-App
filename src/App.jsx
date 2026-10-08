import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Screens
import StartupVideoScreen from './components/user/auth/StartupVideoScreen';
import WelcomeScreen from './components/user/auth/WelcomeScreen';
import UserLogin from './components/user/auth/UserLogin';
import UserRegister from './components/user/auth/UserRegister';
import UserHome from './components/user/home/UserHome';
import UserExplore from './components/user/explore/UserExplore';
import UserActivity from './components/user/activity/UserActivity';
import ProfileUser from './components/user/profile/ProfileUser';
import DigitalAvatarScreen from './components/user/profile/DigitalAvatarScreen';
import ActiveRidePage from './components/user/booking/ActiveRidePage';

// Shared UI
import ToastContainer from './components/ToastContainer';
import Navigation from './components/Navigation';

// Services & Utilities
import {
  loginUserApi,
  registerUserApi,
  googleAuthUserApi,
  prewarmApiConnection,
  fetchUserApi,
} from './services/api';
import { signOutGoogle } from './services/googleAuthService';
import storage from './utils/storage';

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // 1. App Startup & Persistent Auth State
  // showStartup is ALWAYS true on fresh app open
  const [showStartup, setShowStartup] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenParams, setScreenParams] = useState({});
  const [toasts, setToasts] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Background initialization & prewarming: Reloads everything while startup page plays
  useEffect(() => {
    async function prewarmApp() {
      try {
        await storage.init();

        // 1. Kick off concurrent network discovery in background
        const netPromise = prewarmApiConnection().catch(() => null);

        // 2. Read local storage auth state
        const [savedUserData, seenWelcome, savedToken] = await Promise.all([
          storage.getItemAsync('userData'),
          storage.getItemAsync('hasSeenWelcome'),
          storage.getItemAsync('userToken'),
        ]);

        const isSeen = seenWelcome === 'true';
        setHasSeenWelcome(isSeen);

        // 3. If authenticated user exists, load and refresh real profile from backend
        if (savedUserData && savedToken) {
          try {
            const parsedUser = JSON.parse(savedUserData);
            if (parsedUser && (parsedUser.id || parsedUser._id || parsedUser.email || parsedUser.phone)) {
              setUser(parsedUser);

              // Refresh latest real profile from database in background
              const uId = parsedUser._id || parsedUser.id;
              if (uId && !String(uId).startsWith('local_')) {
                fetchUserApi(uId).then((fresh) => {
                  if (fresh && fresh.success && fresh.data) {
                    setUser(fresh.data);
                    storage.setItem('userData', JSON.stringify(fresh.data));
                  }
                }).catch(() => {});
              }
            }
          } catch (e) {
            console.warn('User parse error:', e);
          }
        }

        // Wait for prewarm discovery to complete
        await netPromise;
      } catch (err) {
        console.warn('Prewarm failed:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    prewarmApp();
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const navigate = (screenName, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screenName);
  };

  // Called when the permanent Startup / Video screen completes
  const handleStartupFinish = async () => {
    try {
      await storage.init();
      const [savedUserData, seenWelcome, savedToken] = await Promise.all([
        storage.getItemAsync('userData'),
        storage.getItemAsync('hasSeenWelcome'),
        storage.getItemAsync('userToken'),
      ]);

      const isSeen = seenWelcome === 'true';
      setHasSeenWelcome(isSeen);

      // Check if user is already authenticated
      if (savedUserData && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          if (parsedUser && (parsedUser.id || parsedUser._id || parsedUser.email || parsedUser.phone)) {
            setUser(parsedUser);
            setCurrentScreen('home');
            setShowStartup(false);
            return;
          }
        } catch (e) {}
      }

      // If user is not authenticated:
      setUser(null);
      if (!isSeen) {
        // Genuine first-time user -> show Welcome Page
        setCurrentScreen('welcome');
      } else {
        // Returning user who is logged out -> show Login / Sign Up directly
        setCurrentScreen('login');
      }
    } catch (err) {
      console.warn('Startup finish check error:', err);
      setCurrentScreen('login');
    } finally {
      setShowStartup(false);
    }
  };

  // Auth Handlers
  const handleUserLogin = async (loginForm) => {
    try {
      const data = await loginUserApi(loginForm);
      if (data && data.success) {
        setUser(data.user);
        setHasSeenWelcome(true);
        await Promise.all([
          storage.setItem('userToken', data.token || 'user_token_' + Date.now()),
          storage.setItem('userData', JSON.stringify(data.user)),
          storage.setItem('hasSeenWelcome', 'true'),
        ]);
        addToast(`Welcome back, ${data.user.name || 'Rider'}!`, 'success');
        navigate('home');
      } else {
        const msg = data?.message || 'Invalid email or password';
        addToast(msg, 'error');
        throw new Error(msg);
      }
    } catch (err) {
      if (!err.message || err.message === 'Login failed') {
        addToast('Login error. Please check your credentials.', 'error');
      }
      throw err;
    }
  };

  const handleGoogleLogin = async (googlePayload) => {
    try {
      const data = await googleAuthUserApi(googlePayload);
      if (data && data.success) {
        setUser(data.user);
        setHasSeenWelcome(true);
        await Promise.all([
          storage.setItem('userToken', data.token || 'google_token_' + Date.now()),
          storage.setItem('userData', JSON.stringify(data.user)),
          storage.setItem('hasSeenWelcome', 'true'),
        ]);
        addToast(`Welcome, ${data.user.name || 'Rider'}!`, 'success');
        navigate('home');
      } else {
        const msg = data?.message || 'Google sign-in failed';
        addToast(msg, 'error');
        throw new Error(msg);
      }
    } catch (err) {
      addToast(err.message || 'Google sign-in error', 'error');
      throw err;
    }
  };

  const handleUserRegister = async (registerForm) => {
    try {
      const data = await registerUserApi(registerForm);
      if (data && data.success) {
        setHasSeenWelcome(true);
        await storage.setItem('hasSeenWelcome', 'true');

        // If direct session token is returned or auto-created, log in straight away
        if (data.token && data.user) {
          setUser(data.user);
          await Promise.all([
            storage.setItem('userToken', data.token),
            storage.setItem('userData', JSON.stringify(data.user)),
          ]);
          addToast(`Account created! Welcome, ${data.user.name}!`, 'success');
          navigate('home');
          return;
        }

        // Try seamless auto-login with credentials
        try {
          const loginData = await loginUserApi({
            email: registerForm.email,
            password: registerForm.password,
          });
          if (loginData && loginData.success) {
            setUser(loginData.user);
            await Promise.all([
              storage.setItem('userToken', loginData.token),
              storage.setItem('userData', JSON.stringify(loginData.user)),
            ]);
            addToast(`Account created! Welcome, ${loginData.user.name}!`, 'success');
            navigate('home');
            return;
          }
        } catch (e) {}

        addToast('Account created successfully! Please login.', 'success');
        navigate('login');
      } else {
        const msg = data?.message || 'Registration failed';
        addToast(msg, 'error');
        throw new Error(msg);
      }
    } catch (err) {
      addToast(err.message || 'Registration error', 'error');
      throw err;
    }
  };

  // Logout Handler:
  // Crucial requirement: Do NOT reset hasSeenWelcome during logout!
  const handleUserLogout = async () => {
    try {
      await signOutGoogle();
    } catch (e) {}
    await Promise.all([
      storage.removeItem('userData'),
      storage.removeItem('userToken'),
    ]);
    setUser(null);
    addToast('Logged out successfully', 'success');
    navigate('login');
  };

  const handleWelcomeComplete = async (targetScreen) => {
    setHasSeenWelcome(true);
    await storage.setItem('hasSeenWelcome', 'true');
    navigate(targetScreen);
  };

  const renderCurrentScreen = () => {
    // 1. ALWAYS show Startup / Video Screen first whenever the app is opened
    if (showStartup) {
      return <StartupVideoScreen onFinish={handleStartupFinish} />;
    }

    // 2. Unauthenticated User Screens
    if (!user) {
      switch (currentScreen) {
        case 'register':
          return (
            <UserRegister
              onRegister={handleUserRegister}
              onGoogleLogin={handleGoogleLogin}
              onSwitchToLogin={() => navigate('login')}
              onBack={() => navigate('welcome')}
            />
          );
        case 'login':
          return (
            <UserLogin
              onLogin={handleUserLogin}
              onGoogleLogin={handleGoogleLogin}
              onSwitchToRegister={() => navigate('register')}
              onBack={() => navigate('welcome')}
            />
          );
        case 'welcome':
        default:
          return <WelcomeScreen onNavigate={(screen) => navigate(screen)} />;
      }
    }

    // 3. Authenticated User Screens (Directly shown if already logged in)
    switch (currentScreen) {
      case 'explore':
        return (
          <UserExplore
            user={user}
            onNavigate={(screen, params) => navigate(screen, params)}
            onLogout={handleUserLogout}
            addToast={addToast}
          />
        );
      case 'activity':
        return (
          <UserActivity
            user={user}
            onNavigate={(screen, params) => navigate(screen, params)}
            onBookAgain={(ride) => navigate('home', { rebookRide: ride })}
          />
        );
      case 'profile':
        return (
          <ProfileUser
            user={user}
            onUserUpdated={setUser}
            onLogout={handleUserLogout}
            onNavigate={(screen, params) => navigate(screen, params)}
            addToast={addToast}
          />
        );
      case 'digital-avatar':
        return (
          <DigitalAvatarScreen
            user={user}
            onNavigate={(screen, params) => navigate(screen, params)}
            addToast={addToast}
          />
        );
      case 'active-ride':
        return (
          <ActiveRidePage
            user={user}
            activeRide={screenParams.activeRide}
            onCancelRequest={screenParams.onCancelRequest}
            onOpenChat={screenParams.onOpenChat}
            onOpenSafety={screenParams.onOpenSafety}
            onOpenFare={screenParams.onOpenFare}
            onBack={() => navigate('home')}
          />
        );
      case 'home':
      default:
        return (
          <UserHome
            user={user}
            onNavigate={(screen, params) => navigate(screen, params)}
            routeParams={screenParams}
            addToast={addToast}
          />
        );
    }
  };

  const isTabBarScreen = user && ['home', 'explore', 'activity', 'profile'].includes(currentScreen);
  // Home manages its own bottom layout via the bottom sheet; other tab screens need padding for the floating nav
  const NAV_BAR_HEIGHT = 72;
  const screenBottomPad = isTabBarScreen && currentScreen !== 'home' ? NAV_BAR_HEIGHT : 0;

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="#ffffff" />
        {/* Shared stacking context: screen + nav overlap each other */}
        <View style={styles.stackRoot}>
          <View style={[styles.screenWrapper, { paddingBottom: screenBottomPad }]}>
            {renderCurrentScreen()}
          </View>

          {/* Global Bottom Navigation — absolutely positioned so home sheet can overlap */}
          {isTabBarScreen && (
            <Navigation
              activeTab={currentScreen}
              onNavigate={(tab) => navigate(tab)}
            />
          )}
        </View>

        {/* Global Toast Overlay */}
        <ToastContainer
          toasts={toasts}
          onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  stackRoot: {
    flex: 1,
    position: 'relative',
  },
  screenWrapper: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  splashIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff5c47',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff5c47',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  splashIconText: {
    fontSize: 22,
  },
  splashBrandTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
