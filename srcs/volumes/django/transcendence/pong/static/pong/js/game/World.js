import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import * as UTILS from './Utils.js';
import { PowerUp } from './PowerUp.js';

export class World {
	constructor(){
		this.paddle = null;
		this.table = null;
		this.ready = new Promise(function(resolve, reject) {});
		this.scene = new THREE.Scene();
		this.mainCamera = this.getMainCamera();
		this.player1Camera = this.getPlayer1Camera();
		this.player2Camera = this.getPlayer2Camera();
		this.activeCamera = this.mainCamera;
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.orbitControls = new OrbitControls( this.mainCamera, this.renderer.domElement);
		this.fbxLoader = new FBXLoader();
		this.objLoader = new OBJLoader();
		this.mtlLoader = new MTLLoader();
		this.fontLoader = new FontLoader();
		this.font = null;
		//this.laodTable();
		this.powerUp = null;
		this.skyboxInit();
		this.posterInit();
		this.loadObjects();
		//gest cube powerup
		const spotLight = new THREE.SpotLight(0x00ff00, 15, 10000, Math.PI/2, 1,  1);
		this.spotLight = spotLight;
		this.arrayPowerup = this.powerUpsInit();
		//end gest cube
	}
	powerUpsInit(){
		const posColor = 0x00ff00;
		const negColor = 0xff0000;
		const posLineColor = 0x03c03c;
		const negLineColor = 0xa2231d;
		const cubeGeometry = new THREE.DodecahedronGeometry(3, 0);
		const cubeMaterial = new THREE.MeshPhongMaterial( {color: posColor, emissive:posColor, emissiveIntensity:0.7} );//cube material
		const cube = new THREE.Mesh( cubeGeometry, cubeMaterial);
		const cubeEdgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
		const cubeLineMaterial = new THREE.LineBasicMaterial({ color: posLineColor});
		const cubeEdges = new THREE.LineSegments(cubeEdgesGeometry, cubeLineMaterial);
		cube.add(cubeEdges);
		cube.add(new THREE.PointLight(posColor, 15, 100000000, 0.6));
		//negative
		const cubeMaterial_N = new THREE.MeshPhongMaterial( {color: negColor, emissive:negColor, emissiveIntensity:0.7} );
		const cube_N = new THREE.Mesh( cubeGeometry, cubeMaterial_N);
		const lineMaterial_N = new THREE.LineBasicMaterial({ color: negLineColor});
		const cubeEdges_N = new THREE.LineSegments(cubeEdgesGeometry, lineMaterial_N);
		cube_N.add(cubeEdges_N);
		cube_N.add(new THREE.PointLight(negColor, 15, 100000000, 0.6));

		// OctahedronGeometry // prisma
		//positive
		const prismGeometry = new THREE.OctahedronGeometry(3,0);
		const prismMaterial = new THREE.MeshPhongMaterial({color: posColor, emissive:posColor, emissiveIntensity:0.7});
		const prism = new THREE.Mesh(prismGeometry, prismMaterial);
		const prismEdgesGeometry = new THREE.EdgesGeometry(prismGeometry);
		const prismLineMaterial = new THREE.LineBasicMaterial({ color: posLineColor});
		const prismEdges = new THREE.LineSegments(prismEdgesGeometry, prismLineMaterial);
		prism.add(prismEdges);
		prism.add(new THREE.PointLight(posColor, 15, 100000000, 0.6));
		//negative
		const prismMaterial_N = new THREE.MeshPhongMaterial({color: negColor, emissive:negColor, emissiveIntensity:0.7});
		const prism_N = new THREE.Mesh(prismGeometry,prismMaterial_N);
		const prismLineMaterial_N = new THREE.LineBasicMaterial({ color: negLineColor});
		const prismEdges_N = new THREE.LineSegments(prismEdgesGeometry, prismLineMaterial_N);
		prism_N.add(prismEdges_N);
		prism_N.add(new THREE.PointLight(negColor, 15, 100000000, 0.6));

		//TorusGeometry //donut
		//positivedonut
		const donutGeometry = new THREE.TorusGeometry(3, 1.5);
		const donutMaterial = new THREE.MeshPhongMaterial({color: posColor, emissive:posColor, emissiveIntensity: 0.7 });
		const donut = new THREE.Mesh(donutGeometry, donutMaterial);
		donut.add(new THREE.PointLight(posColor, 15, 100000000, 0.6));
		//negativedonut
		const donutMaterial_N = new THREE.MeshPhongMaterial({color: negColor, emissive:negColor, emissiveIntensity: 0.7 });
		const donut_N = new THREE.Mesh(donutGeometry, donutMaterial_N);
		donut_N.add(new THREE.PointLight(negColor, 15, 100000000, 0.6));

		//positivecapsule
        const capsuleGeometry = new THREE.CapsuleGeometry( 3, 1, 4, 8 );
        const capsuleMaterial = new THREE.MeshPhongMaterial( {color: posColor, emissive:posColor, emissiveIntensity: 0.7} );
        const capsule = new THREE.Mesh( capsuleGeometry, capsuleMaterial );
        capsule.add(new THREE.PointLight(posColor, 15, 100000000, 0.6));
        //negativecapsule
        const capsuleMaterial_N = new THREE.MeshPhongMaterial( {color: posColor, emissive:posColor, emissiveIntensity: 0.7} );
        const capsule_N = new THREE.Mesh( capsuleGeometry, capsuleMaterial_N );
        capsule_N.add(new THREE.PointLight(posColor, 15, 100000000, 0.6));

		const arrayPowerup = [
			new PowerUp("speed", cube, "positive") ,
			new PowerUp("speed", cube_N, "negative") ,
			new PowerUp("slowness", prism, "positive"),
			new PowerUp("slowness", prism_N, "negative"),
			new PowerUp("triple", donut, "positive"),
			new PowerUp("triple", donut_N, "negative"),
			new PowerUp("scale", capsule , "positive"),
            new PowerUp("scale", capsule_N , "negative"),
		]
		return arrayPowerup;
	}
	/* vik ha modificato */
	randomPowerUp(){
		const index = Math.floor(Math.random() * this.arrayPowerup.length);
		return this.arrayPowerup[index];
	}

