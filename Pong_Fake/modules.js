import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//---------COSTANTS--------
const MAXSCORE = 3;

//---------HELPERS----------
function roundPos(pos)
{
	if (pos > 1)
		return 1;
	if (pos < 0)
		return 0;
	return pos;
}

//---------CLASSES----------
export class Player {

	// static paddle = Player.loadPaddle();

	constructor(paddle) {
		this.mesh = paddle.clone();
		// console.log(this.mesh)

        this.name = "Undefined";
		this.moves = {
			up: false,
			down:false
		}
		this.mesh.position.z = -10;
	}
}

export class Match {
    constructor(ball, player1, player2, world){
		this.world = world;
        this.player1 = player1;
        this.player2 = player2;
        this.ball = ball;
		this.maxScore = MAXSCORE;
        this.score1 = 0;
        this.score2 = 0;
		this.exchangesFont = world.font;
		this.scoreText = this.scoreTextInit();
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
		this.collision = false;
		this.player1.mesh.position.x = -54;
		this.player2.mesh.position.x = 54;
		this.player1.mesh.rotation.z = -Math.PI/2;
		this.player2.mesh.rotation.z = Math.PI/2;
    }

	exchangesTextInit() {
		if (this.exchangesText && this.exchangesText[0] && this.exchangesText[1] && this.exchangesText[2]) {
			this.world.remove(this.exchangesText[0]);
			this.world.remove(this.exchangesText[1]);
			this.world.remove(this.exchangesText[2]);
		}
		const geometry = new TextGeometry( "0", {
			font: this.exchangesFont,
			size: 8,
			height: 1,
		})
		const emissive_color = 0x4DE8FF;
		const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		const mesh = new THREE.Mesh( geometry, material );

	// Trasla la mesh della metà della larghezza del testo per centrarla
        mesh.rotation.set(Math.PI/2, Math.PI/2, 0);
        mesh.position.set(-125, 0, 5);

		const mirrored = mesh.clone();
		const mirrored2 = mesh.clone();
		mirrored.scale.x = -mesh.scale.x;
		mirrored2.position.set(0, 50, -22.5);
		mirrored2.rotation.set( 0, 0, 0);
		mirrored.position.set(124, 0, 5)
        this.world.add(mesh);
		this.world.add(mirrored);
		this.world.add(mirrored2);
		const meshes = [mesh, mirrored, mirrored2];
		return meshes;
	}

	updateExchanges() {
		const geometry = new TextGeometry( (++this.exchanges).toString(), {
			font: this.exchangesFont,
			size: 8,
			height: 1,
		})
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		console.log(this.exchanges);
		this.exchangesText[0].geometry = geometry;
		this.exchangesText[1].geometry = geometry;
		this.exchangesText[2].geometry = geometry;
		/*
		const tmpMesh = this.exchangesText;
		const emissive_color = 0x4DE8FF;
        const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		this.exchangesText = new THREE.Mesh( geometry, material);
        this.exchangesText.rotation.set(Math.PI/2, Math.PI/2, 0);
        this.exchangesText.position.set(-125, -5, 5);
        this.world.add(this.exchangesText);
        if (tmpMesh)
            this.world.remove(tmpMesh);*/
	}


	scoreTextInit() {
		const geometry = new TextGeometry( "0 - 0", {
			font: this.exchangesFont,
			size: 20,
			height: 1,
		})
		const emissive_color = 0xFFD33D;
		const material = new THREE.MeshPhongMaterial( { color: emissive_color, emissive: emissive_color, emissiveIntensity: 1} );
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		const mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.set(Math.PI/2, Math.PI/2, 0);
		mesh.position.set(-125, 0, 20);

		const mirrored = mesh.clone();
		mirrored.scale.x = -mesh.scale.x;
		mirrored.position.set(124, 0, 20)
		this.world.add(mirrored);
		this.world.add(mesh);
		const meshes = [mesh, mirrored];
		return meshes;
	}

