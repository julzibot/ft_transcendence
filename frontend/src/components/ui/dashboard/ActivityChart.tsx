'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface ActivityChartProps {
	activityData: Array<MatchEntry>,
	displayedDate: Date
}

export default function ActivityChart({ activityData, displayedDate }: ActivityChartProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);

	useEffect(() => {
		if (chartRef.current) {
			const ctx = chartRef.current.getContext('2d');

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

			// If a chart instance already exists, destroy it before creating a new one
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}

			if (ctx) {
				chartInstance.current = new Chart(ctx, {
					type: 'line',
					data: lineData,
					options: {
						elements: {
							point: {
								radius: 4,
								hoverRadius: 8,
							}
						},
						locale: 'en-us',
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
									font: {
										size: 18
									}
								}
							},
							y: {
								beginAtZero: true,
								min: 0,
								suggestedMax: 5,
								ticks: {
									font: {
										size: 18
									},
									stepSize: 1
								}
							}
						},
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								onClick: () => { },
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
							},
							tooltip: {
								displayColors: false
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