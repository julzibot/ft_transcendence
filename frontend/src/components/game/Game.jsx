import React, { useRef, useEffect, useContext } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as CONST from '../../utils/constants';
import { vars, objs, csts, custom } from '../../utils/init';
import { useSocketContext } from '../../context/socket';

let keys = {};
const tools = {};
const trail = {};
const particleEffects = [];
const trailSegments = [];
const powerUps = [];
// const modes_colormap = [0x00ff33, 0xff0022, 0x4c4cff, 0xcc00cc, 0xffffff, 0x888888]
let player_powerUps = [-1, -1];
let activated_powers = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
let power_timers = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
let opponentPos = 0.;
let game_id = 0;
let p1Name = "";
let p2Name = "";
let put_response = false;
const startTime = performance.now();
tools.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const uniformData = {
	u_time:
		{ type: 'f', value: performance.now() - startTime },
	u_color:
		{ type: 'v3', value: custom.color },
	u_palette:
		{ type: 'i', value: custom.palette },
	u_resolution:
		{ type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
	projectionMatrix:
		{ value: tools.camera.projectionMatrix },
	viewMatrix:
		{ value: tools.camera.matrixWorldInverse }
};

const sparkUniform = {
	u_time:
		{ type: 'f', value: 0. },
	u_texture:
		{ type: 't', value: new THREE.TextureLoader().load('../../spark.png') }
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
      vec4 decay = vec4(1., 1., 1., 1. - u_time / 800.);
      gl_FragColor = color * decay;
    }
`;

function printGameInfo(textMesh, string, mode, id, fontsize) {
	csts.loader.load(CONST.FONTPATH + CONST.FONTNAME, function (font) {
		let updatedStringGeo = new TextGeometry(string, { font: font, size: fontsize, height: 0.5 });
		if (mode === 0 && ((vars.scorePlaceAdjust[id] === 0 && parseInt(string, 10) > 9) || (id === 0 && vars.scorePlaceAdjust[id] === 1 && parseInt(string, 10) > 19))) {
			if (id === 0 && vars.scorePlaceAdjust[0] === 0)
				textMesh.position.set(-4.91, CONST.GAMEHEIGHT / 2 + 0.5, 1);
			else if (id === 0 && vars.scorePlaceAdjust[0] === 1)
				textMesh.position.set(-5.31, CONST.GAMEHEIGHT / 2 + 0.5, 1);
			else
				textMesh.position.set(1.5, CONST.GAMEHEIGHT / 2 + 0.5, 1);
			vars.scorePlaceAdjust[id] += 1;
		}
		else if (mode > 0 && mode < 3) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: 0x0000cc, emissive: 0xee00ee, emissiveIntensity: 0.3 });
			textMesh.material = textMaterial;
			if (mode == 1)
				textMesh.position.set(-4.11, CONST.GAMEHEIGHT / 2 + 0.5, 1);
			else if (mode == 2) {
				let hyphenGeo = new TextGeometry("-", { font: font, size: fontsize, height: 0.5 });
				vars.hyphenMesh.material = textMaterial;
				vars.hyphenMesh.position.set(-0.5, CONST.GAMEHEIGHT / 2 + 0.5, 1);
				tools.scene.add(vars.hyphenMesh);
				vars.hyphenMesh.geometry = hyphenGeo;
				textMesh.position.set(2.2, CONST.GAMEHEIGHT / 2 + 0.5, 1);
			}
		}
		else if (mode < 0) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0xdddddd, emissiveIntensity: 0.35, transparent: true, opacity: 0.7 });
			textMesh.material = textMaterial;
			if (mode === -1)
				textMesh.position.set(-7.5 - 1.49 * string.length, CONST.GAMEHEIGHT / 2 - 7, -1.7);
			if (mode === -2)
				textMesh.position.set(7.5, CONST.GAMEHEIGHT / 2 - 7, -1.7);
		}
		else if (mode == 3) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: custom.modes_colormap[5], emissive: custom.modes_colormap[5], emissiveIntensity: 0.3 });
			textMesh.material = textMaterial;
			if (id === 0)
				textMesh.position.set(-CONST.GAMEWIDTH / 2 + 1.6, CONST.GAMEHEIGHT / 2 + 2.4, 1)
			else
				textMesh.position.set(CONST.GAMEWIDTH / 2 - 8.5, CONST.GAMEHEIGHT / 2 + 2.4, 1)
		}
		else if (mode == 4) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: custom.modes_colormap[5], emissive: custom.modes_colormap[5], emissiveIntensity: 0.3 });
			textMesh.material = textMaterial;
			if (id === 0)
				textMesh.position.set(-CONST.GAMEWIDTH / 2 + 1, CONST.GAMEHEIGHT / 2 + 0.75, 1)
			else
				textMesh.position.set(CONST.GAMEWIDTH / 2 - 7, CONST.GAMEHEIGHT / 2 + 0.75, 1)
		}
		else if (mode == 5) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: 0x227700, emissive: 0x00cc00, emissiveIntensity: 0.25 });
			textMesh.material = textMaterial;
			textMesh.position.set(-11.5, -7, -1.5);
		}
		else if (mode > 5) {
			const textMaterial = new THREE.MeshStandardMaterial({ color: custom.modes_colormap[mode - 6], emissive: custom.modes_colormap[mode - 6], emissiveIntensity: 0.3 });
			textMesh.material.dispose();
			textMesh.material = textMaterial;
		}
		if (mode > -3 && mode < 6 && mode != 0)
			tools.scene.add(textMesh);
		textMesh.geometry.dispose();
		textMesh.geometry = updatedStringGeo;
	})
}

const setBallColor = () => {
	const speedDiff = CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED;
	const interpolate = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / speedDiff;
	let color = Math.min(interpolate * 255, 255) << 16 | 255 * (1 - interpolate);
	const ballMaterial = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.1 });
	objs.ball.material.dispose();
	objs.ball.material = ballMaterial;
	csts.ballLight.color.set(color);
}

// CUT
const scoringLogic = (room_id, socket, isHost, gamemode) => {
	// RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
	if (isHost === true && (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4 || objs.ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))) {
		if (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4) {
			vars.ballVect.set(-1, 0);
			vars.p1Score += 1;
			printGameInfo(vars.p1textMesh, vars.p1Score.toString(), 0, 0, 2.75);
		}
		else {
			vars.ballVect.set(1, 0);
			vars.p2Score += 1;
			printGameInfo(vars.p2textMesh, vars.p2Score.toString(), 0, 1, 2.75);
		}
		if (custom.power_ups === true) {
			for (let i = 0; i < 2; i++) {
				if (activated_powers[i][1] == 2) {
					if (gamemode === 2)
						socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 1 })
					deactivate_power(i, 1, gamemode);
				}
				if (activated_powers[i][4] == 2) {
					if (gamemode === 2)
						socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 4 })
					deactivate_power(i, 4, gamemode);
				}
			}
		}

		objs.ball.position.set(0, 0, 0);
		objs.ballWrap.position.set(0, 0, 0);
		vars.ballSpeed = CONST.BASE_BALLSPEED;
		vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
		vars.ai_aim = 0;
		setBallColor();
		if (Math.max(vars.p1Score, vars.p2Score) == custom.win_score && vars.stopGame == 0)
			vars.stopGame = 1;
		if (gamemode === 2)
			socket.emit('sendScore', { room_id: room_id, score1: vars.p1Score, score2: vars.p2Score, stopGame: vars.stopGame });
	}
	if (vars.stopGame === 1) {
		if (vars.p1Score > vars.p2Score)
			vars.endString = `GAME ENDED\n${p1Name} WINS`;
		else
			vars.endString = `GAME ENDED\n${p2Name} WINS`;
		printGameInfo(vars.endMsgMesh, vars.endString, 5, -1, 3);
		put_response = PutScores(gamemode);
		if (put_response == false)
			console.log("Ouch ! Scores not updated !")
		vars.stopGame = 2;
	}
}

const createSparks = () => {
	let topDownRebound = objs.ball.position.y > 0 ? 1 : 0;

	const vertices = [];
	const speedVecs = [];
	const sizes = [];
	let speedFactor = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED);
	vars.dotProduct = vars.ballVect.dot(csts.gameVect);
	if (speedFactor < 0.3)
		speedFactor = 0.3;
	const particleSize = Math.max(1., speedFactor * 3.);
	// console.log("speedfactor: " + speedFactor);
	let x = objs.ball.position.x;
	let y = objs.ball.position.y + topDownRebound * (CONST.BALLRADIUS * 3 / 2);
	let z = objs.ball.position.z;
	let light = new THREE.PointLight(objs.ball.material.color, 15, 42);
	light.position.set(x, y, z);
	let vecx = 0.0;
	let vecy = 0.0;
	let vecz = 0.0;
	for (let i = 0.0; i < speedFactor * Math.abs(vars.dotProduct) * 25; i++) {
		vertices.push(x, y, z);
		vecx = THREE.MathUtils.randFloatSpread(0.8 * speedFactor);
		vecy = (THREE.MathUtils.randFloatSpread(0.1 * speedFactor) + 0.1 * speedFactor) * -topDownRebound;
		vecz = THREE.MathUtils.randFloatSpread(0.5 * speedFactor);
		speedVecs.push(vecx, vecy, vecz);
		sizes.push(particleSize * Math.max(1.3 * speedFactor - 4 * Math.sqrt(vecx * vecx + vecy * vecy + vecz * vecz), 0.3));
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
	particleEffects.push([points, impactTime, light]);
	tools.scene.add(points);
	tools.scene.add(light);
}

// CUT
const collision_pu_handle = (room_id, socket, gamemode) => {
	if ((vars.isRebound === 1 && activated_powers[0][1] === 1) || (vars.isRebound === 2 && activated_powers[1][1] === 1)) {
		vars.adjustedBallSpeed = Math.min(2. * vars.adjustedBallSpeed, 1.3 * CONST.BALLSPEED_MAX);
		if (vars.isRebound === 1)
			activated_powers[0][1] = 2;
		else
			activated_powers[1][1] = 2;
	}
	else if ((vars.isRebound === 1 && activated_powers[1][1] === 2) || (vars.isRebound === 2 && activated_powers[0][1] === 2)) {
		let id = 0;
		if (vars.isRebound === 1)
			id = 1;
		if (gamemode === 2)
			socket.emit('sendDeactivatePU', { room_id: room_id, player_id: id, type: 1 });
		deactivate_power(id, 1, gamemode);
	}
	if ((vars.isRebound == 1 && activated_powers[0][3] === 1) || (vars.isRebound == 2 && activated_powers[1][3] === 1)) {
		if (vars.isRebound == 1) {
			if (gamemode === 2)
				socket.emit('sendInvert', { room_id: room_id })
			power_timers[0][3] = performance.now();
			activated_powers[0][3] = 2;
		}
		else {
			power_timers[1][3] = performance.now();
			activated_powers[1][3] = 2;
		}
	}
	if ((vars.isRebound === 1 && activated_powers[0][4] === 1) || (vars.isRebound === 2 && activated_powers[1][4] === 1)) {
		if (gamemode === 2)
			socket.emit('sendInvisiball', { room_id: room_id, player_id: vars.isRebound - 1 });
		objs.ball.visible = false;
		objs.ballWrap.visible = false;
		csts.ballLight.intensity = 5;
		power_timers[vars.isRebound - 1][4] = performance.now();
		activated_powers[vars.isRebound - 1][4] = 2;
	}
	else if ((vars.isRebound === 1 && activated_powers[1][4] === 2) || (vars.isRebound === 2 && activated_powers[0][4] === 2)) {
		let id = 0;
		if (vars.isRebound === 1)
			id = 1;
		if (gamemode === 2)
			socket.emit('sendDeactivatePU', { room_id: room_id, player_id: id, type: 4 });
		deactivate_power(id, 4, gamemode);
	}
}

// CUT
const collisionLogic = (room_id, socket, gamemode) => {
	let p1HB = new THREE.Box3().setFromObject(objs.player1);
	let p2HB = new THREE.Box3().setFromObject(objs.player2);
	let sph = new THREE.Box3().setFromObject(objs.ball);

	// CHECK PLAYER COLLISIONS
	if (p1HB.intersectsBox(sph))
		vars.isRebound = 1;
	else if (p2HB.intersectsBox(sph))
		vars.isRebound = 2;
	if (vars.isRebound > 0) {
		// COMPUTE THE NORMALIZED REBOUND VECTOR
		vars.glowStartTime = performance.now();
		if (gamemode === 2)
			socket.emit('sendBounceGlow', { room_id: room_id });
		if (vars.isRebound == 1)
			vars.reboundDiff = objs.player1.position.y - objs.ball.position.y;
		else
			vars.reboundDiff = objs.player2.position.y - objs.ball.position.y;
		if (Math.abs(vars.reboundDiff) > CONST.PLAYERLEN / 2 + CONST.BALLRADIUS / 2 - 0.3 &&
			(Math.abs(objs.ball.position.x - objs.player1.position.x) < 0.52 || Math.abs(objs.ball.position.x - objs.player2.position.x) < 0.52))
			vars.ballVect.set(objs.ball.position.x / (CONST.GAMEWIDTH / 2), -vars.reboundDiff);
		else {
			vars.ballVect.x *= -1;
			vars.ballVect.y -= vars.reboundDiff / 2;
		}
		vars.ballVect.normalize();

		// IF THE REBOUND ANDLE IS TOO WIDE, SET IT TO 40 degrees
		vars.dotProduct = vars.ballVect.dot(csts.gameVect);
		vars.directions = [1, 1];
		if (vars.isRebound == 2)
			vars.directions[0] = -1;
		if (vars.ballVect.y < 0)
			vars.directions[1] = -1;
		if (Math.acos(vars.dotProduct * vars.directions[0]) * 180 / Math.PI > 90 - CONST.MINREBOUNDANGLE) {
			vars.ballVect.set(Math.cos(CONST.MINREBOUNDANGLE * Math.PI / 180) * vars.directions[0], Math.sin(CONST.MINREBOUNDANGLE * Math.PI / 180) * vars.directions[1]);
			vars.ballVect.normalize();
		}

		// ADJUST THE BALL SPEED, WITHOUT GOING OVER OR UNDER THE LIMITS
		if (vars.ballSpeed < CONST.BALLSPEED_MAX)
			vars.ballSpeed *= CONST.BALLSPEED_INCREMENT;
		vars.adjustedBallSpeed *= 1 + (Math.abs(vars.reboundDiff) - (CONST.PLAYERLEN / 6)) / 2;
		if (vars.adjustedBallSpeed < vars.ballSpeed)
			vars.adjustedBallSpeed = vars.ballSpeed;
		else if (vars.adjustedBallSpeed > CONST.BALLSPEED_MAX)
			vars.adjustedBallSpeed = CONST.BALLSPEED_MAX;

		// activate the pending power-ups
		if (custom.power_ups === true)
			collision_pu_handle(room_id, socket, gamemode);
		vars.isRebound = 0;

		setBallColor();
	}
	// CHECK TOP AND BOT BOUNDARY COLLISIONS
	if (csts.topHB.intersectsBox(sph) || csts.botHB.intersectsBox(sph)) {
		vars.ballVect.y *= -1;
		if (gamemode === 2)
			socket.emit('sendWallCollision', { room_id: room_id });
		if (custom.sparks === true && particleEffects.length < 4)
			createSparks();
	}

	if (custom.power_ups === true) {
		let pu_dir = 0;
		if (vars.ballVect.x < 0)
			pu_dir = 1;
		for (let i = 0; i < powerUps.length; i++) {
			if (powerUps[i][4].intersectsBox(sph)) {
				player_powerUps[pu_dir] = powerUps[i][5];
				printGameInfo(vars.latentMesh[pu_dir], custom.powerUp_names[player_powerUps[pu_dir]], player_powerUps[pu_dir] + 6, pu_dir, 0.85);
				if (gamemode === 2) {
					socket.emit('sendCollectPU', { player_id: pu_dir, power_id: powerUps[i][5], room_id: room_id });
					socket.emit('sendDeletePU', { pu_id: powerUps[i][6], room_id: room_id })
				}
				tools.scene.remove(powerUps[i][0]);
				powerUps.splice(i, 1);
			}
		}
	}
}

const activate_power = (i, mode) => {
	if (player_powerUps[i] > -1) {
		activated_powers[i][player_powerUps[i]] = 1;
		objs.puGaugeLights[i][player_powerUps[i]].intensity = 400;
		printGameInfo(vars.latentMesh[i], "none", 11, i, 0.85);
		player_powerUps[i] = -1;
	}
	if (activated_powers[i][0] === 1) {
		power_timers[i][0] = performance.now();
		if (i === 0)
			objs.player1.scale.y = 1.4;
		else
			objs.player2.scale.y = 1.4;
		vars.playerlens[i] *= 1.4;
		activated_powers[i][0] = 2;
	}
	else if (mode === 0 && activated_powers[i][2] === 1) {
		power_timers[i][2] = performance.now();
		vars.bulletTime = 0.4;
		activated_powers[i][2] = 2;
	}
}

const computeBallMove = () => {
	if (vars.ballVect.x < 0) {
		if (vars.ai_offset != 0)
			vars.ai_offset = 0;
		return 0;
	}
	else {
		let d = ((CONST.GAMEWIDTH / 2) - objs.ball.position.x) / vars.ballVect.x;
		let aim_y = objs.ball.position.y + d * vars.ballVect.y;
		let tempx = objs.ball.position.x;
		let tempy = objs.ball.position.y;
		let tempv = new THREE.Vector2(vars.ballVect.x, vars.ballVect.y);
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
		if (vars.ai_offset === 0) {
			if (custom.difficulty < 1.3) {
				let randFactor = 6.7 - custom.difficulty + vars.adjustedBallSpeed / CONST.BALLSPEED_MAX + Math.abs(aim_y - objs.ball.position.y) / CONST.GAMEHEIGHT / 2;
				vars.ai_offset = THREE.MathUtils.randFloatSpread(randFactor);
			}
			else if (custom.difficulty === 1.3)
				vars.ai_offset = THREE.MathUtils.randFloatSpread(5);
			else if (custom.difficulty > 1.3)
				vars.ai_offset = THREE.MathUtils.randFloatSpread(3);
			if (activated_powers[0][4] === 2)
				vars.ai_offset *= 2;
		}
		return aim_y + vars.ai_offset;
	}
}

let keyPressHandle = (keyUp, keyDown, player_id, player_y, invert_controls) => {
	const blockLen = CONST.GAMEHEIGHT / 2 - vars.playerlens[player_id] / 2;
	if (player_id === 1)
		invert_controls *= vars.ai_invert;

	if (keys[keyUp] || keys[keyDown])
		vars.playerspeed[player_id] = Math.min(vars.playerspeed[player_id] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
	else
		vars.playerspeed[player_id] = CONST.BASE_PLAYERSPEED;

	if (keys[keyUp] && ((invert_controls == 1 && player_y < blockLen)
		|| (invert_controls == -1 && player_y > -blockLen))) {
		player_y += vars.playerspeed[player_id] * invert_controls;
	}
	if (keys[keyDown] && ((invert_controls == -1 && player_y < blockLen)
		|| (invert_controls == 1 && player_y > -blockLen))) {
		player_y -= vars.playerspeed[player_id] * invert_controls;
	}
	return player_y;
}

let aiMoveHandle = (invert_controls) => {
	if (objs.player2.position.y > vars.ai_aim + 0.2) {
		keys['AIdown'] = true;
		keys['AIup'] = false;
	}
	else if (objs.player2.position.y < vars.ai_aim - 0.2) {
		keys['AIup'] = true;
		keys['AIdown'] = false;
	}
	else {
		if (keys['AIdown'] === true)
			keys['AIdown'] = false;
		if (keys['AIup'] === true)
			keys['AIup'] = false;
	}
	return keyPressHandle('AIup', 'AIdown', 1, objs.player2.position.y, invert_controls);
}

let aiPuHandle = () => {
	const pu = player_powerUps[1];
	if (pu >= 0) {
		if ((pu === 0 && vars.ballVect.x > 0)
			|| (pu === 1 && vars.adjustedBallSpeed > 0.8 * CONST.BALLSPEED_MAX)
			|| (pu === 2 && vars.ballVect.x > 0 && vars.adjustedBallSpeed > 0.9 * CONST.BALLSPEED_MAX
				&& Math.abs(vars.ai_aim - objs.ball.position.y) > CONST.GAMEHEIGHT / 4 && objs.ball.position.x > 0)
			|| pu === 3 || pu === 4) {
			activate_power(1, 0);
		}
	}
}

const local_update = (gamemode) => {
	let invert_controls = [1, 1];
	invert_controls[0] = activated_powers[1][3] === 2 ? -1 : 1;
	invert_controls[1] = activated_powers[0][3] === 2 ? -1 : 1;

	objs.player1.position.y = keyPressHandle('KeyW', 'KeyS', 0, objs.player1.position.y, invert_controls[0]);

	if (gamemode === 0)
		objs.player2.position.y = keyPressHandle('ArrowUp', 'ArrowDown', 1, objs.player2.position.y, invert_controls[1]);
	else
		objs.player2.position.y = aiMoveHandle(invert_controls[1]);

	if (keys['Space'] && custom.power_ups === true)
		activate_power(0, 0);
	if (keys['ArrowRight'] && gamemode === 0 && custom.power_ups === true)
		activate_power(1, 0);
	else if (gamemode === 1 && custom.power_ups === true)
		aiPuHandle();

	if (keys['KeyC']) {
		vars.colorswitch[0] = (vars.colorswitch[0] + 1) % 3;
		let ind = vars.colorswitch[0];
		objs.player1.material.dispose();
		objs.player1.material = new THREE.MeshStandardMaterial({ color: custom.player_colormap[2 * ind], emissive: custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
		keys['KeyC'] = false;
	}
	if (keys['ArrowLeft']) {
		vars.colorswitch[1] = (vars.colorswitch[1] + 1) % 3;
		let ind = vars.colorswitch[1];
		objs.player2.material.dispose();
		objs.player2.material = new THREE.MeshStandardMaterial({ color: custom.player_colormap[2 * ind], emissive: custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
		keys['ArrowLeft'] = false;
	}
}

let remoteKeyPressHandle = (keyUp, keyDown, player_id, player_y, invert_controls, socket, room_id) => {
	const blockLen = CONST.GAMEHEIGHT / 2 - vars.playerlens[player_id] / 2;

	if (keys[keyUp] || keys[keyDown])
		vars.playerspeed[player_id] = Math.min(vars.playerspeed[player_id] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
	else
		vars.playerspeed[player_id] = CONST.BASE_PLAYERSPEED;

	if (keys[keyUp] && ((invert_controls == 1 && player_y < blockLen)
		|| (invert_controls == -1 && player_y > -blockLen))) {
		player_y += vars.playerspeed[player_id] * invert_controls;
	}
	if (keys[keyDown] && ((invert_controls == -1 && player_y < blockLen)
		|| (invert_controls == 1 && player_y > -blockLen))) {
		player_y -= vars.playerspeed[player_id] * invert_controls;
	}
	if (player_id === 0)
		socket.emit('sendPlayer1Pos', { room_id: room_id, player1pos: player_y });
	else
		socket.emit('sendPlayer2Pos', { room_id: room_id, player2pos: player_y });
	return player_y;
}

const remote_update = (socket, room_id, isHost) => {
	let invert_controls = [1, 1];
	invert_controls[0] = activated_powers[1][3] === 2 ? -1 : 1;
	invert_controls[1] = activated_powers[0][3] === 2 ? -1 : 1;

	if (isHost) {
		objs.player1.position.y = remoteKeyPressHandle('KeyW', 'KeyS', 0, objs.player1.position.y, invert_controls[0], socket, room_id);
		objs.player2.position.y = opponentPos;

		if (keys['Space'] && custom.power_ups === true && player_powerUps[0] > -1) {
			socket.emit('sendActivatePU1', { room_id: room_id, powerType: player_powerUps[0] });
			activate_power(0, 0);
		}
	}
	else {
		objs.player2.position.y = remoteKeyPressHandle('ArrowUp', 'ArrowDown', 1, objs.player2.position.y, invert_controls[1], socket, room_id);
		objs.player1.position.y = opponentPos;

		if (keys['ArrowRight'] && custom.power_ups === true && player_powerUps[1] > -1) {
			socket.emit('sendActivatePU2', { room_id: room_id, powerType: player_powerUps[1] });
			activate_power(1, 1);
		}
	}
	if (keys['KeyC']) {
		vars.colorswitch[0] = (vars.colorswitch[0] + 1) % 3;
		let ind = vars.colorswitch[0];
		objs.player1.material.dispose();
		objs.player1.material = new THREE.MeshStandardMaterial({ color: custom.player_colormap[2 * ind], emissive: custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
		keys['KeyC'] = false;
	}
	if (keys['ArrowLeft']) {
		vars.colorswitch[1] = (vars.colorswitch[1] + 1) % 3;
		let ind = vars.colorswitch[1];
		objs.player2.material.dispose();
		objs.player2.material = new THREE.MeshStandardMaterial({ color: custom.player_colormap[2 * ind], emissive: custom.player_colormap[2 * ind + 1], emissiveIntensity: 0.15 });
		keys['ArrowLeft'] = false;
	}
}

let display_img = (image, mode) => {
	const imgGeo = new THREE.CircleGeometry(1.7, 30);
	const pp = new THREE.TextureLoader().load(CONST.BASE_URL_2 + `${image}`);
	let xcoord = 8;

	if (mode > 1) {
		pp.repeat.set(0.6, 0.9);
		pp.offset.set(0.17, 0.05);
		const imgMat = new THREE.MeshBasicMaterial({ map: pp, transparent: true, opacity: 0.5 });
		const imgDisplay = new THREE.Mesh(imgGeo, imgMat);
		tools.scene.add(imgDisplay);
	}
	else if (mode <= 1) {
		const imgMat = new THREE.MeshBasicMaterial({ map: pp, transparent: true, opacity: 0.8 });
		const imgDisplay = new THREE.Mesh(imgGeo, imgMat);
		tools.scene.add(imgDisplay);
	}
	if (mode > 2)
		xcoord = -8;
	imgDisplay.position.set(xcoord, CONST.GAMEHEIGHT / 2 + 1.6, 1.8);
}

async function CreateGame(user_id, player2_id, game_mode) {
	console.log("CreateGame called");
	if (game_mode === 1)
		player2_id = -1
	const response = await fetch(CONST.BASE_URL + 'game/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			'player1': user_id,
			'player2': player2_id,
			'game_mode': game_mode
		})
	})
	if (response.status === 201) {
		const res = await response.json()
		return parseInt(res.id)
	}
	else
		return (-1)
}

async function getPlayerInfos(socket, room_id) {
	const response = await fetch(CONST.BASE_URL + `game/history/${game_id}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	})
	if (response.ok) {
		const res = await response.json();
		const data = res.data;
		// console.log(JSON.stringify(data));
		// const imgGeo = new THREE.CircleGeometry(1.7, 30);

		// PLAYER 1
		p1Name = data.player1.username;
		if (p1Name.length > 8)
			p1Name = p1Name.slice(0, 8) + ".";
		printGameInfo(csts.p1nameMesh, p1Name, -1, -1, 2.5);
		display_img(data.player1.image, 2);

		//PLAYER 2
		if (data.player2) {
			p2Name = data.player2.username;
			if (p2Name.length > 8)
				p2Name = p2Name.slice(0, 8) + ".";
			printGameInfo(csts.p2nameMesh, p2Name, -2, -1, 2.5);
			display_img(data.player2.image, 3);
		}
		socket.emit('sendPlayerInfos', { room_id: room_id, p1Name: p1Name, p2Name: p2Name, p1p: p1p, p2p: p2p, game_id: game_id });
	}
	else
		return (-1)
}

