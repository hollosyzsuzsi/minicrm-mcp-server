import "dotenv/config";
import { MiniCRMClient } from "../minicrmClient.js";

const client = new MiniCRMClient({
  systemId: process.env.MINICRM_SYSTEM_ID!,
  apiKey: process.env.MINICRM_API_KEY!,
  baseUrl: process.env.MINICRM_BASE_URL ?? "https://r3.minicrm.hu",
});

const result = await client.getCategories();
console.log("✅ Kapcsolat sikeres:", JSON.stringify(result, null, 2));