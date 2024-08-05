import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Ball } from "./Ball.js"
import * as UTILS from './utils.js';
import { Player } from './Player.js';


export class Match {
    constructor(world, powerUpMode) {

		this.world = world;
		this.powerUpMode = powerUpMode;

		this.start = new Date();
		this.htmlElement = null;

        this.player1 = new Player(world.paddle);
        this.player2 = new Player(world.paddle2);
		this.player1.upKey = UTILS.W;
		this.player1.downKey = UTILS.S;
		this.player2.upKey = UTILS.ARROWUP;
		this.player2.downKey = UTILS.ARROWDOWN;

		this.ended = false;

        this.ball = new Ball(0xf06400);
        this.maxScore = UTILS.MAXSCORE;
        this.score1 = 0;
        this.score2 = 0;
        this.exchangesFont = world.font;
        this.scoreText = this.scoreTextInit();
        this.exchanges = 0;
        this.exchangesText = this.exchangesTextInit();
        this.collision = false;
		//questa variabile serve per rendere indipendente il movimento della pallina con gli fps
		this.update_time_ball = new Date();

        // PowerUps
        this.waitPowerup = 0;
        this.activePowerUp = false;

		// Update mesh with username
		if (this.world.username1 && window.username){
			this.world.setUsernameFont('one', window.username);
			this.world.setUsernameFont('two', UTILS.truncateString(window.username, 4) + '[2.0]')
		}

        // Triple Ball init
        this.tripleEnabled = false;
        this.fakeBalls = [new Ball(0xff0000), new Ball(0x0000ff)];
        if (this.fakeBalls[0].mesh.children[0]) {
            this.fakeBalls[0].mesh.remove(this.fakeBalls[0].mesh.children[0]);
        }
        if (this.fakeBalls[1].mesh.children[0]) {
            this.fakeBalls[1].mesh.remove(this.fakeBalls[1].mesh.children[0]);
        }
    }

	async ready(){
		return;
	}

	initHtmlInterface(htmlElement){
		if (!htmlElement)
			return;
		this.htmlElement = htmlElement;
		if (!window.username){
			window.username = 'pippo'
		}
		// console.log(this.htmlElement);
		this.htmlElement.querySelector('#interface-timer').innerHTML = UTILS.timeToString(new Date() - this.start);
		this.htmlElement.querySelector('#interface-player1').innerHTML = window.username;
		this.htmlElement.querySelector('#interface-player2').innerHTML = UTILS.truncateString(window.username.toString(), 4) + '[2.0]';
		this.htmlElement.querySelector('#interface-score').innerHTML =  + `${this.score1}` + "-" + `${this.score2}`;
		this.htmlElement.querySelector('#interface-exchanges').innerHTML = `${this.exchanges}`;
	}

	updateHtmlInterface(){
		if (!this.htmlElement)
			return;
		this.htmlElement.querySelector('#interface-timer').innerHTML = UTILS.timeToString(new Date() - this.start);
		this.htmlElement.querySelector('#interface-score').innerHTML = `${this.score1}` + "-" + `${this.score2}`;
		this.htmlElement.querySelector('#interface-exchanges').innerHTML = `${this.exchanges}`;
	}

