import UserSettings from "./user/UserSettings.js";
import FridgeSettings from "./fridge/FridgeSettings.js";
import Invitations from "./fridge/Invitations.js";

export default {
    props: ["isOpen", "activeLink"],
    inject: ["navigate"],
    components: { UserSettings, FridgeSettings, Invitations },
    template: `
    <div>
        <div class="menu-title-wrap">
            <a href="#" @click.prevent="navigate('root')" class="back">&lt;</a>
            <h3 class="menu-title">{{ activeLink.title }}</h3>
        </div>
        <component v-show="isOpen" :is="activeLink.componentName" :activeLink="activeLink" />
    </div>
    `,
};
