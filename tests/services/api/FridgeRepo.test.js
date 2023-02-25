import FridgeRepo from "../../../src/services/api/FridgeRepo";
import { PERMISSIONS_NAMES } from "../../../src/constants.js";
import { testEnvFactory, writeDB } from "../../emulator-setup.js";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { default as defaultWords } from "../../../src/defaultWords.json" assert { type: "json" };

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

const MOCK_WORDS = defaultWords.map((word, index) => {
    return {
        wordText: word,
        position: { y: 0, x: 0 },
        id: "word" + index,
    };
});

let testEnv, authAlice, fridgeRepoAlice, dbAlice;

beforeAll(async () => {
    testEnv = await testEnvFactory("fridgerepo");

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    dbAlice = authAlice.firestore();
    fridgeRepoAlice = new FridgeRepo(authAlice, dbAlice);
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await writeDB(testEnv, "permissions", MOCK_PERMISSIONS);
    await writeDB(testEnv, "fridges", MOCK_FRIDGES);

    await Promise.all(
        MOCK_FRIDGES.map(async (fridge) => {
            await writeDB(testEnv, `fridges/${fridge.id}/words`, MOCK_WORDS);
        })
    );
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

test("Create words", async () => {
    await fridgeRepoAlice.createWords(MOCK_FRIDGES[0].id, [
        "word1",
        "word2",
        "word3",
    ]);

    const docs = (
        await getDocs(
            collection(dbAlice, `fridges/${MOCK_FRIDGES[0].id}/words`)
        )
    ).docs;

    expect(docs.length).toEqual(defaultWords.length + 3);
});

test("Update word", async () => {
    await fridgeRepoAlice.updateWord(
        MOCK_WORDS[0].id,
        10,
        10,
        MOCK_FRIDGES[0].id
    );

    const docRef = await getDoc(
        doc(dbAlice, `fridges/${MOCK_FRIDGES[0].id}/words`, MOCK_WORDS[0].id)
    );
    expect(docRef.data().position).toEqual({ x: 10, y: 10 });
});

test("Get words", async () => {
    const words = await fridgeRepoAlice.getWords(MOCK_FRIDGES[0].id);
    expect(words.length).toEqual(MOCK_WORDS.length);
});
