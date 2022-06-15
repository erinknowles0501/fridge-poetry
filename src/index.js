// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9mJ8pnpsPYephd3H9FJU4-mRLsn4y2do",
    authDomain: "fridge-poetry-ek.firebaseapp.com",
    projectId: "fridge-poetry-ek",
    storageBucket: "fridge-poetry-ek.appspot.com",
    messagingSenderId: "1093091176992",
    appId: "1:1093091176992:web:a8524051a03ed50cbe0245",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("app", app);

/////

console.log("here");

const words = [
    "hello",
    "goodbye",
    "yes",
    "no",
    "know",
    "be",
    "see",
    "his",
    "her",
    "ing",
];

const appEl = document.querySelector("#app");

function makeWordEls() {
    words.forEach((word) => {
        const el = document.createElement("div");
        el.className = "word";
        el.textContent = word;
        el.setAttribute("data-word", word); /// TODO escape special chars
        el.setAttribute("draggable", true);
        appEl.appendChild(el);
    });
}

// TODO
// function checkPositionFree(event) {
//     console.log("event", event);
//     const activeRect = event.target.getBoundingClientRect();
//     console.log("activeRect", activeRect);
// }

makeWordEls();

const wordEls = document.querySelectorAll(".word");
const wordObjs = {};

let currentDragged = null;

wordEls.forEach((wordEl) => {
    wordEl.addEventListener("dragstart", () => {
        currentDragged = wordEl;
    });
    const word = wordEl.getAttribute("data-word");
    const wordBoundingRect = wordEl.getBoundingClientRect();

    wordObjs[word] = {
        word: word,
        wordText: wordEl.textContent,
        wordEl: wordEl,
        boundingRect: wordBoundingRect,
    };
});

console.log("wordObjs", wordObjs);

appEl.addEventListener(
    "dragover",
    (event) => {
        event.preventDefault();
    },
    false
);

appEl.addEventListener("drop", (event) => {
    event.preventDefault();
    currentDragged.style.top = event.pageY + "px";
    currentDragged.style.left = event.pageX + "px";
});
