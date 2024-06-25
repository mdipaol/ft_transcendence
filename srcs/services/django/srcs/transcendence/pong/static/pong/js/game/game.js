import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// import { Player, Ball, Match, World } from "./modules.js"
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Match } from './Match.js';
import { World } from './World.js';
import { OnlineMatch } from './OnlineMatch.js';

// region MAIN

//---------INIT----------
const world = new World();
console.log(world.ready);
console.log(world.paddle);
world.ready.then(() => {

	console.log("Meshes have been loaded");

	//---------OBJECTS----------

	const match = new OnlineMatch(world);

	document.body.appendChild(world.renderer.domElement);

	window.addEventListener('resize', function() {
		world.resize(window.innerWidth, window.innerHeight);
	})

	//---------KEYBOARD INPUT----------

	document.addEventListener("keydown", match.onKeyDown.bind(match), false);
	document.addEventListener("keyup", match.onKeyUp.bind(match), false);

	//---------SCENE ADD----------
	world.add(match.player1.mesh);
	world.add(match.player2.mesh);
	world.add(match.ball.mesh);

	var gameLoop = function()
	{
			requestAnimationFrame(gameLoop);
			match.update();
			match.render();
	};

	gameLoop();
});
