export interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const firebaseConfig: FirebaseAppletConfig = {
  projectId: "gen-lang-client-0696783689",
  appId: "1:224333928790:web:fc975f4770657bdf5d1ef7",
  apiKey: "AIzaSyDsioDNmn_EPPiyeQH111QavXijMdjE3pc",
  authDomain: "gen-lang-client-0696783689.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-kelompokkumanaje-81a78cbb-bfee-47f4-94d3-a023020a96bb",
  storageBucket: "gen-lang-client-0696783689.firebasestorage.app",
  messagingSenderId: "224333928790",
  measurementId: "",
  oAuthClientId: "224333928790-ofs5uj0rsrr0581ee8hqgdg2pbah7gba.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

export default firebaseConfig;
