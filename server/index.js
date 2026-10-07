import http from "http";

import app from "../server/src/app.js";
import env from "../server/src/config/env.js";
import connectDB from "../server/src/config/db.js";
import { initSocket } from "../server/src/sockets/socket.js";

// Create HTTP server
const server = http.createServer(app);

// Connect MongoDB
await connectDB();

// Initialize Socket.IO
initSocket(server);

// Start server
server.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
}); 