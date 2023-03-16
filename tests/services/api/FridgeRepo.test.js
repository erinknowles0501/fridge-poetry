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
];

const MOCK_WORDS = defaultWords.slice(0, 10).map((word, index) => {
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
    fridgeRepoAlice = new FridgeRepo(dbAlice);
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

    expect(result).toEqual({ ...MOCK_FRIDGES[0], words: MOCK_WORDS });
});

test("Get one as ref", async () => {
    const result = await fridgeRepoAlice.getOne(MOCK_FRIDGES[0].id, true);
    expect(!!result.metadata).toEqual(true);
    expect(result.id).toEqual(MOCK_FRIDGES[0].id);
});

test("Get one also gets words", async () => {
    const result = await fridgeRepoAlice.getOne(MOCK_FRIDGES[0].id);
    expect(result.words.length).toEqual(MOCK_WORDS.length);
});

test("Create returns new id", async () => {
    const result = await fridgeRepoAlice.create(MOCK_NEW_FRIDGE);
    expect(result).toBeTruthy();
});

test("CreateWithID returns same id as passed", async () => {
    // TODO: No longer extend this method! createWithID should instead be folded into an option on create
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
        words: MOCK_WORDS,
    });
});

test("Delete", async () => {
    await fridgeRepoAlice.delete(MOCK_FRIDGES[0].id);

    const remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(collection(context.firestore(), "fridges"));
        docs.docs.forEach((doc) => remainingData.push(doc.data()));
    });
    expect(remainingData.length).toEqual(
        MOCK_FRIDGES.filter((item) => item.id != MOCK_FRIDGES[0].id).length
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

    expect(docs.length).toEqual(MOCK_WORDS.length + 3);
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
