import { jest } from "@jest/globals";
const { default: firestore } = await import(
    "../../../__mocks__/firebase/firestore"
);
let { mockUsers } = await import("../../../__mocks__/firebase/firestore");
const { default: UserRepo } = await import(
    "../../../src/services/api/UserRepo"
);

const MOCK_USERS = [
    {
        email: "test@abc.com",
        displayName: "Test",
        displayColor: 18,
        id: "testid1",
    },
    {
        email: "test@def.com",
        displayName: "Test2",
        displayColor: 27,
        id: "testid2",
    },
];

const MOCK_NEW_USER = {
    email: "newUser@111.com",
    displayName: "New user",
    displayColor: 0,
    id: "testid111",
};

const userRepo = new UserRepo();

beforeEach(async () => {
    mockUsers = MOCK_USERS;
});

test("Firestore is mocked", () => {
    expect(jest.isMockFunction(firestore.default)).toEqual(true);
});

test("UserRepo can get one user", async () => {
    const user = await userRepo.getOne("testid1");
    expect(firestore.getDoc).toHaveBeenCalled();
    expect(firestore.doc).toHaveBeenCalled();
    console.log("user", user);

    expect(user).toEqual(MOCK_USERS[0]);
});

test("UserRepo can get one user as ref", async () => {
    const user = await userRepo.getOne("gtEA56NNwMXLcK0ik38CA8VjXr43", true);

    expect(!!user.metadata).toEqual(true);
});