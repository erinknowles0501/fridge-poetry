import { scaleApp } from "./scale.js";
import { makeFridge } from "./appSetup.js";
import store from "./store.js";
import createNewFridgeUI from "./newFridge.js";
import * as services from "./services/api.js";
import UserDropdown from "./ui/userDropdown.js";
import startVue from "./ui/index.js";

// TODO Routing incl. loadFridge() on route change
// TODO Clicking word updates its z-index
// TODO Mobile interactions...

await store.initialize(services);
makeFridge();

// TODO: Case where landscape
store.scale = scaleApp(store.appEl);
onresize = () => {
    ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
};

createNewFridgeUI();

const userDropdown = new UserDropdown();
store.registerUI({ userDropdown: userDropdown });
userDropdown.render();

store.watchCurrentUserState();

startVue();
