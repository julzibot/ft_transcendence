import * as THREE from 'three';
import * as CONST from './constants';

export const vars = {};
export const objs = {};

objs.sphereGeo = new THREE.SphereGeometry(CONST.BALLRADIUS, 40, 40);
objs.playerGeo = new THREE.BoxGeometry(0.5, CONST.PLAYERLEN, 0.6);
objs.upDownBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 0.5, 0.6);

objs.sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
objs.boundaryMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
objs.playerMaterial = new THREE.MeshStandardMaterial( { color: 0xff00ff } );

objs.ball = new THREE.Mesh( objs.sphereGeo, objs.sphereMaterial );
objs.player1 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.player2 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.topB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
objs.botB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );

vars.scoreMsg = new THREE.Mesh();
vars.p1textMesh = new THREE.Mesh();
vars.p2textMesh = new THREE.Mesh();
vars.p1Score = 0;
vars.p2Score = 0;
vars.scoreString = "";
vars.endString = "";

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
