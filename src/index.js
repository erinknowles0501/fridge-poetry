import { scaleApp } from "./scale.js";
import { makeFridge } from "./appSetup.js";
import store from "./store.js";
import createNewFridgeUI from "./newFridge.js";
import * as services from "./services/api.js";
import startUI from "./ui/index.js";
import router from "./services/router.js";

// TODO Routing incl. loadFridge() on route change
// TODO Clicking word updates its z-index
// TODO Mobile interactions...

await store.initialize(services, router);
makeFridge();

// TODO: Case where landscape
store.scale = scaleApp(store.appEl);
onresize = () => {
    ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
};

createNewFridgeUI();

store.watchCurrentUserState();

startUI();
