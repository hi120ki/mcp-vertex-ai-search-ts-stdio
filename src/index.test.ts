import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock for the search function
const mockSearch = vi.fn();

beforeEach(() => {
  // Set environment variables for testing
  process.env.PROJECT = "123456";
  process.env.LOCATION = "global";
  process.env.ENGINE = "dummy-engine";
  process.env.LANGUAGE = "ja-JP";
  // Mock process.exit to prevent exiting during tests
  vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`process.exit called: ${code}`);
  }) as never);
});
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.PROJECT;
  delete process.env.LOCATION;
  delete process.env.ENGINE;
  delete process.env.LANGUAGE;
});

describe("search tool", () => {
  it("Success: Returns answer text when search result is available", async () => {
    // Dynamic import to avoid top-level side effects
    const indexModule = await import("./index.js");
    mockSearch.mockReset();
    mockSearch.mockResolvedValue({ answer: "Test answer" });

    const { Client } = await import(
      "@modelcontextprotocol/sdk/client/index.js"
    );
    const { InMemoryTransport } = await import(
      "@modelcontextprotocol/sdk/inMemory.js"
    );
    const client = new Client({ name: "test client", version: "0.1.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const server = indexModule.createServer(mockSearch);
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    const result = await client.callTool({
      name: "knowledge-search",
      arguments: { query: "Test query" },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Test answer",
        },
      ],
    });
  });

  it("Error: Returns error message when an error occurs", async () => {
    // Dynamic import to avoid top-level side effects
    const indexModule = await import("./index.js");
    mockSearch.mockReset();
    mockSearch.mockResolvedValue({ answer: undefined, error: "API error" });

    const { Client } = await import(
      "@modelcontextprotocol/sdk/client/index.js"
    );
    const { InMemoryTransport } = await import(
      "@modelcontextprotocol/sdk/inMemory.js"
    );
    const client = new Client({ name: "test client", version: "0.1.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const server = indexModule.createServer(mockSearch);
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    const result = await client.callTool({
      name: "knowledge-search",
      arguments: { query: "Test query" },
    });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: expect.stringContaining("API error"),
        },
      ],
    });
  });
});
