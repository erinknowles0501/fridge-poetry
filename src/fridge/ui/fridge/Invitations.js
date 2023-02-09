import { invitationService } from "../../../services/api";

export default {
    data() {
        return {
            inviteEmail: "",
            isWorking: false,
            pendingInvites: [],
            userInvites: [],
            isEditing: true,
        };
    },
    computed: {
        canEditAll() {
            return true;
        },
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
            <button v-if="isEditing && (canEditAll || canEditOne(invite.id))">X</button>
        </div>
        <div v-else>No invites to show.</div>

    </div>
    `,
    created() {
        invitationService
            .getInvitationsByFridge(this.$store.fridge.id)
            .then((result) => (this.pendingInvites = result));
        invitationService
            .getSentInvitesByUser(this.$store.user.id)
            .then((result) => (this.userInvites = result));
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
            await invitationService.sendInvite(
                this.inviteEmail,
                this.$store.fridge.id,
                this.$store.user.displayName
            );
            this.isWorking = false;
            this.inviteEmail = "";
        },
        canEditOne(inviteID) {
            return this.userInvites.includes(
                (invite) => invite.id === inviteID
            );
        },
    },
};
