'use client'

import { useEffect, useState } from "react";
import 'chartjs-adapter-luxon';
import ScoreChart from './ScoreChart';
import ActivityChart from "./ActivityChart";
import GameModesChart from "./GameModesChart";

import createScoreData from "./ChartDataUtils";
import { GameMatch } from "./DashboardInterfaces";

interface DashboardProps {
	user_id : number
}

export default function UserDashboardCard({user_id} : DashboardProps) {
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
		const [gameModesData, setGameModesData] = useState([]);
		const [minDate, setMinDate] = useState(new Date());
	
	useEffect(() => {
		if (userHistory.data && userHistory.data.length > 0 && !dataCreated) {
			setWinData([]);
			setLossData([]);
			setActivityData([]);

			createScoreData(
				user_id, userHistory.data,
				winData, setWinData,
				lossData, setLossData,
				activityData, setActivityData,
				gameModesData, setGameModesData,
				minDate, setMinDate);
			setDataCreated(true);
		}
	}, [userHistory, dataCreated]);

	const [statsToggle, setStatsToggle] = useState(true);

	const handleStatsToggle = (e) => {
		setStatsToggle(!statsToggle)
	}

	useEffect(() => {
		console.log(statsToggle);
	}, [statsToggle]);

	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 7);
	let ISOdate = currentDate.toISOString();
	let sevenDays = ISOdate.split('T')[0];

	const [displayedDate, setDisplayedDate] = useState(sevenDays);

	const handleAllTimeBtn = () => {
		setDisplayedDate(minDate);
	}

	const handle7DaysBtn = () => {
		setDisplayedDate(sevenDays);
	}

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
							<p>Current streak record: {dataObj.record_streak}</p>
							<p>Number of matches played: {dataObj.games_played}</p>
						<div>
														{/* <!-- Button trigger modal --> */}
														<button type="button" className="btn btn-info mb-2" data-bs-toggle="modal" data-bs-target="#history-modal">
															Show Match History
														</button>

														{/* <!-- Modal --> */}
														<div class="modal fade" id="history-modal" tabindex="-1" aria-labelledby="history-modal-label" aria-hidden="true">
															<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
																<div class="modal-content">
																	<div class="modal-header">
																		<h1 class="modal-title fs-5" id="history-modal-label">Game History</h1>
																		<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
																	</div>
																	<div class="modal-body">
																	{
																		Array.isArray(userHistory.data) && userHistory.data.map((obj : GameMatch, index : number) => (
																			<div className="card m-2">
																				<div className="card-body">
																					<h5 className="card-title mb-3">{new Date(obj.date).toLocaleDateString()}</h5>
																						{obj.player2 ? (
																							<>
																								<p>{obj.player1} vs {obj.player2}</p>
																								<p>Score</p>
																								<p>{obj.score1} - {obj.score2}</p>
																							</>
																						) : (
																							<>
																								<p>Player: {obj.player1}</p>
																								<p>Score: {obj.score1} - {obj.score2}</p>
																							</>
																						)}
																				</div>
																			</div>
																		))
																	}
																	</div>
																	<div class="modal-footer">
																		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
																		<button type="button" class="btn btn-primary">Save changes</button>
																	</div>
																</div>
															</div>
														</div>
						</div>
							{
								dataCreated ? (
									<>
										<button type='button' className='btn btn-primary m-1' onClick={handle7DaysBtn}>Past 7 days</button>
										<button type='button' className='btn btn-primary m-1' onClick={handleAllTimeBtn}>All time</button>
										<input
											type="checkbox"
											className="btn-check"
											id="btn-check"
											autocomplete="off"
											checked={!statsToggle}
											onChange={handleStatsToggle} />
										{
											statsToggle ? (
												<>
													<label className="btn btn-secondary m-2" for="btn-check">Without Stats</label>
													<ActivityChart activityData={activityData} displayedDate={displayedDate} />
												</>
											) : (
												<>
													<label className="btn btn-danger m-2" for="btn-check">With Stats</label>
													<ScoreChart winData={winData} lossData={lossData} displayedDate={displayedDate} />
												</>
											)
										}
										
										<GameModesChart displayedDate={displayedDate} data={gameModesData} />
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