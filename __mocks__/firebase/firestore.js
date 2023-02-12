import { jest } from "@jest/globals";

jest.unstable_mockModule("firebase/firestore", () => ({
    __esModule: true,
    default: jest.fn(),
    getDoc: jest.fn(() => ({
        default: jest.fn(data),
        data: jest.fn(data),
        id: id,
        metadata: true,
        doc: jest.fn(doc),
    })),
    collection: jest.fn(() => "collection"),
    getFirestore: jest.fn(),
    doc: jest.fn(doc),
}));
const firestore = await import("firebase/firestore");

function doc(db, collection, id) {
    //console.log("id", id);
    //return mockUsers.find((user) => user.id === id);
    return id;
}

function data(id) {
    return mockUsers.find((user) => user.id === id);
}

export let mockUsers = [];

export default firestore;
