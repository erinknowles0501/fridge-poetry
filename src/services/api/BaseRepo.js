import { getFirestore, collection, getDoc, doc } from "firebase/firestore";
import app from "../../firebase/index.js";
const db = getFirestore(app);

export default class BaseRepo {
    collectionName = null;
    db = db;

    constructor(auth) {
        this.auth = auth;
    }

    create() {
        // returns id
    }

    createWithID(id) {}

    async getOne(id, asRef = false) {
        const docSnap = await getDoc(doc(db, this.collectionName, id));
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
