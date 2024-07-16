import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// import { Player, Ball, Match, World } from "./modules.js"
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Match } from './Match.js';
import { World } from './World.js';
import { World1 } from './World1.js'
import { OnlineMatch } from './OnlineMatch.js';
import { MatchBot } from './Bot.js';

(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

const content = null || document.getElementById('page_root');
let isPlaying = false;
export async function startGame(gameMode){

	//---------INIT----------
	const world = new World1();

	content.replaceChildren();

	await world.worldReady();
	console.log("Meshes loaded");
	let match = null;

	switch (gameMode) {
		case 'local':
		  match = new Match(world);
		  break;
		case 'remote':
		  match = new OnlineMatch(world);
		  break;
		case 'bot':
		  match  = new MatchBot(world);
		  break;
		default:
		  match = new Match(world);
	  }

	// canvas dom element

	content.replaceChildren(world.renderer.domElement);

	window.addEventListener('resize', function() {
		world.resize(window.innerWidth, window.innerHeight);
	})

	//---------KEYBOARD INPUT----------
	const keyDownBind = match.onKeyDown.bind(match);
	const keyUpBind = match.onKeyUp.bind(match);

	document.addEventListener("keydown", keyDownBind, false);
	document.addEventListener("keyup", keyUpBind, false);

	//---------SCENE ADD----------
	world.add(match.player1.mesh);
	world.add(match.player2.mesh);
	world.add(match.ball.mesh);

	isPlaying = true;
	const gameLoop = function(resolve) {
		if (isPlaying) {
			requestAnimationFrame(() => gameLoop(resolve));
			match.update();
			match.render();
		}
		else {
			resolve();
		}
	};

	let gameStatus = new Promise((resolve) =>{
		gameLoop(resolve)
	})

	gameStatus.then(() => {
		console.log("Game stopped");
		document.removeEventListener("keydown", keyDownBind, false);
		document.removeEventListener("keyup", keyUpBind, false);
	})
}
export function stopGame(){
	isPlaying = false;
}
