'use client'

import { RefObject, useEffect, useState } from "react";
import './styles.css';

import { Chart, TimeScale } from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import ScoreChart from './ScoreChart';
import ActivityChart from "./ActivityChart";
import GameModesChart from "./GameModesChart";
import Image from "@/components/Utils/Image";

import { createScoreData, convertDate } from "./ChartDataUtils";
import { GameMatch, Player } from "./DashboardInterfaces";
import { DashboardPlaceholder } from "@/components/placeholders/DashboardPlaceholder";
import { BACKEND_URL } from "@/config";

type UserHistory = {
	data: Array<GameMatch>
}

interface DashboardItems {
	wins: number,
	games_played: number,
	record_streak: number
}

interface User {
	id: number,
	username: string,
	image: string
}

const UserDashboardCard = ({ user }: { user: User }) => {
	console.log(`[UserDashboardCard] user: ${JSON.stringify(user)}`);

	const [DashboardData, setDashboardData] = useState<DashboardItems | null>(null);
	const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
	const [userHistoryFetched, setUserHistoryFetched] = useState<Boolean>(false);

	useEffect(() => {
		if (user?.id) {
			const fetchDashboardDetail = async () => {
				const response = await fetch(`${BACKEND_URL}/api/dashboard/${user?.id}`, {
					method: "GET",
					credentials: 'include'
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
			const fetchUserHistory = async () => {
				const response = await fetch(`${BACKEND_URL}/api/game/history/user/${user?.id}`, {
					method: "GET",
					credentials: 'include'
				});
				if (response.status === 204) {
					setUserHistory(null);
					setUserHistoryFetched(true);
				}
				else if (response.ok) {
					const data = await response.json();
					setUserHistory(data);
					setUserHistoryFetched(true);
				}
				else {
					console.log('No User Game History:', response.status);
				}
			};
			fetchUserHistory();
		}
	}, []);

	// Data
	const [dataCreated, setDataCreated] = useState(false);
	const [winData, setWinData] = useState([]);
	const [lossData, setLossData] = useState([]);
	const [activityData, setActivityData] = useState([]);
	const [gameModesData, setGameModesData] = useState([]);
	const [maxY, setMaxY] = useState(5);
	const [minDate, setMinDate] = useState(convertDate(new Date()));

	let currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 6);
	let sevenDays = convertDate(currentDate);

	const [activityInstance, setActivityInstance] = useState<RefObject<Chart> | null>(null);
	const [scoreInstance, setScoreInstance] = useState<RefObject<Chart> | null>(null);
	const [pieInstance, setPieInstance] = useState<RefObject<Chart> | null>(null);
	const [displayedDate, setDisplayedDate] = useState<Date>(new Date(sevenDays));
	const [statsToggle, setStatsToggle] = useState(true);

	useEffect(() => {
		if (userHistoryFetched && !dataCreated) {
			if (!userHistory) {
				console.log(`[Dashboard] No user history setting dataCreated to true`);
				setDataCreated(true);
				return;
			}
			// console.log(`[UserHistory] ${JSON.stringify(userHistory)}`);

			setWinData([]);
			setLossData([]);
			setActivityData([]);

			console.log(`[Dashboard post-createScoreData() setting dataCreated to true`);
			if (user) {

				createScoreData(
					user?.id, userHistory.data,
					winData, setWinData,
					lossData, setLossData,
					activityData, setActivityData,
					gameModesData, setGameModesData,
					maxY, setMaxY,
					minDate, setMinDate);
			}
			console.log(`[Dashboard post-createScoreData() setting dataCreated to true`);
			setDataCreated(true);
		}
	}, [user?.id, userHistoryFetched, dataCreated]);

	// Buttons
	const updateDate = (instance: RefObject<Chart>, date: string) => {
		const xScale = instance.current?.options.scales?.['x'] as TimeScale | undefined;
		if (xScale) {
			xScale.min = (new Date(date)).getTime();
			instance.current?.update();
		}
	}

	const handleAllTimeBtn = () => {
		if (statsToggle && activityInstance?.current)
			updateDate(activityInstance, minDate)
		else if (!statsToggle && scoreInstance?.current)
			updateDate(scoreInstance, minDate);
		setDisplayedDate(new Date(minDate));
	}

	const handle7DaysBtn = () => {
		if (statsToggle && activityInstance?.current)
			updateDate(activityInstance, sevenDays);
		else if (!statsToggle && scoreInstance?.current)
			updateDate(scoreInstance, sevenDays);
		setDisplayedDate(new Date(sevenDays));
	}

	return (
		<>
			<div className="card text-center me-5 mt-5 p-5 pt-0">
				<div className="card-body">
					<h1 className="mb-3 card-title">Stats</h1>

					{DashboardData && dataCreated ? (
						<>
							<h5>Wins: {DashboardData.wins} ({DashboardData.wins === 0 ? ('0') : (((DashboardData.wins / (DashboardData.games_played)) * 100).toFixed(0))}%)
							</h5>
							<h5>Losses: {DashboardData.games_played - DashboardData.wins} ({DashboardData.games_played === 0 ? ('0') : (((DashboardData.games_played - DashboardData.wins) / DashboardData.games_played) * 100).toFixed(0)}%)</h5>
							<span>Current streak record: {DashboardData.record_streak}</span>
							<p className="">Number of matches played: {DashboardData.games_played}</p>
							<div>
								<button type="button" className="btn btn-info mb-2 mt-1" data-bs-toggle="modal" data-bs-target="#history-modal">
									Show Match History
								</button>
							</div>
							{
								dataCreated && (
									<>
										<div className="btn-group m-1" role="group">
											<input type="radio" className="btn-check" name="radioTime" id="radio7days" defaultChecked autoComplete="off" onClick={() => handle7DaysBtn()} />
											<label className="btn btn-outline-primary" htmlFor="radio7days" >Past 7 days</label>

											<input type="radio" className="btn-check" name="radioTime" id="radioAllTime" autoComplete="off" onClick={() => handleAllTimeBtn()} />
											<label className="btn btn-outline-primary" htmlFor="radioAllTime">All time</label>
										</div>

										<div className="btn-group m-1" role="group">
											<input type="radio" className="btn-check" name="btnradio" id="radioWithoutStats" defaultChecked autoComplete="off" onClick={() => setStatsToggle(!statsToggle)} />
											<label className="btn btn-outline-danger" htmlFor="radioWithoutStats" >Without Stats</label>

											<input type="radio" className="btn-check" name="btnradio" id="radioWithStats" autoComplete="off" onClick={() => setStatsToggle(!statsToggle)} />
											<label className="btn btn-outline-danger" htmlFor="radioWithStats">With Stats</label>
										</div>
										<div className='d-flex flex-row m-3'>
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
							{/* <!-- Modal --> */}
							<div className="modal fade" data-bs-backdrop="false" id="history-modal" tabIndex={-1} aria-labelledby="history-modal-label" aria-hidden="true">
								<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
									<div className="modal-content">
										<div className="modal-header">
											<h1 className="modal-title fs-5" id="history-modal-label">Game History</h1>
											<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
										</div>
										<div className="modal-body">
											{
												!userHistory ? (
													<><p>No match history</p></>) : (
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


														let player2: Player | null = null;
														if (obj.game_mode === 2 || obj.game_mode === 3) {
															player2 = obj.player1.id === user?.id ? obj.player2 : obj.player1;
														}


														return (
															<div key={index} className={`match_item match_item_link ${cardColor}`}>
																<div className="match_item_bg"></div>
																<div className="match_item_game_mode">{cardColor}</div>
																<div className="match_item_title">
																	{new Date(obj.date).toLocaleDateString('en-GB', {
																		weekday: 'short',
																		year: 'numeric',
																		month: 'short',
																		day: 'numeric',
																	})}
																</div>
																<div className="match_item_date-box">
																	{
																		<table className="table match-table">
																			<thead>
																				<tr className='match-table'>
																					<th className='match-table-row' scope='col'>
																						<div className="d-flex flex-row align-items-center justify-content-evenly">
																							<div className="flex-column position-relative border border-4 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
																								<img
																									style={{
																										objectFit: 'cover',
																										width: '100%',
																										height: '100%',
																										position: 'absolute',
																										top: '50%',
																										left: '50%',
																										transform: 'translate(-50%, -50%)'
																									}}
																									fetchPriority="high"
																									alt="profile picture"
																									src={`${BACKEND_URL}${user?.image}`}
																								/>
																							</div>
																							<span className="d-inline-block flex-column flex-grow-1 overflow-hidden ms-2 fs-4 fw-semibold text-truncate" style={{ maxWidth: '100px' }}>
																								{user?.username}
																							</span>
																						</div>
																					</th>
																					<th className='match-table-row' scope='col'>vs</th>
																					{
																						player2 ?
																							<th className='match-table-row' scope='col'>
																								<div className="d-flex flex-row align-items-center justify-content-evenly">

																									<span className="d-inline-block flex-column flex-grow-1 overflow-hidden ms-2 fs-4 fw-semibold text-truncate" style={{ maxWidth: '100px' }}>{player2.username}</span>
																									<div className="ms-2 position-relative border border-4 border-dark-subtle rounded-circle" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
																										<img
																											style={{
																												objectFit: 'cover',
																												width: '100%',
																												height: '100%',
																												position: 'absolute',
																												top: '50%',
																												left: '50%',
																												transform: 'translate(-50%, -50%)'
																											}}
																											fetchPriority="high"
																											alt="profile picture"
																											src={`${BACKEND_URL}${player2.image}`}
																										/>
																									</div>
																								</div>
																							</th>
																							:
																							(
																								obj.game_mode === 1 ? (

																									<th className='match-table-row' scope='col'>
																										<div className="d-flex flex-row align-items-center">
																											<span className="d-inline-block flex-column flex-grow-1 overflow-hidden ms-2 fs-4 fw-semibold text-truncate" style={{ maxWidth: '100px' }}>AI</span>
																											<Image className="ms-2" src="/static/images/airobot.png" alt="AI" whRatio="50px" />
																										</div>
																									</th>) : (
																									<th className='match-table-row' scope='col'>
																										<div className="d-flex flex-row align-items-center">
																											<span className="d-inline-block flex-column flex-grow-1 overflow-hidden ms-2 fs-4 fw-semibold text-truncate" style={{ maxWidth: '100px' }}>Guest</span>
																											<Image className="ms-2" src="/static/images/guest.png" alt="Guest" whRatio="50px" />
																										</div>
																									</th>
																								)
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
												)
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
						</>
					) : <DashboardPlaceholder />
					}
				</div>
			</div >
		</>
	)
}


export default UserDashboardCard