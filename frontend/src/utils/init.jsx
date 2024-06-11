import * as THREE from 'three';
import * as CONST from './constants';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { shaders } from './shaders';

export const objs = {};
export const csts = {};
export const vars = {};
export const custom = {};

// GAME CUSTOM PARAMS

custom.pov = "classic";
custom.immersiveCamPos = new THREE.Vector3(-CONST.GAMEWIDTH / 2 - 10, 0, 18);
custom.shader_utils = shaders.utils;
custom.background = shaders.background_skybox;
custom.color = new THREE.Vector3(0.2, 0.7, 0.6);
custom.palette = 2;
custom.difficulty = 1.;
custom.win_score = 200;
custom.backboard_opacity = 0.6;
custom.power_ups = false;

// GAME INIT

objs.sphereGeo = new THREE.SphereGeometry(CONST.BALLRADIUS, 40, 40);
objs.ballGeo = new THREE.SphereGeometry(CONST.BALLRADIUS * 3/2, 40, 40);
objs.playerGeo = new THREE.BoxGeometry(0.5, CONST.PLAYERLEN, 0.6);
objs.upDownBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 0.5, 3.0);
// objs.BackgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);
objs.backBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, CONST.GAMEHEIGHT, 0.5)
// objs.trailGeo = new THREE.CylinderGeometry(0.8 * CONST.BALLRADIUS, 0.8 * CONST.BALLRADIUS, 0.5, 30);

objs.sphereMaterial = new THREE.MeshPhongMaterial( { color: CONST.BALL_COLOR, emissive: CONST.BALL_COLOR, emissiveIntensity: 0.25 } );
objs.ballMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.2, transparent: true } );
// objs.trailMaterial = new THREE.ShaderMaterial( {color: 0xffffff, opacity: 1., transparent: true} );
objs.boundaryMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, opacity: custom.backboard_opacity, transparent: true } );
objs.playerMaterial = new THREE.MeshStandardMaterial( { color: 0xff00ff } );


objs.ball = new THREE.Mesh( objs.sphereGeo, objs.sphereMaterial );
objs.ballWrap = new THREE.Mesh( objs.ballGeo, objs.ballMaterial );
objs.player1 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.player2 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.topB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
objs.botB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
// objs.background = new THREE.Mesh( objs.BackgroundGeo, objs.BackgroundMaterial );
objs.backB = new THREE.Mesh( objs.backBoundary, objs.boundaryMaterial );
// objs.ballTrail = new THREE.Mesh( objs.trailGeo, objs.trailMaterial );

objs.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
objs.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
objs.topB.position.set(0, CONST.GAMEHEIGHT / 2, -1);
objs.botB.position.set(0, -CONST.GAMEHEIGHT / 2, -1);
objs.backB.position.set(0, 0, -1.6);
// objs.ballTrail.position.set(0.9, 0, 0);
// objs.ballTrail.rotation.set(0, 0, Math.PI / 2);


csts.topHB = new THREE.Box3().setFromObject(objs.topB);
csts.botHB = new THREE.Box3().setFromObject(objs.botB);
csts.gameVect = new THREE.Vector2(objs.player2.position.x - objs.player1.position.x, objs.player2.position.y - objs.player1.position.y).normalize();
csts.loader = new FontLoader();
csts.ambLight = new THREE.AmbientLight(0x444444);
csts.dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
csts.ballLight = new THREE.PointLight( CONST.BALL_COLOR, 5, 42);
csts.dirLight.position.set(5, 7, 15);
csts.game_id = 0;
csts.player_id = 0;
csts.pu_vs = shaders.pu_vs;
csts.pu_fs = shaders.pu_fs;

vars.scoreMsg = new THREE.Mesh();
vars.p1textMesh = new THREE.Mesh();
vars.p2textMesh = new THREE.Mesh();
vars.endMsgMesh = new THREE.Mesh();
vars.p1Score = 0;
vars.p2Score = 0;
vars.scoreString = "";
vars.endString = "";
vars.glowStartTime = 0;
vars.glowElapsed = 0;

vars.ballVect = new THREE.Vector2(-1, 0);
vars.ballSpeed = CONST.BASE_BALLSPEED;
vars.playerspeed = [CONST.BASE_PLAYERSPEED, CONST.BASE_PLAYERSPEED];
vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
vars.ballFloorPos = 0;
// vars.trailSegments = [];

vars.dotProduct = 0;
vars.stopGame = false;
vars.directions = [1,1];
vars.downkeys = [false, false];
vars.reboundDiff = 0;
vars.isRebound = 0;
vars.frametick = 0;

vars.puTimeSave = 0;
vars.puSpawnChance = 0;
vars.puChanceCounter = 1;
vars.bulletTime = 1;