import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import * as CONST from '../../utils/Constants';

let vars = {};
let keys = {};
const csts = {};

const scoringLogic = () =>
{
  // RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
  if (csts.ball.position.x > CONST.GAMEWIDTH / 2 + 4 || csts.ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))
  {
    if (csts.ball.position.x > CONST.GAMEWIDTH / 2 + 4)
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
        csts.scene.add(vars.scoreMsg);
        vars.scoreMsg.position.set(-11.5, -7 , 0);
      });
      vars.stopGame = true;
    }
    csts.ball.position.set(0, 0, 0);
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
  }
}

const animate = () =>
{
  let p1HB = new THREE.Box3().setFromObject(csts.player1);
  let p2HB = new THREE.Box3().setFromObject(csts.player2);
  let sph = new THREE.Box3().setFromObject(csts.ball);

  // CHECK PLAYER COLLISIONS
  if (p1HB.intersectsBox(sph))
    vars.isRebound = 1;
  else if (p2HB.intersectsBox(sph))
    vars.isRebound = 2;
  if (vars.isRebound != 0)
  {
    // COMPUTE THE NORMALIZED REBOUND VECTOR
    if (vars.isRebound == 1)
      vars.reboundDiff = csts.player1.position.y - csts.ball.position.y;
    else
      vars.reboundDiff = csts.player2.position.y - csts.ball.position.y;
    if ( Math.abs(vars.reboundDiff) > CONST.PLAYERLEN / 2 + CONST.BALLRADIUS / 2 - 0.3 &&
      (Math.abs(csts.ball.position.x - csts.player1.position.x) < 0.52 || Math.abs(csts.ball.position.x - csts.player2.position.x) < 0.52))
      vars.ballVect.set(csts.ball.position.x / (CONST.GAMEWIDTH / 2), -vars.reboundDiff);
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
  
  scoringLogic(vars, csts);
  
  if (vars.stopGame == true)
  vars.ballVect.set(0, 0);
  csts.ball.position.x += vars.ballVect.x * vars.adjustedBallSpeed;
  csts.ball.position.y += vars.ballVect.y * vars.adjustedBallSpeed;
  csts.renderer.render(csts.scene, csts.camera);
  // vars.frametick += 1;
  requestAnimationFrame(animate);
}


const update = () =>
{
  if (keys['ArrowUp'] || keys['ArrowDown'] || keys['KeyW'] || keys['KeyS'])
    vars.playerspeed = Math.min(vars.playerspeed * CONST.PLAYERSPEED_INCREMENT, CONST.PLAYERSPEED_MAX);
  else
    vars.playerspeed = CONST.BASE_PLAYERSPEED;
  if (keys['ArrowUp'] && csts.player2.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
      csts.player2.position.y += vars.playerspeed;
  }
  if (keys['ArrowDown'] && csts.player2.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
      csts.player2.position.y -= vars.playerspeed;
  }
  if (keys['KeyW'] && csts.player1.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
      csts.player1.position.y += vars.playerspeed;
  }
  if (keys['KeyS'] && csts.player1.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
      csts.player1.position.y -= vars.playerspeed;
  }
  if (keys['KeyR']) {
    csts.ball.position.set(0,0,0);
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
    vars.ballVect.set(-1, 0, 0);
    csts.scene.remove(vars.scoreMsg);
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
    csts.player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
    csts.player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
    vars.stopGame = false;
  }
  requestAnimationFrame( update );
}

const ThreeScene = () =>
{
  const containerRef = useRef(null);
  useEffect(() => {
    vars.scoreMsg = new THREE.Mesh();
    vars.ballVect = new THREE.Vector2(-1, 0);
    vars.p1textMesh = new THREE.Mesh();
    vars.p2textMesh = new THREE.Mesh();
    vars.p1Score = 0;
    vars.p2Score = 0;
    vars.scoreString = "";
    vars.endString = "";
    vars.ballSpeed = CONST.BASE_BALLSPEED;
    vars.playerspeed = CONST.PLAYERSPEED;
    vars.adjustedBallSpeed = CONST.BASE_BALLSPEED;
    vars.dotProduct = 0;
    vars.stopGame = false;
    vars.directions = [1,1];
    vars.reboundDiff = 0;
    vars.isRebound = 0;
    vars.frametick = 0;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({canvas: containerRef.current});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    const sphereGeo = new THREE.SphereGeometry(CONST.BALLRADIUS, 40, 40);
    const playerGeo = new THREE.BoxGeometry(0.5, CONST.PLAYERLEN, 0.6);
    const upDownBoundary = new THREE.BoxGeometry(CONST.GAMEWIDTH, 0.5, 0.6);
    
    const sphereMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    const boundaryMaterial = new THREE.MeshStandardMaterial( { color: 0x0000ff } );
    const playerMaterial = new THREE.MeshStandardMaterial( { color: 0xff00ff } );
    
    const ball = new THREE.Mesh( sphereGeo, sphereMaterial );
    const player1 = new THREE.Mesh( playerGeo, playerMaterial );
    const player2 = new THREE.Mesh( playerGeo, playerMaterial );
    const topB = new THREE.Mesh( upDownBoundary, boundaryMaterial );
    const botB = new THREE.Mesh( upDownBoundary, boundaryMaterial );
    
    
    scene.add( ball );
    scene.add( player1 );
    scene.add( player2 );
    scene.add( topB );
    scene.add( botB );
    
    player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
    player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
    topB.position.set(0, CONST.GAMEHEIGHT / 2, 0);
    botB.position.set(0, -CONST.GAMEHEIGHT / 2, 0);
    const topHB = new THREE.Box3().setFromObject(topB);
    const botHB = new THREE.Box3().setFromObject(botB);
    const gameVect = new THREE.Vector2(player2.position.x - player1.position.x, player2.position.y - player1.position.y).normalize();
    const loader = new FontLoader();
    const ambLight = new THREE.AmbientLight(0x444444);
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    scene.add( ambLight );
    scene.add( dirLight );
    dirLight.position.set(5, 7, 15);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    // camera.rotation.x = Math.PI / 2;
    // camera.rotation.z = -Math.PI / 2;

    csts.scene = scene;
    csts.camera = camera;
    csts.renderer = renderer;
    csts.ball = ball;
    csts.player1 = player1;
    csts.player2 = player2;
    csts.topBoundary = topB;
    csts.bottomBoundary = botB;
    csts.topHB = topHB;
    csts.botHB = botHB;
    csts.gameVect = gameVect;
    csts.loader = loader;
    csts.debug = "Hello !"

    console.log(csts.debug);

    // SET UP SCORE TEXTS
    // ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
    
    loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
    {
      const textGeo = new TextGeometry( '0',
      {
        font: font,
        size: 4,
        height: 0.2
      });
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      vars.p1textMesh.geometry = textGeo;
      vars.p1textMesh.material = textMaterial;
      vars.p2textMesh.geometry = textGeo;
      vars.p2textMesh.material = textMaterial;
      csts.scene.add(vars.p1textMesh);
      csts.scene.add(vars.p2textMesh);
      vars.p1textMesh.position.set(CONST.GAMEWIDTH / 5 - CONST.GAMEWIDTH / 2, CONST.GAMEHEIGHT / 3.5, 0);
      vars.p2textMesh.position.set(CONST.GAMEWIDTH / 5, CONST.GAMEHEIGHT / 3.5, 0);
    });

    document.addEventListener('keydown', function(event) {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', function(event) {
        keys[event.code] = false;
    });

    update();
    animate();
  }, []);
  return <canvas className='fixed-top' ref={containerRef} />;
};

export default ThreeScene;