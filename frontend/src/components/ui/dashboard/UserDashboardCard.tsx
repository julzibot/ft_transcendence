'use client'

import { useEffect, useState, useRef } from "react";
import 'chartjs-adapter-luxon';
import ScoreChart from './ScoreChart';
import ActivityChart from "./ActivityChart";

import createScoreData from "./ChartDataUtils";

export default function UserDashboardCard({user_id}) {
	const [DashboardData, setDashboardData] = useState([]);
	const [fetchedDashboard, setFetchedDashboard] = useState(false);
	
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

	const [userHistory, setUserHistory] = useState({});
	useEffect(() => {
		const fetchUserHistory = async () => {
			const response = await fetch(`http://localhost:8000/api/game/history/user/${user_id}`, {
				method: "GET"
			});
			if (response.ok) {
				const data = await response.json();
				console.log('User Game History successfully fetched:', response.status);
				setUserHistory(data);
			}
			else {
				console.log('Error fetching User Game History:', response.status);
			}
		};
		fetchUserHistory();

	}, [user_id]);
	
		// Data
		const [dataCreated, setDataCreated] = useState(false);
		const [winData, setWinData] = useState([]);
		const [lossData, setLossData] = useState([]);
		const [activityData, setActivityData] = useState([]);
		const [minDate, setMinDate] = useState(new Date());
	
	useEffect(() => {
		createScoreData(user_id, userHistory.data,
				winData, setWinData,
				lossData, setLossData,
				activityData, setActivityData,
				minDate, setMinDate);
		setDataCreated(true);
	}, [userHistory]);

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
							{
								dataCreated ? (
									<>
										<ScoreChart winData={winData} lossData={lossData} minDate={minDate} />
										<ActivityChart activityData={activityData} minDate={minDate} />
									</>
								) : (
								<div>Loading...</div>
								)
							}
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