class Store {
    appEl = null;
    fridge = {
        id: null,
        info: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = null;
    services = {};
    id = Date.now();

    async initialize(services) {
        this.clear();

        this.services = services;
        this.appEl = document.querySelector("#app");

        this.fridge.id = window.location.pathname.slice(1);
        this.fridge.info = await this.services.fridgeService.getFridgeByID(
            this.fridge.id
        );
        this.fridge.words = await this.services.wordService.getWordsByFridge(
            this.fridge.id
        );

        this.user = await this.services.userService.getUserByID(
            this.services.authService.auth.currentUser.uid
        );
        this.user.permissions =
            await this.services.permissionService.getPermissionsByUserAndFridge(
                this.user.id,
                this.fridge.id
            );
    }

    clear() {
        Object.assign(this, new Store()); // TODO double check this...
    }
}

const store = new Store();
export default store;
