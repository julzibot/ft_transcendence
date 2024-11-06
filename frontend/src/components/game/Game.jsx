"use client";

import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as CONST from '../../utils/constants';
import { initVars } from '../../utils/init';
import useSocketContext from '../../context/socket';
import { BACKEND_URL } from '@/config';
import Cookies from 'js-cookie';

export default function ThreeScene({ gameInfos, gameSettings, room_id, user_id, isHost, gamemode, handleGameEnded }) {
	if (gamemode >= 2)
		gamemode = 2;
	const containerRef = useRef(null);
	const animationFrameIdRef = useRef();
	const stopAnim = useRef(false);
	const testbool = useRef(false);
	const p = {};
	p.objs = {};
	p.csts = {};
	p.vars = {};
	p.custom = {};
	p.keys = {};
	p.tools = {};
	const trail = {};
	const arr = {};
	arr.particleEffects = [];
	arr.trailSegments = [];
	arr.power_ups = [];
	arr.player_power_ups = [-1, -1];
	arr.activated_powers = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
	arr.power_timers = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

	const g = {};
	g.opponentPos = 0.;
	g.game_id = gameInfos.game_id;
	g.p1Name = "";
	g.p2Name = "";
	g.startTime = performance.now();
	g.lastConnected = 0;
	if (typeof window !== 'undefined') {
		p.tools.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		p.uniformData = {
			u_time:
				{ type: 'f', value: performance.now() - g.startTime },
			u_color:
				{ type: 'v3', value: p.custom.color },
			u_palette:
				{ type: 'i', value: p.custom.palette },
			u_resolution:
				{ type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			projectionMatrix:
				{ value: p.tools.camera.projectionMatrix },
			viewMatrix:
				{ value: p.tools.camera.matrixWorldInverse }
		};
	}
	let socket = -1;
	socket = useSocketContext();

	initVars(p.objs, p.csts, p.vars, p.custom);


	useEffect(() => {

		if (typeof window !== 'undefined') {
			const sparkUniform = {
				u_time:
					{ type: 'f', value: 0. },
				u_texture:
					{ type: 't', value: new THREE.TextureLoader().load('../../../spark.png') }
			};

			const sparkVs = `
				uniform float u_time;
				attribute float size;
		
				void main()
				{
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
					gl_PointSize = size * gl_Position.w;
				}
			`;

			const sparkFs = `
				uniform float u_time;
				uniform sampler2D u_texture;
		
				void main()
				{
					vec4 color = texture(u_texture, gl_PointCoord);
					vec4 decay = vec4(1., 1., 1., 1. - u_time / 500.);
					gl_FragColor = color * decay;
				}
			`;

			function printGameInfo(textMesh, string, mode, id, fontsize, p) {
				p.csts.loader.load(CONST.FONTPATH + CONST.FONTNAME, function (font) {
					let depth = 0.5;
					if (mode >= 4 && mode < 5)
						depth = 0.1;
					let updatedStringGeo = new TextGeometry(string, { font: font, size: fontsize, depth: depth });
					if (mode === 0 && ((p.vars.scorePlaceAdjust[id] === 0 && parseInt(string, 10) > 9) || (id === 0 && p.vars.scorePlaceAdjust[id] === 1 && parseInt(string, 10) > 19))) {
						if (id === 0 && p.vars.scorePlaceAdjust[0] === 0)
							textMesh.position.set(-4.91, CONST.GAMEHEIGHT / 2 + 0.5, 1);
						else if (id === 0 && p.vars.scorePlaceAdjust[0] === 1)
							textMesh.position.set(-5.31, CONST.GAMEHEIGHT / 2 + 0.5, 1);
						else
							textMesh.position.set(1.5, CONST.GAMEHEIGHT / 2 + 0.5, 1);
						p.vars.scorePlaceAdjust[id] += 1;
					}
					else if (mode > 0 && mode < 3) {
						const textMaterial = new THREE.MeshStandardMaterial({ color: 0x0000cc, emissive: 0xee00ee, emissiveIntensity: 0.3 });
						textMesh.material = textMaterial;
						if (mode === 1)
							textMesh.position.set(-4.11, CONST.GAMEHEIGHT / 2 + 0.5, 1);
						else if (mode === 2) {
							let hyphenGeo = new TextGeometry("-", { font: font, size: fontsize, depth: 0.5 });
							p.vars.hyphenMesh.material = textMaterial;
							p.vars.hyphenMesh.position.set(-0.5, CONST.GAMEHEIGHT / 2 + 0.5, 1);
							p.tools.scene.add(p.vars.hyphenMesh);
							p.vars.hyphenMesh.geometry = hyphenGeo;
							textMesh.position.set(2.2, CONST.GAMEHEIGHT / 2 + 0.5, 1);
						}
					}
					else if (mode < 0) {
						// SCORE UPDATE
						const textMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0xdddddd, emissiveIntensity: 0.35, transparent: true, opacity: 0.7 });
						textMesh.material = textMaterial;
						if (mode === -1)
							textMesh.position.set(-7.5 - 1.49 * string.length, CONST.GAMEHEIGHT / 2 - 7, -1.7);
						if (mode === -2)
							textMesh.position.set(7.5, CONST.GAMEHEIGHT / 2 - 7, -1.7);
					}
					else if (mode == 3) {
						// PUs init
						const textMaterial = new THREE.MeshStandardMaterial({ color: p.custom.modes_colormap[5], emissive: p.custom.modes_colormap[5], emissiveIntensity: 0.3 });
						textMesh.material = textMaterial;
						if (id === 0)
							textMesh.position.set(-CONST.GAMEWIDTH / 2 + 1.6, CONST.GAMEHEIGHT / 2 + 2.4, 1)
						else
							textMesh.position.set(CONST.GAMEWIDTH / 2 - 8.5, CONST.GAMEHEIGHT / 2 + 2.4, 1)
					}
					else if (mode === 4) {
						// Tuto display
						const textMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0xdddddd, emissiveIntensity: 0.4 });
						textMesh.material = textMaterial;
						if (id === 0)
							textMesh.position.set(-CONST.GAMEWIDTH / 2 - 8, CONST.GAMEHEIGHT / 2 - 10, 1);
						else
							textMesh.position.set(CONST.GAMEWIDTH / 2 + 4, CONST.GAMEHEIGHT / 2 - 10, 1);
					}
					else if (mode === 4.5) {
						const textMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0xee00ee, emissiveIntensity: 0.15 });
						textMesh.material = textMaterial;
						if (id === 0)
							textMesh.position.set(-CONST.GAMEWIDTH / 2 - 8, CONST.GAMEHEIGHT / 2 - 8.5, 1);
						else
							textMesh.position.set(CONST.GAMEWIDTH / 2 + 4, CONST.GAMEHEIGHT / 2 - 8.5, 1);
					}
					else if (mode == 5) {
						// ENDGAME
						const textMaterial = new THREE.MeshStandardMaterial({ color: 0x227700, emissive: 0x00cc00, emissiveIntensity: 0.25 });
						textMesh.material = textMaterial;
						textMesh.position.set(-11.5, -7, 1.5);
					}
					else if (mode > 5) {
						// PUs update
						const textMaterial = new THREE.MeshStandardMaterial({ color: p.custom.modes_colormap[mode - 6], emissive: p.custom.modes_colormap[mode - 6], emissiveIntensity: 0.3 });
						textMesh.material.dispose();
						textMesh.material = textMaterial;
					}
					if (mode > -3 && mode < 6 && mode != 0)
						p.tools.scene.add(textMesh);
					textMesh.geometry.dispose();
					textMesh.geometry = updatedStringGeo;
				})
			}

			const setBallColor = (p) => {
				const speedDiff = CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED;
				const interpolate = (p.vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / speedDiff;
				let color = Math.min(interpolate * 255, 255) << 16 | 255 * (1 - interpolate);
				const ballMaterial = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.1 });
				p.objs.ball.material.dispose();
				p.objs.ball.material = ballMaterial;
				p.csts.ballLight.color.set(color);
			}

			const scoringLogic = (room_id, socket, isHost, gamemode, handleGameEnded, p, arr, g) => {
				// RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
				if (isHost === true && (p.objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4 || p.objs.ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))) {
					if (p.objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4) {
						p.vars.ballVect.set(-1, 0);
						p.vars.p1Score += 1;
						printGameInfo(p.vars.p1textMesh, p.vars.p1Score.toString(), 0, 0, 2.75, p);
					}
					else {
						p.vars.ballVect.set(1, 0);
						p.vars.p2Score += 1;
						printGameInfo(p.vars.p2textMesh, p.vars.p2Score.toString(), 0, 1, 2.75, p);
					}
					if (p.custom.power_ups === true) {
						for (let i = 0; i < 2; i++) {
							if (arr.activated_powers[i][1] == 2) {
								if (gamemode === 2)
									socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 1 })
								deactivate_power(i, 1, gamemode, p, arr);
							}
							if (arr.activated_powers[i][4] == 2) {
								if (gamemode === 2)
									socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 4 })
								deactivate_power(i, 4, gamemode, p, arr);
							}
						}
					}

					p.objs.ball.position.set(0, 0, 0);
					p.objs.ballWrap.position.set(0, 0, 0);
					p.vars.ballSpeed = CONST.BASE_BALLSPEED;
					p.vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
					p.vars.ai_aim = 0;
					setBallColor(p);
					if (Math.max(p.vars.p1Score, p.vars.p2Score) == p.custom.win_score && p.vars.stopGame == 0)
						p.vars.stopGame = 1;
					if (gamemode === 2)
						socket.emit('sendScore', { room_id: room_id, score1: p.vars.p1Score, score2: p.vars.p2Score, stopGame: p.vars.stopGame });
				}
				if (p.vars.stopGame === 1) {
					if (p.vars.p1Score > p.vars.p2Score)
						p.vars.endString = `GAME ENDED\n${g.p1Name} WINS`;
					else
						p.vars.endString = `GAME ENDED\n${g.p2Name} WINS`;

					printGameInfo(p.vars.endMsgMesh, p.vars.endString, 5, -1, 3, p);
					if (isHost || g.lastConnected === 1) {
						const put_response = PutScores(gamemode, g.game_id, p);
						if (put_response == false)
							console.error("Ouch ! Scores not updated !")
					}
					p.vars.stopGame = 2;
					handleGameEnded();
				}
			}

			const createSparks = (p, arr) => {
				let topDownRebound = p.objs.ball.position.y > 0 ? 1 : -1;

				const vertices = [];
				const speedVecs = [];
				const sizes = [];
				let speedFactor = (p.vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED);
				p.vars.dotProduct = p.vars.ballVect.dot(p.csts.gameVect);
				if (speedFactor < 0.3)
					speedFactor = 0.3;
				const particleSize = Math.max(1., speedFactor * 2.5);
				let x = p.objs.ball.position.x;
				let y = p.objs.ball.position.y + topDownRebound * (CONST.BALLRADIUS * 3 / 2);
				let z = p.objs.ball.position.z;
				let light = new THREE.PointLight(p.objs.ball.material.color, 3, 42);
				light.position.set(x, p.objs.ball.position.y, z);
				let vecx = 0.0;
				let vecy = 0.0;
				let vecz = 0.0;
				for (let i = 0.0; i < speedFactor * Math.abs(p.vars.dotProduct) * 20; i++) {
					vertices.push(x, y, z);
					vecx = THREE.MathUtils.randFloatSpread(0.9 * speedFactor);
					vecy = (THREE.MathUtils.randFloatSpread(0.1 * speedFactor) + 0.1 * speedFactor) * -topDownRebound;
					vecz = THREE.MathUtils.randFloatSpread(0.4 * speedFactor);
					speedVecs.push(vecx, vecy, vecz);
					sizes.push(particleSize * Math.max(1.15 - 4 * Math.sqrt(vecx * vecx + vecy * vecy + vecz * vecz), 0.2));
				}
				const geometry = new THREE.BufferGeometry();
				geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
				geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(speedVecs, 3));
				geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
				const material = new THREE.ShaderMaterial({
					uniforms: sparkUniform,
					vertexShader: sparkVs,
					fragmentShader: sparkFs,
					transparent: true,
					blending: THREE.AdditiveBlending,
					vertexColors: true,
					depthTest: true,
					depthWrite: false
				});
				let points = new THREE.Points(geometry, material);
				const impactTime = performance.now();
				arr.particleEffects.push([points, impactTime, light, true]);
				p.tools.scene.add(points);
				p.tools.scene.add(light);
			}

			const collision_pu_handle = (room_id, socket, gamemode, p, arr) => {
				if ((p.vars.isRebound === 1 && arr.activated_powers[0][1] === 1) || (p.vars.isRebound === 2 && arr.activated_powers[1][1] === 1)) {
					p.vars.adjustedBallSpeed = Math.min(2. * p.vars.adjustedBallSpeed, 1.3 * CONST.BALLSPEED_MAX);
					if (p.vars.isRebound === 1)
						arr.activated_powers[0][1] = 2;
					else
						arr.activated_powers[1][1] = 2;
				}
				else if ((p.vars.isRebound === 1 && arr.activated_powers[1][1] === 2) || (p.vars.isRebound === 2 && arr.activated_powers[0][1] === 2)) {
					let id = 0;
					if (p.vars.isRebound === 1)
						id = 1;
					if (gamemode === 2)
						socket.emit('sendDeactivatePU', { room_id: room_id, player_id: id, type: 1 });
					deactivate_power(id, 1, gamemode, p, arr);
				}
				if ((p.vars.isRebound == 1 && arr.activated_powers[0][3] === 1) || (p.vars.isRebound == 2 && arr.activated_powers[1][3] === 1)) {
					if (p.vars.isRebound == 1) {
						if (gamemode === 2)
							socket.emit('sendInvert', { room_id: room_id })
						arr.power_timers[0][3] = performance.now();
						arr.activated_powers[0][3] = 2;
					}
					else {
						arr.power_timers[1][3] = performance.now();
						arr.activated_powers[1][3] = 2;
					}
				}
				if ((p.vars.isRebound === 1 && arr.activated_powers[0][4] === 1) || (p.vars.isRebound === 2 && arr.activated_powers[1][4] === 1)) {
					if (gamemode === 2)
						socket.emit('sendInvisiball', { room_id: room_id, player_id: p.vars.isRebound - 1 });
					p.objs.ball.visible = false;
					p.objs.ballWrap.visible = false;
					p.csts.ballLight.intensity = 5;
					arr.power_timers[p.vars.isRebound - 1][4] = performance.now();
					arr.activated_powers[p.vars.isRebound - 1][4] = 2;
				}
				else if ((p.vars.isRebound === 1 && arr.activated_powers[1][4] === 2) || (p.vars.isRebound === 2 && arr.activated_powers[0][4] === 2)) {
					let id = 0;
					if (p.vars.isRebound === 1)
						id = 1;
					if (gamemode === 2)
						socket.emit('sendDeactivatePU', { room_id: room_id, player_id: id, type: 4 });
					deactivate_power(id, 4, gamemode, p, arr);
				}
			}

			const collisionLogic = (room_id, socket, gamemode, p, arr) => {
				let p1HB = new THREE.Box3().setFromObject(p.objs.player1);
				let p2HB = new THREE.Box3().setFromObject(p.objs.player2);
				let sph = new THREE.Box3().setFromObject(p.objs.ball);

				// CHECK PLAYER COLLISIONS
				if (p1HB.intersectsBox(sph))
					p.vars.isRebound = 1;
				else if (p2HB.intersectsBox(sph))
					p.vars.isRebound = 2;
				if (p.vars.isRebound > 0) {
					// COMPUTE THE NORMALIZED REBOUND VECTOR
					p.vars.glowStartTime = performance.now();
					if (gamemode === 2)
						socket.emit('sendBounceGlow', { room_id: room_id });
					if (p.vars.isRebound == 1)
						p.vars.reboundDiff = p.objs.player1.position.y - p.objs.ball.position.y;
					else
						p.vars.reboundDiff = p.objs.player2.position.y - p.objs.ball.position.y;
					if (Math.abs(p.vars.reboundDiff) > CONST.PLAYERLEN / 2 + CONST.BALLRADIUS / 2 - 0.3 &&
						(Math.abs(p.objs.ball.position.x - p.objs.player1.position.x) < 0.52 || Math.abs(p.objs.ball.position.x - p.objs.player2.position.x) < 0.52))
						p.vars.ballVect.set(p.objs.ball.position.x / (CONST.GAMEWIDTH / 2), -p.vars.reboundDiff);
					else {
						p.vars.ballVect.x *= -1;
						p.vars.ballVect.y -= p.vars.reboundDiff / 2;
					}
					p.vars.ballVect.normalize();

					// IF THE REBOUND ANDLE IS TOO WIDE, SET IT TO 40 degrees
					p.vars.dotProduct = p.vars.ballVect.dot(p.csts.gameVect);
					p.vars.directions = [1, 1];
					if (p.vars.isRebound == 2)
						p.vars.directions[0] = -1;
					if (p.vars.ballVect.y < 0)
						p.vars.directions[1] = -1;
					if (Math.acos(p.vars.dotProduct * p.vars.directions[0]) * 180 / Math.PI > 90 - CONST.MINREBOUNDANGLE) {
						p.vars.ballVect.set(Math.cos(CONST.MINREBOUNDANGLE * Math.PI / 180) * p.vars.directions[0], Math.sin(CONST.MINREBOUNDANGLE * Math.PI / 180) * p.vars.directions[1]);
						p.vars.ballVect.normalize();
					}

					// ADJUST THE BALL SPEED, WITHOUT GOING OVER OR UNDER THE LIMITS
					if (p.vars.ballSpeed < CONST.BALLSPEED_MAX)
						p.vars.ballSpeed *= CONST.BALLSPEED_INCREMENT;
					p.vars.adjustedBallSpeed *= 1 + (Math.abs(p.vars.reboundDiff) - (CONST.PLAYERLEN / 6)) / 2;
					if (p.vars.adjustedBallSpeed < p.vars.ballSpeed)
						p.vars.adjustedBallSpeed = p.vars.ballSpeed;
					else if (p.vars.adjustedBallSpeed > CONST.BALLSPEED_MAX)
						p.vars.adjustedBallSpeed = CONST.BALLSPEED_MAX;

					// activate the pending power-ups
					if (p.custom.power_ups === true)
						collision_pu_handle(room_id, socket, gamemode, p, arr);
					p.vars.isRebound = 0;

					setBallColor(p);
				}
				// CHECK TOP AND BOT BOUNDARY COLLISIONS
				if (p.csts.topHB.intersectsBox(sph) || p.csts.botHB.intersectsBox(sph)) {
					p.vars.ballVect.y *= -1;
					if (gamemode === 2)
						socket.emit('sendWallCollision', { room_id: room_id });
					if (p.custom.sparks === true && arr.particleEffects.length < 4)
						createSparks(p, arr);
				}

				if (p.custom.power_ups === true) {
					let pu_dir = 0;
					if (p.vars.ballVect.x < 0)
						pu_dir = 1;
					for (let i = 0; i < arr.power_ups.length; i++) {
						if (arr.power_ups[i][4].intersectsBox(sph)) {
							arr.player_power_ups[pu_dir] = arr.power_ups[i][5];
							printGameInfo(p.vars.latentMesh[pu_dir], p.custom.powerUp_names[arr.player_power_ups[pu_dir]], arr.player_power_ups[pu_dir] + 6, pu_dir, 0.85, p);
							if (gamemode === 2) {
								socket.emit('sendCollectPU', { player_id: pu_dir, power_id: arr.power_ups[i][5], room_id: room_id });
								socket.emit('sendDeletePU', { pu_id: arr.power_ups[i][6], room_id: room_id })
							}
							p.tools.scene.remove(arr.power_ups[i][0]);
							arr.power_ups.splice(i, 1);
						}
					}
				}
			}

			const activate_power = (i, mode, p, arr) => {
				if (arr.player_power_ups[i] > -1) {
					arr.activated_powers[i][arr.player_power_ups[i]] = 1;
					p.objs.puGaugeLights[i][arr.player_power_ups[i]].intensity = 400;
					printGameInfo(p.vars.latentMesh[i], "none", 11, i, 0.85, p);
					arr.player_power_ups[i] = -1;
				}
				if (arr.activated_powers[i][0] === 1) {
					arr.power_timers[i][0] = performance.now();
					if (i === 0)
						p.objs.player1.scale.y = 1.4;
					else
						p.objs.player2.scale.y = 1.4;
					p.vars.playerlens[i] *= 1.4;
					arr.activated_powers[i][0] = 2;
				}
				else if (mode === 0 && arr.activated_powers[i][2] === 1) {
					arr.power_timers[i][2] = performance.now();
					p.vars.bulletTime = 0.4;
					arr.activated_powers[i][2] = 2;
				}
			}

			const computeBallMove = (p, arr) => {
				if (p.vars.ballVect.x < 0) {
					if (p.vars.ai_offset != 0)
						p.vars.ai_offset = 0;
					return 0;
				}
				else {
					let d = ((CONST.GAMEWIDTH / 2) - p.objs.ball.position.x) / p.vars.ballVect.x;
					let aim_y = p.objs.ball.position.y + d * p.vars.ballVect.y;
					let tempx = p.objs.ball.position.x;
					let tempy = p.objs.ball.position.y;
					let tempv = new THREE.Vector2(p.vars.ballVect.x, p.vars.ballVect.y);
					let newd = d;
					let ydir = 1;
					while (Math.abs(aim_y) > CONST.GAMEHEIGHT / 2) {
						ydir = tempv.y < 0 ? -1 : 1;
						d = (ydir * (CONST.GAMEHEIGHT / 2) - tempy) / tempv.y;
						tempx += tempv.x * d;
						tempy = ydir * CONST.GAMEHEIGHT / 2;
						tempv.y *= -1;
						newd = ((CONST.GAMEWIDTH / 2) - tempx) / tempv.x;
						aim_y = tempy + newd * tempv.y;
					}
					if (p.vars.ai_offset === 0) {
						if (p.custom.difficulty < 1.3) {
							let randFactor = 6.7 - p.custom.difficulty + p.vars.adjustedBallSpeed / CONST.BALLSPEED_MAX + Math.abs(aim_y - p.objs.ball.position.y) / CONST.GAMEHEIGHT / 2;
							p.vars.ai_offset = THREE.MathUtils.randFloatSpread(randFactor);
						}
						else if (p.custom.difficulty === 1.3)
							p.vars.ai_offset = THREE.MathUtils.randFloatSpread(4);
						else if (p.custom.difficulty > 1.3)
							p.vars.ai_offset = THREE.MathUtils.randFloatSpread(1);
						if (arr.activated_powers[0][4] === 2)
							p.vars.ai_offset *= 2;
					}
					return aim_y + p.vars.ai_offset;
				}
			}

			let keyPressHandle = (keyUp, keyDown, player_id, player_y, invert_controls, p) => {
				const blockLen = CONST.GAMEHEIGHT / 2 - p.vars.playerlens[player_id] / 2;
				if (player_id === 1)
					invert_controls *= p.vars.ai_invert;

				if (p.keys[keyUp] || p.keys[keyDown])
					p.vars.playerspeed[player_id] = Math.min(p.vars.playerspeed[player_id] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
				else
					p.vars.playerspeed[player_id] = CONST.BASE_PLAYERSPEED;

				if (p.keys[keyUp] && ((invert_controls == 1 && player_y < blockLen)
					|| (invert_controls == -1 && player_y > -blockLen))) {
					player_y += p.vars.playerspeed[player_id] * invert_controls;
				}
				if (p.keys[keyDown] && ((invert_controls == -1 && player_y < blockLen)
					|| (invert_controls == 1 && player_y > -blockLen))) {
					player_y -= p.vars.playerspeed[player_id] * invert_controls;
				}
				return player_y;
			}

			let aiMoveHandle = (invert_controls, p) => {
				if (p.objs.player2.position.y > p.vars.ai_aim + 0.5) {
					p.keys['AIdown'] = true;
					p.keys['AIup'] = false;
				}
				else if (p.objs.player2.position.y < p.vars.ai_aim - 0.5) {
					p.keys['AIup'] = true;
					p.keys['AIdown'] = false;
				}
				else {
					if (p.keys['AIdown'] === true)
						p.keys['AIdown'] = false;
					if (p.keys['AIup'] === true)
						p.keys['AIup'] = false;
				}
				return keyPressHandle('AIup', 'AIdown', 1, p.objs.player2.position.y, invert_controls, p);
			}

			let aiPuHandle = (p, arr) => {
				const pu = arr.player_power_ups[1];
				if (pu >= 0) {
					if ((pu === 0 && p.vars.ballVect.x > 0)
						|| (pu === 1 && p.vars.adjustedBallSpeed > 0.8 * CONST.BALLSPEED_MAX)
						|| (pu === 2 && p.vars.ballVect.x > 0 && p.vars.adjustedBallSpeed > 0.9 * CONST.BALLSPEED_MAX
							&& Math.abs(p.vars.ai_aim - p.objs.ball.position.y) > CONST.GAMEHEIGHT / 4 && p.objs.ball.position.x > 0)
						|| pu === 3 || pu === 4) {
						activate_power(1, 0, p, arr);
					}
				}
			}

			const local_update = (gamemode, p, arr) => {
				let invert_controls = [1, 1];
				invert_controls[0] = arr.activated_powers[1][3] === 2 ? -1 : 1;
				invert_controls[1] = arr.activated_powers[0][3] === 2 ? -1 : 1;

				p.objs.player1.position.y = keyPressHandle('KeyW', 'KeyS', 0, p.objs.player1.position.y, invert_controls[0], p);

				if (gamemode === 0)
					p.objs.player2.position.y = keyPressHandle('ArrowUp', 'ArrowDown', 1, p.objs.player2.position.y, invert_controls[1], p);
				else
					p.objs.player2.position.y = aiMoveHandle(invert_controls[1], p);

				if (p.keys['Space'] && p.custom.power_ups === true)
					activate_power(0, 0, p, arr);
				if (p.keys['ArrowRight'] && gamemode === 0 && p.custom.power_ups === true)
					activate_power(1, 0, p, arr);
				else if (gamemode === 1 && p.custom.power_ups === true)
					aiPuHandle(p, arr);

				if (p.keys['KeyC']) {
					p.vars.colorswitch[0] = (p.vars.colorswitch[0] + 1) % 3;
					let ind = p.vars.colorswitch[0];
					const newMat1 = new THREE.MeshStandardMaterial({ color: p.custom.player_colormap[2 * ind], emissive: p.custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
					p.objs.player1.material.dispose();
					p.objs.player1.material = newMat1;
					p.vars.p1TutoTitleText.material.dispose();
					p.vars.p1TutoTitleText.material = newMat1;
					p.keys['KeyC'] = false;
				}
				if (p.keys['ArrowLeft']) {
					p.vars.colorswitch[1] = (p.vars.colorswitch[1] + 1) % 3;
					let ind = p.vars.colorswitch[1];
					const newMat2 = new THREE.MeshStandardMaterial({ color: p.custom.player_colormap[2 * ind], emissive: p.custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
					p.objs.player2.material.dispose();
					p.objs.player2.material = newMat2;
					p.vars.p2TutoTitleText.material.dispose();
					p.vars.p2TutoTitleText.material = newMat2;
					p.keys['ArrowLeft'] = false;
				}
			}

			let remoteKeyPressHandle = (keyUp, keyDown, player_id, player_y, invert_controls, socket, room_id, p) => {
				const blockLen = CONST.GAMEHEIGHT / 2 - p.vars.playerlens[player_id] / 2;

				if (p.keys[keyUp] || p.keys[keyDown])
					p.vars.playerspeed[player_id] = Math.min(p.vars.playerspeed[player_id] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
				else
					p.vars.playerspeed[player_id] = CONST.BASE_PLAYERSPEED;

				if (p.keys[keyUp] && ((invert_controls == 1 && player_y < blockLen)
					|| (invert_controls == -1 && player_y > -blockLen))) {
					player_y += p.vars.playerspeed[player_id] * invert_controls;
				}
				if (p.keys[keyDown] && ((invert_controls == -1 && player_y < blockLen)
					|| (invert_controls == 1 && player_y > -blockLen))) {
					player_y -= p.vars.playerspeed[player_id] * invert_controls;
				}
				if (player_id === 0)
					socket.emit('sendPlayer1Pos', { room_id: room_id, player1pos: player_y });
				else
					socket.emit('sendPlayer2Pos', { room_id: room_id, player2pos: player_y });
				return player_y;
			}

			const remote_update = (socket, room_id, isHost, p, arr, g) => {
				let invert_controls = [1, 1];
				invert_controls[0] = arr.activated_powers[1][3] === 2 ? -1 : 1;
				invert_controls[1] = arr.activated_powers[0][3] === 2 ? -1 : 1;

				if (isHost) {
					p.objs.player1.position.y = remoteKeyPressHandle('KeyW', 'KeyS', 0, p.objs.player1.position.y, invert_controls[0], socket, room_id, p);
					p.objs.player2.position.y = g.opponentPos;

					if (p.keys['Space'] && p.custom.power_ups === true && arr.player_power_ups[0] > -1) {
						socket.emit('sendActivatePU1', { room_id: room_id, powerType: arr.player_power_ups[0] });
						activate_power(0, 0, p, arr);
					}
				}
				else {
					p.objs.player2.position.y = remoteKeyPressHandle('ArrowUp', 'ArrowDown', 1, p.objs.player2.position.y, invert_controls[1], socket, room_id, p);
					p.objs.player1.position.y = g.opponentPos;

					if (p.keys['ArrowRight'] && p.custom.power_ups === true && arr.player_power_ups[1] > -1) {
						socket.emit('sendActivatePU2', { room_id: room_id, powerType: arr.player_power_ups[1] });
						activate_power(1, 1, p, arr);
					}
				}
				if (p.keys['KeyC']) {
					p.vars.colorswitch[0] = (p.vars.colorswitch[0] + 1) % 3;
					let ind = p.vars.colorswitch[0];
					p.objs.player1.material.dispose();
					p.objs.player1.material = new THREE.MeshStandardMaterial({ color: p.custom.player_colormap[2 * ind], emissive: p.custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
					p.keys['KeyC'] = false;
				}
				if (p.keys['ArrowLeft']) {
					p.vars.colorswitch[1] = (p.vars.colorswitch[1] + 1) % 3;
					let ind = p.vars.colorswitch[1];
					p.objs.player2.material.dispose();
					p.objs.player2.material = new THREE.MeshStandardMaterial({ color: p.custom.player_colormap[2 * ind], emissive: p.custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
					p.keys['ArrowLeft'] = false;
				}
			}

			let display_img = (image, mode, p) => {
				const imgGeo = new THREE.CircleGeometry(1.7, 30);
				let path = image;
				if (mode >= 2)
					path = `${BACKEND_URL}${image}`;
				const pp = new THREE.TextureLoader().load(path);
				let op = 0.8;
				if (mode > 1) {
					pp.repeat.set(0.6, 0.9);
					pp.offset.set(0.17, 0.05);
					op = 0.65;
				}
				let xcoord = 8;
				if (mode > 2)
					xcoord = -8;

				const imgMat = new THREE.MeshBasicMaterial({ map: pp, transparent: true, opacity: op });
				const imgDisplay = new THREE.Mesh(imgGeo, imgMat);
				imgDisplay.position.set(xcoord, CONST.GAMEHEIGHT / 2 + 1.6, 1.8);
				p.tools.scene.add(imgDisplay);
			}

			async function PutScores(gameMode, game_id, p) {
				let putPath = 'local';
				if (gameMode >= 2)
					putPath = 'online';
				const response = await fetch(BACKEND_URL + `/api/game/${putPath}/update/${game_id}`,
					{
						method: 'PUT',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRFToken': Cookies.get('csrftoken')
						},
						body: JSON.stringify({
							"score1": p.vars.p1Score,
							"score2": p.vars.p2Score
						})
					})
				if (response.ok) {
					if (isHost && gameMode > 1)
						socket.emit('finalScoreUpdate', { room_id: room_id });
					return true
				}
				return false
			}

			const render_effects = (p, arr) => {
				p.vars.glowElapsed = performance.now() - p.vars.glowStartTime;
				if (p.vars.glowElapsed < 750 && arr.activated_powers[0][4] != 2 && arr.activated_powers[1][4] != 2) {
					if (p.vars.glowElapsed < 100) {
						p.objs.ball.material.emissiveIntensity = 2.;
						p.csts.ballLight.intensity = 30;
					}
					else {
						p.objs.ball.material.emissiveIntensity = 2. - (p.vars.glowElapsed / 750 * 1.7);
						p.csts.ballLight.intensity = 30 - (p.vars.glowElapsed / 750 * 27);
					}
				}

				let particleElapsed = 0;
				for (let i = 0; i < arr.particleEffects.length; i++) {
					particleElapsed = performance.now() - arr.particleEffects[i][1];
					if (particleElapsed > 600 && arr.particleEffects[i][3] === true) {
						p.tools.scene.remove(arr.particleEffects[i][0]);
						arr.particleEffects[i][3] = false;
					}
					if (particleElapsed > 1000) {
						p.tools.scene.remove(arr.particleEffects[i][2]);
						arr.particleEffects.splice(i, 1);
					}
					else {
						let positions = arr.particleEffects[i][0].geometry.attributes.position.array;
						let velocities = arr.particleEffects[i][0].geometry.attributes.velocity.array;
						let initialSpeedBoost = 1.;
						if (particleElapsed < 400)
							initialSpeedBoost += 10 - particleElapsed / 400 * 10;
						if (particleElapsed > 350)
							arr.particleEffects[i][2].intensity = 3 - (particleElapsed - 350) / 650 * 3;
						for (let j = 0; j < positions.length; j += 3) {
							positions[j] += velocities[j] * initialSpeedBoost * (particleElapsed / 1000);
							positions[j + 1] += velocities[j + 1] * initialSpeedBoost * (particleElapsed / 1000);
							positions[j + 2] += velocities[j + 2] * initialSpeedBoost * (particleElapsed / 1000);
						}
						arr.particleEffects[i][0].geometry.attributes.position.needsUpdate = true;
						arr.particleEffects[i][0].geometry.attributes.size.needsUpdate = true;
						sparkUniform.u_time.value = particleElapsed;
					}
				}
			}

			const render_trail = (x, y, p, arr, trail) => {
				let ballFloor = Math.floor(p.objs.ball.position.x * 2.);
				const speedFactor = (p.vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED) / 2.5;

				if (ballFloor != p.vars.ballFloorPos) {
					let segment = new THREE.Mesh(trail.trailGeo.clone(), trail.trailMaterial.clone());
					let direction = 1;
					if (p.vars.ballVect.x > 0) direction = -1;
					segment.position.x = p.objs.ball.position.x - p.vars.ballVect.x * (1. + segment.geometry.parameters.height / 2.);
					segment.position.y = p.objs.ball.position.y - p.vars.ballVect.y * (1. + segment.geometry.parameters.height / 2.);
					segment.rotation.set(0, 0, Math.atan(p.vars.ballVect.y / p.vars.ballVect.x) + Math.PI / 2 * direction);
					segment.scale.y = Math.sqrt(1 + Math.pow(Math.abs(p.vars.ballVect.y / p.vars.ballVect.x), 2.))
						* (1.3 + 2 * speedFactor);
					p.tools.scene.add(segment);
					arr.trailSegments.push([segment, performance.now()]);
					p.vars.ballFloorPos = ballFloor;
				}
				if (arr.trailSegments.length > 0 && performance.now() - arr.trailSegments[0][1] > 120) {
					p.tools.scene.remove(arr.trailSegments[0][0]);
					arr.trailSegments.shift();
				}
				for (let i = 0; i < arr.trailSegments.length; i++) {
					if (Math.abs(arr.trailSegments[i][0].position.y) > CONST.GAMEHEIGHT / 2 - 1.5
						|| arr.activated_powers[0][4] === 2 || arr.activated_powers[1][4] === 2)
						arr.trailSegments[i][0].material.opacity = 0;
					else
						arr.trailSegments[i][0].material.opacity = speedFactor - ((performance.now() - arr.trailSegments[i][1]) / 120 * speedFactor);
					arr.trailSegments[i][0].scale.x = Math.pow(1. - (performance.now() - arr.trailSegments[i][1]) / 120, 1.);
				}

				if (arr.activated_powers[0][4] === 2 || arr.activated_powers[1][4] === 2)
					trail.ballTrail.material.opacity = 0.;
				else {
					trail.ballTrail.position.x = x - p.vars.ballVect.x * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
					trail.ballTrail.position.y = y - p.vars.ballVect.y * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
					trail.ballTrail.rotation.set(0, 0, Math.atan(p.vars.ballVect.y / p.vars.ballVect.x) + Math.PI / 2);
					trail.ballTrail.material.opacity = speedFactor;
				}
			}

			const createPUObject = (powerType, radius, spawnx, spawny, p, arr, g) => {
				const timedelta = Math.random() * 2000;

				let color = new THREE.Vector3(0., 0., 0.);
				if (powerType === 0) color.set(0., 1., 0.2); // longer pad
				else if (powerType === 1) color.set(1., 0., 0.2); // speed boost
				else if (powerType === 2) color.set(0.3, 0.3, 1.); // bullet time
				else if (powerType === 3) color.set(0.8, 0., 0.8); // invert controls
				else color.set(1., 1., 1.);

				let puGeo = new THREE.SphereGeometry(radius, 42, 42)
				let puUniform =
				{
					u_time:
						{ type: 'f', value: performance.now() - g.startTime + timedelta },
					u_color:
						{ type: 'v3', value: color },
					u_spawn:
						{ type: 'f', value: 0 },
					u_fade:
						{ type: 'f', value: 0 },
					u_radius:
						{ type: 'f', value: radius },
				}
				let puMat = new THREE.ShaderMaterial({
					uniforms: puUniform,
					vertexShader: p.csts.pu_vs,
					fragmentShader: p.csts.pu_fs,
					transparent: true,
					blending: THREE.NormalBlending,
				});

				let puBoxGeo = new THREE.BoxGeometry(radius * 1.6);
				let puBoxMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0. });
				let power_up = new THREE.Mesh(puGeo, puMat);
				let pu_box = new THREE.Mesh(puBoxGeo, puBoxMat);
				power_up.position.set(spawnx, spawny, 0);
				power_up.rotation.set(Math.PI / 2, 0, 0);
				pu_box.position.set(spawnx, spawny, 0);

				p.tools.scene.add(power_up);
				const puHB = new THREE.Box3().setFromObject(pu_box);
				arr.power_ups.push([power_up, performance.now(), puUniform, timedelta, puHB, powerType, p.vars.puIdCount]);
				p.vars.puIdCount += 1;
			}

			const createPowerUp = (gamemode, socket, room_id, p, arr, g) => {
				const powerTypeRoll = Math.random() * 10;
				let powerType = -1;
				if (powerTypeRoll < 10 / 3) { powerType = 0; } // longer pad
				else if (powerTypeRoll < 6) { powerType = 1; } // speed boost
				else if (powerTypeRoll < 7.8) { powerType = 2; } // bullet time
				else if (powerTypeRoll < 8.5) { powerType = 3; } // invert controls
				else { powerType = 4; } // invisiball
				const radius = Math.max(0.7, Math.random() * 1.4);
				const spawnx = THREE.MathUtils.randFloatSpread(CONST.GAMEWIDTH * 0.7);
				const spawny = THREE.MathUtils.randFloatSpread(CONST.GAMEHEIGHT * 0.9);
				if (gamemode === 2)
					socket.emit('sendCreatePU', { pu_id: p.vars.puIdCount, type: powerType, radius: radius, x: spawnx, y: spawny, room_id: room_id });
				createPUObject(powerType, radius, spawnx, spawny, p, arr, g);
			}

			const deactivate_power = (player_id, type, gamemode, p, arr) => {
				arr.activated_powers[player_id][type] = 0;
				p.objs.puGaugeLights[player_id][type].intensity = 0;
				if (type === 0) {
					if (player_id === 0)
						p.objs.player1.scale.y = 1;
					else
						p.objs.player2.scale.y = 1;
					p.vars.playerlens[player_id] = CONST.PLAYERLEN;
					arr.activated_powers[player_id][0] = 0;
					p.objs.puGaugeLights[player_id][0].intensity = 0;
				}
				else if (type === 3) {
					arr.activated_powers[player_id][3] = 0;
					p.objs.puGaugeLights[player_id][3].intensity = 0;
					if (player_id === 0 && gamemode === 1)
						p.vars.ai_invert = 1;
				}
				else if (type === 4) {
					p.objs.ball.visible = true;
					p.objs.ballWrap.visible = true;
					p.csts.ballLight.intensity = 5;
				}
			}

			const check_pu_timers = (gamemode, socket, room_id, p, arr) => {
				const timestamp = performance.now()
				for (let i = 0; i < 2; i++) {
					if (arr.activated_powers[i][0] === 2 && timestamp - arr.power_timers[i][0] > 10000) {
						if (gamemode === 2)
							socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 0 });
						deactivate_power(i, 0, gamemode, p, arr);
					}
					if (arr.activated_powers[i][2] === 2 && timestamp - arr.power_timers[i][2] > 5000) {
						if (gamemode === 2)
							socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 2 })
						deactivate_power(i, 2, gamemode, p, arr);
					}
					if (arr.activated_powers[i][3] === 2) {
						if (timestamp - arr.power_timers[i][3] > 10000) {
							if (gamemode === 2)
								socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 3 })
							deactivate_power(i, 3, gamemode, p, arr);
						}
						else if (i === 0 && gamemode === 1 && timestamp - arr.power_timers[i][3] > 10000 - 6000 * p.custom.difficulty)
							p.vars.ai_invert = -1;
					}
				}
				if (p.vars.bulletTime < 1 && arr.activated_powers[0][2] === 0 && arr.activated_powers[1][2] === 0)
					p.vars.bulletTime = 1;
			}

			const create_delete_pu = (isHost, gamemode, socket, room_id, p, arr, g) => {
				let puTimer = performance.now() - g.startTime;
				if (isHost === true && puTimer - p.vars.puTimeSave > CONST.PU_TICK) {
					p.vars.puTimeSave = puTimer;
					const spawnChance = Math.random() - (1 - (p.vars.puChanceCounter / 10));
					if (spawnChance > 0) {
						createPowerUp(gamemode, socket, room_id, p, arr, g);
						p.vars.puChanceCounter = 1;
					}
					else
						p.vars.puChanceCounter += 1;
				}
				let checkTime = 0;
				for (let i = 0; i < arr.power_ups.length; i++) {
					arr.power_ups[i][2].u_time.value = performance.now() - g.startTime + arr.power_ups[i][3];
					checkTime = performance.now() - arr.power_ups[i][1];
					if (checkTime < 1000)
						arr.power_ups[i][2].u_spawn.value = checkTime;
					else if (arr.power_ups[i][2].u_spawn.value > 0)
						arr.power_ups[i][2].u_spawn.value = -1;

					if (isHost === true && checkTime > CONST.PU_LIFESPAN) {
						p.tools.scene.remove(arr.power_ups[i][0]);
						if (gamemode === 2)
							socket.emit('sendDeletePU', { pu_id: arr.power_ups[i][6], room_id: room_id });
						arr.power_ups.splice(i, 1);
					}
					else if (checkTime > CONST.PU_LIFESPAN * 2 / 3)
						arr.power_ups[i][2].u_fade.value = checkTime - CONST.PU_LIFESPAN * 2 / 3
				}
			}

			const animate = (socket, room_id, isHost, gamemode, handleGameEnded, animationFrameIdRef, stopAnim, p, arr, g, trail, testbool) => {
				if (stopAnim.current === true) {
					return;
				}
				if (isHost)
					collisionLogic(room_id, socket, gamemode, p, arr);
				scoringLogic(room_id, socket, isHost, gamemode, handleGameEnded, p, arr, g);

				if (p.vars.stopGame > 0)
					p.vars.ballVect.set(0, 0);
				if (isHost) {
					p.objs.ball.position.x += p.vars.ballVect.x * p.vars.adjustedBallSpeed * p.custom.difficulty * p.vars.bulletTime;
					p.objs.ball.position.y += p.vars.ballVect.y * p.vars.adjustedBallSpeed * p.custom.difficulty * p.vars.bulletTime;
					if (p.custom.power_ups === true)
						check_pu_timers(gamemode, socket, room_id, p, arr);
					if (gamemode === 1) {
						const ai_time = performance.now();
						if (ai_time - p.vars.ai_timer >= 1000) {
							p.vars.ai_timer = ai_time;
							p.vars.ai_aim = computeBallMove(p, arr);
						}
					}
					else if (gamemode === 2)
						socket.emit('sendBallPos', { x: p.objs.ball.position.x, y: p.objs.ball.position.y, vectx: p.vars.ballVect.x, vecty: p.vars.ballVect.y, speed: p.vars.adjustedBallSpeed, room_id: room_id })
				}
				for (let i = 0; i < 2; i++) {
					if (arr.activated_powers[i][4] === 2)
						p.csts.ballLight.intensity = Math.max(0., Math.cos((performance.now() - arr.power_timers[i][4]) / 80) * 5);
				}

				const x = p.objs.ball.position.x;
				const y = p.objs.ball.position.y;
				p.objs.ballWrap.position.x = x;
				p.objs.ballWrap.position.y = y;
				p.csts.ballLight.position.x = x;
				p.csts.ballLight.position.y = y;
				if (testbool.current === false && (x > 2 || x < -2))
					testbool.current = true;

				render_trail(x, y, p, arr, trail);
				render_effects(p, arr);
				if (p.custom.power_ups === true)
					create_delete_pu(isHost, gamemode, socket, room_id, p, arr, g);

				if (gamemode === 2)
					remote_update(socket, room_id, isHost, p, arr, g);
				else
					local_update(gamemode, p, arr);
				// p.tools.controls.update();

				p.uniformData.u_time.value = performance.now() - g.startTime;
				p.tools.renderer.render(p.tools.scene, p.tools.camera);
				setTimeout(function () {
					animationFrameIdRef.current = requestAnimationFrame(() => animate(socket, room_id, isHost, gamemode, handleGameEnded, animationFrameIdRef, stopAnim, p, arr, g, trail, testbool));
				}, 5);
			}

			// CUT
			const init_socket = (socket, isHost, p, arr, g) => {
				if (isHost) {
					socket.on('updatePlayer2Pos', position => {
						g.opponentPos = position.player2pos;
					})
					socket.on('updateActivatePU2', data => {
						if (data.powerType === arr.player_power_ups[1])
							activate_power(1, 0, p, arr);
					})
				}
				else {
					socket.on('setPlayerInfos', data => {
						g.p1Name = data.g.p1Name;
						g.p2Name = data.g.p2Name;
						display_img(data.p1p, 2);
						display_img(data.p2p, 3);
						game_id = data.game_id;
					})
					socket.on('updatePlayer1Pos', position => {
						g.opponentPos = position.player1pos;
					});
					socket.on('updateBallPos', data => {
						p.objs.ball.position.x = data.x;
						p.objs.ball.position.y = data.y;
						p.vars.ballVect.x = data.vectx;
						p.vars.ballVect.y = data.vecty;
						if (p.vars.adjustedBallSpeed != data.speed) {
							p.vars.adjustedBallSpeed = data.speed;
							setBallColor(p);
						}
					});
					socket.on('startBounceGlow', () => {
						p.vars.glowStartTime = performance.now();
					});
					socket.on('newWallCollision', () => {
						if (p.custom.sparks === true && arr.particleEffects.length < 4)
							createSparks(p, arr);
					});
					socket.on('updateScore', data => {
						if (data.score1 > p.vars.p1Score) {
							p.vars.p1Score = data.score1;
							printGameInfo(p.vars.p1textMesh, p.vars.p1Score.toString(), 0, 0, 2.75, p);
						}
						else {
							p.vars.p2Score = data.score2;
							printGameInfo(p.vars.p2textMesh, p.vars.p2Score.toString(), 0, 1, 2.75, p);
						}
						setBallColor(p);
						p.vars.stopGame = data.stopGame;
					});
					socket.on('updateCreatePU', data => {
						if (data.pu_id === p.vars.puIdCount)
							createPUObject(data.powerType, data.radius, data.spawnx, data.spawny, p, arr, g);
					})
					socket.on('updateCollectPU', data => {
						const pl = data.player_id;
						arr.player_power_ups[pl] = data.powerType;
						printGameInfo(p.vars.latentMesh[pl], p.custom.powerUp_names[data.powerType], arr.player_power_ups[pl] + 6, pl, 0.85, p);
					})
					socket.on('updateActivatePU1', data => {
						// if (data.powerType === player_powerUps[0])
						activate_power(0, 1, p, arr);
					})
					socket.on('updateInvisiball', data => {
						p.objs.ball.visible = false;
						p.objs.ballWrap.visible = false;
						p.csts.ballLight.intensity = 5;
						arr.power_timers[data.id][4] = performance.now();
						arr.activated_powers[data.id][4] = 2;
					})
					socket.on('updateInvert', () => {
						arr.activated_powers[0][3] = 2;
					})
					socket.on('updateDeactivatePU', data => {
						deactivate_power(data.player_id, data.type, 2, p, arr);
					})
					socket.on('updateDeletePU', data => {
						for (let j = 0; j < arr.power_ups.length; j++) {
							if (arr.power_ups[j][6] === data.pu_id) {
								p.tools.scene.remove(arr.power_ups[j][0]);
								arr.power_ups.splice(j, 1);
								break;
							}
						}
					})
					socket.on('noFinalUpdate', () => {
						g.lastConnected = 2;
					})
				}
				socket.on('playerDisconnected', () => {
					if (isHost) {
						p.vars.p1Score = p.custom.win_score;
						p.vars.p2Score = 0;
					}
					else {
						p.vars.p2Score = p.custom.win_score;
						p.vars.p1Score = 0;
						if (g.lastConnected === 0)
							g.lastConnected = 1;
					}
					p.vars.stopGame = 1;
				});
			}

			const getColorVector3 = (bgColor) => {
				const hex = bgColor.replace(/^#/, '');
				const colorInt = parseInt(hex, 16);

				let r = colorInt >> 16 & 255;
				let g = colorInt >> 8 & 255;
				let b = colorInt & 255;

				return new THREE.Vector3(r / 255, g / 255, b / 255);
			}
			if (!containerRef.current) return;


			p.tools.scene = new THREE.Scene();
			p.tools.renderer = new THREE.WebGLRenderer({ canvas: containerRef.current });
			p.tools.renderer.setSize(window.innerWidth, window.innerHeight);
			// p.tools.controls = new OrbitControls(p.tools.camera, p.tools.renderer.domElement);
			p.tools.stats = Stats()

			p.tools.scene.add(p.objs.ball);
			p.tools.scene.add(p.objs.ballWrap);
			p.tools.scene.add(p.objs.player1);
			p.tools.scene.add(p.objs.player2);
			p.tools.scene.add(p.objs.topB);
			p.tools.scene.add(p.objs.botB);
			p.tools.scene.add(p.objs.backB);
			// p.tools.scene.add( p.objs.background );
			p.tools.scene.add(p.objs.display);

			p.tools.scene.add(p.csts.ambLight);
			p.tools.scene.add(p.csts.dirLight);
			p.tools.scene.add(p.csts.dirLight2);
			p.tools.scene.add(p.csts.ballLight);

			p.tools.camera.position.set(p.custom.classicCamPos.x, p.custom.classicCamPos.y, p.custom.classicCamPos.z);
			p.tools.camera.lookAt(0, 2.2, 0);

			g.p1Name = gameInfos.p1Name;
			if (g.p1Name.length > 8)
				g.p1Name = g.p1Name.slice(0, 8) + ".";
			g.p2Name = gameInfos.p2Name;
			if (g.p2Name.length > 8)
				g.p2Name = g.p2Name.slice(0, 8) + ".";
			printGameInfo(p.csts.p1nameMesh, g.p1Name, -1, -1, 2.5, p);
			printGameInfo(p.csts.p2nameMesh, g.p2Name, -2, -1, 2.5, p);
			display_img(gameInfos.p1p, 3, p);
			display_img(gameInfos.p2p, gamemode, p);

			let backgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);

			let decorFilePath = '';
			let backgroundMaterial;
			if (gameSettings.background > 3) {
				if (gameSettings.background == 4)
					decorFilePath = '/snow.jpg'
				else if (gameSettings.background == 5)
					decorFilePath = '/city.jpg'
				const landscape = new THREE.TextureLoader().load(decorFilePath);
				backgroundMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: landscape });
			}
			else {
				let b = p.custom.b_default
				if (gameSettings.background == 1)
					b = p.custom.b_lightsquares;
				else if (gameSettings.background == 2)
					b = p.custom.b_waves;
				else if (gameSettings.background == 3)
					b = p.custom.b_fractcircles;
				p.uniformData.u_palette.value = gameSettings.palette;
				p.uniformData.u_color.value = getColorVector3(gameSettings.bgColor);
				backgroundMaterial = new THREE.ShaderMaterial({
					side: THREE.BackSide,
					uniforms: p.uniformData,
					fragmentShader: p.custom.shader_utils + b
				});
			}
			let background = new THREE.Mesh(backgroundGeo, backgroundMaterial);

			p.objs.backB.material.opacity = gameSettings.opacity / 100;
			p.custom.difficulty = 0.3 + gameSettings.game_difficulty / 6;
			p.custom.win_score = gameSettings.points_to_win;
			p.custom.power_ups = gameSettings.power_ups;
			p.custom.sparks = gameSettings.sparks;

			if (gamemode === 1)
				p.vars.ai_timer = g.startTime;

			trail.trailGeo = new THREE.CylinderGeometry(0.4 * CONST.BALLRADIUS, 0.3 * CONST.BALLRADIUS, 0.6, 30, 1, true);
			trail.trailMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true });
			trail.ballTrail = new THREE.Mesh(trail.trailGeo, trail.trailMaterial);
			trail.ballTrail.scale.y = 0.4;
			trail.ballTrail.position.set(1.2 + trail.ballTrail.geometry.parameters.height / 2., 0, 0);
			trail.ballTrail.rotation.set(0, 0, Math.PI / 2);

			p.tools.scene.add(background);
			p.tools.scene.add(trail.ballTrail);
			for (let i = 0; i < 5; i++) {
				p.tools.scene.add(p.objs.puGauges[0][i])
				p.tools.scene.add(p.objs.puGauges[1][i])
				p.tools.scene.add(p.objs.puGaugeDiscs[0][i])
				p.tools.scene.add(p.objs.puGaugeDiscs[1][i])
				p.tools.scene.add(p.objs.puGaugeLights[0][i])
				p.tools.scene.add(p.objs.puGaugeLights[1][i])
			}

			// ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
			printGameInfo(p.vars.p1textMesh, "0", 1, -1, 2.75, p);
			printGameInfo(p.vars.p2textMesh, "0", 2, -1, 2.75, p);
			if (isHost) {
				printGameInfo(p.vars.p1TutoText, p.csts.tutoP1, 4, 0, 0.8, p);
				printGameInfo(p.vars.p1TutoTitleText, p.csts.tutoTitles, 4.5, 0, 0.8, p);
			}
			if (!isHost || gamemode === 0) {
				printGameInfo(p.vars.p2TutoText, p.csts.tutoP2, 4, 1, 0.8, p);
				printGameInfo(p.vars.p2TutoTitleText, p.csts.tutoTitles, 4.5, 1, 0.8, p);
			}

			if (p.custom.power_ups === true) {
				printGameInfo(p.vars.latentMesh[0], "none", 3, 0, 0.85, p);
				printGameInfo(p.vars.latentMesh[1], "none", 3, 1, 0.85, p);
			}


			const handleKeyDown = (event) => {
				p.keys[event.code] = true;
			}

			const handleKeyUp = (event) => {
				p.keys[event.code] = false;
			}

			if (gamemode >= 2)
				init_socket(socket, isHost, p, arr, g);
			if (gamemode < 2 || (gamemode === 2 && socket && user_id)) {
				animate(socket, room_id, isHost, gamemode, handleGameEnded, animationFrameIdRef, stopAnim, p, arr, g, trail, testbool);
			}

			if (typeof window !== 'undefined') {
				window.addEventListener('keydown', handleKeyDown);
				window.addEventListener('keyup', handleKeyUp);
			}

			return (() => {
				// notanimating = true

				cancelAnimationFrame(animationFrameIdRef.current);
				if (typeof window !== 'undefined') {
					window.removeEventListener('keydown', handleKeyDown);
					window.removeEventListener('keyup', handleKeyUp);
				}
				p.tools.renderer.dispose();
				// p.tools.camera.dispose();
				// p.tools.scene.dispose();

				const objectsToRemove = [];
				p.tools.scene.traverse((object) => {
					if (object.isMesh) {
						if (object.geometry) {
							object.geometry.dispose();
						}
						if (object.material) {
							object.material.dispose();
						}
					}
					objectsToRemove.push(object);
				});

				objectsToRemove.forEach((object) => { p.tools.scene.remove(object); })
				if (p.tools.stats && p.tools.stats.dom && p.tools.stats.dom.parentNode) {
					p.tools.stats.dom.parentNode.removeChild(p.tools.stats.dom);
				}
				if (testbool.current === true)
					stopAnim.current = true;
				// Disconnect socket if necessary

				// if (socket)
				// 	socket.disconnect();
				// containerRef.current.remove();
				// containerRef.current = null;
			})
		}
	}, []);

	return (
		<div className="d-flex position-absolute top-0 left-0" style={{ height: '100%', height: '100%' }}>
			<canvas ref={containerRef} />
		</div>
	)
};