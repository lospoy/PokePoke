import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "~/trigger";

client.defineJob({
  id: "delay-job",
  name: "Delay Job",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "example.event",
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Hi");

    const numberOfSeconds = 12;
    // the second parameter is the number of seconds to wait
    await io.wait(`wait ${numberOfSeconds} seconds`, numberOfSeconds);

    await io.logger.info(
      `Sorry for the slow reply! That should have taken ${numberOfSeconds} seconds`,
    );
  },
});