async function PutScores(gameMode) {
	let putPath = 'local';
	if (gameMode >= 2)
		putPath = 'online';
	const response = await fetch(CONST.BASE_URL + `game/${putPath}/update/${game_id}`,
		{
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				"score1": vars.p1Score,
				"score2": vars.p2Score
			})
		})
	if (response.ok)
		return true
	return false
}

async function assignId(id) {
	game_id = id;
	console.log(game_id + ": game_id assigned")
}

const render_effects = () => {
	vars.glowElapsed = performance.now() - vars.glowStartTime;
	if (vars.glowElapsed < 750 && activated_powers[0][4] != 2 && activated_powers[1][4] != 2) {
		if (vars.glowElapsed < 100) {
			objs.ball.material.emissiveIntensity = 0.95;
			csts.ballLight.intensity = 15;
		}
		else {
			objs.ball.material.emissiveIntensity = 0.95 - (vars.glowElapsed / 750 * 0.7);
			csts.ballLight.intensity = 15 - (vars.glowElapsed / 750 * 10);
		}
	}

	let particleElapsed = 0;
	for (let i = 0; i < particleEffects.length; i++) {
		particleElapsed = performance.now() - particleEffects[i][1];
		if (particleElapsed > 600) {
			tools.scene.remove(particleEffects[0][0]);
			if (particleElapsed > 1000) {
				tools.scene.remove(particleEffects[0][2]);
				particleEffects.shift();
			}
		}
		else {
			let positions = particleEffects[i][0].geometry.attributes.position.array;
			let velocities = particleEffects[i][0].geometry.attributes.velocity.array;
			let initialSpeedBoost = 1.;
			if (particleElapsed < 250)
				initialSpeedBoost += 1 - particleElapsed / 250;
			for (let j = 0; j < positions.length; j += 3) {
				positions[j] += velocities[j] * initialSpeedBoost * (particleElapsed / 1000);
				positions[j + 1] += velocities[j + 1] * initialSpeedBoost * (particleElapsed / 1000);
				positions[j + 2] += velocities[j + 2] * initialSpeedBoost * (particleElapsed / 1000);
			}
			particleEffects[i][0].geometry.attributes.position.needsUpdate = true;
			particleEffects[i][0].geometry.attributes.size.needsUpdate = true;
			if (particleElapsed > 250)
				sparkUniform.u_time.value = particleElapsed;
		}
	}
}

