import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = 6500;

let player2assigned = false;

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log("User connected through socket: " + socket.id);

  socket.on("join_room", (data) => {
    const room = io.sockets.adapter.rooms.get(data.room_id);

    if (!room || room.size === 0) {
      console.log(
        "[HOST] Client [" + data.user_id + "] joining room: " + data.room_id
      );
      socket.emit("isHost");
    } else {
      console.log(
        "[NOT HOST] Client [" + data.user_id + "] joining room: " + data.room_id
      );
      socket.to(data.room_id).emit("player2_id", { player2_id: data.user_id });
      console.log("player2: " + data.user_id);
      player2assigned = true;
    }

    socket.join(data.room_id);

    const roomSize = io._nsps.get("/").adapter.rooms.get(data.room_id).size;

    if (room && roomSize === 2 && player2assigned) {
      console.log("Starting game...");
      io.in(data.room_id).emit("startGame");
    }
  });

  socket.on("sendBallPos", (data) => {
    socket
      .to(data.room_id)
      .emit("updateBallPos", {
        x: data.x,
        y: data.y,
        vectx: data.vectx,
        vecty: data.vecty,
        speed: data.speed,
      });
  });

  socket.on("sendPlayer1Pos", (data) => {
    socket
      .to(data.room_id)
      .emit("updatePlayer1Pos", { player1pos: data.player1pos });
  });

  socket.on("sendPlayer2Pos", (data) => {
    socket
      .to(data.room_id)
      .emit("updatePlayer2Pos", { player2pos: data.player2pos });
  });

  socket.on("sendBounceGlow", (data) => {
    socket.to(data.room_id).emit("startBounceGlow");
  });

  socket.on("sendWallCollision", (data) => {
    socket.to(data.room_id).emit("newWallCollision");
  });

  socket.on("sendScore", (data) => {
    socket
      .to(data.room_id)
      .emit("updateScore", {
        score1: data.score1,
        score2: data.score2,
        stopGame: data.stopGame,
      });
  });

  socket.on("sendCreatePU", (data) => {
    socket
      .to(data.room_id)
      .emit("updateCreatePU", {
        pu_id: data.pu_id,
        powerType: data.type,
        radius: data.radius,
        spawnx: data.x,
        spawny: data.y,
      });
  });

  socket.on("sendCollectPU", (data) => {
    socket
      .to(data.room_id)
      .emit("updateCollectPU", {
        player_id: data.player_id,
        powerType: data.power_id,
      });
  });

  socket.on("sendActivatePU1", (data) => {
    socket
      .to(data.room_id)
      .emit("updateActivatePU1", { powerType: data.powerType });
  });

  socket.on("sendActivatePU2", (data) => {
    socket
      .to(data.room_id)
      .emit("updateActivatePU2", { powerType: data.powerType });
  });

  socket.on("sendInvert", (data) => {
    socket.to(data.room_id).emit("updateInvert");
  });

  socket.on("sendInvisiball", (data) => {
    socket.to(data.room_id).emit("updateInvisiball", { id: data.player_id });
  });

  socket.on("sendDeactivatePU", (data) => {
    socket
      .to(data.room_id)
      .emit("updateDeactivatePU", {
        player_id: data.player_id,
        type: data.type,
      });
  });

  socket.on("sendDeletePU", (data) => {
    socket.to(data.room_id).emit("updateDeletePU", { pu_id: data.pu_id });
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });
});

server.listen(PORT, () => {
  console.log("Socket server is now listening on port " + PORT);
});
