import * as THREE from 'three';
import * as CONST from './constants';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { shaders } from './shaders';

export const objs = {};
export const csts = {};
export const vars = {};
export const custom = {};

// GAME CUSTOM PARAMS

// custom.pov = "classic";
custom.immersiveCamPos = new THREE.Vector3(-CONST.GAMEWIDTH / 2 - 10, 0, 18);
custom.classicCamPos = new THREE.Vector3(0, 2.2, 23.25);

custom.shader_utils = shaders.utils;
custom.b_lightsquares = shaders.background_lightsquares;
custom.b_default = shaders.background_default;
custom.b_waves = shaders.background_waves;
custom.b_fractcircles = shaders.background_fractcircles;

custom.color = new THREE.Vector3(0.2, 0.5, 0.6);
custom.palette = 3;
custom.backboard_opacity = 0.8;
custom.background = shaders.background_skybox;
custom.color = new THREE.Vector3(0.2, 0.7, 0.6);
custom.palette = 2;
custom.difficulty = 1.;
custom.win_score = 11;
custom.power_ups = false;
custom.sparks = true;
custom.powerUp_names = ["elongation", "golden rush", "bullet time", "confundus", "invisiball", "none"];
custom.modes_colormap = [0x00ff33, 0xff0022, 0x4c4cff, 0xcc00cc, 0xffffff, 0x888888];
custom.player_colormap = [0xcc0000, 0xee00ee, 0x00cc00, 0xeeee00, 0x0000cc, 0x00eeee];

// GAME INIT

objs.sphereGeo = new THREE.SphereGeometry(CONST.BALLRADIUS, 40, 40);
objs.ballGeo = new THREE.SphereGeometry(CONST.BALLRADIUS * 3/2, 40, 40);
objs.pu_gaugeGeo = new THREE.SphereGeometry(0.5, 40, 40);
objs.playerGeo = new THREE.BoxGeometry(0.5, CONST.PLAYERLEN, 1.2);
objs.upDownBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 0.5, 3.0);
// objs.BackgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);
objs.backBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, CONST.GAMEHEIGHT, 0.5);
objs.displayBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 4.5, 0.5);
objs.gaugeDiscGeo = new THREE.CircleGeometry(0.5, 20);
// objs.trailGeo = new THREE.CylinderGeometry(0.8 * CONST.BALLRADIUS, 0.8 * CONST.BALLRADIUS, 0.5, 30);

objs.sphereMaterial = new THREE.MeshPhongMaterial( { color: CONST.BALL_COLOR, emissive: CONST.BALL_COLOR, emissiveIntensity: 0.25, transparent: true, opacity: 1. } );
objs.ballMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, opacity: 0.2, transparent: true } );
// objs.trailMaterial = new THREE.ShaderMaterial( {color: 0xffffff, opacity: 1., transparent: true} );
objs.boundaryMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, opacity: custom.backboard_opacity, transparent: true } );
objs.playerMaterial = new THREE.MeshStandardMaterial( { color: 0xcc0000, emissive: 0xee00ee, emissiveIntensity: 0.15 } );
objs.displayMaterial = new THREE.MeshStandardMaterial( { color: 0x000000 } );

