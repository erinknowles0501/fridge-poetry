import BaseRepo from "./BaseRepo.js";
import * as firestore from "firebase/firestore";

export default class UserRepo extends BaseRepo {
    collectionName = "users";
    collection = firestore.collection(this.db, this.collectionName);

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
