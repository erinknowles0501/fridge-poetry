import { jest } from "@jest/globals";
jest.unstable_mockModule("./hello", () => ({
    default: jest.fn((person) => "hello " + person + "!"),
}));
const { default: hello } = await import("./hello");

console.log("hello", hello);

test("Hello is mocked", async () => {
    expect(jest.isMockFunction(hello)).toEqual(true);
});

test("Says hello to Erin", () => {
    expect(hello("Erin")).toBe("hello Erin!");
});
