import { createServer } from 'node:http';
import { Server } from "socket.io";

const PORT = 6500;

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", async (socket) => {
  console.log("User connected through socket: " + socket.id);

  socket.on('join_room', data => {
		const roomExists = io.sockets.adapter.rooms.get(data.room_id);
	
    if (!roomExists || roomExists.size === 0) {
			console.log("[HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
      socket.emit('isHost');
    }
		else {
			console.log("[NOT HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
		}

		socket.join(data.room_id);

		if (io.sockets.adapter.rooms.get(data.room_id) && io._nsps.get('/').adapter.rooms.get(data.room_id).size === 2) {
			console.log("users in a room: " + io._nsps.get('/').adapter.rooms.get(data.room_id).size);
			console.log('Starting game...');
			socket.to(data.room_id).emit('startGame');
		}
  });

  socket.on('sendPlayer1Pos', data => {
    console.log("Room[" + data.room_id + "]: " + "[" + data.user_id + "]'s position: '" + data.player1pos + "'");
    socket.to(data.room_id).emit('updatePlayer1Pos', {player1pos: data.player1pos});
  });

  socket.on('sendPlayer2Pos', data => {
    console.log("Room[" + data.room_id + "]: " + "[" + data.user_id + "]'s position: '" + data.player2pos + "'");
    socket.to(data.room_id).emit('updatePlayer2Pos', {player2pos: data.player2pos});
  });

  socket.on('disconnect', () => {
    console.log(socket.id + " disconnected");
  });
});

server.listen(PORT, () => {
  console.log("Socket server is now listening on port " + PORT);
});
