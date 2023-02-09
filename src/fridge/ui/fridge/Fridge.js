export default {
    name: "fridge",
    props: ["isOpen", "menuItems"],
    inject: ["navigate", "store"],
    template: `
    <div class="fridge">
        <h2 :class="['fridge-name', {'ellipsis-overflow': !isOpen}]">{{ store.fridge.info.name }}</h2>
        <div v-if="isOpen" class="menu">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};
