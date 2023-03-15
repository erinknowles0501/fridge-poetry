import { o as oh, g as getAuth, a as app, A as Aa, O as Ol, T as Ta, U as Ul, b as af, d as defaultWords, c as APP_WIDTH, K as Kl, G as Gl, s as sl, r as rl, B as Bl, I as INVITATION_STATUSES, P as PERMISSIONS_NAMES, e as signInWithEmailAndPassword, f as signOut, h as createUserWithEmailAndPassword, i as onAuthStateChanged, j as APP_HEIGHT, k as PERMISSION_GROUPS, l as scaleApp } from './chunks/constants.js';
import { computed, reactive, createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const db = oh(app);
const fbAuth = getAuth();

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
            }
        });
    }
}
const authService = new AuthService(fbAuth);

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
            const snapshot = await Bl(
                Ta(db, `fridges/${fridgeID}/words`)
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
        return Aa(db, `fridges/${fridgeID}/words`, id);
    }

    async updateWord(wordID, top, left, fridgeID) {
        // TODO Constraints on top and left
        const docRef = this.getDocumentReference(wordID, fridgeID);
        await Kl(docRef, {
            "position.y": top,
            "position.x": left,
        });
    }
}

const wordService = new WordService();

class FridgeService {
    constructor(auth) {
        this.auth = auth;
    }

