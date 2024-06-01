import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { Ball } from "./Ball.js"
import * as UTILS from './utils.js';
import { Player } from './Player.js';

export class Match {
    constructor(world){
		this.world = world;
        this.player1 = new Player(world.paddle);
        this.player2 = new Player(world.paddle);
		console.log(this.player1)
        this.ball = new Ball(0xf06400);
		this.maxScore = UTILS.MAXSCORE;
        this.score1 = 0;
        this.score2 = 0;
		this.exchangesFont = world.font;
		this.scoreText = this.scoreTextInit();
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
		this.collision = false;
		this.player1.mesh.position.x = -54;
		this.player2.mesh.position.x = 54;
		this.player1.mesh.rotation.z = -Math.PI/2;
		this.player2.mesh.rotation.z = Math.PI/2;
		this.player1.upKey = UTILS.W;
		this.player1.downKey = UTILS.S;
		this.player2.upKey = UTILS.ARROWUP;
		this.player2.downKey = UTILS.ARROWDOWN;

		// PowerUps
		this.waitPowerup = 0;
		this.activePowerUp = false;
		this.meshPowerUp = null;
		this.tripleEnabled = false;
		this.fakeBalls = [new Ball(0xff0000), new Ball(0x0000ff)]
	}

	exchangesTextInit() {
		if (this.exchangesText && this.exchangesText[0] && this.exchangesText[1] && this.exchangesText[2]) {
			this.world.remove(this.exchangesText[0]);
			this.world.remove(this.exchangesText[1]);
			this.world.remove(this.exchangesText[2]);
		}
		const geometry = new TextGeometry( "0", {
			font: this.exchangesFont,
			size: 8,
			height: 1,
		})
		const emissive_color = 0x4DE8FF;
		const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		const mesh = new THREE.Mesh( geometry, material );

	// Trasla la mesh della metà della larghezza del testo per centrarla
        mesh.rotation.set(Math.PI/2, Math.PI/2, 0);
        mesh.position.set(-125, 0, 5);

		const mirrored = mesh.clone();
		const mirrored2 = mesh.clone();
		mirrored.scale.x = -mesh.scale.x;
		mirrored2.position.set(0, 50, -22.5);
		mirrored2.rotation.set( 0, 0, 0);
		mirrored.position.set(124, 0, 5)
        this.world.add(mesh);
		this.world.add(mirrored);
		this.world.add(mirrored2);
		const meshes = [mesh, mirrored, mirrored2];
		return meshes;
	}

	updateExchanges() {

		const geometry = new TextGeometry( this.exchanges.toString(), {
			font: this.exchangesFont,
			size: 8,
			height: 1,
		});
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.exchangesText[0].geometry = geometry;
		this.exchangesText[1].geometry = geometry;
		this.exchangesText[2].geometry = geometry;
	}

	scoreTextInit() {
		const geometry = new TextGeometry( "0 - 0", {
			font: this.exchangesFont,
			size: 20,
			height: 1,
		})
		const emissive_color = 0xFFD33D;
		const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		const mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.set(Math.PI/2, Math.PI/2, 0);
		mesh.position.set(-125, 0, 20);

		const mirrored = mesh.clone();
		mirrored.scale.x = -mesh.scale.x;
		mirrored.position.set(124, 0, 20)
		this.world.add(mirrored);
		this.world.add(mesh);
		const meshes = [mesh, mirrored];
		return meshes;
	}

	updateScoreText(){
		const geometry = new TextGeometry( this.score1.toString() + " - "  + this.score2.toString(), {
			font: this.exchangesFont,
			size: 20,
			height : 1,
		})
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.scoreText[0].geometry = geometry;
		this.scoreText[1].geometry = geometry;
	}

