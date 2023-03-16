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
    writeBatch,
} from "firebase/firestore";
import { default as defaultWords } from "../../defaultWords.json" assert { type: "json" };
import { APP_WIDTH, APP_HEIGHT } from "../../fridge/scale.js";

import BaseRepo from "./BaseRepo.js";

export default class FridgeRepo extends BaseRepo {
    collectionName = "fridges";
    collection = collection(this.db, this.collectionName);

    constructor(db) {
        super(db);
    }

    async getOne(id, asRef = false) {
        const fridge = await super.getOne(id, asRef);
        if (asRef) return fridge;

        const words = await this.getWords(id);

        return { ...fridge, id, words };
    }

    async createWords(fridgeID, words = defaultWords) {
        const remSize = 8;
        const paddingX = 0.5 * remSize;
        const paddingY = 0.2 * remSize; // TODO de-magic these

        const batch = writeBatch(this.db);
        words.forEach(async (word) => {
            const x =
                Math.random() * (APP_WIDTH - remSize * word.length - paddingX);
            const y = Math.random() * (APP_HEIGHT - remSize - paddingY);

            batch.set(doc(collection(this.db, `fridges/${fridgeID}/words`)), {
                wordText: word,
                position: { y, x },
            });
        });
        await batch.commit();
    }

    async getWords(fridgeID, asRefs = false) {
        const docs = await getDocs(
            collection(this.db, `fridges/${fridgeID}/words`)
        );

        if (asRefs)
            return docs.docs.map((snap) =>
                doc(this.db, `fridges/${fridgeID}/words`, snap.id)
            );

        let words = [];
        docs.forEach((word) => {
            words.push({ ...word.data(), id: word.id });
        });
        return words;
    }

    async updateWord(wordID, top, left, fridgeID) {
        // TODO Constraints on top and left
        const docRef = doc(this.db, `fridges/${fridgeID}/words`, wordID);
        await updateDoc(docRef, {
            "position.y": top,
            "position.x": left,
        });
    }

    async delete(id) {
        // TODO Also delete permisisons associated with this fridge
        await this.deleteAllWords(id);
        await super.delete(id);
    }

    async deleteWord(wordRef, fridgeID) {
        await deleteDoc(doc(this.db, `fridges/${fridgeID}/words`, wordRef.id));
    }

    async deleteAllWords(fridgeID) {
        const wordRefs = await this.getWords(fridgeID, true);
        const batch = writeBatch(this.db);
        wordRefs.forEach(async (wordRef) => {
            batch.delete(wordRef);
        });
        await batch.commit();
    }
}
