import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
} from "firebase/firestore";

import app from "./firebase/index.js";
const db = getFirestore(app);

/**
 * Get words (+etc) from firebase connection
 * */

const words = [];
const querySnapshot = await getDocs(collection(db, "defaultWords"));
querySnapshot.forEach((doc) => {
    words.push({ ...doc.data(), id: doc.id });
});
console.log("words", words);

/**
 * Set up app
 * */

const appEl = document.querySelector("#app");
appEl.addEventListener(
    "dragover",
    (event) => {
        event.preventDefault();
        // console.log("event", event);
    },
    false
);

function makeWordEls() {
    words.forEach((word) => {
        const el = document.createElement("div");
        el.className = "word";
        el.textContent = word.wordtext; // TODO Checks to assume this is safely escaped
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
    element.style.top = positionTop + "px";
    element.style.left = positionLeft + "px";
}

// TODO
// function checkPositionFree(event) {
//     console.log("event", event);
//     const activeRect = event.target.getBoundingClientRect();
//     console.log("activeRect", activeRect);
// }

makeWordEls();

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
    console.log("id", id);

    const result = await updateDoc(id, {
        "position.top": top,
        "position.left": left,
    });
    console.log("result", result);
}
