'use client'

import { useEffect, useState } from "react";
import 'chartjs-adapter-luxon';
import './styles.css';

import ScoreChart from './ScoreChart';
import ActivityChart from "./ActivityChart";
import GameModesChart from "./GameModesChart";

import createScoreData from "./ChartDataUtils";
import { GameMatch } from "./DashboardInterfaces";

interface DashboardProps {
	user_id: number
}

export default function UserDashboardCard({ user_id }: DashboardProps) {
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
					console.log('set to true');
				}
				else {
					console.log('fetchDashboardDetail: ' + response.status);
				}
			}
		};

		fetchDashboardDetail();
	}, [user_id]);

	const dataObj = JSON.parse(JSON.stringify(DashboardData));
	let winPerc: number = (dataObj.wins / (dataObj.games_played)) * 100;
	let lossPerc: number = ((dataObj.games_played - dataObj.wins) / (dataObj.games_played)) * 100;

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

	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 7);
	let ISOdate = currentDate.toISOString();
	let sevenDays = ISOdate.split('T')[0];

	const [displayedDate, setDisplayedDate] = useState(sevenDays);

	const [statsToggle, setStatsToggle] = useState(true);

	const handleStatsToggle = (e) => {
		setStatsToggle(!statsToggle)
	}

	const handleAllTimeBtn = () => {
		setDisplayedDate(minDate);
	}

	const handle7DaysBtn = () => {
		setDisplayedDate(sevenDays);
	}

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

	return (
		<>
			<div className="container text-center">
				<div className="row justify-content-around">
					<div className="col-lg-11 col-md-9 col-sm-11 col-9 p-2 m-4 mb-3">
						<div className="card">
							<div className="card-body">
								<h3 className="mb-4">Stats</h3>

								{fetchedDashboard ? (
									<>
										<ul className="list-unstyled">
											<li>Wins: {dataObj.wins} ({winPerc.toFixed(1)}%)</li>
											<li>Losses: {dataObj.games_played - dataObj.wins} ({lossPerc.toFixed(1)}%)</li>
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
														<div className="modal-body">
															{
																Array.isArray(userHistory.data) && userHistory.data.map((obj: GameMatch, index: number) => {
																	let cardColor = '';

																	switch (obj.game_mode) {
																		case 0:
																			cardColor = 'local';
																			break;
																		case 1:
																			cardColor = 'ai';
																			break;
																		case 2:
																			cardColor = 'online';
																			break;
																		case 3:
																			cardColor = 'tournament';
																			break;
																		default:
																			cardColor = '';
																	}

																	return (
																		<div key={index} className={`match_item match_item_link ${cardColor}`}>
																			<div className="match_item_bg"></div>

																			<div className="match_item_title">
																				{new Date(obj.date).toLocaleDateString()}
																			</div>

																			<div className="match_item_date-box">
																				{
																					<table className="table match-table">
																						<thead>
																							<tr className='match-table'>
																								<th className='match-table-row' scope='col'>{obj.player1}</th>
																								<th className='match-table-row' scope='col'>vs</th>
																								{
																									obj.player2 ? (
																										<th className='match-table-row' scope='col'>{obj.player2}</th>
																									) : (
																										<th className='match-table-row' scope='col'>Guest</th>
																									)
																								}
																							</tr>
																						</thead>
																						<tbody>
																							<tr>
																								<td>{obj.score1}</td>
																								<td>-</td>
																								<td>{obj.score2}</td>
																							</tr>
																						</tbody>
																					</table>
																				}
																			</div>
																		</div>
																	);
																})
															}
														</div>

														<div className="modal-footer d-flex justify-content-between">
															<span className="badge-container">
																<span className="badge badge-local">Local</span>
																<span className="badge badge-ai">AI</span>
																<span className="badge badge-online">Online</span>
																<span className="badge badge-tournament">Tournament</span>
															</span>
															<span className="close-modal-container">
																<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
															</span>
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
															</>
														) : (
															<>
																<label className="btn btn-danger m-2" for="btn-check">With Stats</label>
															</>
														)
													}
													<div className='canvas-container m-3'>
														{
															statsToggle ? (
																<>
																	<ActivityChart activityData={activityData} displayedDate={displayedDate} />
																</>
															) : (
																<>
																	<ScoreChart winData={winData} lossData={lossData} displayedDate={displayedDate} />
																</>
															)
														}
														<GameModesChart displayedDate={displayedDate} data={gameModesData} />
													</div>
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
						</div>
					</div>
				</div>
			</div >
		</>
	)
}
