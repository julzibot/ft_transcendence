'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import * as Utils from './Utils';
import 'chartjs-adapter-luxon';

export default function ScoreChart({ winData, lossData, minDate }) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);
	
	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 7);
	let ISOdate = currentDate.toISOString();
	let sevenDays = ISOdate.split('T')[0];

	const [displayedDate, setDisplayedDate] = useState(sevenDays);

	const handleAllTimeBtn = () => {
		setDisplayedDate(minDate);
	}

	const handle7DaysBtn = () => {
		setDisplayedDate(sevenDays);
	}
	
	useEffect(() => {
		const ctx = chartRef.current.getContext('2d');
		const data = {
			labels: 'Wins',
			datasets: [
				{
					label: 'Wins',
					data: winData,
					backgroundColor: Utils.CHART_COLORS.green,
				},
				{
					label: 'Losses',
					data: lossData,
					backgroundColor: Utils.CHART_COLORS.red,
				},
			]
		};
		
		chartInstance.current = new Chart(ctx, {
			type: 'bar',
			data: data,
			options: {
				locale: 'en-us',
				plugins: {
					title: {
						display: false,
						text: 'Past 7 Days'
					},
				},
				responsive: true,
				scales: {
					x: {
						stacked: true,
						type: 'time',
						time: {
							unit: 'day',
							tooltipFormat: 'DDDD'
						},
						min: displayedDate
					},
					y: {
						stacked: true,
						beginAtZero: true
					}
				}
			}
		});

		// Cleanup function to destroy the chart instance when the component unmounts
		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
		};
	}, [winData, lossData, displayedDate]);
	
	return (
		<>
			<div className="m-3">
				<canvas ref={chartRef} />
			</div>
			<div>
					<button type='button' className='btn btn-primary m-1' onClick={handle7DaysBtn}>Past 7 days</button>
					<button type='button' className='btn btn-primary m-1' onClick={handleAllTimeBtn}>All time</button>
			</div>
		</>
	);
};