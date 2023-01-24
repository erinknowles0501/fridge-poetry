class Store {
    appEl = null;
    fridge = {
        fridgeID: null,
        info: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = null;
    services = {};
    router = null;

    async initialize(services) {
        return new Promise(async (resolve) => {
            this.clear();

            this.services = services;
            this.appEl = document.querySelector("#app");

            this.fridge.fridgeID = window.location.pathname.slice(1);

            this.fridge.info = await this.services.fridgeService.getFridgeByID(
                this.fridge.fridgeID
            );
            this.fridge.words =
                await this.services.wordService.getWordsByFridge(
                    this.fridge.fridgeID
                );

            await this.services.authService.signIn();
            this.user = await this.services.userService.getUserByID(
                this.services.authService.auth.currentUser.uid
            );
            resolve();
        });
    }

    clear() {
        // TODO double check this...
        Object.assign(this, new Store());
    }

    watchCurrentUserState() {
        // Update user and UI on user changes
        this.services.userService.handleCurrentUserDataChange(
            (data) => (this.user = data)
        );
    }
}

const store = new Store();
export default store;
