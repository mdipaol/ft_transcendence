import { Match } from './Match.js'
import * as UTILS from './utils.js'

// exchanges
export class OnlineMatch extends Match {
    constructor(world) {
        super(world);

        this.socket = new WebSocket(
            "wss://"
            + window.location.host
            + "/ws/game/"
        );

		this.superPlayer = null;

		this.started = false;

        this.socket.addEventListener("open", (event) => this.onOpen(event) );
        this.socket.addEventListener("close", (event) => this.onClose(event) );
        this.socket.addEventListener("message", (event) => this.onMessage(event) );
        this.socket.addEventListener("error", (event) => this.onError(event) );
	}


	gameMessage(msg) {
		if (msg.event == "state")
			this.updateState(msg);
		else if(msg.event == "exchanges"){
			console.log(msg)
			this.exchanges = msg.message.exchanges;
			this.updateExchanges();
		}
		else if (msg.event == "score")
			this.updateScore(msg);
		else if (msg.event == "powerUpSpawn") {
			console.log(msg);
			this.world.powerUp = this.world.arrayPowerup[msg.message.powerUp];
			this.world.powerUp.mesh.position.x = msg.message.x;
			this.world.powerUp.mesh.position.y = msg.message.y;
			this.world.powerUp.mesh.position.z = 10;
			this.world.add(this.world.powerUp.mesh);
		}
	}

    onOpen(event) {
        console.log("Connected to the server");
    }

	onClose(event) {
        console.log("Connection closed");
    }

	onMessage(event) {
		const msg = JSON.parse(event.data);
		if (msg.type == "game_message")
			this.gameMessage(msg);
		else if (msg.type == "game_start")
		{
			console.log("game started")
			console.log(msg.player)
			if (msg.player == "player_one")
				this.superPlayer = this.player1;
			else if (msg.player == "player_two")
				this.superPlayer = this.player2;
			this.started = true;
		}
		else if (msg.type == "game_end")
		{
			console.log(msg)
			if (msg.message.player_one.score > msg.message.player_two.score)
				alert("Player One WINS")
			else
				alert("Player Two WINS")
			this.gameEnd();
			this.started = false;


		}
    }

	onError(event) {
        console.log(event);
    }

