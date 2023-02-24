import FridgeRepo from "../../../src/services/api/FridgeRepo";
import { PERMISSIONS_NAMES } from "../../../src/constants.js";
import { testEnvFactory, writeDB } from "../../emulator-setup.js";
import { getDocs, collection } from "firebase/firestore";

const MOCK_FRIDGES = [
    {
        creatorUID: "alice",
        fridgeVisibility: "private",
        maxCustomWords: 5,
        maxUsers: 20,
        name: "Test fridge 1",
        id: "testid1",
    },
    // {
    //     creatorUID: "alice",
    //     fridgeVisibility: "private",
    //     maxCustomWords: 5,
    //     maxUsers: 20,
    //     name: "Test fridge 2",
    //     id: "testid2",
    // },
    // {
    //     creatorUID: "bob",
    //     fridgeVisibility: "private",
    //     maxCustomWords: 5,
    //     maxUsers: 20,
    //     name: "Test fridge 3",
    //     id: "testid3",
    // },
];

const MOCK_NEW_FRIDGE = {
    creatorUID: "alice",
    fridgeVisibility: "private",
    maxCustomWords: 5,
    maxUsers: 20,
    name: "New test fridge",
    id: "newtestid",
};

const MOCK_PERMISSIONS = [
    {
        id: "testid1_alice",
        fridgeID: "testid1",
        userID: "alice",
        permissions: [...Object.values(PERMISSIONS_NAMES)],
    },
    // {
    //     id: "testid2_alice",
    //     fridgeID: "testid2",
    //     userID: "alice",
    // },
    // {
    //     id: "testid1_bob",
    //     fridgeID: "testid1",
    //     userID: "bob",
    // },
];

let testEnv, authAlice, fridgeRepoAlice;

beforeAll(async () => {
    testEnv = await testEnvFactory("fridgerepo");

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    fridgeRepoAlice = new FridgeRepo(authAlice, authAlice.firestore());
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await writeDB(testEnv, "permissions", MOCK_PERMISSIONS);
    await writeDB(testEnv, "fridges", MOCK_FRIDGES);
});

afterAll(async () => {
    await testEnv.cleanup();
});

test("Get one", async () => {
    const result = await fridgeRepoAlice.getOne(MOCK_FRIDGES[0].id);

    expect(result).toEqual(MOCK_FRIDGES[0]);
});

test("Get one as ref", async () => {
    const result = await fridgeRepoAlice.getOne(MOCK_FRIDGES[0].id, true);
    expect(!!result.metadata).toEqual(true);
    expect(result.id).toEqual(MOCK_FRIDGES[0].id);
});

test("Create returns new id", async () => {
    const result = await fridgeRepoAlice.create(MOCK_NEW_FRIDGE);
    expect(result).toBeTruthy();
});

test("CreateWithID returns same id as passed", async () => {
    const id = await fridgeRepoAlice.createWithID(
        MOCK_NEW_FRIDGE.id,
        MOCK_NEW_FRIDGE
    );
    expect(id).toEqual(MOCK_NEW_FRIDGE.id);
});

test("Update", async () => {
    const update = { name: "New name" };
    await fridgeRepoAlice.update(MOCK_FRIDGES[0].id, update);

    const result = await fridgeRepoAlice.getOne(MOCK_FRIDGES[0].id);
    expect(result).toEqual({
        ...MOCK_FRIDGES[0],
        name: update.name,
    });
});

test("Delete", async () => {
    await fridgeRepoAlice.delete(MOCK_FRIDGES[0].id);

    const remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(collection(context.firestore(), "fridges"));
        docs.docs.forEach((doc) => remainingData.push(doc.data()));
    });

    expect(remainingData).toEqual(
        MOCK_FRIDGES.filter((item) => item.id != MOCK_FRIDGES[0].id)
    );
});
