import { initializeApp } from "@firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { readFileSync } from "fs";

import * as firestore from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

const testEnv = await initializeTestEnvironment({
    projectId: "demo-fridge-poetry-ek",
    firestore: {
        host: "127.0.0.1",
        port: 8081,
        rules: readFileSync(".firebase/firestore.test.rules", "utf8"),
    },
});

const app = initializeApp({ projectId: "demo-fridge-poetry-ek" });
const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8081);

export default db;

export async function clearDB() {
    await testEnv.clearFirestore();
}

export async function writeDB(collectionName, dataArr) {
    const batch = firestore.writeBatch(db);
    dataArr.forEach((item) => {
        const docRef = firestore.doc(db, collectionName, item.id);
        batch.set(docRef, item);
    });
    await batch.commit();
}
