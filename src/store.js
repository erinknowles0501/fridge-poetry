class Store {
    appEl = null;
    fridge = {
        fridgeID: null,
        info: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = null;
    UImodules = {};
    services = {};

    async initialize(services) {
        this.clear();

        this.services = services;
        this.appEl = document.querySelector("#app");

        this.fridge.fridgeID = window.location.hash.slice(1);
        this.fridge.info = await this.services.fridgeService.getFridgeByID(
            this.fridge.fridgeID
        );
        this.fridge.words = await this.services.wordService.getWordsByFridge(
            this.fridge.fridgeID
        );

        await this.services.authService.signIn();
        this.user = await this.services.userService.getUserByID(
            this.services.authService.auth.currentUser.uid
        );
    }

    clear() {
        // TODO double check this...
        Object.assign(this, new Store());
    }

    watchCurrentUserState() {
        const modulesToRerender = [this.UImodules.userDropdown];
        // Update user and UI on user changes
        this.services.userService.handleCurrentUserDataChange(
            (data) => (this.user = data),
            modulesToRerender
        );
    }

    registerUI(modules) {
        Object.entries(modules).forEach(([key, value]) => {
            this.UImodules[key] = value;
        });
    }
}

const store = new Store();
export default store;
