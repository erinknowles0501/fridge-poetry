import { createApp } from "vue/dist/vue.esm-browser.js";

export default function startVue() {
    createApp({
        data() {
            return {
                message: "Hello Vue!",
            };
        },
    }).mount("#appUI");
}
