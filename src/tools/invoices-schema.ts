import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MiniCRMClient } from "../minicrmClient.js";

export function registerInvoiceAndSchemaTools(server: McpServer, client: MiniCRMClient): void {

  // ── szamla_lekerdezes ──────────────────────────────────────────────────────
  server.registerTool(
    "szamla_lekerdezes",
    {
      title: "Számla lekérdezés",
      description:
        "Számlák listájának lekérdezése vagy egy adott számla részletes adatainak lekérése. " +
        "Ha InvoiceId meg van adva, az adott számla részleteit adja vissza. " +
        "Ha nincs, az összes számlát listázza (max 100, lapozható).",
      inputSchema: {
        InvoiceId: z.number().optional().describe("Egy adott számla azonosítója (ha meg van adva, csak ezt adja vissza)"),
        Page: z.number().optional().describe("Lapszám a listázáshoz (alapértelmezett: 0)"),
      },
    },
    async ({ InvoiceId, Page }) => {
      if (InvoiceId) {
        const invoice = await client.getInvoice(InvoiceId);
        return {
          content: [{ type: "text", text: `**Számla adatlap (ID: ${InvoiceId}):**\n\n\`\`\`json\n${JSON.stringify(invoice, null, 2)}\n\`\`\`` }],
        };
      }

      const result = await client.getInvoices({ Page });
      const invoices = Object.values(result.Results ?? {});

      if (invoices.length === 0) {
        return { content: [{ type: "text", text: "Nem található számla." }] };
      }

      const text =
        `**${result.Count} számla (oldal: ${Page ?? 0}):**\n\n` +
        invoices
          .map(
            (inv) =>
              `- **ID: ${inv.Id}** | Szám: ${inv.Number ?? "–"} | Összeg: ${inv.Amount ?? "–"} ${inv.CurrencyCode ?? ""} | Státusz: ${inv.Status ?? "–"} | Esedékes: ${inv.Prompt ?? "–"} | Fizetve: ${inv.Paid || "nem"}`
          )
          .join("\n");

      return { content: [{ type: "text", text }] };
    }
  );

  // ── schema_lekerdezes ──────────────────────────────────────────────────────
  server.registerTool(
    "schema_lekerdezes",
    {
      title: "Séma lekérdezés",
      description:
        "Az elérhető miniCRM modulok, projekt-kategóriák, státuszok és egyedi mezők lekérdezése. " +
        "Hasznos a StatusId és CategoryId értékek megismeréséhez más eszközök használata előtt.",
      inputSchema: {
        Type: z.string().optional().describe("Séma típusa (pl. 'Project', 'Contact'). Ha üres, az összes kategória listázódik."),
      },
    },
    async ({ Type }) => {
      const result = Type
        ? await client.getSchema(Type)
        : await client.getCategories();

      return {
        content: [
          {
            type: "text",
            text: `**miniCRM séma${Type ? ` (${Type})` : ""}:**\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``,
          },
        ],
      };
    }
  );
}