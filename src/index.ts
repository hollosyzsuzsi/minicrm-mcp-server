#!/usr/bin/env node
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MiniCRMClient } from "./minicrmClient.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerProjectTools } from "./tools/project.js";
import { registerToDoTools } from "./tools/todos.js";
import { registerInvoiceAndSchemaTools } from "./tools/invoices-schema.js";

// ── Validate environment ───────────────────────────────────────────────────
const SYSTEM_ID = process.env.MINICRM_SYSTEM_ID;
const API_KEY = process.env.MINICRM_API_KEY;
const BASE_URL = process.env.MINICRM_BASE_URL ?? "https://r3.minicrm.hu";

if (!SYSTEM_ID || !API_KEY) {
  process.stderr.write(
    "Hiba: MINICRM_SYSTEM_ID és MINICRM_API_KEY környezeti változók szükségesek.\n" +
    "Másold a .env.example fájlt .env-be és töltsd ki a saját adataiddal.\n"
  );
  process.exit(1);
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
const minicrm = new MiniCRMClient({
  systemId: SYSTEM_ID,
  apiKey: API_KEY,
  baseUrl: BASE_URL,
});

const server = new McpServer(
  { name: "minicrm-mcp-server", version: "1.0.0" },
  {
    instructions:
      "Ez a szerver a miniCRM rendszerhez kapcsolódik. " +
      "MINDEN írási művelet (létrehozás, módosítás, státuszváltás) előtt: " +
      "1. Közöld a felhasználóval pontosan mit fogsz végrehajtani. " +
      "2. Kérj explicit jóváhagyást (pl. 'Megcsinálhatom?'). " +
      "3. Csak jóváhagyás után hívd meg az eszközt. " +
      "Ha egy névkeresés több egyező kontaktot ad vissza, mindig listázd mindegyiket és kérdezd meg melyiket kell módosítani. " +
      "Összetett, több lépéses műveleteknél (pl. tömeges feladat-létrehozás) előbb mutasd a teljes végrehajtási tervet, majd kérj jóváhagyást.",
  }
);

// ── Register all 12 tools ──────────────────────────────────────────────────
registerContactTools(server, minicrm);
registerProjectTools(server, minicrm);
registerToDoTools(server, minicrm);
registerInvoiceAndSchemaTools(server, minicrm);

// ── Connect stdio transport ────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);

process.stderr.write("miniCRM MCP szerver elindult (stdio).\n");