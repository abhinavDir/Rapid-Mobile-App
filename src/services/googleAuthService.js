import { GOOGLE_WEB_CLIENT_ID } from '../config/auth';

let GoogleSignin = null;
let statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
};

try {
  const gSigninModule = require('@react-native-google-signin/google-signin');
  if (gSigninModule) {
    GoogleSignin = gSigninModule.GoogleSignin || gSigninModule.default || gSigninModule;
    if (gSigninModule.statusCodes) {
      statusCodes = gSigninModule.statusCodes;
    }
  }
} catch (e) {
  console.warn('GoogleSignin native module loading note:', e);
}

let isConfigured = false;

export const configureGoogleSignIn = () => {
  try {
    if (GoogleSignin && typeof GoogleSignin.configure === 'function') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
        scopes: ['profile', 'email'],
      });
      isConfigured = true;
    }
  } catch (err) {
    console.warn('GoogleSignin.configure warning:', err?.message);
  }
};

/**
 * Perform genuine 100% native Google Sign-In on Android
 * Directly opens Google account chooser and returns verified payload:
 * { idToken, googleId, email, name, picture }
 */
export const performGoogleSignIn = async () => {
  if (!GoogleSignin || typeof GoogleSignin.signIn !== 'function') {
    throw new Error(
      'Native Google Sign-In module is initializing. Please ensure latest APK is installed.'
    );
  }

  try {
    // Always configure before initiating sign in
    configureGoogleSignIn();

    // 1. Verify Google Play Services availability
    if (typeof GoogleSignin.hasPlayServices === 'function') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    // 2. Clear previous session state so account picker always opens fresh
    try {
      if (typeof GoogleSignin.signOut === 'function') {
        await GoogleSignin.signOut();
      }
    } catch (e) {}

    // 3. Initiate native Google Sign-In dialog
    const response = await GoogleSignin.signIn();

    // Support both v13+ ({ data: { idToken, user } }) and legacy ({ idToken, user }) response shapes
    const signInData = response?.data || response;
    const idToken = signInData?.idToken || null;
    const userObj = signInData?.user || {};

    const googleId =
      userObj.id ||
      userObj.sub ||
      (userObj.email ? 'google_' + userObj.email.replace(/[^a-zA-Z0-9]/g, '_') : null);
    const email = userObj.email || null;
    const name =
      userObj.name ||
      (userObj.givenName
        ? `${userObj.givenName} ${userObj.familyName || ''}`.trim()
        : email
        ? email.split('@')[0]
        : 'Google User');
    const picture = userObj.photo || null;

    if (!email && !idToken) {
      throw new Error('Google Sign-In did not return an account.');
    }

    return {
      idToken,
      googleId,
      email,
      name,
      picture,
    };
  } catch (error) {
    if (
      error &&
      (error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === '12501' ||
        error.message?.includes('cancel'))
    ) {
      const err = new Error('Sign in was cancelled');
      err.isCancelled = true;
      throw err;
    } else if (error && (error.code === statusCodes.IN_PROGRESS || error.code === '12502')) {
      throw new Error('Google Sign-In is already in progress');
    } else if (error && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services is not available or outdated on this device');
    } else if (
      error &&
      (error.code === '10' ||
        error.code === statusCodes.DEVELOPER_ERROR ||
        String(error?.message).includes('DEVELOPER_ERROR') ||
        String(error?.message).includes('10'))
    ) {
      const devErr = new Error('Google Sign-In Configuration Error: Make sure Android Client ID with package name "com.rapidride.user" and SHA-1 is added in Google Cloud Console.');
      devErr.isDeveloperError = true;
      throw devErr;
    } else {
      console.warn('Google Sign-In Error:', error);
      throw new Error(error?.message || 'Google Sign-In failed');
    }
  }
};

export const signOutGoogle = async () => {
  try {
    if (GoogleSignin && typeof GoogleSignin.signOut === 'function') {
      await GoogleSignin.signOut();
    }
  } catch (e) {
    console.warn('Google sign out warning:', e);
  }
};

