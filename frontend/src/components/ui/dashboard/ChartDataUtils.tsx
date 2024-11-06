'use client';

import { GameMatch, MatchEntry } from "./DashboardInterfaces";

export const convertDate = (date: Date) => {

	let year = date.toLocaleString('default', { year: 'numeric' });
	let month = date.toLocaleString('default', { month: "2-digit" });
	let day = date.toLocaleString('default', { day: '2-digit' })

	return (year + "-" + month + "-" + day);
}

export const incrementDateDay = (date: string) => {

	const dateToIncrement = new Date(date);
	dateToIncrement.setDate(dateToIncrement.getDate() + 1);
	let year = dateToIncrement.toLocaleString('default', { year: 'numeric' });
	let month = dateToIncrement.toLocaleString('default', { month: "2-digit" });
	let day = dateToIncrement.toLocaleString('default', { day: '2-digit' })

	return (year + "-" + month + "-" + day);
}

const parseActivity = (newActivityData: Array<MatchEntry>) => {

	if (Array.isArray(newActivityData)) {
		let i = 0;
		while (i < newActivityData.length - 1) {
			const cmpDate = incrementDateDay(newActivityData[i].x);

			if (cmpDate > newActivityData[newActivityData.length - 1].x)
				break;

			if (newActivityData[i + 1] && cmpDate !== newActivityData[i + 1].x && !newActivityData.some(entry => entry.x === cmpDate))
				newActivityData.splice(i + 1, 0, { x: cmpDate, y: 0 });
			else
				i++;
		}

		// Sort by date after all splicing to maintain chronological order
		newActivityData.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
	}
}

export const createScoreData = (
	user_id: number,
	data: Array<GameMatch>,
	winData: Array<MatchEntry>, setWinData: Function,
	lossData: Array<MatchEntry>, setLossData: Function,
	activityData: Array<MatchEntry>, setActivityData: Function,
	gameModesData: Array<MatchEntry>, setGameModesData: Function,
	maxY: number,
	setMaxY: Function,
	minDate: string,
	setMinDate: Function
) => {
	if (Array.isArray(data)) {
		const newWinData = [...winData];
		const newLossData = [...lossData];
		const newActivityData = [...activityData];
		const newGameModesData = [...gameModesData];
		let newMinDate = minDate;

		data.map((item) => {

			if (item.date < newMinDate)
				newMinDate = item.date;

			// Wins and losses
			if ((Number(item.player1.id) === user_id && item.score1 > item.score2) || ((item.player2 ? Number(item.player2.id) : -1) === user_id && item.score1 < item.score2)) {
				const existingDate = newWinData.find(obj => obj.x === item.date);

				if (!existingDate)
					newWinData.push({ x: item.date, y: 1 });
				else
					existingDate.y += 1;
			}
			else {
				const existingDate = newLossData.find(obj => obj.x === item.date);

				if (!existingDate)
					newLossData.push({ x: item.date, y: 1 });
				else
					existingDate.y += 1;
			}

			// Activity & Game Mode data
			const activityDate = newActivityData.find(obj => obj.x === item.date);
			if (!activityDate) {
				newActivityData.push({ x: item.date, y: 1 });
			}
			else {
				activityDate.y += 1;
				if (activityDate.y > maxY)
					setMaxY(activityDate.y);
			}
			newGameModesData.push({ x: item.date, y: item.game_mode })
		});
		const today = convertDate(new Date());

		let lastDay = newActivityData[newActivityData.length - 1].x;

		while (lastDay < today) {
			newActivityData.push({ x: lastDay, y: 0 });
			newWinData.push({ x: lastDay, y: 0 });
			newLossData.push({ x: lastDay, y: 0 });
			lastDay = incrementDateDay(lastDay); // increment lastDayDate
		}

		parseActivity(newActivityData);
		setActivityData(newActivityData);
		setMinDate(newMinDate);
		setWinData(newWinData);
		setLossData(newLossData);
		setGameModesData(newGameModesData);
	}
}
