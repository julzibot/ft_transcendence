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
//	inLobby: [participant1, ...],
// 	rooms: []
// }

//	const participant = {
// 	user: {
// 		id,
// 		username,
// 		image
// 	},
//	return_time,
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

const computeMatches = (tournament) => {

	let pairs = [];
	let time_elapsed = 0;
	let prio = 0;
	let maxMatchesNumber = 0;
	let filtered_lobby = new Map();
	let priosMap = new Map();
		
	// FIRST, check which opponents in lobby are viable for pairing
	tournament.inLobby.forEach(participant => {
		time_elapsed = performance.now() - participant.return_time;
		prio = 0;
		if (time_elapsed > 60000)
			prio += 1 + Math.floor((time_elapsed - 60000) / 30000)
		maxMatchesNumber = Math.min(...participant.opponents.values()) + prio;
		// console.log("MAXMATCHNUMBER: " + maxMatchesNumber);
		
		const inLobbyOpps = [...participant.opponents].filter(([key]) => tournament.inLobby.map(participant => participant.user.id).indexOf(key) !== -1);
		const possibleOpps = inLobbyOpps.filter(([, value]) => value <= maxMatchesNumber).map(sub => sub[0]);
		// HERE, possibleOpps is an array of all viable opponents' IDs for the participant
		if (possibleOpps.length > 0)
		{
			priosMap.set(participant.user.id, prio);
			filtered_lobby.set(participant.user.id, possibleOpps);
		}
	})

	if (filtered_lobby.size > 0)
	{
		// REARRANGE indexes according to priority (highest first)
		// console.log("FILTERED LOBBY: " + JSON.stringify([...filtered_lobby]));
		let priosArray = [...priosMap];
		const OppsArray = [...filtered_lobby];
		priosArray.sort((a, b) => b[1] - a[1]);
		// console.log("PRIOSARRAY: " + priosArray);
		const sortedOppsArray = priosArray.map(([key]) => OppsArray.find(([k]) => k === key));
		const sortedOppsMap = new Map(sortedOppsArray);
		// console.log("sortedOppsMap: " + JSON.stringify([...sortedOppsMap]));

		// NEXT, check reciprocity for each opponent in the sorted opponents map, for each participant
		let finalOppsArray = [];
		let index = 0;
		sortedOppsMap.forEach((opps, participant) => {
			// console.log("OPPS: " + opps);
			opps.forEach((opp) => {
				// console.log("HERE: " + sortedOppsMap.get(opp) + " AND ----" + participant);
				if (sortedOppsMap.has(opp) && sortedOppsMap.get(opp).includes(participant))
					finalOppsArray.push(opp);
			})
			// FINALLY, if reciprocity check still leaves viable opponents, one of them is randomly selected for pairing
			// console.log("YE BOI" + finalOppsArray)
			if (finalOppsArray.length > 0)
			{
				index = Math.floor(Math.random() * finalOppsArray.length);
				pairs.push([participant, finalOppsArray[index]]);

				// TO DO: INCREMENT GAME COUNT IN .opponents FOR EACH PAIRED PLAYER
				sortedOppsMap.delete(participant);
				sortedOppsMap.delete(finalOppsArray[index]);
				// console.log("sortedOppsMap: " + JSON.stringify([...sortedOppsMap]));
				finalOppsArray.length = 0;
			}
		})
	}
	console.log("PAIRS COMPUTED: " + pairs);
	return pairs
}

