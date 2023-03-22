import { A as APP_HEIGHT, f as fridgeRepo, p as permissionRepo, i as inviteRepo, u as userRepo, a as authService, P as PERMISSION_GROUPS, b as PERMISSIONS_NAMES, s as services, c as scaleApp } from './chunks/index.js';
import { computed, reactive, createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

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
    id = Date.now(); // TODO

    async initialize(services) {
        this.clear();

        this.services = services;
        this.appEl = document.querySelector("#app");
        this.ghostEl = document.querySelector("#dragghost");

        this.fridge.id = window.location.pathname.slice(1);

        this._user = await this.services.userRepo.getOne(
            this.services.authService.auth.currentUser.uid
        );

        const [fridge, permissions] = await Promise.all([
            this.services.fridgeRepo.getOne(this.fridge.id),
            this.services.permissionRepo.getPermissionByUserAndFridge(
                this._user.id,
                this.fridge.id
            ),
        ]);
        this.fridge = fridge;

        this._user.permissions = permissions;
        this.makeUpdateProxy(
            this._user,
            this,
            "user",
            services.userRepo.update.bind(services.userRepo)
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

function scaleGhost() {
    const computedWordStyle = getComputedStyle(document.querySelector(".word"));

    const adjustedFontSizeInt =
        computedWordStyle.getPropertyValue("font-size").split("px")[0] *
        store.scale.y;
    store.ghostEl.style.fontSize = adjustedFontSizeInt + "px";

    const adjustedPaddingTopInt =
        computedWordStyle.getPropertyValue("padding-top").split("px")[0] *
        store.scale.y;
    const adjustedPaddingLeftInt =
        computedWordStyle.getPropertyValue("padding-left").split("px")[0] *
        store.scale.x;
    store.ghostEl.style.padding = `${adjustedPaddingTopInt}px ${adjustedPaddingLeftInt}px`;

    const CHAR_WIDTH_RATIO = 0.55; // This is an approximation of the value of the char width for a char height of 1. One way to actually get this value is to get the offsetWidth of an element containing just one character and with no padding, but that is overkill here.
    const charWidth = adjustedFontSizeInt * CHAR_WIDTH_RATIO;
    const expectedWidth = charWidth / (store.scale.y / store.scale.x);
    store.ghostEl.style.letterSpacing = -(charWidth - expectedWidth) + "px";

    if (store.scale.isPortrait) {
        store.ghostEl.className = "vertical-ghost";
    }
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
    function onDragStart(event) {
        store.currentDrag.offset.x = event.offsetX;
        store.currentDrag.offset.y = event.offsetY;

        store.ghostEl.textContent = element.textContent;
        event.dataTransfer?.setDragImage(
            store.ghostEl,
            event.offsetX * store.scale.x,
            event.offsetY * store.scale.y
        );
        store.currentDrag.el = element;
    }

    element.addEventListener("dragstart", onDragStart);
    element.addEventListener("touchstart", onDragStart);
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
    store.appEl.addEventListener("touchmove", (event) => {
        if (store.currentDrag.el) {
            store.ghostEl.style.zIndex = 20;
            store.ghostEl.style.top = event.changedTouches[0].pageY + "px";
            store.ghostEl.style.left = event.changedTouches[0].pageX + "px";
        }
    });

    store.appEl.addEventListener("drop", onDrop);
    store.appEl.addEventListener("touchend", (event) => onDrop(event, true));

    function onDrop(event, isTouch = false) {
        if (store.currentDrag.el) {
            const uiEl = document.querySelector("#app-ui");
            /*
            This function has to take the on-page location of the drop (x and y values up to the pixel width and height of the client's window) and transform it into the "app" location (x and y values up to APP_WIDTH and APP_HEIGHT - the internal coordinate system), taking into account the possible (UI is at side in landscape, top in portrait) offset from the UI element, and the possible (mobile doesn't record this) offset from where the word was clicked vs that word's origin.
            Word-offset is added outside the translation to app location, since it's recorded and applied in on-page location, and has to be cancelled out the same way.

            There are also two factors here: 
            1. Whether the page is portrait or landscape
            2. Whether the browser is desktop or mobile.

            (1) Affects positioning (due to UI position), and gives weird inversions of X and Y because of the rotation of the app element
            (2) Affects how we get the location of the event on the page.
            */

            const pageX = event.pageX || event.changedTouches[0].pageX;
            const pageY = event.pageY || event.changedTouches[0].pageY;

            let adjustedX, adjustedY;

            if (store.scale.isPortrait) {
                /* Here, because the app is rotated, we have to translate the on-page Y value into an in-app X value, and vice versa. */
                adjustedX = (pageY - uiEl.offsetHeight) / store.scale.x;
                adjustedY = APP_HEIGHT - pageX / store.scale.y;
            } else {
                adjustedX =
                    (pageX - uiEl.offsetWidth) / store.scale.x -
                    store.currentDrag.offset.x;
                adjustedY = pageY / store.scale.y - store.currentDrag.offset.y;
            }

            adjustedX = Math.round(adjustedX);
            adjustedY = Math.round(adjustedY);

            setElementPosition(store.currentDrag.el, adjustedY, adjustedX);
            fridgeRepo
                .updateWord(
                    store.currentDrag.el.getAttribute("data-id"),
                    adjustedY,
                    adjustedX,
                    store.fridge.id
                )
                .then(() => (store.currentDrag.el = null));

            if (isTouch) {
                store.ghostEl.style.top = "-100px"; // These magic numbers aren't terribly magic - they're just to hide the element.
                store.ghostEl.style.left = "-100px";
                store.ghostEl.style.zIndex = "-20";
            }
        }
    }
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
    props: {
        isOpen: { required: true, type: Boolean },
        menuItems: { required: true, type: Object },
    },
    inject: ["navigate", "store"],
    components: { UserColorDisplay },
    template: `
    <h3 class="user-name" :style="!isOpen && 'margin-top: 0rem'"><UserColorDisplay/>{{!store.scale.isPortrait && !isOpen ? '' : store.user?.displayName}}</h3>
    <div class="user">
        <div class="menu" v-if="isOpen">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

var Fridge = {
    name: "fridge",
    props: {
        isOpen: { required: true, type: Boolean },
        menuItems: { required: true, type: Object },
    },
    inject: ["navigate", "store"],
    template: `
    <h2 :class="['fridge-name', {'ellipsis-overflow': !isOpen}]">{{ store.fridge.name }}</h2>
    <div class="fridge">
        <div v-if="isOpen" class="menu">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

var MenuRoot = {
    props: {
        isOpen: { required: true, type: Boolean },
        menuItems: { required: true, type: Object },
    },
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
    props: { activeLink: { required: true, type: Object } },
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
    props: { activeLink: { required: true, type: Object } },
    data() {
        return {
            localFridgeInfo: JSON.parse(JSON.stringify(this.store.fridge)),
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
            await fridgeRepo.update(this.store.fridge.id, data);
            this.store.fridge = data;
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

                await permissionRepo.deleteByFridge(this.store.fridge.id);
                await fridgeRepo.delete(this.store.fridge.id);
                window.location = "/";
            }
        },
    },
};

var Invitations = {
    inject: ["store"],
    props: { activeLink: { required: true, type: Object } },
    data() {
        return {
            inviteEmail: "",
            isWorking: false,
            pendingInvites: [],
            isEditing: true,
        };
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
            <button v-if="isEditing">X</button>
        </div>
        <div v-else>No invites to show.</div>

    </div>
    `,
    created() {
        inviteRepo
            .getAccessibleInvitesByFridge(
                this.store.user.id,
                this.store.fridge.id
            )
            .then((result) => (this.pendingInvites = result));
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
            await inviteRepo.sendInvite(
                this.inviteEmail,
                this.store.fridge.id,
                this.store.user.id,
                this.store.user.displayName
            );
            this.isWorking = false;
            this.inviteEmail = "";
        },
    },
};

var MenuSlide = {
    props: {
        isOpen: { required: true, type: Boolean },
        activeLink: { required: true, type: Object },
    },
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
                    <h2>Join '{{store.fridge.name}}'?</h2>
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

            this.invite = await inviteRepo.getOne(inviteID);

            if (this.invite.status !== "pending") {
                this.isActive = false;
                window.location.search = window.location.search
                    .replace("invite=", "")
                    .replace(this.invite.id, "");
            }

            await userRepo
                .getOne(this.invite.fromID)
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

            await inviteRepo.acceptInvitation(this.invite.id);
            await permissionRepo.create(
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
            isPortrait() {
                return reactiveStore.scale.isPortrait;
            },
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
        <div id="app-ui" @mouseover="isOpen = true" @mouseleave="isOpen = false" :class="{'is-portrait': isPortrait}">
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

authService.handleAuthStateChanged(async (state) => {
    if (state?.uid) {
        await store.initialize(services);
        makeFridge();

        // TODO: Case where landscape
        store.scale = scaleApp(store.appEl);
        scaleGhost();
        onresize = () => {
            ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
            scaleGhost();
        };

        startUI();
    } else {
        window.location = "/";
    }
});
