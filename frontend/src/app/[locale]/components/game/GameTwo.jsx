import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import * as CONST from '../../lib/Constants.ts';

const ThreeScene = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    
    let	p1Score = 0;
    let p2Score = 0;
    let scoreString = "";
    let	endString = "";
    let ballSpeed = 0.35;
    let adjustedBallSpeed = 0.35;
    let	dotProduct = 0;
    let	stopGame = false;
    
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
    const gameVect = new THREE.Vector2(player2.position.x - player1.position.x, player2.position.y - player1.position.y).normalize();
    let	directions = [1, 1];
    
    const ambLight = new THREE.AmbientLight(0x444444);
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    scene.add( ambLight );
    scene.add( dirLight );
    
    dirLight.position.set(5, 7, 15);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    // camera.rotation.x = Math.PI / 2;
    // camera.rotation.z = -Math.PI / 2;
    
    let ballVect = new THREE.Vector2(-1, 0);
    let reboundDiff = 0;
    
    const topHB = new THREE.Box3().setFromObject(topB);
    const botHB = new THREE.Box3().setFromObject(botB);
    let	isRebound = 0;
    
    // SET UP SCORE TEXTS
    // ALTERNATIVE FONT PATH: ./Lobster_1.3_Regular.json
    const loader = new FontLoader();
    let p1textMesh = new THREE.Mesh();
    let p2textMesh = new THREE.Mesh();
    let scoreMsg = new THREE.Mesh();
    
    loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
    {
      const textGeo = new TextGeometry( '0',
      {
        font: font,
        size: 4,
        height: 0.2
      });
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      p1textMesh.geometry = textGeo;
      p1textMesh.material = textMaterial;
      p2textMesh.geometry = textGeo;
      p2textMesh.material = textMaterial;
      scene.add(p1textMesh);
      scene.add(p2textMesh);
      p1textMesh.position.set(CONST.GAMEWIDTH / 5 - CONST.GAMEWIDTH / 2, CONST.GAMEHEIGHT / 3.5, 0);
      p2textMesh.position.set(CONST.GAMEWIDTH / 5, CONST.GAMEHEIGHT / 3.5, 0);
    });

    let keys = {};
    document.addEventListener('keydown', function(event) {
        keys[event.code] = true;
    });
    
    document.addEventListener('keyup', function(event) {
        keys[event.code] = false;
    });
    
    function update()
    {
        if (keys['ArrowUp'] && player2.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
            player2.position.y += CONST.PLAYERSPEED;
        }
        if (keys['ArrowDown'] && player2.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
            player2.position.y -= CONST.PLAYERSPEED;
        }
        if (keys['KeyW'] && player1.position.y < CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2) {
            player1.position.y += CONST.PLAYERSPEED;
        }
        if (keys['KeyS'] && player1.position.y > -(CONST.GAMEHEIGHT / 2 - CONST.PLAYERLEN / 2)) {
            player1.position.y -= CONST.PLAYERSPEED;
        }
        if (keys['KeyR'] && stopGame == true) {
            ballVect.set(-1, 0, 0);
            scene.remove(scoreMsg);
            p1Score = 0;
            p2Score = 0;
            scoreString = '0';
            loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
            {
              let updatedScoreGeo = new TextGeometry(scoreString, {font: font, size: 4, height: 0.5});
              p1textMesh.geometry.dispose();
              p2textMesh.geometry.dispose();
              p1textMesh.geometry = updatedScoreGeo;
              p2textMesh.geometry = updatedScoreGeo;
            });
            player1.position.set(-CONST.GAMEWIDTH / 2, 0, 0);
            player2.position.set(CONST.GAMEWIDTH / 2, 0, 0);
            stopGame = false;
        }
        requestAnimationFrame( update );
    }
    
    function animate()
    {
      // console.log("hey");
      isRebound = 0;
      let p1HB = new THREE.Box3().setFromObject(player1);
      let p2HB = new THREE.Box3().setFromObject(player2);
      let sph = new THREE.Box3().setFromObject(ball);
    
      // CHECK PLAYER COLLISIONS
      if (p1HB.intersectsBox(sph))
        isRebound = 1;
      else if (p2HB.intersectsBox(sph))
        isRebound = 2;
      if (isRebound != 0)
      {
        // COMPUTE THE NORMALIZED REBOUND VECTOR
        if (isRebound == 1)
          reboundDiff = player1.position.y - ball.position.y;
        else
          reboundDiff = player2.position.y - ball.position.y;
        if ( Math.abs(reboundDiff) > CONST.PLAYERLEN / 2 + CONST.BALLRADIUS / 2 - 0.3 &&
          (Math.abs(ball.position.x - player1.position.x) < 0.52 || Math.abs(ball.position.x - player2.position.x) < 0.52))
          ballVect.set(ball.position.x / (CONST.GAMEWIDTH / 2), -reboundDiff);
        else
        {
          ballVect.x *= -1;
          ballVect.y -= reboundDiff / 2;
        }
        ballVect.normalize();
    
        // IF THE REBOUND ANDLE IS TOO WIDE, SET IT TO 40 degrees
        dotProduct = ballVect.dot(gameVect);
        directions = [1, 1];
        if (isRebound == 2)
          directions[0] = -1;
        if (ballVect.y < 0)
          directions[1] = -1;
        if (Math.acos(dotProduct * directions[0]) * 180 / Math.PI > 90 - CONST.MINREBOUNDANGLE)
        {
          ballVect.set(Math.cos(CONST.MINREBOUNDANGLE * Math.PI / 180) * directions[0], Math.sin(CONST.MINREBOUNDANGLE * Math.PI / 180) * directions[1]);
          ballVect.normalize();
        }
    
        // ADJUST THE BALL SPEED, WITHOUT GOING OVER OR UNDER THE LIMITS
        if (ballSpeed < CONST.BALLMAXSPEED)
          ballSpeed *= CONST.SPEEDINCREMENT;
        adjustedBallSpeed *= 1 + (Math.abs(reboundDiff) - (CONST.PLAYERLEN / 6)) / 2;
        if (adjustedBallSpeed < ballSpeed)
          adjustedBallSpeed = ballSpeed;
        else if (adjustedBallSpeed > CONST.BALLMAXSPEED)
          adjustedBallSpeed = CONST.BALLMAXSPEED;
      }
    // CHECK TOP AND BOT BOUNDARY COLLISIONS
      if (topHB.intersectsBox(sph) || botHB.intersectsBox(sph))
      ballVect.y *= -1;
    
    // RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
      if (ball.position.x > CONST.GAMEWIDTH / 2 + 4 || ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))
      {
        if (ball.position.x > CONST.GAMEWIDTH / 2 + 4)
        {
          ballVect.set(-1, 0, 0);
          p1Score += 1;
          scoreString = p1Score.toString();
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            let updatedScoreGeo = new TextGeometry(scoreString, {font: font, size: 4, height: 0.5});
            p1textMesh.geometry.dispose();
            p1textMesh.geometry = updatedScoreGeo;
          });
        }
        else
        {
          ballVect.set(1, 0, 0);
          p2Score += 1;
          scoreString = p2Score.toString();
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            let updatedScoreGeo = new TextGeometry(scoreString, {font: font, size: 4, height: 0.5});
            p2textMesh.geometry.dispose();
            p2textMesh.geometry = updatedScoreGeo;
          });
        }
    
        if (Math.max(p1Score, p2Score) == CONST.WINSCORE)
        {
          if (p1Score > p2Score)
            endString = "PLAYER 1 WINS";
          else
            endString = "PLAYER 2 WINS";
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            const textGeo = new TextGeometry( 'GAME ENDED\n' + endString,
            {
              font: font,
              size: 3,
              height: 0.5
            });
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            scoreMsg.geometry = textGeo;
            scoreMsg.material = textMaterial;
            scene.add(scoreMsg);
            scoreMsg.position.set(-11.5, -7 , 0);
          });
          stopGame = true;
        }
        ball.position.set(0, 0, 0);
        ballSpeed = 0.35;
        adjustedBallSpeed = 0.35;
      }
    
      if (stopGame == true)
        ballVect.set(0, 0);
      ball.position.x += ballVect.x * adjustedBallSpeed;
      ball.position.y += ballVect.y * adjustedBallSpeed;
      renderer.render( scene, camera );
      requestAnimationFrame( animate );
    }
    
    update();
    animate();
  }, []);
  return <canvas className='fixed-top' ref={containerRef} />;
};
export default ThreeScene;