io.on("connection", async (socket) => {
	console.log("User connected through socket: " + socket.id);
	
	if (!socketRooms.get(socket.id))
		socketRooms.set(socket.id, new Set());

	socket.on('startTournament', (data) => {
		// INITIALIZE TOURNAMENT INFOS + SEND FIRST MATCHMAKING
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament && !tournament.isStarted) {
			if (tournament.participants.find(participant => participant.user.id === socket.id)) {
				// console.log('[activeTournament] setting isStarted to true');
				tournament.isStarted = true;
			}
			
			// TEST

			// const p1 = {
			// 	user: {
			// 		id:10
			// 	},
			// 	return_time:0,
			// 	opponents: new Map(),
			// 	wins: 0,
			// 	gamesPlayed: 0
			// }
			// const p2 = {
			// 	user: {
			// 		id:20
			// 	},
			// 	return_time:0,
			// 	opponents: new Map(),
			// 	wins: 0,
			// 	gamesPlayed: 0
			// }
			// const p3 = {
			// 	user: {
			// 		id:30
			// 	},
			// 	return_time:0,
			// 	opponents: new Map(),
			// 	wins: 0,
			// 	gamesPlayed: 0
			// }

			// const p4 = {
			// 	user: {
			// 		id:50
			// 	},
			// 	return_time:0,
			// 	opponents: new Map(),
			// 	wins: 0,
			// 	gamesPlayed: 0
			// }
			// const p5 = {
			// 	user: {
			// 		id:40
			// 	},
			// 	return_time:0,
			// 	opponents: new Map(),
			// 	wins: 0,
			// 	gamesPlayed: 0
			// }

			// tournament.participants.push(p1)
			// tournament.participants.push(p3)
			// tournament.participants.push(p2)
			// tournament.participants.push(p4)
			// tournament.participants.push(p5)

			tournament.participants.forEach(participant1 => {
				tournament.participants.forEach(participant2 => {
					if (participant1.user.id != participant2.user.id) {
						participant1.opponents.set(participant2.user.id, 0);
						console.log(`[startTournament] Participant: ${participant1.user.id} || opponents: ${JSON.stringify(Array.from(participant1.opponents))}`);
					}
				})
				participant1.return_time = performance.now();
			});
			tournament.inLobby = tournament.participants;

			console.log(tournament);
			const pairs = computeMatches(tournament);
			console.log(pairs);
			if (pairs.length > 0)
				socket.to(data.tournamentId).emit('getMatchPairs', {pairs: pairs})
			// console.log(`[activeTournament] ${JSON.stringify(tournament)}`);
		}
	})

	socket.on('returnToLobby', (data) => {
		const userId = connectedUsers.get(socket.id);
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		p = tournament.participants.find(participant => participant.user.id === userId);
		p.return_time = performance.now();
		tournament.inLobby.push(p);

		const pairs = computeMatches(tournament);
		if (pairs.length > 0)
			socket.to(data.tournamentId).emit('getMatchPairs', {pairs});
	})

	socket.on('TournamentGameEntered', (data) => {
		const userId = connectedUsers.get(socket.id);
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		const i = tournament.inLobby.findIndex(participant => participant.user.id === userId);
		// TO DO: ITERATE MATCHES PLAYED WITH GAME OPPONENT
		tournament.inLobby.splice(i);
	})

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
			socket.to(data.room_id).emit('player2_id', { player2_id: data.user_id });
			socket.emit('isNotHost');
		}
		
		socket.join(data.room_id);
		socketRooms.get(socket.id).add(data.room_id);
		if (!fetchFinished.has(data.room_id))
			fetchFinished.set(data.room_id, 0);
	});
	
	socket.on('fetchFinished', (data) => {
		console.log('fetchFinished');
		let currentCount = fetchFinished.get(data.room_id) || 0;
		if (currentCount > -1)
			fetchFinished.set(data.room_id, currentCount + 1);
		if (fetchFinished.get(data.room_id) === 2) {
			console.log(`[Online Game] 2 Players in the room: ${io._nsps.get('/').adapter.rooms.get(data.room_id).size}`);
			io.in(data.room_id).emit('startGame');
			fetchFinished.delete(data.room_id);
		}
	});
	
	// Tournament sockets
	socket.on('joinTournament', (data) => {
		
		// connectedUsers.set(socket.id, data.user.id);
		console.log(`[server.js] connected users: ${JSON.stringify(Array.from(connectedUsers.entries()))}`);
		
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		let updatedParticipants = [];
		if (tournament) {
			const participant = tournament.participants.find(participant => participant.user.id === data.user.id)
			if (!participant)
				tournament.participants.push({ user: data.user, return_time: 0, opponents: new Map(), wins: 0, gamesPlayed: 0 });
			if (tournament.participants.length === 3)
				io.in(tournament.tournamentId).emit('tournamentCanStart');
			updatedParticipants = tournament.participants;
		}
		else {
			const newTournament = {
				tournamentId: data.tournamentId,
				isStarted: false,
				participants: [{ user: data.user, return_time: 0, opponents: new Map(), wins: 0, gamesPlayed: 0 }],
				gameRooms: []
			}
			tournamentsArray.push(newTournament);
			updatedParticipants = newTournament.participants;
		}
		// Inform other participants about the new participant
		socket.in(data.tournamentId).emit('updateParticipants', updatedParticipants);

		socket.join(data.tournamentId);
	});

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
		};

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
