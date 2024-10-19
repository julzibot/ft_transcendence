'use client';

import { GameMatch, MatchEntry } from "./DashboardInterfaces";

const parseActivity = (newActivityData: Array<MatchEntry>) => {

	if (Array.isArray(newActivityData)) {
		let i = 0;
		while (i < newActivityData.length) {
			const cmpDate = new Date(newActivityData[i].x);
			cmpDate.setDate(cmpDate.getDate() + 1);

			if (i + 1 < newActivityData.length
				&& cmpDate.getTime() !== newActivityData[i + 1].x) {
				newActivityData.splice(i + 1, 0, { x: cmpDate.getTime(), y: 0 })
				i = 0;
			}
			i++;
		}
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
	maxY: number,
	setMaxY: Function,
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
			if ((Number(item.player1) === user_id && item.score1 > item.score2) || (Number(item.player2) === user_id && item.score1 < item.score2)) {
				const existingDate = newWinData.find(obj => obj.x === dateISO);

				if (existingDate === undefined)
					newWinData.push({ x: dateISO, y: 1 });
				else
					existingDate.y += 1;
			}
			else {
				const existingDate = newLossData.find(obj => obj.x === dateISO);

				if (existingDate === undefined)
					newLossData.push({ x: dateISO, y: 1 });
				else
					existingDate.y += 1;
			}

			// Activity & Game Mode data
			const activityDate = newActivityData.find(obj => obj.x === dateISO);
			if (activityDate === undefined)
				newActivityData.push({ x: dateISO, y: 1 });
			else {
				activityDate.y += 1;
				if (activityDate.y > maxY)
					setMaxY(activityDate.y);
			}
			newGameModesData.push({ x: dateISO, y: item.game_mode })
		});
		const today = new Date();

		let lastDay = new Date(newActivityData[newActivityData.length - 1].x);
		let lastDayRounded = lastDay.toISOString().split('T')[0];
		let lastDayDate = new Date(lastDayRounded);

		lastDayDate.setDate(lastDayDate.getDate() + 1);

		while (lastDayDate.getTime() < today.getTime()) {
			newActivityData.push({ x: lastDayDate.getTime(), y: 0 });
			newWinData.push({ x: lastDayDate.getTime(), y: 0 });
			newLossData.push({ x: lastDayDate.getTime(), y: 0 });
			lastDayDate.setDate(lastDayDate.getDate() + 1);
		}
		parseActivity(newActivityData);
		setMinDate(newMinDate);
		setWinData(newWinData);
		setLossData(newLossData);
		setActivityData(newActivityData);
		setGameModesData(newGameModesData);
	}
}
