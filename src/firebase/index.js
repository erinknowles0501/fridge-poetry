import { initializeApp } from "firebase/app";
import firebaseConfig from "../../.firebase/config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig, "fridge-poetry-ek");

export default app;
