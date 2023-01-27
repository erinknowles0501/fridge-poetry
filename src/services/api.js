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
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import app from "../firebase/index.js";
const db = getFirestore(app);
const fbAuth = getAuth();
import { APP_WIDTH, APP_HEIGHT } from "../fridge/scale.js";

import { default as defaultWords } from "../defaultWords.json";

class AuthService {
    auth = null;

    constructor(auth) {
        this.auth = auth;
    }

    async signIn(email, password) {
        await signInWithEmailAndPassword(
            this.auth,
            email || "erinknowles@protonmail.com",
            password || "testtest111"
        );
        console.log(
            "this.auth.currentUser after signin",
            this.auth.currentUser
        );

        return this.auth.currentUser;
    }

    async logout() {
        await signOut(this.auth);
        console.log("here");
    }

    async signUp(email, password) {
        await createUserWithEmailAndPassword(this.auth, email, password);
        console.log(
            "this.auth.currentUser after signup",
            this.auth.currentUser
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
        const newFridgeRef = doc(collection(db, "fridges"));
        await setDoc(newFridgeRef, {
            name: name,
            creatorUID: this.auth.currentUser.uid,
        });
        await this.createWordsOnFridge(newFridgeRef.id);

        await addDoc(collection(db, "permissions"), {
            fridgeID: newFridgeRef.id,
            userID: this.auth.currentUser.uid,
            permissions: ["test1", "testttt"],
        });

        return newFridgeRef.id;
    }

    async createWordsOnFridge(fridgeID) {
        const remSize = 8;
        const paddingX = 0.5 * remSize;
        const paddingY = 0.2 * remSize; // TODO de-magic these

        // TODO Batch this so it doesn't take so long
        defaultWords.forEach(async (word) => {
            const x =
                Math.random() * (APP_WIDTH - remSize * word.length - paddingX);
            const y = Math.random() * (APP_HEIGHT - remSize - paddingY);

            await addDoc(collection(db, `fridges/${fridgeID}/words`), {
                wordText: word,
                position: { y, x },
            });
        });
    }
}

export const fridgeService = new FridgeService(authService.auth);

class UserService {
    // get whether user can access fridge (current, ?)

    constructor(auth) {
        this.auth = auth;
    }

    createUser() {
        return id;
    }

    async getUserByID(id) {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    handleCurrentUserDataChange(updateWith) {
        const unsub = onSnapshot(
            doc(db, "users", this.auth.currentUser.uid),
            (doc) => {
                const data = doc.data();
                data.id = doc.id;
                updateWith(data);
            }
        );
    }

    async updateUser(id, data) {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, data);
    }

    async getPermissionsByUser(id) {
        const permissionQuery = query(
            collection(db, "permissions"),
            where("userID", "==", id)
        );
        const docs = await getDocs(permissionQuery);

        return docs.docs.map((doc) => doc.data());
    }

    async getFridgesByUser(id) {
        const permissions = await this.getPermissionsByUser(id);
        const fridges = [];
        permissions.forEach((permission) => {
            if (!fridges.includes(permission.fridgeID)) {
                fridges.push(permission.fridgeID);
            }
        });
        return fridges;
    }

    async getPermissionsByUserAndFridge(userID, fridgeID) {
        const userPermissions = await this.getPermissionsByUser(userID);
        const userFridgePermissions = userPermissions.find(
            (entry) => entry.fridgeID == fridgeID
        ).permissions;
        return userFridgePermissions;
    }
}

export const userService = new UserService(authService.auth);

class InvitationService {
    // create user invite
    // mark invite accepted / revoked
    // get user invite
    // get invites by fridge
    // re-send invite?
}
