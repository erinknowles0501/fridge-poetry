const { default: UserRepo } = await import(
    "../../../src/services/api/UserRepo"
);
import db, { clearDB, writeDB } from "../../emulator-setup.js";

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

const userRepo = new UserRepo("helo", db);

beforeEach(async () => {
    await clearDB();
    await writeDB("users", MOCK_USERS);
});

test("Get one user", async () => {
    const user = await userRepo.getOne("testid1");
    expect(user).toEqual(MOCK_USERS[0]);
});

test("Get one user as ref", async () => {
    const user = await userRepo.getOne("testid1", true);
    expect(!!user.metadata).toEqual(true);
});

test("Get that an email is NOT in use", async () => {
    const result = await userRepo.getWhetherEmailInUse("email@provider.com");
    expect(result).toEqual(false);
});

test("Get that an email IS in use", async () => {
    const result = await userRepo.getWhetherEmailInUse("test@abc.com");
    expect(result).toEqual(true);
});

test("Get all users", async () => {
    const result = await userRepo.getAll();
    expect(result).toEqual(MOCK_USERS);
});

test("Create user returns new id", async () => {
    const id = await userRepo.create(MOCK_NEW_USER);
    expect(id).toBeTruthy();
});

test("Create user with id returns same id as passed", async () => {
    const id = await userRepo.createWithID(MOCK_NEW_USER.id, MOCK_NEW_USER);
    expect(id).toEqual(MOCK_NEW_USER.id);
});
