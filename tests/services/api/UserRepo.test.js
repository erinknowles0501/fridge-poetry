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

test("UserRepo can get one user", async () => {
    const user = await userRepo.getOne("testid1");
    expect(user).toEqual(MOCK_USERS[0]);
});

test("UserRepo can get one user as ref", async () => {
    const user = await userRepo.getOne("testid1", true);
    expect(!!user.metadata).toEqual(true);
});

test("Can get that an email is not in use", async () => {
    const result = await userRepo.getWhetherEmailInUse("email@provider.com");
    expect(result).toEqual(false);
});

test("Can get that an email is in use", async () => {
    const result = await userRepo.getWhetherEmailInUse("test@abc.com");
    expect(result).toEqual(true);
});
