'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';

import { MatchEntry } from "./DashboardInterfaces";

interface ActivityChartProps {
	activityData : MatchEntry,
	displayedDate : Date
}

export default function ActivityChart({ activityData, displayedDate } : ActivityChartProps) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	// let currentDate = new Date();
	// currentDate.setDate(currentDate.getDate() - 7);
	// let ISOdate = currentDate.toISOString();
	// let sevenDays = ISOdate.split('T')[0];

	// const [displayedDate, setDisplayedDate] = useState(sevenDays);

	// const handleAllTimeBtn = () => {
	// 	setDisplayedDate(minDate);
	// }

	// const handle7DaysBtn = () => {
	// 	setDisplayedDate(sevenDays);
	// }
	
	useEffect(() => {
		const ctx = chartRef.current.getContext('2d');
		
			const lineData = {
				labels: 'Activity',
				datasets: [
					{
						label: 'Activity',
						data: activityData,
						// spanGaps: 1000 * 60 * 60 * 24,
						// backgroundColor: Utils.CHART_COLORS.green
					},
				]
			};
		
		// If a chart instance already exists, destroy it before creating a new one
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}
		
		chartInstance.current = new Chart(ctx, {
			type: 'line',
			data: lineData,
			options: {
				locale: 'en-us',
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day',
							tooltipFormat: 'DDDD'
						},
						min: displayedDate
					},
					y: {
						beginAtZero: true
					}
				},
				responsive: true,
				plugins: {
					legend: {
						position: 'top',
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
	}, [activityData, displayedDate]);
	
	return (
		<>
			<div className="m-3">
				<canvas ref={chartRef} />
			</div>
		</>
	);
};