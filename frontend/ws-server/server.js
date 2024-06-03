import { createServer } from 'node:http'
import { Server } from "socket.io"

const PORT = 5000

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", async (socket) => {
  console.log("User connected through socket: " + socket.id)

  socket.on('sendPlayer1Pos', data => {
    console.log("Room[" + data.room_id + "]: " + "[" + data.user_id + "]'s position: '" + data.player1pos + "'");
		socket.to(data.room_id).emit('updatePlayer1Pos', {player1pos: data.player1pos});
  });

  socket.on('sendPlayer2Pos', data => {
    console.log("Room[" + data.room_id + "]: " + "[" + data.user_id + "]'s position: '" + data.player2pos + "'");
		socket.to(data.room_id).emit('updatePlayer2Pos', {player2pos: data.player2pos});
  });

	socket.on('join_room', (data) => {
		if (!io.sockets.adapter.rooms.get(data.room_id)) {
			socket.emit('isHost', true);
		}
		console.log("Client [" + data.user_id + "] joining room: " + data.room_id);
		socket.join(data.room_id);
	});
  socket.on('disconnect', (socket) => {
    console.log(socket.id + " disconnected")
  })
});



server.listen(PORT, () => {
  console.log("Socket server is now listening on port " + PORT)
})
