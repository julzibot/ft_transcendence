import { tournamentsArray, tournamentUsers } from "./server.js";

// const tournament = {
// 	tournamentId: 0,
//	startTime: performance.now(),
//	duration: 0,
// 	participants: [participant1, ...],
//	inLobby: [participant1, ...],
//	disconnected: [p1, p2]
//	computeTimer: performance.now(),
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

const computeMatches = (tournament) => {

	let pairs = [];
	let timeElapsedSecs = 0;
	let prio = 0;
	let maxMatchesNumber = 0;
	let filtered_lobby = new Map();
	let priosMap = new Map();
	const prioWaitingTime = tournament.duration / 10;

	// FIRST, check which opponents in lobby are viable for pairing
	tournament.inLobby.forEach(participant => {

		timeElapsedSecs = (performance.now() - participant.return_time) / 1000;
		prio = 0;
		if (timeElapsedSecs > prioWaitingTime)
			prio += 1 + Math.floor((timeElapsedSecs - prioWaitingTime) / (prioWaitingTime / 2))
		maxMatchesNumber = Math.min(...participant.opponents.values()) + prio;

		const inLobbyOpps = [...participant.opponents].filter(([key]) => tournament.inLobby.map(participant => participant.user.id).indexOf(key) !== -1);
		const possibleOpps = inLobbyOpps.filter(([, value]) => value <= maxMatchesNumber).map(sub => sub[0]);
		// HERE, possibleOpps is an array of all viable opponents' IDs for the participant
		if (possibleOpps.length > 0) {
			priosMap.set(participant.user.id, prio);
			filtered_lobby.set(participant.user.id, possibleOpps);
		}
	})

	if (filtered_lobby.size > 0) {
		// REARRANGE indexes according to priority (highest first)
		let priosArray = [...priosMap];
		const OppsArray = [...filtered_lobby];
		priosArray.sort((a, b) => b[1] - a[1]);
		const sortedOppsArray = priosArray.map(([key]) => OppsArray.find(([k]) => k === key));
		const sortedOppsMap = new Map(sortedOppsArray);

		// NEXT, check reciprocity for each opponent in the sorted opponents map, for each participant
		let finalOppsArray = [];
		let index = 0;
		sortedOppsMap.forEach((opps, participant) => {
			opps.forEach((opp) => {
				if (sortedOppsMap.has(opp) && sortedOppsMap.get(opp).includes(participant))
					finalOppsArray.push(opp);
			})
			// FINALLY, if reciprocity check still leaves viable opponents, one of them is randomly selected for pairing
			if (finalOppsArray.length > 0) {
				index = Math.floor(Math.random() * finalOppsArray.length);
				pairs.push([participant, finalOppsArray[index]]);

				sortedOppsMap.delete(participant);
				sortedOppsMap.delete(finalOppsArray[index]);
				finalOppsArray.length = 0;
			}
		})
	}
	return (pairs)
}

