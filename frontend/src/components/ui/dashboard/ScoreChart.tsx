'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import * as Utils from './Utils';
import 'chartjs-adapter-luxon';

import { MatchEntry } from "./DashboardInterfaces";

interface ScoreChartProps {
	winData: MatchEntry,
	lossData: MatchEntry,
	displayedDate: Date
}

export default function ScoreChart({ winData, lossData, displayedDate } : ScoreChartProps) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);
	
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
		</>
	);
};