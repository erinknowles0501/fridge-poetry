import { initializeApp } from "@firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import firebaseConfig from "../.firebase/config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8081);

export default db;
