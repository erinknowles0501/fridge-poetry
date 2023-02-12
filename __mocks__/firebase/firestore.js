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
    getDocs: jest.fn((query) => {
        console.log("query", query);

        return {
            docs: [query],
        };
    }),
    collection: jest.fn(() => "collection"),
    getFirestore: jest.fn(),
    doc: jest.fn((db, collection, id) => id),
    query: jest.fn(() => ({
        where: jest.fn(where),
    })),
    where: jest.fn(where),
}));
const firestore = await import("firebase/firestore");

function data(id) {
    const foundUser = mockDB.collection.find((item) => item.id === id);
    return foundUser;
}

function where(key, operator, value) {
    console.log("key, operator, value", key, operator, value);

    if (operator == "==") {
        return mockDB.collection.find((item) => item[key] == value);
    }
}

export default firestore;
