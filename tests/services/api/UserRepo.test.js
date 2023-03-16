import UserRepo from "../../../src/services/api/UserRepo";

import { testEnvFactory, writeDB } from "../../emulator-setup.js";

import { getDocs, collection } from "firebase/firestore";

const MOCK_USERS = [
    {
        email: "alice@test.com",
        displayName: "Alice",
        displayColor: 18,
        id: "alice",
    },
    {
        email: "bob@test.com",
        displayName: "Bob",
        displayColor: 27,
        id: "bob",
    },
];

const MOCK_NEW_USER = {
    email: "newuser@test.com",
    displayName: "New user",
    displayColor: 0,
    id: "newuser",
};

let testEnv,
    authAlice,
    userRepoAlice,
    authBob,
    userRepoBob,
    authNone,
    userRepoNone;

beforeAll(async () => {
    testEnv = await testEnvFactory("userrepo");

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    userRepoAlice = new UserRepo(authAlice.firestore());
    authBob = testEnv.authenticatedContext("bob", {
        email: "bob@test.com",
    });
    userRepoBob = new UserRepo(authBob.firestore());
    authNone = testEnv.unauthenticatedContext();
    userRepoNone = new UserRepo(authNone.firestore());
});

// const userRepoAlice = new UserRepo(null, authAlice.firestore());
// const userRepoNone = new UserRepo(null, authNone.firestore());

beforeEach(async () => {
    await testEnv.clearFirestore();
    await writeDB(testEnv, "users", MOCK_USERS);
});

afterAll(async () => {
    await testEnv.cleanup();
});

test("Get one", async () => {
    const result = await userRepoAlice.getOne(MOCK_USERS[0].id);
    expect(result).toEqual(MOCK_USERS[0]);
});

test("Get one as ref", async () => {
    const result = await userRepoAlice.getOne(MOCK_USERS[0].id, true);
    expect(!!result.metadata).toEqual(true);
    expect(result.id).toEqual(MOCK_USERS[0].id);
});

test("Create returns new id", async () => {
    const result = await userRepoNone.create(MOCK_NEW_USER);
    expect(result).toBeTruthy();
});

test("CreateWithID returns same id as passed", async () => {
    const id = await userRepoNone.createWithID(MOCK_NEW_USER.id, MOCK_NEW_USER);
    expect(id).toEqual(MOCK_NEW_USER.id);
});

test("Update", async () => {
    const update = { displayName: "New name" };
    await userRepoAlice.update(MOCK_USERS[0].id, update);

    const result = await userRepoAlice.getOne(MOCK_USERS[0].id);
    expect(result).toEqual({
        ...MOCK_USERS[0],
        displayName: update.displayName,
    });
});

test("Delete", async () => {
    await userRepoAlice.delete(MOCK_USERS[0].id);

    const remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(collection(context.firestore(), "users"));
        docs.docs.forEach((doc) => remainingData.push(doc.data()));
    });

    expect(remainingData).toEqual(
        MOCK_USERS.filter((item) => item.id != MOCK_USERS[0].id)
    );
});

test("Get that an email is NOT in use", async () => {
    const result = await userRepoNone.getWhetherEmailInUse("unused@email.com");
    expect(result).toEqual(false);
});

test("Get that an email IS in use", async () => {
    const result = await userRepoNone.getWhetherEmailInUse(MOCK_USERS[0].email);
    expect(result).toEqual(true);
});

// TODO: Updating user with bad data fails
