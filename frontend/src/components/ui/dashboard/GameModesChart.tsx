'use client';
import { useEffect, useState, useRef } from "react";
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import './styles.css';

import { MatchEntry } from "./DashboardInterfaces";

interface GameModesProps {
	setChartInstance: Function,
	displayedDate: Date,
	data: Array<MatchEntry>
}

const extractGameModesData = (data: Array<MatchEntry>, setDisplayedData: Function, displayedDate: Date) => {
	const newData: Array<number> = [0, 0, 0, 0, 0];
	if (Array.isArray(data)) {
		data.forEach((item) => {
			const date = new Date(displayedDate);
			if (item.x >= date.getTime()) {
				if (item.y === 0) newData[0] += 1;
				else if (item.y === 1) newData[1] += 1;
				else if (item.y === 2) newData[2] += 1;
				else if (item.y === 3) newData[3] += 1;
			}
		});
		if (newData.every((item) => item === 0))
			setDisplayedData([0, 0, 0, 0, 1]);
		else
			setDisplayedData(newData);
	}
};

export default function GameModesChart({ setChartInstance, displayedDate, data }: GameModesProps) {
	const chartRef = useRef<HTMLCanvasElement>(null);
	const chartInstance = useRef<Chart<"pie", number[], string> | null>(null);

	const [displayData, setDisplayData] = useState<Array<number>>([0, 0, 0, 0, 0]);

	useEffect(() => {
		extractGameModesData(data, setDisplayData, displayedDate);
	}, [data, displayedDate]);

	useEffect(() => {
		const ctx = chartRef.current?.getContext('2d');
		if (!ctx)
			return;

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: ['Local', 'AI', 'Online', 'Tournament', 'No Data'],
				datasets: [{
					label: 'Total',
					data: displayData,
					backgroundColor: [
						'rgb(255, 99, 132)',
						'rgb(54, 162, 235)',
						'rgb(255, 205, 86)',
						'rgb(228, 64, 2)',
						'rgb(173, 173, 173)',
					],
					hoverOffset: 4
				}],
			},
			options: {
				locale: 'en-us',
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						onClick: () => { },
						position: 'right',
						labels: {
							font: { size: 16 }
						}
					},
					title: {
						display: true,
						text: 'Game Mode Chart',
						padding: { bottom: 20 },
						font: { size: 20 }
					},
					tooltip: {
						displayColors: false
					}
				}
			}
		});

		setChartInstance(chartInstance.current);

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
		};
	}, [displayData, setChartInstance]);

	useEffect(() => {
		if (chartInstance.current) {
			chartInstance.current.data.datasets[0].data = displayData;
			chartInstance.current.update();
		}
	}, [displayData]);

	return (
		<canvas ref={chartRef} />
	);
}
