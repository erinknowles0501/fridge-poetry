export default {
    name: "fridge",
    props: ["isOpen", "menuItems"],
    template: `
    <div class="fridge">
        <h2 class="fridge-name">{{ this.store.fridge.info.name }}</h2>
        <div v-if="isOpen" class="menu">
            <a href="#">asfasf ashdf jka</a>
        </div>
    </div>
    `,
};
