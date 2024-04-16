import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as CONST from '../../utils/constants';
import { vars, objs, csts} from '../../utils/algo';

let keys = {};
const tools = {};
let game_id = 0;
let put_response = false;

const scoringLogic = () =>
{
  // RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
  if (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4 || objs.ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))
  {
    if (objs.ball.position.x > CONST.GAMEWIDTH / 2 + 4)
    {
      vars.ballVect.set(-1, 0, 0);
      vars.p1Score += 1;
      vars.scoreString = vars.p1Score.toString();
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
      {
        let updatedScoreGeo = new TextGeometry(vars.scoreString, {font: font, size: 4, height: 0.5});
        vars.p1textMesh.geometry.dispose();
        vars.p1textMesh.geometry = updatedScoreGeo;
      });
    }
    else
    {
      vars.ballVect.set(1, 0, 0);
      vars.p2Score += 1;
      vars.scoreString = vars.p2Score.toString();
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
      {
        let updatedScoreGeo = new TextGeometry(vars.scoreString, {font: font, size: 4, height: 0.5});
        vars.p2textMesh.geometry.dispose();
        vars.p2textMesh.geometry = updatedScoreGeo;
      });
    }

    if (Math.max(vars.p1Score, vars.p2Score) == CONST.WINSCORE)
    {
      if (vars.p1Score > vars.p2Score)
        vars.endString = "PLAYER 1 WINS";
      else
        vars.endString = "PLAYER 2 WINS";
      csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
      {
        const textGeo = new TextGeometry( 'GAME ENDED\n' + vars.endString,
        {
          font: font,
          size: 3,
          height: 0.5
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        vars.scoreMsg.geometry = textGeo;
        vars.scoreMsg.material = textMaterial;
        tools.scene.add(vars.scoreMsg);
        vars.scoreMsg.position.set(-11.5, -7 , 0);
      });
      vars.stopGame = true;
      put_response = PutScores();
      if (put_response == false)
        console.log("Ouch ! Scores not updated !")
    }
    objs.ball.position.set(0, 0, 0);
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
  }
}

const animate = () =>
{
  let p1HB = new THREE.Box3().setFromObject(objs.player1);
  let p2HB = new THREE.Box3().setFromObject(objs.player2);
  let sph = new THREE.Box3().setFromObject(objs.ball);

  // console.log(game_id)
  // CHECK PLAYER COLLISIONS
  if (p1HB.intersectsBox(sph))
    vars.isRebound = 1;
  else if (p2HB.intersectsBox(sph))
    vars.isRebound = 2;
  if (vars.isRebound != 0)
  {
    // COMPUTE THE NORMALIZED REBOUND VECTOR
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
  }
  // CHECK TOP AND BOT BOUNDARY COLLISIONS
  if (csts.topHB.intersectsBox(sph) || csts.botHB.intersectsBox(sph))
    vars.ballVect.y *= -1;
  
  scoringLogic(vars, csts, objs);
  
  if (vars.stopGame == true)
    vars.ballVect.set(0, 0);
  objs.ball.position.x += vars.ballVect.x * vars.adjustedBallSpeed;
  objs.ball.position.y += vars.ballVect.y * vars.adjustedBallSpeed;
  update();
  tools.renderer.render(tools.scene, tools.camera);
  // vars.frametick += 1;

  setTimeout( function() {
    requestAnimationFrame( animate );
  }, 5 );
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
    vars.scoreString = '0';
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
    {
      let updatedScoreGeo = new TextGeometry(vars.scoreString, {font: font, size: 4, height: 0.5});
      vars.p1textMesh.geometry.dispose();
      vars.p2textMesh.geometry.dispose();
      vars.p1textMesh.geometry = updatedScoreGeo;
      vars.p2textMesh.geometry = updatedScoreGeo;
    });
    objs.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
    objs.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
    vars.stopGame = false;
  }
}

async function CreateGame()
{
  // const url = 'http://localhost:8000/api/game';
  const response = await fetch('http://localhost:8000/api/game/test/',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        "player1_id": 1 
      }
      )
    })
    if(response.status === 201) {
      const res = await response.json()
      const ret = parseInt(res.id)
      return ret
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
        'id': game_id,
        'score1': vars.p1Score,
        'score2': vars.p2Score 
      })
    })
    if(response.ok)
      return true
    else
      return false
}


export default function ThreeScene()
{
  const containerRef = useRef(null);
  game_id = CreateGame()
  if (game_id === -1)
  {
    console.log("OOooops ! Problem encountered while creating game")
    return <canvas className='fixed-top' ref={containerRef} />
  }
  console.log("first log: " + game_id);
  useEffect(() => {
    

    tools.scene = new THREE.Scene();
    tools.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    tools.renderer = new THREE.WebGLRenderer({canvas: containerRef.current});
    tools.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( tools.renderer.domElement );
    
    tools.scene.add( objs.ball );
    tools.scene.add( objs.player1 );
    tools.scene.add( objs.player2 );
    tools.scene.add( objs.topB );
    tools.scene.add( objs.botB );
    tools.scene.add( csts.ambLight );
    tools.scene.add( csts.dirLight );
    tools.camera.position.set(0, 0, 20);
    tools.camera.lookAt(0, 0, 0);

    // camera.rotation.x = Math.PI / 2;
    // camera.rotation.z = -Math.PI / 2;

    // SET UP SCORE TEXTS
    // ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
    csts.loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
    {
      const textGeo = new TextGeometry( '0',
      {
        font: font,
        size: 4.7,
        height: 0.2
      });
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      vars.p1textMesh.geometry = textGeo;
      vars.p1textMesh.material = textMaterial;
      vars.p2textMesh.geometry = textGeo;
      vars.p2textMesh.material = textMaterial;
      tools.scene.add(vars.p1textMesh);
      tools.scene.add(vars.p2textMesh);
      vars.p1textMesh.position.set(CONST.GAMEWIDTH / 5 - CONST.GAMEWIDTH / 2, CONST.GAMEHEIGHT / 3.5, -1);
      vars.p2textMesh.position.set(CONST.GAMEWIDTH / 5, CONST.GAMEHEIGHT / 3.5, -1);
    });

    document.addEventListener('keydown', function(event) {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', function(event) {
        keys[event.code] = false;
    });

    animate();
  }, []);
  return <canvas className='fixed-top' ref={containerRef} />;
};
