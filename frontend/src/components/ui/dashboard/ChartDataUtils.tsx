'use client';

import { GameMatch, MatchEntry } from "./DashboardInterfaces";

const parseActivity = (newActivityData: Array<MatchEntry>) => {

	if (Array.isArray(newActivityData)) {
		let i = 0;
		while (i < newActivityData.length) {
			const cmpDate = new Date(newActivityData[i].x);
			cmpDate.setDate(cmpDate.getDate() + 1);

			if (i + 1 < newActivityData.length
				&& cmpDate.getTime() !== newActivityData[i + 1].x.getTime()) {
				newActivityData.splice(i + 1, 0, { x: cmpDate, y: 0 })
				i++;
			}
			i++;
		}
	}
	for (let i = 0; i < newActivityData.length; i++) {
		console.log('date: ' + newActivityData[i].x);
	}
}

export default function createScoreData(
	user_id: number,
	data: Array<GameMatch>,
	winData: Array<MatchEntry>,
	setWinData: Function,
	lossData: Array<MatchEntry>,
	setLossData: Function,
	activityData: Array<MatchEntry>,
	setActivityData: Function,
	gameModesData: Array<MatchEntry>,
	setGameModesData: Function,
	minDate: Date,
	setMinDate: Function
) {
	if (Array.isArray(data)) {
		const newWinData = [...winData];
		const newLossData = [...lossData];
		const newActivityData = [...activityData];
		const newGameModesData = [...gameModesData];
		let newMinDate = minDate;

		data.forEach((item) => {
			const itemDate = new Date(item.date);
			const dateISO = itemDate.getTime();

			if (dateISO < newMinDate.getTime())
				newMinDate = itemDate;

			// Wins and losses
			if ((item.player1 === user_id && item.score1 > item.score2) || (item.player2 === user_id && item.score1 < item.score2)) {
				const existingDate = newWinData.find(obj => obj.x.getTime() === dateISO);

				if (existingDate === undefined)
					newWinData.push({ x: new Date(dateISO), y: 1 });
				else
					existingDate.y += 1;
			}
			else {
				const existingDate = newLossData.find(obj => obj.x.getTime() === dateISO);

				if (existingDate === undefined)
					newLossData.push({ x: new Date(dateISO), y: 1 });
				else
					existingDate.y += 1;
			}
			// Activity & Game Mode data
			const activityDate = newActivityData.find(obj => obj.x.getTime() === dateISO);
			if (activityDate === undefined)
				newActivityData.push({ x: new Date(dateISO), y: 1 });
			else
				activityDate.y += 1;
			newGameModesData.push({ x: new Date(dateISO), y: item.game_mode })
		})
		parseActivity(newActivityData);
		setMinDate(newMinDate);
		setWinData(newWinData);
		setLossData(newLossData);
		setActivityData(newActivityData);
		setGameModesData(newGameModesData);
	}
}
