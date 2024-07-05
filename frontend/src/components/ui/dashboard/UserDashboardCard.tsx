'use client'
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";

export default function UserDashboardCard() {
	const [DashboardData, setDashboardData] = useState([]);
	const { data: session } = useSession();

	const user_id = session?.user.id;
	
	useEffect(() => {
		const fetchDashboardDetail = async () => {
	
			if (user_id) {
				const response = await fetch(`http://localhost:8000/dashboard/${user_id}`, {
					method: "GET"
				});
				if (response.ok) {
					const data = await response.json();
					setDashboardData(data);
				}
			}
		};

		fetchDashboardDetail();
	}, [user_id]);

	const dataObj = JSON.parse(JSON.stringify(DashboardData));

	let winPerc : number = (dataObj.wins / (dataObj.wins + dataObj.losses)) * 100;
	let lossPerc : number = (dataObj.losses / (dataObj.wins + dataObj.losses)) * 100;

	return (
		<>
			<h2 className="m-3 ms-5 me-5">Dashboard</h2>
			<hr />
			<div className="container text-center">
				<div className="row justify-content-around">
					<div className="col-md-5 col-sm-11 col-9 bg-primary-subtle p-3 m-4 mb-3">
						<h3 className="mb-4">Stats</h3>
						<ul className="list-unstyled">
							<li>Wins: {dataObj.wins} ({ winPerc.toFixed(1) }%)</li>
							<li>Losses: {dataObj.losses} ({ lossPerc.toFixed(1) }%)</li>
						</ul>
						<p>Current streak record: 4</p>
						<p>Number of matches played: {dataObj.wins + dataObj.losses}</p>
						<button>Reset</button>
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