import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// ✅ Use your deployed frontend link (Vercel one)
const FRONTEND_URL = "https://chatapp-client-7ak1.vercel.app";

// ✅ Allow CORS for your frontend
app.use(cors({
  origin: [FRONTEND_URL],
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Setup Socket.io with same CORS
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL],
    methods: ["GET", "POST"],
  },
});

// ✅ Socket Events
io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send", (msg) => {
    io.to(msg.room).emit("message", msg);
  });

  socket.on("leave", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Socket.io server is running ⚡");
});

// ✅ Use Railway’s PORT environment variable
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
