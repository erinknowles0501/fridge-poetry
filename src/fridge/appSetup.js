import { wordService } from "../services/api.js";
import { setElementPosition } from "./domHelpers.js";
import store from "./store.js";

export function makeFridge() {
    makeWordEls();
    addAppDragListeners();
}

function makeWordEls() {
    store.fridge.words.forEach((word) => {
        const el = document.createElement("div");
        el.className = "word";
        el.textContent = word.wordText; // TODO Checks to assume this is safely escaped
        el.dataset.id = word.id;
        el.setAttribute("draggable", true);
        setElementPosition(el, word.position.y, word.position.x);

        addListeners(el);
        word.element = el;
        store.appEl.appendChild(el);
    });
}

function addListeners(element) {
    element.addEventListener("dragstart", (event) => {
        store.currentDrag.offset.x = event.offsetX;
        store.currentDrag.offset.y = event.offsetY;

        store.currentDrag.el = element;
    });
}

/** DRAG AND DROP **/

function addAppDragListeners() {
    store.appEl.addEventListener(
        "dragover",
        (event) => {
            event.preventDefault();
        },
        false
    );

    store.appEl.addEventListener("drop", (event) => {
        event.preventDefault();

        const adjustedX = Math.round(
            event.pageX / store.scale.x - store.currentDrag.offset.x
        );
        const adjustedY = Math.round(
            event.pageY / store.scale.y - store.currentDrag.offset.y
        );

        setElementPosition(store.currentDrag.el, adjustedY, adjustedX);
        wordService.updateWord(
            store.currentDrag.el.getAttribute("data-id"),
            adjustedY,
            adjustedX,
            store.fridge.id
        );
    });
}
