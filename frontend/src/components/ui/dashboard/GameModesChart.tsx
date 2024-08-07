'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface GameModesProps {
	displayedDate: Date,
	data: Array<MatchEntry>
}

const extractGameModesData = (data: Array<MatchEntry>, setDisplayedData: Function, displayedDate: Date) => {

	const newData: Array<number> = [0, 0, 0, 0];
	if (Array.isArray(data)) {
		data.forEach((item) => {
			const date = new Date(displayedDate);
			if (item.x >= date.getTime()) {
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
		setDisplayedData(newData);
	}
}

export default function GameModesChart({ displayedDate, data }: GameModesProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart<"pie", number[], string> | null>(null);

	const [displayData, setDisplayData] = useState<Array<number>>([]);

	useEffect(() => {
		extractGameModesData(data, setDisplayData, displayedDate);
	}, [data, displayedDate])

	useEffect(() => {
		if (chartRef.current) {

			const ctx = chartRef.current.getContext('2d');

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

			if (ctx) {
				chartInstance.current = new Chart(ctx, {
					type: 'pie',
					data: data,
					options: {
						locale: 'en-us',
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
								text: 'Game Mode Chart',
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
	}, [displayData, displayedDate]);

	return (
		<>
			<canvas ref={chartRef} />
		</>
	);
};