'use client'
import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react";
import Chart from 'chart.js/auto';
import * as Utils from './Utils'

export default function UserDashboardCard() {
	const [DashboardData, setDashboardData] = useState([]);
	const [fetchedDashboard, setFetchedDashboard] = useState(false);
	const { data: session } = useSession();

	const user_id = session?.user.id;
	
	useEffect(() => {
		const fetchDashboardDetail = async () => {
	
			if (user_id) {
				const response = await fetch(`http://localhost:8000/api/dashboard/${user_id}`, {
					method: "GET"
				});
				if (response.ok) {
					const data = await response.json();
					setDashboardData(data);
					setFetchedDashboard(true);
				}
			}
		};

		fetchDashboardDetail();
	}, [user_id]);

	const dataObj = JSON.parse(JSON.stringify(DashboardData));

	let winPerc : number = (dataObj.wins / (dataObj.games_played)) * 100;
	let lossPerc : number = ((dataObj.games_played - dataObj.wins) / (dataObj.games_played)) * 100;

	const DATA_COUNT = 7;
	const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 20};

	const labels = Utils.days({count: 7});
	const data = {
		labels: labels,
		datasets: [
			{
				label: 'Wins',
				data: [2, 5, 6, 3, 2, 1, 5],
				backgroundColor: Utils.CHART_COLORS.green,
			},
			{
				label: 'Losses',
				data: [2, 5, 6, 3, 2, 1, 5],
				backgroundColor: Utils.CHART_COLORS.red,
			},
		]
	};
	
	const BarChart = ({ data, labels }) => {
		const chartRef = useRef(null);
		const chartInstance = useRef(null);
		
		useEffect(() => {
			const ctx = chartRef.current.getContext('2d');
			
			// If a chart instance already exists, destroy it before creating a new one
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}
			
			chartInstance.current = new Chart(ctx, {
				type: 'bar',
				data: data,
				options: {
					plugins: {
						title: {
							display: true,
							text: 'Past 7 Days'
						},
					},
					responsive: true,
					scales: {
						x: {
							stacked: true,
						},
						y: {
							stacked: true
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
		}, [data, labels]);
		
		return (
			<div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

const LINE_DATA_COUNT = 7;
const LINE_NUMBER_CFG = {count: LINE_DATA_COUNT, min: 0, max: 20};

const lineLabels = Utils.days({count: 7});
const lineData = {
	labels: labels,
	datasets: [
		{
			label: 'Activity',
			data: [1, 4, 0, 2, 6, 7, 2],
			// backgroundColor: Utils.CHART_COLORS.green
		},
	]
};

const LineChart = ({ data, labels }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);
	
	useEffect(() => {
		const ctx = chartRef.current.getContext('2d');
		
		// If a chart instance already exists, destroy it before creating a new one
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}
		
		chartInstance.current = new Chart(ctx, {
			type: 'line',
			data: lineData,
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'top',
					},
					title: {
						display: true,
						text: 'Chart.js Line Chart'
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
	}, [lineData, lineLabels]);
	
	return (
		<div>
		<canvas ref={chartRef}></canvas>
	</div>
);
};

	return (
		<>
			<div className="container text-center">
				<div className="row justify-content-around">
					<div className="col-md-5 col-sm-11 col-9 bg-primary-subtle p-3 m-4 mb-3">
						<h3 className="mb-4">Stats</h3>
						{ fetchedDashboard ? (
							<>
							<ul className="list-unstyled">
								<li>Wins: {dataObj.wins} ({ winPerc.toFixed(1) }%)</li>
								<li>Losses: {dataObj.games_played - dataObj.wins} ({ lossPerc.toFixed(1) }%)</li>
							</ul>
							<p>Current streak record: {dataObj.streak}</p>
							<p>Number of matches played: {dataObj.games_played}</p>
							<BarChart data={data} labels={labels} />
							<LineChart data={lineData} labels={lineLabels} />
							<button>Reset</button>
							</>
							) : (
								<div className="d-flex justify-content-center">
								<div className="spinner-border" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
							</div>
							)
						}
					</div>

					<div className="col-md-5 col-sm-11 col-9 bg-primary-subtle p-3 m-4 mb-3">
						<h3 className="mb-4">World leaderboard</h3>
							<ol>
								<li className="mb-2"><span className="li-ordered">Milan</span></li>
								<li className="mb-2"><span className="li-ordered">Tosh</span></li>
								<li className="mb-2"><span className="li-ordered">Jules</span></li>
								<li className="mb-2"><span className="li-ordered">Antoine</span></li>
							</ol>
					</div>
				</div>
			</div>
		</>
	)
}

	// const BarChart = () => {
	// 	const chartRef = useRef(null);
	// 	const chartInstance = useRef(null);
	
	// 	useEffect(() => {
	// 		const ctx = chartRef.current.getContext('2d');
	
	// 		// If a chart instance already exists, destroy it before creating a new one
	// 		if (chartInstance.current) {
	// 			chartInstance.current.destroy();
	// 		}
	
	// 		chartInstance.current = new Chart(ctx, {
	// 			type: 'bar',
	// 			data: {
	// 				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
	// 				datasets: [{
	// 					label: '# of Votes',
	// 					data: [12, 19, 3, 5, 2, 3],
	// 					borderWidth: 1
	// 				}]
	// 			},
	// 			options: {
	// 				scales: {
	// 					y: {
	// 						beginAtZero: true
	// 					}
	// 				}
	// 			}
	// 		});
	
	// 		// Cleanup function to destroy the chart instance when the component unmounts
	// 		return () => {
	// 			if (chartInstance.current) {
	// 				chartInstance.current.destroy();
	// 			}
	// 		};
	// 	}, []);
	
	// 	return (
	// 		<div>
	// 			<canvas ref={chartRef}></canvas>
	// 		</div>
	// 	);
	// };