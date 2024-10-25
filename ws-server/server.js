import { createServer } from 'node:https';
import { Server } from "socket.io";
import { readFileSync } from "fs";

import gameEvents from './gameEvents.js';
import tournamentEvents from './tournamentEvents.js';
import lobbyEvents from './lobbyEvents.js';

const port = process.env.SOCKET_PORT;
const domain = process.env.DOMAIN_NAME;
const frontendPort = process.env.FRONTEND_PORT;
const backendPort = process.env.BACKEND_PORT;

export const connectedUsers = new Map(); // socket.id -> {user.id, 0 || 1}
export const gameLobbies = new Map(); // lobbyId -> {player1, player2}
export const gameRooms = new Map(); // roomId -> {player1, player2}

let tournamentsArray = [];

// const tournament = {
// 	tournamentId: 0,
//	startTime: performance.now(),
//	duration: 0,
// 	participants: [participant1, ...],
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

const server = createServer({
	key: readFileSync('/etc/ssl/certs/key.pem'),
	cert: readFileSync('/etc/ssl/certs/cert.pem')
});

const io = new Server(server, {
	cors: {
		origin: `https://${domain}:${frontendPort}`,
		methods: ["GET", "POST"],
		credentials: true
	}
});

const lobby = io.of('/lobby');
const game = io.of('/game');
const tournament = io.of('/tournament');

// io.on("connection", async (socket) => {
// 	console.log("User connected through socket: " + socket.id);

// 	socket.on('disconnect', async () => {
// 		const disconnectedUser = connectedUsers.get(socket.id);
// 		if (!disconnectedUser) {
// 			console.log(`[disconnect] Player not found`);
// 			return;
// 		}
// 		else
// 			console.log(socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

// 		const userId = disconnectedUser.userId;
// 		connectedUsers.delete(socket.id);
// 	})
// });


lobby.on('connection', async (socket) => {
	console.log('[lobby] new connection');

	lobbyEvents(lobby, socket);

	// socket.on('disconnect', async () => {
	// 	const disconnectedUser = connectedUsers.get(socket.id);
	// 	if (!disconnectedUser) {
	// 		console.log(`[lobby] [disconnect] Player not found`);
	// 		return;
	// 	}
	// 	else
	// 		console.log(socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

	// 	const userId = disconnectedUser.userId;
	// 	connectedUsers.delete(socket.id);

	// 	gameLobbies.forEach(async (lobby, lobbyId) => {
	// 		if (lobby.player1 || lobby.player2) {
	// 			if (lobby.player1 && lobby.player1.id === userId)
	// 				lobby.player1 = null;
	// 			else if (lobby.player2 && lobby.player2.id === userId)
	// 				lobby.player2 = null;
	// 			if (!lobby.player1 && !lobby.player2) {
	// 				await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
	// 					method: 'DELETE',
	// 					headers: { 'Content-Type': 'application/json' },
	// 					credentials: 'include',
	// 				});
	// 				gameLobbies.delete(lobbyId);
	// 			}
	// 			else {
	// 				await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
	// 					method: 'PUT',
	// 					headers: { 'Content-Type': 'application/json' },
	// 					credentials: 'include',
	// 					body: JSON.stringify({ userId })
	// 				});
	// 				io.in(lobbyId).emit('updatedPlayers', lobby);
	// 			}
	// 		}
	// 	})
	// });
});

game.on('connection', (socket) => {

	console.log('[game] New connection');

	gameEvents(game, socket);

	socket.on('hello', (data) => console.log(data));

	socket.on('disconnect', () => {
		console.log('[game] User disconnected');
		console.log('[game] User rooms: ' + JSON.stringify(socket.rooms));
		for (const room of socket.rooms) {
			console.log('[game] room: ' + room);
			if (room != socket.id) {
				game.in(room).emit('playerDisconnected');
			}
		}
	});
})

tournament.on('connection', (socket) => {
	tournamentEvents(tournament, socket);

	// socket.on('disconnect', async () => {
	// 	const disconnectedUser = connectedUsers.get(socket.id);
	// 	if (!disconnectedUser) {
	// 		console.log(`[tournament] [disconnect] Player not found`);
	// 		return;
	// 	}
	// 	else
	// 		console.log(socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

	// 	const userId = disconnectedUser.userId;
	// 	connectedUsers.delete(socket.id);

	// 	if (disconnectedUser.mode === 1) {
	// 		// Tournament
	// 		// Deleting the participant
	// 		let emptyTournamentId = '';
	// 		let updatedParticipants = [];
	// 		tournamentsArray = tournamentsArray.map(tournament => {
	// 			updatedParticipants = tournament.participants.filter(participant => participant.user.id !== disconnectedUserId);
	// 			updatedParticipants.forEach(participant => {
	// 				for (const key of participant.opponents.keys()) {
	// 					participant.opponents.delete(key);
	// 				}
	// 				console.log(`[disconnect] Opponents for: ${participant.user.id} - ${Array.from(participant.opponents.entries())}`)
	// 			})
	// 			if (tournament.isStarted && updatedParticipants.length === 0)
	// 				emptyTournamentId = tournament.tournamentId;
	// 			else {
	// 				socket.in(tournament.tournamentId).emit('updateParticipants', updatedParticiuserIdpants);
	// 			}
	// 			deleteParticipant(tournament.tournamentId, disconnectedUserId)
	// 			return { ...tournament, participants: updatedParticipants }
	// 		});

	// 		// if tournament has no participants left, delete tournament
	// 		if (emptyTournamentId.length !== 0) {
	// 			const tournamentIndex = tournamentsArray.findIndex(tournament => tournament.tournamentId === emptyTournamentId);
	// 			tournamentsArray.splice(tournamentIndex, 1);
	// 		}
	// 	}
	// });
})

server.listen(port, () => {
	console.log(`Socket server is now listening on https://${domain}:` + port);
});
