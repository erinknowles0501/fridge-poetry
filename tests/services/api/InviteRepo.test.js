import InviteRepo from "../../../src/services/api/InviteRepo";
import { testEnvFactory, writeDB } from "../../emulator-setup.js";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { INVITATION_STATUSES, PERMISSIONS_NAMES } from "../../../src/constants";
import {
    getFunctions,
    connectFunctionsEmulator,
    httpsCallable,
} from "firebase/functions";

const MOCK_INVITES = [
    {
        id: "invite1",
        fridgeID: "fridge1",
        fromID: "alice",
        to: "bob@test.com",
        status: INVITATION_STATUSES.ACCEPTED,
    },
    {
        id: "invite2",
        fridgeID: "fridge1",
        fromID: "alice",
        to: "carla@test.com",
        status: INVITATION_STATUSES.PENDING,
    },
    {
        id: "invite3",
        fridgeID: "fridge2",
        fromID: "carla",
        to: "alice@test.com",
        status: INVITATION_STATUSES.PENDING,
    },
];

let testEnv, functions, authAlice, repoAlice, dbAlice;

beforeAll(async () => {
    ({ testEnv, functions } = await testEnvFactory("inviterepo", true));

    const helloWorld = httpsCallable(functions, "helloWorld");

    try {
        const result = await helloWorld({ data: "aaaaaaaaaaa!!!!" });
        console.log("result", result);
    } catch (e) {
        console.error(e);
    }

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    dbAlice = authAlice.firestore();
    repoAlice = new InviteRepo(authAlice, dbAlice);
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await writeDB(testEnv, "invitations", MOCK_INVITES);
    await writeDB(testEnv, "permissions", [
        {
            id: "fridge1_alice",
            fridgeID: "fridge1",
            userID: "alice",
            permissions: [...Object.values(PERMISSIONS_NAMES)],
        },
    ]);
});

afterAll(async () => {
    await testEnv.cleanup();
});

test("Send adds new invite", async () => {
    await repoAlice.sendInvite("donald@test.com", "fridge1", "alice", "Alice");

    let results = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(
            collection(context.firestore(), "invitations")
        );
        results = docs.docs;
    });
    expect(results.length).toEqual(MOCK_INVITES.length + 1);
});

test("Get by id", async () => {
    const result = await repoAlice.getOne(MOCK_INVITES[0].id);
    expect(result).toEqual(MOCK_INVITES[0]);
});

test("Can accept invite", async () => {
    await repoAlice.acceptInvitation(MOCK_INVITES[2].id);

    let result;
    await testEnv.withSecurityRulesDisabled(async (context) => {
        result = (
            await getDoc(
                doc(context.firestore(), "invitations", MOCK_INVITES[2].id)
            )
        ).data();
    });
    expect(result.status).toEqual(INVITATION_STATUSES.ACCEPTED);
});

test("Can deny invite", async () => {
    await repoAlice.denyInvitation(MOCK_INVITES[2].id);

    let result;
    await testEnv.withSecurityRulesDisabled(async (context) => {
        result = (
            await getDoc(
                doc(context.firestore(), "invitations", MOCK_INVITES[2].id)
            )
        ).data();
    });
    expect(result.status).toEqual(INVITATION_STATUSES.DENIED);
});

// test("Can delete (revoke) invite", async () => {
//     await repoAlice.delete(MOCK_INVITES[1].id);

//     let results = [];
//     await testEnv.withSecurityRulesDisabled(async (context) => {
//         results = (
//             await getDocs(collection(context.firestore(), "invitations"))
//         ).docs;
//     });
//     expect(results.length).toEqual(MOCK_INVITES.length - 1);
// });

// test("Can get accessible invites", async () => {
//     const results = await repoAlice.getAccessibleInvites(
//         MOCK_INVITES[0].fromID,
//         MOCK_INVITES[0].fridgeID
//     );

//     expect(results.length).toEqual(
//         MOCK_INVITES.filter(
//             (invite) =>
//                 invite.fromID === MOCK_INVITES[0].fromID &&
//                 invite.fridgeID === MOCK_INVITES[0].fridgeID
//         ).length
//     );
// });
