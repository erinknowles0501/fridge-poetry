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
                <component :is="activeComponent" @changeActiveComponent="activeComponent = $event" />
            </div>
        `,
    });

    app.mount("#app");
}
