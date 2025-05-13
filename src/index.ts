import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { pathToFileURL } from "url";
import { v1alpha } from "@google-cloud/discoveryengine";
import type { CallOptions } from "google-gax";
import { getEnvInt, getEnvEnum, getEnvString } from "./env.js";

const { SearchServiceClient } = v1alpha;
const { ConversationalSearchServiceClient } = v1alpha;

// Constants for server information
const SERVER_NAME = "mcp-vertex-ai-search-ts-stdio";
const SERVER_VERSION = "0.0.1";

let PROJECT: number;
let LOCATION: string;
let ENGINE: string;
let LANGUAGE: string;

try {
  PROJECT = getEnvInt("PROJECT");
  LOCATION = getEnvEnum("LOCATION", ["global", "us", "eu"], "global");
  ENGINE = getEnvString("ENGINE");
  LANGUAGE = getEnvString("LANGUAGE", "en-US");
} catch (e) {
  console.error("[Startup Error] Failed to get environment variables", e);
  process.exit(1);
}

const BASE = `projects/${PROJECT}/locations/${LOCATION}/collections/default_collection/engines/${ENGINE}`;
const SERVING = `${BASE}/servingConfigs/default_search`;

async function getSessionInfo(query: string) {
  try {
    const searchClient = new SearchServiceClient();
    const gaxOpts: CallOptions = { autoPaginate: false };
    const [, , raw] = await searchClient.search(
      {
        servingConfig: SERVING,
        query,
        pageSize: 10,
        languageCode: LANGUAGE,
        queryExpansionSpec: { condition: "AUTO" },
        spellCorrectionSpec: { mode: "AUTO" },
        contentSearchSpec: {
          extractiveContentSpec: { maxExtractiveAnswerCount: 1 },
        },
        session: `${BASE}/sessions/-`,
      },
      gaxOpts,
    );
    if (!raw?.sessionInfo) {
      console.error(`[API ERROR] No sessionInfo returned. raw=`, raw);
      throw new Error(`No sessionInfo: ${JSON.stringify(raw)}`);
    }
    return raw.sessionInfo;
  } catch (err) {
    console.error(`[getSessionInfo ERROR]`, err);
    throw new Error("Failed to get search session");
  }
}

async function getAnswer(query: string, sessionName: string, queryId: string) {
  try {
    const convClient = new ConversationalSearchServiceClient();
    const [resp] = await convClient.answerQuery({
      servingConfig: SERVING,
      query: { text: query, queryId },
      session: sessionName,
      relatedQuestionsSpec: { enable: true },
      answerGenerationSpec: {
        ignoreAdversarialQuery: true,
        ignoreNonAnswerSeekingQuery: false,
        ignoreLowRelevantContent: true,
        includeCitations: true,
        modelSpec: { modelVersion: "stable" },
      },
    });
    return resp;
  } catch (err) {
    console.error(`[getAnswer ERROR]`, err);
    throw new Error("Failed to generate answer");
  }
}

export async function search(query: string) {
  try {
    const s = await getSessionInfo(query);
    const a = await getAnswer(query, s.name!, s.queryId!);
    return a.answer?.state === "SUCCEEDED"
      ? { answer: a.answer.answerText }
      : { answer: "No answer found" };
  } catch (err) {
    console.error(`[search ERROR]`, err);
    return {
      answer: undefined,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Function to initialize the MCP server
export function createServer(searchImpl?: typeof search) {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });
  server.tool(
    "knowledge-search",
    "Returns the result of searching knowledge base",
    {
      query: z.string().describe("Query to search"),
    },
    async ({ query }) => {
      try {
        const result = await (searchImpl ?? search)(query);
        if (!result.answer) {
          return {
            content: [
              {
                type: "text",
                text: result.error
                  ? `An error occurred: ${result.error}`
                  : "No answer found",
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: result.answer,
            },
          ],
        };
      } catch (err) {
        console.error(`[tool search ERROR]`, err);
        return {
          content: [
            {
              type: "text",
              text: "An internal error occurred. Please try again later.",
            },
          ],
        };
      }
    },
  );
  return server;
}

// Main process
export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  try {
    await server.connect(transport);
    console.error("MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to run MCP server:", error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
