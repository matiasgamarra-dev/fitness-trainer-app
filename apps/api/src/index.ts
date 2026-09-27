import { createServer } from "./server.js";
import { env } from "./config/env.js";

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${env.PORT}`);
  console.log(`📡 Health check: http://localhost:${env.PORT}/api/v1/health`);
});