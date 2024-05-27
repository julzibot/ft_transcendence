import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as CONST from '../../utils/constants';
import { vars, objs, csts, custom} from '../../utils/algo';

let keys = {};
const tools = {};
const trail = {};
const particleEffects = [];
const trailSegments = [];
let game_id = 0;
let put_response = false;
const startTime = performance.now();
tools.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

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


function printGameInfo( font, textMesh, string, mode, fontsize )
{
  let updatedStringGeo = new TextGeometry(string, {font: font, size: fontsize, height: 0.5 });
  if (mode != 0 && mode < 3)
  {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x0000cc, emissive: 0xdd00dd, emissiveIntensity: 0.2 });
    textMesh.material = textMaterial;
    if (mode == 1)
      textMesh.position.set(CONST.GAMEWIDTH / 5 - CONST.GAMEWIDTH / 2, CONST.GAMEHEIGHT / 3.5, -1.5);
    else if (mode == 2)
      textMesh.position.set(CONST.GAMEWIDTH / 5, CONST.GAMEHEIGHT / 3.5, -1.5);
  }
  else if (mode == 3)
  {
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    textMesh.material = textMaterial;
    textMesh.position.set(-11.5, -7 , -1.5);
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
  csts.ballLight.color.set(color);
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
    objs.ballWrap.position.set(0, 0, 0);
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
  let topDownRebound = 0;

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
  {
    vars.ballVect.y *= -1;
    if (objs.ball.position.y > 0)
      topDownRebound = 1;
    else
      topDownRebound = -1;

    const vertices = [];
    const speedVecs = [];
    const sizes = [];
    let speedFactor = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED);
    vars.dotProduct = vars.ballVect.dot(csts.gameVect);
    if (speedFactor < 0.3)
      speedFactor = 0.3;
    const particleSize = Math.max( 1., speedFactor * 3.);
    let x = objs.ball.position.x;
    let y = objs.ball.position.y + topDownRebound * (CONST.BALLRADIUS * 3/2);
    let z = objs.ball.position.z;
    let light = new THREE.PointLight( objs.ball.material.color, 15, 42);
    light.position.set(x, y, z);
    let vecx = 0.0;
    let vecy = 0.0;
    let vecz = 0.0;
    for ( let i = 0.0; i < speedFactor * Math.abs(vars.dotProduct) * 25; i++ ) {
      vertices.push(x, y, z);
      vecx = THREE.MathUtils.randFloatSpread( 0.8 * speedFactor );
      vecy = (THREE.MathUtils.randFloatSpread( 0.1 * speedFactor ) + 0.1 * speedFactor) * -topDownRebound;
      vecz = THREE.MathUtils.randFloatSpread( 0.5 * speedFactor );
      speedVecs.push(vecx, vecy, vecz);
      sizes.push(particleSize * Math.max(1.3 * speedFactor - 4 * Math.sqrt(vecx * vecx + vecy * vecy + vecz * vecz), 0.3));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'velocity', new THREE.Float32BufferAttribute( speedVecs, 3 ) );
    geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ) );
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
    let points = new THREE.Points( geometry, material );
    const impactTime = performance.now();
    particleEffects.push([points, impactTime, light]);
    tools.scene.add( points );
    tools.scene.add( light );
  }
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
    objs.ballWrap.position.set(0,0,0);
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
  if (keys['KeyP']) {
    let pauseStart = performance.now();
    while (performance.now() - pauseStart < 2000) ;
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
  
  let ballFloor = Math.floor(objs.ball.position.x * 2.);
  const speedFactor = (vars.adjustedBallSpeed - CONST.BASE_BALLSPEED) / (CONST.BALLSPEED_MAX - CONST.BASE_BALLSPEED) / 2.5;
  if ( ballFloor != vars.ballFloorPos )
  {
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
  if ( trailSegments.length > 0 && performance.now() - trailSegments[0][1] > 120 )
  {
    tools.scene.remove(trailSegments[0][0]);
    trailSegments.shift();
  }
  for (let i = 0; i < trailSegments.length; i++)
  {
    // trailSegments[i][0].material.uniforms.u_time = performance.now() - trailSegments[i][1];
    if (Math.abs(trailSegments[i][0].position.y) > CONST.GAMEHEIGHT / 2 - 1.5)
      trailSegments[i][0].material.opacity = 0;
    else
      trailSegments[i][0].material.opacity = speedFactor - ((performance.now() - trailSegments[i][1]) / 120 * speedFactor);
    trailSegments[i][0].scale.x = Math.pow(1. - (performance.now() - trailSegments[i][1]) / 120, 1.);
  }

  objs.ball.position.x += vars.ballVect.x * vars.adjustedBallSpeed;
  objs.ball.position.y += vars.ballVect.y * vars.adjustedBallSpeed;
  objs.ballWrap.position.x += vars.ballVect.x * vars.adjustedBallSpeed;
  objs.ballWrap.position.y += vars.ballVect.y * vars.adjustedBallSpeed;
  csts.ballLight.position.x = objs.ball.position.x;
  csts.ballLight.position.y = objs.ball.position.y;
  trail.ballTrail.position.x = objs.ball.position.x - vars.ballVect.x * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
  trail.ballTrail.position.y = objs.ball.position.y - vars.ballVect.y * (1.2 + trail.ballTrail.geometry.parameters.height / 2.);
  trail.ballTrail.rotation.set(0, 0, Math.atan(vars.ballVect.y / vars.ballVect.x) + Math.PI / 2);
  trail.ballTrail.material.opacity = speedFactor;

  
  vars.glowElapsed = performance.now() - vars.glowStartTime;
  if (vars.glowElapsed < 750)
  {
    if (vars.glowElapsed < 100)
    {
      objs.ball.material.emissiveIntensity = 0.95;
      csts.ballLight.intensity = 15;
    }
    else
    {
      objs.ball.material.emissiveIntensity = 0.95 - (vars.glowElapsed / 750 * 0.7);
      csts.ballLight.intensity = 15 - (vars.glowElapsed / 750 * 10);
    }
  }

  for (let i = 0; i < particleEffects.length; i++)
  {
    let particleElapsed = performance.now() - particleEffects[i][1];
    if (particleElapsed > 600)
    {
      tools.scene.remove(particleEffects[0][0]);
      if ( particleElapsed > 1000)
      {
        tools.scene.remove(particleEffects[0][2]);
        particleEffects.shift();
      }
    }
    else
    {
      let positions = particleEffects[i][0].geometry.attributes.position.array;
      let velocities = particleEffects[i][0].geometry.attributes.velocity.array;
      let initialSpeedBoost = 1.;
      if (particleElapsed < 250)
        initialSpeedBoost += 1 - particleElapsed / 250; 
      for (let j = 0; j < positions.length; j += 3)
      {
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

  // tools.controls.update();
  
  // if (custom.pov === "immersive")
  // {
  //   tools.camera.position.set(custom.immersiveCamPos.x, custom.immersiveCamPos.y, custom.immersiveCamPos.z);
  //   tools.camera.lookAt(0, 0, 0);
  //   let quaternion = new THREE.Quaternion();
  //   quaternion.setFromAxisAngle(custom.immersiveCamPos.clone().normalize(), -Math.PI / 2);
  //   tools.camera.quaternion.multiplyQuaternions(quaternion, tools.camera.quaternion);
  //   tools.camera.fov = 75;
  // }
  update();
  tools.stats.update();
    
  uniformData.u_time.value = performance.now() - startTime;
  tools.renderer.render(tools.scene, tools.camera);

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
    
    console.log(window.innerWidth + "    " + window.innerHeight);
    tools.renderer = new THREE.WebGLRenderer({canvas: containerRef.current});
    tools.renderer.setSize( window.innerWidth, window.innerHeight );
    tools.controls = new OrbitControls( tools.camera, tools.renderer.domElement);
    tools.stats = Stats()
    document.body.appendChild( tools.renderer.domElement );
    document.body.appendChild( tools.stats.dom );
    
    tools.scene.add( objs.ball );
    tools.scene.add( objs.ballWrap );
    tools.scene.add( objs.player1 );
    tools.scene.add( objs.player2 );
    tools.scene.add( objs.topB );
    tools.scene.add( objs.botB );
    tools.scene.add( objs.backB );
    tools.scene.add( objs.background );
    tools.scene.add( csts.ambLight );
    tools.scene.add( csts.dirLight );
    tools.scene.add( csts.ballLight );

    if (custom.pov === "classic")
    {
      tools.camera.position.set(0, 0, 20);
      tools.camera.lookAt(0, 0, 0);
    }
    else if (custom.pov === "immersive")
    {
      tools.camera.position.set(custom.immersiveCamPos.x, custom.immersiveCamPos.y, custom.immersiveCamPos.z);
      tools.camera.lookAt(0, 0, 0);
      let quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(custom.immersiveCamPos.clone().normalize(), -Math.PI / 2);
      tools.camera.quaternion.multiplyQuaternions(quaternion, tools.camera.quaternion);
      tools.camera.fov = 75;
    }

    let backgroundGeo = new THREE.SphereGeometry(CONST.DECORSIZE, 40, 40);
    console.log(tools.camera.projectionMatrix);

    let backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: uniformData,
      fragmentShader: custom.shader_utils + custom.shader_background
    });
    let background = new THREE.Mesh( backgroundGeo, backgroundMaterial );

    trail.trailGeo = new THREE.CylinderGeometry(0.4 * CONST.BALLRADIUS, 0.3 * CONST.BALLRADIUS, 0.6, 30, 1, true);
    trail.trailMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: 0, transparent: true} );
    trail.ballTrail = new THREE.Mesh( trail.trailGeo, trail.trailMaterial );
    trail.ballTrail.scale.y = 0.4;
    trail.ballTrail.position.set(1.2 + trail.ballTrail.geometry.parameters.height / 2., 0, 0);
    trail.ballTrail.rotation.set(0, 0, Math.PI / 2);

    tools.scene.add(background);
    tools.scene.add(trail.ballTrail);

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