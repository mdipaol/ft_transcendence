import *as UTILS from './utils.js';
import { Player } from './Player.js';
import { Ball } from './Ball.js';
import { Match } from './Match.js';
import { World } from './World.js';

export class BotMatch extends Match {
    constructor(world, powerUpMode) {
        super(world, powerUpMode);

        if (this.world.username1){
            this.world.setUsernameFont('two', 'Mario Bus')
        }
        this.player2.name = 'Mario Bus';
        this.bot2 = this.player2;
        this.activeBot1 = false;
        this.activeBot2 = false;
        let timer_start = 0;
        const time_end = false;
        let animationFrame = null;



        this.update_time_ball = new Date();

        this.time_update = new Date();
    }

    timer(){
        this.time_end = false;
        setInterval(updateTimer(),1000);
    }

    updateTimer(){
        this.timer_start++;
        if(this.timer_start >= 1){
            this.time_end = true;
        }
        else{
            this.time_end = false;
        }
    }


    onKeyDown(event) {
        
        if (event.which == this.player1.upKey || event.which == this.player2.upKey){
            event.preventDefault();
			this.player1.moves.up = true;
        }
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
        {
            event.preventDefault();
			this.player1.moves.down = true;
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
		}

	}

    onKeyUp(event) {
		if (event.which == this.player1.upKey || event.which == this.player2.upKey)
			this.player1.moves.up = false;
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
			this.player1.moves.down = false;
	}

    pointPrediction(){
        //l  = 108
        //h  = 27

        let directionX = this.ball.direction.x;
        let directionY = this.ball.direction.y;
        let startPosition = [this.ball.mesh.position.x + (UTILS.TABLE_WIDTH/2), this.ball.mesh.position.y + (UTILS.TABLE_HEIGHT/2)];

        if (directionY == 0)
            return (startPosition[1] -  (UTILS.TABLE_HEIGHT/2));

        let alpha = UTILS.angleBetweenVectors([Math.abs(directionX), Math.abs(directionY)], [1, 0]);

        let firstDeltaX = 0;
        let midDeltaX = 0;
        let iterator = startPosition[0];

        if (directionY > 0)
            firstDeltaX = ((UTILS.TABLE_WIDTH/2) - startPosition[1]) * Math.tan( (Math.PI / 2 ) - alpha )
        else
            firstDeltaX = (startPosition[1]) * Math.tan( (Math.PI / 2 ) - alpha )

        midDeltaX = (UTILS.TABLE_WIDTH/2) * Math.tan( (Math.PI / 2 ) - alpha )

        iterator = startPosition[0] + firstDeltaX;
        let collisions = false;
        let numberOfCollisions = 0;
        while(iterator < UTILS.TABLE_WIDTH){
            iterator += midDeltaX;
            collisions = true;
            numberOfCollisions++;
        }
        let prediction = null;
        if (collisions){
            iterator -= midDeltaX;
            let destinationY = (UTILS.TABLE_WIDTH - iterator) * Math.tan(alpha);
            if (directionY > 0 && !(numberOfCollisions % 2))
                prediction = (destinationY - (UTILS.TABLE_HEIGHT/2));
            else if (directionY > 0 && (numberOfCollisions % 2))
                prediction = ((UTILS.TABLE_WIDTH/2) - destinationY - (UTILS.TABLE_HEIGHT/2));
            else if (directionY < 0 && !(numberOfCollisions % 2))
                prediction = ((UTILS.TABLE_WIDTH/2) - destinationY - (UTILS.TABLE_HEIGHT/2));
            else if (directionY < 0 && (numberOfCollisions % 2))
                prediction = (destinationY - (UTILS.TABLE_HEIGHT/2));
        }
        else {
            iterator -= firstDeltaX;
            numberOfCollisions = 0;
            let destinationY = (UTILS.TABLE_WIDTH - iterator) * Math.tan(alpha);
            if (directionY > 0)
                prediction = (startPosition[1] + destinationY) - (UTILS.TABLE_HEIGHT/2);
            else
                prediction = (startPosition[1] - destinationY) - (UTILS.TABLE_HEIGHT/2);
        }

        if (prediction == null){
            return (this.bot2.destinationY);
        }

        const maxError = prediction + UTILS.PADDLE_SIZE / 1.5;
        const minError = prediction - UTILS.PADDLE_SIZE / 1.5;
        const randomPrediction = ( Math.random() * (maxError - minError) ) + minError;
        return (randomPrediction);
    }