const render_trail = (x, y) => {
	let ballFloor = Math.floor(objs.ball.position.x * 2.);
	const speedFactor = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED) / 2.5;

	if (ballFloor != vars.ballFloorPos) {
		// let segment = trail.ballTrail.clone();
		let segment = new THREE.Mesh(trail.trailGeo.clone(), trail.trailMaterial.clone());
		let direction = 1;
		if (vars.ballVect.x > 0) direction = -1;
		segment.position.x = objs.ball.position.x - vars.ballVect.x * (1. + segment.geometry.parameters.height / 2.);
		segment.position.y = objs.ball.position.y - vars.ballVect.y * (1. + segment.geometry.parameters.height / 2.);
		segment.rotation.set(0, 0, Math.atan(vars.ballVect.y / vars.ballVect.x) + Math.PI / 2 * direction);
		segment.scale.y = Math.sqrt(1 + Math.pow(Math.abs(vars.ballVect.y / vars.ballVect.x), 2.))
			* (1.1 + speedFactor * 0.6);
		tools.scene.add(segment);
		trailSegments.push([segment, performance.now()]);
		vars.ballFloorPos = ballFloor;
	}
	if (trailSegments.length > 0 && performance.now() - trailSegments[0][1] > 120) {
		tools.scene.remove(trailSegments[0][0]);
		trailSegments.shift();
	}
	for (let i = 0; i < trailSegments.length; i++) {
		if (Math.abs(trailSegments[i][0].position.y) > CONST.GAMEHEIGHT / 2 - 1.5
			|| activated_powers[0][4] === 2 || activated_powers[1][4] === 2)
			trailSegments[i][0].material.opacity = 0;
		else
			trailSegments[i][0].material.opacity = speedFactor - ((performance.now() - trailSegments[i][1]) / 120 * speedFactor);
		trailSegments[i][0].scale.x = Math.pow(1. - (performance.now() - trailSegments[i][1]) / 120, 1.);
	}

	if (activated_powers[0][4] === 2 || activated_powers[1][4] === 2)
		trail.ballTrail.material.opacity = 0.;
	else {
		trail.ballTrail.position.x = x - vars.ballVect.x * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
		trail.ballTrail.position.y = y - vars.ballVect.y * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
		trail.ballTrail.rotation.set(0, 0, Math.atan(vars.ballVect.y / vars.ballVect.x) + Math.PI / 2);
		trail.ballTrail.material.opacity = speedFactor;
	}
}

