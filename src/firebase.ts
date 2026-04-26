import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyB7iTpI1mvj7NHwS8Ec17khFBS9nA-hzk0',
  authDomain: 'lab-6-dcb81.firebaseapp.com',
  projectId: 'lab-6-dcb81',
  databaseURL: 'https://lab-6-dcb81-default-rtdb.firebaseio.com',
  storageBucket: 'lab-6-dcb81.firebasestorage.app',
  messagingSenderId: '585389065396',
  appId: '1:585389065396:web:5d282819583681e52403e1',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const realtimeDb = getDatabase(firebaseApp);
