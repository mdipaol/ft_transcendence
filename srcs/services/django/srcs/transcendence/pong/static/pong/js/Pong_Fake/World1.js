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

export class World1 {
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
		this.gltfLoader = new GLTFLoader();
		this.dracoLoader = new DRACOLoader();
		// 'https://www.gstatic.com/draco/v1/decoders/'
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
		this.dracoLoader.setDecoderConfig({type: 'js'});
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
		this.font = null;
		this.powerUp = null;
		this.skyboxInit();
		//gest cube powerup
		this.arrayPowerup = this.powerUpsInit();

        this.scene.add(new THREE.AmbientLight(0xFFDE00, 0.5));
		const spotLight = new THREE.SpotLight(0xFF8000, 10000, 200, Math.PI/20, 1,  0.7);
		this.spotLight = spotLight;
		this.spotLight.position.set(54, 0, 100);
		const spotLight2 = new THREE.SpotLight(0x0009FF, 10000, 200, Math.PI/20, 1,  0.7);
		spotLight2.position.set(-54, 0, 100);
		this.spotLight2 = spotLight2;
		this.scene.add(spotLight);
		this.scene.add(spotLight2);

		this.spotLightCenter1 =  new THREE.SpotLight(0xFF8000, 1000, 120, Math.PI/20, 1,  0.1);
		this.spotLightCenter2 =  new THREE.SpotLight(0x0009FF, 1000, 120, Math.PI/20, 1,  0.1);
		this.spotLightWall1 = new THREE.SpotLight(0xFF8000, 1000, 120, Math.PI/20, 1,  0.1);
		this.spotLightWall2 = new THREE.SpotLight(0x0009FF, 1000, 120, Math.PI/20, 1,  0.1);

		this.spotLightCenter1.position.set(0, 0, -10);
		this.spotLightCenter2.position.set(0, 0, -10);
		this.spotLightWall1.position.set(-125, 0, 100);
		this.spotLightWall2.position.set(125, 0, 100);

		// this.scene.add(this.spotLightCenter1);
		// this.scene.add(this.spotLightCenter2);
		this.scene.add(this.spotLightWall1);
		this.scene.add(this.spotLightWall2);

