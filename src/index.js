/******
 * FIREBASE
 * */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
const db = getFirestore(app);

/**
 * Get words (+etc) from firebase connection
 * */

const words = [];
const querySnapshot = await getDocs(collection(db, "defaultWords"));
querySnapshot.forEach((doc) => {
    words.push(doc.data());
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
        // TODO Add data-id so can get which word to update when element is moved
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

    // currentDragged.position.top = event.pageY;
    // currentDragged.position.left = event.pageX; // TODO Send to firebase
});
