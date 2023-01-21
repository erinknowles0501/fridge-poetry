import { createApp } from "vue/dist/vue.esm-browser.js";
import User from "./user/User.js";
import Fridge from "./fridge/Fridge.js";

export default function startUI() {
    createApp({
        components: { Fridge, User },
        data() {
            return {
                isOpen: false,
            };
        },
        template: `
        <div id="app-ui" @mouseover="isOpen = true" @mouseleave="isOpen = false">
            <fridge :isOpen="isOpen"/>
            <user :isOpen="isOpen" />
        </div>
        `,
    }).mount("#app-ui-wrap");
}
