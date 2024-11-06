"use client"

import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { shaders } from './backShaders.jsx';
import { useRef, useEffect } from 'react';

const setBallColor = (ball, speed) => {
    const speedDiff = speed;
    let color = Math.min(speedDiff * 255, 255) << 16 | 255 * (1 - speedDiff);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
    ball.material.dispose();
    ball.material = ballMaterial;
}

const createBall = (vars) => {
    let ball = new THREE.Mesh(vars.ballgeo, vars.ballmat);
    const side = Math.random() < 0.5 ? -1 : 1;
    const yspawn = (Math.random() - 0.5) * 40;
    const zspawn = (Math.random() - 0.5) * 80;
    ball.position.set(side * 30, yspawn, zspawn);

    const xOffset = (Math.random() - 0.5) * 2
    const yOffset = (Math.random() - 0.5) * 2
    const zOffset = (Math.random() - 0.5) * 2
    let vect = new THREE.Vector3(-side * 30 + xOffset, -yspawn + yOffset, -zspawn + zOffset);
    vect.normalize();
    const speed = Math.max(Math.random(), 0.15);
    setBallColor(ball, speed);
    vars.scene.add(ball);
    vars.balls.push([ball, vect, speed]);
}

function animate(vars) {
    if (performance.now() - vars.ballTimer > vars.ballSpawnTick) {
        const spawnChance = Math.random() - (1 - (vars.spawnChanceCounter / 10));

        if (spawnChance > 0) {
            createBall(vars);
            vars.spawnChanceCounter = 1;
        }
        else
            vars.spawnChanceCounter += 1;
        vars.ballTimer = performance.now();
    }
    if (vars.balls.length > 0) {
        let x = 0;
        let y = 0;
        let z = 0;
        let dist = 0;
        for (let i = 0; i < vars.balls.length; i++) {
            x = vars.balls[i][0].position.x;
            y = vars.balls[i][0].position.y;
            z = vars.balls[i][0].position.z;
            vars.balls[i][0].position.x = x + vars.balls[i][1].x * vars.balls[i][2];
            vars.balls[i][0].position.y = y + vars.balls[i][1].y * vars.balls[i][2];
            vars.balls[i][0].position.z = z + vars.balls[i][1].z * vars.balls[i][2];
            dist = Math.sqrt(x * x + y * y + z * z);
            if (dist < 2.6) {
                vars.balls[i][1].x = x + (x - vars.balls[i][1].x)
                vars.balls[i][1].y = y + (y - vars.balls[i][1].y)
                vars.balls[i][1].z = z + (z - vars.balls[i][1].z)
                vars.balls[i][1].normalize();
                vars.uniformData.u_ballSpeed.value = vars.balls[i][2];
                vars.uniformData.u_impactTime.value = performance.now() - vars.startTime;
            }
            else if (dist > 120) {
                vars.balls[i][0].material.dispose();
                vars.balls[i][0].geometry.dispose();
                vars.scene.remove(vars.balls[i][0]);
                vars.balls.splice(i, 1);
            }
        }
    }
    // controls.update();
    vars.uniformData.u_time.value = performance.now() - vars.startTime;
    vars.renderer.render(vars.scene, vars.camera);
    setTimeout(function () {
        requestAnimationFrame(() => animate(vars));
    }, 5);
}

export default function HomeScene() {
    // let controls = new OrbitControls( camera, renderer.domElement);
    const containerRef = useRef(null);
    const vars = {};

    useEffect(() => {
        vars.scene = new THREE.Scene();
        vars.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        vars.renderer = new THREE.WebGLRenderer({ canvas: containerRef.current });
        vars.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(vars.renderer.domElement);

        vars.startTime = performance.now();
        vars.ballTimer = performance.now();
        vars.ballSpawnTick = 1200;
        vars.spawnChanceCounter = 0;
        const ambLight = new THREE.AmbientLight(0x444444);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        vars.scene.add(ambLight);
        vars.scene.add(dirLight);

        dirLight.position.set(0, 0, 25);
        vars.camera.position.set(0, 0, 20);
        vars.camera.lookAt(0, 0, 0);

        vars.uniformData = {
            u_time:
                { type: 'f', value: performance.now() - vars.startTime },
            u_resolution:
                { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_ballSpeed:
                { type: 'f', value: 0. },
            u_impactTime:
                { type: 'f', value: 0. },
            projectionMatrix:
                { value: vars.camera.projectionMatrix },
            viewMatrix:
                { value: vars.camera.matrixWorldInverse },
            camPos:
                { value: vars.camera.position.y },
        };

        let orbgeo = new THREE.SphereGeometry(2.5, 100, 100);
        let orbmat = new THREE.ShaderMaterial({
            uniforms: vars.uniformData,
            vertexShader: shaders.orbvs,
            fragmentShader: shaders.orbfs,
            transparent: true,
        });
        let orb = new THREE.Mesh(orbgeo, orbmat);
        orb.rotation.set(Math.PI / 2, 0, 0);

        vars.ballgeo = new THREE.SphereGeometry(0.5, 40, 40);
        vars.ballmat = new THREE.MeshPhongMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 0.25, transparent: true, opacity: 1. });
        vars.balls = [];

        let backGeo = new THREE.BoxGeometry(300, 300, 1);
        let backMat = new THREE.ShaderMaterial({
            uniforms: vars.uniformData,
            fragmentShader: shaders.backfs,
        });
        let backboard = new THREE.Mesh(backGeo, backMat);

        vars.scene.add(orb);
        vars.scene.add(backboard);
        backboard.position.set(0, 0, -50);
        animate(vars);

    }, [])
    return <canvas className="d-flex" ref={containerRef} />
}

