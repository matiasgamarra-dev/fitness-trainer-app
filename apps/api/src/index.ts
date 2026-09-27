import "dotenv/config";
import { createServer } from "./server.js";
import { env } from "./config/env.js";

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`   Entorno: ${env.NODE_ENV}`);
});