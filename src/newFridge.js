import { fridgeService, wordService } from "./services/api.js";
import { loadFridge } from "./appSetup.js";
import { setElementPosition } from "./domHelpers.js";
import store from "./store.js";
import { APP_HEIGHT, APP_WIDTH } from "./scale.js";

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
        scatterWords(store.fridge.words);
    });

    // TODO Clear old word els, close modal
}

function scatterWords(words) {
    const computedWordStyle = getComputedStyle(words[0].element);
    function getPropertyFloat(prop) {
        return parseFloat(
            computedWordStyle.getPropertyValue(prop).split("px")[0]
        );
    }

    const remSize = getPropertyFloat("font-size");
    const paddingX =
        getPropertyFloat("padding-left") + getPropertyFloat("padding-right");
    const paddingY =
        getPropertyFloat("padding-top") + getPropertyFloat("padding-bottom");

    words.forEach((word) => {
        const newX =
            Math.random() *
            (APP_WIDTH - remSize * word.wordText.length - paddingX);
        const newY = Math.random() * (APP_HEIGHT - remSize - paddingY);
        setElementPosition(word.element, newY, newX);
        wordService.updateWord(word.id, newY, newX, store.fridge.fridgeID);
    });
}