const createPUObject = (powerType, radius, spawnx, spawny) => {
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
			{ type: 'f', value: performance.now() - startTime + timedelta },
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
		vertexShader: csts.pu_vs,
		fragmentShader: csts.pu_fs,
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

	tools.scene.add(power_up);
	const puHB = new THREE.Box3().setFromObject(pu_box);
	powerUps.push([power_up, performance.now(), puUniform, timedelta, puHB, powerType, vars.puIdCount]);
	vars.puIdCount += 1;
}

const createPowerUp = (gamemode, socket, room_id) => {
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
	// powerType = 3; color.set(0.8, 0., 0.8);
	if (gamemode === 2)
		socket.emit('sendCreatePU', { pu_id: vars.puIdCount, type: powerType, radius: radius, x: spawnx, y: spawny, room_id: room_id });
	createPUObject(powerType, radius, spawnx, spawny);
}

const deactivate_power = (player_id, type, gamemode) => {
	activated_powers[player_id][type] = 0;
	objs.puGaugeLights[player_id][type].intensity = 0;
	if (type === 0) {
		if (player_id === 0)
			objs.player1.scale.y = 1;
		else
			objs.player2.scale.y = 1;
		vars.playerlens[player_id] = CONST.PLAYERLEN;
		activated_powers[player_id][0] = 0;
		objs.puGaugeLights[player_id][0].intensity = 0;
	}
	else if (type === 3) {
		activated_powers[player_id][3] = 0;
		objs.puGaugeLights[player_id][3].intensity = 0;
		if (player_id === 0 && gamemode === 1)
			vars.ai_invert = 1;
	}
	else if (type === 4) {
		objs.ball.visible = true;
		objs.ballWrap.visible = true;
		csts.ballLight.intensity = 5;
	}
}

