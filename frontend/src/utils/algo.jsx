import * as THREE from 'three';
import * as CONST from './constants';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export const objs = {};
export const csts = {};
export const vars = {};

objs.sphereGeo = new THREE.SphereGeometry(CONST.BALLRADIUS, 40, 40);
objs.playerGeo = new THREE.BoxGeometry(0.5, CONST.PLAYERLEN, 0.6);
objs.upDownBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 0.5, 0.6);
objs.BackgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);

objs.sphereMaterial = new THREE.MeshPhongMaterial( { color: CONST.BALL_COLOR, emissive: CONST.BALL_COLOR, emissiveIntensity: 0.1 } );
objs.boundaryMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff, opacity: 0.5, transparent: true } );
objs.playerMaterial = new THREE.MeshStandardMaterial( { color: 0xff00ff } );
objs.BackgroundMaterial = new THREE.MeshPhongMaterial( { color: 0x8f9fcc, side: THREE.BackSide } );

objs.ball = new THREE.Mesh( objs.sphereGeo, objs.sphereMaterial );
objs.player1 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.player2 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.topB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
objs.botB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
objs.background = new THREE.Mesh( objs.BackgroundGeo, objs.BackgroundMaterial );

objs.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
objs.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
objs.topB.position.set(0, CONST.GAMEHEIGHT / 2, 0);
objs.botB.position.set(0, -CONST.GAMEHEIGHT / 2, 0);


csts.topHB = new THREE.Box3().setFromObject(objs.topB);
csts.botHB = new THREE.Box3().setFromObject(objs.botB);
csts.gameVect = new THREE.Vector2(objs.player2.position.x - objs.player1.position.x, objs.player2.position.y - objs.player1.position.y).normalize();
csts.loader = new FontLoader();
csts.ambLight = new THREE.AmbientLight(0x444444);
csts.dirLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
csts.ballLight = new THREE.PointLight( 0xff0000, 1, 30);
csts.dirLight.position.set(5, 7, 15);
csts.game_id = 0;


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

vars.dotProduct = 0;
vars.stopGame = false;
vars.directions = [1,1];
vars.downkeys = [false, false];
vars.reboundDiff = 0;
vars.isRebound = 0;
vars.frametick = 0;
