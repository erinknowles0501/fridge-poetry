import { fridgeService, userService, authService } from "../../services/api";

export default {
    data() {
        return {
            fridges: [],
            user: {},
        };
    },
    emits: ["changeActiveComponent"],
    template: `
        <div class="fridge-selection">
            <div class="welcome">Welcome, <b>{{user.displayName}}</b> <a href="" @click.prevent="logout">(Log out)</a></div>
            <div>Select a fridge:</div>
            <a v-for="fridge in fridges" :href="'/' + fridge.id" class="fridge">{{ fridge.name }}</a>
            <div style="margin-top:1rem;">or, <a href="" @click.prevent="$emit('changeActiveComponent', 'NewFridge')" class="fridge" style="display: inline">create a new fridge...</a></div>
        </div>
    `,
    created() {
        const currentUserUID = userService.auth.currentUser.uid;

        userService
            .getUserByID(currentUserUID)
            .then((user) => (this.user = user));

        userService.getFridgesByUser(currentUserUID).then(async (fridgeIDs) => {
            this.fridges = await Promise.all(
                fridgeIDs.map(async (fridgeID) => {
                    return await fridgeService.getFridgeByID(fridgeID);
                })
            );
        });
    },
    methods: {
        async logout() {
            await authService.logout();
            window.location = "/";
        },
    },
};