const check_pu_timers = (gamemode, socket, room_id) => {
	const timestamp = performance.now()
	for (let i = 0; i < 2; i++) {
		if (activated_powers[i][0] === 2 && timestamp - power_timers[i][0] > 10000) {
			if (gamemode === 2)
				socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 0 });
			deactivate_power(i, 0, gamemode);
		}
		if (activated_powers[i][2] === 2 && timestamp - power_timers[i][2] > 5000) {
			if (gamemode === 2)
				socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 2 })
			deactivate_power(i, 2, gamemode);
		}
		if (activated_powers[i][3] === 2) {
			if (timestamp - power_timers[i][3] > 10000) {
				if (gamemode === 2)
					socket.emit('sendDeactivatePU', { room_id: room_id, player_id: i, type: 3 })
				deactivate_power(i, 3, gamemode);
			}
			else if (i === 0 && gamemode === 1 && timestamp - power_timers[i][3] > 10000 - 6000 * custom.difficulty)
				vars.ai_invert = -1;
		}
	}
	if (vars.bulletTime < 1 && activated_powers[0][2] === 0 && activated_powers[1][2] === 0)
		vars.bulletTime = 1;
}

const create_delete_pu = (isHost, gamemode, socket, room_id) => {
	let puTimer = performance.now() - startTime;
	if (isHost === true && puTimer - vars.puTimeSave > CONST.PU_TICK) {
		vars.puTimeSave = puTimer;
		const spawnChance = Math.random() - (1 - (vars.puChanceCounter / 10));
		if (spawnChance > 0) {
			createPowerUp(gamemode, socket, room_id);
			vars.puChanceCounter = 1;
		}
		else
			vars.puChanceCounter += 1;
	}
	let checkTime = 0;
	for (let i = 0; i < powerUps.length; i++) {
		powerUps[i][2].u_time.value = performance.now() - startTime + powerUps[i][3];
		checkTime = performance.now() - powerUps[i][1];
		if (checkTime < 1000)
			powerUps[i][2].u_spawn.value = checkTime;
		else if (powerUps[i][2].u_spawn.value > 0)
			powerUps[i][2].u_spawn.value = -1;

		if (isHost === true && checkTime > CONST.PU_LIFESPAN) {
			tools.scene.remove(powerUps[i][0]);
			if (gamemode === 2)
				socket.emit('sendDeletePU', { pu_id: powerUps[i][6], room_id: room_id });
			powerUps.splice(i, 1);
		}
		else if (checkTime > CONST.PU_LIFESPAN * 2 / 3)
			powerUps[i][2].u_fade.value = checkTime - CONST.PU_LIFESPAN * 2 / 3
	}
}

