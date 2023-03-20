import UserColorDisplay from "./UserColorDisplay";

export default {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate", "store"],
    components: { UserColorDisplay },
    template: `
    <h3 class="user-name"><UserColorDisplay/>{{store.scale.isPortrait ? store.user?.displayName : ''}}</h3>
    <div class="user">
        <div class="menu" v-if="isOpen">
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};
