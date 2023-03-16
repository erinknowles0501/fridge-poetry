import InviteRepo from "../../../src/services/api/InviteRepo";
import { testEnvFactory, writeDB } from "../../emulator-setup.js";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { INVITATION_STATUSES, PERMISSIONS_NAMES } from "../../../src/constants";

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
    {
        id: "invite4",
        fridgeID: "fridge1",
        fromID: "bob",
        to: "erin@test.com",
        status: INVITATION_STATUSES.PENDING,
    },
    {
        id: "invite5",
        fridgeID: "fridge2",
        fromID: "alice",
        to: "bob@test.com",
        status: INVITATION_STATUSES.PENDING,
    },
    {
        id: "invite6",
        fridgeID: "fridge2",
        fromID: "carla",
        to: "doug@test.com",
        status: INVITATION_STATUSES.PENDING,
    },
];

let testEnv, authAlice, repoAlice, dbAlice;

beforeAll(async () => {
    ({ testEnv } = await testEnvFactory("inviterepo", true));

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    dbAlice = authAlice.firestore();
    repoAlice = new InviteRepo(dbAlice);
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

test("Can delete (revoke) invite", async () => {
    await repoAlice.delete(MOCK_INVITES[1].id);

    let results = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        results = (
            await getDocs(collection(context.firestore(), "invitations"))
        ).docs;
    });
    expect(results.length).toEqual(MOCK_INVITES.length - 1);
});

test("Can get all pending invites on fridge if user has permission", async () => {
    const results = await repoAlice.getAccessibleInvitesByFridge(
        MOCK_INVITES[0].fromID,
        MOCK_INVITES[0].fridgeID
    );

    expect(results.length).toEqual(
        MOCK_INVITES.filter(
            (invite) =>
                invite.fridgeID === MOCK_INVITES[0].fridgeID &&
                invite.status === INVITATION_STATUSES.PENDING
        ).length
    );
});

test("If user does not have permission, get invites they have sent", async () => {
    const results = await repoAlice.getAccessibleInvitesByFridge(
        "alice",
        "fridge2"
    );

    expect(results.length).toEqual(
        MOCK_INVITES.filter(
            (invite) =>
                invite.fridgeID === "fridge2" &&
                invite.fromID === "alice" &&
                invite.status === INVITATION_STATUSES.PENDING
        ).length
    );
});

test("Can get pending invites by user", async () => {
    await writeDB(testEnv, "users", [{ id: "alice", email: "alice@test.com" }]);
    const results = await repoAlice.getAccessibleInvitesByUser("alice");

    expect(results.length).toEqual(
        MOCK_INVITES.filter(
            (invite) =>
                invite.to === "alice@test.com" &&
                invite.status === INVITATION_STATUSES.PENDING
        ).length
    );
});
