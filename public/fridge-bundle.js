import { w as wordService, u as userService, f as fridgeService, p as permissionService, i as invitationService, a as authService, P as PERMISSION_GROUPS, b as PERMISSIONS_NAMES, s as services, c as scaleApp } from './chunks/api.js';
import { ref, computed, inject, createApp, reactive } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

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

        this.user = await this.services.userService.getUserByID(
            this.services.authService.auth.currentUser.uid
        );
        this.user.permissions =
            await this.services.permissionService.getPermissionsByUserAndFridge(
                this.user.id,
                this.fridge.id
            );
    }

    clear() {
        Object.assign(this, new Store()); // TODO double check this...
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
    computed: {
        colorValue() {
            return `hsl(${this.$store.user.displayColor}deg 100% 50%)`;
        },
    },
    template: `
        <div class="user-color" :style="'background: ' + colorValue"></div>
    `,
};

var User = {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate"],
    components: { UserColorDisplay },
    template: `
    <div class="user">
        <h3 class="user-name" v-if="!isOpen"><UserColorDisplay/>{{ $store.user.displayName }}</h3>
        <div class="menu" style="margin-top: 3rem;" v-else>
            <div class="menu-title">Logged in as <div style="display: inline-block"><UserColorDisplay/><span>{{ $store.user.displayName }}</span></div></div>
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

var Fridge = {
    name: "fridge",
    props: ["isOpen", "menuItems"],
    inject: ["navigate"],
    template: `
    <div class="fridge">
        <h2 :class="['fridge-name', {'ellipsis-overflow': !isOpen}]">{{ $store.fridge.info.name }}</h2>
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
    setup() {
        const hello = ref("hello!");
        const test2 = computed(() => hello.value + "aaaa", {
            onTrack(e) {
                console.log("e", e);
            },
            onTrigger(e) {
                console.log("e", e);
            },
        });

        const providedStore = inject("providedStore");
        console.log("providedStore", providedStore.value);

        const storeTestColor = computed(
            {
                get: () => {
                    return providedStore.value.user.displayColor;
                },
                set: (value) => {
                    console.log("value", value);

                    providedStore.value.user.displayColor = value;
                },
            },
            {
                onTrack(e) {
                    console.log("store track", e);
                },
                onTrigger(e) {
                    console.log("store trigger", e);
                },
            }
        );
        return { test2, storeTestColor };
    },
    // inject: ["providedStore"],
    data() {
        return {
            localDisplayName: "",
            test: "erin",
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
        activeHue: {
            get() {
                console.log("here get");
                return this.$store.user.displayColor;
            },
            onTrack(e) {
                console.log("here inactivehue", e);
            },
            onTrigger(e) {
                console.log("here inactivehue", e);
            },
        },
        getName: {
            get() {
                console.log("here getname");
                return this.test;
            },
            onTrack() {
                console.log("here getname track");
            },
            onTrigger() {
                console.log("here in getname trigger");
            },
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
            this.$store.user.displayName = tempValue;
            this.localDisplayName = "";

            userService
                .updateUser(this.$store.user.id, {
                    displayName: tempValue,
                })
                .then(() => {
                    this.$forceUpdate();
                });
        },
        // setDisplayColor(hue) {
        //     console.log("here");
        //     //this.$store.user.displayColor = hue;
        //     console.log(
        //         "this.$store.user.displayColor",
        //         this.$store.user.displayColor
        //     );

        //     userService
        //         .updateUser(this.$store.user.id, {
        //             displayColor: hue,
        //         })
        //         .then(() => this.$forceUpdate);
        // },
    },
    template: `
        <div>
            <label class="label">
                <p>Display name:</p>
                <input 
                ref="displayName" 
                type="text" 
                @click="localDisplayName = $store.user.displayName" 
                :placeholder="$store.user.displayName" 
                v-model="localDisplayName" 
                @keyup.enter="setDisplayName" 
                autofocus />
                
            </label>

            {{ getName }}  {{test2}}

            <p class="label">Display color:</p>

            <div class="display-color-selector" :key="storeTestColor">
                <div 
                v-for="hue in getDisplayColors" 
                :class="['display-color-option', {'active': hue == storeTestColor}]" 
                :style="'background: hsl(' + hue + 'deg 100% 50%)'"
                @click="storeTestColor = hue"
                > 
                </div>
            </div>
        </div>
    `,
};

var FridgeSettings = {
    data() {
        return {
            localFridgeInfo: JSON.parse(
                JSON.stringify(this.$store.fridge.info)
            ),
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
            await fridgeService.updateFridge(this.$store.fridge.id, data);
            this.$store.fridge.info = data;
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
                        this.$store.fridge.id
                    );

                permissionRefs.forEach((ref) => {
                    permissionService.delete(ref.id);
                });

                await fridgeService.deleteFridge(this.$store.fridge.id);
                window.location = "/";
            }
        },
    },
};

var Invitations = {
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
            .getInvitationsByFridge(this.$store.fridge.id)
            .then((result) => (this.pendingInvites = result));
        invitationService
            .getSentInvitesByUser(this.$store.user.id)
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
                this.$store.fridge.id,
                this.$store.user.displayName
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
                    <h2>Join '{{$store.fridge.info.name}}'?</h2>
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
            if (this.invite.fridgeID !== this.$store.fridge.id) {
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
                this.$store.fridge.id,
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
                showIfIn: [PERMISSIONS_NAMES.SEND_INVITES, PERMISSIONS_NAMES.REVOKE_INVITES],
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
                const vm = this;
                function filterMenuItem(item) {
                    if (!item.permissions) {
                        return true;
                    }
                    return item.permissions.showIfIn?.some((showPermission) =>
                        vm.$store.user.permissions.includes(showPermission)
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
                providedStore: computed(() => reactive(store)),
            };
        },
    });

    app.config.globalProperties.$store = reactive(store);

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

userService.handleCurrentUserDataChange(
    store.initialize.bind(store, services)
);

startUI();
