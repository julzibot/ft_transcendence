import { createServer } from 'node:http'
import { Server } from "socket.io"

const PORT = 6500

const server = createServer();

function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on("connection", async (socket) => {
  console.log("User connected: " + socket.id)

  socket.on('myEvent', data => {
    console.log("message from client: " + data.message + " to room: " + data.room_id);
		socket.to(data.room_id).emit('receive_message', data);
    // socket.emit("serverResponse", "Hi client");
  })

	socket.on('join_room', (roomId) => {
		console.log("client joining room:", roomId);
		socket.join(roomId);
	});

	// socket.on('send_message', (data) => {
	// 	console.log('emiting to:', data.room_id);
	// 	socket.to(data.room_id).emit('receive_message', data);
	// });
})

server.listen(PORT, () => {
  console.log("'socket.io' server is now listening on port: " + PORT)
})

// Server/client communication
// It seems that we can use the same socket.io Server
// for both the game and the chat

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
