import { jest } from "@jest/globals";

export const mockDB = {
    collection: [],
};

jest.unstable_mockModule("firebase/firestore", () => ({
    __esModule: true,
    default: jest.fn(),
    getDoc: jest.fn((id) => {
        return {
            data: jest.fn(() => data(id)),
            id: id,
            metadata: true,
            doc: jest.fn(),
        };
    }),
    collection: jest.fn(() => "collection"),
    getFirestore: jest.fn(),
    doc: jest.fn(doc),
}));
const firestore = await import("firebase/firestore");

function doc(db, collection, id) {
    return id;
}

function data(id) {
    const foundUser = mockDB.collection.find((user) => user.id === id);

    return foundUser;
}

export default firestore;
