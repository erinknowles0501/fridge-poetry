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

import { INVITATION_STATUSES, PERMISSIONS_NAMES } from "../../constants.js";

export default class InviteRepo {
    collectionName = "invitations";

    constructor(db) {
        this.db = db;
        this.collection = collection(this.db, this.collectionName);
    }

    async sendInvite(email, fridgeID, fromID, fromDisplayName) {
        // TODO: This will mostly be handled by callable server-side GC function.
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
        await deleteDoc(doc(this.db, this.collectionName, id));
    }

    async getAccessibleInvitesByFridge(userID, fridgeID) {
        // Returns all invites on this fridge if user has
        // appropriate permissions, otherwise,
        // returns invites on this fridge that this user
        // has sent.
        const permissionsDoc = await getDoc(
            doc(this.db, "permissions", `${fridgeID}_${userID}`)
        );
        const permissions = permissionsDoc.get("permissions");
        const userHasPermission = permissions?.includes(
            PERMISSIONS_NAMES.EDIT_BLACKLIST
        );

        let q;
        if (userHasPermission) {
            q = query(
                this.collection,
                where("fridgeID", "==", fridgeID),
                where("status", "==", INVITATION_STATUSES.PENDING)
            );
        } else {
            q = query(
                this.collection,
                where("fridgeID", "==", fridgeID),
                where("status", "==", INVITATION_STATUSES.PENDING),
                where("fromID", "==", userID)
            );
        }
        const docs = await getDocs(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getAccessibleInvitesByUser(userID) {
        const userDoc = await getDoc(doc(this.db, "users", userID));

        const q = query(
            this.collection,
            where("to", "==", userDoc.get("email")),
            where("status", "==", INVITATION_STATUSES.PENDING)
        );
        const docs = await getDocs(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
}
