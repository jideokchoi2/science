import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * 이 앱의 apiKey는 공개되어도 안전한 값입니다.
 * 실제 접근 제어는 Firestore 보안 규칙이 담당합니다.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDiWdmPDEPEBtFwD3ePUrKDstzZA0I49O4',
  authDomain: 'planet-circle-challenge.firebaseapp.com',
  databaseURL: 'https://planet-circle-challenge-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'planet-circle-challenge',
  storageBucket: 'planet-circle-challenge.firebasestorage.app',
  messagingSenderId: '884833535586',
  appId: '1:884833535586:web:acedd941f1b92b9edcb33b',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
