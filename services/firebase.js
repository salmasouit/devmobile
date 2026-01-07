import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

let auth;
if (Platform.OS === 'web') {
    // Web uses standard browser persistence by default or explicit browserLocalPersistence
    auth = getAuth(app);
    // Alternatively: auth = initializeAuth(app, { persistence: browserLocalPersistence });
} else {
    // Native uses AsyncStorage
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

export { auth };

export const db = getFirestore(app);

// Enable offline persistence (web/native compatible if supported)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence failed: Not supported');
    }
});