	exchangesTextInit() {
		if (this.exchangesText && this.exchangesText[0] && this.exchangesText[1]) {
			this.exchangesText[0].geometry.dispose();
			this.exchangesText[1].geometry.dispose();
			this.world.remove(this.exchangesText[0]);
			this.world.remove(this.exchangesText[1]);
		}
		const geometry = new TextGeometry( "0", {
			font: this.exchangesFont,
			size: 8,
			depth: 1,
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
		mirrored.scale.x = -mesh.scale.x;
		mirrored.position.set(124, 0, 5)
        this.world.add(mesh);
		this.world.add(mirrored);
		const meshes = [mesh, mirrored]
		return meshes;
	}

	updateExchanges() {
		this.exchanges++;
		this.exchangesText[0].geometry.dispose();
		this.exchangesText[1].geometry.dispose();
		const geometry = new TextGeometry( this.exchanges.toString(), {
			font: this.exchangesFont,
			size: 8,
			depth: 1,
		});
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.exchangesText[0].geometry = geometry;
		this.exchangesText[1].geometry = geometry;
	}

	scoreTextInit() {
		const geometry = new TextGeometry( "0 - 0", {
			font: this.exchangesFont,
			size: 20,
			depth: 1,
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
		this.scoreText[0].geometry.dispose();
		this.scoreText[1].geometry.dispose();
		const geometry = new TextGeometry( this.score1.toString() + " - "  + this.score2.toString(), {
			font: this.exchangesFont,
			size: 20,
			depth : 1,
		})
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.scoreText[0].geometry = geometry;
		this.scoreText[1].geometry = geometry;
	}

	updateScore() {
		
		// Sound
		if(this.world.soundPoint.isPlaying){
            this.world.soundPoint.stop();
        }

		if (this.ball.mesh.position.x < 0)
			this.score2++;
		else
			this.score1++;

		this.updateScoreText();
		if (this.score1 == this.maxScore || this.score2 == this.maxScore){
			if(this.world.sound.isPlaying)
                this.world.sound.stop();   
			this.gameEnd();
		}
		else
			this.world.soundPoint.play();

		
		this.ball.mesh.position.x = 0;
		this.ball.mesh.position.y = 0;
		this.ball.mesh.position.z = this.ball.getZ();
		this.player1.mesh.position.y = 0;
		this.player2.mesh.position.y = 0;
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.speed = UTILS.MOVSPEED;
		this.player2.speed = UTILS.MOVSPEED;
		this.ball.speed = UTILS.STARTINGSPEED;
		this.ball.isReady = false;
		this.player1.mesh.scale.set(this.player1.originScale[0], this.player1.originScale[1], this.player1.originScale[2]);
		this.player2.mesh.scale.set(this.player2.originScale[0], this.player2.originScale[1], this.player2.originScale[2]);
		this.world.resetMesh();
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
		if (event.which == this.player1.upKey){
			event.preventDefault();
			this.player1.moves.up = true;
        }
		if (event.which == this.player1.downKey){
			event.preventDefault();
			this.player1.moves.down = true;
		}
		if (event.which == this.player2.upKey){
			event.preventDefault();
			this.player2.moves.up = true;
        }
		if (event.which == this.player2.downKey){
			event.preventDefault();
			this.player2.moves.down = true;
		}

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
			event.preventDefault();
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

	updateMovements(deltaTime) {
		if (this.player1.moves.up && this.player1.mesh.position.y < UTILS.MAX_SIZEY)
			this.player1.mesh.position.y += this.player1.speed * deltaTime;
		if (this.player1.moves.down && this.player1.mesh.position.y > UTILS.MIN_SIZEY)
			this.player1.mesh.position.y -= this.player1.speed * deltaTime;
		if (this.player2.moves.up && this.player2.mesh.position.y < UTILS.MAX_SIZEY)
			this.player2.mesh.position.y += this.player2.speed * deltaTime;
		if (this.player2.moves.down && this.player2.mesh.position.y > UTILS.MIN_SIZEY)
			this.player2.mesh.position.y -= this.player2.speed * deltaTime;
	}

	addPowerUp() {

		if (this.powerUpMode && this.activePowerUp == false) {
			if (!this.player1.powerUp && !this.player2.powerUp)
				this.waitPowerup++;
			if ((this.waitPowerup >= 5) && (!this.player1.powerUp && !this.player2.powerUp)) {

				this.activePowerUp = true;

				this.world.powerUp = this.world.randomPowerUp();
				this.world.powerUp.duration = UTILS.POWERUPDURATION;
				// console.log(this.world.PowerUp);
				const max = UTILS.MAX_SIZEY;
				const min = UTILS.MIN_SIZEY;
				const y = Math.floor(Math.random() * (max - min + 1)) + min;
				const z = 15;
				this.world.powerUp.mesh.position.set(0, y, z);
				this.world.scene.add(this.world.powerUp.mesh);//.mesh
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

	// region powerUpTaken()
	powerUpTaken() {

		// Powerup assignment

		this.player1.powerUp = null;
		this.player2.powerUp = null;

		if(this.ball.direction.x < 0 && this.world.powerUp.type == "positive"){
			if(this.world.soundPowerUpPositive.isPlaying)
				this.world.soundPowerUpPositive.stop();
			this.world.soundPowerUpPositive.play();

			this.player2.powerUp = this.world.powerUp;
		}
		if(this.ball.direction.x < 0 && this.world.powerUp.type == "negative"){
			if(this.world.soundPowerUpNegative.isPlaying)
				this.world.soundPowerUpNegative.stop();
			this.world.soundPowerUpNegative.play();

			this.player1.powerUp = this.world.powerUp;
		}
		if(this.ball.direction.x > 0 && this.world.powerUp.type == "positive"){
			if(this.world.soundPowerUpPositive.isPlaying)
				this.world.soundPowerUpPositive.stop();
			this.world.soundPowerUpPositive.play();

			this.player1.powerUp = this.world.powerUp;
		}
		if(this.ball.direction.x > 0 && this.world.powerUp.type == "negative"){
			if(this.world.soundPowerUpNegative.isPlaying)
				this.world.soundPowerUpNegative.stop();
			this.world.soundPowerUpNegative.play();

			this.player2.powerUp = this.world.powerUp;
		}

		if(this.ball.direction.x < 0 && this.world.powerUp.type == "positive")
			this.player2.powerUp = this.world.powerUp;
		if(this.ball.direction.x < 0 && this.world.powerUp.type == "negative")
			this.player1.powerUp = this.world.powerUp;
		if(this.ball.direction.x > 0 && this.world.powerUp.type == "positive")
			this.player1.powerUp = this.world.powerUp;
		if(this.ball.direction.x > 0 && this.world.powerUp.type == "negative")
			this.player2.powerUp = this.world.powerUp;

		const player = (this.player1.powerUp) ? this.player1 : this.player2;
		const opp = (player === this.player1) ? this.player2 : this.player1;

		// Slowness check
		if (this.player1.powerUp && this.player1.powerUp.name == "slowness")
			this.player2.speed = this.player2.speed / 3;
		if (this.player2.powerUp && this.player2.powerUp.name == "slowness")
			this.player1.speed = this.player2.speed / 3;
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
		if (this.player1.powerUp && this.player1.powerUp.name == "triple" && this.ball.direction.x > 0)
			this.add_triple();
		if (this.player2.powerUp && this.player2.powerUp.name == "triple" && this.ball.direction.x < 0)
			this.add_triple();
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
            	this.world.resetMesh();
			}
			player.powerUp = null;
		}
	}

	deltaErrorCheck() {
		//add a little red cube at player position
		let cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
		let cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		let cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube2.position.x = this.player2.mesh.position.x;
		cube2.position.y = this.player2.mesh.position.y;
		cube2.position.z = this.player2.mesh.position.z;
		cube.position.x = this.player1.mesh.position.x;
		cube.position.y = this.player1.mesh.position.y;
		cube.position.z = this.player1.mesh.position.z;
		this.world.add(cube);
		this.world.add(cube2);


		if (this.ball.mesh.position.x > 0)
		{
			console.log(this.ball.mesh.position.y - this.player2.mesh.position.y);
			if (Math.abs(this.ball.mesh.position.y - this.player2.mesh.position.y)< UTILS.PADDLE_SIZE_Y / 2)
				return true;
		}
		else
		{
			console.log(this.ball.mesh.position.y - this.player1.mesh.position.y);
			if (Math.abs(this.ball.mesh.position.y - this.player1.mesh.position.y) < UTILS.PADDLE_SIZE_Y / 2)
				return true;
		}
		return false;
	}

	// region update()
	update() {

		const currentTime = new Date()
        const deltaTime = (currentTime - this.update_time_ball) / 1000; // Convert to seconds
        this.update_time_ball = currentTime;

		this.updateMovements(deltaTime);

		this.world.rotatePowerUp();

		if (this.ball.isReady)
			{
				this.ball.mesh.position.x += this.ball.speed * this.ball.direction.x * deltaTime;
				this.ball.mesh.position.y += this.ball.speed * this.ball.direction.y * deltaTime;
				this.ball.mesh.position.z = this.ball.getZ();
			}
			else if(!this.ball.startTimer || (currentTime - this.ball.startTimer) > UTILS.BALLTIMER)
			{
				if (!this.ball.startTimer)
					this.ball.startTimer = currentTime;
				else
				{
					this.ball.isReady = true;
					this.ball.startTimer = null;
				}
			}
		//salvo pos futura
/* 		let futureX = this.ball.mesh.position.x + this.ball.speed * this.ball.direction.x * deltaTime;
		let futureY = this.ball.mesh.position.y + this.ball.speed * this.ball.direction.y * deltaTime;
		//check se è oltre la racchetta
 		if (futureX > this.player2.mesh.position.x  || futureX < this.player1.mesh.position.x){
			// Paddle in ball trajectory
			if (){

			}
		}
		//se si teletrasporto dove mi pare
		//se no salvo pos futura in pos della ball
		this.ball.mesh.position.x = futureX;
		this.ball.mesh.position.y = futureY;
		this.ball.mesh.position.z = this.ball.getZ(); */

		if(this.ball.mesh.position.z < 0){
            if (this.world.soundWallCollision.isPlaying)
                this.world.soundWallCollision.stop();
            this.world.soundWallCollision.play();
        }

		// Triple ball update
		if (this.tripleEnabled) {
			const ball1 = this.fakeBalls[0];
			const ball2 = this.fakeBalls[1];

			ball1.mesh.position.x += ball1.speed * ball1.direction.x * deltaTime;
			ball1.mesh.position.y += ball1.speed * ball1.direction.y * deltaTime;
			ball1.mesh.position.z = ball1.getZ();

			ball2.mesh.position.x += ball2.speed * ball2.direction.x * deltaTime;
			ball2.mesh.position.y += ball2.speed * ball2.direction.y * deltaTime;
			ball2.mesh.position.z = ball2.getZ();

			// console.log(ball1.mesh.position);
		}
		if (this.ball.mesh.position.x > this.player2.mesh.position.x + 2  || this.ball.mesh.position.x < this.player1.mesh.position.x - 2)
		{
			console.log("palla: " + this.ball.mesh.position.x + " player1: " + this.player1.mesh.position.x + " player2: " + this.player2.mesh.position.x);
			if (this.deltaErrorCheck())
			{
				if (this.ball.mesh.position.x > 0)
					this.ball.mesh.position.x = this.player2.mesh.position.x;
				else
					this.ball.mesh.position.x = this.player1.mesh.position.x;
			}
		}
		if (UTILS.checkCollision(this.player1.mesh, this.ball.mesh) && !this.collision)
		{
			/* if (ball.speed < 2)
				ball.speed *= ACCELERATION; */
			if (this.world.soundCollision.isPlaying)
                this.world.soundCollision.stop();
			this.world.soundCollision.play();
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player1.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.updateExchanges();

			this.handlePowerUp(this.player1);
			this.addPowerUp();
			//test funzione
		}
		if (UTILS.checkCollision(this.player2.mesh, this.ball.mesh) && !this.collision)
		{
			// if (ball.speed  < 2)
			// 	ball.speed  *= ACCELERATION;
			if (this.world.soundCollision.isPlaying)
                this.world.soundCollision.stop();
			this.world.soundCollision.play();
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player2.mesh.position.y)/10;
			const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.updateExchanges();

			this.handlePowerUp(this.player2);
			this.addPowerUp();
			// UTILS.setSound('music/ball.hit.mp3', false, 1);
		}
		// PowerUp collision
		if (this.activePowerUp == true && UTILS.checkPowerUpCollision(this.ball.mesh, this.world.powerUp.mesh)){

			this.world.remove(this.world.powerUp.mesh);
			this.activePowerUp = false;
			this.waitPowerup = 0;
			//assegnazione powerUp Player
			this.powerUpTaken();

		}



		if (UTILS.wallCollision(this.ball)){
			if( this.world.soundWallCollision.isPlaying){
                this.world.soundWallCollision.stop();
            }
            this.world.soundWallCollision.play();
			this.ball.mesh.position.y = Math.sign(this.ball.direction.y) * UTILS.MAX_SIZEY;
			this.ball.direction.y *= -1;
		}

		// Ball pass the table limit on x
		if (this.ball.mesh.position.x > this.player2.mesh.position.x + 5  || this.ball.mesh.position.x < this.player1.mesh.position.x - 5){

			// Check intersection between ball and paddle

			// Updating positions and score after a point
			this.updateScore();
		}

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

		// Update game interface
		this.updateHtmlInterface();
	}



	// non ti permettere heeeey
	destroy(scene) {
		while (scene.children.length > 0) {
			let object = scene.children[0];
			this.world.remove(object);
			if (object.geometry)
				object.geometry.dispose();
			if (object.texture)
				object.texture.dispose();
			if ( object.material && object.material.length > 0)
				object.material.forEach(mat => {
					if(mat.map)
						mat.map.dispose();	
					mat.dispose();
				})
			else if (object.material)
			{
				if (object.material.map)
					object.material.map.dispose();
				object.material.dispose();
			}
			if (object.children && object.children.length > 0)
				UTILS.childCleaner(object);
		}
		this.world.arrayPowerup.forEach(powerup => {
			if (powerup.mesh.children[0] && powerup.mesh.children[0].geometry)
				powerup.mesh.children[0].geometry.dispose();
		});
		this.world.mapPowerUp.forEach(powerup => {
			if (powerup.mesh.children[0] && powerup.mesh.children[0].geometry)
				powerup.mesh.children[0].geometry.dispose();
		});
		this.fakeBalls.forEach(ball => {
			if (ball.mesh.geometry)
				ball.mesh.geometry.dispose();
		});
	}

	render() {
    	this.world.renderer.render(this.world.scene, this.world.activeCamera);
	}

	gameEnd() {
		// if (this.score1 > this.score2)
		// 	alert("Player 1 wins!");
		// else
			// alert("Player 2 wins!");
		
		this.ended = true;
	}
}
