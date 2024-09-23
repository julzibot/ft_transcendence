import { createServer } from 'node:http';
import { Server } from "socket.io";

const PORT = 6500;

const fetchFinished = new Map();
const socketRooms = new Map();

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
	if (!socketRooms.get(socket.id))
		socketRooms.set(socket.id, new Set());

	socket.on('join_room', data => {
		const room = io.sockets.adapter.rooms.get(data.room_id);

		// if (room) {
		// 	const roomSize = io._nsps.get('/').adapter.rooms.get(data.room_id).size;
		// 	console.log(`${data.room_id} Two players are already connected`);
		// 	return;
		// }

		if (!room || room.size === 0) {
			console.log("[HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
			socket.emit('isHost');
		}
		else {
			console.log("[NOT HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
			socket.to(data.room_id).emit('player2_id', { player2_id: data.user_id });
			socket.emit('isNotHost');
		}

		socket.join(data.room_id);
		socketRooms.get(socket.id).add(data.room_id);
		if (!fetchFinished.has(data.room_id))
			fetchFinished.set(data.room_id, 0);
	});

	socket.on('fetchFinished', (data) => {
		let currentCount = fetchFinished.get(data.room_id) || 0;
		if (currentCount > -1)
			fetchFinished.set(data.room_id, currentCount + 1);
		if (fetchFinished.get(data.room_id) === 2) {
			io.in(data.room_id).emit('startGame');
			fetchFinished.delete(data.room_id);
		}
	})

	socket.on('sendGameId', (data) => {
		socket.to(data.room_id).emit('receiveGameId', { game_id: data.game_id });
	});

	socket.on('sendPlayerInfos', (data) => {
		socket.to(data.room_id).emit('setPlayerInfos', { p1Name: data.p1Name, p2Name: data.p2Name, p1p: data.p1p, p2p: data.p2p, game_id: data.game_id });
	})

	socket.on('sendBallPos', (data) => {
		socket.to(data.room_id).emit('updateBallPos', { x: data.x, y: data.y, vectx: data.vectx, vecty: data.vecty, speed: data.speed });
	})

	socket.on('sendPlayer1Pos', data => {
		socket.to(data.room_id).emit('updatePlayer1Pos', { player1pos: data.player1pos });
	});

	socket.on('sendPlayer2Pos', data => {
		socket.to(data.room_id).emit('updatePlayer2Pos', { player2pos: data.player2pos });
	});

	socket.on('sendBounceGlow', data => {
		socket.to(data.room_id).emit('startBounceGlow');
	})

	socket.on('sendWallCollision', data => {
		socket.to(data.room_id).emit('newWallCollision');
	})

	socket.on('sendScore', data => {
		socket.to(data.room_id).emit('updateScore', { score1: data.score1, score2: data.score2, stopGame: data.stopGame });
	})

	socket.on('sendCreatePU', data => {
		socket.to(data.room_id).emit('updateCreatePU', { pu_id: data.pu_id, powerType: data.type, radius: data.radius, spawnx: data.x, spawny: data.y });
	})

	socket.on('sendCollectPU', data => {
		socket.to(data.room_id).emit('updateCollectPU', { player_id: data.player_id, powerType: data.power_id });
	})

	socket.on('sendActivatePU1', data => {
		socket.to(data.room_id).emit('updateActivatePU1', { powerType: data.powerType });
	})

	socket.on('sendActivatePU2', data => {
		socket.to(data.room_id).emit('updateActivatePU2', { powerType: data.powerType });
	})

	socket.on('sendInvert', data => {
		socket.to(data.room_id).emit('updateInvert');
	})

	socket.on('sendInvisiball', data => {
		socket.to(data.room_id).emit('updateInvisiball', { id: data.player_id });
	})

	socket.on('sendDeactivatePU', data => {
		socket.to(data.room_id).emit('updateDeactivatePU', { player_id: data.player_id, type: data.type });
	})

	socket.on('sendDeletePU', data => {
		socket.to(data.room_id).emit('updateDeletePU', { pu_id: data.pu_id });
	})

	socket.on('disconnect', () => {
		console.log(socket.id + " disconnected");
		socketRooms.get(socket.id).forEach(room_id => {
			console.log(`[Server] Sending Disconnection Event -> [room] ${room_id}`)
			socket.to(room_id).emit('playerDisconnected');
		});
		socketRooms.delete(socket.id);
	});
});

server.listen(PORT, () => {
	console.log("Socket server is now listening on port " + PORT);
});
