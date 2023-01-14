import { scaleApp } from "./scale.js";
import { loadFridge } from "./appSetup.js";
import store from "./store.js";
import createNewFridgeUI from "./newFridge.js";

// TODO Routing incl. loadFridge() on route change
// TODO Clicking word updates its z-index
// TODO Mobile interactions...

await loadFridge(window.location.hash.slice(1));

// TODO: Case where landscape
store.scale = scaleApp(store.appEl);
onresize = () => {
    ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
};

createNewFridgeUI();

import userDropdown from "./ui/userDropdown.js";
userDropdown.render();
