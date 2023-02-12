import * as firestore from "firebase/firestore";
import app from "../../firebase/index.js";
const db = firestore.getFirestore(app);
const auth = "hahaha";

export default class BaseRepo {
    collectionName = null;
    collection = null;
    firestore = firestore;

    constructor(auth, db) {
        // this.auth = auth;
        // this.db = db;
    }

    create() {
        // returns id
    }

    createWithID(id) {}

    async getOne(id, asRef = false) {
        const docRef = await firestore.getDoc(
            firestore.doc(db, this.collectionName, id)
        );

        if (asRef) {
            return docRef;
        }

        return { ...docRef.data(), id: docRef.id };
    }

    // getAll(asRefs = false) {

    // }

    getAllWhere(clause, asRefs = false) {}

    update(id, data) {
        //
    }

    delete(id) {}
}
