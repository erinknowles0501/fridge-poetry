import UserColorDisplay from "./UserColorDisplay";

export default {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate", "store"],
    components: { UserColorDisplay },
    template: `
    <h3 class="user-name" :style="!isOpen && 'margin-top: 0rem'"><UserColorDisplay/>{{!store.scale.isPortrait && !isOpen ? '' : store.user?.displayName}}</h3>
    <div class="user">
        <div class="menu" v-if="isOpen">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};
