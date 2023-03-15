import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { A as Aa, U as Ul, O as Ol, B as Bl, K as Kl, G as Gl, T as Ta, s as sl, r as rl, b as af, c as APP_WIDTH, d as defaultWords, j as APP_HEIGHT, P as PERMISSIONS_NAMES, I as INVITATION_STATUSES, e as signInWithEmailAndPassword, f as signOut, h as createUserWithEmailAndPassword, i as onAuthStateChanged, o as oh, g as getAuth, a as app, k as PERMISSION_GROUPS } from './chunks/constants.js';

class BaseRepo {
    collectionName = null;
    collection = null;

    constructor(db) {
        this.db = db;
    }

    async create(data) {
        const newDocRef = Aa(this.collection);
        await Ul(newDocRef, data);
        return newDocRef.id;
    }

    async createWithID(id, data) {
        const newDocRef = Aa(this.collection, id);
        await Ul(newDocRef, data);
        return newDocRef.id;
    }

    async getOne(id, asRef = false) {
        const docRef = await Ol(Aa(this.db, this.collectionName, id));
        if (asRef) return docRef;
        return { ...docRef.data(), id: docRef.id };
    }

    async getAll(asRefs = false) {
        // TODO: This method isn't implemented by some repos (for request-rules reasons): move from here
        const docs = await Bl(this.collection);
        if (asRefs) return docs;

        let data = [];
        docs.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        return data;
    }

    async update(id, data) {
        const docRef = Aa(this.collection, id);
        await Kl(docRef, data);
    }

    async delete(id) {
        await Gl(Aa(this.collection, id));
    }

    // async upsert

    // async getMany(clause = where(), asRefs = false) {}

    // async updateMany(ids, data) {
    //     // Transaction / batch write
    // }
}

class UserRepo extends BaseRepo {
    collectionName = "users";
    collection = Ta(this.db, this.collectionName);

    constructor(db) {
        super(db);
    }

    // async getCurrentUser() {
    // }

    async getWhetherEmailInUse(email) {
        const q = sl(this.collection, rl("email", "==", email));

        const docs = await Bl(q);
        if (docs.docs[0]) {
            return true;
        } else {
            return false;
        }
    }
}

class FridgeRepo extends BaseRepo {
    collectionName = "fridges";
    collection = Ta(this.db, this.collectionName);

    constructor(db) {
        super(db);
    }

    async create(data) {
        data = {
            maxUsers: 20,
            maxCustomWords: 5,
            ...data,
        };
        const fridgeID = await super.create(data);
        await this.createWords(fridgeID);
        return fridgeID;
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

        const batch = af(this.db);
        words.forEach(async (word) => {
            const x =
                Math.random() * (APP_WIDTH - remSize * word.length - paddingX);
            const y = Math.random() * (APP_HEIGHT - remSize - paddingY);

            batch.set(Aa(Ta(this.db, `fridges/${fridgeID}/words`)), {
                wordText: word,
                position: { y, x },
            });
        });
        await batch.commit();
    }

    async getWords(fridgeID, asRefs = false) {
        const docs = await Bl(
            Ta(this.db, `fridges/${fridgeID}/words`)
        );

        if (asRefs)
            return docs.docs.map((snap) =>
                Aa(this.db, `fridges/${fridgeID}/words`, snap.id)
            );

        let words = [];
        docs.forEach((word) => {
            words.push({ ...word.data(), id: word.id });
        });
        return words;
    }

