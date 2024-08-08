'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import * as Utils from './Utils';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface ScoreChartProps {
	winData: Array<MatchEntry>,
	lossData: Array<MatchEntry>,
	displayedDate: Date
}

export default function ScoreChart({ winData, lossData, displayedDate }: ScoreChartProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart | null>(null);

	useEffect(() => {
		if (chartRef.current) {
			const ctx = chartRef.current.getContext('2d');
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

			if (ctx) {
				chartInstance.current = new Chart(ctx, {
					type: 'bar',
					data: data,
					options: {
						locale: 'en-us',
						plugins: {
							title: {
								display: true,
								text: 'Activity/Score Chart',
								padding: {
									bottom: 20
								},
								font: {
									size: 20
								},
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
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							x: {
								grid: {
									display: false
								},
								stacked: true,
								type: 'time',
								time: {
									unit: 'day',
									round: 'day',
									tooltipFormat: 'DDDD'
								},
								min: displayedDate.getTime(),
								ticks: {
									font: {
										size: 18,
									}
								}
							},
							y: {
								stacked: true,
								beginAtZero: true,
								min: 0,
								suggestedMax: 5,
								ticks: {
									font: {
										size: 18,
									},
									stepSize: 1
								}
							}
						}
					}
				});
			}
			// Cleanup function to destroy the chart instance when the component unmounts
			return () => {
				if (chartInstance.current) {
					chartInstance.current.destroy();
				}
			};
		}
	}, [winData, lossData, displayedDate]);

	return (
		<>
			<canvas ref={chartRef} />
		</>
	);
};