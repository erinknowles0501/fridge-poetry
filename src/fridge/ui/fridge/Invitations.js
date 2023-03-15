import { inviteRepo } from "../../../services/api/index";

export default {
    inject: ["store"],
    data() {
        return {
            inviteEmail: "",
            isWorking: false,
            pendingInvites: [],
            isEditing: true,
        };
    },
    template: `
    <div>
        <label class="label">
            <p>Email to send invitation to: </p>
            <input type="email" v-model="inviteEmail" @keyup.enter="sendInvite" :disabled="isWorking" />
        </label>
        <button @click="sendInvite" style="margin-top: 0.5rem">Send</button>

        <p class="label">Pending invites:</p>
        <div style="display: flex" v-for="invite in pendingInvites" v-if="pendingInvites">
            <p>{{invite.to}}</p>
            <button v-if="isEditing">X</button>
        </div>
        <div v-else>No invites to show.</div>

    </div>
    `,
    created() {
        inviteRepo
            .getAccessibleInvitesByFridge(
                this.store.user.id,
                this.store.fridge.id
            )
            .then((result) => (this.pendingInvites = result));
    },
    methods: {
        async sendInvite() {
            if (
                !this.inviteEmail ||
                !this.inviteEmail.includes("@") ||
                !this.inviteEmail.includes(".")
            ) {
                // TODO Errors
                return;
            }

            this.isWorking = true;
            await inviteRepo.sendInvite(
                this.inviteEmail,
                this.store.fridge.id,
                this.store.user.id,
                this.store.user.displayName
            );
            this.isWorking = false;
            this.inviteEmail = "";
        },
    },
};
