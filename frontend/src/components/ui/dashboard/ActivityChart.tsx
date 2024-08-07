'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import * as Utils from './Utils';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface ActivityChartProps {
	activityData: Array<MatchEntry>,
	displayedDate: Date
}

export default function ActivityChart({ activityData, displayedDate }: ActivityChartProps) {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		const ctx = chartRef.current.getContext('2d');

		const lineData = {
			labels: 'Activity',
			datasets: [
				{
					label: 'Activity',
					data: activityData,
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
					backgroundColor: Utils.CHART_COLORS.green
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
				maintainAspectRatio: false,
				plugins: {
					legend: {
						onClick: null,
						position: 'bottom',
						labels: {
							font: {
								size: 16
							}
						}
					},
					title: {
						display: true,
						text: 'Activity Chart',
						padding: {
							bottom: 20
						},
						font: {
							size: 20
						}
					}
				},
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
			<canvas ref={chartRef} />
		</>
	);
};