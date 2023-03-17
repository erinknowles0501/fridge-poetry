import { scaleApp } from "./scale.js";
import { makeFridge, scaleGhost } from "./appSetup.js";
import store from "./store.js";
import * as services from "../services/api/index";
import startUI from "./ui/index.js";

// TODO Clicking word updates its z-index
// TODO Mobile interactions...

services.authService.handleAuthStateChanged(async (state) => {
    if (state?.uid) {
        await store.initialize(services);
        makeFridge();

        // TODO: Case where landscape
        store.scale = scaleApp(store.appEl);
        scaleGhost();
        onresize = () => {
            ({ x: store.scale.x, y: store.scale.y } = scaleApp(store.appEl));
            scaleGhost();
        };

        startUI();
    } else {
        window.location = "/";
    }
});
