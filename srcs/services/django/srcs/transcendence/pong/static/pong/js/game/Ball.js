import * as THREE from 'three';

import * as UTILS from './utils.js';

export class Ball {
	constructor(color){
		this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 32),
            new THREE.MeshPhongMaterial({color: color, emissive: color})
        );
		this.mesh.add(new THREE.PointLight(color, 5, 100, 1))
		this.speed = UTILS.STARTINGSPEED;
		this.mesh.position.z = 10;
		this.direction = {
			x: 1,
			y: 0
		}
		this.posCurve = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3( -45, 0, 10 ),
				new THREE.Vector3( 0, 0, 15 ),
				new THREE.Vector3( 25, 0, -0.1),
				new THREE.Vector3( 54, 0, 8 ),
				new THREE.Vector3(65, 0, 12)
			]
		);
		this.negCurve = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3( 45, 0, 10),
				new THREE.Vector3( 0, 0, 15 ),
				new THREE.Vector3( -25, 0, -1),
				new THREE.Vector3( -54, 0, 8 ),
				new THREE.Vector3(-65, 0, 12)
			]
		)
	}

	getZ()
	{
		let z;
		if (this.direction.x > 0)
			z = this.posCurve.getPointAt(UTILS.roundPos((this.mesh.position.x + 45)/100)).z;
		else
			z = this.negCurve.getPointAt(UTILS.roundPos((-this.mesh.position.x + 45)/100)).z;
		return z;
	}
}
