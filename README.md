# miniCRM MCP Server

Lokálisan futó MCP (Model Context Protocol) szerver, amely összeköti a Claude Desktop alkalmazást a miniCRM REST API-jával. Magyar természetes nyelvű CRM-vezérlést tesz lehetővé.

## Előfeltételek

- [Node.js](https://nodejs.org/) v18 vagy újabb
- [Claude Desktop](https://claude.ai/download) (Claude Pro vagy Team előfizetéssel)
- miniCRM Professional előfizetés REST API add-on-nal
- miniCRM SystemId és API-kulcs

## Telepítés

### 1. Repository klónozása

```bash
git clone https://github.com/FELHASZNALONEV/minicrm-mcp-server.git
cd minicrm-mcp-server
```

### 2. Dependencyk telepítése

```bash
npm install
```

### 3. Környezeti változók beállítása

```bash
cp .env.example .env
```

Nyisd meg a `.env` fájlt és töltsd ki:

```env
MINICRM_SYSTEM_ID=123456
MINICRM_API_KEY=abc123xyz
MINICRM_BASE_URL=https://r3.minicrm.hu
```

### 4. Build

```bash
npm run build
```

### 5. Claude Desktop konfigurálása

Nyisd meg a Claude Desktop konfigurációs fájlját:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add hozzá a `claude_desktop_config.example.json` tartalmát, és írd át az elérési utat a saját gépednek megfelelően.

### 6. Rendszer-prompt beállítása

1. Nyisd meg a Claude Desktop alkalmazást
2. Hozz létre egy új **Project**-et
3. Illeszd be a `SYSTEM_PROMPT.md` tartalmát a rendszer-prompt mezőbe
4. Mentsd el

---

## Elérhető eszközök

| Eszköz | Leírás |
|--------|--------|
| `kontakt_kereses` | Keresés névvel, e-maillel, telefonszámmal |
| `kontakt_lekeres` | Teljes adatlap lekérése ID alapján |
| `kontakt_letrehozas` | Új kontakt létrehozása |
| `kontakt_modositas` | Meglévő kontakt módosítása |
| `projekt_kereses` | Keresés kategória, státusz, kontakt alapján |
| `projekt_lekeres` | Teljes projekt adatlap lekérése |
| `projekt_letrehozas` | Új projekt létrehozása |
| `projekt_statusz_valtas` | Projekt státuszának megváltoztatása |
| `teendo_letrehozas` | Új teendő létrehozása projekthez |
| `teendo_lekeres` | Projekt teendőlistájának lekérése |
| `szamla_lekerdezes` | Számlák lekérdezése |
| `schema_lekerdezes` | Kategóriák, státuszok, egyedi mezők listája |

> Törlési műveletek szándékosan nincsenek implementálva az adatbiztonság érdekében.

> **Megjegyzés a számla lekérdezésről:** A `szamla_lekerdezes` tool kétféleképpen működik:
> - `InvoiceId` megadásával egy adott számla részletes adatait adja vissza
> - `InvoiceId` nélkül az összes számlát listázza (max 100, lapozható `Page` paraméterrel)
> 
> A miniCRM API nem támogatja a számlák közvetlen szűrését `ProjectId` vagy `ContactId` alapján.

---

## Tesztelés

```bash
npm run inspector
node build/scripts/testConnection.js
```

---

## Tervezési döntések

- **Nincs törlés** – visszafordíthatatlan adatvesztés megelőzése érdekében
- **Rate limiting** – 60 kérés/perc limithez igazodik, burst protection beépítve
- **Lokális futás** – az adat nem hagyja el a felhasználó gépét
- **Intelligens viselkedés rendszer-prompttal** – jóváhagyás, tervközlés és névambiguitás-kezelés Claude natív képességeire építve
