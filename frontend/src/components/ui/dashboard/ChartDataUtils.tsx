'use client';

import { GameMatch, MatchEntry } from "./DashboardInterfaces";

const parseActivity = (newActivityData : Array<MatchEntry>) => {
					
	if (Array.isArray(newActivityData)) {
		for (let i = 0; i < newActivityData.length - 1; i++) {
			const cmpDate = new Date(newActivityData[i].x);
			cmpDate.setDate(cmpDate.getDate() + 1);
			if (cmpDate.getTime() !== newActivityData[i + 1].x.getTime())
				newActivityData.splice(i + 1, 0, {x: cmpDate, y: 0})
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
	minDate: Date,
	setMinDate: Function
	) {
	if (Array.isArray(data)) {
		const newWinData = [...winData];
		const newLossData = [...lossData];
		const newActivityData = [...activityData];
		
		data.forEach((item) => {
			const itemDate = new Date(item.date);
			const dateISO =itemDate.getTime();

			if (dateISO < minDate.getTime())
			setMinDate(itemDate);
			
			// Wins and losses
			if ((item.player1 === user_id && item.score1 > item.score2) || (item.player2 === user_id && item.score1 < item.score2)) {
				const existingDate = newWinData.find(obj => obj.x.getTime() === dateISO);
				
				if (existingDate === undefined)
					newWinData.push({x: new Date(dateISO), y: 1});
				else
					existingDate.y += 1;
			}
			else {
				const existingDate = newLossData.find(obj => obj.x.getTime() === dateISO);
				
				if (existingDate === undefined)
					newLossData.push({x: new Date(dateISO), y: 1});
				else
					existingDate.y += 1;
			}
			// Activity data
			
			const activityDate = newActivityData.find(obj => obj.x.getTime() === dateISO);
			if (activityDate === undefined)
				newActivityData.push({x: new Date(dateISO), y: 1});
			else
				activityDate.y += 1;
		})		
		newActivityData.forEach((i) => {
			console.log("before: " + i.x + " - " + i.y);
		})
		parseActivity(newActivityData);
		newActivityData.forEach((i) => {
			console.log("after: " + i.x + " - " + i.y);
		})
		setActivityData(newActivityData);
		setWinData(newWinData);
		setLossData(newLossData);
	}
}
