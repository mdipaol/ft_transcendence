import * as UTILS from './Utils.js';

export class PowerUp{
	constructor(name, mesh, type) {
		this.name = name;
		this.mesh = mesh;
		this.type = type;
		this.duration = UTILS.POWERUPDURATION;
	}
}
