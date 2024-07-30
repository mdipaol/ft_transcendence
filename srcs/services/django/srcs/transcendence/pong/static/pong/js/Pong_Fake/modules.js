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
const MOVSPEED = 0.7;
const STARTINGSPEED = 1;
const ACCELERATION  = 2;
const POWERUPDURATION = 3;

// region HELPERSs

//---------HELPERS----------

function roundPos(pos)
{
	if (pos > 1)
		return 1;
	if (pos < 0)
		return 0;
	return pos;
}

function rotateVector(x, y, angle) {
  const radians = angle * (Math.PI / 180);

  const cosTheta = Math.cos(radians);
  const sinTheta = Math.sin(radians);

  // Rotation matrix
  const newX = x * cosTheta - y * sinTheta;
  const newY = x * sinTheta + y * cosTheta;

  return { x: newX, y: newY };
}

function normalizeVector(vector) {
    const [x, y] = vector;

    // Calculate the magnitude of the vector
    const magnitude = Math.sqrt((x * x) + (y * y));

    // Avoid division by zero
    if (magnitude === 0) {
        throw new Error("Cannot normalize a zero vector");
    }

	// console.log("Magnitude: " + magnitude);

	// console.log("Input vector: " + [x, y]);

    // Normalize each component of the vector
    const normalizedVector = [
        x / magnitude,
        y / magnitude,
    ];

	// console.log("Output vector: " + normalizedVector);
	// console.log("Output magnitude: " + Math.sqrt(
	// 		(normalizedVector[0] * normalizedVector[0]) +
	// 		(normalizedVector[1] * normalizedVector[1])
	// 		)
	// 	);

    return normalizedVector;
}

function wallCollision(ball)
{
	if (ball.mesh.position.y > 28  || ball.mesh.position.y < -28)
		return true
	else
		return false
}

function checkCollision(object1, object2) {
    var box1 = new THREE.Box3().setFromObject(object1);
    var box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}

function checkPowerUpCollision(ball, powerUp){
	if (ball.position.x <= 3 && ball.position.x >= -3){
		if (Math.abs(ball.position.y - powerUp.position.y) <= 3){
			return true;
		}
	}
	return false;
}

//---------CLASSES----------

// region Player

export class Player {

	// static paddle = Player.loadPaddle();

	constructor(paddle) {
		this.mesh = paddle.clone();
		// console.log(this.mesh)
		this.speed = MOVSPEED;
        this.name = "Undefined";
		this.moves = {
			up: false,
			down:false
		}
		this.mesh.position.z = -10;
		this.powerUp = null;
	}
}

// region PowerUp

/* export class PowerUp{
	constructor(name, mesh, type) {
		this.name = name;
		this.mesh = mesh;
		this.type = type;
		this.duration = POWERUPDURATION;
	}
} */

// region Match

