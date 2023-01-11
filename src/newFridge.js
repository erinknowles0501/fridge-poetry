import { fridgeService } from "./services/api.js";
import { loadFridge } from "./appSetup.js";

export default function createNewFridgeUI() {
    const newFridgeModalToggleEl = document.querySelector(
        "#new-fridge-modal-toggle"
    );

    const newFridgeModalEl = document.querySelector(".new-fridge-modal");
    newFridgeModalToggleEl.addEventListener("click", () => {
        newFridgeModalEl.classList.toggle("new-fridge-modal-hidden");
    });

    const createNewFridgeEl = document.querySelector("#create-new-fridge");

    createNewFridgeEl.addEventListener("click", async () => {
        const newFridgeID = await fridgeService.createFridge(
            document.querySelector("#new-fridge-name").value
        );

        window.location.hash = newFridgeID;
        await loadFridge(newFridgeID);
    });

    // TODO Clear old word els, close modal
}
