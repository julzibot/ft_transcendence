'use client';

import { GameMatch, MatchEntry } from "./DashboardInterfaces";

const parseActivity = (newActivityData: Array<MatchEntry>) => {

	if (Array.isArray(newActivityData)) {
		console.log(`[parseActivity] newActivityData: ${JSON.stringify(newActivityData)}`)
		let i = 0;
		while (i < newActivityData.length) {
			console.log(`[parseActivity] loop`);
			const cmpDate = new Date(newActivityData[i].x);
			console.log(`*** cmpDate: ${cmpDate.getTime()} - ${new Date(cmpDate)}`);
			cmpDate.setDate(cmpDate.getDate() + 1);
			console.log(`***cmpDate: ${cmpDate.getTime()} - ${new Date(cmpDate)}`);

			if (i + 1 < newActivityData.length && cmpDate.getTime() !== (new Date(newActivityData[i + 1].x)).getTime()) {
				console.log(`cmpDate: ${cmpDate.getTime()} - ${new Date(cmpDate)}`);
				console.log(`actDate: ${(new Date(newActivityData[i + 1].x)).getTime()} - ${new Date(newActivityData[i + 1].x)}`);
				newActivityData.splice(i + 1, 0, { x: cmpDate.getTime(), y: 0 });
			}
			else
				i++;
		}

		console.log(`[parseActivity] newActivityData: ${JSON.stringify(newActivityData)}`)
		// const parsedData: Array<MatchEntry> = [];
		// for (let i = 0; i < newActivityData.length; i++) {
		// 	const cmpDate = new Date(newActivityData[i].x);
		// 	cmpDate.setDate(cmpDate.getDate() + 1);

		// 	parsedData.push(newActivityData[i]);
		// 	console.log(`cmpDate: ${new Date(cmpDate.getTime())}`);
		// 	console.log(`actDate: ${new Date(newActivityData[i + 1].x)}`);
		// 	if (i + 1 < newActivityData.length && cmpDate.getTime() !== newActivityData[i + 1].x) {
		// 		parsedData.push({ x: cmpDate.getTime(), y: 0 });
		// 		console.log('pushing');
		// 		i = 0;
		// 	}
		// }

		// newActivityData.forEach((item, index) => {
		// 	const cmpDate = new Date(item.x);
		// 	cmpDate.setDate(cmpDate.getDate() + 1);

		// 	parsedData.push(item);
		// 	if (newActivityData[index + 1] && cmpDate.getTime() != newActivityData[index + 1].x) {
		// 		console.log(`[condition] pushing: x -> ${new Date(cmpDate.getTime())}`);
		// 		parsedData.push({ x: cmpDate.getTime(), y: 0 });
		// 		index = 0;
		// 	}
		// });
		// parsedData.forEach((item) => {

		// console.log(`[parseActivity] parsedData X: ${JSON.stringify(new Date(item.x))}`)
		// console.log(`[parseActivity] parsedData Y: ${JSON.stringify(item.y)}`)
		// })
		// return (parsedData);
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

		data.map((item) => {
			console.log(`[createScoreData] [item] ${JSON.stringify(item)}`);
			const itemDate = new Date(item.date);
			const dateISO = itemDate.getTime();
			// console.log(`data.map -> date -> ${dateISO}`);

			if (dateISO < newMinDate.getTime())
				newMinDate = itemDate;

			// Wins and losses
			if ((Number(item.player1.id) === user_id && item.score1 > item.score2) || ((item.player2 ? Number(item.player2.id) : -1) === user_id && item.score1 < item.score2)) {
				const existingDate = newWinData.find(obj => obj.x === dateISO);

				if (!existingDate)
					newWinData.push({ x: dateISO, y: 1 });
				else
					existingDate.y += 1;
			}
			else {
				const existingDate = newLossData.find(obj => obj.x === dateISO);

				if (!existingDate)
					newLossData.push({ x: dateISO, y: 1 });
				else
					existingDate.y += 1;
			}

			// Activity & Game Mode data
			const activityDate = newActivityData.find(obj => obj.x === dateISO);
			if (!activityDate) {
				newActivityData.push({ x: dateISO, y: 1 });
			}
			else {
				activityDate.y += 1;
				if (activityDate.y > maxY)
					setMaxY(activityDate.y);
			}
			newGameModesData.push({ x: dateISO, y: item.game_mode })
		});
		const today = new Date();
		today.setDate(today.getDate())

		// console.log(`[ChartDataUtils] newActivityData: ${JSON.stringify(newActivityData)}`);
		let lastDay = new Date(newActivityData[newActivityData.length - 1].x);
		let lastDayRounded = lastDay.toISOString().split('T')[0];
		let lastDayDate = new Date(lastDayRounded);

		while (lastDayDate.getTime() < today.getTime()) {
			// console.log('[ChartDataUtils] time loop()');
			newActivityData.push({ x: lastDayDate.getTime(), y: 0 });
			newWinData.push({ x: lastDayDate.getTime(), y: 0 });
			newLossData.push({ x: lastDayDate.getTime(), y: 0 });
			lastDayDate.setDate(lastDayDate.getDate() + 1); // increment lastDayDate
		}
		console.log(`[ChartDataUtils] after time loop()`);

		parseActivity(newActivityData);
		setActivityData(newActivityData);
		setMinDate(newMinDate);
		setWinData(newWinData);
		setLossData(newLossData);
		setGameModesData(newGameModesData);
	}
}
