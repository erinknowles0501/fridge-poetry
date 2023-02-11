import { jest } from "@jest/globals";

//console.log("firestore", firestore);

// jest.mock("../../src/firebase/index.js", () => {
//     return jest.fn(() => 42);
// });

jest.unstable_mockModule("../../src/firebase/index.js", () => ({
    app: jest.fn(() => 42),
    // etc.
}));

const app = await import("../../src/firebase/index.js");

// import app from "../../src/firebase/index.js";
// jest.mock("../../src/firebase/index.js");

//const db = firestore.getFirestore(app);
const db = "sss";

import { userService } from "../../src/services/api";

test("userService can create user", async () => {
    // jest.mock("firebase/firestore", () => ({
    //     // return jest.fn(() => ({
    //     //     doc() {
    //     //         return "sdgsdgdsg";
    //     //     },
    //     // }));
    //     __esModule: true,
    //     firestore: {
    //         doc: jest.fn(() => 15),
    //         getFirestore() {
    //             () => jest.fn();
    //         },
    //         // etc.
    //     },
    // }));
    const mockGetFirestore = jest.fn();

    jest.unstable_mockModule("firebase/firestore", () => ({
        __esModule: true,
        firestore: {
            doc: jest.fn(() => 15),
            getFirestore: mockGetFirestore,

            // etc.
        },
    }));
    const firestore = await import("firebase/firestore");
    // console.log(
    //     "jest.isMockFunction(firestore)",
    //     jest.isMockFunction(firestore)
    // );

    const newUserID = "abcde";
    //const newUserRef = firestore.doc(db, "users", newUserID);
    //console.log("newUserRef", newUserRef);
});
