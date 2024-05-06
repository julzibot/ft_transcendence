import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as CONST from '../../utils/constants';
import { vars, objs, csts} from '../../utils/algo';

let keys = {};
const tools = {};
let game_id = 0;
let put_response = false;

function printGameInfo( font, textMesh, string, mode, fontsize )
{
  let updatedStringGeo = new TextGeometry(string, {font: font, size: fontsize, height: 0.5 });
  if (mode != 0 && mode < 3)
  {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    textMesh.material = textMaterial;
    if (mode == 1)
      textMesh.position.set(CONST.GAMEWIDTH / 5 - CONST.GAMEWIDTH / 2, CONST.GAMEHEIGHT / 3.5, -1);
    else if (mode == 2)
      textMesh.position.set(CONST.GAMEWIDTH / 5, CONST.GAMEHEIGHT / 3.5, -1);
  }
  else if (mode == 3)
  {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    textMesh.material = textMaterial;
    textMesh.position.set(-11.5, -7 , 0);
  }
  if (mode != 0)
    tools.scene.add(textMesh);
  textMesh.geometry.dispose();
  textMesh.geometry = updatedStringGeo;
}

const setBallColor = () =>
{
  const speedDiff = CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED;
  const interpolate = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / speedDiff;
  let color = Math.min(interpolate * 255, 255) << 16 | 255 * (1 - interpolate);
  const ballMaterial = new THREE.MeshPhongMaterial( { color: color, emissive: color, emissiveIntensity: 0.1 } );
  objs.ball.material.dispose();
  objs.ball.material = ballMaterial;
}

const scoringLogic = () =>
{
  // RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
  if (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4 || objs.ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))
  {
    if (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4)
    {
      vars.ballVect.set(-1, 0, 0);
      vars.p1Score += 1;
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function(font)
        {printGameInfo(font, vars.p1textMesh, vars.p1Score.toString(), 0, 4);});
    }
    else
    {
      vars.ballVect.set(1, 0, 0);
      vars.p2Score += 1;
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function(font)
        {printGameInfo(font, vars.p2textMesh, vars.p2Score.toString(), 0, 4);});
    }

    if (Math.max(vars.p1Score, vars.p2Score) == CONST.WINSCORE)
    {
      if (vars.p1Score > vars.p2Score)
        vars.endString = "GAME ENDED\nPLAYER 1 WINS";
      else
        vars.endString = "GAME ENDED\nPLAYER 2 WINS";
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
        {printGameInfo(font, vars.endMsgMesh, vars.endString, 3, 3)} );
      vars.stopGame = true;
      put_response = PutScores();
      if (put_response == false)
        console.log("Ouch ! Scores not updated !")
    }
    objs.ball.position.set(0, 0, 0);
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
    setBallColor();
  }
}


const collisionLogic = () =>
{
  let p1HB = new THREE.Box3().setFromObject(objs.player1);
  let p2HB = new THREE.Box3().setFromObject(objs.player2);
  let sph = new THREE.Box3().setFromObject(objs.ball);

  // CHECK PLAYER COLLISIONS
  if (p1HB.intersectsBox(sph))
    vars.isRebound = 1;
  else if (p2HB.intersectsBox(sph))
    vars.isRebound = 2;
  if (vars.isRebound != 0)
  {
    // COMPUTE THE NORMALIZED REBOUND VECTOR
    vars.glowStartTime = performance.now();
    if (vars.isRebound == 1)
      vars.reboundDiff = objs.player1.position.y - objs.ball.position.y;
    else
      vars.reboundDiff = objs.player2.position.y - objs.ball.position.y;
    if ( Math.abs(vars.reboundDiff) > CONST.PLAYERLEN / 2 + CONST.BALLRADIUS / 2 - 0.3 &&
      (Math.abs(objs.ball.position.x - objs.player1.position.x) < 0.52 || Math.abs(objs.ball.position.x - objs.player2.position.x) < 0.52))
        vars.ballVect.set(objs.ball.position.x / (CONST.GAMEWIDTH / 2), -vars.reboundDiff);
    else
    {
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
    if (Math.acos(vars.dotProduct * vars.directions[0]) * 180 / Math.PI > 90 - CONST.MINREBOUNDANGLE)
    {
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
    vars.isRebound = 0;

    // SET BALL COLOR
    setBallColor();
  }
  // CHECK TOP AND BOT BOUNDARY COLLISIONS
  if (csts.topHB.intersectsBox(sph) || csts.botHB.intersectsBox(sph))
    vars.ballVect.y *= -1;

}

const update = () =>
{
  if (keys['ArrowUp'] || keys['ArrowDown'])
    vars.playerspeed[1] = Math.min(vars.playerspeed[1] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
  else
    vars.playerspeed[1] = CONST.BASE_PLAYERSPEED;
  if (keys['KeyW'] || keys['KeyS'])
    vars.playerspeed[0] = Math.min(vars.playerspeed[0] * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
  else
    vars.playerspeed[0] = CONST.BASE_PLAYERSPEED;
  if (keys['ArrowUp'] && objs.player2.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
      objs.player2.position.y += vars.playerspeed[1];
  }
  if (keys['ArrowDown'] && objs.player2.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
      objs.player2.position.y -= vars.playerspeed[1];
  }
  if (keys['KeyW'] && objs.player1.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
      objs.player1.position.y += vars.playerspeed[0];
  }
  if (keys['KeyS'] && objs.player1.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
      objs.player1.position.y -= vars.playerspeed[0];
  }
  if (keys['KeyR']) {
    objs.ball.position.set(0,0,0);
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
    vars.ballVect.set(-1, 0, 0);
    tools.scene.remove(vars.scoreMsg);
    vars.p1Score = 0;
    vars.p2Score = 0;

    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
      {printGameInfo(font, vars.p1textMesh, "0", 0, 4)} );
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
      {printGameInfo(font, vars.p2textMesh, "0", 0, 4)} );
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
      {printGameInfo(font, vars.endMsgMesh, "", 3, 3)} );
    objs.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
    objs.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
    tools.camera.position.set(0, 0, 20);
    tools.camera.lookAt(0, 0, 0);
    vars.stopGame = false;
  }
}

async function CreateGame()
{
  // const url = 'http://localhost:8000/api/game';
  console.log("CreateGame called");
  const response = await fetch('http://localhost:8000/api/game/test/',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "player1_id": 1 
      })
    })
    if(response.status === 201) {
      const res = await response.json()
      return parseInt(res.id)
    }
    else
      return -1
}