	onKeyDown(event) {
		if (!this.started)
			return;
		if (event.which == this.player1.upKey || event.which == this.player2.upKey)
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'up', 'mode' : 'keydown' }));
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'down', 'mode' : 'keydown' }));

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
		if (!this.started)
			return;
		if (event.which == this.player1.upKey || event.which == this.player2.upKey)
			this.socket.send(JSON.stringify({ 'type': 'input','direction': 'up', 'mode' : 'keyup' }));
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'down', 'mode' : 'keyup' }));
	}

    // updateMovements() {
	// 	if (!this.started)
	// 		return;
	// 	if (this.superPlayer.moves.up && this.superPlayer.mesh.position.y < 27)
	// 	{
	// 		// this.superPlayer.mesh.position.y += this.superPlayer.speed;
	// 		// this.player1.mesh.position.y += this.player1.speed;
	// 		this.socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
	// 	}
	// 	if (this.superPlayer.moves.down && this.superPlayer.mesh.position.y > -27)
	// 	{
	// 		// this.superPlayer.mesh.position.y -= this.superPlayer.speed;
	// 		// this.player1.mesh.position.y -= this.player1.speed;
	// 		this.socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
	// 	}
	// }

	updateState(msg)
	{
		this.player1.mesh.position.y = msg.message.player_one.y;
		this.player2.mesh.position.y = msg.message.player_two.y;
		this.ball.mesh.position.x = msg.message.ball.x;
		this.ball.mesh.position.y = msg.message.ball.y;
	}

	updateScore(msg){
		console.log(msg)
		this.score1 = msg.message.player_one;
		this.score2 = msg.message.player_two;
		this.updateScoreText();
		this.player1.mesh.position.z = -10;
		this.player2.mesh.position.z = -10;
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.mesh.scale.set(1, 1, 1);
		this.player2.mesh.scale.set(1, 1, 1);
		//---------------------------
		// Reset direction
		//const normalized = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
		//this.ball.direction.x = normalized[0];

		// Triple Ball
		this.remove_triple();
		// Exchanges
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
	}

    update() {
		// this.updateMovements();
		this.world.rotatePowerUp();
		this.ball.mesh.position.z = this.ball.getZ();
		// this.ball.mesh.position.x += this.ball.speed * this.ball.direction.x;
		// this.ball.mesh.position.y += this.ball.speed * this.ball.direction.y;

		// this.world.rotatePowerUp();

		// //this.ball.mesh.position.x += this.ball.speed * this.ball.direction.x;
		// //this.ball.mesh.position.y += this.ball.speed * this.ball.direction.y;

		// // Triple ball update
		// if (this.tripleEnabled) {
		// 	const ball1 = this.fakeBalls[0];
		// 	const ball2 = this.fakeBalls[1];

		// 	ball1.mesh.position.x += ball1.speed * ball1.direction.x;
		// 	ball1.mesh.position.y += ball1.speed * ball1.direction.y;
		// 	ball1.mesh.position.z = ball1.getZ();

		// 	ball2.mesh.position.x += ball2.speed * ball2.direction.x;
		// 	ball2.mesh.position.y += ball2.speed * ball2.direction.y;
		// 	ball2.mesh.position.z = ball2.getZ();

		// 	// console.log(ball1.mesh.position);
		// }

		// if (UTILS.checkCollision(this.player1.mesh, this.ball.mesh) && !this.collision)
		// {
		// 	/* if (ball.speed < 2)
		// 		ball.speed *= ACCELERATION; */
		// 	this.ball.direction.x *= -1;
		// 	this.ball.direction.y = (this.ball.mesh.position.y - this.player1.mesh.position.y)/10;
		// 	const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
		// 	this.ball.direction.x = normalizedVector[0];
		// 	this.ball.direction.y = normalizedVector[1];

		// 	this.collision = true;
		// 	this.updateExchanges();

		// 	this.handlePowerUp(this.player1);
		// 	this.addPowerUp()
		// }
		// if (UTILS.checkCollision(this.player2.mesh, this.ball.mesh) && !this.collision)
		// {
		// 	// if (ball.speed  < 2)
		// 	// 	ball.speed  *= ACCELERATION;
		// 	this.ball.direction.x *= -1;
		// 	this.ball.direction.y = (this.ball.mesh.position.y - this.player2.mesh.position.y)/10;
		// 	const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
		// 	this.ball.direction.x = normalizedVector[0];
		// 	this.ball.direction.y = normalizedVector[1];

		// 	this.collision = true;
		// 	this.updateExchanges();

		// 	this.handlePowerUp(this.player2);
		// 	this.addPowerUp();
		// }
		// // PowerUp collision
		// if (this.activePowerUp == true && UTILS.checkPowerUpCollision(this.ball.mesh, this.world.powerUp.mesh)){

		// 	this.world.remove(this.world.powerUp.mesh);
		// 	this.activePowerUp = false;
		// 	this.waitPowerup = 0;

		// 	// Powerup assignment

		// 	this.player1.powerUp = null;
		// 	this.player2.powerUp = null;

		// 	if(this.ball.direction.x < 0 && this.world.powerUp.type == "positive")
		// 		this.player2.powerUp = this.world.powerUp;
		// 	if(this.ball.direction.x < 0 && this.world.powerUp.type == "negative")
		// 		this.player1.powerUp = this.world.powerUp;
		// 	if(this.ball.direction.x > 0 && this.world.powerUp.type == "positive")
		// 		this.player1.powerUp = this.world.powerUp;
		// 	if(this.ball.direction.x > 0 && this.world.powerUp.type == "negative")
		// 		this.player2.powerUp = this.world.powerUp;

		// 	this.powerUpTaken();
		// }



		// if (UTILS.wallCollision(this.ball))
		// 	this.ball.direction.y *= -1;

		// //Reset positions
		// if (this.ball.mesh.position.x > this.player2.mesh.position.x + 5  || this.ball.mesh.position.x < this.player1.mesh.position.x - 5)
		// 	this.updateScore();

		// // If triple ball is enabled
		// if (this.tripleEnabled) {
		// 	const b1 = this.fakeBalls[0];
		// 	const b2 = this.fakeBalls[1];

		// 	// Triple ball wall collision
		// 	if (UTILS.wallCollision(b1))
		// 		b1.direction.y *= -1;
		// 	if (UTILS.wallCollision(b2))
		// 		b2.direction.y *= -1;

		// 	// Triple ball table limit
		// 	if (b1.mesh.position.x > this.player2.mesh.position.x + 5 || b1.mesh.position.x < this.player1.mesh.position.x - 5)
		// 		this.world.remove(b1.mesh);
		// 	if (b2.mesh.position.x > this.player2.mesh.position.x + 5 || b2.mesh.position.x < this.player1.mesh.position.x - 5)
		// 		this.world.remove(b2.mesh);
		// }

		// if (this.collision && this.ball.mesh.position.x > -10 && this.ball.mesh.position.x < 10)
		// 	this.collision = false;
	}

	render() {
		// console.log(this.started);
		if (this.started)
    		this.world.renderer.render(this.world.scene, this.world.activeCamera);
	}
}
