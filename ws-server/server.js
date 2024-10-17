import { createServer } from 'node:http';
import { Server } from "socket.io";

const port = process.env.SOCKET_PORT || 6500;
const domain = process.env.DOMAIN_NAME || "localhost";
const frontendPort = process.env.FRONTEND_PORT || 3000;

const fetchFinished = new Map();
const socketRooms = new Map();

const connectedUsers = new Map(); // socket.id -> user.id

let tournamentsArray = [];

// const tournament = {
// 	tournamentId: 0,
//	isStarted: false
// 	players: [player...],
// 	rooms: []
// }

// const player = {
// 	id,
// 	username,
// 	image
// }

const server = createServer();

const io = new Server(server, {
	cors: {
		origin: `https://${domain}:${frontendPort}`,
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

	});

	// Tournament sockets
	socket.on('joinTournament', (data) => {

		connectedUsers.set(socket.id, data.user.id);
		console.log(`[server.js] connected users: ${JSON.stringify(Array.from(connectedUsers.entries()))}`);

		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament) {
			const player = tournament.players.find(player => player.id === data.user.id)
			if (!player)
				tournament.players.push(data.user);
		}
		else {
			const newTournament = {
				tournamentId: data.tournamentId,
				isStarted: false,
				players: [data.user],
				gameRooms: []
			}
			tournamentsArray.push(newTournament);
		}

		socket.join(data.tournamentId);
		socket.emit('joinSuccess', data);
		if (tournament.players.length === 3)
			io.in(tournament.tournamentId).emit('tournamentCanStart');

		// Inform other players about the new player
		socket.in(data.tournamentId).emit('updatePlayers', data.user);
	});

	socket.on('startedTournament', (data) => {
		// data = { tournamentId }
		const userId = connectedUsers.get(socket.id);
		console.log(`[activeTournament] data: ${JSON.stringify(data)}`);
		console.log(`[activeTournament] userId: ${JSON.stringify(userId)}`);
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament && tournament.players.find(player => player.id === userId)) {
			console.log('[activeTournament] setting isStarted to true');
			tournament.isStarted = true;
		}
		console.log(`[activeTournament] ${JSON.stringify(tournament)}`);
	})

	// Game match communication
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
		const disconnectedUserId = connectedUsers.get(socket.id);
		connectedUsers.delete(socket.id);

		if (disconnectedUserId)
			console.log(socket.id + ' -> ' + disconnectedUserId + " has disconnected");
		else
			console.log('No user to disconnect');

		// Online Game Rooms
		// socketRooms.get(socket.id).forEach(room_id => {
		// 	console.log(`[Server] Sending Disconnection Event -> [room] [${room_id}]`)
		// 	socket.to(room_id).emit('playerDisconnected');
		// });
		// socketRooms.delete(socket.id);

		// Tournament
		console.log(`[server.js] BEFORE [player] delete: ${JSON.stringify(tournamentsArray)}`);
		// Deleting the player
		let emptyTournamentId = '';
		tournamentsArray = tournamentsArray.map(tournament => {
			const updatedPlayers = tournament.players.filter(player => player.id !== disconnectedUserId);
			if (tournament.isStarted && updatedPlayers.length === 0)
				emptyTournamentId = tournament.tournamentId;
			return { ...tournament, players: updatedPlayers }
		});
		console.log(`[server.js] AFTER [player] delete: ${JSON.stringify(tournamentsArray)}`);

		// if tournament has no players left, delete tournament
		if (emptyTournamentId.length !== 0) {
			console.log(`[server.js] Deleting the tournament [${emptyTournamentId}]`);
			const tournamentIndex = tournamentsArray.findIndex(tournament => tournament.tournamentId === emptyTournamentId);
			tournamentsArray.splice(tournamentIndex, 1);
			console.log(`[server.js] AFTER [tournament] delete: ${JSON.stringify(tournamentsArray)}`);
			console.log(`[server.js] connected users: ${JSON.stringify(Array.from(connectedUsers.entries()))}`);
		}
	});
});


server.listen(port, () => {
	console.log(`Socket server is now listening on https://${domain}:` + port);
});

