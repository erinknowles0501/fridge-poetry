import UserColorDisplay from "./UserColorDisplay";

export default {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate"],
    components: { UserColorDisplay },
    template: `
    <div class="user">
        <h3 class="user-name" v-if="!isOpen"><UserColorDisplay/>{{ this.store.user.displayName }}</h3>
        <div class="menu" style="margin-top: 3rem;" v-else>
            <div class="menu-title">Logged in as <div style="display: inline-block"><UserColorDisplay/><span>{{ this.store.user.displayName }}</span></div></div>
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};
