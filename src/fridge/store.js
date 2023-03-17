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
    id = Date.now(); // TODO

    async initialize(services) {
        this.clear();

        this.services = services;
        this.appEl = document.querySelector("#app");

        this.fridge.id = window.location.pathname.slice(1);

        this._user = await this.services.userRepo.getOne(
            this.services.authService.auth.currentUser.uid
        );

        const [fridge, permissions] = await Promise.all([
            this.services.fridgeRepo.getOne(this.fridge.id),
            this.services.permissionRepo.getPermissionByUserAndFridge(
                this._user.id,
                this.fridge.id
            ),
        ]);
        this.fridge = fridge;

        this._user.permissions = permissions;
        this.makeUpdateProxy(
            this._user,
            this,
            "user",
            services.userRepo.update.bind(services.userRepo)
        );
    }

    clear() {
        Object.assign(this, new Store()); // TODO double check this...
    }

    makeUpdateProxy(plainObj, target, key, update) {
        const proxy = new Proxy(plainObj, {
            set(obj, prop, value) {
                if (obj.id) {
                    update(obj.id, {
                        [prop]: value,
                    });
                }
                return Reflect.set(...arguments);
            },
        });
        target[key] = proxy;
    }
}

const store = new Store();
export default store;
