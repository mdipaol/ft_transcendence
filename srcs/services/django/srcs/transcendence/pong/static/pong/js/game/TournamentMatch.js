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
}