    async updateWord(wordID, top, left, fridgeID) {
        // TODO Constraints on top and left
        const docRef = Aa(this.db, `fridges/${fridgeID}/words`, wordID);
        await Kl(docRef, {
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
        await Gl(Aa(this.db, `fridges/${fridgeID}/words`, wordRef.id));
    }

    async deleteAllWords(fridgeID) {
        const wordRefs = await this.getWords(fridgeID, true);
        const batch = af(this.db);
        wordRefs.forEach(async (wordRef) => {
            batch.delete(wordRef);
        });
        await batch.commit();
    }
}

class InviteRepo {
    collectionName = "invitations";

    constructor(db) {
        this.db = db;
        this.collection = Ta(this.db, this.collectionName);
    }

    async sendInvite(email, fridgeID, fromID, fromDisplayName) {
        // TODO: This will mostly be handled by callable server-side GC function.
        const newInviteRef = Aa(this.collection);
        const acceptLink = `http://127.0.0.1:5000/?invite=${newInviteRef.id}`;
        await Ul(newInviteRef, {
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
        const docRef = await Ol(Aa(this.db, this.collectionName, id));
        return { id: docRef.id, ...docRef.data() };
    }

    async acceptInvitation(inviteID) {
        await Kl(Aa(this.db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.ACCEPTED,
        });
    }

    async denyInvitation(inviteID) {
        await Kl(Aa(this.db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.DENIED,
        });
    }

    async delete(id) {
        await Gl(Aa(this.db, this.collectionName, id));
    }

    async getAccessibleInvitesByFridge(userID, fridgeID) {
        // Returns all invites on this fridge if user has
        // appropriate permissions, otherwise,
        // returns invites on this fridge that this user
        // has sent.
        const permissionsDoc = await Ol(
            Aa(this.db, "permissions", `${fridgeID}_${userID}`)
        );
        const permissions = permissionsDoc.get("permissions");
        const userHasPermission = permissions?.includes(
            PERMISSIONS_NAMES.EDIT_BLACKLIST
        );

        let q;
        if (userHasPermission) {
            q = sl(
                this.collection,
                rl("fridgeID", "==", fridgeID),
                rl("status", "==", INVITATION_STATUSES.PENDING)
            );
        } else {
            q = sl(
                this.collection,
                rl("fridgeID", "==", fridgeID),
                rl("status", "==", INVITATION_STATUSES.PENDING),
                rl("fromID", "==", userID)
            );
        }
        const docs = await Bl(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getAccessibleInvitesByUser(userID) {
        const userDoc = await Ol(Aa(this.db, "users", userID));

        const q = sl(
            this.collection,
            rl("to", "==", userDoc.get("email")),
            rl("status", "==", INVITATION_STATUSES.PENDING)
        );
        const docs = await Bl(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
}

class PermissionRepo {
    collectionName = "permissions";

    constructor(db) {
        this.db = db;
        this.collection = Ta(this.db, this.collectionName);
    }

    async create(fridgeID, userID, permissionArr) {
        // Creates doc at id if not exists, otherwise, gets it and updates it
        const docRef = Aa(this.collection, `${fridgeID}_${userID}`);

        await Ul(docRef, {
            fridgeID,
            userID,
            permissions: permissionArr,
        });
    }

    async setPermission(id, permissionArr) {
        const docRef = Aa(this.collection, id);
        await Ul(docRef, {
            permissions: permissionArr,
        });
    }

    async getPermissionsByUser(userID, asRefs = false) {
        const q = sl(this.collection, rl("userID", "==", userID));
        const refs = (await Bl(q)).docs;

        if (asRefs) return refs;

        return refs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionsByFridge(fridgeID, asRefs = false) {
        const q = sl(this.collection, rl("fridgeID", "==", fridgeID));
        const refs = (await Bl(q)).docs;

        if (asRefs) return refs;

        return refs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionByUserAndFridge(userID, fridgeID) {
        const docRef = await Ol(
            Aa(this.collection, `${fridgeID}_${userID}`)
        );

        if (docRef.exists()) {
            return await docRef.data().permissions;
        } else {
            return false;
        }
    }

    async addToPermission(id, permissionsArr) {
        const docRef = Aa(this.collection, id);
        const existingPermissions = (await Ol(docRef)).data().permissions;

        await Kl(docRef, {
            permissions: [...existingPermissions, ...permissionsArr],
        });
    }

    async removeFromPermission(id, permissionsArr) {
        const docRef = Aa(this.collection, id);
        const existingPermissions = (await Ol(docRef)).data().permissions;

        await Kl(docRef, {
            permissions: existingPermissions.filter(
                (permission) => !permissionsArr.includes(permission)
            ),
        });
    }

    async delete(id) {
        await Gl(Aa(this.db, this.collectionName, id));
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
            handler(user);
        });
    }
}

const firestore = oh(app);
const auth = getAuth(app);

const authService = new AuthService(auth);
const userRepo = new UserRepo(firestore);
const fridgeRepo = new FridgeRepo(firestore);
const inviteRepo = new InviteRepo(firestore);
const permissionRepo = new PermissionRepo(firestore);

var LoginSignup = {
    emits: ["changeActiveComponent"],
    data() {
        return {
            isSigningUp: false,
            error: "",
            email: "",
            password: "",
            passwordConfirm: "",
            hasInviteParam: false,
            invite: null,
        };
    },
    computed: {
        disableSignup() {
            return this.disableLogin || this.password != this.passwordConfirm;
        },
        disableLogin() {
            return !(this.email && this.password);
        },
        randomDefaultWords() {
            const numberOfWords = 3;
            const words = [];
            const suitableDefaultWords = defaultWords.filter(
                (word) => word.length > 3
            );
            const randomIndexes = [];

            for (let i = 0; i < numberOfWords; i++) {
                const randomIndex = Math.floor(
                    Math.random() * suitableDefaultWords.length
                );
                if (randomIndexes.includes(randomIndex)) {
                    i--;
                } else {
                    randomIndexes.push(randomIndex);
                }
            }

            randomIndexes.forEach((index) => {
                words.push(suitableDefaultWords[index]);
            });

            return words;
        },
        randomTranslate() {
            return [
                this.getRandomTranslate(),
                this.getRandomTranslate(),
                this.getRandomTranslate(),
            ];
        },
    },
    created() {
        authService.handleAuthStateChanged((state) => {
            if (state?.uid) {
                this.$emit("changeActiveComponent", "FridgeSelection");
            }
        });

        this.hasInviteParam = window.location.search
            .slice(1)
            .includes("invite");
        if (this.hasInviteParam) {
            const inviteID = window.location.search
                .slice(1)
                .split("&")
                .find((param) => param.includes("invite"))
                .split("=")[1];
            inviteRepo
                .getOne(inviteID)
                .then((invite) => this.invitationHandler(invite));
        }
    },

    template: `
        <Transition appear>
            <div class="word-display">
                <div v-for="(word, index) in randomDefaultWords" class="word" :style="'transform: translate(' + randomTranslate[index] + ')'">
                    {{ word }}
                </div>
            </div>
        </Transition>

        <div class="form" @keyup.enter="submitForm">
            <Transition appear>
                <div class="error" v-if="error"><span>Error:</span> {{ error }}</div>
            </Transition>

            <label>
                <p>Email:</p>
                <input type="email" v-model="email" autofocus>
            </label>
            <label>
                <p>Password:</p>
                <input type="password" v-model="password">
            </label>

            <Transition appear>
                <label v-if="isSigningUp">
                    <p>Confirm Password:</p>
                    <input type="password" v-model="passwordConfirm">
                </label>
            </Transition>

            <Transition>
                <div class="button-row" v-if="!isSigningUp">
                    <button @click="isSigningUp = true" class="sub" tabindex="-1">Sign up?</button>
                    <button @click="submitForm" :disabled="disableLogin">Log in</button>
                </div>
                <div class="button-row" v-else>
                    <button @click="isSigningUp = false" class="sub" tabindex="-1">Log in?</button>
                    <button @click="submitForm" :disabled="disableSignup">Sign up</button>
                </div>
            </Transition>
        </div>
    `,
    methods: {
        async invitationHandler(invite) {
            if (invite.status !== INVITATION_STATUSES.PENDING) {
                // TODO: Error toast
                console.error("Invite does not exist or is not pending.");
                window.location.search = window.location.search
                    .replace("invite=", "")
                    .replace(invite.id, "");
                return;
            }

            if (authService.auth.currentUser) {
                if (authService.auth.currentUser.email !== invite.to) {
                    // TODO: Error toast w/ logout + link prompt
                    console.error(
                        "Invite email / current user email mismatch."
                    );
                    window.location.search = window.location.search
                        .replace("invite=", "")
                        .replace(invite.id, "");
                    return;
                }

                window.location.pathname = invite.fridgeID;
            } else {
                const emailMatchesUser = await userRepo.getWhetherEmailInUse(
                    invite.to
                );

                this.email = invite.to;
                this.isSigningUp = !emailMatchesUser;
                this.invite = invite;
            }
        },
        async login() {
            try {
                await authService.signIn(this.email, this.password);
                return true;
            } catch (error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        this.error = "Invalid email format.";
                        break;
                    case "auth/user-not-found":
                    case "auth/wrong-password":
                        // TODO: Email error obfuscation with Identity or..?
                        // https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection
                        this.error = "Email/password incorrect.";
                        break;
                    default:
                        this.error =
                            "Something's broken - please show us this message: " +
                            error;
                }
            }
        },
        async signUp() {
            try {
                const createdUser = await authService.signUp(
                    this.email,
                    this.password
                );
                const emailName = this.email.split("@")[0];
                await userRepo.createWithID(createdUser.uid, {
                    displayName: emailName,
                    displayColor: 0,
                    email: this.email,
                });
                return true;
            } catch (error) {
                switch (error.code) {
                    case "auth/invalid-email":
                        this.error = "Invalid email format.";
                        break;
                    case "auth/email-already-in-use":
                        this.error =
                            "Can't sign up with that email - log in instead, or reset your password.";
                        break;
                    case "auth/weak-password":
                        this.error =
                            "Password must be at least 6 characters long.";
                        break;
                    default:
                        this.error =
                            "Something's broken - please show us this message: " +
                            error;
                }
            }
        },
        async submitForm() {
            const success = this.isSigningUp
                ? !this.disableSignup && (await this.signUp())
                : !this.disableLogin && (await this.login());

            if (success) {
                this.$emit("changeActiveComponent", "FridgeSelection");
            }
        },
        getRandomTranslate() {
            const MAX_PX_AMOUNT = 5;
            function getRandom() {
                const sign = Math.random() < 0.5 ? "-" : "";
                return sign + Math.round(Math.random() * MAX_PX_AMOUNT) + "px";
            }
            return getRandom() + ", " + getRandom();
        },
    },
};

var FridgeSelection = {
    data() {
        return {
            fridges: [],
            user: {},
        };
    },
    emits: ["changeActiveComponent"],
    template: `
        <div class="fridge-selection">
            <div class="welcome">Welcome, <b>{{user.displayName}}</b> <a href="" @click.prevent="logout">(Log out)</a></div>
            <div>Select a fridge:</div>
            <a v-for="fridge in fridges" :href="'/' + fridge.id" class="fridge">{{ fridge.name }}</a>
            <div style="margin-top:1rem;">or, <a href="" @click.prevent="$emit('changeActiveComponent', 'NewFridge')" class="fridge" style="display: inline">create a new fridge...</a></div>
        </div>
    `,
    created() {
        const currentUserUID = authService.auth.currentUser.uid;

        userRepo.getOne(currentUserUID).then((user) => (this.user = user));

        permissionRepo
            .getPermissionsByUser(currentUserUID)
            .then(async (permissions) => {
                const fridgeIDs = [];
                permissions.forEach((permission) => {
                    if (!fridgeIDs.includes(permission.fridgeID)) {
                        fridgeIDs.push(permission.fridgeID);
                    }
                });
                this.fridges = await Promise.all(
                    fridgeIDs.map(async (fridgeID) => {
                        return await fridgeRepo.getOne(fridgeID);
                    })
                );
            })
            .catch((error) => {
                console.error(error);
            });
    },
    methods: {
        async logout() {
            await authService.logout();
            window.location = "/";
        },
    },
};

var NewFridge = {
    data() {
        return {
            name: "",
            isWorking: false,
        };
    },
    template: `
        <div>
            <label><p>New fridge name:</p>
                <input type="text" ref="name" v-model="name" autofocus @keyup.enter="newFridge" :disabled="isWorking" />
            </label>
            <button :disabled="!name || isWorking" @click="newFridge">Make new fridge</button>
        </div>
    `,
    mounted() {
        this.$refs.name.focus();
    },
    methods: {
        async newFridge() {
            try {
                this.$refs.name.blur();
                this.isWorking = true;

                // TODO: Fridge 'owners'
                const newFridgeID = await fridgeRepo.create({
                    name: this.name,
                    owners: [authService.auth.currentUser.uid],
                });
                await permissionRepo.create(
                    newFridgeID,
                    authService.auth.currentUser.uid,
                    [
                        ...PERMISSION_GROUPS.FRIDGE_OWNER,
                        ...PERMISSION_GROUPS.OPTIONAL,
                    ]
                );
                window.location = newFridgeID;
            } catch (error) {
                // TODO
                console.log(error);
            }
        },
    },
};

function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection, NewFridge },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @changeActiveComponent="activeComponent = $event" />
            </div>
        `,
    });

    app.mount("#app");
}

startUI();
