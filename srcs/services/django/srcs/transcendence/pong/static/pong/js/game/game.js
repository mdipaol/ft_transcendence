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
import { BotMatch } from './BotMatch.js';

import triggerHashChange from '../services/utils.js';

(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

/**
	@description This function start a game selecting the match, the map and if powerUps will be active
	@param {String} gameMode Choose between 'local', 'remote', 'bot'
	@param {String} worldMap Choose 'underground' for the first map, 'thefinals' for the second map.
	@param {Boolean} powerUpMode True for the powerUp game mode
**/
export async function startGame(gameMode, worldMap, powerUpMode){

	// page_root cleaning
	const content = null || document.getElementById('page_root');
	content.replaceChildren();

	// Loading page
	// ...

	//---------INIT----------
	let world = null;
	if (worldMap == 'underground')
		world = new World();
	else
		world = new World1();

	await world.worldReady();
	console.log("Meshes loaded");

	let match = null;

	switch (gameMode) {
		case 'local':
		  match = new Match(world, powerUpMode);
		  break;
		case 'remote':
		  match = new OnlineMatch(world, powerUpMode);
		  break;
		case 'bot':
		  match  = new BotMatch(world, powerUpMode);
		  break;
		default:
		  match = new Match(world, powerUpMode);
	  }


	const response = await fetch(`https://${window.location.host}/interface_underground/`);
	// userInterface.innerHTML = await response.text();
	// canvas dom element
	const html = await response.text();
	const parser = new DOMParser();

    // Parse the text
    const doc = parser.parseFromString(html, "text/html");
	const interfaceUser = doc.getElementById('interface');

	// Set match html variable with interface html element
	match.initHtmlInterface(interfaceUser);

	content.appendChild(interfaceUser);
	content.appendChild(world.renderer.domElement);
	// content.appendChild(userInterface);

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

	const gameLoop = function(resolve) {
		if (!match.ended) {
			requestAnimationFrame(() => gameLoop(resolve));
			match.update();
			match.render();
			/*if (match.connected && !match.culo)
				{
					//this.socket.send(JSON.stringify({ 'type': 'ready'}));
					console.log("..");
					match.culo = true;     
					IN CASO IN CUI LA PARTITA INIZI PRIMA CHE ENTRAMBI 
					I PLAYER ABBIANO RENDERIZZATO TUTTO
			}*/
		}
		else {
			resolve();
		}
	};

	await match.ready();

	// window.addEventListener('hashchange', () =>{
	// 	stopGame();
	// });

	// console.log("sicurissimo non arriva");
	let gameStatus = new Promise((resolve) =>{
		gameLoop(resolve)
	})

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	gameStatus.then(async () => {
		console.log("Game stopped");
		match.world.soundEndMach.play();
		// if(match.world.soundEndMach.isPlaying){
		// 	match.world.destroySoundWorld();
		// }
		// else{
		// 	match.world.soundEndMach.stop()
		// 	match.world.soundEndMach.disconnect();
		// }
		await sleep(5000);
		match.world.destroySoundWorld();
		document.removeEventListener("keydown", keyDownBind, false);
		document.removeEventListener("keyup", keyUpBind, false);
		triggerHashChange('/play/'); // Perche non funzionaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?
	})
}