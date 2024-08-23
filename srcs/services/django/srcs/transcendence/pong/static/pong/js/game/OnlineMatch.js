import { Match } from './Match.js'
import * as UTILS from './utils.js'

// exchanges
export class OnlineMatch extends Match {
    constructor(world, powerUpMode) {
        super(world, powerUpMode);

        this.socket = null;

		this.superPlayer = null;

		this.started = false;
		

		this.connected = false;
		this.searching = false;
		this.culo = null;
	}


	async ready(matchId){
		return new Promise((resolve, reject) => {

			let powerUpMode = '/ws/game/normal/';
			if (this.powerUpMode)
				powerUpMode = '/ws/game/powerup/'

			this.socket = new WebSocket(
				"wss://"
				+ window.location.host
				+ powerUpMode
			);

			this.socket.onopen = () => {
				console.log('WebSocket connection opened');
				this.socket.send(JSON.stringify({ 'type': 'ready'}));
				this.connected = true;
				this.searching = true;
				resolve();
			};

			this.socket.onerror = (err) => {
				console.error('WebSocket error:', err);
				reject(err);
			};
	
			this.socket.onclose = () => {
				console.log('WebSocket connection closed');
			};

			this.socket.onmessage = (event) => {
				this.onMessage(event);
			}
		});
	}

	addPowerUp(data){

			const effect = data.powerup_effect == 'good' ? 'Positive' : 'Negative'
			console.log(data.powerup_type + effect)
			const powerUp = this.world.mapPowerUp.get(data.powerup_type + effect);
			
			if (powerUp){
				powerUp.mesh.position.set(0, data.powerup_position, 15);
				this.world.powerUp = powerUp;
				this.world.add(powerUp.mesh)
			}
		}

	removePowerUp(){
		if (this.world.powerUp){
			this.world.remove(this.world.powerUp.mesh);
			this.world.powerUp = null;
		}
	}


	/** 
	 * @description Powerup event handler
	 * @param {Object} data Expecting from the server the following object: {
	 * 		
	 * 		type : ...,
	 * 		action : ..., ('add' or 'remove' if type is triple)
	 * }
	**/
	handlePowerUp( data ){
		if (data.type == 'powerup_taken'){
			this.removePowerUp();
			if (this.world.soundPowerUpPositive.isPlaying)
				this.world.soundPowerUpPositive.stop();
			if (this.world.soundPowerUpNegative.isPlaying)
				this.world.soundPowerUpNegative.stop();
			
			if (data.effect == 'good')
				this.world.soundPowerUpPositive.play();
			else
				this.world.soundPowerUpNegative.play();
			
		}
		else if (data.type == 'powerup_remove'){
			this.removePowerUp();
		}
		else if (data.type == 'reset'){
			// Scale, triple 
			// The mesh of the powerup shall remain on the field
			console.log('reset');
			this.player1.mesh.scale.x = this.player1.originScale[0]
			this.player1.mesh.scale.y = this.player1.originScale[1]
			this.player1.mesh.scale.z = this.player1.originScale[2]
			this.player1.mesh.position.z = UTILS.POSITION_Z_W1;

			this.player2.mesh.scale.x = this.player2.originScale[0]
			this.player2.mesh.scale.y = this.player2.originScale[1]
			this.player2.mesh.scale.z = this.player2.originScale[2]
			this.player2.mesh.position.z = UTILS.POSITION_Z_W1;

			this.remove_triple();
		}
		else if (data.type == 'triple'){
			if (data.action == 'add'){
				this.add_triple();
				console.log('triple enabled');
			}
			else if (data.action == 'remove'){
				console.log('triple removed');
				this.remove_triple();
			}
		}
		else if (data.type == 'scale'){
			console.log(data)
			let taker = null;
			if(data.player == 'player_one')
				taker = this.player1.mesh;
			else
				taker = this.player2.mesh;
			taker.scale.set(0.7, 0.7, 0.7);
			taker.position.z = 3;
		}
		else if (data.type == 'slowness'){
			
		}

	}

	gameMessage(msg) {
		if (msg.event == "state")
			this.updateState(msg);
		else if(msg.event == "exchanges"){
			this.exchanges = msg.message.exchanges - 1;
			this.updateExchanges();

			if (msg.message.add_powerup){
				console.log("powerup added")
				console.log(msg.message);
				this.addPowerUp(msg.message);
			}

			// Sound collision
			if (this.world.soundCollision.isPlaying)
				this.world.soundCollision.stop();
			this.world.soundCollision.play();
		}
		else if (msg.event == "score")
			this.updateScore(msg);
		else if (msg.event == "soundWallCollision"){

			if (this.world.soundWallCollision.isPlaying)
				this.world.soundWallCollision.stop();
			this.world.soundWallCollision.play();
		}
		else if (msg.event == "soundPoint"){
			if (this.world.soundPoint.isPlaying)
				this.world.soundPoint.stop();
			this.world.soundPoint.play();

			if (this.world.soundCoundwon.isPlaying)
				this.world.soundCoundwon.stop();
			this.world.soundCoundwon.play();

		}
		// Powerup events
		else if (msg.event == "handle_powerup"){
			this.handlePowerUp(msg.message);
		}
	}