	resize(width, height) {
		this.renderer.setSize(width, height);
		this.mainCamera.aspect = width / height;
		this.player1Camera.aspect = width / height;
		this.player2Camera.aspect = width / height;
		this.mainCamera.updateProjectionMatrix();
		this.player1Camera.updateProjectionMatrix();
		this.player2Camera.updateProjectionMatrix();
	}

	add(obj) {
		this.scene.add(obj);
	}

	remove(obj) {
		this.scene.remove(obj);
	}

	getMainCamera() {
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, -10, 70);
		camera.lookAt(0, 0, 0);
		return camera;
	}

	getPlayer1Camera() {
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(-75, 0, 40 );
		camera.lookAt(0, 0, 0);
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, -1 ),1.57);
		return camera;
	}

	getPlayer2Camera() {
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(75, 0, 40 );
		camera.lookAt(0, 0, 0);
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ),1.57);
		return camera;
	}

	setCamera(camera) {
		this.activeCamera = camera;
		if (this.activeCamera === this.mainCamera)
			this.orbitControls.enabled = true;
		if (this.activeCamera === this.player1Camera || this.activeCamera === this.player2Camera)
			this.orbitControls.enabled = false;
		this.orbitControls.update();
	}
	/* vik a modificato */
	rotatePowerUp() {
		if(this.powerUp){
			this.powerUp.mesh.rotation.x += 0.05;
			this.powerUp.mesh.rotation.y += 0.05;
		}
	}

	skyboxInit() {
		const box = new THREE.BoxGeometry(UTILS.BOXSIZE, UTILS.BOXSIZE, UTILS.BOXSIZE);
		const wall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("/static/pong/assets/images/mattone.png"), side: THREE.DoubleSide});
		const rotatedWall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, side: THREE.DoubleSide, map: (() => {
			const texture = new THREE.TextureLoader().load("/static/pong/assets/images/mattone.png");
			texture.center.set(0.5, 0.5);
			texture.rotation = Math.PI/ 2;
			return texture;
		})()})

		const wood = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("/static/pong/assets/images/wood.png"), side: THREE.DoubleSide});
		const cubeMaterial =[rotatedWall, rotatedWall, wall, wall, wood, wood]
		const cube = new THREE.Mesh(box, cubeMaterial);
		cube.position.set(0, 0, 102)
		this.add(cube);
	}

	posterInit() {
		const posterGeometry = new THREE.PlaneGeometry( 53.85, 68.35 );
		const posterMaterial = new THREE.MeshPhongMaterial( {map:  new THREE.TextureLoader().load("/static/pong/assets/images/escape_room.jpg") , side: THREE.DoubleSide});
		const poster = new THREE.Mesh( posterGeometry, posterMaterial );
		poster.rotation.set(Math.PI/2, 0, 0);
		poster.position.set(0, 124.5, 70);
		poster.scale.set(1.5,1.5,1.5);
		this.add(poster);
	}

	loadTable() {
		return new Promise((resolve, reject) => {
		this.fbxLoader.load(
			'/static/pong/assets/models/pingpongtable.fbx',
			(object)=>{
				object.children[0].visible = false;
				object.children[2].visible = false;
				object.children[5].visible = false;
				object.children[3].visible = false;
				object.scale.set(0.08,0.09,0.09);
				object.rotation.set(Math.PI / 2, 0, 0);
				object.position.set(0, 0, -23.5);
				console.log(object);
				this.table = object;
				this.add(this.table);
				resolve();
			},
			(xhr) => console.log((xhr.loaded / xhr.total * 100) + '% table loaded'),
			(error) => reject(error)
			)
		});
	}
	loadPaddle() {
		return new Promise((resolve, reject) => {

			this.mtlLoader.load('/static/pong/assets/models/paddle/paddle.mtl',
			(materials) =>{
				materials.preload();

				this.objLoader.setMaterials(materials);
				this.objLoader.load('/static/pong/assets/models/paddle/paddle.obj', (object) => {
					object;
					object.traverse(function(child) {
						if (child instanceof THREE.Mesh) {
							child.geometry.computeVertexNormals();
						}
					});
				this.paddle = object;
				resolve();
				});
			},
			(xhr) => console.log((xhr.loaded / xhr.total * 100) + '% paddle loaded'),
			(error) => reject(error)
			);
		})
	}

	loadFonts() {
		return new Promise((resolve, reject) => {
			this.fontLoader.load(
				// 'Beauty.json',
				'/static/pong/assets/fonts/Beauty.json',
				(font) => {
					this.font = font;
					const geometry = new TextGeometry( 'PONG', {
						font: font,
						size: 22,
						height: 1,

					});
					const emissive_color = 0xA020F0;
					const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, Math.PI/2, 0);
					text.position.set(-125, 0, 47)
					const neonLight = new THREE.PointLight(emissive_color, 15, 100000000, 0.6);
					neonLight.position.set(-110, 0, 47);

					const neon2 = neonLight.clone()
					const text2 = text.clone()
					text2.scale.x = -text2.scale.x;
					text2.position.set(0,0,0);
					text2.position.set(124, 0, 47)
					neon2.position.set(110, 0, 47);


					this.add(neonLight);
					this.add(neon2);
					this.add(text2);
					this.add(text);




					resolve();
				},
				(xhr) => console.log((xhr.loaded / xhr.total * 100) + '% font loaded'),
				(error) => reject(error)
			)
		});
	}

	// loadMesh() {
    //     const loader = new FBXLoader();
    //     loader.load('vaso_vikfbx.fbx', (object) => {

	// 		// Imposta la posizione dell'oggetto

    //         // Rotazione di 90 gradi sull'asse Y
    //         object.rotation.x = Math.PI/2;
    //         object.position.set(-90, 90, -10);
    //         object.scale.multiplyScalar(10);

	// 		//addObject(object, new THREE.Vector3(-90,90,-10));
    //         this.add(object);
	// 		const object1 = object.clone();
	// 		const object2 = object.clone();
	// 		const object3 = object.clone();
	// 		object1.position.set(-90,-90,-10);
	// 		object2.position.set(90,90,-10);
	// 		object3.position.set(90,-90,-10);
	// 		this.add(object1);
	// 		this.add(object2);
	// 		this.add(object3);

    //     }, undefined, (error) => {
    //         console.error('Errore nel caricamento dell\'oggetto FBX:', error);
    //     });
	// 	const loader1 = new FBXLoader();
	// 	loader1.load('door.fbx', (object) => {
	// 		object.rotation.x = Math.PI/2;
	// 		object.rotation.y = Math.PI;
	// 		object.position.set(0,-120,28);
	// 		object.scale.multiplyScalar(20);
	// 		this.add(object);
	// 	})
    // }

	async loadObjects() {
		this.ready = new Promise((resolve) => {
		const proms = [
		this.loadPaddle(),
		this.loadTable(),
		this.loadFonts(),
		];
		Promise.all(proms).then(() => {;
		console.log("All objects loaded");
		resolve();
		});
	});

	}
}
