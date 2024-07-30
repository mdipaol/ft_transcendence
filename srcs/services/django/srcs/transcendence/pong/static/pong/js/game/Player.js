import * as UTILS from './utils.js';

export class Player {

	// static paddle = Player.loadPaddle();

	constructor(paddle) {
		this.mesh = paddle;
		this.originScale = [this.mesh.scale.x, this.mesh.scale.y, this.mesh.scale.z];
		this.speed = UTILS.MOVSPEED;
        this.name = "Undefined";
		this.moves = {
			up: false,
			down:false
		}
		this.powerUp = null;
		this.upKey = null;
		this.downKey = null;
	}
}