	updateScore() {
		if (this.ball.mesh.position.x < 0)
			this.score2++;
		else
			this.score1++;
		this.updateScoreText();
		if (this.score1 == this.maxScore || this.score2 == this.maxScore)
			this.gameEnd();
		this.ball.mesh.position.x = 0;
		this.ball.mesh.position.y = 0;
		this.ball.mesh.position.z = 0;
		this.player1.mesh.position.y = 0;
		this.player2.mesh.position.y = 0;
		this.player1.mesh.position.z = -10;
		this.player2.mesh.position.z = -10;
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.speed = UTILS.MOVSPEED;
		this.player2.speed = UTILS.MOVSPEED;
		this.ball.speed = UTILS.STARTINGSPEED;
		this.player1.mesh.scale.set(1, 1, 1);
		this.player2.mesh.scale.set(1, 1, 1);
		// Reset direction
		this.ball.direction.y = 0;
		const normalized = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
		this.ball.direction.x = normalized[0];

		// Triple Ball
		this.remove_triple();


		// Exchanges
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
	}


	onKeyDown(event) {
		console.log(this.player1)
		if (event.which == this.player1.upKey) //w key
			this.player1.moves.up = true;
		if (event.which == this.player1.downKey) //s key
			this.player1.moves.down = true;
		if (event.which == this.player2.upKey) //up arrow
			this.player2.moves.up = true;
		if (event.which == this.player2.downKey) //down arrow
			this.player2.moves.down = true;

		if (event.which == UTILS.TWO)//first person with '2' key
		{
			this.world.setCamera(this.world.player2Camera);
			this.player1.upKey = UTILS.D;
			this.player1.downKey = UTILS.A;
			this.player2.upKey = UTILS.ARROWRIGHT;
			this.player2.downKey = UTILS.ARROWLEFT;
		}
		if (event.which == UTILS.ONE)//first person with '1' key
		{
			this.world.setCamera(this.world.player1Camera);
			this.player1.upKey = UTILS.A;
			this.player1.downKey = UTILS.D;
			this.player2.upKey = UTILS.ARROWLEFT;
			this.player2.downKey = UTILS.ARROWRIGHT;
		}
		if (event.which == UTILS.SPACE)
		{
			this.world.setCamera(this.world.mainCamera);
			this.world.mainCamera.position.set(0, -10, 70);
			this.world.mainCamera.lookAt(0, 0, 0);
			this.player1.upKey = UTILS.W;
			this.player1.downKey = UTILS.S;
			this.player2.upKey = UTILS.ARROWUP;
			this.player2.downKey = UTILS.ARROWDOWN;
		}
	}

	onKeyUp(event) {
		if (event.which == this.player1.upKey)
			this.player1.moves.up = false;
		if (event.which == this.player1.downKey)
			this.player1.moves.down = false;
		if (event.which == this.player2.upKey)
			this.player2.moves.up = false;
		if (event.which == this.player2.downKey)
			this.player2.moves.down = false;
	}

	updateMovements() {
		if (this.player1.moves.up && this.player1.mesh.position.y < 27)
		{
			this.player1.mesh.position.y += this.player1.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player1.moves.down && this.player1.mesh.position.y > -27)
		{
			this.player1.mesh.position.y -= this.player1.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
		}
		if (this.player2.moves.up && this.player2.mesh.position.y < 27)
		{
			this.player2.mesh.position.y += this.player2.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player2.moves.down && this.player2.mesh.position.y > -27)
		{
			this.player2.mesh.position.y -= this.player2.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
		}
	}

	startPowerUp(){
		if(this.ball.direction.x > 0 )// player1
		{
			if(this.world.PowerUp == this.world.arrayPowerup[0]){
				if(this.ball.position.x >= -5)
					this.ball.speed += 5;
				else if(this.ball.position.x <= 5){
					this.ball.speed = 0.5;
				}
			}
		}
		else if(this.ball.direction.x < 0) // player2
		{
			if(this.world.PowerUp == this.world.arrayPowerup[0]){
				if(this.ball.position.x <= -5)
					this.ball.speed += 5;
				else if(this.ball.position.x >= 5){
					this.ball.speed = 0.5;
				}
			}
		}
	}

	// powerUpActivate() {

	// }

