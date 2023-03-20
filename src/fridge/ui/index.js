import { createApp, reactive, computed } from "vue";
import MenuRoot from "./MenuRoot.js";
import MenuSlide from "./MenuSlide.js";
import AcceptInvite from "./overlay/AcceptInvite.js";

import menuItems from "./menuItems.js";
import store from "../store.js";
const reactiveStore = computed(() => reactive(store)).value;

export default function startUI() {
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
