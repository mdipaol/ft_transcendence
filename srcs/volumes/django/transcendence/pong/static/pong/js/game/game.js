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

	let P1upKey = 87;
	let P1downKey = 83;
	let P2upKey = 38;
	let P2downKey = 40;


	function onKeyDown(event) {
		if (event.which == P1upKey) //w key
			match.player1.moves.up = true;
		if (event.which == P1downKey) //s key
			match.player1.moves.down = true;
		if (event.which == P2upKey) //up arrow
			match.player2.moves.up = true;
		if (event.which == P2downKey) //down arrow
			match.player2.moves.down = true;

		if (event.which == 50)//first person with '2' key
		{
			world.setCamera(world.player2Camera);
			P1upKey = 68;
			P1downKey = 65;
			P2upKey = 39;
			P2downKey = 37;
		}
		if (event.which == 49)//first person with '1' key
		{
			world.setCamera(world.player1Camera);
			P1upKey = 65;
			P1downKey = 68;
			P2upKey = 37;
			P2downKey = 39;
		}
		if (event.which == 32)
		{
			world.setCamera(world.mainCamera);
			world.mainCamera.position.set(0, -10, 70);
			world.mainCamera.lookAt(0, 0, 0);
			P1upKey = 87;
			P1downKey = 83;
			P2upKey = 38;
			P2downKey = 40;
		}
	}

	function onKeyUp(event) {
		if (event.which == P1upKey)
			match.player1.moves.up = false;
		if (event.which == P1downKey)
			match.player1.moves.down = false;
		if (event.which == P2upKey)
			match.player2.moves.up = false;
		if (event.which == P2downKey)
			match.player2.moves.down = false;
	}

	//---------MOVEMENTS----------

	// function updateMovements()
	// {
	// 	if (player1.moves.up && player1.mesh.position.y < 27)
	// 	{
	// 		player1.mesh.position.y += MOVSPEED;
	// 		//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	// 	}
	// 	if (player1.moves.down && player1.mesh.position.y > -27)
	// 	{
	// 		player1.mesh.position.y -= MOVSPEED;
	// 		//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	// 	}
	// 	if (player2.moves.up && player2.mesh.position.y < 27)
	// 	{
	// 		player2.mesh.position.y += MOVSPEED;
	// 		//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	// 	}
	// 	if (player2.moves.down && player2.mesh.position.y > -27)
	// 	{
	// 		player2.mesh.position.y -= MOVSPEED;
	// 		//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	// 	}
	// }

	//---------COLLISIONS----------


	// function wallCollision(ball)
	// {
	// 	if (ball.mesh.position.y > 28  || ball.mesh.position.y < -28)
	// 		return true
	// 	else
	// 		return false
	// }


	// function checkCollision(object1, object2) {
	//     var box1 = new THREE.Box3().setFromObject(object1);
	//     var box2 = new THREE.Box3().setFromObject(object2);
	//     return box1.intersectsBox(box2);
	// }

	//---------SCENE ADD----------
	world.add(match.player1.mesh);
	world.add(match.player2.mesh);
	world.add(match.ball.mesh);

	//scene.add(spotLight);
	//scene.add(ambientLight);


	//---------WEBSOCKET----------
	/*
	const socket = new WebSocket(
		'wss://'
		+ window.location.host
		+ '/ws'
		+ window.location.pathname
	)

	socket.addEventListener('message', function (event) {
		//console.log("ciao")
		var msg = JSON.parse(event.data);
		//console.log()
		if (msg.type == "game_message")
		{
			//player1.position.y = msg.message.player_one.y;
			//player2.position.y = msg.message.player_two.y;
		}
		else if (msg.type == "game_start")
		{
			console.log("game started")
			started = true;
		}
		else if (msg.type == "game_end")
		{
			console.log("game ended")
			started = false;
		}
	});

	*/

	//---------UPDATE AND RENDER----------
	// var update = function()
	// {
	// 	updateMovements();
	// 	world.rotatePowerUp();
	// 	ball.mesh.position.x += ball.speed * ball.direction.x;
	// 	ball.mesh.position.y += ball.speed * ball.direction.y;
	// 	if (checkCollision(player1.mesh, ball.mesh) && !match.collision)
	// 	{
	// 		/* if (ball.speed < 2)
	// 			ball.speed *= ACCELERATION; */
	// 		ball.direction.x *= -1;
	// 		ball.direction.y = (ball.mesh.position.y - player1.mesh.position.y)/10;
	// 		match.collision = true;
	// 		match.updateExchanges();
	// 	}
	// 	if (checkCollision(player2.mesh, ball.mesh) && !match.collision)
	// 	{
	// 		// if (ball.speed  < 2)
	// 		// 	ball.speed  *= ACCELERATION;
	// 		ball.direction.x *= -1;
	// 		ball.direction.y = (ball.mesh.position.y - player2.mesh.position.y)/10;
	// 		match.collision = true;
	// 		match.updateExchanges()
	// 	}
	// 	// PowerUp collision
	// 	if (world.PowerUp && checkCollision(ball.mesh, world.PowerUp)){
	// 		world.remove(world.PowerUp);
	// 		match.activePowerUp = false;
	// 		match.waitPowerup = 0;
	// 	}
	// 	if (wallCollision(ball))
	// 		ball.direction.y *= -1;
	// 	//Reset positions
	// 	if (ball.mesh.position.x > player2.mesh.position.x +5  || ball.mesh.position.x < player1.mesh.position.x - 5)
	// 		match.updateScore();

	// 	if (match.collision && ball.mesh.position.x > -10 && ball.mesh.position.x < 10)
	// 		match.collision = false;
	// 	ball.mesh.position.z = ball.getZ();
	// }

	// var render = function()
	// {
	// 	// renderer.render(scene, camera);
	//     world.renderer.render(world.scene, world.activeCamera);
	// };

	var gameLoop = function()
	{
			requestAnimationFrame(gameLoop);
			match.update();
			match.render();
	};

	gameLoop();
});
