import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider configuration requesting sheets scope and profile/email fields for robust login
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

let cachedAccessToken: string | null = localStorage.getItem('devduo_google_token');
let isSigningIn = false;

// Set up Auth state listener with direct callbacks to notify the UI
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const storedToken = localStorage.getItem('devduo_google_token') || cachedAccessToken;
      if (storedToken) {
        cachedAccessToken = storedToken;
        onAuthSuccess(user, storedToken);
      } else if (!isSigningIn) {
        // Under some situations, page reload loses the token, but we still have user.
        // We'll reset token and ask the user to re-authenticate or keep session
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('devduo_google_token');
      onAuthFailure();
    }
  });
};

// Sign in with Google Popup and capture token in memory
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Sheets access token from authentication.');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('devduo_google_token', credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error during Google sign-in details:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out the active user session
export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem('devduo_google_token');
};

// Read current cached access token safely
export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('devduo_google_token');
};
