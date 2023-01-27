import { fridgeService } from "../../services/api";

export default {
    data() {
        return {
            name: "",
        };
    },
    template: `
        <div>
            <label><p>New fridge name:</p>
                <input type="text" v-model="name" autofocus />
            </label>
            <button :disabled="!name" @click="newFridge">Make new fridge</button>
        </div>
    `,
    methods: {
        async newFridge() {
            try {
                const newFridgeID = await fridgeService.createFridge(this.name);
                window.location = newFridgeID;
            } catch (error) {
                // TODO
                console.log(error);
            }
        },
    },
};
