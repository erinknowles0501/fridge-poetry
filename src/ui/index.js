import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

export default function startVue() {
    createApp({
        data() {
            return {
                message: "Hello Vue!",
            };
        },
    }).mount("#appUI");
}
