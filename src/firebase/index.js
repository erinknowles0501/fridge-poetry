import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9mJ8pnpsPYephd3H9FJU4-mRLsn4y2do",
    authDomain: "fridge-poetry-ek.firebaseapp.com",
    projectId: "fridge-poetry-ek",
    storageBucket: "fridge-poetry-ek.appspot.com",
    messagingSenderId: "1093091176992",
    appId: "1:1093091176992:web:a8524051a03ed50cbe0245",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
