import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import * as UTILS from './Utils.js';
import { PowerUp } from './PowerUp.js';

export class World {
	constructor(){
		this.paddle = null;
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
		//this.nikNameloader1 = new FontLoader();
		//this.nikNameloader2 = new FontLoader();
		this.gltfLoader = new GLTFLoader();
		this.dracoLoader = new DRACOLoader();
		// 'https://www.gstatic.com/draco/v1/decoders/'
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
		this.dracoLoader.setDecoderConfig({type: 'js'});
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
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

	setMeshStandardMaterial(M_color, M_color_emissive, M_emissiveIntensity, M_roughness, M_metalness, M_reflectivity){
		return new THREE.MeshStandardMaterial({
			color: M_color,
			emissive: M_color_emissive,
			emissiveIntensity: M_emissiveIntensity,
			roughness: M_roughness,
			metalness: M_metalness,
			reflectivity: M_reflectivity
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

	powerUpsInit(){
		//const mesh_array =[];
		const arrayPowerup=[]
		const posColor = 0x00ff00;
		const negColor = 0xff0000;
		const posLineColor = 0x03c03c;
		const negLineColor = 0xa2231d;
		const PosMaterial = this.setMeshStandardMaterial(posColor, posColor, 10, 0, 1, 1);
		const NegMaterial = this.setMeshStandardMaterial(negColor, negColor, 10, 0, 1, 1);
		//speed///
		const Fulmine_P = this.setMeshGLTF('PowerUp/Speed_fulmine.glb', PosMaterial, 2.5, Math.PI/2, Math.PI/2, 0);
		Fulmine_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("speed", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		})

		const Fulmine_N = this.setMeshGLTF('PowerUp/Speed_fulmine.glb', NegMaterial,2.5 , Math.PI/2, Math.PI/2, 0);
		Fulmine_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("speed", mesh, "negative"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//slow////
		const Tartole_P = this.setMeshGLTF('PowerUp/slow_tartaruga.glb', PosMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Tartole_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("slowness", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Tartole_N = this.setMeshGLTF('PowerUp/slow_tartaruga.glb', NegMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Tartole_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("slowness", mesh, "negative"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//triple
		const Triple_P = this.setMeshGLTF('PowerUp/tripla_x3.glb', PosMaterial, 4, Math.PI/2, Math.PI/2, 0);
		Triple_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("triple", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Triple_N = this.setMeshGLTF('PowerUp/tripla_x3.glb', NegMaterial,4, Math.PI/2, Math.PI/2, 0);
		Triple_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("triple", mesh, "negative"));
			//this.scene.add(mesh);
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//scale
		const Scale_P = this.setMeshGLTF('PowerUp/scale_Arrow.glb', PosMaterial,2.5, -Math.PI/2, Math.PI/2, 0);
		Scale_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("scale", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});
		const Scale_N = this.setMeshGLTF('PowerUp/scale_Arrow.glb', NegMaterial, 2.5, -Math.PI/2, Math.PI/2, 0);
		Scale_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("scale", mesh, "negative"));
			
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
		const wall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("mattone.png"), side: THREE.DoubleSide});
		const rotatedWall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, side: THREE.DoubleSide, map: (() => {
			const texture = new THREE.TextureLoader().load("mattone.png");
			texture.center.set(0.5, 0.5);
			texture.rotation = Math.PI/ 2;
			return texture;
		})()})

		const wood = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("wood.png"), side: THREE.DoubleSide});
		const cubeMaterial =[rotatedWall, rotatedWall, wall, wall, wood, wood]
		const cube = new THREE.Mesh(box, cubeMaterial);
		cube.position.set(0, 0, 102)
		this.add(cube);
	}

	posterInit() {
		const posterGeometry = new THREE.PlaneGeometry( 53.85, 68.35 );
		const posterMaterial = new THREE.MeshPhongMaterial( {map:  new THREE.TextureLoader().load("escape_room.jpg") , side: THREE.DoubleSide});
		const poster = new THREE.Mesh( posterGeometry, posterMaterial );
		poster.rotation.set(Math.PI/2, 0, 0);
		poster.position.set(0, 124.5, 70);
		poster.scale.set(1.5,1.5,1.5);
		this.add(poster);
	}

	/*
		       // Basic setup for the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Draco loader
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Use CDN for decoder

        // Desired width
        const desiredWidth = 2; // Set the desired width in units

        // Load Draco compressed model
        dracoLoader.load('path/to/your/model.drc', function (geometry) {
            const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
            const mesh = new THREE.Mesh(geometry, material);

            // Compute bounding box to get the current width
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const currentWidth = boundingBox.max.x - boundingBox.min.x;

            // Calculate scaling factor
            const scaleFactor = desiredWidth / currentWidth;

            // Apply scaling factor to match the desired width
            mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            scene.add(mesh);
            animate();
        });
	*/

