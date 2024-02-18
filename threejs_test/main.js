import * as THREE from 'three';

const GAMEWIDTH = 45;
const GAMEHEIGHT = 30;
const PLAYERLEN = 4.5;
const BALLRADIUS = 0.6;
const SPEEDINCREMENT = 1.07;
const BALLMAXSPEED = 0.75;
const MINREBOUNDANGLE = 40;

const playerSpeed = 0.65;
let ballSpeed = 0.35;
let adjustedBallSpeed = 0.35;
let	dotProduct = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const sphereGeo = new THREE.SphereGeometry(BALLRADIUS, 40, 40);
const playerGeo = new THREE.BoxGeometry(0.5, PLAYERLEN, 0.6);
const upDownBoundary = new THREE.BoxGeometry(GAMEWIDTH, 0.5, 0.6);

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

player1.position.set(-GAMEWIDTH / 2, 0, 0);
player2.position.set(GAMEWIDTH / 2, 0, 0);
topB.position.set(0, GAMEHEIGHT / 2, 0);
botB.position.set(0, -GAMEHEIGHT / 2, 0);
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

let keys = {};
document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
});

document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
});

function update()
{
    if (keys['ArrowUp'] && player2.position.y < GAMEHEIGHT / 2 - PLAYERLEN / 2) {
        player2.position.y += playerSpeed;
    }
    if (keys['ArrowDown'] && player2.position.y > -(GAMEHEIGHT / 2 - PLAYERLEN / 2)) {
        player2.position.y -= playerSpeed;
    }
    if (keys['KeyW'] && player1.position.y < GAMEHEIGHT / 2 - PLAYERLEN / 2) {
        player1.position.y += playerSpeed;
    }
    if (keys['KeyS'] && player1.position.y > -(GAMEHEIGHT / 2 - PLAYERLEN / 2)) {
        player1.position.y -= playerSpeed;
    }
    requestAnimationFrame( update );
}

function animate()
{
	requestAnimationFrame( animate );
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
		if ( Math.abs(reboundDiff) > PLAYERLEN / 2 + BALLRADIUS / 2 - 0.3 &&
			(Math.abs(ball.position.x - player1.position.x) < 0.52 || Math.abs(ball.position.x - player2.position.x) < 0.52))
			ballVect.set(ball.position.x / (GAMEWIDTH / 2), -reboundDiff);
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
		if (Math.acos(dotProduct * directions[0]) * 180 / Math.PI > 90 - MINREBOUNDANGLE)
		{
			ballVect.set(Math.cos(MINREBOUNDANGLE * Math.PI / 180) * directions[0], Math.sin(MINREBOUNDANGLE * Math.PI / 180) * directions[1]);
			ballVect.normalize();
		}

		// ADJUST THE BALL SPEED, WITHOUT GOING OVER OR UNDER THE LIMITS
		if (ballSpeed < BALLMAXSPEED)
			ballSpeed *= SPEEDINCREMENT;
		adjustedBallSpeed *= 1 + (Math.abs(reboundDiff) - (PLAYERLEN / 6)) / 2;
		if (adjustedBallSpeed < ballSpeed)
			adjustedBallSpeed = ballSpeed;
		else if (adjustedBallSpeed > BALLMAXSPEED)
			adjustedBallSpeed = BALLMAXSPEED;
    }
	// CHECK TOP AND BOT BOUNDARY COLLISIONS
    if (topHB.intersectsBox(sph) || botHB.intersectsBox(sph))
		ballVect.y *= -1;
	
	// RESTART FROM CENTER WITH RESET SPEED IF A PLAYER LOSES
    if (ball.position.x > GAMEWIDTH / 2 + 2 || ball.position.x < -(GAMEWIDTH / 2 + 2))
    {
        if (ball.position.x > GAMEWIDTH / 2 + 2)
            ballVect.set(1, 0, 0);
        else
            ballVect.set(-1, 0, 0);
        ball.position.set(0, 0, 0);
		ballSpeed = 0.35;
		adjustedBallSpeed = 0.35;
    }

    ball.position.x += ballVect.x * adjustedBallSpeed;
    ball.position.y += ballVect.y * adjustedBallSpeed;
	renderer.render( scene, camera );
}

update();
animate();