// CUT
const animate = (socket, room_id, isHost, gamemode) => {
	if (isHost)
		collisionLogic(room_id, socket, gamemode);
	scoringLogic(room_id, socket, isHost, gamemode);

	if (vars.stopGame > 0)
		vars.ballVect.set(0, 0);

	if (isHost === true) {
		objs.ball.position.x += vars.ballVect.x * vars.adjustedBallSpeed * custom.difficulty * vars.bulletTime;
		objs.ball.position.y += vars.ballVect.y * vars.adjustedBallSpeed * custom.difficulty * vars.bulletTime;
		if (custom.power_ups === true)
			check_pu_timers(gamemode, socket, room_id);
		if (gamemode === 1) {
			const ai_time = performance.now();
			if (ai_time - vars.ai_timer >= 1000) {
				vars.ai_timer = ai_time;
				vars.ai_aim = computeBallMove();
			}
		}
		else if (gamemode === 2)
			socket.emit('sendBallPos', { x: objs.ball.position.x, y: objs.ball.position.y, vectx: vars.ballVect.x, vecty: vars.ballVect.y, speed: vars.adjustedBallSpeed, room_id: room_id })
	}
	for (let i = 0; i < 2; i++) {
		if (activated_powers[i][4] === 2)
			csts.ballLight.intensity = Math.max(0., Math.cos((performance.now() - power_timers[i][4]) / 80) * 5);
	}

	const x = objs.ball.position.x;
	const y = objs.ball.position.y;
	objs.ballWrap.position.x = x;
	objs.ballWrap.position.y = y;
	csts.ballLight.position.x = x;
	csts.ballLight.position.y = y;

	render_trail(x, y);
	render_effects();
	if (custom.power_ups === true)
		create_delete_pu(isHost, gamemode, socket, room_id);

	if (gamemode === 2)
		remote_update(socket, room_id, isHost);
	else
		local_update(gamemode);
	// tools.controls.update();
	tools.stats.update();

	uniformData.u_time.value = performance.now() - startTime;
	tools.renderer.render(tools.scene, tools.camera);

	setTimeout(function () {
		requestAnimationFrame(() => animate(socket, room_id, isHost, gamemode));
	}, 5);
}

