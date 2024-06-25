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


let isPlaying = false;
export function startGame(){

	//---------INIT----------
	const world = new World();
	console.log(world.ready);
	console.log(world.paddle);
	world.ready.then(() => {

		console.log("Meshes have been loaded");

		//---------OBJECTS----------

		const match = new Match(world);

		const content = null || document.getElementById('page_root');
		content.replaceChildren(world.renderer.domElement);

		window.addEventListener('resize', function() {
			world.resize(window.innerWidth, window.innerHeight);
		})

		
		//---------KEYBOARD INPUT----------

		const keyDownBind = match.onKeyDown.bind(match);
		const keyUpBind = match.onKeyUp.bind(match)

		document.addEventListener("keydown", keyDownBind, false);
		document.addEventListener("keyup", keyUpBind, false);

		//---------SCENE ADD----------
		world.add(match.player1.mesh);
		world.add(match.player2.mesh);
		world.add(match.ball.mesh);

		isPlaying = true;

		// const gameLoop = function()
		// {
		// 	if(isPlaying){
		// 		requestAnimationFrame(gameLoop);
		// 		match.update();
		// 		match.render();
		// 	}
		// };

		// function disposeThreeJS() {
		// 	while (world.scene.children.length > 0) {
		// 		const object = world.scene.children[0];
		
		// 		// Rimuovi l'oggetto dalla scena
		// 		world.remove(object);
		
		// 		// Rilascia le risorse delle geometrie
		// 		if (object.geometry) {
		// 			object.geometry.dispose();
		// 		}
		
		// 		// Rilascia le risorse dei materiali
		// 		if (object.material) {
		// 			if (Array.isArray(object.material)) {
		// 				object.material.forEach(material => {
		// 					material.dispose();
		// 				});
		// 			} else {
		// 				object.material.dispose();
		// 			}
		// 		}
		// 	}
				
		// 	world.renderer.dispose();
		// 	console.log(world.scene);
		// 	console.log("scena ^");
		// }
		
		const gameLoop = function(resolve) {
			if (isPlaying) {
			  requestAnimationFrame(() => gameLoop(resolve));
			  match.update();
			  match.render();
			} else {
			  resolve();
			}
		};

		let gameStatus = new Promise((resolve) =>{
			gameLoop(resolve)
		})
		// gameLoop();
		gameStatus.then(() => {
			console.log("Game stopped");
			document.removeEventListener("keydown", keyDownBind, false);
			document.removeEventListener("keyup", keyUpBind, false);

			console.log(world.renderer.info);

			setTimeout(() => console.log(world.renderer.info), 5000);
			// console.log(world.renderer.info)

		})

	});
	
}
export function stopGame(){
	isPlaying = false;
}






/*
let isPlaying = true;

const gameLoop = function(resolve) {
  if (isPlaying) {
    requestAnimationFrame(() => gameLoop(resolve));
    match.update();
    match.render();
  } else {
    resolve();
  }
};

function startGame() {
  return new Promise((resolve) => {
    gameLoop(resolve);
  });
}

async function runGame() {
  await startGame();
  console.log("Game stopped");
}

runGame();

// Simulazione: fermare il gioco dopo 5 secondi
setTimeout(() => {
  isPlaying = false;
}, 5000);*/