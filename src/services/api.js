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
} from "firebase/firestore";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import app from "../firebase/index.js";
const db = getFirestore(app);
const fbAuth = getAuth();

import { default as defaultWords } from "../defaultWords.json";

class AuthService {
    auth = null;
    user = null;

    constructor(auth) {
        this.auth = auth;

        // TODO Same error handlign service work
        // .catch((error) => {
        //     const errorCode = error.code;
        //     const errorMessage = error.message;
        // });
    }

    async signIn() {
        await signInWithEmailAndPassword(
            this.auth,
            "erinknowles@protonmail.com",
            "testtest111"
        );
        return this.auth.currentUser;
    }

    handleAuthStateChanged(handler) {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.user = user;
                handler(user);
            } else {
                // TODO
            }
        });
    }
}
export const authService = new AuthService(fbAuth);

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
        // TODO Constraints on top and left
        const docRef = this.getDocumentReference(wordID, fridgeID);
        await updateDoc(docRef, {
            "position.y": top,
            "position.x": left,
        });
    }
}

export const wordService = new WordService();

class FridgeService {
    constructor(auth) {
        this.auth = auth;
    }

    async getFridgeByID(fridgeID) {
        const docRef = doc(db, "fridges", fridgeID);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async createFridge(name) {
        // TODO: Create user permissions based on current user
        // TODO: Capture and send user invites
        const newFridgeRef = doc(collection(db, "fridges"));
        await setDoc(newFridgeRef, {
            name: name,
            creatorUID: this.auth.user.uid,
        });
        await this.createWordsOnFridge(newFridgeRef.id);
        return newFridgeRef.id;
    }

    async createWordsOnFridge(fridgeID) {
        defaultWords.forEach(async (word) => {
            await addDoc(collection(db, `fridges/${fridgeID}/words`), {
                wordText: word,
                position: { y: 0, x: 0 },
            });
        });
    }
}

export const fridgeService = new FridgeService(authService);

class UserService {
    // get whether user can access fridge (current, ?)

    constructor(auth) {
        this.auth = auth;
    }

    createUser() {
        return id;
    }

    async getUserByID(id) {
        id = "erintest";

        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    handleCurrentUserDataChange(updateWith, modulesToRerender) {
        const unsub = onSnapshot(doc(db, "users", "erintest"), (doc) => {
            updateWith(doc.data());
            modulesToRerender.forEach((module) => {
                module.render();
            });
        });
    }

    async updateUser(id, data) {
        id = "erintest";
        data = {
            displayName: "E" + Math.random().toString().slice(2, 6),
        };

        const docRef = doc(db, "users", id);
        await updateDoc(docRef, data);
    }

    getFridgesByUser(id) {}
}

export const userService = new UserService(authService);

class InvitationService {
    // create user invite
    // mark invite accepted / revoked
    // get user invite
    // get invites by fridge
    // re-send invite?
}
