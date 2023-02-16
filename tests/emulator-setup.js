import { initializeApp } from "@firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { readFileSync } from "fs";

import * as firestore from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

export const testEnv = await initializeTestEnvironment({
    projectId: "demo-fridge-poetry-ek",
    firestore: {
        host: "127.0.0.1",
        port: 8081,
        rules: readFileSync(".firebase/firestore.rules", "utf8"),
    },
});

const app = initializeApp({ projectId: "demo-fridge-poetry-ek" });
export const db = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8081);

export async function writeDB(collectionName, dataArr) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const fs = context.firestore();
        const batch = firestore.writeBatch(fs);
        dataArr.forEach((item) => {
            const docRef = firestore.doc(fs, collectionName, item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
    });
}

export const authAlice = testEnv.authenticatedContext("alice", {
    email: "alice@test.com",
});
export const authBob = testEnv.authenticatedContext("bob", {
    email: "bob@test.com",
});
export const authNone = testEnv.unauthenticatedContext();
