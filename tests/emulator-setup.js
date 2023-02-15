import { initializeApp } from "@firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import firebaseConfig from "../.firebase/config.js";
import * as firestore from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8081);

export default db;

export async function clearDB() {
    try {
        await fetch(
            "http://127.0.0.1:8081/emulator/v1/projects/fridge-poetry-ek/databases/(default)/documents",
            {
                method: "DELETE",
            }
        );
    } catch (error) {
        console.error(error);
    }
}

export async function writeDB(collectionName, dataArr) {
    const batch = firestore.writeBatch(db);
    dataArr.forEach((item) => {
        const docRef = firestore.doc(db, collectionName, item.id);
        batch.set(docRef, item);
    });
    await batch.commit();
}
