import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    deleteDoc,
} from "firebase/firestore";

import BaseRepo from "./BaseRepo.js";

export default class FridgeRepo extends BaseRepo {
    collectionName = "fridges";
    collection = collection(this.db, this.collectionName);

    constructor(auth, db) {
        super(auth, db);
    }

    // async getCurrentUser() {
    // }

    // async getWhetherEmailInUse(email) {
    //     const q = firestore.query(
    //         firestore.collection(this.db, "users"),
    //         firestore.where("email", "==", email)
    //     );

    //     const docs = await firestore.getDocs(q);
    //     if (docs.docs[0]) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
}
