//Aquí es donde meteremos las credenciales que te da la consola de Firebase cuando creas un proyecto web
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDRng7iY2Vf28iMcPNNmCXus9iOS-qcB_c",
  authDomain: "fct-dashboard-51d32.firebaseapp.com",
  projectId: "fct-dashboard-51d32",
  storageBucket: "fct-dashboard-51d32.firebasestorage.app",
  messagingSenderId: "346073033321",
  appId: "1:346073033321:web:b38cd35d8fed885b6a10f8",
  measurementId: "G-B9EMHD3VJ1"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos Firestore lista para usar en la app
export const db = getFirestore(app);