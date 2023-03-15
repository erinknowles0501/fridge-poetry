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

export default class UserRepo extends BaseRepo {
    collectionName = "users";
    collection = collection(this.db, this.collectionName);

    constructor(db) {
        super(db);
    }

    // async getCurrentUser() {
    // }

    async getWhetherEmailInUse(email) {
        const q = query(this.collection, where("email", "==", email));

        const docs = await getDocs(q);
        if (docs.docs[0]) {
            return true;
        } else {
            return false;
        }
    }
}