	gameStart(data){
		this.searching = false;
			this.htmlElement.querySelector('#searching-message').style.display = 'none';
			console.log("game started")
			console.log(data.player)
			this.start = new Date();
			this.player1.name = data.username_one;
			this.player2.name = data.username_two;
			if (data.player == "player_one"){
				this.superPlayer = this.player1;
			}
			else if (data.player == "player_two"){
				this.superPlayer = this.player2;
			}
			if (this.world.username1)
				this.world.setUsernameFont('one', data.username_one)
			if (this.world.username2)
				this.world.setUsernameFont('two', data.username_two)

			if (this.world.name == 'thefinals'){
				this.htmlElement.querySelector('#interface-player1').innerHTML = data.username_one;
				this.htmlElement.querySelector('#interface-player2').innerHTML = data.username_two;
			}

			this.started = true;

			if (this.world.soundCoundwon.isPlaying)
				this.world.soundCoundwon.stop()
			this.world.soundCoundwon.play()
	}

	onMessage(event) {
		const msg = JSON.parse(event.data);
		if (msg.type == "game_message")
			this.gameMessage(msg);
		else if (msg.type == "game_start")
		{
			this.gameStart(msg);
		}
		else if (msg.type == "game_end")
		{
			if (this.world.soundCoundwon.isPlaying)
				this.world.soundCoundwon.stop();
			
			this.started = false;
			if (msg.message.type == "disconnection")
				this.gameEnd('disconnection');
			else
				this.gameEnd('normal');
		}
    }

	onKeyDown(event) {
		if (!this.started || !this.connected)
			return;
		if (event.which == this.player1.upKey || event.which == this.player2.upKey)
		{
			event.preventDefault();
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'up', 'mode' : 'keydown' }));
		}
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
		{
			event.preventDefault();
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'down', 'mode' : 'keydown' }));
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
		if (!this.started || !this.connected)
			return;
		if (event.which == this.player1.upKey || event.which == this.player2.upKey)
		{
			event.preventDefault();
			this.socket.send(JSON.stringify({ 'type': 'input','direction': 'up', 'mode' : 'keyup' }));
		}
		if (event.which == this.player1.downKey || event.which == this.player2.downKey)
		{
			event.preventDefault();
			this.socket.send(JSON.stringify({ 'type': 'input', 'direction': 'down', 'mode' : 'keyup' }));
		}
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

	animateSearching()
	{
		this.htmlElement.querySelector('#searching-message').style.display = 'flex';
		if (this.world.name == "underground")
			return;
		let dots = "";
		let frame = Number(this.htmlElement.querySelector('#interface-timer').innerHTML.substring(3, 5)) % 4;
		if (frame == 0)
			dots = ""
		else if (frame == 1)
			dots = ".";
		else if (frame == 2)
			dots = "..";
		else if (frame == 3)
			dots = "...";
		this.htmlElement.querySelector('#interface-player2').innerHTML = "Searching" + dots;
		this.htmlElement.querySelector('#searching-message').innerHTML = "LOOKING FOR A PLAYER";
	}

	updateState(msg)
	{
		this.player1.mesh.position.y = msg.message.player_one.y;
		this.player2.mesh.position.y = msg.message.player_two.y;
		this.ball.mesh.position.x = msg.message.ball.x;
		this.ball.mesh.position.y = msg.message.ball.y;
		this.ball.direction.x = msg.message.ball.dirX;
		this.ball.direction.y = msg.message.ball.dirY;
	}

	updateScore(msg){


		if (this.world.soundPoint.isPlaying)
			this.world.soundPoint.stop();
		this.world.soundPoint.play();

		this.score1 = msg.message.player_one;
		this.score2 = msg.message.player_two;

		this.updateScoreText();
		this.player1.mesh.position.z = UTILS.POSITION_Z_W1;
		this.player2.mesh.position.z = UTILS.POSITION_Z_W1;
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.mesh.scale.set(this.player1.originScale[0], this.player1.originScale[1], this.player1.originScale[2]);
		this.player2.mesh.scale.set(this.player2.originScale[0], this.player2.originScale[1], this.player2.originScale[2]);
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

	/**
	 * @override
	 */
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

		this.world.add(b1.mesh);
		this.world.add(b2.mesh);
	}

	tripleUpdate(deltaTime){
		if (!this.tripleEnabled){
			this.remove_triple()
			return ;
		}

		const ball1 = this.fakeBalls[0];
		const ball2 = this.fakeBalls[1];

		// ball1.mesh.position.x += ball1.speed * ball1.direction.x * deltaTime;
		ball1.mesh.position.x = this.ball.mesh.position.x
		ball1.mesh.position.y += ball1.speed * ball1.direction.y * deltaTime;
		ball1.mesh.position.z = ball1.getZ();

		// ball2.mesh.position.x += ball2.speed * ball2.direction.x * deltaTime;
		ball2.mesh.position.x = this.ball.mesh.position.x
		ball2.mesh.position.y += ball2.speed * ball2.direction.y * deltaTime;
		ball2.mesh.position.z = ball2.getZ();

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

    update() {
		if (this.searching)
			this.animateSearching();
		const currentTime = new Date();
		const deltaTime = (currentTime - this.update_time_ball) / 1000; // Convert to seconds

		this.update_time_ball = currentTime;

!		this.world.rotatePowerUp();
		this.tripleUpdate(deltaTime);
		this.ball.mesh.position.z = this.ball.getZ();

		// Update game interface
		this.updateHtmlInterface();
	}

	render() {
		this.world.renderer.render(this.world.scene, this.world.activeCamera);
	}
}
