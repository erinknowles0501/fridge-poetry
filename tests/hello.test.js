import { jest } from "@jest/globals";
jest.unstable_mockModule("./hello", () => ({
    default: jest.fn((person) => "hello " + person + "!"),
}));
const hello = await import("./hello");

console.log("hello", hello.default);

test("Hello is mocked", async () => {
    expect(jest.isMockFunction(hello.default)).toEqual(true);
});

test("Says hello to Erin", () => {
    expect(hello.default("Erin")).toBe("hello Erin!");
});
