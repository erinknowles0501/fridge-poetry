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
import { INVITATION_STATUSES, PERMISSIONS_NAMES } from "../constants.js";

class AuthService {
    auth = null;

    constructor(auth) {
        this.auth = auth;
    }

    async signIn(email, password) {
        await signInWithEmailAndPassword(this.auth, email, password);
        return this.auth.currentUser;
    }

    async logout() {
        await signOut(this.auth);
    }

    async signUp(email, password) {
        await createUserWithEmailAndPassword(this.auth, email, password);
        return this.auth.currentUser;
    }

    handleAuthStateChanged(handler) {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
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
        const newFridgeRef = doc(collection(db, "fridges"));
        await setDoc(newFridgeRef, {
            name: name,
            creatorUID: this.auth.currentUser.uid,
            maxUsers: 20,
            maxCustomWords: 5,
        });
        await this.createWordsOnFridge(newFridgeRef.id);
        return newFridgeRef.id;
    }

    async createWordsOnFridge(fridgeID) {
        const remSize = 8;
        const paddingX = 0.5 * remSize;
        const paddingY = 0.2 * remSize; // TODO de-magic these

        const batch = writeBatch(db);
        defaultWords.forEach(async (word) => {
            const x =
                Math.random() * (APP_WIDTH - remSize * word.length - paddingX);
            const y = Math.random() * (APP_HEIGHT - remSize - paddingY);

            batch.set(doc(collection(db, `fridges/${fridgeID}/words`)), {
                wordText: word,
                position: { y, x },
            });
        });
        await batch.commit();
    }

    async updateFridge(fridgeID, data) {
        const fridgeRef = doc(db, "fridges", fridgeID);
        await updateDoc(fridgeRef, data);
    }

    async deleteFridge(fridgeID) {
        await deleteDoc(doc(db, "fridges", fridgeID));
    }
}
export const fridgeService = new FridgeService(authService.auth);

class UserService {
    // get whether user can access fridge (current, ?)

    constructor(auth) {
        this.auth = auth;
    }

    async createUser(id, data) {
        await setDoc(doc(db, "users", id), data);
    }

    async getUserByID(id) {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async updateUser(id, data) {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, data);
    }

    async getWhetherAUserHasEmail(email, returnUser = false) {
        const q = query(collection(db, "users"), where("email", "==", email));
        const docs = await getDocs(q);
        if (docs.docs[0]) {
            return returnUser
                ? { ...docs.docs[0].data(), id: docs.docs[0].id }
                : true;
        } else {
            return false;
        }
    }
}
export const userService = new UserService(authService.auth);

class InvitationService {
    // mark invite/ revoked
    // get invites by fridge
    // re-send invite?

    constructor(auth) {
        this.auth = auth;
        this.collectionName = "invitations";
        this.collection = collection(db, this.collectionName);
    }

    async sendInvite(email, fridgeID, senderDisplayName) {
        const newInviteRef = doc(this.collection);
        const acceptLink = `http://127.0.0.1:5000/?invite=${newInviteRef.id}`;
        await setDoc(newInviteRef, {
            to: email,
            message: {
                // 'message' property required for firestore-send-email integration
                subject: `${senderDisplayName} has invited you to join a fridge on FridgePoetry!`,
                html: `
        <h2>You've been invited</h2>
        <p><b>Fridge name:</b> ${fridgeID}</p>
        <p>Click the link below to view the invitation.</p>
        <p><a href="${acceptLink}">View</a></p>
                        `,
            },
            fridgeID: fridgeID,
            fromID: this.auth.currentUser.uid,
            lastSent: new Date(),
            status: INVITATION_STATUSES.PENDING,
        });
    }

    async getInvitation(inviteID) {
        const docSnap = await getDoc(doc(db, this.collectionName, inviteID));
        return { id: inviteID, ...docSnap.data() };
    }

    async acceptInvitation(inviteID) {
        await updateDoc(doc(db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.ACCEPTED,
        });
    }

    async getInvitationsByFridge(fridgeID) {
        const q = query(this.collection, where("fridgeID", "==", fridgeID));
        const docs = await getDocs(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getSentInvitesByUser(userID) {
        const q = query(this.collection, where("fromID", "==", userID));
        const docs = await getDocs(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
}
export const invitationService = new InvitationService(authService.auth);

class PermissionService {
    constructor(auth) {
        this.auth = auth;
        this.collectionName = "permissions";
        this.collection = collection(db, this.collectionName);
    }

    async getPermissionsByUser(userID) {
        const q = query(this.collection, where("userID", "==", userID));
        const docs = await getDocs(q);
        return docs.docs.map((doc) => doc.data());
    }

    async getPermissionRefsByFridge(fridgeID) {
        const q = query(this.collection, where("fridgeID", "==", fridgeID));
        const docs = await getDocs(q);
        return docs.docs;
    }

    async getPermissionsByFridge(fridgeID) {
        const permissionRefs = await this.getPermissionRefsByFridge(fridgeID);
        return permissionRefs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionsByUserAndFridge(userID, fridgeID) {
        const docRef = await getDoc(
            doc(this.collection, `${fridgeID}_${userID}`)
        );

        if (docRef.exists()) {
            return await docRef.data().permissions;
        } else {
            return false;
        }
    }

    async writeInvitedPermission(userID, fridgeID) {
        await this.create(fridgeID, userID, [PERMISSIONS_NAMES.INVITED]);
    }

    async create(fridgeID, userID, permissionArr) {
        // Creates doc at id if not exists, otherwise, gets it and updates it
        const docRef = doc(this.collection, `${fridgeID}_${userID}`);
        await setDoc(docRef, {
            fridgeID,
            userID,
            permissions: permissionArr,
        });
    }

    async delete(id) {
        await deleteDoc(doc(db, this.collectionName, id));
    }
}

export const permissionService = new PermissionService(authService.auth);
