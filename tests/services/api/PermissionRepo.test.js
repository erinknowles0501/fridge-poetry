import PermissionRepo from "../../../src/services/api/PermissionRepo";
import {
    PERMISSIONS_NAMES,
    PERMISSION_GROUPS,
} from "../../../src/constants.js";
import { testEnvFactory, writeDB } from "../../emulator-setup.js";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";

const MOCK_PERMISSIONS = [
    {
        id: "testid1_alice",
        fridgeID: "testid1",
        userID: "alice",
        permissions: [...Object.values(PERMISSIONS_NAMES)],
    },
    {
        id: "testid2_alice",
        fridgeID: "testid2",
        userID: "alice",
        permissions: [PERMISSIONS_NAMES.INVITED],
    },
    {
        id: "testid1_bob",
        fridgeID: "testid1",
        userID: "bob",
        permissions: PERMISSION_GROUPS.OPTIONAL,
    },
];

let testEnv, authAlice, repoAlice, dbAlice;

beforeAll(async () => {
    testEnv = await testEnvFactory("permissionrepo");

    authAlice = testEnv.authenticatedContext("alice", {
        email: "alice@test.com",
    });
    dbAlice = authAlice.firestore();
    repoAlice = new PermissionRepo(authAlice, dbAlice);
});

beforeEach(async () => {
    await testEnv.clearFirestore();
    await writeDB(testEnv, "permissions", MOCK_PERMISSIONS);
});

afterAll(async () => {
    await testEnv.cleanup();
});

test("Create (id takes form fridge_user)", async () => {
    await repoAlice.create("testfridge", "alice", ["invited"]);

    const result = getDoc(doc(dbAlice, "permissions", "testfridge_alice"));
    expect(result).toBeTruthy();
});

test("Get specific permission", async () => {
    const result = await repoAlice.getPermissionByUserAndFridge(
        MOCK_PERMISSIONS[0].userID,
        MOCK_PERMISSIONS[0].fridgeID
    );
    expect(result).toBeTruthy();
});

test("Get permissions by user", async () => {
    const result = await repoAlice.getPermissionsByUser(
        MOCK_PERMISSIONS[0].userID
    );
    expect(result.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (permission) => permission.userID === MOCK_PERMISSIONS[0].userID
        ).length
    );
});

test("Get permissions by user as refs", async () => {
    const result = await repoAlice.getPermissionsByUser(
        MOCK_PERMISSIONS[0].userID,
        true
    );
    expect(result.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (permission) => permission.userID === MOCK_PERMISSIONS[0].userID
        ).length
    );
    expect(result.every((permission) => permission.metadata)).toEqual(true);
});

test("Get permissions by fridge", async () => {
    const result = await repoAlice.getPermissionsByFridge(
        MOCK_PERMISSIONS[0].fridgeID
    );
    expect(result.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (permission) => permission.fridgeID === MOCK_PERMISSIONS[0].fridgeID
        ).length
    );
});

test("Get permissions by fridge as refs", async () => {
    const result = await repoAlice.getPermissionsByFridge(
        MOCK_PERMISSIONS[0].fridgeID,
        true
    );
    expect(result.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (permission) => permission.fridgeID === MOCK_PERMISSIONS[0].fridgeID
        ).length
    );
    expect(result.every((permission) => permission.metadata)).toEqual(true);
});

test("Set permission", async () => {
    const newPermissions = ["permission1", "permission2"];
    await repoAlice.setPermission(MOCK_PERMISSIONS[0].id, newPermissions);

    const result = (
        await getDoc(doc(dbAlice, "permissions", MOCK_PERMISSIONS[0].id))
    ).data();
    expect(result.permissions).toEqual(newPermissions);
});

test("Add to permission", async () => {
    const additionalPermissions = ["testPermission1", "testPermission2"];
    await repoAlice.addToPermission(
        MOCK_PERMISSIONS[0].id,
        additionalPermissions
    );

    const result = (
        await getDoc(doc(dbAlice, "permissions", MOCK_PERMISSIONS[0].id))
    ).data();
    expect(result.permissions.length).toEqual(
        MOCK_PERMISSIONS[0].permissions.length + additionalPermissions.length
    );
});

test("Remove from permission", async () => {
    const removedPermissions = [PERMISSIONS_NAMES.INVITED];
    await repoAlice.removeFromPermission(
        MOCK_PERMISSIONS[0].id,
        removedPermissions
    );

    const result = (
        await getDoc(doc(dbAlice, "permissions", MOCK_PERMISSIONS[0].id))
    ).data();
    expect(result.permissions.length).toEqual(
        MOCK_PERMISSIONS[0].permissions.length - removedPermissions.length
    );
});

test("Delete one", async () => {
    await repoAlice.delete(MOCK_PERMISSIONS[0].id);

    let remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(
            collection(context.firestore(), "permissions")
        );
        remainingData = docs.docs;
    });

    expect(remainingData.length).toEqual(
        MOCK_PERMISSIONS.filter((item) => item.id != MOCK_PERMISSIONS[0].id)
            .length
    );
});

test("Delete by fridge", async () => {
    await repoAlice.deleteByFridge(MOCK_PERMISSIONS[0].fridgeID);

    let remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(
            collection(context.firestore(), "permissions")
        );
        remainingData = docs.docs;
    });

    expect(remainingData.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (item) => item.fridgeID !== MOCK_PERMISSIONS[0].fridgeID
        ).length
    );
});

test("Delete by user", async () => {
    await repoAlice.deleteByUser(MOCK_PERMISSIONS[0].userID);

    let remainingData = [];
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const docs = await getDocs(
            collection(context.firestore(), "permissions")
        );
        remainingData = docs.docs;
    });

    expect(remainingData.length).toEqual(
        MOCK_PERMISSIONS.filter(
            (item) => item.userID !== MOCK_PERMISSIONS[0].userID
        ).length
    );
});
