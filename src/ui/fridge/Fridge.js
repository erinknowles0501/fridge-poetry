import store from "../../store.js";

export default {
    name: "fridge",
    props: ["isOpen"],
    data() {
        return {
            localStore: store,
        };
    },
    template: `
    <div class="fridge">
        <div v-if="localStore.fridge.info">
            <h2 class="fridge-name">{{ localStore.fridge.info.name }}{{isOpen}}</h2>
        </div>
    </div>
    `,
};
