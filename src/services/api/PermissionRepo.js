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

export default class PermissionRepo {
    collectionName = "permissions";

    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
        this.collection = collection(this.db, this.collectionName);
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

    async setPermission(id, permissionArr) {
        const docRef = doc(this.collection, id);
        await setDoc(docRef, {
            permissions: permissionArr,
        });
    }

    async getPermissionsByUser(userID, asRefs = false) {
        const q = query(this.collection, where("userID", "==", userID));
        const refs = (await getDocs(q)).docs;

        if (asRefs) return refs;

        return refs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionsByFridge(fridgeID, asRefs = false) {
        const q = query(this.collection, where("fridgeID", "==", fridgeID));
        const refs = (await getDocs(q)).docs;

        if (asRefs) return refs;

        return refs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionByUserAndFridge(userID, fridgeID) {
        const docRef = await getDoc(
            doc(this.collection, `${fridgeID}_${userID}`)
        );

        if (docRef.exists()) {
            return await docRef.data().permissions;
        } else {
            return false;
        }
    }

    async addToPermission(id, permissionsArr) {
        const docRef = doc(this.collection, id);
        const existingPermissions = (await getDoc(docRef)).data().permissions;

        await updateDoc(docRef, {
            permissions: [...existingPermissions, ...permissionsArr],
        });
    }

    async removeFromPermission(id, permissionsArr) {
        const docRef = doc(this.collection, id);
        const existingPermissions = (await getDoc(docRef)).data().permissions;

        await updateDoc(docRef, {
            permissions: existingPermissions.filter(
                (permission) => !permissionsArr.includes(permission)
            ),
        });
    }

    async delete(id) {
        await deleteDoc(doc(this.db, this.collectionName, id));
    }

    async deleteByFridge(fridgeID) {
        const refs = await this.getPermissionsByFridge(fridgeID, true);

        await Promise.all(
            refs.map(async (ref) => {
                await this.delete(ref.id);
            })
        );
    }

    async deleteByUser(userID) {
        const refs = await this.getPermissionsByUser(userID, true);

        await Promise.all(
            refs.map(async (ref) => {
                await this.delete(ref.id);
            })
        );
    }
}
