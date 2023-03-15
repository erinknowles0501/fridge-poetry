import { PERMISSION_GROUPS } from "../../../constants";
import {
    inviteRepo,
    userRepo,
    permissionRepo,
    authService,
} from "../../../services/api/index";

export default {
    inject: ["store"],
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
                    <h2>Join '{{store.fridge.name}}'?</h2>
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

            this.invite = await inviteRepo.getOne(inviteID);

            if (this.invite.status !== "pending") {
                this.isActive = false;
                window.location.search = window.location.search
                    .replace("invite=", "")
                    .replace(this.invite.id, "");
            }

            await userRepo
                .getOne(this.invite.fromID)
                .then(
                    (inviter) =>
                        (this.invite.fromDisplayName = inviter.displayName)
                );
        },
        async acceptInvite() {
            if (this.invite.fridgeID !== this.store.fridge.id) {
                // TODO Error
                console.error("This invitation is for a different fridge");
                return;
            }
            if (this.invite.to !== authService.auth.currentUser.email) {
                // TODO Error
                console.error("Invite to/current user mismatch");
                return;
            }

            await inviteRepo.acceptInvitation(this.invite.id);
            await permissionRepo.create(
                this.store.fridge.id,
                authService.auth.currentUser.uid,
                [...PERMISSION_GROUPS.OPTIONAL]
            );
            this.isActive = false;
        },
    },
};