// CUT
const init_socket = (socket, isHost) => {
	if (isHost) {
		socket.on('updatePlayer2Pos', position => {
			opponentPos = position.player2pos;
		})
		socket.on('updateActivatePU2', data => {
			if (data.powerType === player_powerUps[1])
				activate_power(1, 0);
		})
	}
	else {
		socket.on('setPlayerInfos', data => {
			p1Name = data.p1Name;
			p2Name = data.p2Name;
			display_img(data.p1p, 2);
			display_img(data.p2p, 3);
			game_id = data.game_id;
		})
		socket.on('updatePlayer1Pos', position => {
			opponentPos = position.player1pos;
		});
		socket.on('updateBallPos', data => {
			objs.ball.position.x = data.x;
			objs.ball.position.y = data.y;
			vars.ballVect.x = data.vectx;
			vars.ballVect.y = data.vecty;
			if (vars.adjustedBallSpeed != data.speed) {
				vars.adjustedBallSpeed = data.speed;
				setBallColor();
			}
		});
		socket.on('startBounceGlow', () => {
			vars.glowStartTime = performance.now();
		});
		socket.on('newWallCollision', () => {
			createSparks();
		});
		socket.on('updateScore', data => {
			if (data.score1 > vars.p1Score) {
				vars.p1Score = data.score1;
				printGameInfo(vars.p1textMesh, vars.p1Score.toString(), 0, 0, 2.75);
			}
			else {
				vars.p2Score = data.score2;
				printGameInfo(vars.p2textMesh, vars.p2Score.toString(), 0, 1, 2.75);
			}
			setBallColor();
			vars.stopGame = data.stopGame;
		});
		socket.on('updateCreatePU', data => {
			console.log("PU CREATION SIGNAL");
			if (data.pu_id === vars.puIdCount)
				createPUObject(data.powerType, data.radius, data.spawnx, data.spawny);
		})
		socket.on('updateCollectPU', data => {
			const p = data.player_id;
			player_powerUps[p] = data.powerType;
			printGameInfo(vars.latentMesh[p], custom.powerUp_names[data.powerType], player_powerUps[p] + 6, p, 0.85);
		})
		socket.on('updateActivatePU1', data => {
			// if (data.powerType === player_powerUps[0])
			activate_power(0, 1);
		})
		socket.on('updateInvisiball', data => {
			objs.ball.visible = false;
			objs.ballWrap.visible = false;
			csts.ballLight.intensity = 5;
			power_timers[data.id][4] = performance.now();
			activated_powers[data.id][4] = 2;
		})
		socket.on('updateInvert', () => {
			activated_powers[0][3] = 2;
		})
		socket.on('updateDeactivatePU', data => {
			deactivate_power(data.player_id, data.type, 2);
		})
		socket.on('updateDeletePU', data => {
			console.log("PU DESTRUCTION SIGNAL");
			for (let j = 0; j < powerUps.length; j++) {
				if (powerUps[j][6] === data.pu_id) {
					tools.scene.remove(powerUps[j][0]);
					powerUps.splice(j, 1);
					break;
				}
			}
		})
	}
}

