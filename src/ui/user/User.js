// import { userService } from "../../services/api.js";

export default {
    name: "user",
    props: ["isOpen", "menuItems"],
    inject: ["navigate"],
    template: `
    <div class="user">
        <h3 class="user-name" v-if="!isOpen">{{ this.store.user.displayName }}</h3>
        <div class="menu" v-else>
            <div class="menu-title">Logged in as <span>{{ this.store.user.displayName }}</span></div>
            <a v-for="link in menuItems" @click.prevent="navigate(link)" href="#">{{link.title}}</a>
        </div>
    </div>
    `,
};

/*

                        // TODO Validation, better sanitation
                        if (event.key === "Enter") {
                            const value = event.target.value;

                            await userService.updateUser(store.user.id, {
                                displayName: value.replace(/(<([^>]+)>)/gi, ""),
                            });
                            this.shouldDisplayDisplayNameField = false;
                            this.mount.render();
                        }

                        */
