import functions from "firebase-functions";
import admin from "firebase-admin";
import config from "../.firebase/config";
import { getDocs, collection, getDoc, doc } from "@firebase/firestore";

const adminApp = admin.initializeApp();

const db = adminApp.firestore();
console.log("db", db);

export const helloWorld = functions.https.onCall((data) => {
    return "Hello World " + data;
});

export const testTriggeredFunc = functions.firestore
    .document("invitations/{docId}")
    .onWrite((change, context) => {
        //if (change.after.data()
    });

export const invitationDeleted = functions.firestore
    .document("invitations/{id}")
    .onDelete(async (snap, context) => {
        //console.log("ref", ref);
        console.log("here in index");

        // const docSnap = await getDoc(ref);
        const fridgeID = snap.data().fridgeID;
        const fridgeCollection = collection(db, "fridges");
        console.log("fridgeCollection", fridgeCollection);

        const fridgeRef = doc(collection(db, "fridges"), fridgeID);
        console.log("fridgeRef", fridgeRef);

        // TODO: get current list of invites on fridge now that this one is deleted and set the fridge user count to that. (idempotence)
    });
