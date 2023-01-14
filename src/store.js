class Store {
    appEl = null;
    fridge = {
        fridgeID: null,
        name: null,
        words: [],
    };
    currentDrag = { el: null, offset: { x: 0, y: 0 } };
    user = { color: "red", displayName: "Erin" };

    clearStore() {
        // TODO double check this...
        Object.assign(this, new Store());
    }
}

const store = new Store();
export default store;