export default function tournamentEvents(io, socket) {
	// Tournament sockets
	socket.on('joinTournament', (data) => {
		const { tournamentId, user } = data;

		if (tournamentUsers.get(socket.id))
			console.log('[tournament] [joinTournament] user already exists');
		else if (tournamentUsers.has(user.id)) {
			const user = tournament.has(user.id);
			user.userId = user.id;
		}
		else {
			tournamentUsers.set(socket.id, user.id);
			socket.join(tournamentId);
		}

		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === tournamentId);
		let updatedParticipants = [];
		if (tournament) {
			const participant = tournament.participants.find(participant => participant.user.id === user.id)
			if (!participant)
				tournament.participants.push({ user: user, return_time: 0, opponents: new Map() });
			updatedParticipants = tournament.participants.map(p => ({...p}));
		}
		else {
			const newTournament = {
				tournamentId: tournamentId,
				startTime: 0,
				duration: 0,
				timeoutStarted: false,
				participants: [{ user: user, return_time: 0, opponents: new Map() }],
			}
			tournamentsArray.push(newTournament);
			updatedParticipants = newTournament.participants.map(p => ({...p}));
		}
		socket.in(tournamentId).emit('updateParticipants', updatedParticipants);
	});

	socket.on('returnToLobby', async (data) => {
		const { userId, tournamentId } = data;
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === tournamentId);
		if (tournament) {
			const p = tournament.participants.find(participant => participant.user.id === userId);
			console.log("*********** OPPONENTS: " + JSON.stringify(p.opponents));

			const exists = tournament.inLobby.find((p) => p.user.id === userId);
			if (!exists)
			{
				tournament.inLobby.push(p);
				const discoIndex = tournament.disconnected.findIndex(participant.user.id);
				if ( discoIndex != -1)
					tournament.disconnected.splice(discoIndex, 1);
			}

			p.return_time = performance.now();
			if (!tournament.timeoutStarted) {
				tournament.timeoutStarted = true;
				setTimeout(() => {
					const tournament_elapsed = (p.return_time - tournament.startTime) / 1000;
					if (tournament_elapsed < tournament.duration) {
						const pairsArray = computeMatches(tournament);
						if (pairsArray.length > 0) {
							const pairs = [];

							pairsArray.forEach(pair => {
								pairs.push({
									player1: tournament.participants.find(p => p.user.id === pair[0]).user,
									player2: tournament.participants.find(p => p.user.id === pair[1]).user
								})
							});
							io.in(tournamentId).emit('getMatchPair', pairs);
						}
					}
					else if (tournament.inLobby.length + tournament.disconnected.length === tournament.participants.length)
						io.in(tournamentId).emit('announceTournamentEnd');
					tournament.timeoutStarted = false;
				}, 2500)
			}
		}
	})


	socket.on('sendLink', (data) => {
		const { tournamentId, linkToJoin, receiver } = data;
		console.log(`[tournament] [sendLink] data: ${JSON.stringify(data)}`);

		let socketId;
		tournamentUsers.forEach((userId, keyId) => {
			if (userId === receiver.id)
				socketId = keyId;
		})

		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === tournamentId);
		if (tournament) {
			console.log(`[tournament] [sendLink] receiveLink -> socketId: ${socketId}`);
			io.to(socketId).emit('receiveLink', { linkToJoin: linkToJoin, receiverId: receiver.id });
		}
	})

	socket.on('startTournament', (data) => {
		const { tournamentId, tournamentDuration } = data;
		console.log(`[tournament] [startTournament] data: ${JSON.stringify(data)}`);

		// INITIALIZE TOURNAMENT INFOS + SEND FIRST MATCHMAKING
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === tournamentId);
		if (tournament) {
			tournament.participants.forEach(participant1 => {
				tournament.participants.forEach(participant2 => {
					if (participant1.user.id != participant2.user.id)
						participant1.opponents.set(participant2.user.id, 0);
				})
				participant1.return_time = performance.now();
			});
			tournament.startTime = performance.now();
			tournament.duration = tournamentDuration * 60;
			tournament.inLobby = tournament.participants.map(p => ({
				...p,
				opponents: p.opponents
			}));
			tournament.disconnected = [];

			const pairsArray = computeMatches(tournament);
			if (pairsArray.length > 0) {
				const pairs = [];

				pairsArray.forEach(pair => {
					pairs.push({
						player1: tournament.participants.find(p => p.user.id === pair[0]).user,
						player2: tournament.participants.find(p => p.user.id === pair[1]).user
					})
				});
				io.in(tournamentId).emit('getMatchPair', pairs);
			}
		}
	})

	socket.on('tournamentGameEntered', (data) => {
		const { tournamentId, userId, oppId } = data;
		console.log(`[tournament] [tournamentGameEntered] data: ${JSON.stringify(data)}`);
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === tournamentId);
		const i = tournament.inLobby.findIndex(participant => participant.user.id === userId);
		const participant = tournament.participants.find(participant => participant.user.id === userId);

		if (participant && participant.opponents.has(oppId)) {
			const count = participant.opponents.get(oppId)
			participant.opponents.set(oppId, count + 1);
		}
		tournament.inLobby.splice(i, 1);
	})
}