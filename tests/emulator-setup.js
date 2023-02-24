import { readFileSync } from "fs";

import * as firestore from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

export async function testEnvFactory(projectID) {
    const testEnv = await initializeTestEnvironment({
        projectId: `demo-${projectID}-fridge-poetry-ek`,
        firestore: {
            host: "127.0.0.1",
            port: 8081,
            rules: readFileSync(".firebase/firestore.rules", "utf8"),
        },
    });
    return testEnv;
}

export async function writeDB(testEnv, collectionName, dataArr) {
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