	addPowerUp() {

		this.waitPowerup++;
		if ((this.waitPowerup >= 5) && (this.exchanges % 5 == 0) && (!this.player1.powerUp && !this.player2.powerUp)){
			if (this.activePowerUp == false) {

				this.activePowerUp = true;

				this.world.powerUp = this.world.randomPowerUp();
				this.world.powerUp.duration = UTILS.POWERUPDURATION;
				// console.log(this.world.PowerUp);
				const z = 15;
				const max = 27;
				const min = -27;
				//const y = Math.floor(Math.random() * (max - min + 1)) + min;
				const y = 3.0;
				this.world.powerUp.mesh.position.set(0, y, z);
				this.world.scene.add(this.world.powerUp.mesh);
			}
		}
	}

	add_triple() {
		this.tripleEnabled = true;

		const b1 = this.fakeBalls[0];
		const b2 = this.fakeBalls[1];

		b1.mesh.position.x = this.ball.mesh.position.x;
		b1.mesh.position.y = this.ball.mesh.position.y;
		b1.mesh.position.z = this.ball.mesh.position.z;
		b1.speed = this.ball.speed;

		b2.mesh.position.x = this.ball.mesh.position.x;
		b2.mesh.position.y = this.ball.mesh.position.y;
		b2.mesh.position.z = this.ball.mesh.position.z;
		b2.speed = this.ball.speed;

		b1.direction = UTILS.rotateVector(this.ball.direction.x, this.ball.direction.y, 20);
		b2.direction = UTILS.rotateVector(this.ball.direction.x, this.ball.direction.y, -20);

		const real = Math.round(Math.random() * 2);

		const dir = this.ball.direction;

		if (real == 0) {
			this.ball.direction = b1.direction;
			b1.direction = dir;
		}
		else if (real == 1) {
			this.ball.direction = b2.direction;
			b2.direction = dir;
		}

		this.world.add(b1.mesh);
		this.world.add(b2.mesh);
	}


	remove_triple() {
		this.tripleEnabled = false;

		this.world.remove(this.fakeBalls[0].mesh);
		this.world.remove(this.fakeBalls[1].mesh);
	}

	powerUpTaken() {
		const player = (this.player1.powerUp) ? this.player1 : this.player2;
		const opp = (player === this.player1) ? this.player2 : this.player1;

		// Slowness check
		if (this.player1.powerUp && this.player1.powerUp.name == "slowness")
			this.player2.speed = 0.3;
		if (this.player2.powerUp && this.player2.powerUp.name == "slowness")
			this.player1.speed = 0.3;
		//Scale check
		if (this.player1.powerUp && this.player1.powerUp.name ==  "scale"){
			this.player2.mesh.position.z = -6;
			this.player2.mesh.scale.multiplyScalar(0.7);
		}
		if (this.player2.powerUp && this.player2.powerUp.name ==  "scale"){
			this.player1.mesh.position.z = -6;
			this.player1.mesh.scale.multiplyScalar(0.7);
		}
		// Triple check
		if (player.powerUp.name == "triple") {
			this.add_triple();
		}
	}

	handlePowerUp(player) {
		if (!player.powerUp){
			this.ball.speed = UTILS.STARTINGSPEED;
			return;
		}
		if (player.powerUp.name == "speed") {
			this.ball.speed = UTILS.STARTINGSPEED;
			this.ball.speed *= 2;
		}
		else if (player.powerUp.name == "triple") {
			this.add_triple();
		}
		else if (player.powerUp.name == "slowness") {
		}
		player.powerUp.duration--;
		if (player.powerUp.duration == 0) {
			// p = player ===?<valore1>:<valore2></valore2>
			const opp = (player === this.player1) ? this.player2 : this.player1;
			opp.speed = UTILS.MOVSPEED;
			if (player.powerUp.name == "scale"){
				opp.mesh.scale.multiplyScalar(1 / 0.7);
            	opp.mesh.position.z = -10;
			}
			player.powerUp = null;
		}
	}