    updateMovements(deltaTime) {
        if (this.player1.moves.up && this.player1.mesh.position.y < UTILS.MAX_SIZEY){
            this.player1.mesh.position.y += this.player1.speed * deltaTime ;
            //requestAnimationFrame(this.updateMovements().bind(this));
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player1.moves.down && this.player1.mesh.position.y > UTILS.MIN_SIZEY)
		{
			this.player1.mesh.position.y -= this.player1.speed  * deltaTime;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
        }
        if (this.bot2.mesh.position.y < this.bot2.destinationY && this.bot2.mesh.position.y < UTILS.MAX_SIZEY){
            this.bot2.mesh.position.y += this.bot2.speed * deltaTime;
            // this.bot2.mesh.position.y = this.bot2.destinationY;
            if (Math.abs( this.bot2.mesh.position.y - this.bot2.destinationY ) < 1)
                this.bot2.mesh.position.y = this.bot2.destinationY;
        }
        else if (this.bot2.mesh.position.y > this.bot2.destinationY  && this.bot2.mesh.position.y > UTILS.MIN_SIZEY){
            this.bot2.mesh.position.y -= this.bot2.speed * deltaTime;
            // this.bot2.mesh.position.y = this.bot2.destinationY;
            if (Math.abs( this.bot2.mesh.position.y - this.bot2.destinationY ) < 1)
                this.bot2.mesh.position.y = this.bot2.destinationY;
        }
	}

    updateMovementsBot(){
        if (((new Date()) - this.time_update) < 1000)
            return ;
        this.time_update = new Date();
        if (this.ball.direction.x < 0){
            return
        }
        this.bot2.destinationY = (this.pointPrediction());
    }

    updateScore() { 

        if(this.world.soundPoint.isPlaying){
            this.world.soundPoint.stop();
        }

		if (this.ball.mesh.position.x < 0)
			this.score2++;
		else
			this.score1++;
		this.updateScoreText();
		if (this.score1 == this.maxScore || this.score2 == this.maxScore){
            if(this.world.sound.isPlaying){
                this.world.sound.stop();
            }                  
			this.gameEnd();
        }
        else if(this.score1 != this.maxScore && this.score1 != this.maxScore)
            this.world.soundPoint.play();

		this.ball.mesh.position.x = 0;
		this.ball.mesh.position.y = 0;
		this.ball.mesh.position.z = this.ball.getZ();
		this.player1.mesh.position.y = 0;
		this.player2.mesh.position.y = 0;
		this.player1.mesh.position.z = -10;
		this.player2.mesh.position.z = -10;
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.speed  = UTILS.MOVSPEED;
		this.player2.speed = UTILS.MOVSPEED;
		this.ball.speed = UTILS.STARTINGSPEED;
        this.ball.isReady = false;
		this.player1.mesh.scale.set(this.player1.originScale[0], this.player1.originScale[1], this.player1.originScale[2]);
		this.player2.mesh.scale.set(this.player2.originScale[0], this.player2.originScale[1], this.player2.originScale[2]);
		this.world.resetMesh();
		this.ball.direction.y = 0;
		const normalized = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
		this.ball.direction.x = normalized[0];
		this.remove_triple();

        this.bot2.destinationY = 0;

		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();

        const player1Div = document.getElementById('player1-score');
        const player2Div = document.getElementById('player2-score');
        if (player1Div)
            player1Div.innerHTML = this.score1.toString();
        if (player2Div)
            player2Div.innerHTML = this.score2.toString();
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
            if (!this.ball.startTimer){
                if(this.world.soundCoundwon.isPlaying){
					this.world.soundCoundwon.stop();	
				}
				this.world.soundCoundwon.play();
				this.world.sound.setVolume(0.05)
                this.ball.startTimer = currentTime;
            }
            else
            {
                if(this.world.soundCoundwon.isPlaying){
					this.world.soundCoundwon.stop();	
				}
				this.world.sound.setVolume(0.1)
                this.ball.isReady = true;
                this.ball.startTimer = null;
            }
        }

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

		}

        if (this.ball.mesh.position.x > this.player2.mesh.position.x + 2  || this.ball.mesh.position.x < this.player1.mesh.position.x - 2)
        {
            if (this.deltaErrorCheck())
            {
                if (this.ball.mesh.position.x > 0)
                    this.ball.mesh.position.x = this.player2.mesh.position.x;
                else
                    this.ball.mesh.position.x = this.player1.mesh.position.x;
                    this.ball.direction.x *= -1;
                    this.ball.direction.y = (this.ball.mesh.position.y - this.player2.mesh.position.y)/10;
                    const normalizedVector = UTILS.normalizeVector([this.ball.direction.x, this.ball.direction.y]);
                    this.ball.direction.x = normalizedVector[0];
                    this.ball.direction.y = normalizedVector[1];
            }
        }

		if (UTILS.checkCollision(this.player1.mesh, this.ball.mesh) && !this.collision)
		{
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

		}
		if (UTILS.checkCollision(this.player2.mesh, this.ball.mesh) && !this.collision)
		{
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
            this.bot2.destinationY = 0;


		}
        // Bot movements
        this.updateMovementsBot();
		// PowerUp collision
		if (this.activePowerUp == true && UTILS.checkPowerUpCollision(this.ball.mesh, this.world.powerUp.mesh)){

			this.world.remove(this.world.powerUp.mesh);
			this.activePowerUp = false;
			this.waitPowerup = 0;

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

        // Update game interface
        this.updateHtmlInterface();
	}
}

