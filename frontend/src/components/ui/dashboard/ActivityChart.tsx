'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry, ConvertedMatchEntry } from "./DashboardInterfaces";

interface ActivityChartProps {
	setChartInstance: Function,
	activityData: Array<MatchEntry>,
	displayedDate: Date,
	maxY: number
}

export const convertMatchData = (activityData: Array<MatchEntry>) => {
	const convertedData: Array<ConvertedMatchEntry> = [];

	activityData.forEach(match => {
		convertedData.push({ x: (new Date(match.x)).getTime(), y: match.y });
	})
	return convertedData;
}

export default function ActivityChart({ setChartInstance, displayedDate, activityData, maxY }: ActivityChartProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);

	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 6);
	let sevenDays = new Date(currentDate.toISOString().split('T')[0]);

	useEffect(() => {
		if (chartRef.current) {
			const ctx = chartRef.current.getContext('2d');

			const lineData = {
				labels: [],
				datasets: [
					{
						label: 'Activity',
						data: convertMatchData(activityData),
						fill: false,
						borderWidth: 4,
						borderColor: 'rgb(75, 192, 192)',
						backgroundColor: 'rgb(75, 192, 192)'
					},
				]
			};

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
									tooltipFormat: 'MM-dd-yyyy'
								},
								min: displayedDate.getTime(),
								ticks: {
									font: {
										size: 18
									}
								}
							},
							y: {
								stacked: true,
								beginAtZero: true,
								min: 0,
								suggestedMax: maxY,
								ticks: {
									font: {
										size: 18
									},
									stepSize: 10
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
				setChartInstance(chartInstance);
			}

			// Cleanup function to destroy the chart instance when the component unmounts
			return () => {
				if (chartInstance.current) {
					chartInstance.current.destroy();
				}
			};
		}
	}, [activityData]);

	return (
		<>
			<canvas className="dashboard-canvas" ref={chartRef} />
		</>
	);
};