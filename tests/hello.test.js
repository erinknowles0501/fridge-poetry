import { jest } from "@jest/globals";
// jest.unstable_mockModule("./hello", () => ({
//     default: jest.fn((person) => "hello " + person + "!"),
// }));

//import hello from "./hello";
jest.unstable_mockModule("./world", () => ({
    default: jest.fn(() => "world"),
    __esModule: true,
}));
const { default: hello } = await import("./hello");
const { default: world } = await import("./world");

// test("Hello is mocked", async () => {
//     expect(jest.isMockFunction(hello)).toEqual(true);
// });

test("World is mocked", async () => {
    expect(jest.isMockFunction(world)).toEqual(true);
    expect(world()).toEqual("world");
});

test("Says hello to Erin with world", () => {
    expect(hello("Erin")).toBe("Hello world, Erin!");
});

test("Says world to Erin", () => {
    expect(world()).toBe("world");
});