	loadPlant(){
		return new Promise((resolve, reject) =>{
			this.gltfLoader.load(
				'UtilsMesh/pianta_vik.glb',
				(object)=>{
					console.log(object);
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
			cylinder.add(new THREE.PointLight(0xFF4E4E, 5, 500, 0.6));
			// Correzione: ottenere la geometria del cilindro da utilizzare per gli spigoli
			const cylinderEdgesGeometry = new THREE.EdgesGeometry(geometry);
			const cylinderLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
			const cylinderEdges = new THREE.LineSegments(cylinderEdgesGeometry, cylinderLineMaterial);

			
			const geometry1= new THREE.CylinderGeometry(5, 5, 600, 32); 
			const material1 = new THREE.MeshBasicMaterial({ color: 0x9B4EFF}); 
			const cylinder1 = new THREE.Mesh(geometry1, material1);
			cylinder1.rotation.x = Math.PI / 2;
			cylinder1.position.set(120, 120, 110);
			cylinder1.add(new THREE.PointLight(0x9B4EFF, 5, 500, 0.6));
			cylinder1.scale.multiplyScalar(0.4);
			
			
			const geometry2 = new THREE.CylinderGeometry(5, 5, 600, 32); 
			const material2 = new THREE.MeshBasicMaterial({ color: 0x6CFF4E }); 
			const cylinder2 = new THREE.Mesh(geometry2, material2);
			cylinder2.rotation.x = Math.PI / 2;
			cylinder2.position.set(-120, -120, 110);
			cylinder2.scale.multiplyScalar(0.4);
			cylinder2.add(new THREE.PointLight(0x6CFF4E, 5, 500, 0.6));
			


			const geometry3= new THREE.CylinderGeometry(5, 5, 600, 32); 
			const material3 = new THREE.MeshBasicMaterial({ color: 0xFFC662 }); 
			const cylinder3 = new THREE.Mesh(geometry3, material3);
			cylinder3.position.set(120, -120, 110);
			cylinder3.rotation.x = Math.PI / 2;
			cylinder3.scale.multiplyScalar(0.4);
			cylinder3.add(new THREE.PointLight(0xFFC662, 5, 500, 0.6));
			
			
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
				'UtilsMesh/boor_2.glb',
				(object)=>{
					const threeObj = object.scene;
					this.door = object.scene.children[0];
					threeObj.rotation.x = Math.PI/2;
					threeObj.rotation.y = Math.PI;
					threeObj.position.set(-15, -117, -22);
					threeObj.scale.multiplyScalar(25);
					//this.door.position.x = -2;
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
			'table/ping_pong_table.glb',
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
	
				// this.table = object.scene;
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
				'polletto.jpeg',
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

			this.mtlLoader.load('paddle/paddle.mtl',
			(materials) =>{
				materials.preload();

				this.objLoader.setMaterials(materials);
				this.objLoader.load('paddle/paddle.obj', (object) => {
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
				'Font/404font.json',
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
				'Font/Dark Underground_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'NickName 1', {
						font: font,
						size: 22,
						height: 1,
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
					const text3 = text.clone();
					text3.rotation.set(0, 0 ,0);
					text3.scale.multiplyScalar(1 / 2);
					text3.position.set(-30,50, -22);
					this.add(text3);
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
				'Font/Dark Underground_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'NickName 2', {
						font: font,
						size: 22,
						height: 1,
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
					const text3 = text.clone();
					text3.rotation.set(0, 0 ,0);
					text3.scale.multiplyScalar(1 / 2);
					text3.position.set(30,50, -22);
					this.add(text3);
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
				'Font/Underground NF_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Vguidoni', {
						font: font,
						size: 22,
						height: 1,
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
				'Font/Dark Underground_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Ivana', {
						font: font,
						size: 22,
						height: 1,
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
				'Font/Sportrop_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'AleGreci', {
						font: font,
						size: 22,
						height: 1,
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
				'Font/Chicago_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'Manuel', {
						font: font,
						size: 22,
						height: 1,
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
				'Font/Polentical Neon_Bold.json',
				(font)=>{
					const geometry = new TextGeometry( 'dcolucci', {
						font: font,
						size: 22,
						height: 1,
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
				'Font/Sportrop_Regular.json',
				(font)=>{
					const geometry = new TextGeometry( 'POLLETTI', {
						font: font,
						size: 22,
						height: 1,
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
		this.loadPlant(),
		this.loadPort(),
		this.loadNeon_angular(),
		this.loadTable(),
		this.loadFonts(),
		this.loadNickName_1(),
		this.loadNickName_2(),
		this.loadNameTeem()

		//this.loadPolletto()
		];
		Promise.all(proms).then(() => {;
		console.log("All objects loaded");
		resolve();
		});
	});

	}
}