    async getFridgeByID(fridgeID) {
        const docRef = Aa(db, "fridges", fridgeID);
        const docSnap = await Ol(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async createFridge(name) {
        const newFridgeRef = Aa(Ta(db, "fridges"));
        await Ul(newFridgeRef, {
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

        const batch = af(db);
        defaultWords.forEach(async (word) => {
            const x =
                Math.random() * (APP_WIDTH - remSize * word.length - paddingX);
            const y = Math.random() * (APP_HEIGHT - remSize - paddingY);

            batch.set(Aa(Ta(db, `fridges/${fridgeID}/words`)), {
                wordText: word,
                position: { y, x },
            });
        });
        await batch.commit();
    }

    async updateFridge(fridgeID, data) {
        const fridgeRef = Aa(db, "fridges", fridgeID);
        await Kl(fridgeRef, data);
    }

    async deleteFridge(fridgeID) {
        await Gl(Aa(db, "fridges", fridgeID));
    }
}
const fridgeService = new FridgeService(authService.auth);

class UserService {
    // get whether user can access fridge (current, ?)

    constructor(auth) {
        this.auth = auth;
    }

    async createUser(id, data) {
        await Ul(Aa(db, "users", id), data);
    }

    async getUserByID(id) {
        const docRef = Aa(db, "users", id);
        const docSnap = await Ol(docRef);
        return { ...docSnap.data(), id: docSnap.id };
    }

    async updateUser(id, data) {
        const docRef = Aa(db, "users", id);
        await Kl(docRef, data);
    }

    async getWhetherAUserHasEmail(email, returnUser = false) {
        const q = sl(Ta(db, "users"), rl("email", "==", email));
        const docs = await Bl(q);
        if (docs.docs[0]) {
            return returnUser
                ? { ...docs.docs[0].data(), id: docs.docs[0].id }
                : true;
        } else {
            return false;
        }
    }
}
const userService = new UserService(authService.auth);

class InvitationService {
    // mark invite/ revoked
    // get invites by fridge
    // re-send invite?

    constructor(auth) {
        this.auth = auth;
        this.collectionName = "invitations";
        this.collection = Ta(db, this.collectionName);
    }

    async sendInvite(email, fridgeID, senderDisplayName) {
        const newInviteRef = Aa(this.collection);
        const acceptLink = `http://127.0.0.1:5000/?invite=${newInviteRef.id}`;
        await Ul(newInviteRef, {
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
        const docSnap = await Ol(Aa(db, this.collectionName, inviteID));
        return { id: inviteID, ...docSnap.data() };
    }

    async acceptInvitation(inviteID) {
        await Kl(Aa(db, this.collectionName, inviteID), {
            status: INVITATION_STATUSES.ACCEPTED,
        });
    }

    async getInvitationsByFridge(fridgeID) {
        const q = sl(this.collection, rl("fridgeID", "==", fridgeID));
        const docs = await Bl(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getSentInvitesByUser(userID) {
        const q = sl(this.collection, rl("fromID", "==", userID));
        const docs = await Bl(q);
        return docs.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }
}
const invitationService = new InvitationService(authService.auth);

class PermissionService {
    constructor(auth) {
        this.auth = auth;
        this.collectionName = "permissions";
        this.collection = Ta(db, this.collectionName);
    }

    async getPermissionsByUser(userID) {
        const q = sl(this.collection, rl("userID", "==", userID));
        const docs = await Bl(q);
        return docs.docs.map((doc) => doc.data());
    }

    async getPermissionRefsByFridge(fridgeID) {
        const q = sl(this.collection, rl("fridgeID", "==", fridgeID));
        const docs = await Bl(q);
        return docs.docs;
    }

    async getPermissionsByFridge(fridgeID) {
        const permissionRefs = await this.getPermissionRefsByFridge(fridgeID);
        return permissionRefs.map((doc) => ({ ...doc.data(), id: doc.id }));
    }

    async getPermissionsByUserAndFridge(userID, fridgeID) {
        const docRef = await Ol(
            Aa(this.collection, `${fridgeID}_${userID}`)
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
        const docRef = Aa(this.collection, `${fridgeID}_${userID}`);
        await Ul(docRef, {
            fridgeID,
            userID,
            permissions: permissionArr,
        });
    }

    async delete(id) {
        await Gl(Aa(db, this.collectionName, id));
    }
}

const permissionService = new PermissionService(authService.auth);

var services = /*#__PURE__*/Object.freeze({
    __proto__: null,
    authService: authService,
    wordService: wordService,
    fridgeService: fridgeService,
    userService: userService,
    invitationService: invitationService,
    permissionService: permissionService
});

function setElementPosition(element, positionY, positionX) {
    element.style.top = positionY + "px";
    element.style.left = positionX + "px";
}

class Store {
    appEl = null;
    fridge = {
        id: null,
        info: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = null;
    services = {};
    id = Date.now();

    async initialize(services) {
        this.clear();

        this.services = services;
        this.appEl = document.querySelector("#app");

        this.fridge.id = window.location.pathname.slice(1);
        this.fridge.info = await this.services.fridgeService.getFridgeByID(
            this.fridge.id
        );
        this.fridge.words = await this.services.wordService.getWordsByFridge(
            this.fridge.id
        );

        this._user = await this.services.userService.getUserByID(
            this.services.authService.auth.currentUser.uid
        );
        this._user.permissions =
            await this.services.permissionService.getPermissionsByUserAndFridge(
                this._user.id,
                this.fridge.id
            );
        this.makeUpdateProxy(
            this._user,
            this,
            "user",
            services.userService.updateUser
        );
    }

    clear() {
        Object.assign(this, new Store()); // TODO double check this...
    }

    makeUpdateProxy(plainObj, target, key, update) {
        const proxy = new Proxy(plainObj, {
            set(obj, prop, value) {
                if (obj.id) {
                    update(obj.id, {
                        [prop]: value,
                    });
                }
                return Reflect.set(...arguments);
            },
        });
        target[key] = proxy;
    }
}

const store = new Store();

function makeFridge() {
    makeWordEls();
    addAppDragListeners();
}

function makeWordEls() {
    store.fridge.words.forEach((word) => {
        const el = document.createElement("div");
        el.className = "word";
        el.textContent = word.wordText; // TODO Checks to assume this is safely escaped
        el.dataset.id = word.id;
        el.setAttribute("draggable", true);
        setElementPosition(el, word.position.y, word.position.x);

        addListeners(el);
        word.element = el;
        store.appEl.appendChild(el);
    });
}

function addListeners(element) {
    element.addEventListener("dragstart", (event) => {
        store.currentDrag.offset.x = event.offsetX;
        store.currentDrag.offset.y = event.offsetY;

        store.currentDrag.el = element;
    });
}

/** DRAG AND DROP **/

function addAppDragListeners() {
    store.appEl.addEventListener(
        "dragover",
        (event) => {
            event.preventDefault();
        },
        false
    );

    store.appEl.addEventListener("drop", (event) => {
        event.preventDefault();

        const adjustedX = Math.round(
            event.pageX / store.scale.x - store.currentDrag.offset.x
        );
        const adjustedY = Math.round(
            event.pageY / store.scale.y - store.currentDrag.offset.y
        );

        setElementPosition(store.currentDrag.el, adjustedY, adjustedX);
        wordService.updateWord(
            store.currentDrag.el.getAttribute("data-id"),
            adjustedY,
            adjustedX,
            store.fridge.id
        );
    });
}

var UserColorDisplay = {
    inject: ["store"],
    computed: {
        colorValue() {
            return `hsl(${this.store.user.displayColor}deg 100% 50%)`;
        },
    },
    template: `
        <div class="user-color" :style="'background: ' + colorValue"></div>
    `,
};

var User = {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate", "store"],
    components: { UserColorDisplay },
    template: `
    <div class="user">
        <h3 class="user-name" v-if="!isOpen"><UserColorDisplay/>{{ store.user.displayName }}</h3>
        <div class="menu" style="margin-top: 3rem;" v-else>
            <div class="menu-title">Logged in as <div style="display: inline-block"><UserColorDisplay/><span>{{ store.user?.displayName }}</span></div></div>
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

var Fridge = {
    name: "fridge",
    props: ["isOpen", "menuItems"],
    inject: ["navigate", "store"],
    template: `
    <div class="fridge">
        <h2 :class="['fridge-name', {'ellipsis-overflow': !isOpen}]">{{ store.fridge.info.name }}</h2>
        <div v-if="isOpen" class="menu">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

var MenuRoot = {
    props: ["isOpen", "menuItems"],
    components: { Fridge, User },
    template: `
    <div>
        <Fridge :isOpen="isOpen" :menuItems="menuItems.fridge" />
        <User :isOpen="isOpen" :menuItems="menuItems.user" />
    </div>
    `,
};

var UserSettings = {
    inject: ["store"],
    data() {
        return {
            localDisplayName: "",
        };
    },
    computed: {
        getDisplayColors() {
            // TODO get fridge settings - max number of users - divide 360/max users. For now assume 20 max users.
            const maxUsers = 20;
            const step = 360 / maxUsers;

            const hues = [];
            for (let i = 0; i < 360; i += step) {
                hues.push(Math.round(i));
            }

            return hues;
        },
    },
    methods: {
        setDisplayName() {
            // TODO Validation, better sanitization
            const tempValue = this.localDisplayName.replace(
                /(<([^>]+)>)/gi,
                ""
            );

            this.$refs.displayName.blur();
            this.store.user.displayName = tempValue;
            this.localDisplayName = "";
        },
    },
    template: `
        <div>
            <label class="label">
                <p>Display name:</p>
                <input 
                ref="displayName" 
                type="text" 
                @click="localDisplayName = store.user.displayName" 
                :placeholder="store.user.displayName" 
                v-model="localDisplayName" 
                @keyup.enter="setDisplayName" 
                autofocus />
                
            </label>

            <p class="label">Display color:</p>

            <div class="display-color-selector">
                <div 
                v-for="hue in getDisplayColors" 
                :class="['display-color-option', {'active': hue == store.user.displayColor}]" 
                :style="'background: hsl(' + hue + 'deg 100% 50%)'"
                @click="store.user.displayColor = hue"
                > 
                </div>
            </div>
        </div>
    `,
};

var FridgeSettings = {
    inject: ["store"],
    data() {
        return {
            localFridgeInfo: JSON.parse(JSON.stringify(this.store.fridge.info)),
            isDeleting: false,
            deleteConfirmation: "",
            disableDeletionField: false,
        };
    },
    template: `
        <div>
            <label class="label">
                <p>Fridge name:</p>
                <input 
                type="text"
                ref="fridgeName"
                v-model="localFridgeInfo.name" 
                @keyup.enter="$refs.fridgeName.blur()" 
                @blur="updateFridge"
                />
            </label>

            <label class="label">
                <p>Maximum fridge users:</p>
                <input 
                type="number"
                ref="maxUsers"
                v-model="localFridgeInfo.maxUsers" 
                @keyup.enter="$refs.maxUsers.blur()" 
                @blur="updateFridge"
                />
            </label>

            <label class="label">
                <p>Maximum custom words per user:</p>
                <input 
                type="number"
                ref="maxCustomWords"
                v-model="localFridgeInfo.maxCustomWords" 
                @keyup.enter="$refs.maxCustomWords.blur()" 
                @blur="updateFridge"
                />
            </label>

            <div style="padding-top: 2rem">
                <button v-if="!isDeleting" class="warning" @click="startDeleting">Delete fridge</button>
                <div v-else style="display: flex">
                    <label class="label">
                        <p>Type 'delete' to confirm</p>
                        <input type="text" class="warning" v-model="deleteConfirmation" @input="checkDelete" :disable="disableDeletionField" ref="deleteConfirmation">
                    </label>
                </div>
            </div>
        </div>
    `,
    methods: {
        async updateFridge() {
            const data = {
                ...this.localFridgeInfo,
            };
            await fridgeService.updateFridge(this.store.fridge.id, data);
            this.store.fridge.info = data;
            this.$forceUpdate();
        },
        startDeleting() {
            this.isDeleting = true;
            this.$nextTick(() => {
                this.$refs.deleteConfirmation.focus();
            });
        },
        async checkDelete() {
            if (this.deleteConfirmation == "delete") {
                this.$refs.deleteConfirmation.blur();
                this.disableDeletionField = true;

                const permissionRefs =
                    await permissionService.getPermissionRefsByFridge(
                        this.store.fridge.id
                    );

                permissionRefs.forEach((ref) => {
                    permissionService.delete(ref.id);
                });

                await fridgeService.deleteFridge(this.store.fridge.id);
                window.location = "/";
            }
        },
    },
};

var Invitations = {
    inject: ["store"],
    data() {
        return {
            inviteEmail: "",
            isWorking: false,
            pendingInvites: [],
            userInvites: [],
            isEditing: true,
        };
    },
    computed: {
        canEditAll() {
            return true;
        },
    },
    template: `
    <div>
        <label class="label">
            <p>Email to send invitation to: </p>
            <input type="email" v-model="inviteEmail" @keyup.enter="sendInvite" :disabled="isWorking" />
        </label>
        <button @click="sendInvite" style="margin-top: 0.5rem">Send</button>

        <p class="label">Pending invites:</p>
        <div style="display: flex" v-for="invite in pendingInvites" v-if="pendingInvites">
            <p>{{invite.to}}</p>
            <button v-if="isEditing && (canEditAll || canEditOne(invite.id))">X</button>
        </div>
        <div v-else>No invites to show.</div>

    </div>
    `,
    created() {
        invitationService
            .getInvitationsByFridge(this.store.fridge.id)
            .then((result) => (this.pendingInvites = result));
        invitationService
            .getSentInvitesByUser(this.store.user.id)
            .then((result) => (this.userInvites = result));
    },
    methods: {
        async sendInvite() {
            if (
                !this.inviteEmail ||
                !this.inviteEmail.includes("@") ||
                !this.inviteEmail.includes(".")
            ) {
                // TODO Errors
                return;
            }

            this.isWorking = true;
            await invitationService.sendInvite(
                this.inviteEmail,
                this.store.fridge.id,
                this.store.user.displayName
            );
            this.isWorking = false;
            this.inviteEmail = "";
        },
        canEditOne(inviteID) {
            return this.userInvites.includes(
                (invite) => invite.id === inviteID
            );
        },
    },
};

var MenuSlide = {
    props: ["isOpen", "activeLink"],
    inject: ["navigate"],
    components: { UserSettings, FridgeSettings, Invitations },
    template: `
    <div>
        <div class="menu-title-wrap">
            <a href="#" @click.prevent="navigate('root')" class="back">&lt;</a>
            <h3 class="menu-title">{{ activeLink.title }}</h3>
        </div>
        <component v-show="isOpen" :is="activeLink.componentName" :activeLink="activeLink" />
    </div>
    `,
};

var AcceptInvite = {
    inject: ["store"],
    data() {
        return {
            isActive: false,
            invite: null,
        };
    },
    template: `
        <div>
            <div class="overlay-wrap" v-if="isActive">
                <div class="modal">
                    <h2>Join '{{store.fridge.info.name}}'?</h2>
                    <p>
                        {{invite?.fromDisplayName || 'A user' }} has invited you to join this fridge. Accept this invitation?
                    </p>
                    <button @click="acceptInvite">Accept</button>
                </div>
            </div>
        </div>
    `,
    created() {
        this.isActive = window.location.search.includes("invite");
        if (this.isActive) {
            this.handleInvite();
        }
    },
    methods: {
        async handleInvite() {
            const inviteID = window.location.search
                .slice(1)
                .split("&")
                .find((param) => param.includes("invite"))
                .split("=")[1];

            this.invite = await invitationService.getInvitation(inviteID);

            if (this.invite.status !== "pending") {
                this.isActive = false;
                window.location.search = window.location.search
                    .replace("invite=", "")
                    .replace(this.invite.id, "");
            }

            await userService
                .getUserByID(this.invite.fromID)
                .then(
                    (inviter) =>
                        (this.invite.fromDisplayName = inviter.displayName)
                );
        },
        async acceptInvite() {
            if (this.invite.fridgeID !== this.store.fridge.id) {
                // TODO Error
                console.error("This invitation is for a different fridge");
                return;
            }
            if (this.invite.to !== authService.auth.currentUser.email) {
                // TODO Error
                console.error("Invite to/current user mismatch");
                return;
            }

            await invitationService.acceptInvitation(this.invite.id);
            await permissionService.create(
                this.store.fridge.id,
                authService.auth.currentUser.uid,
                [...PERMISSION_GROUPS.OPTIONAL]
            );
            this.isActive = false;
        },
    },
};

var menuItems = {
    fridge: [
        {
            title: "Manage Users",
            permissions: {
                showIfIn: [PERMISSIONS_NAMES.FREEZE_USER, PERMISSIONS_NAMES.UNFREEZE_USER],
            },
        },
        {
            title: "Invitations",
            permissions: {
                showIfIn: [PERMISSIONS_NAMES.SEND_INVITES, PERMISSIONS_NAMES.EDIT_BLACKLIST],
            },
            componentName: "Invitations",
        },
        {
            title: "Manage Words",
        },
        {
            title: "Fridge Settings",
            componentName: "FridgeSettings",
            permissions: {
                showIfIn: [
                    PERMISSIONS_NAMES.CHANGE_FRIDGE_VISIBILITY,
                    PERMISSIONS_NAMES.DELETE_FRIDGE,
                    PERMISSIONS_NAMES.EDIT_FRIDGE_NAME,
                    PERMISSIONS_NAMES.EDIT_MAX_USERS,
                    PERMISSIONS_NAMES.EDIT_MAX_CUSTOM_WORDS_PER_USER,
                    PERMISSIONS_NAMES.EDIT_BLACKLIST,
                ],
            },
        },
    ],
    user: [
        {
            title: "User Settings",
            componentName: "UserSettings",

            // parent
            // children
        },
        {
            title: "My Words",
            // props
        },
        {
            title: "My Fridges",
        },
        {
            title: "New Fridge",
        },
        {
            title: "Leave this Fridge",
            // handler
        },
    ],
};

const reactiveStore = computed(() => reactive(store)).value;

function startUI() {
    const app = createApp({
        components: { MenuRoot, MenuSlide, AcceptInvite },
        data() {
            return {
                isOpen: false,
                activeLink: null,
            };
        },
        computed: {
            filteredMenuItems() {
                function filterMenuItem(item) {
                    if (!item.permissions) {
                        return true;
                    }
                    return item.permissions.showIfIn?.some((showPermission) =>
                        reactiveStore.user.permissions.includes(showPermission)
                    );
                }

                const filteredFridgeMenu = menuItems.fridge.filter((item) =>
                    filterMenuItem(item)
                );
                const filteredUserMenu = menuItems.user.filter((item) =>
                    filterMenuItem(item)
                );
                return { fridge: filteredFridgeMenu, user: filteredUserMenu };
            },
        },
        template: `
        <div id="app-ui" @mouseover="isOpen = true" @mouseleave="isOpen = false">
            <component :is="activeLink ? 'MenuSlide' : 'MenuRoot'" :isOpen="isOpen" :menuItems="filteredMenuItems" :activeLink="activeLink" />
        </div>
        <AcceptInvite />
        `,
        methods: {
            navigateMenu(event) {
                if (event === "root") {
                    this.activeLink = null;
                    return;
                }
                this.activeLink = event;
            },
        },
        provide() {
            return {
                navigate: this.navigateMenu,
                store: reactiveStore,
            };
        },
    });

    app.config.unwrapInjectedRef = true;

    app.mount("#app-ui-wrap");
}

// TODO Clicking word updates its z-index
// TODO Mobile interactions...

await store.initialize(services);
makeFridge();

// TODO: Case where landscape
store.scale = scaleApp(store.appEl);
onresize = () => {
    ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
};

startUI();
