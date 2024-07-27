import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import * as UTILS from './utils.js';
import { PowerUp } from './PowerUp.js';

export class World {
	constructor(){
		this.paddle = null;
		this.paddle2 = null;
		this.table = null;
		this.door = null;
		this.ready = new Promise(function(resolve, reject) {});
		this.scene = new THREE.Scene();
		this.mainCamera = this.getMainCamera();
		this.player1Camera = this.getPlayer1Camera();
		this.player2Camera = this.getPlayer2Camera();
		this.DoorExit = this.getExitDoor();
		this.activeCamera = this.mainCamera;
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.orbitControls = new OrbitControls( this.mainCamera, this.renderer.domElement);
		this.fbxLoader = new FBXLoader();
		this.objLoader = new OBJLoader();
		this.mtlLoader = new MTLLoader();
		this.fontLoader = new FontLoader();
		this.audioLoader = new THREE.AudioLoader();
		this.listener = new THREE.AudioListener();
		this.soundCollision = null;
		this.gltfLoader = new GLTFLoader();
		this.dracoLoader = new DRACOLoader();
		// 'https://www.gstatic.com/draco/v1/decoders/'
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
		this.dracoLoader.setDecoderConfig({type: 'js'});
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
		// Usernames font
		this.font = null;
		this.usernameFont = null;
		this.username1 = null;
		this.username1Mirror = null;
		this.username2 = null;
		this.username2Mirror = null;

		this.powerUp = null;
		this.skyboxInit();
		this.posterInit();
		//gest cube powerup
		const spotLight = new THREE.SpotLight(0x00ff00, 15, 10000, Math.PI/2, 1,  1);
		this.spotLight = spotLight;
		this.mapPowerUp = new Map();
		this.arrayPowerup = this.powerUpsInit();
		//end gest cube

		this.loadObjects();
	}


	async worldReady(){
		return this.ready;
	}

	resetMesh(){

		if (!this.paddle || !this.paddle2){
			return;
		}

		this.paddle.position.z = UTILS.POSITION_Z_W;
		this.paddle2.position.z = UTILS.POSITION_Z_W;
	}

	setUsernameFont(player, playerName){
		if (player == 'one'){

			const geometry = new TextGeometry( UTILS.truncateString(playerName, 10) , {
				font: this.usernameFont,
				size: 22,
				depth: 1,
			})

			geometry.computeBoundingBox();
			geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);

			this.username1.geometry = geometry;
			this.username1Mirror.geometry = geometry;

		}
		if (player == 'two'){

			const geometry = new TextGeometry( UTILS.truncateString(playerName, 10) , {
				font: this.usernameFont,
				size: 22,
				depth: 1,
			})

			geometry.computeBoundingBox();
			geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);

