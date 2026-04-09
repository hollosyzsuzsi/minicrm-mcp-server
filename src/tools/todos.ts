import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MiniCRMClient } from "../minicrmClient.js";

export function registerToDoTools(server: McpServer, client: MiniCRMClient): void {

  // ── teendo_letrehozas ──────────────────────────────────────────────────────
  server.registerTool(
    "teendo_letrehozas",
    {
      title: "Teendő létrehozás",
      description:
        "Új teendő / feladat létrehozása egy projekthez a miniCRM-ben. " +
        "FONTOS: Végrehajtás előtt mindig közöld a felhasználóval mit fogsz létrehozni és kérj jóváhagyást. " +
        "Tömeges teendő-létrehozásnál (több projekthez) először mutasd a teljes listát, " +
        "majd csak jóváhagyás után hajtsd végre.",
      inputSchema: {
        ProjectId: z.number().describe("A projekt azonosítója, amelyhez a teendő tartozik"),
        UserId: z.number().describe("A felelős felhasználó azonosítója"),
        Deadline: z.string().describe("Határidő (ISO 8601 formátum: YYYY-MM-DD HH:MM:SS)"),
        Type: z.string().optional().describe("Teendő típusa (pl. 'Call', 'Email', 'Meeting')"),
        Comment: z.string().optional().describe("Megjegyzés / leírás"),
        Status: z.string().optional().describe("Státusz (pl. 'Open')"),
      },
    },
    async (data) => {
      if (!data.ProjectId) {
        return {
          content: [{ type: "text", text: "Hiba: ProjectId kötelező teendő létrehozásához." }],
          isError: true,
        };
      }

      const result = await client.createToDo(data);
      return {
        content: [{ type: "text", text: `✅ Teendő sikeresen létrehozva. Új ID: **${result.Id}** | Projekt: ${data.ProjectId} | Határidő: ${data.Deadline}` }],
      };
    }
  );

  // ── teendo_lekeres ─────────────────────────────────────────────────────────
  server.registerTool(
    "teendo_lekeres",
    {
      title: "Teendő lekérés",
      description:
        "Egy projekthez tartozó összes teendő lekérése (típus, határidő, státusz, felelős). " +
        "Szűrhető státusz alapján: Open, Closed, All.",
      inputSchema: {
        CardId: z.number().describe("A projekt / kártya azonosítója, amelynek teendőit kéred"),
        Status: z.string().optional().describe("Szűrés státusz alapján: 'Open', 'Closed', vagy 'All' (alapértelmezett: All)"),
      },
    },
    async ({ CardId, Status }) => {
      const result = await client.getToDoList(CardId, Status);
      const todos = Object.values(result.Results ?? {});

      if (todos.length === 0) {
        return { content: [{ type: "text", text: `A projektnek (ID: ${CardId}) nincs teendője.` }] };
      }

      const text =
        `**${result.Count} teendő (Projekt ID: ${CardId}):**\n\n` +
        todos
          .map(
            (t) =>
              `- **ID: ${t.Id}** | Típus: ${t.Type ?? "–"} | Határidő: ${t.Deadline ?? "–"} | Státusz: ${t.Status ?? "–"} | Felelős: ${t.UserId ?? "–"}${t.Comment ? ` | Megjegyzés: ${t.Comment}` : ""}`
          )
          .join("\n");

      return { content: [{ type: "text", text }] };
    }
  );
}