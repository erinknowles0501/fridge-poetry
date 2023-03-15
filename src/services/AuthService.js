import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";

export default class AuthService {
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
            handler(user);
        });
    }
}
