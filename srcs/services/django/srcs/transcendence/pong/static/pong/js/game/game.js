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
import { TournamentMatch } from './TournamentMatch.js';
import { BotMatch } from './BotMatch.js';
import * as UTILS from './utils.js';
import Play from '../views/pages/Play.js';

import triggerHashChange from '../services/utils.js';


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
	const gameContainer = document.createElement('div');
	gameContainer.setAttribute('class', 'game-container');
	content.appendChild(gameContainer);

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

	let theFinals = await fetch(`https://${window.location.host}/interface_thefinals/`);
	let underground = await fetch(`https://${window.location.host}/interface_underground/`);
	let endScreen = await fetch(`https://${window.location.host}/match_end/`);

	//userInterface.innerHTML = await response.text();
	// canvas dom element
	const html = await theFinals.text();
	const htmlU = await underground.text();
	const htmlEnd = await endScreen.text();
	
	const parser = new DOMParser();
	// Parse the text
	const doc = parser.parseFromString(html, "text/html");
	const docU = parser.parseFromString(htmlU, "text/html");
	const interfaceUser = doc.getElementById('interface');
	const interfaceUserU = docU.getElementById('interface');
	//const buttom = document.querySelectorAll('button');
	if (worldMap != 'underground'){
		// Set match html variable with interface html element
		match.initHtmlInterface(interfaceUser);
		if (interfaceUser)
			content.appendChild(interfaceUser);
	}
	else if (worldMap === 'underground')
	{
		match.initHtmlInterface(interfaceUserU);
		if (interfaceUserU)
			content.appendChild(interfaceUserU);
	}
	match.endScreen = parser.parseFromString(htmlEnd, "text/html").getElementById('interface');

	
	gameContainer.appendChild(world.renderer.domElement)
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
		}
		else {
			resolve();
		}
	};
			
	await match.ready();
	let gameStatus = new Promise((resolve) =>{
		gameLoop(resolve)
	})
	
	const lincks = document.querySelectorAll('li');
	lincks.forEach(li =>{
		li.addEventListener('click', (event)=>{
			if (match.socket)
				match.socket.close();
			match.ended = true;
			match.QuitMatch = true;
			if(li.querySelector('a').innerHTML == "Play")
				triggerHashChange('/play/');
		}, {once: true});
	})
				
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	gameStatus.then(async () => {

		if(match.QuitMatch == true){
			if(match.world.soundEndMach.isPlaying){
				match.world.soundEndMach.stop();
				match.world.soundEndMach.disconnect();
			}
			match.world.destroySoundWorld();
		}
		else{
			if(match.world.soundPoint.isPlaying){
				match.world.soundPoint.stop();
				match.world.soundPoint.disconnect();
			}
			match.world.soundEndMach.play();
			await sleep(5000);
			match.world.destroySoundWorld();
		}
		match.destroy(match.world.scene);

		document.removeEventListener("keydown", keyDownBind, false);
		document.removeEventListener("keyup", keyUpBind, false);
		if(match.QuitMatch == false)
			triggerHashChange('/play/');
	})	
}




////////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

export async function startTournamentGame(matchId, alias1, alias2){

	// page_root cleaning
	const content = null || document.getElementById('page_root');
	content.replaceChildren();
	const gameContainer = document.createElement('div');
	gameContainer.setAttribute('class', 'game-container');
	content.appendChild(gameContainer);

	// Loading page
	// ...

	//---------INIT----------
	let world = new World1();

	await world.worldReady();
	console.log("Meshes loaded");

	const match = new TournamentMatch(world, true);

	let response = await fetch(`https://${window.location.host}/interface_thefinals/`);
	let endScreen = await fetch(`https://${window.location.host}/match_end/`);


	const html = await response.text();
	const htmlEnd = await endScreen.text();
	
	const parser = new DOMParser();
	// Parse the text
	const doc = parser.parseFromString(html, "text/html");
	const interfaceUser = doc.getElementById('interface');

	const lincks = document.querySelectorAll('li');
	
	match.initHtmlInterface(interfaceUser);
	if (interfaceUser)
		content.appendChild(interfaceUser);
	match.endScreen = parser.parseFromString(htmlEnd, "text/html").getElementById('interface');

	gameContainer.appendChild(world.renderer.domElement);
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
	
	lincks.forEach(li =>{
		li.addEventListener('click', (event)=>{
			if (match.socket)
				match.socket.close();
			match.ended = true;
			match.QuitMatch = true;
			if(li.querySelector('a').innerHTML == "Play")
				triggerHashChange('/play/');
		}, {once: true});
	})
	
	const gameLoop = function(resolve) {
		if (!match.ended) {
			requestAnimationFrame(() => gameLoop(resolve));
			match.update();
			match.render();
		}
		else {
			resolve();
		}
	};

	await match.ready(matchId);

	let gameStatus = new Promise((resolve) =>{
		gameLoop(resolve)
	})

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	gameStatus.then(async () => {
		console.log("Game stopped");
		if(match.QuitMatch == true){
			if(match.world.soundEndMach.isPlaying){
				match.world.soundEndMach.stop();
				match.world.soundEndMach.disconnect();
			}
			match.world.destroySoundWorld();
		}
		else{
			if(match.world.soundPoint.isPlaying){
				match.world.soundPoint.stop();
				match.world.soundPoint.disconnect();
			}
			match.world.soundEndMach.play();
			await sleep(5000);
			match.world.destroySoundWorld();
		}
		match.destroy(match.world.scene);
		document.removeEventListener("keydown", keyDownBind, false);
		document.removeEventListener("keyup", keyUpBind, false);
		if(match.QuitMatch == false)
			triggerHashChange('/tournament_join/');
	})
}
