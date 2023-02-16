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
import app from "../../firebase/index.js";
const fbdb = getFirestore(app);

export default class BaseRepo {
    collectionName = null;
    collection = null;

    constructor(auth, db = fbdb) {
        this.auth = auth;
        this.db = db;
    }

    async create(data) {
        const newDocRef = doc(this.collection);
        await setDoc(newDocRef, data);
        return newDocRef.id;
    }

    async createWithID(id, data) {
        const newDocRef = doc(this.collection, id);
        await setDoc(newDocRef, data);
        return newDocRef.id;
    }

    async getOne(id, asRef = false) {
        const docRef = await getDoc(doc(this.db, this.collectionName, id));
        if (asRef) return docRef;
        return { ...docRef.data(), id: docRef.id };
    }

    async getAll(asRefs = false) {
        // TODO: This method isn't implemented by some repos (for request-rules reasons): move from here
        const docs = await getDocs(this.collection);
        if (asRefs) return docs;

        let data = [];
        docs.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        return data;
    }

    async update(id, data) {
        const docRef = doc(this.collection, id);
        await updateDoc(docRef, data);
    }

    async delete(id) {
        await deleteDoc(doc(this.collection, id));
    }

    // async upsert

    // async getMany(clause = where(), asRefs = false) {}

    // async updateMany(ids, data) {
    //     // Transaction / batch write
    // }
}
