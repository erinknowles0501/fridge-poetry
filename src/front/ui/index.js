import { createApp } from "vue";
import LoginSignup from "./LoginSignup";
import FridgeSelection from "./FridgeSelection";
import NewFridge from "./NewFridge";

export default function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection, NewFridge },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @loggedIn="activeComponent = 'FridgeSelection'" @newFridge="activeComponent = 'NewFridge'" />
            </div>
        `,
    });

    app.mount("#app");
}
