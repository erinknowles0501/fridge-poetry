import store from "../../store.js";

export default {
    name: "user",
    data() {
        return {
            localStore: store,
        };
    },
    template: `
    <div class="user">
        <div v-if="localStore.user.displayName">
            <h3 class="user-name">{{ localStore.user.displayName }}</h3>
        </div>
    </div>
    `,
};
