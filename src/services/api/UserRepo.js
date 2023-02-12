import BaseRepo from "./BaseRepo.js";
import { collection } from "firebase/firestore";

export default class UserRepo extends BaseRepo {
    collectionName = "users";
    collection = collection(this.db, this.collectionName);

    constructor(auth, db, firestore) {
        super(auth, db, firestore);
    }

    getCurrentUser() {
        //
    }
}
