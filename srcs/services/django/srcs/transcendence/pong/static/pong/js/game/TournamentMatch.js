import { Match } from './Match.js'
import { OnlineMatch } from './OnlineMatch.js'
import * as UTILS from './utils.js'

export class TournamentMatch extends OnlineMatch {
    constructor(world, powerUpMode) {
        super(world, powerUpMode);
	}

    async ready(matchId){
		return new Promise((resolve, reject) => {

			let powerUpMode = '/ws/game/normal/' + matchId.toString() + '/';
			if (this.powerUpMode)
				powerUpMode = '/ws/game/powerup/' + matchId.toString() + '/';

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

	/*
	 *	Override
	 */
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
			this.world.setUsernameFont('one', data.alias_one ? data.alias_one : data.username_one)
		if (this.world.username2)
			this.world.setUsernameFont('two', data.alias_two ? data.alias_two : data.username_two)

		if (this.world.name == 'thefinals') {
			const name1 = data.alias_one ? data.alias_one : data.username_one;
			const name2 = data.alias_two ? data.alias_two : data.username_two;
			this.htmlElement.querySelector('#interface-player1').innerHTML = name1;
			this.htmlElement.querySelector('#interface-player2').innerHTML = name2;
		}

		this.started = true;

		if (this.world.soundCoundwon.isPlaying)
			this.world.soundCoundwon.stop()
		this.world.soundCoundwon.play()
	}

}