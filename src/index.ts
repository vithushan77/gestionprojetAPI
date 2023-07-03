import { config } from "dotenv";
import { startServer } from "./config";
import { v1 } from "./router";
config();



async function main() { }

main()
  .then(async () => {
    startServer(v1.router, () => {
      console.log("Server started");
    });

  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
