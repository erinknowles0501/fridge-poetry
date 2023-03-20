import { fridgeRepo } from "../services/api/index";
import { setElementPosition } from "./domHelpers.js";
import store from "./store.js";

export function makeFridge() {
    makeWordEls();
    addAppDragListeners();
}

export function scaleGhost() {
    const ghostEl = document.querySelector("#dragghost");
    const computedWordStyle = getComputedStyle(document.querySelector(".word"));

    const adjustedFontSizeInt =
        computedWordStyle.getPropertyValue("font-size").split("px")[0] *
        store.scale.y;
    ghostEl.style.fontSize = adjustedFontSizeInt + "px";

    const adjustedPaddingTopInt =
        computedWordStyle.getPropertyValue("padding-top").split("px")[0] *
        store.scale.y;
    const adjustedPaddingLeftInt =
        computedWordStyle.getPropertyValue("padding-left").split("px")[0] *
        store.scale.x;
    ghostEl.style.padding = `${adjustedPaddingTopInt}px ${adjustedPaddingLeftInt}px`;

    const CHAR_WIDTH_RATIO = 0.55; // This is an approximation of the value of the char width for a char height of 1. One way to actually get this value is to get the offsetWidth of an element containing just one character and with no padding, but that is overkill here.
    const charWidth = adjustedFontSizeInt * CHAR_WIDTH_RATIO;
    const expectedWidth = charWidth / (store.scale.y / store.scale.x);
    ghostEl.style.letterSpacing = -(charWidth - expectedWidth) + "px";

    if (store.scale.isPortrait) {
        ghostEl.className = "vertical-ghost";
    }
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
    const ghostEl = document.querySelector("#dragghost");

    element.addEventListener("dragstart", (event) => {
        store.currentDrag.offset.x = event.offsetX;
        store.currentDrag.offset.y = event.offsetY;

        ghostEl.textContent = element.textContent;
        event.dataTransfer.setDragImage(
            ghostEl,
            event.offsetX * store.scale.x,
            event.offsetY * store.scale.y
        );

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
        const uiEl = document.querySelector("#app-ui");

        const adjustedX = Math.round(
            (event.pageX - (store.scale.isPortrait ? 0 : uiEl.offsetWidth)) /
                store.scale.x -
                store.currentDrag.offset.x
        );
        const adjustedY = Math.round(
            (event.pageY - (store.scale.isPortrait ? uiEl.offsetHeight : 0)) /
                store.scale.y -
                store.currentDrag.offset.y
        );

        setElementPosition(store.currentDrag.el, adjustedY, adjustedX);
        fridgeRepo.updateWord(
            store.currentDrag.el.getAttribute("data-id"),
            adjustedY,
            adjustedX,
            store.fridge.id
        );
    });
}
