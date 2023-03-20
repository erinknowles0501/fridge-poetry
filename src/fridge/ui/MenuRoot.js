import User from "./user/User.js";
import Fridge from "./fridge/Fridge.js";

export default {
    props: {
        isOpen: { required: true, type: Boolean },
        menuItems: { required: true, type: Object },
    },
    components: { Fridge, User },
    template: `
    <div>
        <Fridge :isOpen="isOpen" :menuItems="menuItems.fridge" />
        <User :isOpen="isOpen" :menuItems="menuItems.user" />
    </div>
    `,
};
