import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MiniCRMClient } from "../minicrmClient.js";

export function registerContactTools(server: McpServer, client: MiniCRMClient): void {

  // ── kontakt_kereses ────────────────────────────────────────────────────────
  server.registerTool(
    "kontakt_kereses",
    {
      title: "Kontakt keresés",
      description:
        "Kontaktok keresése névvel, e-mail-lel vagy telefonszámmal a miniCRM-ben. " +
        "Legalább egy keresési feltételt adj meg. Ha több egyező kontakt van, " +
        "listázza mindegyiket és visszakérdez melyiket kell módosítani.",
      inputSchema: {
        Name: z.string().optional().describe("Keresett név (részleges egyezés)"),
        Email: z.string().optional().describe("Keresett e-mail cím"),
        Phone: z.string().optional().describe("Keresett telefonszám"),
      },
    },
    async ({ Name, Email, Phone }) => {
      if (!Name && !Email && !Phone) {
        return {
          content: [{ type: "text", text: "Hiba: Legalább egy keresési feltétel szükséges (Name, Email vagy Phone)." }],
          isError: true,
        };
      }

      const result = await client.searchContacts({ Name, Email, Phone });
      const contacts = Object.values(result.Results ?? {});

      if (contacts.length === 0) {
        return { content: [{ type: "text", text: "Nem található kontakt a megadott feltételekkel." }] };
      }

      const text =
        `**${result.Count} kontakt található:**\n\n` +
        contacts
          .map(
            (c) =>
              `- **ID: ${c.Id}** | ${c.Name ?? `${c.FirstName} ${c.LastName}`} | ${c.Email ?? "–"} | ${c.Phone ?? "–"}`
          )
          .join("\n");

      return { content: [{ type: "text", text }] };
    }
  );

  // ── kontakt_lekeres ────────────────────────────────────────────────────────
  server.registerTool(
    "kontakt_lekeres",
    {
      title: "Kontakt lekérés",
      description: "Egy adott kontakt teljes adatlapjának lekérése ID alapján.",
      inputSchema: {
        Id: z.number().describe("A kontakt miniCRM azonosítója"),
      },
    },
    async ({ Id }) => {
      const contact = await client.getContact(Id);
      return {
        content: [{ type: "text", text: `**Kontakt adatlap (ID: ${Id}):**\n\n\`\`\`json\n${JSON.stringify(contact, null, 2)}\n\`\`\`` }],
      };
    }
  );

  // ── kontakt_letrehozas ────────────────────────────────────────────────────
  server.registerTool(
    "kontakt_letrehozas",
    {
      title: "Kontakt létrehozás",
      description:
        "Új kontakt létrehozása a miniCRM-ben. " +
        "FONTOS: Végrehajtás előtt mindig közöld a felhasználóval mit fogsz létrehozni és kérj jóváhagyást.",
      inputSchema: {
        FirstName: z.string().optional().describe("Keresztnév (kötelező, ha LastName nincs megadva)"),
        LastName: z.string().optional().describe("Vezetéknév (kötelező, ha FirstName nincs megadva)"),
        Email: z.string().optional().describe("E-mail cím"),
        Phone: z.string().optional().describe("Telefonszám"),
        Type: z.string().optional().describe("Kontakt típusa (pl. 'Person' vagy 'Company')"),
      },
    },
    async ({ FirstName, LastName, Email, Phone, Type }) => {
      if (!FirstName && !LastName) {
        return {
          content: [{ type: "text", text: "Hiba: FirstName vagy LastName kötelező új kontakt létrehozásához." }],
          isError: true,
        };
      }

      const result = await client.createContact({ FirstName, LastName, Email, Phone, Type });
      return {
        content: [{ type: "text", text: `✅ Kontakt sikeresen létrehozva. Új ID: **${result.Id}**` }],
      };
    }
  );

  // ── kontakt_modositas ─────────────────────────────────────────────────────
  server.registerTool(
    "kontakt_modositas",
    {
      title: "Kontakt módosítás",
      description:
        "Meglévő kontakt adatainak módosítása ID alapján. " +
        "FONTOS: Végrehajtás előtt mindig közöld a felhasználóval mit fogsz módosítani és kérj jóváhagyást.",
      inputSchema: {
        Id: z.number().describe("A módosítandó kontakt miniCRM azonosítója"),
        FirstName: z.string().optional().describe("Keresztnév"),
        LastName: z.string().optional().describe("Vezetéknév"),
        Email: z.string().optional().describe("E-mail cím"),
        Phone: z.string().optional().describe("Telefonszám"),
        Type: z.string().optional().describe("Kontakt típusa"),
      },
    },
    async ({ Id, ...fields }) => {
      if (Object.keys(fields).length === 0) {
        return {
          content: [{ type: "text", text: "Hiba: Legalább egy módosítandó mezőt meg kell adni." }],
          isError: true,
        };
      }

      const result = await client.updateContact(Id, fields);
      return {
        content: [{ type: "text", text: `✅ Kontakt (ID: ${result.Id}) sikeresen módosítva.` }],
      };
    }
  );
}