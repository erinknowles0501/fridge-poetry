import {
    fridgeService,
    userService,
    authService,
    permissionService,
} from "../../services/api";

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

        permissionService
            .getPermissionsByUser(currentUserUID)
            .then(async (permissions) => {
                const fridgeIDs = [];
                permissions.forEach((permission) => {
                    if (!fridgeIDs.includes(permission.fridgeID)) {
                        fridgeIDs.push(permission.fridgeID);
                    }
                });
                this.fridges = await Promise.all(
                    fridgeIDs.map(async (fridgeID) => {
                        return await fridgeService.getFridgeByID(fridgeID);
                    })
                );
            })
            .catch((error) => {
                console.error(error);
            });
    },
    methods: {
        async logout() {
            await authService.logout();
            window.location = "/";
        },
    },
};
