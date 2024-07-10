import * as UTILS from './Utils.js';

export class Player {

	// static paddle = Player.loadPaddle();

	constructor(paddle) {
		this.mesh = paddle;
		this.originScale = [this.mesh.scale.x, this.mesh.scale.y, this.mesh.scale.z];
		// console.log(this.mesh)
		this.speed = UTILS.MOVSPEED;
		this.name = "Undefined";
		this.moves = {
			up: false,
			down:false
	}
	this.mesh.position.z = -10;
	this.powerUp = null;
}
}

