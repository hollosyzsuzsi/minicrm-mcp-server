import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MiniCRMClient } from "../minicrmClient.js";

export function registerProjectTools(server: McpServer, client: MiniCRMClient): void {

  // ── projekt_kereses ────────────────────────────────────────────────────────
  server.registerTool(
    "projekt_kereses",
    {
      title: "Projekt keresés",
      description:
        "Projektek / ügyletek keresése a miniCRM-ben különböző szűrőkkel. " +
        "Visszaadja az egyező projektek listáját összesített adatokkal.",
      inputSchema: {
        CategoryId: z.number().optional().describe("Projekt kategória azonosítója"),
        StatusId: z.number().optional().describe("Státusz azonosítója"),
        ContactId: z.number().optional().describe("Kapcsolódó kontakt azonosítója"),
        UserId: z.number().optional().describe("Felelős felhasználó azonosítója"),
        Name: z.string().optional().describe("Projekt neve (részleges egyezés)"),
      },
    },
    async (params) => {
      const result = await client.searchProjects(params);
      const projects = Object.values(result.Results ?? {});

      if (projects.length === 0) {
        return { content: [{ type: "text", text: "Nem található projekt a megadott feltételekkel." }] };
      }

      const text =
        `**${result.Count} projekt található:**\n\n` +
        projects
          .map(
            (p) =>
              `- **ID: ${p.Id}** | ${p.Name ?? "–"} | Státusz: ${p.StatusId ?? "–"} | Felelős: ${p.UserId ?? "–"} | Kontakt: ${p.ContactId ?? "–"}`
          )
          .join("\n");

      return { content: [{ type: "text", text }] };
    }
  );

  // ── projekt_lekeres ────────────────────────────────────────────────────────
  server.registerTool(
    "projekt_lekeres",
    {
      title: "Projekt lekérés",
      description:
        "Egy adott projekt / ügylet teljes adatlapjának lekérése ID alapján, " +
        "beleértve státuszt, felelőst, kontaktot és előzményeket.",
      inputSchema: {
        Id: z.number().describe("A projekt miniCRM azonosítója"),
      },
    },
    async ({ Id }) => {
      const project = await client.getProject(Id);
      return {
        content: [{ type: "text", text: `**Projekt adatlap (ID: ${Id}):**\n\n\`\`\`json\n${JSON.stringify(project, null, 2)}\n\`\`\`` }],
      };
    }
  );

  // ── projekt_letrehozas ────────────────────────────────────────────────────
  server.registerTool(
    "projekt_letrehozas",
    {
      title: "Projekt létrehozás",
      description:
        "Új projekt / ügylet létrehozása a miniCRM-ben. " +
        "FONTOS: Végrehajtás előtt mindig közöld a felhasználóval mit fogsz létrehozni és kérj jóváhagyást.",
      inputSchema: {
        CategoryId: z.number().describe("Projekt kategória azonosítója (kötelező)"),
        ContactId: z.number().optional().describe("Kapcsolódó kontakt azonosítója"),
        Name: z.string().optional().describe("Projekt neve"),
        UserId: z.number().optional().describe("Felelős felhasználó azonosítója"),
        StatusId: z.number().optional().describe("Kezdeti státusz azonosítója"),
      },
    },
    async (data) => {
      const result = await client.createProject(data);
      return {
        content: [{ type: "text", text: `✅ Projekt sikeresen létrehozva. Új ID: **${result.Id}**` }],
      };
    }
  );

  // ── projekt_statusz_valtas ─────────────────────────────────────────────────
  server.registerTool(
    "projekt_statusz_valtas",
    {
      title: "Projekt státuszváltás",
      description:
        "Egy projekt státuszának megváltoztatása. Kizárólag státuszváltásra használható, " +
        "más mező nem módosul. " +
        "FONTOS: A StatusId egy szám, nem a státusz neve. " +
        "Ha nem tudod a StatusId értékét, először futtasd a schema_lekerdezes eszközt. " +
        "Végrehajtás előtt mindig közöld a felhasználóval melyik projektet és milyen státuszra váltod, és kérj jóváhagyást.",
      inputSchema: {
        Id: z.number().describe("A projekt miniCRM azonosítója"),
        StatusId: z.number().describe("Az új státusz azonosítója"),
      },
    },
    async ({ Id, StatusId }) => {
      const result = await client.updateProjectStatus(Id, StatusId);
      return {
        content: [{ type: "text", text: `✅ Projekt (ID: ${result.Id}) státusza sikeresen megváltoztatva → StatusId: **${StatusId}**` }],
      };
    }
  );
}