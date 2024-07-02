import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const app = firebase.initializeApp({
  apiKey: "AIzaSyD13DgKyOo8o-pw0AzaK8tv3YNiDt98GJ8",
  authDomain: "oportunista-guild.firebaseapp.com",
  projectId: "oportunista-guild",
  storageBucket: "oportunista-guild.appspot.com",
  messagingSenderId: "638431244906",
  appId: "1:638431244906:web:198d7a09ba121b0cbe5013",
  measurementId: "G-H4LHTDWNPQ"
})

export const auth = app.auth();
export const firestore = app.firestore();
export const storage = app.storage();
export default app