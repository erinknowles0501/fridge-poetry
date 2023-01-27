import { createApp } from "vue";
import LoginSignup from "./LoginSignup";
import FridgeSelection from "./FridgeSelection";

export default function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @loggedIn="activeComponent = 'FridgeSelection'" />
            </div>
        `,
    });

    app.mount("#app");
}
