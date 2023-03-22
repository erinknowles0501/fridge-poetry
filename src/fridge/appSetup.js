import { fridgeRepo } from "../services/api/index";
import { setElementPosition } from "./domHelpers.js";
import store from "./store.js";
import { APP_HEIGHT } from "./scale";

export function makeFridge() {
    makeWordEls();
    addAppDragListeners();
}

export function scaleGhost() {
    const computedWordStyle = getComputedStyle(document.querySelector(".word"));

    const adjustedFontSizeInt =
        computedWordStyle.getPropertyValue("font-size").split("px")[0] *
        store.scale.y;
    store.ghostEl.style.fontSize = adjustedFontSizeInt + "px";

    const adjustedPaddingTopInt =
        computedWordStyle.getPropertyValue("padding-top").split("px")[0] *
        store.scale.y;
    const adjustedPaddingLeftInt =
        computedWordStyle.getPropertyValue("padding-left").split("px")[0] *
        store.scale.x;
    store.ghostEl.style.padding = `${adjustedPaddingTopInt}px ${adjustedPaddingLeftInt}px`;

    const CHAR_WIDTH_RATIO = 0.55; // This is an approximation of the value of the char width for a char height of 1. One way to actually get this value is to get the offsetWidth of an element containing just one character and with no padding, but that is overkill here.
    const charWidth = adjustedFontSizeInt * CHAR_WIDTH_RATIO;
    const expectedWidth = charWidth / (store.scale.y / store.scale.x);
    store.ghostEl.style.letterSpacing = -(charWidth - expectedWidth) + "px";

    if (store.scale.isPortrait) {
        store.ghostEl.className = "vertical-ghost";
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
    function onDragStart(event) {
        store.currentDrag.offset.x = event.offsetX;
        store.currentDrag.offset.y = event.offsetY;

        store.ghostEl.textContent = element.textContent;
        event.dataTransfer?.setDragImage(
            store.ghostEl,
            event.offsetX * store.scale.x,
            event.offsetY * store.scale.y
        );
        store.currentDrag.el = element;
    }

    element.addEventListener("dragstart", onDragStart);
    element.addEventListener("touchstart", onDragStart);
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
    store.appEl.addEventListener("touchmove", (event) => {
        if (store.currentDrag.el) {
            store.ghostEl.style.zIndex = 20;
            store.ghostEl.style.top = event.changedTouches[0].pageY + "px";
            store.ghostEl.style.left = event.changedTouches[0].pageX + "px";
        }
    });

    store.appEl.addEventListener("drop", onDrop);
    store.appEl.addEventListener("touchend", (event) => onDrop(event, true));

    function onDrop(event, isTouch = false) {
        if (store.currentDrag.el) {
            const uiEl = document.querySelector("#app-ui");
            /*
            This function has to take the on-page location of the drop (x and y values up to the pixel width and height of the client's window) and transform it into the "app" location (x and y values up to APP_WIDTH and APP_HEIGHT - the internal coordinate system), taking into account the possible (UI is at side in landscape, top in portrait) offset from the UI element, and the possible (mobile doesn't record this) offset from where the word was clicked vs that word's origin.
            Word-offset is added outside the translation to app location, since it's recorded and applied in on-page location, and has to be cancelled out the same way.

            There are also two factors here: 
            1. Whether the page is portrait or landscape
            2. Whether the browser is desktop or mobile.

            (1) Affects positioning (due to UI position), and gives weird inversions of X and Y because of the rotation of the app element
            (2) Affects how we get the location of the event on the page.
            */

            const pageX = event.pageX || event.changedTouches[0].pageX;
            const pageY = event.pageY || event.changedTouches[0].pageY;

            let adjustedX, adjustedY;

            if (store.scale.isPortrait) {
                /* Here, because the app is rotated, we have to translate the on-page Y value into an in-app X value, and vice versa. */
                adjustedX = (pageY - uiEl.offsetHeight) / store.scale.x;
                adjustedY = APP_HEIGHT - pageX / store.scale.y;
            } else {
                adjustedX =
                    (pageX - uiEl.offsetWidth) / store.scale.x -
                    store.currentDrag.offset.x;
                adjustedY = pageY / store.scale.y - store.currentDrag.offset.y;
            }

            adjustedX = Math.round(adjustedX);
            adjustedY = Math.round(adjustedY);

            setElementPosition(store.currentDrag.el, adjustedY, adjustedX);
            fridgeRepo
                .updateWord(
                    store.currentDrag.el.getAttribute("data-id"),
                    adjustedY,
                    adjustedX,
                    store.fridge.id
                )
                .then(() => (store.currentDrag.el = null));

            if (isTouch) {
                store.ghostEl.style.top = "-100px"; // These magic numbers aren't terribly magic - they're just to hide the element.
                store.ghostEl.style.left = "-100px";
                store.ghostEl.style.zIndex = "-20";
            }
        }
    }
}
