import { createServer } from 'node:http'
import { Server } from "socket.io"

const PORT = 6500

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", async (socket) => {
  console.log("User connected through socket: " + socket.id)

  socket.on('send_player_pos', data => {
    console.log("Room[" + data.room_id + "]: " + "[" + data.user_id + "] sent: '" + data.message + "'");
		socket.to(data.room_id).emit('receive_player_pos', data);
  });

	socket.on('join_room', (data) => {
		if (!io.sockets.adapter.rooms.get(data.room_id)) {
			socket.emit('isHost', true);
		}
		console.log("Client [" + data.user_id + "] joining room: " + data.room_id);
		socket.join(data.room_id);
	});
});

server.listen(PORT, () => {
  console.log("'socket.io' server is now listening on port: " + PORT)
})

// Server/client communication
// It seems that we can use the same socket.io Server
// for both the game and the chat
/*
client1.emit("newMultiplayerGame", player_id1, player_id2)
server.on("newMultiplayerGame", (player_id1, player_id2) => {
	// Create game
	client1.emit("room_created", game_room);
	client2.emit("invitation", game_room); // Waiting for the acceptation
})

client1.on("room_created", game_room => {
	// Enter the room
	// If client declines, disconnect and close the socket
});

client2.on("invitation", game_room => {
	// Join or decline to server
})

// Once both join, server starts the game
// Clients calculate locally their moves, then send them back
// to the server, who forwards them
client1.emit("move", keyEvent => {
	server.emit("player1move", keyEvent);
})

client2.emit("move", keyEvent => {
	server.emit("player2move", keyEvent);
})

server.on("player1move", keyEvent => {
	player1pos = player1move;
	socket.to(data.room).emit("player1move", player1pos);
})

server.on("player2move", keyEvent => {
	player2pos = player2move;
	socket.to(data.room).emit("player2move", player2pos);
})

// Disconnected player???
*/