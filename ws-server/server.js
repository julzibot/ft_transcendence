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

export const lobbyUsers = new Map(); // socket.id -> {user.id, 0 || 1}
export const gameUsers = new Map(); // socket.id -> {user.id, 0 || 1} // socket.id -> {user.id}
export const tournamentUsers = new Map(); // socket.id -> user.id

export const gameLobbies = new Map(); // lobbyId -> {player1 (userId), player2 (userId)}
export const gameRooms = new Map(); // roomId -> {player1 (socket.id), player2 (socket.id)}
export const tournamentsArray = [];

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

// LOBBY
lobby.on('connection', async (socket) => {
	console.log('[lobby] New connection: ' + socket.id);

	lobbyEvents(lobby, socket);

	socket.on('disconnect', async () => {
		const disconnectedUser = lobbyUsers.get(socket.id);
		if (!disconnectedUser) {
			console.log(`[lobby] [disconnect] Player not found`);
			return;
		}
		else
			console.log('[lobby]' + socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

		const userId = disconnectedUser.userId;
		lobbyUsers.delete(socket.id);

		gameLobbies.forEach(async (lobby, lobbyId) => {
			if (lobby.player1 || lobby.player2) {
				if (lobby.player1 && lobby.player1.id === userId)
					lobby.player1 = null;
				else if (lobby.player2 && lobby.player2.id === userId)
					lobby.player2 = null;
				console.log(`[lobby] [disconnect] Player disconnected. Lobby: ${JSON.stringify(lobby)}`);
				if (lobby.player1 || lobby.player2) {
					await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({ userId })
					});
					io.in(lobbyId).emit('updatedPlayers', lobby);
				}
				else {
					console.log(`[lobby] [disconnect] Both players are null. Deleting lobby: ${lobbyId}`);
					await fetch(`http://django:${backendPort}/api/lobby/${lobbyId}/`, {
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
					});
					gameLobbies.delete(lobbyId);
				}
			}
		})
	});
});

// GAME
game.on('connection', (socket) => {
	console.log('[game] New connection: ' + socket.id);

	gameEvents(game, lobby, socket);

	socket.on('disconnecting', () => {
	})

	socket.on('disconnect', () => {
		const disconnectedUser = gameUsers.get(socket.id);
		if (!disconnectedUser) {
			return;
		}
		else
			console.log('[game]' + socket.id + ' -> ' + disconnectedUser.userId + " has disconnected");

		for (const [roomId, room] of gameRooms.entries()) {
			if (room.player1 === socket.id || room.player2 === socket.id) {
				if (room.player1 === socket.id) {
					room.player1 = null;
				}
				else if (room.player2 === socket.id) {
					room.player2 = null;
				}
				socket.to(roomId).emit('playerDisconnected');
				gameUsers.delete(socket.id);
				if (room.player1 === null && room.player2 === null) {
					gameRooms.delete(roomId);
				}
				break;
			}
		}
	})
});

// TOURNAMENT
tournament.on('connection', (socket) => {
	console.log('[tournament] New connection: ' + socket.id);
	tournamentEvents(tournament, socket);


	socket.on('disconnect', async () => {
		const disconnectedUserId = tournamentUsers.get(socket.id);
		if (!disconnectedUserId) {
			console.log(`[tournament] [disconnect] Player ID not found`);
			return;
		}
		else {
			console.log('[tournament] [disconnect] ' + socket.id + ' -> ' + disconnectedUserId + " has disconnected");
			tournamentsArray.forEach(t => {
				const part = t.participants.find(p => p.user.id === disconnectedUserId);
				if (part) {
					tournament.in(t.tournamentId).emit('opponentLeft', { userId: disconnectedUserId });
					t.disconnected.push(disconnectedUserId);
					if (t.inLobby) {
						const playerIndex = t.inLobby.findIndex(p => p.user.id === disconnectedUserId);
						if (playerIndex != -1) {
							t.inLobby.splice(playerIndex, 1);
						}
					}
				}
			})
		}
	});
})

server.listen(port, () => {
	console.log(`Socket server is listening on https://${domain}:` + port);
});