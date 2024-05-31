import { Match } from './Match.js'

class OnlineMatch extends Match {
    constructor(world) {
        super(world);

        this.socket = new WebSocket(
            "wss://"
            + window.location.host
            + "ws/game/"
        );

        this.socket.addEventListener("open", (event) => this.onOpen(event) );
        this.socket.addEventListener("close", (event) => this.onClose(event) );
        this.socket.addEventListener("message", (event) => this.onMessage(event) );
        this.socket.addEventListener("error", (event) => this.onError(event) );
    }

    onOpen(event) {
        console.log("Connected to the server");
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
}