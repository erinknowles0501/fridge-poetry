import { wordService, fridgeService } from "./services/api.js";
import scaleApp from "./scale.js";

// TODO Routing

// TODO Populate fridge info from fridge data
const fridge = {
    fridgeID: null,
    name: null,
    words: [],
};

const appEl = document.querySelector("#app");
appEl.addEventListener(
    "dragover",
    (event) => {
        event.preventDefault();
    },
    false
);

const scale = scaleApp();
onresize = () => {
    scale = scaleApp();
};

async function loadFridge() {
    // TODO: Case where there is no hash, or hash is invalid, or id doesn't come back with a fridge
    fridge.fridgeID = window.location.hash.slice(1);
    fridge.name = await fridgeService.getFridgeByID(fridge.fridgeID);
    fridge.words = await wordService.getWordsByFridge(fridge.fridgeID);

    makeWordEls();
}

await loadFridge();

/**
 * Set up app
 * */

function makeWordEls() {
    fridge.words.forEach((word) => {
        const el = document.createElement("div");
        el.className = "word";
        el.textContent = word.wordText; // TODO Checks to assume this is safely escaped
        el.dataset.id = word.id;
        el.setAttribute("draggable", true);
        setElementPosition(el, word.position.top, word.position.left);

        addListeners(el);
        word.element = el;
        appEl.appendChild(el);
    });
}

function addListeners(element) {
    element.addEventListener("mouseover", () => {});
    element.addEventListener("dragstart", () => {
        currentDragged = element;
    });
}

function setElementPosition(element, positionTop, positionLeft) {
    element.style.top = positionTop / scale.y + "px";
    element.style.left = positionLeft / scale.x + "px";
}

// TODO
// function checkPositionFree(event) {
//     console.log("event", event);
//     const activeRect = event.target.getBoundingClientRect();
//     console.log("activeRect", activeRect);
// }

let currentDragged = null;

appEl.addEventListener("drop", (event) => {
    event.preventDefault();
    setElementPosition(currentDragged, event.pageY, event.pageX);
    updateWordPosition(
        currentDragged.getAttribute("data-id"),
        event.pageY,
        event.pageX
    );
});

async function updateWordPosition(id, top, left) {
    await wordService.updateWord(id, top, left, fridge.fridgeID);
}

/** New fridge... */
const newFridgeModalToggleEl = document.querySelector(
    "#new-fridge-modal-toggle"
);

const newFridgeModalEl = document.querySelector(".new-fridge-modal");
newFridgeModalToggleEl.addEventListener("click", () => {
    newFridgeModalEl.classList.toggle("new-fridge-modal-hidden");
});

const createNewFridge = document.querySelector("#create-new-fridge");
console.log("createNewFridge", createNewFridge);

createNewFridge.addEventListener("click", async () => {
    const newFridgeID = await fridgeService.createFridge(
        document.querySelector("#new-fridge-name").value
    );

    window.location.hash = newFridgeID;
    await loadFridge();
});
