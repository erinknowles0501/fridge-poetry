import {
    invitationService,
    userService,
    authService,
} from "../../../services/api";

export default {
    data() {
        return {
            isActive: false,
            invite: null,
        };
    },
    template: `
        <div>
            <div class="overlay-wrap" v-if="isActive">
                <div class="modal">
                    <h2>Join '{{store.fridge.info.name}}'?</h2>
                    <p>
                        {{invite?.fromDisplayName || 'A user' }} has invited you to join this fridge. Accept this invitation?
                    </p>
                    <button @click="acceptInvite">Accept</button>
                </div>
            </div>
        </div>
    `,
    created() {
        this.isActive = window.location.search.includes("invite");
        if (this.isActive) {
            this.handleInvite();
        }
    },
    methods: {
        async handleInvite() {
            const inviteID = window.location.search
                .slice(1)
                .split("&")
                .find((param) => param.includes("invite"))
                .split("=")[1];

            this.invite = await invitationService.getInvitation(inviteID);
            await userService
                .getUserByID(this.invite.fromID)
                .then(
                    (inviter) =>
                        (this.invite.fromDisplayName = inviter.displayName)
                );
        },
        async acceptInvite() {
            await invitationService.acceptInvitation(
                this.invite,
                this.store.fridge.id
            );
            this.isActive = false;
        },
    },
};