	// region update()
	update() {
		this.updateMovements();
		this.world.rotatePowerUp();

		this.ball.mesh.position.x += this.ball.speed * this.ball.direction.x;
		this.ball.mesh.position.y += this.ball.speed * this.ball.direction.y;
		this.ball.mesh.position.z = this.ball.getZ();

		// Triple ball update
		if (this.tripleEnabled) {
			const ball1 = this.fakeBalls[0];
			const ball2 = this.fakeBalls[1];

			ball1.mesh.position.x += ball1.speed * ball1.direction.x;
			ball1.mesh.position.y += ball1.speed * ball1.direction.y;
			ball1.mesh.position.z = ball1.getZ();

			ball2.mesh.position.x += ball2.speed * ball2.direction.x;
			ball2.mesh.position.y += ball2.speed * ball2.direction.y;
			ball2.mesh.position.z = ball2.getZ();

			// console.log(ball1.mesh.position);
		}

		if (UTILS.checkCollision(this.player1.mesh, this.ball.mesh) && !this.collision)
		{
			/* if (ball.speed < 2)
				ball.speed *= ACCELERATION; */
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player1.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.exchanges++;
			this.updateExchanges();
			
			this.handlePowerUp(this.player1);
			this.addPowerUp()
		}
		if (UTILS.checkCollision(this.player2.mesh, this.ball.mesh) && !this.collision)
		{
			// if (ball.speed  < 2)
			// 	ball.speed  *= ACCELERATION;
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player2.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.exchanges++;
			this.updateExchanges();

			this.handlePowerUp(this.player2);
			this.addPowerUp();
		}
		// PowerUp collision
		if (this.activePowerUp == true && UTILS.checkPowerUpCollision(this.ball.mesh, this.world.powerUp.mesh)){

			this.world.remove(this.world.powerUp.mesh);
			this.activePowerUp = false;
			this.waitPowerup = 0;

			// Powerup assignment

			this.player1.powerUp = null;
			this.player2.powerUp = null;

			if(this.ball.direction.x < 0 && this.world.powerUp.type == "positive")
				this.player2.powerUp = this.world.powerUp;
			if(this.ball.direction.x < 0 && this.world.powerUp.type == "negative")
				this.player1.powerUp = this.world.powerUp;
			if(this.ball.direction.x > 0 && this.world.powerUp.type == "positive")
				this.player1.powerUp = this.world.powerUp;
			if(this.ball.direction.x > 0 && this.world.powerUp.type == "negative")
				this.player2.powerUp = this.world.powerUp;

			this.powerUpTaken();
		}



		if (UTILS.wallCollision(this.ball))
			this.ball.direction.y *= -1;

		//Reset positions
		if (this.ball.mesh.position.x > this.player2.mesh.position.x + 5  || this.ball.mesh.position.x < this.player1.mesh.position.x - 5)
			this.updateScore();

		// If triple ball is enabled
		if (this.tripleEnabled) {
			const b1 = this.fakeBalls[0];
			const b2 = this.fakeBalls[1];

			// Triple ball wall collision
			if (UTILS.wallCollision(b1))
				b1.direction.y *= -1;
			if (UTILS.wallCollision(b2))
				b2.direction.y *= -1;

			// Triple ball table limit
			if (b1.mesh.position.x > this.player2.mesh.position.x + 5 || b1.mesh.position.x < this.player1.mesh.position.x - 5)
				this.world.remove(b1.mesh);
			if (b2.mesh.position.x > this.player2.mesh.position.x + 5 || b2.mesh.position.x < this.player1.mesh.position.x - 5)
				this.world.remove(b2.mesh);
		}

		if (this.collision && this.ball.mesh.position.x > -10 && this.ball.mesh.position.x < 10)
			this.collision = false;
	}

	render() {
    	this.world.renderer.render(this.world.scene, this.world.activeCamera);
	}

	gameEnd() {
		if (this.score1 > this.score2)
			alert("Player 1 wins!");
		else
			alert("Player 2 wins!");
		this.score1 = 0;
		this.score2 = 0;
		this.updateScoreText();
	}
}
