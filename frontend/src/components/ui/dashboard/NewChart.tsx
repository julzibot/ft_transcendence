'use client';
import { useEffect, useState, useRef, RefObject } from "react";
import { Chart } from 'chart.js/auto';
import * as Utils from './Utils';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface ActivityChartProps {
	setChartInstance: Function,
	activityData: Array<MatchEntry>,
	winData: Array<MatchEntry>,
	lossData: Array<MatchEntry>,
	displayedDate: Date,
	maxY: number
}

export default function NewChart({ setChartInstance, activityData, winData, lossData, displayedDate, maxY }: ActivityChartProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);
	setChartInstance(chartInstance);

	const lineData = {
		labels: [],
		datasets: [
			{
				label: 'Activity',
				data: activityData,
				fill: false,
				borderWidth: 4,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgb(75, 192, 192)'
			},
		]
	};

	const data = {
		labels: [],
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


	useEffect(() => {
		if (chartRef.current) {
			const ctx = chartRef.current.getContext('2d');


			// If a chart instance already exists, destroy it before creating a new one
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}

			if (ctx) {
				chartInstance.current = new Chart(ctx, {
					type: 'line',
					data: lineData,
					options: {
						locale: 'en-us',
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: true,
								text: 'Activity Chart',
								padding: {
									bottom: 20
								},
								font: {
									size: 20
								}
							},
							legend: {
								onClick: () => { },
								position: 'bottom',
								labels: {
									font: {
										size: 16
									}
								}
							},
							tooltip: {
								displayColors: false
							}
						},
						scales: {
							x: {
								grid: {
									display: false
								},
								type: 'time',
								time: {
									unit: 'day',
									round: 'day',
									tooltipFormat: 'DDDD'
								},
								min: displayedDate.getTime(),
								ticks: {
									autoSkip: true, // Automatically skip ticks to avoid overlap
									maxRotation: 0, // Prevent rotation of labels
									minRotation: 0,
									font: {
										size: 18
									}
								}
							},
							y: {
								stacked: true,
								beginAtZero: true,
								min: 0,
								suggestedMax: maxY + 2,
								ticks: {
									font: {
										size: 18
									},
									stepSize: 1
								}
							}
						},
						elements: {
							point: {
								radius: 4,
								hoverRadius: 8,
							}
						},
					}
				}
				);
			}

			// Cleanup function to destroy the chart instance when the component unmounts
			return () => {
				if (chartInstance.current) {
					chartInstance.current.destroy();
				}
			};
		}
	}, [activityData, displayedDate]);

	return (
		<>
			<canvas ref={chartRef} />
		</>
	);
};

// const handle1 = () => {
// 	setDisplayDate(sevenDays);
// 	if (chartInstance.current?.options.scales && chartInstance.current.options.scales.x) {
// 		chartInstance.current.options.scales.x.min = sevenDays.getTime();
// 	}
// 	chartInstance.current?.update();
// }

// const handle2 = () => {
// 	if (chartInstance.current?.options.scales && chartInstance.current.options.scales.x) {
// 		chartInstance.current.options.scales.x.min = displayedDate.getTime();
// 	}
// 	chartInstance.current?.update();
// }