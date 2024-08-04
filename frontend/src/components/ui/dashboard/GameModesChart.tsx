'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';

import { MatchEntry } from "./DashboardInterfaces";

interface GameModesProps {
	displayedDate : Date,
	data: Array<MatchEntry>
}

const extractGameModesData = (data : Array<MatchEntry>, setDisplayedData : Function, displayedDate : Date) => {

	const newData : Array<number> = [0, 0, 0, 0];
	if (Array.isArray(data)) {
		data.forEach((item) => {
			const date = new Date(displayedDate);
			if (date.getTime() >= date.getTime()) {
				if (item.y === 0)
					newData[0] += 1;
				else if (item.y === 1)
					newData[1] += 1;
				else if (item.y === 2)
					newData[2] += 1;
				else if (item.y === 3)
					newData[3] += 1;
			}
		})
		console.log(newData);
		setDisplayedData(newData);
	}
}

export default function GameModesChart({displayedDate, data} : GameModesProps) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	const [displayData, setDisplayData] = useState<Array<number>>([]);

	useEffect(() => {
		extractGameModesData(data, setDisplayData, displayedDate);
	}, [data])
	
	useEffect(() => {
		const ctx = chartRef.current.getContext('2d');
		
		console.log('displayData: ' + displayData);
		const data = {
			labels: [
				'Local',
				'AI',
				'Online',
				'Tournament'
			],
			datasets: [{
				label: 'Total',
				data: displayData,
				backgroundColor: [
					'rgb(255, 99, 132)',
					'rgb(54, 162, 235)',
					'rgb(255, 205, 86)',
					'rgb(245, 105, 86)'
				],
				hoverOffset: 4
			}]
		};
		
		// If a chart instance already exists, destroy it before creating a new one
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}
		
		chartInstance.current = new Chart(ctx, {
			type: 'pie',
			data: data,
			options: {
				locale: 'en-us',
				responsive: true,
				plugins: {
					legend: {
						position: 'left',
					},
					// title: {
					// 	display: false,
					// 	text: 'Chart.js Line Chart'
					// }
				}
			}
		});

		// Cleanup function to destroy the chart instance when the component unmounts
		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
		};
	}, [displayData, displayedDate]);
	
	return (
		<>
			<div className="m-3">
				<canvas ref={chartRef} />
			</div>
		</>
	);
};