import { readFileSync } from "fs";
import * as firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import config from "../.firebase/config.js";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import ffsTest from "firebase-functions-test";

export async function testEnvFactory(projectID, withFunctions = false) {
    const generatedID = `demo-${projectID}-fridge-poetry-ek`;

    const testEnv = await initializeTestEnvironment({
        projectId: generatedID,
        firestore: {
            host: "127.0.0.1",
            port: 8081,
            rules: readFileSync(".firebase/firestore.rules", "utf8"),
        },
    });

    if (withFunctions) {
        const functionsApp = initializeApp(config, generatedID);
        const functions = getFunctions(functionsApp);
        connectFunctionsEmulator(functions, "127.0.0.1", 5001);

        const { wrap } = ffsTest(
            { ...config, projectID: generatedID },
            "../secrets/fridge-poetry-ek-0fee2c27e4fe.json"
        );
        return { testEnv, functions, wrap };
    } else {
        return testEnv;
    }
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
