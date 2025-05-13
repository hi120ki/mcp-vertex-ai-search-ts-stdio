import { describe, it, expect, beforeEach } from "vitest";
import { getEnvInt, getEnvEnum, getEnvString } from "./env.js";

// Tests for getEnvInt
describe("getEnvInt", () => {
  beforeEach(() => {
    delete process.env.TEST_INT;
  });
  it("Returns the integer value if the environment variable is a valid integer string", () => {
    process.env.TEST_INT = "42";
    expect(getEnvInt("TEST_INT")).toBe(42);
  });
  it("Throws if the environment variable is not set and required=true", () => {
    expect(() => getEnvInt("TEST_INT")).toThrow();
  });
  it("Returns undefined if the environment variable is not set and required=false", () => {
    expect(getEnvInt("TEST_INT", false)).toBeUndefined();
  });
  it("Throws if the environment variable is not an integer", () => {
    process.env.TEST_INT = "abc";
    expect(() => getEnvInt("TEST_INT")).toThrow();
  });
});

// Tests for getEnvEnum
describe("getEnvEnum", () => {
  beforeEach(() => {
    delete process.env.TEST_ENUM;
  });
  it("Returns the value if it is valid", () => {
    process.env.TEST_ENUM = "foo";
    expect(getEnvEnum("TEST_ENUM", ["foo", "bar"])).toBe("foo");
  });
  it("Returns the default value if not set", () => {
    expect(getEnvEnum("TEST_ENUM", ["foo", "bar"], "bar")).toBe("bar");
  });
  it("Throws if the value is invalid", () => {
    process.env.TEST_ENUM = "baz";
    expect(() => getEnvEnum("TEST_ENUM", ["foo", "bar"])).toThrow();
  });
});

// Tests for getEnvString
describe("getEnvString", () => {
  beforeEach(() => {
    delete process.env.TEST_STR;
  });
  it("Returns the value if set", () => {
    process.env.TEST_STR = "hello";
    expect(getEnvString("TEST_STR")).toBe("hello");
  });
  it("Returns the default value if not set and default is provided", () => {
    expect(getEnvString("TEST_STR", "default")).toBe("default");
  });
  it("Returns an empty string if not set and no default is provided", () => {
    expect(getEnvString("TEST_STR")).toBe("");
  });
});