const getColorVector3 = (bgColor) => {
	const hex = bgColor.replace(/^#/, '');
	const colorInt = parseInt(hex, 16);

	let r = colorInt >> 16 & 255;
	let g = colorInt >> 8 & 255;
	let b = colorInt & 255;

	return new THREE.Vector3(r / 255, g / 255, b / 255);
}

// CUT
// 0 -> local multiplayer
// 1 -> AI
// 2 -> remote
// 3 -> Tournament (?)
export default function ThreeScene({ gameInfos, gameSettings, room_id, user_id, isHost, gamemode }) {
	console.log(JSON.stringify(gameInfos));
	const containerRef = useRef(null);
	let socket = -1;
	if (gamemode === 2)
		socket = useSocketContext();
	// if (isHost)
	//   CreateGame(user_id, player2_id, gamemode).then(assignId).then(getPlayerInfos);
	// if (gamemode < 2)
	// {
	//   let p2Name = "";
	//   if (gamemode === 0)
	//     p2Name = "guest";
	//   else if (gamemode === 1)
	//     p2Name = "ai";
	//   printGameInfo(csts.p2nameMesh, p2Name, -2, -1, 3.5);
	// }

	useEffect(() => {

		tools.scene = new THREE.Scene();

		tools.renderer = new THREE.WebGLRenderer({ canvas: containerRef.current });
		tools.renderer.setSize(window.innerWidth, window.innerHeight);
		tools.controls = new OrbitControls(tools.camera, tools.renderer.domElement);
		tools.stats = Stats()
		document.body.appendChild(tools.renderer.domElement);
		document.body.appendChild(tools.stats.dom);

		tools.scene.add(objs.ball);
		tools.scene.add(objs.ballWrap);
		tools.scene.add(objs.player1);
		tools.scene.add(objs.player2);
		tools.scene.add(objs.topB);
		tools.scene.add(objs.botB);
		tools.scene.add(objs.backB);
		// tools.scene.add( objs.background );
		tools.scene.add(objs.display);

		tools.scene.add(csts.ambLight);
		tools.scene.add(csts.dirLight);
		tools.scene.add(csts.dirLight2);
		tools.scene.add(csts.ballLight);

		let quaternion = new THREE.Quaternion();
		tools.camera.position.set(custom.classicCamPos.x, custom.classicCamPos.y, custom.classicCamPos.z);
		// quaternion.setFromAxisAngle(custom.classicCamPos.clone().normalize(), -Math.PI / 2);
		// tools.camera.quaternion.multiplyQuaternions(quaternion, tools.camera.quaternion);
		tools.camera.lookAt(0, 2.2, 0);

		// if (isHost)
		// 	CreateGame(user_id, player2_id, gamemode).then(assignId).then(getPlayerInfos(socket, room_id));
		if (gamemode < 2) {
			let pp = "";
			if (gamemode === 0) {
				p2Name = "guest";
				pp = "../../guest.png";
			}
			else if (gamemode === 1) {
				p2Name = "ai";
				pp = "../../airobot.png"
			}
			printGameInfo(csts.p2nameMesh, p2Name, -2, -1, 2.5);
			display_img(pp, gamemode);
		}

		let backgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);
		// console.log(tools.camera.projectionMatrix);

		let decorFilePath = '';
		let backgroundMaterial;
		if (gameSettings.background > 3) {
			if (gameSettings.background == 4)
				decorFilePath = '../../snow.jpg'
			else if (gameSettings.background == 5)
				decorFilePath = '../../city.jpg'
			const landscape = new THREE.TextureLoader().load(decorFilePath);
			backgroundMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: landscape });
		}
		else {
			let b = custom.b_default
			if (gameSettings.background == 1)
				b = custom.b_lightsquares;
			else if (gameSettings.background == 2)
				b = custom.b_waves;
			else if (gameSettings.background == 3)
				b = custom.b_fractcircles;
			uniformData.u_palette.value = gameSettings.palette;
			uniformData.u_color.value = getColorVector3(gameSettings.bgColor);
			backgroundMaterial = new THREE.ShaderMaterial({
				side: THREE.BackSide,
				uniforms: uniformData,
				fragmentShader: custom.shader_utils + b
			});
		}
		let background = new THREE.Mesh(backgroundGeo, backgroundMaterial);

		objs.backB.material.opacity = gameSettings.opacity / 100;
		custom.difficulty = 0.3 + gameSettings.gameDifficulty / 6;
		custom.win_score = gameSettings.pointsToWin;
		custom.power_ups = gameSettings.powerUps;
		custom.sparks = gameSettings.sparks;

		if (gamemode === 1)
			vars.ai_timer = startTime;

		trail.trailGeo = new THREE.CylinderGeometry(0.4 * CONST.BALLRADIUS, 0.3 * CONST.BALLRADIUS, 0.6, 30, 1, true);
		trail.trailMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true });
		trail.ballTrail = new THREE.Mesh(trail.trailGeo, trail.trailMaterial);
		trail.ballTrail.scale.y = 0.4;
		trail.ballTrail.position.set(1.2 + trail.ballTrail.geometry.parameters.height / 2., 0, 0);
		trail.ballTrail.rotation.set(0, 0, Math.PI / 2);

		tools.scene.add(background);
		tools.scene.add(trail.ballTrail);
		for (let i = 0; i < 5; i++) {
			tools.scene.add(objs.puGauges[0][i])
			tools.scene.add(objs.puGauges[1][i])
			tools.scene.add(objs.puGaugeDiscs[0][i])
			tools.scene.add(objs.puGaugeDiscs[1][i])
			tools.scene.add(objs.puGaugeLights[0][i])
			tools.scene.add(objs.puGaugeLights[1][i])
		}
		// tools.scene.add(objs.puGaugePanels[0]);
		// tools.scene.add(objs.puGaugePanels[1]);

		// ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
		printGameInfo(vars.p1textMesh, "0", 1, -1, 2.75);
		printGameInfo(vars.p2textMesh, "0", 2, -1, 2.75);
		if (custom.power_ups === true) {
			printGameInfo(vars.latentMesh[0], "none", 3, 0, 0.85);
			printGameInfo(vars.latentMesh[1], "none", 3, 1, 0.85);
		}

		document.addEventListener('keydown', function (event) { keys[event.code] = true; });
		document.addEventListener('keyup', function (event) { keys[event.code] = false; });

		if (gamemode === 2)
			init_socket(socket, isHost);
		if (gamemode < 2 || (gamemode === 2 && socket && user_id))
			animate(socket, room_id, isHost, gamemode);
	}, []);
	return <canvas className='fixed-top' ref={containerRef} />;
};