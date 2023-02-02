import { createApp } from "vue";
import LoginSignup from "./LoginSignup";
import FridgeSelection from "./FridgeSelection";
import NewFridge from "./NewFridge";
import {
    invitationService,
    authService,
    userService,
} from "../../services/api";
import { INVITATION_STATUSES } from "../../constants";

export default function startUI() {
    const app = createApp({
        components: { LoginSignup, FridgeSelection, NewFridge },
        data() {
            return {
                activeComponent: "LoginSignup",
            };
        },
        template: `
            <div>
                <component :is="activeComponent" @loggedIn="activeComponent = 'FridgeSelection'" @newFridge="activeComponent = 'NewFridge'" />
            </div>
        `,
        created() {
            const hasInviteParam = window.location.search
                .slice(1)
                .includes("invite");
            if (hasInviteParam) {
                const inviteID = window.location.search
                    .slice(1)
                    .split("&")
                    .find((param) => param.includes("invite"))
                    .split("=")[1];
                invitationService
                    .getInvitation(inviteID)
                    .then((invite) => this.invitationHandler(invite));
            }
        },
        methods: {
            async invitationHandler(invite) {
                console.log("invite", invite);

                if (invite.status !== INVITATION_STATUSES.PENDING) {
                    // TODO: Error toast
                    console.error("Invite does not exist or is not pending.");
                    return;
                }

                if (authService.auth.currentUser) {
                    if (authService.auth.currentUser.email !== invite.to) {
                        // TODO: Error toast w/ logout + link prompt
                        console.error(
                            "Invite email / current user email mismatch."
                        );
                        return;
                    }

                    // TODO: Join fridge component and switching
                } else {
                    const emailMatchesUser =
                        await userService.getWhetherAUserHasEmail(invite.to);

                    if (emailMatchesUser) {
                        // TODO: switching and email prop
                    }
                }
            },
        },
    });

    app.mount("#app");
}
