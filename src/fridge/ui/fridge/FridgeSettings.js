import { fridgeRepo, permissionRepo } from "../../../services/api/index";

export default {
    inject: ["store"],
    data() {
        return {
            localFridgeInfo: JSON.parse(JSON.stringify(this.store.fridge)),
            isDeleting: false,
            deleteConfirmation: "",
            disableDeletionField: false,
        };
    },
    template: `
        <div>
            <label class="label">
                <p>Fridge name:</p>
                <input 
                type="text"
                ref="fridgeName"
                v-model="localFridgeInfo.name" 
                @keyup.enter="$refs.fridgeName.blur()" 
                @blur="updateFridge"
                />
            </label>

            <label class="label">
                <p>Maximum fridge users:</p>
                <input 
                type="number"
                ref="maxUsers"
                v-model="localFridgeInfo.maxUsers" 
                @keyup.enter="$refs.maxUsers.blur()" 
                @blur="updateFridge"
                />
            </label>

            <label class="label">
                <p>Maximum custom words per user:</p>
                <input 
                type="number"
                ref="maxCustomWords"
                v-model="localFridgeInfo.maxCustomWords" 
                @keyup.enter="$refs.maxCustomWords.blur()" 
                @blur="updateFridge"
                />
            </label>

            <div style="padding-top: 2rem">
                <button v-if="!isDeleting" class="warning" @click="startDeleting">Delete fridge</button>
                <div v-else style="display: flex">
                    <label class="label">
                        <p>Type 'delete' to confirm</p>
                        <input type="text" class="warning" v-model="deleteConfirmation" @input="checkDelete" :disable="disableDeletionField" ref="deleteConfirmation">
                    </label>
                </div>
            </div>
        </div>
    `,
    methods: {
        async updateFridge() {
            const data = {
                ...this.localFridgeInfo,
            };
            await fridgeRepo.update(this.store.fridge.id, data);
            this.store.fridge = data;
            this.$forceUpdate();
        },
        startDeleting() {
            this.isDeleting = true;
            this.$nextTick(() => {
                this.$refs.deleteConfirmation.focus();
            });
        },
        async checkDelete() {
            if (this.deleteConfirmation == "delete") {
                this.$refs.deleteConfirmation.blur();
                this.disableDeletionField = true;

                await permissionRepo.deleteByFridge(this.store.fridge.id);
                await fridgeRepo.delete(this.store.fridge.id);
                window.location = "/";
            }
        },
    },
};