export class Match {
    constructor(ball, player1, player2, world){
		this.world = world;
        this.player1 = player1;
        this.player2 = player2;
		// this.powerVector1 = []
		// this.powerVector2 = []
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

		// PowerUps
		this.waitPowerup = 0;
		this.activePowerUp = false;
		this.triple_enabled = false;
		this.fake_balls = [new Ball(0xff0000), new Ball(0x0000ff)]

		// this.fake_balls[0].mesh.material.color.r = 0;
		// this.fake_balls[0].mesh.material.color.g = 0;
		// this.fake_balls[0].mesh.material.color.b = 0;

		// this.fake_balls[0].mesh.children[0].color.r = 0;
		// this.fake_balls[0].mesh.children[0].color.g = 0;
		// this.fake_balls[0].mesh.children[0].color.b = 0;

		// this.fake_balls[1].mesh.material.color.r = 1;
		// this.fake_balls[1].mesh.material.color.g = 0;
		// this.fake_balls[1].mesh.material.color.b = 1;

		// this.fake_balls[1].mesh.children[0].color.r = 1;
		// this.fake_balls[1].mesh.children[0].color.g = 0;
		// this.fake_balls[1].mesh.children[0].color.b = 1;
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
		this.exchanges++;

		const geometry = new TextGeometry( this.exchanges.toString(), {
			font: this.exchangesFont,
			size: 8,
			height: 1,
		});
		geometry.computeBoundingBox();
		geometry.translate(-(geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2, 0, 0);
		this.exchangesText[0].geometry = geometry;
		this.exchangesText[1].geometry = geometry;
		this.exchangesText[2].geometry = geometry;
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
		this.player1.powerUp = null;
		this.player2.powerUp = null;
		this.player1.speed = MOVSPEED;
		this.player2.speed = MOVSPEED;
		this.ball.speed = STARTINGSPEED;
		this.ball.direction.y = 0;

		// Triple Ball
		this.fake_balls[0].speed = STARTINGSPEED;
		this.fake_balls[1].speed = STARTINGSPEED;
		this.fake_balls[0].direction.y = 0;
		this.fake_balls[1].direction.y = 0;

		// Exchanges
		this.exchanges = 0;
		this.exchangesText = this.exchangesTextInit();
	}

	updateMovements() {
		if (this.player1.moves.up && this.player1.mesh.position.y < 27)
		{
			this.player1.mesh.position.y += this.player1.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player1.moves.down && this.player1.mesh.position.y > -27)
		{
			this.player1.mesh.position.y -= this.player1.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
		}
		if (this.player2.moves.up && this.player2.mesh.position.y < 27)
		{
			this.player2.mesh.position.y += this.player2.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'up' }));
		}
		if (this.player2.moves.down && this.player2.mesh.position.y > -27)
		{
			this.player2.mesh.position.y -= this.player2.speed;
			//socket.send(JSON.stringify({ 'type': 'input','direction': 'down' }));
		}
	}

	startPowerUp(){
		if(this.ball.direction.x > 0 )// player1
		{
			if(this.world.PowerUp == this.world.arrayPowerup[0]){
				if(this.ball.position.x >= -5)
					this.ball.speed += 5;
				else if(this.ball.position.x <= 5){
					this.ball.speed = 0.5;
				}
			}
		}
		else if(this.ball.direction.x < 0) // player2
		{
			if(this.world.PowerUp == this.world.arrayPowerup[0]){
				if(this.ball.position.x <= -5)
					this.ball.speed += 5;
				else if(this.ball.position.x >= 5){
					this.ball.speed = 0.5;
				}
			}
		}
	}

	// powerUpActivate() {

	// }

	addPowerUp() {

		this.waitPowerup++;
		if ((this.waitPowerup >= 5) && (this.exchanges % 5 == 0) && (!this.player1.powerUp && !this.player2.powerUp)){
			if (this.activePowerUp == false) {

				this.activePowerUp = true;

				this.world.powerUp = this.world.randomPowerUp();
				this.world.powerUp.duration = POWERUPDURATION;
				// console.log(this.world.PowerUp);
				const z = 15;
				const max = 27;
				const min = -27;
				//const y = Math.floor(Math.random() * (max - min + 1)) + min;
				const y = 3.0;
				this.world.powerUp.mesh.position.set(0, y, z);
				this.world.scene.add(this.world.powerUp.mesh);
			}
		}
	}

	add_triple() {
		this.triple_enabled = true;

		const b1 = this.fake_balls[0];
		const b2 = this.fake_balls[1];

		b1.mesh.position.x = this.ball.mesh.position.x;
		b1.mesh.position.y = this.ball.mesh.position.y;
		b1.mesh.position.z = this.ball.mesh.position.z;
		b1.speed = this.ball.speed;

		b2.mesh.position.x = this.ball.mesh.position.x;
		b2.mesh.position.y = this.ball.mesh.position.y;
		b2.mesh.position.z = this.ball.mesh.position.z;
		b2.speed = this.ball.speed;

		b1.direction = rotateVector(this.ball.direction.x, this.ball.direction.y, 20);
		b2.direction = rotateVector(this.ball.direction.x, this.ball.direction.y, -20);

		const real = Math.round(Math.random() * 2);

		const dir = this.ball.direction;

		if (real == 0) {
			this.ball.direction = b1.direction;
			b1.direction = dir;
		}
		else if (real == 1) {
			this.ball.direction = b2.direction;
			b2.direction = dir;
		}

		this.world.add(b1.mesh);
		this.world.add(b2.mesh);
	}


	remove_triple() {
		this.triple_enabled = false;

		this.world.remove(this.fake_balls[0].mesh);
		this.world.remove(this.fake_balls[1].mesh);
	}

	powerUpTaken() {
		const player = (this.player1.powerUp) ? this.player1 : this.player2;
		const opp = (player === this.player1) ? this.player2 : this.player1;

		// slowness check
		if (this.player1.powerUp && this.player1.powerUp.name == "slowness")
			this.player2.speed = 0.3;
		if (this.player2.powerUp && this.player2.powerUp.name == "slowness")
			this.player1.speed = 0.3;

		// Triple check
		if (player.powerUp.name == "triple") {
			this.add_triple();
		}
	}

	handlePowerUp(player) {
		if (!player.powerUp){
			this.ball.speed = STARTINGSPEED;
			return;
		}
		if (player.powerUp.name == "speed") {
			this.ball.speed = STARTINGSPEED;
			this.ball.speed *= 2;
		}
		else if (player.powerUp.name == "triple") {
			this.add_triple();
		}
		else if (player.powerUp.name == "slowness") {
		}
		player.powerUp.duration--;
		if (player.powerUp.duration == 0) {
			player.powerUp = null;
			// p = player ===?<valore1>:<valore2></valore2>
			const opp = (player === this.player1) ? this.player2 : this.player1;
			opp.speed = MOVSPEED;
		}
	}

	// region update()
	update() {
		this.updateMovements();
		this.world.rotatePowerUp();

		this.ball.mesh.position.x += this.ball.speed * this.ball.direction.x;
		this.ball.mesh.position.y += this.ball.speed * this.ball.direction.y;
		this.ball.mesh.position.z = this.ball.getZ();

		// Triple ball update
		if (this.triple_enabled) {
			const ball1 = this.fake_balls[0];
			const ball2 = this.fake_balls[1];

			ball1.mesh.position.x += ball1.speed * ball1.direction.x;
			ball1.mesh.position.y += ball1.speed * ball1.direction.y;
			ball1.mesh.position.z = ball1.getZ();

			ball2.mesh.position.x += ball2.speed * ball2.direction.x;
			ball2.mesh.position.y += ball2.speed * ball2.direction.y;
			ball2.mesh.position.z = ball2.getZ();

			// console.log(ball1.mesh.position);
		}

		if (checkCollision(this.player1.mesh, this.ball.mesh) && !this.collision)
		{
			/* if (ball.speed < 2)
				ball.speed *= ACCELERATION; */
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player1.mesh.position.y)/10;
			const normalizedVector = normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.updateExchanges();

			this.handlePowerUp(this.player1);
			this.addPowerUp()
		}
		if (checkCollision(this.player2.mesh, this.ball.mesh) && !this.collision)
		{
			// if (ball.speed  < 2)
			// 	ball.speed  *= ACCELERATION;
			this.ball.direction.x *= -1;
			this.ball.direction.y = (this.ball.mesh.position.y - this.player2.mesh.position.y)/10;
			const normalizedVector = normalizeVector([this.ball.direction.x, this.ball.direction.y]);
			this.ball.direction.x = normalizedVector[0];
			this.ball.direction.y = normalizedVector[1];

			this.collision = true;
			this.updateExchanges();

			this.handlePowerUp(this.player2);
			this.addPowerUp();
		}
		// PowerUp collision
		if (this.activePowerUp == true && checkPowerUpCollision(this.ball.mesh, this.world.powerUp.mesh)){

			this.world.remove(this.world.powerUp.mesh);
			this.activePowerUp = false;
			this.waitPowerup = 0;

			// Powerup assignment

			this.player1.powerUp = null;
			this.player2.powerUp = null;

			if(this.ball.direction.x < 0 && this.world.powerUp.type == "positive")
				this.player2.powerUp = this.world.powerUp;
			if(this.ball.direction.x < 0 && this.world.powerUp.type == "negative")
				this.player1.powerUp = this.world.powerUp;
			if(this.ball.direction.x > 0 && this.world.powerUp.type == "positive")
				this.player1.powerUp = this.world.powerUp;
			if(this.ball.direction.x > 0 && this.world.powerUp.type == "negative")
				this.player2.powerUp = this.world.powerUp;

			this.powerUpTaken();
		}



		if (wallCollision(this.ball))
			this.ball.direction.y *= -1;

		//Reset positions
		if (this.ball.mesh.position.x > this.player2.mesh.position.x + 5  || this.ball.mesh.position.x < this.player1.mesh.position.x - 5)
			this.updateScore();

		// If triple ball is enabled
		if (this.triple_enabled) {
			const b1 = this.fake_balls[0];
			const b2 = this.fake_balls[1];

			// Triple ball wall collision
			if (wallCollision(b1))
				b1.direction.y *= -1;
			if (wallCollision(b2))
				b2.direction.y *= -1;

			// Triple ball table limit
			if (b1.mesh.position.x > this.player2.mesh.position.x + 5 || b1.mesh.position.x < this.player1.mesh.position.x - 5)
				this.world.remove(b1.mesh);
			if (b2.mesh.position.x > this.player2.mesh.position.x + 5 || b2.mesh.position.x < this.player1.mesh.position.x - 5)
				this.world.remove(b2.mesh);
		}

		if (this.collision && this.ball.mesh.position.x > -10 && this.ball.mesh.position.x < 10)
			this.collision = false;
	}

	render() {
    	this.world.renderer.render(this.world.scene, this.world.activeCamera);
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

// region World

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

		const arrayPowerup = [
			new PowerUp("speed", cube, "positive") ,
			new PowerUp("speed", cube_N, "negative") ,
			new PowerUp("slowness", prism, "positive"),
			new PowerUp("slowness", prism_N, "negative"),
			new PowerUp("triple", donut, "positive"),
			new PowerUp("triple", donut_N, "negative"),
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
				'404font.json',
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

// region Ball

export class Ball {
	constructor(color){
		this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 32),
            new THREE.MeshPhongMaterial({color: color, emissive: color})
        );
		this.mesh.add(new THREE.PointLight(color, 5, 100, 1))
		this.speed = STARTINGSPEED;
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
		if (this.direction.x > 0 )
			z = this.posCurve.getPointAt(roundPos((this.mesh.position.x + 45)/100)).z;
		else
			z = this.negCurve.getPointAt(roundPos((-this.mesh.position.x + 45)/100)).z;
		return z;
	}
}