objs.ball = new THREE.Mesh( objs.sphereGeo, objs.sphereMaterial );
objs.ballWrap = new THREE.Mesh( objs.ballGeo, objs.ballMaterial );
objs.player1 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.player2 = new THREE.Mesh( objs.playerGeo, objs.playerMaterial );
objs.topB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
objs.botB = new THREE.Mesh( objs.upDownBoundary, objs.boundaryMaterial );
// objs.background = new THREE.Mesh( objs.BackgroundGeo, objs.BackgroundMaterial );
objs.backB = new THREE.Mesh( objs.backBoundary, objs.boundaryMaterial );
objs.display = new THREE.Mesh( objs.displayBoundary, objs.displayMaterial );
objs.puGauges = [[], []];
objs.puGaugeDiscs = [[], []];
objs.puGaugeLights = [[], []];
for (let i = 0; i < 5; i++)
{
    const gaugecolor = custom.modes_colormap[i];
    const mat = new THREE.MeshPhongMaterial({color: gaugecolor, transparent: true, opacity: 0.2, side: THREE.DoubleSide});
    const discMat = new THREE.MeshPhongMaterial({color: gaugecolor, transparent: true, opacity: 0.2});
    objs.puGauges[0].push(new THREE.Mesh(objs.pu_gaugeGeo, mat));
    objs.puGaugeDiscs[0].push(new THREE.Mesh(objs.gaugeDiscGeo, discMat));
    objs.puGaugeLights[0].push(new THREE.PointLight(gaugecolor, 0, 0.9));
    objs.puGauges[0][i].position.set(-CONST.GAMEWIDTH / 2 + 1.5 * i + 2, CONST.GAMEHEIGHT / 2 + 0.75, 1.2);
    objs.puGaugeDiscs[0][i].position.set(-CONST.GAMEWIDTH / 2 + 1.5 * i + 2, CONST.GAMEHEIGHT / 2 + 0.75, 1.3);
    objs.puGaugeLights[0][i].position.set(-CONST.GAMEWIDTH / 2 + 1.5 * i + 2, CONST.GAMEHEIGHT / 2 + 0.75, 1.8);

    objs.puGauges[1].push(new THREE.Mesh(objs.pu_gaugeGeo, mat));
    objs.puGaugeDiscs[1].push(new THREE.Mesh(objs.gaugeDiscGeo, discMat));
    objs.puGaugeLights[1].push(new THREE.PointLight(gaugecolor, 0, 0.9));
    objs.puGauges[1][i].position.set(CONST.GAMEWIDTH / 2 + 1.5 * i - 8, CONST.GAMEHEIGHT / 2 + 0.75, 1.2);
    objs.puGaugeDiscs[1][i].position.set(CONST.GAMEWIDTH / 2 + 1.5 * i - 8, CONST.GAMEHEIGHT / 2 + 0.75, 1.3);
    objs.puGaugeLights[1][i].position.set(CONST.GAMEWIDTH / 2 + 1.5 * i - 8, CONST.GAMEHEIGHT / 2 + 0.75, 1.8);
}
// objs.ballTrail = new THREE.Mesh( objs.trailGeo, objs.trailMaterial );

objs.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
objs.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
objs.topB.position.set(0, CONST.GAMEHEIGHT / 2, -0.27);
objs.botB.position.set(0, -CONST.GAMEHEIGHT / 2, -0.25);
objs.backB.position.set(0, 0, -1.5);
objs.display.position.set(0, CONST.GAMEHEIGHT / 2 + 2., 1);
// objs.ballTrail.position.set(0.9, 0, 0);
// objs.ballTrail.rotation.set(0, 0, Math.PI / 2);


csts.topHB = new THREE.Box3().setFromObject(objs.topB);
csts.botHB = new THREE.Box3().setFromObject(objs.botB);
csts.gameVect = new THREE.Vector2(objs.player2.position.x - objs.player1.position.x, objs.player2.position.y - objs.player1.position.y).normalize();
csts.loader = new FontLoader();
csts.ambLight = new THREE.AmbientLight(0x444444);
csts.dirLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
csts.dirLight2 = new THREE.DirectionalLight( 0xffffff, 0.75 );
csts.ballLight = new THREE.PointLight( CONST.BALL_COLOR, 5, 42);
csts.dirLight.position.set(0, -4., 15);
csts.dirLight2.position.set(0, 4., 15);
csts.game_id = 0;
csts.player_id = 0;
csts.pu_vs = shaders.pu_vs;
csts.pu_fs = shaders.pu_fs;

vars.scoreMsg = new THREE.Mesh();
vars.p1textMesh = new THREE.Mesh();
vars.hyphenMesh = new THREE.Mesh();
vars.p2textMesh = new THREE.Mesh();
vars.latentMesh = [new THREE.Mesh(), new THREE.Mesh()];
vars.activeMesh = [new THREE.Mesh(), new THREE.Mesh()];
vars.endMsgMesh = new THREE.Mesh();
vars.p1Score = 0;
vars.p2Score = 0;
vars.scoreString = "";
vars.endString = "";
vars.glowStartTime = 0;
vars.glowElapsed = 0;
vars.ai_timer = 0;
vars.playerlens = [CONST.PLAYERLEN, CONST.PLAYERLEN];

vars.ballVect = new THREE.Vector2(-1, 0);
vars.ballSpeed = CONST.BASE_BALLSPEED;
vars.playerspeed = [CONST.BASE_PLAYERSPEED, CONST.BASE_PLAYERSPEED];
vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
vars.ballFloorPos = 0;
// vars.trailSegments = [];

vars.ai_aim = 0;
vars.ai_offset = 0;
vars.ai_invert = 1;

vars.dotProduct = 0;
vars.stopGame = 0;
vars.directions = [1,1];
vars.downkeys = [false, false];
vars.reboundDiff = 0;
vars.isRebound = 0;
vars.frametick = 0;

vars.puTimeSave = 0;
vars.puSpawnChance = 0;
vars.puChanceCounter = 1;
vars.bulletTime = 1;
vars.puIdCount = 0;

vars.colorswitch = [0, 0];