async function PutScores()
{
  const response = await fetch('http://localhost:8000/api/game/update/',
    {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "id": game_id,
        "score1": vars.p1Score,
        "score2": vars.p2Score 
      })
    })
    if(response.ok)
      return true
    else
      return false
}

async function assignId(id)
{
  game_id = id;
  console.log(game_id + ": game_id assigned")
}

const animate = () =>
{
  collisionLogic(vars, csts, objs);
  scoringLogic(vars, csts, objs);
  
  if (vars.stopGame == true)
    vars.ballVect.set(0, 0);
  objs.ball.position.x += vars.ballVect.x * vars.adjustedBallSpeed;
  objs.ball.position.y += vars.ballVect.y * vars.adjustedBallSpeed;
  csts.ballLight.position.x = objs.ball.position.x;
  csts.ballLight.position.y = objs.ball.position.y;

  vars.glowElapsed = performance.now() - vars.glowStartTime;
  if (vars.glowElapsed < 750)
  {
    if (vars.glowElapsed < 100)
      objs.ball.material.emissiveIntensity = 0.8
    else
      objs.ball.material.emissiveIntensity = 0.8 - (vars.glowElapsed / 750 * 0.7);
  }

  update();
  tools.stats.update();
  tools.controls.update();

  // if (vars.directions[0] == 1)
  //   tools.camera.position.set(objs.ball.position.x - 10, objs.ball.position.y, 4);
  // if (vars.directions[0] == -1)
  //   tools.camera.position.set(objs.ball.position.x + 10, objs.ball.position.y, 4);
  // tools.camera.lookAt(objs.ball.position.x, objs.ball.position.y, 4);
  // tools.camera.rotation.x = Math.PI / 2;

  tools.renderer.render(tools.scene, tools.camera);
  // vars.frametick += 1;

  setTimeout( function() {
    requestAnimationFrame( animate );
  }, 5 );
}


export default function ThreeScene()
{
  console.log("Hello");
  const containerRef = useRef(null);
    useEffect(() => {
    
    CreateGame().then(assignId);
    tools.scene = new THREE.Scene();
    tools.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    tools.renderer = new THREE.WebGLRenderer({canvas: containerRef.current});
    tools.renderer.setSize( window.innerWidth, window.innerHeight );
    tools.controls = new OrbitControls( tools.camera, tools.renderer.domElement);
    tools.stats = Stats()
    document.body.appendChild( tools.renderer.domElement );
    document.body.appendChild( tools.stats.dom );
    
    tools.scene.add( objs.ball );
    tools.scene.add( objs.player1 );
    tools.scene.add( objs.player2 );
    tools.scene.add( objs.topB );
    tools.scene.add( objs.botB );
    tools.scene.add( objs.background );
    tools.scene.add( csts.ambLight );
    tools.scene.add( csts.dirLight );
    tools.scene.add( csts.ballLight );
    tools.camera.position.set(0, 0, 20);
    tools.camera.lookAt(0, 0, 0);

    // camera.rotation.x = Math.PI / 2;
    // camera.rotation.z = -Math.PI / 2;

    // SET UP SCORE TEXTS
    // ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
      {printGameInfo(font, vars.p1textMesh, "0", 1, 4)} );
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function (font)
      {printGameInfo(font, vars.p2textMesh, "0", 2, 4)} );

    document.addEventListener('keydown', function(event) { keys[event.code] = true; });

    document.addEventListener('keyup', function(event) { keys[event.code] = false; });

    animate();
  }, []);
  return <canvas className='fixed-top' ref={containerRef} />;
};