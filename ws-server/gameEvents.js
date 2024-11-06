import { gameRooms, gameUsers } from "./server.js";
import { gameLobbies } from "./server.js";

export default function gameEvents(io, lobby, socket) {

	socket.on('joinGame', (data) => {
		const { userId, gameId, lobbyId, gameMode } = data;
		if (gameMode === 2)
			gameUsers.set(socket.id, { userId: userId, mode: 0 });
		else if (gameMode === 3)
			gameUsers.set(socket.id, { userId: userId, mode: 1 });

		socket.join(gameId);
		console.log(`[gameEvents] [joinGame] ${socket.id} has joined -> ${gameId}`);
		const room = gameRooms.get(gameId);
		const gameLobby = gameLobbies.get(lobbyId);
		if (room) {
			if (gameLobby.player1.id === userId) {
				room.player1 = socket.id;
			}
			else {
				room.player2 = socket.id;
			}
		}
		else {
			if (gameLobby.player1 && gameLobby.player1.id === userId) {
				gameRooms.set(gameId, { player1: socket.id, player2: null });
			}
			else {
				gameRooms.set(gameId, { player1: null, player2: socket.id });
			}
		}

		if (room && room.player1 && room.player2) {
			lobby.in(lobbyId).emit('startGame');
		}
	})

	socket.on('sendPlayerInfos', (data) => {
		socket.to(data.room_id).emit('setPlayerInfos', { p1Name: data.p1Name, p2Name: data.p2Name, p1p: data.p1p, p2p: data.p2p, game_id: data.game_id });
	});
	socket.on('sendBallPos', (data) => {
		socket.to(data.room_id).emit('updateBallPos', { x: data.x, y: data.y, vectx: data.vectx, vecty: data.vecty, speed: data.speed });
	});

	socket.on('sendPlayer1Pos', data => {
		socket.to(data.room_id).emit('updatePlayer1Pos', { player1pos: data.player1pos });
	});

	socket.on('sendPlayer2Pos', data => {
		socket.to(data.room_id).emit('updatePlayer2Pos', { player2pos: data.player2pos });
	});

	socket.on('sendBounceGlow', data => {
		socket.to(data.room_id).emit('startBounceGlow');
	});

	socket.on('sendWallCollision', data => {
		socket.to(data.room_id).emit('newWallCollision');
	});

	socket.on('sendScore', data => {
		socket.to(data.room_id).emit('updateScore', { score1: data.score1, score2: data.score2, stopGame: data.stopGame });
	});

	socket.on('sendCreatePU', data => {
		socket.to(data.room_id).emit('updateCreatePU', { pu_id: data.pu_id, powerType: data.type, radius: data.radius, spawnx: data.x, spawny: data.y });
	});

	socket.on('sendCollectPU', data => {
		socket.to(data.room_id).emit('updateCollectPU', { player_id: data.player_id, powerType: data.power_id });
	});

	socket.on('sendActivatePU1', data => {
		socket.to(data.room_id).emit('updateActivatePU1', { powerType: data.powerType });
	});

	socket.on('sendActivatePU2', data => {
		socket.to(data.room_id).emit('updateActivatePU2', { powerType: data.powerType });
	});

	socket.on('sendInvert', data => {
		socket.to(data.room_id).emit('updateInvert');
	});

	socket.on('sendInvisiball', data => {
		socket.to(data.room_id).emit('updateInvisiball', { id: data.player_id });
	});

	socket.on('sendDeactivatePU', data => {
		socket.to(data.room_id).emit('updateDeactivatePU', { player_id: data.player_id, type: data.type });
	});

	socket.on('sendDeletePU', data => {
		socket.to(data.room_id).emit('updateDeletePU', { pu_id: data.pu_id });
	});

	socket.on('finalScoreUpdate', data => {
		socket.to(data.room_id).emit('noFinalUpdate');
	})
}