import { createApp } from "vue/dist/vue.esm-browser.js";

//import store from "../store.js";

export default function startUI() {
    const app = createApp({
        //components: {},
        data() {
            return {
                //
            };
        },
        template: `
            <h1>Fridge Poetry</h1>
            <div>
                <label>
                    <p>Email:</p>
                    <input type="email">
                </label>
                <label>
                    <p>Password:</p>
                    <input type="password">
                </label>
                <button type="submit">Log in</button>
            </div>
        `,
        methods: {
            // navigateMenu(event) {
            //     if (event === "root") {
            //         this.activeLink = null;
            //         return;
            //     }
            //     this.activeLink = event;
            // },
        },
        provide() {
            // return {
            //     navigate: this.navigateMenu,
            // };
        },
    });

    //app.config.globalProperties.store = reactive(store);

    app.mount("#app");
}