	updateScoreText(){
		const geometry = new TextGeometry( this.score1.toString() + " - "  + this.score2.toString(), {
			font: this.exchangesFont,
			size: 20,
			height : 1,
		})
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.scoreText[0].geometry = geometry;
		this.scoreText[1].geometry = geometry;
	}

	updateScore() {
		if (this.ball.mesh.position.x < 0)
			this.score2++;
		else
			this.score1++;
		this.updateScoreText();
		if (this.score1 == this.maxScore || this.score2 == this.maxScore)
			this.gameEnd();
		this.ball.mesh.position.x = 0;
		this.ball.mesh.position.y = 0;
		this.ball.mesh.position.z = 0;
		this.player1.mesh.position.y = 0;
		this.player2.mesh.position.y = 0;
		this.ball.speed = 0.5;
		this.ball.direction.x = 1;
		this.ball.direction.y = 0;
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
	}



	gameEnd() {
		if (this.score1 > this.score2)
			alert("Player 1 wins!");
		else
			alert("Player 2 wins!");
		this.score1 = 0;
		this.score2 = 0;
		this.updateScoreText();
	}
}


export class World {
	constructor(fbxLoader, objLoader, mtlLoader, fontLoader){
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
		this.fbxLoader = fbxLoader;
		this.objLoader = objLoader;
		this.mtlLoader = mtlLoader;
		this.fontLoader = fontLoader;
		this.font = null;
		//this.laodTable();
		this.skyboxInit();
		this.posterInit();
		this.loadObjects();
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


	skyboxInit() {
		const BOXSIZE = 250;
		const box = new THREE.BoxGeometry(BOXSIZE, BOXSIZE, BOXSIZE);
		const wall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("mattone.png"), side: THREE.DoubleSide});
		const rotatedWall = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, side: THREE.DoubleSide, map: (() => {
			const texture = new THREE.TextureLoader().load("mattone.png");
			texture.center.set(0.5, 0.5);
			texture.rotation = Math.PI/ 2;
			return texture;
		})()})

		const wood = new THREE.MeshStandardMaterial({emissive: 0.3,roughness: 1 ,metalness: 0.973, map : new THREE.TextureLoader().load("wood.png"), side: THREE.DoubleSide});
		const cubeMaterials =[rotatedWall, rotatedWall, wall, wall, wood, wood]
		const cube = new THREE.Mesh(box, cubeMaterials);
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

	loadTable() {
		return new Promise((resolve, reject) => {
		this.fbxLoader.load(
			'pingpongtable.fbx',
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
				'Beauty.json',
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


	async loadObjects() {
		this.ready = new Promise((resolve) => {
		const proms = [
		this.loadPaddle(),
		this.loadTable(),
		this.loadFonts()
		];
		Promise.all(proms).then(() => {;
		console.log("All objects loaded");
		resolve();
		});
	});

	}
}

export class Ball {
	constructor(){
		this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 32),
            new THREE.MeshPhongMaterial({color:0xf06400, emissive: 0xf06400})
        );
		this.mesh.add(new THREE.PointLight(0xf06400, 5, 100, 1))
		this.speed = 0.5;
		this.mesh.position.z = 10;
		this.direction = {
			x: 1,
			y: 0
		}
		this.posCurve = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3( -45, 0, 10 ),
				new THREE.Vector3( 0, 0, 15 ),
				new THREE.Vector3( 25, 0, -0.1 ),
				new THREE.Vector3( 54, 0, 8 ),
				new THREE.Vector3(65, 0, 12)
			]
		);
		this.negCurve = new THREE.CatmullRomCurve3(
			[
				new THREE.Vector3( 45, 0, 10 ),
				new THREE.Vector3( 0, 0, 15 ),
				new THREE.Vector3( -25, 0, -1 ),
				new THREE.Vector3( -54, 0, 8 ),
				new THREE.Vector3(-65, 0, 12)
			]
		)
	}

	getZ()
	{
		let z;
		if (this.direction.x > 0 )
			z = this.posCurve.getPointAt(roundPos((this.mesh.position.x + 45)/100)).z;
		else
			z = this.negCurve.getPointAt(roundPos((-this.mesh.position.x + 45)/100)).z;
		return z;
	}
}
