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
        const docs = await getDocs(this.collection);
        if (asRefs) return docs;

        let data = [];
        docs.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        return data;
    }

    //getMany(clause = , asRefs = false) {}

    update(id, data) {
        //
    }

    // updateMany(ids, data) {
    //     // Transaction / batch write
    // }

    delete(id) {}
}
