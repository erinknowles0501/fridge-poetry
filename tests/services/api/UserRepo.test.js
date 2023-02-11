import UserRepo from "../../../src/services/api/UserRepo";
import { jest } from "@jest/globals";

const userRepo = new UserRepo();

test("UserRepo can get one user", async () => {
    const expectedUser = {
        email: "colorandcontrast@gmail.com",
        displayName: "colorandcontrast",
        displayColor: 18,
        id: "gtEA56NNwMXLcK0ik38CA8VjXr43",
    };
    const user = await userRepo.getOne("gtEA56NNwMXLcK0ik38CA8VjXr43");

    expect(user).toEqual(expectedUser);
});

test("UserRepo can get one user as ref", async () => {
    const user = await userRepo.getOne("gtEA56NNwMXLcK0ik38CA8VjXr43", true);

    expect(!!user.metadata).toEqual(true);
});
