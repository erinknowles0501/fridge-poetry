import { w as wordService, u as userService, s as services, a as scaleApp } from './chunks/api.js';
import { createApp, reactive } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

function setElementPosition(element, positionY, positionX) {
    element.style.top = positionY + "px";
    element.style.left = positionX + "px";
}

class Store {
    appEl = null;
    fridge = {
        fridgeID: null,
        info: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = null;
    services = {};
    router = null;

    async initialize(services) {
        return new Promise(async (resolve) => {
            this.clear();

            this.services = services;
            this.appEl = document.querySelector("#app");

            this.fridge.fridgeID = window.location.pathname.slice(1);

            this.fridge.info = await this.services.fridgeService.getFridgeByID(
                this.fridge.fridgeID
            );
            this.fridge.words =
                await this.services.wordService.getWordsByFridge(
                    this.fridge.fridgeID
                );

            await this.services.authService.signIn();
            this.user = await this.services.userService.getUserByID(
                this.services.authService.auth.currentUser.uid
            );
            this.user.permissions =
                await this.services.userService.getPermissionsByUserAndFridge(
                    this.user.id,
                    this.fridge.fridgeID
                );
            console.log("this.user", this.user);

            resolve();
        });
    }

    clear() {
        // TODO double check this...
        Object.assign(this, new Store());
    }

    watchCurrentUserState() {
        // Update user and UI on user changes
        this.services.userService.handleCurrentUserDataChange(
            (data) => (this.user = data)
        );
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
            store.fridge.fridgeID
        );
    });
}

var UserColorDisplay = {
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
    inject: ["navigate"],
    components: { UserColorDisplay },
    template: `
    <div class="user">
        <h3 class="user-name" v-if="!isOpen"><UserColorDisplay/>{{ this.store.user.displayName }}</h3>
        <div class="menu" style="margin-top: 3rem;" v-else>
            <div class="menu-title">Logged in as <div style="display: inline-block"><UserColorDisplay/><span>{{ this.store.user.displayName }}</span></div></div>
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
        <h2 :class="['fridge-name', {'ellipsis-overflow': !isOpen}]">{{ this.store.fridge.info.name }}</h2>
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
        activeHue() {
            return this.store.user.displayColor;
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

            userService
                .updateUser(this.store.user.id, {
                    displayName: tempValue,
                })
                .then(() => {
                    this.$forceUpdate();
                });
        },
        setDisplayColor(hue) {
            userService
                .updateUser(this.store.user.id, {
                    displayColor: hue,
                })
                .then(() => {
                    this.$forceUpdate();
                });
        },
    },
    template: `
        <div>
            <label class="label">Display name: 
                <input 
                ref="displayName" 
                type="text" 
                @click="localDisplayName = store.user.displayName;" 
                :placeholder="store.user.displayName" 
                v-model="localDisplayName" 
                @keyup.enter="setDisplayName" />
            </label>

            <p class="label">Display color:</p>

            <div class="display-color-selector">
                <div 
                v-for="hue in getDisplayColors" 
                :class="['display-color-option', {'active': hue == activeHue}]" 
                :style="'background: hsl(' + hue + 'deg 100% 50%)'"
                @click="setDisplayColor(hue)"
                > 
                </div>
            </div>
        </div>
    `,
};

var MenuSlide = {
    props: ["isOpen", "activeLink"],
    inject: ["navigate"],
    components: { UserSettings },
    template: `
    <div>
        <div class="menu-title-wrap">
            <a href="#" @click.prevent="navigate('root')" class="back">&lt;</a>
            <h3 class="menu-title">{{ activeLink.title }}</h3>
        </div>
        <component :is="activeLink.componentName" :activeLink="activeLink" />
    </div>
    `,
};

const PERMISSIONS_NAMES = {
    EDIT_FRIDGE_NAME: "edit-fridge-name",
    DELETE_FRIDGE: "delete-fridge",
    EDIT_MAX_USERS: "edit-max-users",
    CHANGE_FRIDGE_VISIBILITY: "change-fridge-visibility",
    EDIT_MAX_CUSTOM_WORDS_PER_USER: "edit-max-custom-words-per-user",
    SEND_INVITES: "send-invites",
    REVOKE_INVITES: "revoke-invites",
    FREEZE_USER: "freeze-user",
    UNFREEZE_USER: "unfreeze-user",
    CREATE_CUSTOM_WORDS: "create-custom-words",
};

/*
basic (anonymous)
    can view fridge (frozen)
    can move words on any fridge they have access to (ie invited and unfrozen, or public)
    can create new fridge

editable by owner
    can send invites
    can create custom words
    // can save poems
    // can shuffle words
    // can select multiple words
    can freeze user  (is_frozen)
    // can lock own words
   
fridge owner
    can edit fridge name
    can delete fridge
    can edit max users
    can change fridge visibility (private or public)
    can edit max custom words per user
    can revoke invites
    // can edit max words
    can unfreeze user
    can remove user
    // can archive words
    // can un-archive words
    // can create new words
    can edit user's permissions:
        see 'editable by owner'
    can archive someone's custom words

*/

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
        },
        {
            title: "Manage Words",
        },
        {
            title: "Fridge Settings",
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
        components: { MenuRoot, MenuSlide },
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
                        store.user.permissions.includes(showPermission)
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
            };
        },
    });

    app.config.globalProperties.store = reactive(store);

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

store.watchCurrentUserState();

startUI();
