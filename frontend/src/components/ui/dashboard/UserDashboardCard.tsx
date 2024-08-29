'use client'

import React, { RefObject, useEffect, useState } from "react";
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import './styles.css';

import { Chart, TimeScale } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import ScoreChart from './ScoreChart';
import ActivityChart from "./ActivityChart";
import GameModesChart from "./GameModesChart";

import createScoreData from "./ChartDataUtils";
import { GameMatch } from "./DashboardInterfaces";
import { DashboardPlaceholder } from "@/components/placeholders/DashboardPlaceholder";

type UserHistory = {
	data: Array<GameMatch>
}

interface DashboardItems {
	wins: number,
	games_played: number,
	record_streak: number
}

interface User {
	id:number;
	username: string;
	image: string;
}

interface UserDashboardCardProps {
	user: User;
}

const UserDashboardCard: React.FC<UserDashboardCardProps> = ({user}) => {

	const [DashboardData, setDashboardData] = useState<DashboardItems | null>(null);

	useEffect(() => {
		if (user.id) {
			const fetchDashboardDetail = async () => {
				const response = await fetch(`http://localhost:8000/api/dashboard/${user.id}`, {
					method: "GET"
				});
				if (response.ok) {
					const data = await response.json();
					setDashboardData(data);
				}
				else {
					console.log('[fetchDashboardDetail] Response Status: ' + response.status);
				}
			};
			fetchDashboardDetail();
		}
	}, [user.id]);

	const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
	useEffect(() => {
		if (user.id) {
			const fetchUserHistory = async () => {
				const response = await fetch(`http://localhost:8000/api/game/history/user/${user.id}`, {
					method: "GET"
				});
				if (response.ok) {
					const data = await response.json();
					console.log('User Game History successfully fetched:', response.status);
					setUserHistory(data);
				}
				else {
					console.log('No User Game History:', response.status);
				}
			};
			fetchUserHistory();
		}
	}, [user.id]);

	// Data
	const [dataCreated, setDataCreated] = useState(false);
	const [winData, setWinData] = useState([]);
	const [lossData, setLossData] = useState([]);
	const [activityData, setActivityData] = useState([]);
	const [gameModesData, setGameModesData] = useState([]);
	const [maxY, setMaxY] = useState(5);
	const [minDate, setMinDate] = useState(new Date());

	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 6);
	let sevenDays = new Date(currentDate.toISOString().split('T')[0]);

	const [activityInstance, setActivityInstance] = useState<RefObject<Chart> | null>(null);
	const [scoreInstance, setScoreInstance] = useState<RefObject<Chart> | null>(null);
	const [pieInstance, setPieInstance] = useState<RefObject<Chart> | null>(null);
	const [displayedDate, setDisplayedDate] = useState(sevenDays);
	const [statsToggle, setStatsToggle] = useState(true);

	useEffect(() => {
		if (user.id && userHistory?.data && userHistory.data.length > 0 && !dataCreated) {
			setWinData([]);
			setLossData([]);
			setActivityData([]);

			createScoreData(
				user.id, userHistory.data,
				winData, setWinData,
				lossData, setLossData,
				activityData, setActivityData,
				gameModesData, setGameModesData,
				maxY, setMaxY,
				minDate, setMinDate);
			setDataCreated(true);
		}
	}, [userHistory, dataCreated]);

	// Buttons
	const handleStatsToggle = () => {
		setStatsToggle(!statsToggle)
	}

	const updateDate = (instance: RefObject<Chart>, date: Date) => {
		const xScale = instance.current?.options.scales?.['x'] as TimeScale | undefined;
		if (xScale) {
			xScale.min = date.getTime();
			instance.current?.update();
		}
	}

	const handleAllTimeBtn = () => {
		if (statsToggle && activityInstance?.current)
			updateDate(activityInstance, minDate)
		else if (!statsToggle && scoreInstance?.current)
			updateDate(scoreInstance, minDate);
		setDisplayedDate(minDate);
	}

	const handle7DaysBtn = () => {
		if (statsToggle && activityInstance?.current)
			updateDate(activityInstance, sevenDays);
		else if (!statsToggle && scoreInstance?.current)
			updateDate(scoreInstance, sevenDays);
		setDisplayedDate(sevenDays);
	}

	return (
		<>
			<div className="container text-center">
				<div className="row justify-content-around">
					<div className="col-lg-11 col-md-9 col-sm-11 col-9 p-2 m-4 mb-3">
						<div className="card">
							<div className="card-body">
								<h3 className="mb-4">Stats</h3>

								{DashboardData && dataCreated ? (
									<>
										<ul className="list-unstyled">
											<li>Wins: {DashboardData.wins} ({((DashboardData.wins / (DashboardData.games_played)) * 100).toFixed(1)}%)</li>
											<li>Losses: {DashboardData.games_played - DashboardData.wins} ({(((DashboardData.games_played - DashboardData.wins) / DashboardData.games_played) * 100).toFixed(1)}%)</li>
										</ul>
										<p>Current streak record: {DashboardData.record_streak}</p>
										<p>Number of matches played: {DashboardData.games_played}</p>
										<div>
											{/* <!-- Button trigger modal --> */}
											<button type="button" className="btn btn-info mb-2" data-bs-toggle="modal" data-bs-target="#history-modal">
												Show Match History
											</button>

											{/* <!-- Modal --> */}
											<div className="modal fade" id="history-modal" tabIndex={-1} aria-labelledby="history-modal-label" aria-hidden="true">
												<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
													<div className="modal-content">
														<div className="modal-header">
															<h1 className="modal-title fs-5" id="history-modal-label">Game History</h1>
															<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
														</div>
														<div className="modal-body">
															{
																Array.isArray(userHistory?.data) && userHistory?.data.toReversed().map((obj: GameMatch, index: number) => {
																	let cardColor = '';

																	switch (obj.game_mode) {
																		case 0:
																			cardColor = 'Local';
																			break;
																		case 1:
																			cardColor = 'AI';
																			break;
																		case 2:
																			cardColor = 'Online';
																			break;
																		case 3:
																			cardColor = 'Tournament';
																			break;
																		default:
																			cardColor = '';
																	}

																	return (
																		<div key={index} className={`match_item match_item_link ${cardColor}`}>
																			<div className="match_item_bg"></div>
																			<div className="match_item_game_mode">{cardColor}</div>
																			<div className="match_item_title">
																				{new Date(obj.date).toLocaleDateString()}
																			</div>
																			<div className="match_item_date-box">
																				{
																					<table className="table match-table">
																						<thead>
																							<tr className='match-table'>
																								<th className='match-table-row' scope='col'>
																									<div className="container">
																										<div className="row align-items-center justify-content-evenly">
																											<div className="col-auto">
																												<div className="position-relative border border-4 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
																													<Image style={{ objectFit: 'cover' }}
																														fill
																														src={`http://backend:8000${user.image}`}
																														alt="Profile Picture"
																														priority={true}
																														sizes="25vw"
																													/>
																												</div>
																											</div>
																											<div className="col overflow-hidden">
																												<span className="d-block fs-4 fw-semibold text-truncate">
																													{user.username}
																												</span>
																											</div>
																										</div>
																									</div>
																								</th>
																								<th className='match-table-row' scope='col'>vs</th>
																								{
																									obj.player2 ?
																										<th className='match-table-row' scope='col'>{obj.player2}</th>
																										:
																										(
																											<th className='match-table-row' scope='col'>
																												<div className="d-flex align-items-center">
																													<span>Guest</span>
																													<div className="ms-2 position-relative border border-4 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
																														<Image style={{ objectFit: 'cover' }}
																															fill
																															src={'/static/images/default.jpg'}
																															alt="Guest"
																															priority={true}
																															sizes="25vw"
																														/>
																													</div>
																												</div>
																											</th>
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
											dataCreated && (
												<>
													<button type='button' className='btn btn-primary m-1' onClick={handle7DaysBtn}>Past 7 days</button>
													<button type='button' className='btn btn-primary m-1' onClick={handleAllTimeBtn}>All time</button>
													<input
														type="checkbox"
														className="btn-check"
														id="btn-check"
														autoComplete="off"
														checked={!statsToggle}
														onChange={handleStatsToggle} />
													{
														statsToggle ? (
															<>
																<label className="btn btn-secondary m-2" htmlFor="btn-check">Without Stats</label>
															</>
														) : (
															<>
																<label className="btn btn-danger m-2" htmlFor="btn-check">With Stats</label>
															</>
														)
													}
													<div className='canvas-container m-3'>
														{
															statsToggle ?
																(<ActivityChart setChartInstance={setActivityInstance} displayedDate={displayedDate} activityData={activityData} maxY={maxY} />)
																: (<ScoreChart setChartInstance={setScoreInstance} displayedDate={displayedDate} winData={winData} lossData={lossData} maxY={maxY} />)
														}
														<GameModesChart setChartInstance={setPieInstance} displayedDate={displayedDate} data={gameModesData} />
													</div>
												</>
											)
										}
									</>
								) : <DashboardPlaceholder />
								}
							</div>
						</div>
					</div>
				</div>
			</div >
		</>
	)
}


export default UserDashboardCard