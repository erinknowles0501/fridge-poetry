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
} from "firebase/firestore";
import app from "../firebase/index.js";
const db = getFirestore(app);

import { default as defaultWords } from "../defaultWords.json";

class WordService {
    // TODO Error handling service to route through..

    async getWordsByFridge(fridgeID) {
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
        try {
            const snapshot = await getDocs(
                collection(db, `fridges/${fridgeID}/words`)
            );
            snapshot.forEach((doc) => {
                words.push({ ...doc.data(), id: doc.id });
            });
            return words;
        } catch (e) {
            console.error(e);
        }
    }

    getDocumentReference(id, fridgeID) {
        return doc(db, `fridges/${fridgeID}/words`, id);
    }

    async updateWord(wordID, top, left, fridgeID) {
        const docRef = this.getDocumentReference(wordID, fridgeID);
        await updateDoc(docRef, {
            "position.top": top,
            "position.left": left,
        });
    }
}

export const wordService = new WordService();

class FridgeService {
    async getFridgeByID(fridgeID) {
        const docRef = doc(db, "fridges", fridgeID);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async createFridge(name) {
        const newFridgeRef = doc(collection(db, "fridges"));
        await setDoc(newFridgeRef, { name: name });
        await this.createWordsOnFridge(newFridgeRef.id);
        return newFridgeRef.id;
    }

    async createWordsOnFridge(fridgeID) {
        defaultWords.forEach(async (word) => {
            await addDoc(collection(db, `fridges/${fridgeID}/words`), {
                wordText: word,
                position: { top: 0, left: 0 },
            });
        });
    }
}

export const fridgeService = new FridgeService();

class UserService {
    //
}
