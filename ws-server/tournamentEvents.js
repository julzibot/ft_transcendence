import { tournamentUsers } from "./server.js";

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

const tournamentsArray = []

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

				// TO DO: INCREMENT GAME COUNT IN .opponents FOR EACH PAIRED PLAYER
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
		// tournamentUsers.set(socket.id, data.user.id);

		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		let updatedParticipants = [];
		if (tournament) {
			const participant = tournament.participants.find(participant => participant.user.id === data.user.id)
			if (!participant)
				tournament.participants.push({ user: data.user, return_time: 0, opponents: new Map() });
			updatedParticipants = tournament.participants;
		}
		else {
			const newTournament = {
				tournamentId: data.tournamentId,
				startTime: 0,
				duration: 0,
				participants: [{ user: data.user, return_time: 0, opponents: new Map() }],
			}
			tournamentsArray.push(newTournament);
			updatedParticipants = newTournament.participants;
		}
		// Inform other participants about the new participant
		socket.join(data.tournamentId);
		socket.in(data.tournamentId).emit('updateParticipants', updatedParticipants);
	});

	socket.on('returnToLobby', (data) => {
		console.log("################## returningToLobby ##########################")
		const userId = data.userId
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament) {
			console.log(tournament.inLobby)
			const p = tournament.participants.find(participant => participant.user.id === userId);
			p.return_time = performance.now();
			tournament.inLobby.push(p);
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
					io.in(data.tournamentId).emit('getMatchPair', pairs);
				}
			}
			else if (tournament.inLobby.length === tournament.participants.length)
				io.in(data.tournamentId).emit('announceTournamentEnd');
		}
	})


	socket.on('sendLink', (data) => {
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);

		if (tournament) {
			io.in(data.tournamentId).emit('receiveLink', { linkToJoin: data.linkToJoin, receiverId: data.receiver.id });
		}
	})

	socket.on('startTournament', (data) => {

		// INITIALIZE TOURNAMENT INFOS + SEND FIRST MATCHMAKING
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		if (tournament) {
			tournament.participants.forEach(participant1 => {
				tournament.participants.forEach(participant2 => {
					if (participant1.user.id != participant2.user.id)
						participant1.opponents.set(participant2.user.id, 0);
				})
				participant1.return_time = performance.now();
			});
			tournament.startTime = performance.now();
			tournament.duration = data.tournamentDuration * 60;
			tournament.inLobby = tournament.participants;

			const pairsArray = computeMatches(tournament);
			if (pairsArray.length > 0) {
				const pairs = [];

				pairsArray.forEach(pair => {
					pairs.push({
						player1: tournament.participants.find(p => p.user.id === pair[0]).user,
						player2: tournament.participants.find(p => p.user.id === pair[1]).user
					})
				});
				io.in(data.tournamentId).emit('getMatchPair', pairs);
			}
		}
	})

	socket.on('tournamentGameEntered', (data) => {
		const tournament = tournamentsArray.find(tournament => tournament.tournamentId === data.tournamentId);
		const i = tournament.inLobby.findIndex(participant => participant.user.id === data.userId);
		const participant = tournament.participants.find(participant => participant.user.id === data.userId);

		if (participant && participant.opponents.has(data.oppId)) {
			const count = participant.opponents.get(data.oppId)
			participant.opponents.set(data.oppId, count + 1);

		}
		tournament.inLobby.splice(i, 1);
	})
}