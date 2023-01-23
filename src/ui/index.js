import { createApp, reactive } from "vue/dist/vue.esm-browser.js";
import MenuRoot from "./MenuRoot.js";
import MenuSlide from "./MenuSlide.js";

import store from "../store.js";

export default function startUI() {
    const app = createApp({
        components: { MenuRoot, MenuSlide },
        data() {
            return {
                isOpen: false,
                menuItems: {
                    fridge: [
                        {
                            title: "Manage Users",
                            // permissions
                        },
                        {
                            title: "Invitations",
                        },

                        {
                            title: "Manage Words",
                        },
                        {
                            title: "Fridge Settings",
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
                },
                activeLink: null,
            };
        },
        template: `
        <div id="app-ui" @mouseover="isOpen = true" @mouseleave="isOpen = false">
            <component :is="activeLink ? 'MenuSlide' : 'MenuRoot'" :isOpen="isOpen" :menuItems="menuItems" :activeLink="activeLink" />
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
