import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "pokepoke-k3EO",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});
