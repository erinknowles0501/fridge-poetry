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
    getFunctions,
    connectFunctionsEmulator,
    httpsCallable,
} from "firebase/functions";
import app from "../../firebase/index.js";
import { INVITATION_STATUSES } from "../../constants.js";

const functions = getFunctions(app);

connectFunctionsEmulator(functions, "localhost", 5001);

const helloWorld = httpsCallable(functions, "helloWorld");

try {
    helloWorld({ data: "aaaaa" }).then((result) => console.log(result));
} catch (e) {
    console.log("e", e);
}

export default class InvitesRepo {
    collectionName = "invitations";

    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
        this.collection = collection(this.db, this.collectionName);
    }

    async sendInvite(email, fridgeID, fromID, fromDisplayName) {
        const newInviteRef = doc(this.collection);
        const acceptLink = `http://127.0.0.1:5000/?invite=${newInviteRef.id}`;
        await setDoc(newInviteRef, {
            to: email,
            message: {
                // 'message' property required for firestore-send-email integration
                subject: `${fromDisplayName} has invited you to join a fridge on FridgePoetry!`,
                html: `
        <h2>You've been invited</h2>
        <p><b>Fridge name:</b> ${fridgeID}</p>
        <p>Click the link below to view the invitation.</p>
        <p><a href="${acceptLink}">View</a></p>
                        `,
            },
            fridgeID,
            fromID,
            lastSent: new Date(),
            status: INVITATION_STATUSES.PENDING,
        });
    }

    async getOne(id) {
        const docRef = await getDoc(doc(this.db, this.collectionName, id));
        return { id: docRef.id, ...docRef.data() };
    }

    async acceptInvitation(inviteID) {
        await updateDoc(doc(this.db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.ACCEPTED,
        });
    }

    async denyInvitation(inviteID) {
        await updateDoc(doc(this.db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.DENIED,
        });
    }

    async delete(id) {
        // TODO: Call serv-side func
        //await deleteDoc(doc(this.db, this.collectionName, id));
    }

    async getAccessibleInvites(userID, fridgeID) {
        // TODO: call serv-side func
        // const q = query(
        //     this.collection,
        //     where("fridgeID", "==", fridgeID),
        //     where("fromID", "==", userID)
        // );
        // const docs = await getDocs(q);
        // return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
}