			this.username2.geometry = geometry;
			this.username2Mirror.geometry = geometry;
		}
	}

	setMeshStandardMaterial(M_color, M_color_emissive, M_emissiveIntensity, M_roughness, M_metalness, M_reflectivity){
		return new THREE.MeshStandardMaterial({
			color: M_color,
			emissive: M_color_emissive,
			emissiveIntensity: M_emissiveIntensity,
			roughness: M_roughness,
			metalness: M_metalness,
			//reflectivity: M_reflectivity
		});
	}

	setMeshGLTF(path, material, scale, rotationX, rotationY, rotationZ){
		return new Promise((resolve, reject)=>{
			this.gltfLoader.load(
				path,
				(object)=>{
					const obj = object.scene;
					obj.rotation.set(rotationX, rotationY, rotationZ);
					obj.scale.multiplyScalar(scale);
					obj.traverse((child)=>{
						if(child.isMesh)
							child.material = material
					});
					//this.scene.add(obj);
					resolve(obj);
				});
				undefined,
				(error)=>{
					reject(error);
				}
		});
	}

	loadPowerUpMap(path, type, scale, rotation){
		return new Promise((resolve, reject)=>{
			this.gltfLoader.load(
				path,
				(object)=>{

					const obj = object.scene;
					obj.rotation.set(rotation[0], rotation[1], rotation[1]);
					obj.scale.multiplyScalar(scale);


					const posColor = 0x00ff00;
					const negColor = 0xff0000;
					const PosMaterial = this.setMeshStandardMaterial(posColor, posColor, 10, 0, 1, 1);
					const NegMaterial = this.setMeshStandardMaterial(negColor, negColor, 10, 0, 1, 1);
					const negativePowerUp = obj.clone();

					obj.traverse((child)=>{
						if(child.isMesh)
							child.material = PosMaterial
					});
					negativePowerUp.traverse((child)=>{
						if(child.isMesh)
							child.material = NegMaterial
					});
					//this.scene.add(obj);
					this.mapPowerUp.set(type + "Positive", new PowerUp(type, obj, 'positive'));
					this.mapPowerUp.set(type + "Negative", new PowerUp(type, negativePowerUp, 'negative'));
					resolve();
				});
				undefined,
				(error)=>{
					reject(error);
				}
		});
	}

	powerUpsInit(){
		//const mesh_array =[];
		const arrayPowerup=[null, null, null, null, null, null, null, null];
		const posColor = 0x00ff00;
		const negColor = 0xff0000;
		const posLineColor = 0x03c03c;
		const negLineColor = 0xa2231d;
		const PosMaterial = this.setMeshStandardMaterial(posColor, posColor, 10, 0, 1, 1);
		const NegMaterial = this.setMeshStandardMaterial(negColor, negColor, 10, 0, 1, 1);
		//speed///
		const Fulmine_P = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/Speed_fulmine.glb', PosMaterial, 2.5, Math.PI/2, Math.PI/2, 0);
		Fulmine_P.then((mesh)=>{
			// arrayPowerup.push(new PowerUp("speed", mesh, "positive"));
			arrayPowerup[0] = new PowerUp("speed", mesh, "positive");
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		})

		const Fulmine_N = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/Speed_fulmine.glb', NegMaterial,2.5 , Math.PI/2, Math.PI/2, 0);
		Fulmine_N.then((mesh)=>{
			// arrayPowerup.push(new PowerUp("speed", mesh, "negative"));
			arrayPowerup[1] = new PowerUp("speed", mesh, "negative");
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//slow////
		const Turtle_P = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/slow_tartaruga.glb', PosMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Turtle_P.then((mesh)=>{
			arrayPowerup[2] = new PowerUp("slowness", mesh, "positive");
			// arrayPowerup.push(new PowerUp("slowness", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Turtle_N = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/slow_tartaruga.glb', NegMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Turtle_N.then((mesh)=>{
			arrayPowerup[3] = new PowerUp("slowness", mesh, "negative");
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//triple
		const Triple_P = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/tripla_x3.glb', PosMaterial, 4, Math.PI/2, Math.PI/2, 0);
		Triple_P.then((mesh)=>{
			arrayPowerup[4] = new PowerUp("triple", mesh, "positive");
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Triple_N = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/tripla_x3.glb', NegMaterial,4, Math.PI/2, Math.PI/2, 0);
		Triple_N.then((mesh)=>{
			arrayPowerup[5] = new PowerUp("triple", mesh, "negative");
			//this.scene.add(mesh);
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//scale
		const Scale_P = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/scale_Arrow.glb', PosMaterial,2.5, -Math.PI/2, Math.PI/2, 0);
		Scale_P.then((mesh)=>{
			arrayPowerup[6] = new PowerUp("scale", mesh, "positive");
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});
		const Scale_N = this.setMeshGLTF('/static/pong/js/Pong_Fake/PowerUp/scale_Arrow.glb', NegMaterial, 2.5, -Math.PI/2, Math.PI/2, 0);
		Scale_N.then((mesh)=>{
			arrayPowerup[7] = new PowerUp("scale", mesh, "negative");

		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});
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

	getExitDoor(){
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 40, 30);
		camera.lookAt(0,0,0);
		camera.rotateOnAxis(new THREE.Vector3(0,0,1), 1.57);
		return(camera);
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
			if(this.powerUp.mesh){
				let speed = 0.01;
				let oscillazioneZ = 10;
				let oscillazioneAngleZ = Math.sin(Date.now() * speed) * Math.PI / 8; // Modifica Math.PI / 8 per regolare l'ampiezza dell'oscillazione su z
				this.powerUp.mesh.position.z = oscillazioneAngleZ + oscillazioneZ;
				this.powerUp.mesh.rotation.y += 0.03;
			}
		}
	}

	skyboxInit() {
		const box = new THREE.BoxGeometry(UTILS.BOXSIZE, UTILS.BOXSIZE, UTILS.BOXSIZE);
		const wall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("/static/pong/js/Pong_Fake/mattone.png"), side: THREE.DoubleSide});
		const rotatedWall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, side: THREE.DoubleSide, map: (() => {
			const texture = new THREE.TextureLoader().load("/static/pong/js/Pong_Fake/mattone.png");
			texture.center.set(0.5, 0.5);
			texture.rotation = Math.PI/ 2;
			return texture;
		})()})

		const wood = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("/static/pong/js/Pong_Fake/wood.png"), side: THREE.DoubleSide});
		const cubeMaterial =[rotatedWall, rotatedWall, wall, wall, wood, wood]
		const cube = new THREE.Mesh(box, cubeMaterial);
		cube.position.set(0, 0, 102)
		this.add(cube);
	}

	posterInit() {
		const posterGeometry = new THREE.PlaneGeometry( 53.85, 68.35 );
		const posterMaterial = new THREE.MeshPhongMaterial( {map:  new THREE.TextureLoader().load("/static/pong/js/Pong_Fake/escape_room.jpg") , side: THREE.DoubleSide});
		const poster = new THREE.Mesh( posterGeometry, posterMaterial );
		poster.rotation.set(Math.PI/2, 0, 0);
		poster.position.set(0, 124.5, 70);
		poster.scale.set(1.5,1.5,1.5);
		this.add(poster);
	}

	loadPlant(){
		return new Promise((resolve, reject) =>{
			this.gltfLoader.load(
				'/static/pong/js/Pong_Fake/UtilsMesh/pianta_vik.glb',
				(object)=>{
					const threeObj = object.scene.children[0];
					threeObj.rotation.set(Math.PI / 2, 0, 0);
					threeObj.scale.multiplyScalar(13);
					threeObj.position.set(-100, 90, -10);
					const object1 = threeObj.clone();
					object1.position.set(-100, -90, -10);
					const object2 = threeObj.clone();
					object2.position.set(100, 90, -10);
					const object3 = threeObj.clone();
					object3.position.set(100, -90, -10);
					const all_object = [threeObj, object1, object2, object3];
					this.add(all_object[0]);
					this.add(all_object[1]);
					this.add(all_object[2]);
					this.add(all_object[3]);

					resolve();
				}
			)

			});
	}

	loadNeon_angular(){
		return new Promise((resolve, reject) => {
			const geometry = new THREE.CylinderGeometry(5, 5, 600, 32);
			const material = new THREE.MeshBasicMaterial({ color: 0xFF4E4E });
			const cylinder = new THREE.Mesh(geometry, material);
			cylinder.position.set(-120, 120 , 110);
			cylinder.rotation.x = Math.PI / 2;
			cylinder.scale.multiplyScalar(0.4);
			cylinder.add(new THREE.PointLight(0xFF4E4E, 5, 500,0.6));
			// Correzione: ottenere la geometria del cilindro da utilizzare per gli spigoli
			const cylinderEdgesGeometry = new THREE.EdgesGeometry(geometry);
			const cylinderLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
			const cylinderEdges = new THREE.LineSegments(cylinderEdgesGeometry, cylinderLineMaterial);


			const geometry1= new THREE.CylinderGeometry(5, 5, 600, 32);
			const material1 = new THREE.MeshBasicMaterial({ color: 0x9B4EFF});
			const cylinder1 = new THREE.Mesh(geometry1, material1);
			cylinder1.rotation.x = Math.PI / 2;
			cylinder1.position.set(120, 120, 110);
			cylinder1.add(new THREE.PointLight(0x9B4EFF, 5, 500,0.6));
			cylinder1.scale.multiplyScalar(0.4);


			const geometry2 = new THREE.CylinderGeometry(5, 5, 600, 32);
			const material2 = new THREE.MeshBasicMaterial({ color: 0x6CFF4E });
			const cylinder2 = new THREE.Mesh(geometry2, material2);
			cylinder2.rotation.x = Math.PI / 2;
			cylinder2.position.set(-120, -120, 110);
			cylinder2.scale.multiplyScalar(0.4);
			cylinder2.add(new THREE.PointLight(0x6CFF4E, 5, 500,0.6));

			const geometry3= new THREE.CylinderGeometry(5, 5, 600, 32);
			const material3 = new THREE.MeshBasicMaterial({ color: 0xFFC662 });
			const cylinder3 = new THREE.Mesh(geometry3, material3);
			cylinder3.position.set(120, -120, 110);
			cylinder3.rotation.x = Math.PI / 2;
			cylinder3.scale.multiplyScalar(0.4);
			cylinder3.add(new THREE.PointLight(0xFFC662, 5, 500,0.6));


			this.add(cylinder);
			this.add(cylinder1);
			this.add(cylinder2);
			this.add(cylinder3);
			resolve();
		});
	}

	loadPort(){
		return new Promise((resolve, reject)=>{
			this.gltfLoader.load(
				'/static/pong/js/Pong_Fake/UtilsMesh/boor_2.glb',
				(object)=>{
					const threeObj = object.scene;
					this.door = object.scene.children[0];
					threeObj.rotation.x = Math.PI/2;
					threeObj.rotation.y = Math.PI;
					threeObj.position.set(-15, -117, -22);
					threeObj.scale.multiplyScalar(25);
					this.door.material.emissive = new THREE.Color(0x808080); // Colore emissivo (verde in questo caso)
                    this.door.material.emissiveIntensity = 0.025;
					this.add(object.scene);
					resolve();
				}
			)
		})
	}

	loadTable() {
		return new Promise((resolve, reject) => {
		this.gltfLoader.load(
			'/static/pong/js/Pong_Fake/table/ping_pong_table.glb',
			(object)=>{

				const threeObj = object.scene.children[0];

				const geometry = threeObj.children[0].geometry;
				const desiredWidth = 104;
				geometry.computeBoundingBox();
				const boundingBox = geometry.boundingBox;
				const currentWidth = boundingBox.max.x - boundingBox.min.x;
				const scaleFactor = desiredWidth / currentWidth;

				threeObj.scale.set(scaleFactor, scaleFactor, scaleFactor);
				threeObj.rotation.set(Math.PI / 2, 0, 0);
				threeObj.position.set(0, 0, -23.5);
				this.add(object.scene);
				resolve();
			},
			(xhr) => console.log((xhr.loaded / xhr.total * 100) + '% table loaded'),
			(error) => reject(error)
			)
		});
	}


	loadPolletto() {
		return new Promise((resolve, reject) => {
			const textureLoader = new THREE.TextureLoader();
			textureLoader.load(
				'/static/pong/js/Pong_Fake/polletto.jpeg',
				(texture) => {
					const material = new THREE.MeshBasicMaterial({ map: texture });
					const geometry = new THREE.PlaneGeometry(1, 2); // Dimensioni del piano
					const mesh = new THREE.Mesh(geometry, material);
					mesh.rotation.x = Math.PI/2;
					mesh.rotation.y = Math.PI;
					mesh.position.set(-35, -120, 40);
					mesh.scale.multiplyScalar(60);
					this.add(mesh);
					resolve();
				}
			);
		});
	}

	loadPaddle() {
		return new Promise((resolve, reject) => {

			this.mtlLoader.load('/static/pong/js/Pong_Fake/paddle/paddle.mtl',
			(materials) =>{
				materials.preload();

				this.objLoader.setMaterials(materials);
				this.objLoader.load('/static/pong/js/Pong_Fake/paddle/paddle.obj', (object) => {
					object;
					object.traverse(function(child) {
						if (child instanceof THREE.Mesh) {
							child.geometry.computeVertexNormals();
						}
					});
				this.paddle = object;
				this.paddle.rotation.z = Math.PI / 2;
				this.paddle.position.x = -54;
				this.paddle.position.z = UTILS.POSITION_Z_W;
				this.paddle2 = this.paddle.clone();
				this.paddle2.position.x = 54;
				this.paddle2.rotation.z = Math.PI / 2;
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
				'/static/pong/js/Pong_Fake/Font/404font.json',
				(font) => {
					this.font = font;
					const geometry = new TextGeometry( 'PONG', {
						font: font,
						size: 22,
						depth: 1,

					});
					const emissive_color = 0xA020F0;
					const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, Math.PI/2, 0);
					text.scale.multiplyScalar(1/1.7);
					text.position.set(-125, 0, 50)
					const neonLight = new THREE.PointLight(emissive_color, 15, 100000000, 0.6);
					neonLight.position.set(-110, 0, 50);

					const neon2 = neonLight.clone()
					const text2 = text.clone()
					text2.scale.x = -text2.scale.x;
					text2.position.set(0,0,0);
					text2.position.set(124, 0, 50)
					neon2.position.set(110, 0, 50);


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

	loadNickName_1() {
		return new Promise((resolve, reject) => {
			this.fontLoader.load(
				'/static/pong/js/Pong_Fake/Font/Dark Underground_Regular.json',
				(font)=>{
					this.usernameFont = font;
					const geometry = new TextGeometry( 'NickName 1', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0x6AE258, emissive: 0x6AE258, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					//text.add(new THREE.PointLight(0x6AE258, 5, 100000000, 0.6));
					text.rotation.set (Math.PI/2, Math.PI/2, 0);
					text.position.set(-124, -70, 55);
					text.scale.multiplyScalar(1 / 2);
					const text2 = text.clone();
					text2.position.set(124, 70, 55);
					text2.scale.x = -text2.scale.x;

					this.username1 = text;
					this.username1Mirror = text2;

					this.add(text);
					this.add(text2);
					resolve();
			});
		}),
		(error)=> reject(error);
	}



	loadNickName_2() {
		return new Promise((resolve, reject) => {
			this.fontLoader.load(
				'/static/pong/js/Pong_Fake/Font/Dark Underground_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'NickName 2', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0xB92727, emissive: 0xB92727, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					//text.add(new THREE.PointLight(0xB92727, 5, 100000000, 0.6));
					text.rotation.set (Math.PI/2, Math.PI/2, 0);
					text.position.set(-124, 70, 55);
					text.scale.multiplyScalar(1 / 2);
					const text2 = text.clone();
					text2.position.set(124, -70, 55);
					text2.scale.x = -text2.scale.x;
					this.username2 = text;
					this.username2Mirror = text2;
					this.add(text);
					this.add(text2);
					resolve();
			});
		}),
		(error)=> reject(error);
	}

	loadNameTeem(){
		return new Promise((resolve, reject)=>{
			this.fontLoader.load(//viktor
				'/static/pong/js/Pong_Fake/Font/Underground NF_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Vguidoni', {
						font: font,
						size: 22,
						depth: 1,
					});
					const emissiv_color = 0x000000;
					const material = new THREE.MeshPhongMaterial( { color: emissiv_color, emissive: emissiv_color, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, 0, Math.PI/6);
					text.position.set(80, 124, 90);
					text.scale.multiplyScalar(1 / 2);
					this.add(text);
			})
			this.fontLoader.load(//ivana
				'/static/pong/js/Pong_Fake/Font/Dark Underground_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Ivana', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0xB92727, emissive: 0xB92727, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, 0, 0);
					text.position.set(0, 124, 0);
					text.scale.multiplyScalar(1 / 1.5);
					this.add(text);
				})
			this.fontLoader.load(//ale
				'/static/pong/js/Pong_Fake/Font/Sportrop_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'AleGreci', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0xB92727, emissive: 0xB92727, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, 0, -Math.PI/6);
					text.position.set(-80, 124, 90);
					text.scale.multiplyScalar(1 / 2);
					this.add(text);
				})
			this.fontLoader.load(//manuel
				'/static/pong/js/Pong_Fake/Font/Chicago_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Manuel', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0xB92727, emissive: 0xB92727, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, 0, -Math.PI/6);
					text.position.set(65, 124, 45);
					text.scale.multiplyScalar(1 / 2);
					this.add(text);
				})
			this.fontLoader.load(//damiano
				'/static/pong/js/Pong_Fake/Font/Polentical Neon_Bold.json',
				(font)=>{
					const geometry = new TextGeometry( 'dcolucci', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0x56D6DF, emissive: 0x56D6DF, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, 0, Math.PI/10);
					text.position.set(-75, 124, 45);
					text.scale.multiplyScalar(1 / 2.5);
					this.add(text);
				})
			this.fontLoader.load(//questo per il nome del teem
				'/static/pong/js/Pong_Fake/Font/Sportrop_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'POLLETTI', {
						font: font,
						size: 22,
						depth: 1,
					});
					const material = new THREE.MeshPhongMaterial( { color: 0xB92727, emissive: 0xB92727, emissiveIntensity: 1} );
					const text = new THREE.Mesh( geometry, material );
					geometry.computeBoundingBox();
					geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
					text.rotation.set (Math.PI/2, Math.PI, 0);
					text.position.set(0, -124, 110);
					text.scale.multiplyScalar(1);
					this.add(text);
				})
			resolve();
		});
	}

	loadAudio_world() {
		//UTILS.setSound('music/2_Jazz.mp3', true, 0.04);
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			//this.mainCamera.add( this.listener);
			this.sound = sound;
			this.audioLoader.load('/static/pong/js/Pong_Fake/music/undergroundSound.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(true);
				sound.setVolume(0.08);
				sound.play();

				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSoundCollision(){
		//UTILS.setSound('music/ball_hit_2.mp3', false, 0.05);
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.soundCollision = sound;

			this.audioLoader.load('/static/pong/js/Pong_Fake/music/ball_hit.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.5);
				//sound.setPlaybackRate(1);

				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSoundPowerUpP(){//invertito è negativo
		return new Promise((resolve, reject)=> {
			const sound = new THREE.Audio(this.listener);
			this.soundPowerUpNegative = sound;
			//'music/powerdown.mp3'
			this.audioLoader.load('/static/pong/js/Pong_Fake/music/sceet.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.7);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		})
	}
	loadSoundPowerUpN(){//è positivo
		return new Promise((resolve, reject)=> {
			const sound = new THREE.Audio(this.listener);
			this.soundPowerUpPositive = sound;
			//'music/powerup.mp3'
			this.audioLoader.load('/static/pong/js/Pong_Fake/music/wow.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(1.5);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		})
	}

	loadSoundWallCollision(){
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.soundWallCollision = sound;

			this.audioLoader.load('/static/pong/js/Pong_Fake/music/ball_hit.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.3);
				sound.setPlaybackRate(1/1.2);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSounPoint(){
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.soundPoint = sound;
			this.audioLoader.load('/static/pong/js/Pong_Fake/music/point_1.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(1);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSoundEndMach(){
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.soundEndMach = sound;
			this.audioLoader.load('/static/pong/js/Pong_Fake/music/partita_end.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(1);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	async loadObjects() {
		this.ready = new Promise((resolve) => {
		const proms = [
			this.loadPaddle(),
			this.loadPlant(),
			this.loadPort(),
			this.loadNeon_angular(),
			this.loadTable(),
			this.loadFonts(),
			this.loadNickName_1(),
			this.loadNickName_2(),
			this.loadNameTeem(),
			this.loadAudio_world(),
			this.loadSoundCollision(),
			this.loadSoundPowerUpN(),
			this.loadSoundPowerUpP(),
			this.loadSoundWallCollision(),
			this.loadSounPoint(),
			this.loadSoundEndMach(),
			this.loadPowerUpMap('/static/pong/js/Pong_Fake/PowerUp/Speed_fulmine.glb', 'power', 2.5, [Math.PI/2, Math.PI/2, 0]),
			this.loadPowerUpMap('/static/pong/js/Pong_Fake/PowerUp/tripla_x3.glb', 'triple', 4, [Math.PI/2, Math.PI/2, 0]),
			this.loadPowerUpMap('/static/pong/js/Pong_Fake/PowerUp/scale_Arrow.glb', 'scale', 2.5, [-Math.PI/2, Math.PI/2, 0]),
			this.loadPowerUpMap('/static/pong/js/Pong_Fake/PowerUp/slow_tartaruga.glb', 'slowness', 2, [Math.PI/2, Math.PI/2, 0]),
		];
		Promise.all(proms).then(() => {;
		console.log("All objects loaded");
		resolve();
		});
	});
	}

	destroySoundWorld(){
		// Audio delete
		this.sound.stop();
		this.sound.disconnect();
		this.soundCollision.stop();
		this.soundCollision.disconnect();
		this.soundPowerUpNegative.stop();
		this.soundPowerUpNegative.disconnect();
		this.soundPowerUpPositive.stop();
		this.soundPowerUpPositive.disconnect();
		this.soundWallCollision.stop();
		this.soundWallCollision.disconnect();
		this.soundPoint.stop();
		this.soundPoint.disconnect();
		this.soundEndMach.stop();
		this.soundEndMach.disconnect();
		this.soundEndMach.stop();
		this.soundEndMach.disconnect();
	}
}
