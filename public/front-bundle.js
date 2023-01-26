import { c as createApp } from './vue.esm-browser-402615ac.js';

//import store from "../store.js";

function startUI() {
    const app = createApp({
        //components: {},
        data() {
            return {
                //
            };
        },
        template: `
            <div class="form">
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
        // provide() {
        //     // return {
        //     //     navigate: this.navigateMenu,
        //     // };
        // },
    });

    //app.config.globalProperties.store = reactive(store);

    app.mount("#app");
}

//import { makeFridge } from "./appSetup.js";

//await store.initialize(services);

//store.watchCurrentUserState();

startUI();
