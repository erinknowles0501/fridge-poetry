import { PERMISSIONS_NAMES as can } from "../../constants";

export default {
    fridge: [
        {
            title: "Manage Users",
            permissions: {
                showIfIn: [can.FREEZE_USER, can.UNFREEZE_USER],
            },
        },
        {
            title: "Invitations",
            permissions: {
                showIfIn: [can.SEND_INVITES, can.EDIT_BLACKLIST],
            },
            componentName: "Invitations",
        },
        {
            title: "Manage Words",
        },
        {
            title: "Fridge Settings",
            componentName: "FridgeSettings",
            permissions: {
                showIfIn: [
                    can.CHANGE_FRIDGE_VISIBILITY,
                    can.DELETE_FRIDGE,
                    can.EDIT_FRIDGE_NAME,
                    can.EDIT_MAX_USERS,
                    can.EDIT_MAX_CUSTOM_WORDS_PER_USER,
                    can.EDIT_BLACKLIST,
                ],
            },
        },
    ],
    user: [
        {
            title: "User Settings",
            componentName: "UserSettings",

            // parent
            // children
        },
        {
            title: "My Words",
            // props
        },
        {
            title: "My Fridges",
        },
        {
            title: "New Fridge",
        },
        {
            title: "Leave this Fridge",
            // handler
        },
    ],
};
