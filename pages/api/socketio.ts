import { initSocketIO } from "@/lib/socket-server";
import { NextApiRequest } from "next";

// Disable body parser for this route as Socket.IO handles it
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO server...");
    const io = initSocketIO(res);
    res.socket.server.io = io;
    // Make Socket.IO instance available globally for API routes
    global.io = io;
  }

  // Let Socket.IO handle the request - don't call res.end()
  // Socket.IO will manage the connection lifecycle
  res.end();
}
