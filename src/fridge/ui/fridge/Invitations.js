import { invitationService } from "../../../services/api";

export default {
    data() {
        return {
            inviteEmail: "@x.com",
        };
    },
    template: `
    <div>
        <input type="email" placeholder="@x.com" v-model="inviteEmail" />
        <button @click="sendInvite">Send</button>
    </div>
    `,
    methods: {
        sendInvite() {
            invitationService.sendInvite(
                this.inviteEmail,
                this.store.fridge.id,
                this.store.user.displayName
            );
        },
    },
};
