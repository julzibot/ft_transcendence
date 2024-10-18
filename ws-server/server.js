import { createServer } from 'node:http';
import { Server } from "socket.io";

const port = process.env.SOCKET_PORT || 6500;
const domain = process.env.DOMAIN_NAME || "localhost";
const frontendPort = process.env.FRONTEND_PORT || 3000;
const backendPort = process.env.BACKEND_PORT || 8000;

const fetchFinished = new Map();
const socketRooms = new Map();

const connectedUsers = new Map(); // socket.id -> user.id

let tournamentsArray = [];
// const tournament = {
// 	tournamentId: 0,
//	isStarted: false
// 	participants: [participant1...],
//	inLobby: [part_id1, ...],
// 	rooms: []
// }

// const participant = {
// 	user: {
// 		id,
// 		username,
// 		image
// 	},
//	waiting_time,
//	opponents: new Map(),
// 	wins,
// 	gamesPlayed
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
		// 	console.log(`${data.room_id} Two participants are already connected`);
		// 	return;
		// }

		if (!room || room.size === 0) {
			console.log("[HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
			socket.emit('isHost');
		}
		else {
			console.log("[NOT HOST] Client [" + data.user_id + "] joining room: " + data.room_id);
			socket.to(data.room_id).emit('participant2_id', { participant2_id: data.user_id });
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
		let updatedParticipants = [];
		if (tournament) {
			const participant = tournament.participants.find(participant => participant.user.id === data.user.id)
			if (!participant)
				tournament.participants.push({ user: data.user, opponents: new Map(), wins: 0, gamesPlayed: 0 });
			if (tournament.participants.length === 3)
				io.in(tournament.tournamentId).emit('tournamentCanStart');
			updatedParticipants = tournament.participants;
		}
		else {
			const newTournament = {
				tournamentId: data.tournamentId,
				isStarted: false,
				participants: [{ user: data.user, opponents: new Map(), wins: 0, gamesPlayed: 0 }],
				gameRooms: []
			}
			tournamentsArray.push(newTournament);
			updatedParticipants = newTournament.participants;
		}
		// Inform other participants about the new participant
		socket.in(data.tournamentId).emit('updateParticipants', updatedParticipants);

		socket.join(data.tournamentId);
	});

	socket.on('startTournament', (data) => {
		// INITIALIZE TOURNAMENT INFOS + SEND FIRST MATCHMAKING 
		// data = { tournamentId }
		const userId = connectedUsers.get(socket.id);
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament && !tournament.isStarted) {

			if (tournament && tournament.participants.find(participant => participant.user.id === userId)) {
				// console.log('[activeTournament] setting isStarted to true');
				tournament.isStarted = true;
			}
			tournament.participants.forEach(participant1 => {
				tournament.participants.forEach(participant2 => {
					if (participant1.user.id != participant2.user.id) {
						participant1.opponents.set(participant2.user.id, 0);
						console.log(`[startTournament] Participants' opponents: ${Array.from(participant1.opponents.entries())}`);
					}
				})
			});
		}
		// console.log(`[activeTournament] ${JSON.stringify(tournament)}`);
	})

	socket.on('returnToLobby', (data) => {

	})

	// Game match communication
	socket.on('sendGameId', (data) => {
		socket.to(data.room_id).emit('receiveGameId', { game_id: data.game_id });
	});
	socket.on('sendparticipantInfos', (data) => {
		socket.to(data.room_id).emit('setparticipantInfos', { p1Name: data.p1Name, p2Name: data.p2Name, p1p: data.p1p, p2p: data.p2p, game_id: data.game_id });
	})
	socket.on('sendBallPos', (data) => {
		socket.to(data.room_id).emit('updateBallPos', { x: data.x, y: data.y, vectx: data.vectx, vecty: data.vecty, speed: data.speed });
	})
	socket.on('sendparticipant1Pos', data => {
		socket.to(data.room_id).emit('updateparticipant1Pos', { participant1pos: data.participant1pos });
	});
	socket.on('sendparticipant2Pos', data => {
		socket.to(data.room_id).emit('updateparticipant2Pos', { participant2pos: data.participant2pos });
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
		socket.to(data.room_id).emit('updateCollectPU', { participant_id: data.participant_id, powerType: data.power_id });
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
		socket.to(data.room_id).emit('updateInvisiball', { id: data.participant_id });
	})
	socket.on('sendDeactivatePU', data => {
		socket.to(data.room_id).emit('updateDeactivatePU', { participant_id: data.participant_id, type: data.type });
	})
	socket.on('sendDeletePU', data => {
		socket.to(data.room_id).emit('updateDeletePU', { pu_id: data.pu_id });
	})

	socket.on('disconnect', async () => {
		const disconnectedUserId = connectedUsers.get(socket.id);
		connectedUsers.delete(socket.id);

		const deleteParticipant = async (tournamentId, userId) => {

			// Inform other participants about the disconnected participant
			await fetch(`http://django:${backendPort}/api/tournament/${tournamentId}/delete-participant/`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ userId })
			})
		}


		if (disconnectedUserId)
			console.log(socket.id + ' -> ' + disconnectedUserId + " has disconnected");
		else
			console.log('No user to disconnect');

		// Online Game Rooms
		// socketRooms.get(socket.id).forEach(room_id => {
		// 	console.log(`[Server] Sending Disconnection Event -> [room] [${room_id}]`)
		// 	socket.to(room_id).emit('participantDisconnected');
		// });
		// socketRooms.delete(socket.id);

		// Tournament
		// Deleting the participant
		let emptyTournamentId = '';
		let updatedParticipants = [];
		tournamentsArray = tournamentsArray.map(tournament => {
			updatedParticipants = tournament.participants.filter(participant => participant.user.id !== disconnectedUserId);
			updatedParticipants.forEach(participant => {
				for (const key of participant.opponents.keys()) {
					participant.opponents.delete(key);
				}
				console.log(`[disconnect] Opponents for: ${participant.user.id} - ${Array.from(participant.opponents.entries())}`)
			})
			if (tournament.isStarted && updatedParticipants.length === 0)
				emptyTournamentId = tournament.tournamentId;
			else {
				socket.in(tournament.tournamentId).emit('updateParticipants', updatedParticipants);
			}
			deleteParticipant(tournament.tournamentId, disconnectedUserId)
			return { ...tournament, participants: updatedParticipants }
		});

		// if tournament has no participants left, delete tournament
		if (emptyTournamentId.length !== 0) {
			const tournamentIndex = tournamentsArray.findIndex(tournament => tournament.tournamentId === emptyTournamentId);
			tournamentsArray.splice(tournamentIndex, 1);
		}
	});
});


server.listen(port, () => {
	console.log(`Socket server is now listening on https://${domain}:` + port);
});

