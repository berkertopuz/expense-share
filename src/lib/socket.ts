import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.AUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-group", (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    socket.on("leave-group", (groupId: string) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on("send-message", (data: { groupId: string; message: any }) => {
      io?.to(`group:${data.groupId}`).emit("new-message", data.message);
    });

    socket.on("typing", (data: { groupId: string; userName: string }) => {
      socket.to(`group:${data.groupId}`).emit("user-typing", data.userName);
    });

    socket.on("stop-typing", (data: { groupId: string }) => {
      socket.to(`group:${data.groupId}`).emit("user-stop-typing");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
