import * as firestore from "firebase/firestore";
import app from "../../firebase/index.js";
const db = firestore.getFirestore(app);
const auth = "hahaha";

export default class BaseRepo {
    collectionName = null;
    collection = null;

    constructor(auth, db, firestore) {
        // this.auth = auth;
        // this.db = db;
        // this.firestore = firestore;
    }

    create() {
        // returns id
    }

    createWithID(id) {}

    async getOne(id, asRef = false) {
        const docSnap = await firestore.getDoc(
            firestore.doc(db, this.collectionName, id)
        );
        if (asRef) {
            return docSnap;
        }
        return { ...docSnap.data(), id: docSnap.id };
    }

    getAll(asRefs = false) {}

    getAllWhere(clause, asRefs = false) {}

    update(id, data) {
        //
    }

    delete(id) {}
}
