import {
    authService,
    fridgeRepo,
    permissionRepo,
} from "../../services/api/index";
import { PERMISSION_GROUPS } from "../../constants";

export default {
    data() {
        return {
            name: "",
            isWorking: false,
        };
    },
    template: `
        <div>
            <label><p>New fridge name:</p>
                <input type="text" ref="name" v-model="name" autofocus @keyup.enter="newFridge" :disabled="isWorking" />
            </label>
            <button :disabled="!name || isWorking" @click="newFridge">Make new fridge</button>
        </div>
    `,
    mounted() {
        this.$refs.name.focus();
    },
    methods: {
        async newFridge() {
            try {
                this.$refs.name.blur();
                this.isWorking = true;

                // TODO: Fridge 'owners'
                const newFridgeID = await fridgeRepo.create({
                    name: this.name,
                    owners: [authService.auth.currentUser.uid],
                });
                await permissionRepo.create(
                    newFridgeID,
                    authService.auth.currentUser.uid,
                    [
                        ...PERMISSION_GROUPS.FRIDGE_OWNER,
                        ...PERMISSION_GROUPS.OPTIONAL,
                    ]
                );
                window.location = newFridgeID;
            } catch (error) {
                // TODO
                console.log(error);
            }
        },
    },
};
