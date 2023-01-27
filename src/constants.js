export const PERMISSIONS_NAMES = {
    EDIT_FRIDGE_NAME: "edit-fridge-name",
    DELETE_FRIDGE: "delete-fridge",
    EDIT_MAX_USERS: "edit-max-users",
    CHANGE_FRIDGE_VISIBILITY: "change-fridge-visibility",
    EDIT_MAX_CUSTOM_WORDS_PER_USER: "edit-max-custom-words-per-user",
    SEND_INVITES: "send-invites",
    REVOKE_INVITES: "revoke-invites",
    FREEZE_USER: "freeze-user",
    UNFREEZE_USER: "unfreeze-user",
    CREATE_CUSTOM_WORDS: "create-custom-words",
};

export const PERMISSION_GROUPS = {
    OPTIONAL: [
        PERMISSIONS_NAMES.SEND_INVITES,
        PERMISSIONS_NAMES.CREATE_CUSTOM_WORDS,
        PERMISSIONS_NAMES.FREEZE_USER,
    ],
    FRIDGE_OWNER: [
        PERMISSIONS_NAMES.EDIT_FRIDGE_NAME,
        PERMISSIONS_NAMES.DELETE_FRIDGE,
        PERMISSIONS_NAMES.EDIT_MAX_USERS,
        PERMISSIONS_NAMES.CHANGE_FRIDGE_VISIBILITY,
        PERMISSIONS_NAMES.EDIT_MAX_CUSTOM_WORDS_PER_USER,
        PERMISSIONS_NAMES.REVOKE_INVITES,
        PERMISSIONS_NAMES.UNFREEZE_USER,
    ],
};

/*
basic (anonymous)
    can view fridge (frozen)
    can move words on any fridge they have access to (ie invited and unfrozen, or public)
    can create new fridge

editable by owner
    can send invites
    can create custom words
    // can save poems
    // can shuffle words
    // can select multiple words
    can freeze user  (is_frozen)
    // can lock own words
   
fridge owner
    can edit fridge name
    can delete fridge
    can edit max users
    can change fridge visibility (private or public)
    can edit max custom words per user
    can revoke invites
    // can edit max words
    can unfreeze user
    can remove user
    // can archive words
    // can un-archive words
    // can create new words
    can edit user's permissions:
        see 'editable by owner'
    can archive someone's custom words

*/
