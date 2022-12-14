import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    onSnapshot,
    doc,
    getDoc,
} from "firebase/firestore";

import app from "../firebase/index.js";

const db = getFirestore(app);

class WordService {
    // constructor() {
    //     this.db = getFirestore(app);
    // }

    // TODO Error handling service to route through..

    async getWordsByFridge(/*fridgeID*/) {
        const words = [];

        // TODO: This snapshot listneer should be called and handled elsewhere.
        // const unsub = onSnapshot(collection(db, "defaultWords"), (snapshot) => {
        //     console.log("querySnapshot", snapshot);
        //     const docs = snapshot.docs;
        //     console.log("docs", docs);

        //     // console.log("Current data: ", doc.data());
        //     snapshot.docChanges().forEach((change) => {
        //         //console.log("change", change.doc.data());
        //         const word = await change.doc.data();
        //         word.id = change.doc.id;

        //         words.push(word);
        //         showme(words)

        //         //console.log("doc", doc.data());
        //         // console.log("docs", docs);
        //         // //console.log("docs.data()", docs.data());
        //         // docs.forEach(doc => {

        //         // const word = await doc.data();
        //         // word.id = doc.id;
        //         // words.push(word);
        //     });
        // });

        const snapshot = await getDocs(collection(db, "defaultWords"));
        snapshot.forEach((doc) => {
            words.push({ ...doc.data(), id: doc.id });
        });
        return words;
    }

    getDocumentReference(id) {
        return doc(db, "defaultWords", id);
    }

    async updateWord(wordID, top, left) {
        const docRef = this.getDocumentReference(wordID);

        await updateDoc(docRef, {
            "position.top": top,
            "position.left": left,
        });

        //console.log("result", result);

        // return result;
    }
}

export const wordService = new WordService();

class FridgeService {
    async getFridgeByID(fridgeID) {
        const docRef = doc(db, "fridges", fridgeID);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async createFridge() {
        //
    }
}

export const fridgeService = new FridgeService();

class UserService {
    //
}