		this.loadObjects();
	}

	async worldReady(){
		return this.ready;
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
		const Fulmine_P = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/Speed_fulmine.glb', PosMaterial, 2.5, Math.PI/2, Math.PI/2, 0);
		Fulmine_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("speed", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		})

		const Fulmine_N = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/Speed_fulmine.glb', NegMaterial,2.5 , Math.PI/2, Math.PI/2, 0);
		Fulmine_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("speed", mesh, "negative"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//slow////
		const Tartole_P = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/slow_tartaruga.glb', PosMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Tartole_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("slowness", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Tartole_N = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/slow_tartaruga.glb', NegMaterial, 2 , Math.PI/2, Math.PI/2, 0);
		Tartole_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("slowness", mesh, "negative"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//triple
		const Triple_P = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/tripla_x3.glb', PosMaterial, 4, Math.PI/2, Math.PI/2, 0);
		Triple_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("triple", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		const Triple_N = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/tripla_x3.glb', NegMaterial,4, Math.PI/2, Math.PI/2, 0);
		Triple_N.then((mesh)=>{
			arrayPowerup.push(new PowerUp("triple", mesh, "negative"));
			//this.scene.add(mesh);
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});

		//scale
		const Scale_P = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/scale_Arrow.glb', PosMaterial,2.5, -Math.PI/2, Math.PI/2, 0);
		Scale_P.then((mesh)=>{
			arrayPowerup.push(new PowerUp("scale", mesh, "positive"));
		}).catch((error)=>{
			console.error('Sei un bischero: ', error);
		});
		const Scale_N = this.setMeshGLTF('static/pong/js/Pong_Fake/PowerUp/scale_Arrow.glb', NegMaterial, 2.5, -Math.PI/2, Math.PI/2, 0);
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
		camera.position.set(-75, 0,45);
		camera.lookAt(0, 0, 0);
		camera.rotateOnAxis(new THREE.Vector3( 0, 0, -1 ),1.57);
		return camera;
	}

	getPlayer2Camera() {
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(75, 0,45 );
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
				let oscllazioneZ = 10;
				let oscillationAngleZ = Math.sin(Date.now() * speed) * Math.PI / 8; // Modifica Math.PI / 12 per regolare l'ampiezza dell'oscillazione su z
				this.powerUp.mesh.position.z = oscillationAngleZ + oscllazioneZ;
				this.powerUp.mesh.rotation.y += 0.03;
			}
		}
	}

	skyboxInit() {
		const box = new THREE.BoxGeometry(UTILS.BOXSIZE, UTILS.BOXSIZE, UTILS.BOXSIZE);
        const wall_material = new THREE.MeshStandardMaterial({
            color: 0x000000,
			emissive: 0x000000,
			emissiveIntensity: 15,
            roughness: 1,
        	metalness: 1,
			reflectivity: 0,
			envMapIntensity: 1,
            side: THREE.DoubleSide
        })
        const cubeMaterial = [wall_material,wall_material,wall_material,wall_material,wall_material,wall_material];
		const cube = new THREE.Mesh(box, cubeMaterial);
		cube.position.set(0, 0, 102);
		this.add(cube);
	}

	/* materiale vetro */
	/* const material1 = new THREE.MeshPhysicalMaterial({
		color: 0xffffff,  // Colore bianco per la base
		metalness: 0,  // Il vetro non è metallico
		roughness: 0,  // La superficie del vetro è liscia
		transmission: 1,  // La trasparenza è al massimo
		opacity: 0.25,  // Imposta l'opacità per vedere attraverso
		transparent: true,  // Necessario per abilitare la trasparenza
		reflectivity: 0.9,  // Alto valore per riflettività
		side: THREE.DoubleSide,  // Lati del materiale
		envMapIntensity: 1  // Intensità della mappa ambientale (per riflessi)
	}); */

	loadTable() {
		return new Promise((resolve, reject) => {
		this.gltfLoader.load(
			'static/pong/js/Pong_Fake/table/Table_ping_pong.glb',
			(object)=>{
				object.scene.rotation.x =Math.PI/2;
				object.scene.scale.multiplyScalar(21.5);
				object.scene.position.set(0, 0 , -2);
				const material_bordi = new THREE.MeshStandardMaterial({

					roughness: 0,
					metalness:1,
					reflectivity: 1,
					envMapIntensity: 1,
					side: THREE.DoubleSide
				})
				const material_rete = new THREE.MeshStandardMaterial({
					roughness: 0,
					metalness:1,
					reflectivity: 1,
					envMapIntensity: 1,
					side: THREE.DoubleSide
				})

				if(object.scene.children[0]){
					object.scene.children[0].material = material_bordi;
				}
				if(object.scene.children[1]){
					object.scene.children[1].material = material_rete;
				}
				this.add(object.scene);
				resolve();
			},
			(xhr) => console.log((xhr.loaded / xhr.total * 100) + '% table loaded'),
			(error) => reject(error)
			)
		});
	}


	loadPaddle() {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(
				'static/pong/js/Pong_Fake/paddle/paddle_vik_a_frammenti_3.glb',
				(object)=>{
					//object.scene.rotation.z = Math.PI/2;
					//object.scene.rotation.y = Math.PI/2;
					//const material_bordi = new THREE.MeshPhysicalMaterial({
					const material_bordi = new THREE.MeshStandardMaterial({
						color: 0xf06400,
						emissive: 0xf06400,
						emissiveIntensity: 0.1,
						roughness: 0,
						metalness:1,
						reflectivity: 1,
						envMapIntensity: 1,
						side: THREE.DoubleSide
					});
					//const material_face1 = new THREE.MeshPhysicalMaterial({
					const material_face1 = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						metalness: 1,
						roughness: 0,
						transmission: 1,
						opacity: 0.5,
						transparent: true,
						reflectivity: 1,
						side: THREE.DoubleSide,
						envMapIntensity: 1
					});

					// const material_face2 =  new THREE.MeshPhysicalMaterial({
						const material_face2 = new THREE.MeshStandardMaterial({
						color: 0xffffff,
						metalness: 1,
						roughness: 0,
						transmission: 1,
						opacity: 0.1,
						transparent: true,
						reflectivity: 1,
						side: THREE.DoubleSide,
						envMapIntensity: 1
					});
					const material_manico = new THREE.MeshStandardMaterial({
						//color: 0x000000,
						emissiveIntensity:0.1,
						roughness: 0,
						metalness:1,
						reflectivity: 1,
						envMapIntensity: 1,
						side: THREE.DoubleSide
					})
					if(object.scene.children[0]){ // bordi
						object.scene.children[0].material = material_bordi;
						//object.scene.children[0].add(new THREE.PointLight( 0x0011FF, 1000, 100 ));
					}
					if(object.scene.children[1]){ // face1
						object.scene.children[1].material = material_face1;
						//object.scene.children[1].add(new THREE.PointLight( 0xFF9A00, 1000, 1000 ));
					}
					if(object.scene.children[2]){ // face2
						object.scene.children[2].material = material_face2;
						//object.scene.children[2].add(new THREE.PointLight( 0x0033FF, 1000, 1000 ));
					}
					if(object.scene.children[3]) // manico
						object.scene.children[3].material = material_manico;
					//object.scene.add(PointLight2);

					object.scene.scale.multiplyScalar(0.85);
					this.paddle = object.scene;
					this.paddle.traverse(function(child) {
						if (child instanceof THREE.Mesh) {
							child.geometry.computeVertexNormals();
						}
					});
					// region MeshPhysicalMaterial
					this.paddle2 = this.paddle.clone();

					this.paddle.position.x = -51;
					this.paddle2.position.x = 55.5;
					this.paddle.rotation.x = Math.PI / 2; // world1
					this.paddle2.rotation.x = Math.PI / 2; // world1
					this.spotLight.target = this.paddle; // world1
					this.spotLight2.target = this.paddle2; // world1
					// world.spotLightCenter1.target = this.player1.mesh; // world1
					// world.spotLightCenter2.target = this.player2.mesh; // world1
					this.spotLightWall1.target = this.paddle; // world1
					this.spotLightWall2.target = this.paddle2; // world1

					if (this.paddle2.children[0]){
						this.paddle2.children[0].material = new THREE.MeshStandardMaterial({
							color: 0x0009FF,
							emissive: 0x0009FF,
							emissiveIntensity: 10,
							roughness: 0,
							metalness:1,
							reflectivity: 1,
							envMapIntensity: 1,
							side: THREE.DoubleSide
						})
					}
					resolve();
				}
			)
		})
	}

	loadFonts() {
		return new Promise((resolve, reject) => {
			this.fontLoader.load(
				'static/pong/js/Pong_Fake/Font/Beauty.json',
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

	load_wall(){
		return new Promise((resolve, reject)=>{
			this.gltfLoader.load(
				'static/pong/js/Pong_Fake/UtilsMesh/bordi_skybox.glb',
				(object)=> {
					object.scene.scale.multiplyScalar(41.5);
					object.scene.position.set(0,125,105);
					const material = new THREE.MeshStandardMaterial({
						//color: 0x000000,
						roughness:0,
						metalness:1,
						reflectivity: 1,
						envMapIntensity: 1,
						side: THREE.DoubleSide
					})
					if(object.scene.children[0])
						object.scene.children[0].material = material;
					const floor = object.scene.clone();
					const wall2 = object.scene.clone();
					const wall3 = object.scene.clone();
					const wall4 = object.scene.clone();
					const ceiling = object.scene.clone();

					floor.rotation.x = Math.PI / 2;
					floor.position.set(0, 0, -20);
					ceiling.rotation.x = Math.PI / 2;
					ceiling.position.set(0, 0, 228);
					wall2.rotation.z = Math.PI / 2;
					wall2.position.set(125,0,105);
					wall3.rotation.z = Math.PI / 2;
					wall3.position.set(-125,0,105);
					wall4.position.set(0, -125, 105);

					this.add(object.scene);
					this.add(floor);
					this.add(ceiling);
					this.add(wall2);
					this.add(wall3);
					this.add(wall4);
					resolve();
				}
			)
		})
	}

	loadPointLight(){
		return new Promise((resolve, reject)=>{
			//orange
			const PointLight1 = new THREE.PointLight(0xFFCD00, 600, 600, 0.9);//-x + y -z
			const PointLight3 = new THREE.PointLight(0xFFCD00, 600, 600,0.9);//-x +y -z
			//blue
			const PointLight5 = new THREE.PointLight(0x001AFF, 600, 600,0.9);//+x +y -z
			const PointLight7 = new THREE.PointLight(0x001AFF, 600, 600,0.9);//+x -y -z

			PointLight1.position.set(-120, 120, -10);
			PointLight3.position.set(-120, -120, -10);
			PointLight5.position.set(120, 120, -10);
			PointLight7.position.set(120, -120, -10);
			this.scene.add(PointLight1);
			this.scene.add(PointLight3);
			this.scene.add(PointLight5);
			this.scene.add(PointLight7);
			resolve();
		})
	}

	loadContainerCss(){
		document.body.appendChild(this.renderer.domElement);
		const overlay = document.getElementById('overlay');
		const text1 = document.getElementById('text1');
		const text2 = document.getElementById('text2');
		text1.textContent = 'Rotazione X: ' + cube.rotation.x.toFixed(2);
		text2.textContent = 'Rotazione Y: ' + cube.rotation.y.toFixed(2);

		// Modifica delle proprietà CSS
		overlay.style.top = '50px';
		overlay.style.left = '10px';
		overlay.style.fontSize = '30px';
		overlay.style.color = 'yello';
	}

	loadAudio() {
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.sound = sound;
			//The Finals OST - Main Menu Themes
			//sound_World1
			this.audioLoader.load('static/pong/js/Pong_Fake/music/sound_World1.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(true);
				sound.setVolume(0.1);
				sound.setPlaybackRate(1);
				sound.play();
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSoundCollision(){
		return new Promise((resolve, reject) => {
			const sound = new THREE.Audio(this.listener);
			this.soundCollision = sound;

			this.audioLoader.load('static/pong/js/Pong_Fake/music/collision_world1.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.1);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		});
	}

	loadSoundPowerUpP(){
		return new Promise((resolve, reject)=> {
			const sound = new THREE.Audio(this.listener);
			this.soundPowerUpNegative = sound;

			this.audioLoader.load('static/pong/js/Pong_Fake/music/powerdown.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.3);
				sound.setPlaybackRate(1);
				resolve(sound);
			}, undefined, function(error) {
				reject(error);
			});
		})
	}
	loadSoundPowerUpN(){
		return new Promise((resolve, reject)=> {
			const sound = new THREE.Audio(this.listener);
			this.soundPowerUpPositive = sound;

			this.audioLoader.load('static/pong/js/Pong_Fake/music/powerup.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.3);
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

			this.audioLoader.load('static/pong/js/Pong_Fake/music/collision_world1.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.1);
				sound.setPlaybackRate(2);
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
			this.audioLoader.load('static/pong/js/Pong_Fake/music/punto_Win.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(false);
				sound.setVolume(0.3);
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
			this.audioLoader.load('static/pong/js/Pong_Fake/music/partita_end.mp3', function(buffer) {
				sound.setBuffer(buffer);
				sound.setLoop(true);
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
			this.loadTable(),
			this.loadFonts(),
			this.load_wall(),
			this.loadPointLight(),
			this.loadAudio(),
			this.loadSoundCollision(),
			this.loadSoundWallCollision(),
			this.loadSoundPowerUpP(),
			this.loadSoundPowerUpN(),
			this.loadSounPoint(),
			this.loadSoundEndMach()
		];
		Promise.all(proms).then(() => {;
		console.log("All objects loaded");
		resolve();
		});
	});

	}
}
